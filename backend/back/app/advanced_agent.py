from typing import Annotated, TypedDict
from langgraph.graph import StateGraph
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain_core.tools import Tool
from langchain import hub
import logging

# --- Logging ---
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# --- Shared State ---
class AgentRouterState(TypedDict, total=False):
    input: Annotated[str, "User input"]
    result: Annotated[str, "Final output"]

# --- Import tools ---
from app.tools import (
    web_search, wikipedia_search, summarize_text, analyze_csv,
    transcribe_audio, text_to_speech, create_event, send_email
)

# --- LLM & Prompt ---
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

try:
    tool_calling_prompt = hub.pull("hwchase17/openai-tools-agent")
except Exception as e:
    logger.warning(f"Failed to pull prompt from hub: {e}")
    tool_calling_prompt = None  # Optional fallback logic

# === Agent 1: RAG Agent ===
rag_tools = [
    Tool(name="web_search", func=web_search, description="Search the web"),
    Tool(name="wikipedia_search", func=wikipedia_search, description="Search Wikipedia"),
    Tool(name="summarize_text", func=summarize_text, description="Summarize text content"),
    Tool(name="send_email", func=send_email, description="Send email using Gmail API")
]
rag_agent = create_tool_calling_agent(llm, rag_tools, tool_calling_prompt)
rag_executor = AgentExecutor(agent=rag_agent, tools=rag_tools, verbose=True)

# === Agent 2: CSV Agent ===
csv_tools = [
    Tool(
        name="analyze_csv",
        func=lambda q: analyze_csv(file_path=q.split("||")[0], question=q.split("||")[1]),
        description="Analyze a CSV file with a question using LLM. Input format: 'file.csv||What is the revenue?'"
    ),
    Tool(name="summarize_text", func=summarize_text, description="Summarize data or analysis result")
]
csv_agent = create_tool_calling_agent(llm, csv_tools, tool_calling_prompt)
csv_executor = AgentExecutor(agent=csv_agent, tools=csv_tools, verbose=True)

# === Agent 3: Voice Agent ===
voice_tools = [
    Tool(name="transcribe_audio", func=transcribe_audio, description="Transcribe audio to text"),
    Tool(name="summarize_text", func=summarize_text, description="Summarize transcribed content"),
    Tool(name="text_to_speech", func=text_to_speech, description="Convert text to speech (TTS)")
]
voice_agent = create_tool_calling_agent(llm, voice_tools, tool_calling_prompt)
voice_executor = AgentExecutor(agent=voice_agent, tools=voice_tools, verbose=True)

# === Agent 4: Calendar Agent ===
calendar_tools = [
    Tool(
        name="create_event",
        func=lambda q: create_event(
            summary="Meeting",
            description="Scheduled",
            start_time=q.split("||")[0],
            end_time=q.split("||")[1]
        ),
        description="Schedule a calendar event. Input format: '2025-07-11T10:00:00||2025-07-11T11:00:00'"
    )
]
calendar_agent = create_tool_calling_agent(llm, calendar_tools, tool_calling_prompt)
calendar_executor = AgentExecutor(agent=calendar_agent, tools=calendar_tools, verbose=True)

# --- Fallback agent tools ---
# --- Improved Fallback Agent: Multi-tool reasoning assistant ---


# Reuse the same fallback tools list
from typing import ClassVar
from langchain_core.tools import Tool
from langchain.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI

# --- Fallback Tool Wrappers ---
class AnalyzeCSVTool(BaseTool):
    name: ClassVar[str] = "analyze_csv"
    description: ClassVar[str] = "Analyze a CSV file. Input format: 'filename.csv||your question'"

    def _run(self, input: str) -> str:
        try:
            file_path, question = input.split("||")
            return analyze_csv(file_path=file_path, question=question)
        except Exception as e:
            return f"Error: {str(e)}\nExpected input format: 'filename.csv||your question'"

    async def _arun(self, input: str) -> str:
        return self._run(input)

class CreateEventTool(BaseTool):
    name: ClassVar[str] = "create_event"
    description: ClassVar[str] = "Create a calendar event. Input format: 'start_time||end_time' (ISO 8601)"

    def _run(self, input: str) -> str:
        try:
            start_time, end_time = input.split("||")
            return create_event(summary="Meeting", description="Scheduled", start_time=start_time, end_time=end_time)
        except Exception as e:
            return f"Error: {str(e)}\nExpected input format: 'start_time||end_time'"

    async def _arun(self, input: str) -> str:
        return self._run(input)

# --- Final Fallback Tools List ---
fallback_tools = [
    Tool(name="web_search", func=web_search, description="Search the web"),
    Tool(name="wikipedia_search", func=wikipedia_search, description="Search Wikipedia"),
    Tool(name="summarize_text", func=summarize_text, description="Summarize text content"),
    Tool(name="transcribe_audio", func=transcribe_audio, description="Transcribe audio to text"),
    Tool(name="text_to_speech", func=text_to_speech, description="Convert text to speech"),
    Tool(name="send_email", func=send_email, description="Send email using Gmail API"),
    AnalyzeCSVTool(),
    CreateEventTool(),
]

# --- Prompt Template ---
fallback_prompt = """You are a smart assistant that can solve any user request using the tools available to you.

- Choose tools wisely and in order if needed.
- You can summarize, transcribe, analyze CSV, create calendar events, or send emails.
- If a task requires multiple steps (like analyzing then summarizing), do them in order.
- If input format is incorrect, explain the correct format to the user.
Respond clearly with the final result.
"""

prompt_template = ChatPromptTemplate.from_messages([
    ("system", fallback_prompt),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

# --- Fallback Agent & Executor ---
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

formatted_fallback_agent = create_tool_calling_agent(
    llm=llm,
    tools=fallback_tools,
    prompt=prompt_template
)

fallback_executor = AgentExecutor(agent=formatted_fallback_agent, tools=fallback_tools, verbose=True)




# --- Now route_input function that uses fallback_executor ---
def route_input(state: AgentRouterState) -> AgentRouterState:
    prompt = state["input"].lower()
    logger.info(f"Routing input: {prompt}")
    try:
        if "csv" in prompt:
            result = csv_executor.invoke({"input": state["input"]})
        elif "transcribe" in prompt or "audio" in prompt:
            result = voice_executor.invoke({"input": state["input"]})
        elif "calendar" in prompt or ("schedule" in prompt and "meeting" in prompt):
            result = calendar_executor.invoke({"input": state["input"]})
        elif "pdf" in prompt or "document" in prompt:
            result = rag_executor.invoke({"input": state["input"]})
        else:
            result = fallback_executor.invoke({"input": state["input"]})
        return {"input": state["input"], "result": result["output"]}
    except Exception as e:
        logger.error(f"Routing failed: {e}")
        return {"input": state["input"], "result": f"Routing failed: {str(e)}"}


# === LangGraph Builder ===
def build_advanced_router():
    graph = StateGraph(AgentRouterState)
    graph.add_node("AgentRouter", route_input)
    graph.set_entry_point("AgentRouter")
    graph.set_finish_point("AgentRouter")
    return graph.compile()


