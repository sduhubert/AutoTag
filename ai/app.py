import os
import ffmpeg
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Folders for uploads and processed audio
UPLOAD_FOLDER = "./uploads"
PROCESSED_FOLDER = "./processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

@app.route("/upload-video", methods=["POST"])
def upload_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    filename = secure_filename(file.filename)

    if not filename.lower().endswith(('.mp4', '.mov', '.wav', '.mp3', '.mp2', '.m4a', '.flac', )):
        return jsonify({"error": "Invalid file format"}), 400

    video_path = os.path.join(UPLOAD_FOLDER, filename)
    audio_path = os.path.join(PROCESSED_FOLDER, filename.rsplit('.', 1)[0] + '.mp3')
    file.save(video_path)

    # Convert to MP3
    try:
        ffmpeg.input(video_path).output(audio_path, acodec='libmp3lame', audio_bitrate='192k').run()
    except ffmpeg.Error as e:
        return jsonify({"error": "FFmpeg conversion failed", "details": str(e)}), 500

    # Deletes the video after it's converted
    os.remove(video_path)

    return jsonify({"message": "File processed", "audioPath": audio_path})

@app.route("/generate-tags", methods=["POST"])
def generate_tags():
    # This is where the voice recognition will go
    return jsonify({"tags": ["example", "voice", "ai"]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)
