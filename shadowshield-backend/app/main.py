from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analyze

app = FastAPI(
    title="ShadowShield API",
    version="1.0.0",
    description="API for phishing text and URL analysis",
)

origins = ["*"]  # allow all origins – OK for local hackathon

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["analyze"])

@app.get("/health")
def health():
    return {"status": "ok"}
