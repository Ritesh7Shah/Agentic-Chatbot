import os
import shutil
import logging
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from app.rag_logic import load_and_split_pdf, embed_and_store
from app.chat_logic import get_chat_chain
from app.advanced_agent import build_advanced_router
from app.tools import (
    transcribe_audio, summarize_text, text_to_speech,
    analyze_csv, send_email, create_event
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Client RAG Chatbot API")

# ----------------------
# CORS Setup
# ----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------
# Static files for audio
# ----------------------
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/audio", StaticFiles(directory=UPLOAD_DIR), name="audio")

# ----------------------
# Health Check
# ----------------------
@app.get("/")
def root():
    return JSONResponse(content={"message": "RAG Chatbot API is live!"})

# ----------------------
# Upload PDF
# ----------------------
@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...), user_id: str = Form(...)):
    temp_path = os.path.join(UPLOAD_DIR, f"temp_{file.filename}")
    logger.info(f"[{user_id}] Uploading PDF: {file.filename}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        docs = load_and_split_pdf(temp_path)
        embed_and_store(docs, user_id=user_id)
        os.remove(temp_path)

        return {"message": "PDF uploaded and processed."}
    except Exception as e:
        logger.error(f"[{user_id}] PDF error: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ----------------------
# Chat Request Model
# ----------------------
class ChatRequest(BaseModel):
    question: str
    user_id: str

# Use Workflow Graph
tool_agent_graph = build_advanced_router()

@app.post("/chat")
async def chat_with_bot(chat_request: ChatRequest):
    question = chat_request.question.strip()
    user_id = chat_request.user_id
    logger.info(f"[{user_id}] Question: {question}")

    try:
        if "pdf" in question.lower() or "document" in question.lower():
            chat_chain = get_chat_chain(user_id)
            answer = chat_chain.invoke({"query": question})
        else:
            result = tool_agent_graph.invoke({"input": question})
            answer = result.get("result", "Sorry, no answer found.")
        return {"answer": answer}
    except Exception as e:
        logger.error(f"[{user_id}] Chat error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# ----------------------
# Voice Assistant: Transcribe + Summarize + TTS
# ----------------------
import os
from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
import logging
import shutil

logger = logging.getLogger(__name__)

UPLOAD_DIR = os.path.abspath("temp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/voice_chat")
async def voice_chat(audio: UploadFile = File(...)):
    try:
        # Ensure filename is safe
        filename = f"temp_{audio.filename}"
        # Prefer .wav extension for whisper, force if needed:
        if not filename.lower().endswith(('.wav', '.mp3', '.m4a')):
            filename += ".wav"
        
        audio_path = os.path.join(UPLOAD_DIR, filename)
        audio_path = os.path.normpath(os.path.abspath(audio_path))

        logger.info(f"Saving uploaded audio to: {audio_path}")

        # Save the uploaded file content
        content = await audio.read()  # read all bytes
        with open(audio_path, "wb") as f:
            f.write(content)

        # Check file exists & log
        if not os.path.exists(audio_path):
            logger.error(f"Audio file not found after saving: {audio_path}")
            raise FileNotFoundError(f"Audio file not found at path: {audio_path}")
        logger.info(f"Audio file saved successfully: {audio_path}")

        # Call transcription function
        transcript = transcribe_audio(audio_path)
        if transcript.startswith("Transcription failed"):
            # Return error if transcription failed
            logger.error(f"Transcription error: {transcript}")
            return JSONResponse(status_code=500, content={"detail": transcript})

        summary = summarize_text(transcript)
        audio_output = text_to_speech(summary)  # returns path like '/audio/tts_output.mp3'

        # Cleanup uploaded file after processing
        os.remove(audio_path)
        logger.info(f"Deleted temp audio file: {audio_path}")

        return {
            "summary": summary,
            "audio_path": audio_output
        }
    except Exception as e:
        logger.error(f"Voice chat error: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ----------------------
# CSV Upload Endpoint
# ----------------------
@app.post("/upload_csv")
async def upload_csv(file: UploadFile = File(...)):
    try:
        csv_path = os.path.join(UPLOAD_DIR, "data.csv")
        with open(csv_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        return {"success": True, "message": "CSV uploaded successfully."}
    except Exception as e:
        logger.error(f"CSV upload error: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ----------------------
# Query CSV Endpoint
# ----------------------
class CSVQuery(BaseModel):
    question: str

@app.post("/query_csv")
async def query_csv(query: CSVQuery):
    try:
        csv_path = os.path.join(UPLOAD_DIR, "data.csv")
        result = analyze_csv.invoke({"file_path": csv_path, "question": query.question})
        return {"answer": result}
    except Exception as e:
        logger.error(f"CSV analysis error: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ----------------------
# Calendar Event Creation Endpoint
# ----------------------
class CalendarEventRequest(BaseModel):
    title: str
    start_time: str
    end_time: str
    description: str = ""

@app.post("/create_calendar_event")
async def create_calendar_event(event: CalendarEventRequest):
    try:
        event_link = create_event.invoke({
        "summary": event.title,
        "description": event.description,
        "start_time": event.start_time,
        "end_time": event.end_time
})

        return {"success": True, "event_link": event_link}
    except Exception as e:
        logger.error(f"Calendar event creation error: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})
