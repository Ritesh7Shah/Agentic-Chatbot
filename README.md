# Agentic-Chatbot

A modular AI chatbot system featuring Retrieval-Augmented Generation (RAG), LangChain-based multi-agent workflows, voice assistant integration, and smart tool routing. Designed for extensibility, scalability, and production readiness.

---

## 🚀 Project Overview

Agentic-Chatbot is a powerful conversational AI platform that combines the latest advances in large language models (LLMs), retrieval techniques, and agent-based architectures to deliver intelligent, context-aware, and multi-functional chatbot experiences.

Key capabilities include:
- **Retrieval-Augmented Generation (RAG):** Dynamically retrieve relevant documents and context to improve answer accuracy.
- **LangChain Multi-Agent Workflows:** Coordinated agents for complex, multi-step reasoning and tool use.
- **Voice Assistant Integration:** Supports speech recognition (Whisper) and text-to-speech (ElevenLabs/gTTS).
- **Smart Tool Routing:** Automatically selects the best tools (web search, calendar, email, CSV analysis, etc.) based on user queries.
- **Dockerized Fullstack:** Includes backend (FastAPI) and frontend (React + Vite) with containerized deployment for easy setup.
- **Extensible and Modular:** Add new tools and workflows effortlessly.

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, LangChain, OpenAI GPT, Chroma vector DB
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Voice:** Whisper ASR, ElevenLabs / gTTS TTS
- **Infrastructure:** Docker, Docker Compose
- **Other Tools:** Pinecone (optional), Supabase (optional)

---

## 📸 Screenshots / Demo

*(Add screenshots or GIFs here)*

---

## 💻 Getting Started

### Prerequisites

- Docker & Docker Compose installed
- OpenAI API key (set in `.env`)
- (Optional) ElevenLabs or other voice API keys

### Setup & Run

1. Clone the repo:

   ```bash
   git clone https://github.com/Ritesh7Shah/Agentic-Chatbot.git
   cd Agentic-Chatbot

