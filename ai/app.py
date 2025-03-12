from flask import Flask, request, jsonify
import speech_recognition as sr

app = Flask(__name__)

@app.route("/generate-tags", methods=["POST"])
def generate_tags():
    # This is where voice recognition logic will go
    return jsonify({"tags": ["example", "voice", "ai"]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)