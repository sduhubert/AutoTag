import os
import ffmpeg
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import whisper
import re
import time
from collections import Counter
from flask_cors import CORS
from transformers import pipeline
from keybert import KeyBERT

app = Flask(__name__)
CORS(app)

# Folders for uploads and processed audio
UPLOAD_FOLDER = "/uploads_shared"
PROCESSED_FOLDER = "./processed"
TRANSCRIPTS_FOLDER ="./transcripts"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(TRANSCRIPTS_FOLDER, exist_ok=True)

# We can change the size of the whisper model: tiny, base, small, medium, large.
#load models
whisper_model = whisper.load_model("base")
#using a pre-trained BERT embedding model. (Strong and lightweight alternative to using BERT directly for token extraction)
kw_model = KeyBERT("distilbert-base-nli-mean-tokens")

# All-in-one - video to mp3, then mp3 to text, then summary/tags
@app.route("/upload-video", methods=["POST"])
def upload_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)

    if not filename.lower().endswith(('.mp4', '.mov', '.wav', '.mp3', '.mp2', '.m4a', '.flac')):
        return jsonify({"error": "Invalid file format"}), 400

    video_path = os.path.join(UPLOAD_FOLDER, filename)
    audio_filename = filename.rsplit('.', 1)[0] + '.mp3'
    audio_path = os.path.join(PROCESSED_FOLDER, audio_filename)
    file.save(video_path)

    # Convert to MP3
    try:
        ffmpeg.input(video_path).output(audio_path, acodec='libmp3lame', audio_bitrate='192k').run()
    except ffmpeg.Error as e:
        return jsonify({"error": "FFmpeg conversion failed", "details": str(e)}), 500
    finally:
        # Deletes the video after it's converted
        os.remove(video_path)

    # Transcription, tag generation
    try:
        # Use Whisper to transcribe audio
        result = whisper_model.transcribe(audio_path)
        transcript = result["text"]

        # Save transcript to file
        transcript_filename = audio_filename.rsplit('.', 1)[0] + '.txt'
        transcript_path = os.path.join(TRANSCRIPTS_FOLDER, transcript_filename)
        with open(transcript_path, 'w') as f:
            f.write(transcript)

        # -- Generate tags with BERT --


        # A basic placeholder to replace with BERT-based logic
        # keyphrase allows both single words and two-word phrases
        # stop removes common stop words such as "and" "the" etc
        # top_n limits result to a specific amout of relevant keywords/prases 
        keywords = kw_model.extract_keywords(transcript, 
                                             keyphrase_ngram_range=(1, 1), 
                                             stop_words='english', 
                                             top_n=5)
        
        # Only extracts the keyword strings from the tuples returned by KeyBert
        # Each item in 'keywords' is a tuple like ('keyword', score)
        tags = [kw[0] for kw in keywords]

        # Create a simple summary (first few sentences as a preview)
        sentences = re.split(r'[.!?]+', transcript)
        # # Take about 20% of the sentences or at least 3 sentences
        # summary_length = max(3, int(len(sentences) * 0.2))
        # short_summary = '. '.join(sentences[:summary_length]) + '.'

        detailed_summary_length = max(5, int(len(sentences) * 0.3))
        detailed_summary = '. '.join(sentences[:detailed_summary_length]) + '.'

        # -- BART summarization logic --

        # Load the BART model for summarization
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

        # Generate the summary  
        short_summary_result = summarizer(transcript, max_length=130, min_length=30, do_sample=False)
        short_summary = short_summary_result[0]['summary_text']
        
        # Print the short summary
        print("Short summary:", short_summary)

        return jsonify({
            "tags": tags, # Extracted using KeyBERT based on transcript content
            "transcript": transcript,
            "shortSummary": short_summary, # Generated using BART summarization model
        })

    except Exception as e:
        return jsonify({"error": "Transcription or summarization failed", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)