from fastapi import APIRouter
from pydantic import BaseModel, HttpUrl

router = APIRouter()

# ---------- REQUEST MODELS ----------

class TextRequest(BaseModel):
    content: str

class UrlRequest(BaseModel):
    url: HttpUrl

# ---------- TEXT ANALYZER (SIMPLE RULES) ----------

PHISHING_KEYWORDS = [
    "click here",
    "verify your account",
    "your account has been locked",
    "urgent",
    "password",
    "bank",
    "lottery",
    "free gift",
    "congratulations"
]

@router.post("/analyze-text")
def analyze_text(req: TextRequest):
    text = req.content.lower()
    score = 0
    reasons = []

    for kw in PHISHING_KEYWORDS:
        if kw in text:
            score += 30
            reasons.append(f"Contains suspicious phrase: '{kw}'.")

    if "http://" in text or "https://" in text:
        score += 20
        reasons.append("Contains a link which may lead to a fake website.")

    if "otp" in text:
        score += 20
        reasons.append("Asks for OTP, which is commonly abused in scams.")

    if score == 0:
        label = "safe"
        score = 10
        reasons.append("No obvious phishing patterns detected in this simple check.")
    elif score < 60:
        label = "suspicious"
    else:
        label = "phishing"

    explanation = " ".join(reasons)

    return {
        "label": label,
        "risk_score": float(score),
        "explanation": explanation
    }

# ---------- URL ANALYZER (SIMPLE RULES) ----------

@router.post("/analyze-url")
def analyze_url(req: UrlRequest):
    url = str(req.url)
    url_lower = url.lower()
    score = 0
    reasons = []

    # Not https
    if url_lower.startswith("http://"):
        score += 30
        reasons.append("URL is not using HTTPS (secure connection).")

    # Very long URL
    if len(url) > 80:
        score += 20
        reasons.append("URL is unusually long, which may hide the real destination.")

    # Suspicious words
    susp_words = ["free", "gift", "win", "prize", "login", "verify", "update"]
    for w in susp_words:
        if w in url_lower:
            score += 10
            reasons.append(f"Contains suspicious word in URL: '{w}'.")

    # @ symbol
    if "@" in url:
        score += 20
        reasons.append("URL contains '@', often used to trick users about the real site.")

    if score == 0:
        label = "safe"
        score = 10
        reasons.append("No obvious suspicious patterns detected in this simple check.")
    elif score < 60:
        label = "suspicious"
    else:
        label = "phishing"

    explanation = " ".join(reasons)

    return {
        "label": label,
        "risk_score": float(score),
        "explanation": explanation
    }
