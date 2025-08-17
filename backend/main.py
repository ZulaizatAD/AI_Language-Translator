import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from typing import Optional

# load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize the LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", api_key=GEMINI_API_KEY)

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# Create the prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("human", "{input}"),
    ]
)

# Create the chain
chain = prompt | llm

# Initialize FastAPI app
app = FastAPI(
    title="Text Translation API",
    description="A simple text translation API using Google Gemini",
    version="1.0.0",
)


# Pydantic models for request/response
class TranslationRequest(BaseModel):
    text: str
    input_language: str = "English"
    output_language: str = "Malay"


class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    input_language: str
    output_language: str


# Translation endpoint
@app.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text from one language to another using Google Gemini.

    - **text**: The text to translate
    - **input_language**: Source language (default: English)
    - **output_language**: Target language (default: Malay)
    """
    try:
        # Validate input
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        # Invoke the translation chain
        ai_msg = await chain.invoke(
            {
                "input_language": request.input_language,
                "output_language": request.output_language,
                "input": request.text,
            }
        )

        return TranslationResponse(
            original_text=request.text,
            translated_text=ai_msg.content.strip(),
            input_language=request.input_language,
            output_language=request.output_language,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


# Test endpoint
@app.get("/test")
async def test_translation():
    try:
        ai_msg = await chain.invoke(
            {
                "input_language": "English",
                "output_language": "Malay",
                "input": "I like programming.",
            }
        )

        return {
            "test_input": "I like programming.",
            "test_output": ai_msg.content,
            "status": "success",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")


@app.get("/")
async def root():
    return {"message": "Translation API is running", "docs": "/docs"}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
