import os
import logging
from dotenv import load_dotenv
from typing import List

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

CHROMA_DIR = "chroma_store"

def load_and_split_pdf(file_path: str) -> List[Document]:
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    return splitter.split_documents(docs)

def embed_and_store(split_docs: List[Document], user_id: str) -> Chroma:
    os.makedirs(CHROMA_DIR, exist_ok=True)
    embeddings = OpenAIEmbeddings()

    vectordb = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
        collection_name=f"user_{user_id}"
    )

    vectordb.add_documents(split_docs)

    logger.info(f"✅ Embedded {len(split_docs)} docs to user_{user_id}'s Chroma collection.")
    return vectordb

def get_vectorstore(user_id: str) -> Chroma:
    embeddings = OpenAIEmbeddings()
    vectordb = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
        collection_name=f"user_{user_id}"
    )
    return vectordb
