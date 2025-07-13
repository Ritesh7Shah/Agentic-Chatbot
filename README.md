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

   Create a .env file in the backend directory with your API keys:

ini
Copy
Edit
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key (optional)

Build and start containers:

bash
Copy
Edit
docker-compose up --build
Access the frontend at http://localhost:3000
Backend API docs at http://localhost:8000/docs

 Features
PDF & CSV File Upload & Query

Smart Chat with Multi-Agent Coordination

Voice Input & Output Support

Calendar Event Creation & Email Sending Tools

Detailed Logging & Monitoring

Fallback Logic for Unhandled Queries

 Project Structure

 /
├── backend/               # FastAPI backend with LangChain agents & RAG
├── frontend/              # React + Vite frontend application
├── docker-compose.yml     # Docker orchestration for full stack
├── .gitignore
└── README.md

Contribution
This project is open-source under the MIT License. Contributions, suggestions, and bug reports are welcome!

📄 License
MIT License — see LICENSE file.

📞 Contact
Ritesh Shah
GitHub: Ritesh7Shah
Email: sahritesh678@gmail.com

Built with ❤️ using LangChain, FastAPI, and OpenAI GPT

---

### Tips for README:

- Replace placeholders like API keys info, contact email, screenshots with your actual data.
- Add GIFs or screenshots especially for the chatbot UI or workflows.
- Keep it updated as your project evolves.

---

If you want, I can help generate screenshots, or even a short demo video script to go with it! Want me to help with that?



