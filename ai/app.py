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
        result = whisper_model.transcribe(audio_path, language=None)
        transcript = result["text"]
        detected_language_code = result.get("language", "unknown")
        # [LANGUAGE-DETECTION]
        language_map = {
            "af": "Afrikaans", "ar": "Arabic", "hy": "Armenian", "az": "Azerbaijani", "be": "Belarusian",
            "bs": "Bosnian", "bg": "Bulgarian", "ca": "Catalan", "zh": "Chinese", "hr": "Croatian",
            "cs": "Czech", "da": "Danish", "nl": "Dutch", "en": "English", "et": "Estonian",
            "fi": "Finnish", "fr": "French", "gl": "Galician", "de": "German", "el": "Greek",
            "he": "Hebrew", "hi": "Hindi", "hu": "Hungarian", "is": "Icelandic", "id": "Indonesian",
            "it": "Italian", "ja": "Japanese", "kn": "Kannada", "kk": "Kazakh", "ko": "Korean",
            "lv": "Latvian", "lt": "Lithuanian", "mk": "Macedonian", "ms": "Malay", "mr": "Marathi",
            "mi": "Maori", "ne": "Nepali", "no": "Norwegian", "fa": "Persian", "pl": "Polish",
            "pt": "Portuguese", "ro": "Romanian", "ru": "Russian", "sr": "Serbian", "sk": "Slovak",
            "sl": "Slovenian", "es": "Spanish", "sw": "Swahili", "sv": "Swedish", "tl": "Tagalog",
            "ta": "Tamil", "th": "Thai", "tr": "Turkish", "uk": "Ukrainian", "ur": "Urdu",
            "vi": "Vietnamese", "cy": "Welsh"
        }
        language_full = language_map.get(detected_language_code, "Unknown")
        # Early exit if transcript is empty or too short
        if not transcript or len(transcript.strip()) < 20: 
            return jsonify({
                "tags": [],
                "transcript": transcript,
                "shortSummary": "Not enough content for summarization.",
                "language": language_full
            })

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
        
        # Translate transcript to English if needed
        if detected_language_code != 'en':
            try:
                model_name = f"Helsinki-NLP/opus-mt-{detected_language_code}-en"
                translator = pipeline("translation", model=model_name)
                chunks = [transcript[i:i+512] for i in range(0, len(transcript), 512)]
                translated_chunks = []
                for chunk in chunks:
                    try:
                        translated = translator(chunk)[0]['translation_text']
                        translated_chunks.append(translated)
                    except Exception as e:
                        print("Translation failed on chunk:", chunk[:100])
                        print("Error:", e)

                translated_text = " ".join(translated_chunks)

            except Exception as e:
                print("Translation failed:", str(e))
                translated_text = transcript  # fallback to original
        else:
            translated_text = transcript

        try:
            keywords = kw_model.extract_keywords(
                translated_text,
                keyphrase_ngram_range=(1, 2),
                stop_words='english',
                top_n=5
            )
        except ValueError:
            keywords = []
        
        # Only extracts the keyword strings from the tuples returned by KeyBert
        # Each item in 'keywords' is a tuple like ('keyword', score)
        tags = [kw[0] for kw in keywords]

        # Always ensure language is the first tag
        tags = [language_full] + [tag for tag in tags if tag != language_full]

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
        # Generate the summary based on translated text
        summary_input = translated_text.strip() if translated_text.strip() else transcript
        print("SUMMARY INPUT (should be English):\n", summary_input[:500])

        short_summary_result = summarizer(summary_input, max_length=130, min_length=30, do_sample=False)

        if not short_summary_result or 'summary_text' not in short_summary_result[0]:
            return jsonify({
                "tags": tags,
                "transcript": transcript,
                "shortSummary": "Summary generation failed.",
                "language": language_full
            })
        short_summary = short_summary_result[0]['summary_text']
        
        # Print the short summary
        print("Short summary:", short_summary)

        return jsonify({
            "tags": tags, # Extracted using KeyBERT based on transcript content
            "transcript": transcript,
            "shortSummary": short_summary, # Generated using BART summarization model
            "language": language_full,
        })

    except Exception as e:
        return jsonify({"error": "Transcription or summarization failed", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)