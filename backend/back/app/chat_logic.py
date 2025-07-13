from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI
from app.rag_logic import get_vectorstore
from app.advanced_agent import build_advanced_router  # Final advanced agent import

def get_chat_chain(user_id: str):
    vectordb = get_vectorstore(user_id)
    retriever = vectordb.as_retriever()

    system_template = """
    You are a helpful assistant for answering questions about uploaded documents.
    Always answer based on the retrieved context.
    If unsure or unrelated, say 'I don't know based on the document.'
    Context:
    ---------
    {context}
    ---------
    Question: {question}
    """

    prompt = PromptTemplate(
        template=system_template,
        input_variables=["context", "question"]
    )

    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",  # or 'map_reduce' if needed
        retriever=retriever,
        return_source_documents=False,
        chain_type_kwargs={"prompt": prompt},
        memory=memory  # optional, if you want to use memory
    )

    return chain

def get_langgraph_agent():
    return build_advanced_router()
