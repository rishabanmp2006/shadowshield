import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib

# Example: df with columns ['text', 'label']
# Replace this with actual dataset load
data = [
    ("Congrats! You won a lottery, click here to claim.", "phishing"),
    ("Please update your bank account details immediately.", "phishing"),
    ("Your OTP is 123456. Do not share it with anyone.", "phishing"),
    ("Hi, are we still meeting tomorrow at 10?", "safe"),
    ("Your order has been shipped and will arrive soon.", "safe"),
]
df = pd.DataFrame(data, columns=["text", "label"])

X_train, X_test, y_train, y_test = train_test_split(
    df["text"], df["label"], test_size=0.2, random_state=42
)

vectorizer = TfidfVectorizer(stop_words="english")
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model = LogisticRegression(max_iter=1000)
model.fit(X_train_vec, y_train)

y_pred = model.predict(X_test_vec)
print(classification_report(y_test, y_pred))

joblib.dump(vectorizer, "app/models/text_vectorizer.pkl")
joblib.dump(model, "app/models/text_model.pkl")
print("Saved text model and vectorizer.")
