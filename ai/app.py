import os
import ffmpeg
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import whisper
import re
from collections import Counter

app = Flask(__name__)

# Folders for uploads and processed audio
UPLOAD_FOLDER = "./uploads"
PROCESSED_FOLDER = "./processed"
TRANSCRIPTS_FOLDER ="./transcripts"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(TRANSCRIPTS_FOLDER, exist_ok=True)

# We can change the size of the whisper model: tiny, base, small, medium, large.
whisper_model = whisper.load_model("base")

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
    # Get audio file path from request
    data = request.json
    if 'audioPath' not in data:
        return jsonify({"error": "No audio path provided"}), 400
    
    audio_path = data['audioPath']
    
    # Check if file exists
    if not os.path.exists(audio_path):
        return jsonify({"error": "Audio file not found"}), 404
    
    try:
        # Use Whisper to transcribe audio
        result = whisper_model.transcribe(audio_path)
        transcript = result["text"]
        
        # Save transcript to file
        transcript_filename = os.path.basename(audio_path).rsplit('.', 1)[0] + '.txt'
        transcript_path = os.path.join(TRANSCRIPTS_FOLDER, transcript_filename)
        with open(transcript_path, 'w') as f:
            f.write(transcript)
        
        # Generate tags from transcript
        # Remove punctuation and convert to lowercase
        cleaned_text = re.sub(r'[^\w\s]', '', transcript.lower())
        words = cleaned_text.split()
        
        # Filter out common stop words and keep only words with length > 3
        stop_words = {'the', 'and', 'for', 'that', 'this', 'with', 'you', 'have', 
                     'from', 'are', 'they', 'will', 'what', 'when', 'where', 'how',
                     'why', 'who', 'which', 'there', 'here', 'their', 'your', 'our'}
        
        filtered_words = [word for word in words if len(word) > 3 and word not in stop_words]
        
        # Count frequency of words
        word_counts = Counter(filtered_words)
        
        # Get the 5 most common words as tags
        tags = [word for word, _ in word_counts.most_common(5)]
        
        # Create a simple summary (first few sentences as a preview)
        sentences = re.split(r'[.!?]+', transcript)
        # Take about 20% of the sentences or at least 3 sentences
        summary_length = max(3, int(len(sentences) * 0.2))
        summary = '. '.join(sentences[:summary_length]) + '.'
        
        return jsonify({
            "tags": tags,
            "transcript": transcript,
            "summary": summary,
            "transcriptPath": transcript_path
        })
        
    except Exception as e:
        return jsonify({"error": "Transcription failed", "details": str(e)}), 500


@app.route("/get-summary", methods=["POST"])
def get_summary():
    # Get transcript path from request
    data = request.json
    if 'transcriptPath' not in data:
        return jsonify({"error": "No transcript path provided"}), 400
    
    transcript_path = data['transcriptPath']
    
 
    if not os.path.exists(transcript_path):
        return jsonify({"error": "Transcript file not found"}), 404
    
    try:
        # Read transcript
        with open(transcript_path, 'r') as f:
            transcript = f.read()
        
        # Generate a more detailed summary
        sentences = re.split(r'[.!?]+', transcript)
        # Take about 30% of the sentences for a more detailed summary
        summary_length = max(5, int(len(sentences) * 0.3))
        summary = '. '.join(sentences[:summary_length]) + '.'
        
        return jsonify({
            "summary": summary
        })
        
    except Exception as e:
        return jsonify({"error": "Summarization failed", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)
