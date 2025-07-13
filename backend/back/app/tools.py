from typing import Optional
from langchain.tools import tool
from langchain_community.tools.ddg_search import DuckDuckGoSearchRun
from langchain_community.utilities import WikipediaAPIWrapper
import pandas as pd
from langchain_experimental.agents import create_csv_agent
from langchain_openai import ChatOpenAI
import whisper
import os
import pyttsx3
import datetime
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import base64
from email.mime.text import MIMEText
from openai import OpenAI
import logging
from dotenv import load_dotenv

# --- ENV & SETUP ---
load_dotenv()
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

client = OpenAI()
duckduckgo_search = DuckDuckGoSearchRun()
wiki = WikipediaAPIWrapper()
whisper_model = whisper.load_model("base")

# === SEARCH TOOLS ===

@tool("web_search")
def web_search(query: str) -> str:
    """Search the web using DuckDuckGo."""
    try:
        logger.info(f"Running web search for: {query}")
        return duckduckgo_search.run(query)
    except Exception as e:
        return f"Web search failed: {e}"

@tool("wikipedia_search")
def wikipedia_search(query: str) -> str:
    """Search Wikipedia."""
    try:
        logger.info(f"Running Wikipedia search for: {query}")
        return wiki.run(query)
    except Exception as e:
        return f"Wikipedia search failed: {e}"

# === CSV TOOLS ===

@tool("analyze_csv")
def analyze_csv(file_path: str, question: str) -> str:
    """Analyze a CSV file and answer a question using GPT."""
    try:
        logger.info(f"Analyzing CSV: {file_path} with question: {question}")
        llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
        agent = create_csv_agent(llm, file_path, verbose=False, agent_type="openai-tools", allow_dangerous_code=True)
        return agent.run(question)
    except Exception as e:
        return f"Failed to analyze CSV: {str(e)}"

# === AUDIO TOOLS ===

@tool("transcribe_audio")
def transcribe_audio(file_path: str) -> str:
    """Transcribe an audio file using Whisper."""
    try:
        logger.info(f"Transcribing audio: {file_path}")
        result = whisper_model.transcribe(file_path)
        return result["text"]
    except Exception as e:
        return f"Transcription failed: {str(e)}"
    
from gtts import gTTS

@tool("text_to_speech")
def text_to_speech(text: str) -> str:
    """Convert text to speech using gTTS and return path to MP3 file."""
    try:
        logger.info("Converting text to speech using gTTS")
        UPLOAD_DIR = "temp_uploads"
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        filename = "tts_output.mp3"
        filepath = os.path.join(UPLOAD_DIR, filename)

        tts = gTTS(text)
        tts.save(filepath)

        return f"/audio/{filename}"
    except Exception as e:
        logger.error(f"TTS failed: {e}")
        return f"TTS failed: {str(e)}"



# === CALENDAR TOOLS ===

SCOPES_CALENDAR = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    creds = None
    try:
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token_file:
                creds = pickle.load(token_file)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES_CALENDAR)
                creds = flow.run_local_server(port=0)
            with open('token.pickle', 'wb') as token_file:
                pickle.dump(creds, token_file)
        return build('calendar', 'v3', credentials=creds)
    except Exception as e:
        logger.error(f"Google Calendar auth error: {e}")
        raise

@tool("create_event")
def create_event(summary: str, description: str, start_time: str, end_time: str) -> str:
    """Create a calendar event."""
    try:
        logger.info("Creating calendar event")

        # Fix datetime to include seconds if missing
        if len(start_time) == 16:
            start_time += ":00"
        if len(end_time) == 16:
            end_time += ":00"

        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_time,
                'timeZone': 'Asia/Kathmandu'
            },
            'end': {
                'dateTime': end_time,
                'timeZone': 'Asia/Kathmandu'
            }
        }

        logger.info(f"Payload to Google Calendar: {event}")
        service = get_calendar_service()
        created_event = service.events().insert(calendarId='primary', body=event).execute()
        return created_event.get('htmlLink')
    except Exception as e:
        logger.error(f"Failed to create event: {e}")
        return f"Failed to create event: {str(e)}"


@tool("list_upcoming_events")
def list_upcoming_events(max_events: int = 5) -> str:
    """List upcoming calendar events."""
    try:
        logger.info("Listing upcoming events")
        service = get_calendar_service()
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        events_result = service.events().list(
            calendarId='primary',
            timeMin=now,
            maxResults=max_events,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])
        if not events:
            return "No upcoming events found."
        return "\n".join(
            f"{event['start'].get('dateTime', event['start'].get('date'))} - {event['summary']}"
            for event in events
        )
    except Exception as e:
        return f"Failed to list events: {str(e)}"

# === EMAIL TOOLS ===

SCOPES_GMAIL = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service():
    creds = None
    try:
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token_file:
                creds = pickle.load(token_file)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES_GMAIL)
                creds = flow.run_local_server(port=0)
            with open('token.pickle', 'wb') as token_file:
                pickle.dump(creds, token_file)
        return build('gmail', 'v1', credentials=creds)
    except Exception as e:
        logger.error(f"Gmail auth error: {e}")
        raise

@tool("send_email")
def send_email(to: str, subject: str, message_body: str) -> str:
    """Send an email with subject and body using Gmail API."""
    try:
        logger.info(f"Sending email to {to}")
        service = get_gmail_service()
        message = MIMEText(message_body)
        message['to'] = to
        message['subject'] = subject
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        send_message = service.users().messages().send(userId='me', body={'raw': raw_message}).execute()
        return f"Email sent successfully! ID: {send_message['id']}"
    except Exception as e:
        return f"Failed to send email: {str(e)}"

@tool("send_email_wrapper")
def send_email_wrapper(arg: str) -> str:
    """Send email using format: to||subject||message"""
    try:
        logger.info("Using send_email_wrapper")
        to, subject, body = arg.split("||", 2)
        return send_email(to=to, subject=subject, message_body=body)
    except ValueError:
        return "Error: Input must be in the format 'to||subject||message_body'"
    except Exception as e:
        return f"Failed to send email: {str(e)}"

# === SUMMARIZATION TOOL ===

@tool("summarize_text")
def summarize_text(text: str) -> str:
    """Summarize long text using GPT-3.5-turbo."""
    try:
        logger.info("Summarizing text")
        messages = [
            {"role": "system", "content": "You are a helpful assistant that summarizes texts concisely."},
            {"role": "user", "content": f"Summarize this:\n{text}"}
        ]
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=150,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Summarization failed: {str(e)}"
