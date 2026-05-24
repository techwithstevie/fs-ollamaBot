from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama

app = Flask(__name__)
CORS(app)
CHAT_HISTORY = {}

@app.route("/", methods=["GET"])
def health():
    """Health check endpoint - returns success when API is running"""
    return jsonify({
        "status": "success",
        "message": "API is running",
    })

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    session_id = data.get("session.id", "default")
    user_message = data.get("message", "")

    # Maintain per-session history
    if session_id not in CHAT_HISTORY:
        CHAT_HISTORY[session_id] = []

    CHAT_HISTORY[session_id].append({
        "role": "user",
        "content": user_message
    })

    response = ollama.chat(
        model="firesafe-bot",
        messages=CHAT_HISTORY[session_id]
    )

    assistant_reply = response["message"]["content"]

    CHAT_HISTORY[session_id].append({
        "role": "assistant",
        "content": assistant_reply
    })

    return jsonify({"reply": assistant_reply})

if __name__ == "__main__":
    app.run(debug=True, port=5000)