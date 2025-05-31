import os
import re
import ffmpeg
import whisper
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from collections import Counter
from transformers import pipeline, AutoTokenizer
from keybert import KeyBERT

app = Flask(__name__)
CORS(app)

# ========== Configuration ==========
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024 * 1024  # 2GB

UPLOAD_FOLDER = "./uploads"
PROCESSED_FOLDER = "./processed"
TRANSCRIPTS_FOLDER = "./transcripts"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(TRANSCRIPTS_FOLDER, exist_ok=True)

# ========== Model Initialization ==========
whisper_model = whisper.load_model("base")
kw_model = KeyBERT("distilbert-base-nli-mean-tokens")

bart_model_name = "facebook/bart-large-cnn"
bart_tokenizer = AutoTokenizer.from_pretrained(bart_model_name)
summarizer = pipeline("summarization", model=bart_model_name, tokenizer=bart_tokenizer)

# Tokenizer for KeyBERT chunking
bert_tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/distilbert-base-nli-mean-tokens")

# ------- Upload Endpoint -------
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

    # Convert video to MP3
    try:
        ffmpeg.input(video_path).output(audio_path, acodec='libmp3lame', audio_bitrate='192k').run()
    except ffmpeg.Error as e:
        return jsonify({"error": "FFmpeg conversion failed", "details": str(e)}), 500
    finally:
        os.remove(video_path)

    # Transcribe with Whisper
    try:
        result = whisper_model.transcribe(audio_path)
        transcript = result["text"]
        lang_code = result.get("language", "unknown")
    except Exception as e:
        return jsonify({"error": "Transcription failed", "details": str(e)}), 500

    # Save transcript
    transcript_filename = audio_filename.rsplit('.', 1)[0] + '.txt'
    transcript_path = os.path.join(TRANSCRIPTS_FOLDER, transcript_filename)
    with open(transcript_path, 'w') as f:
        f.write(transcript)

    # Language map
    language_map = {"af": "Afrikaans", "ar": "Arabic", "hy": "Armenian", "az": "Azerbaijani", "be": "Belarusian",
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
            "vi": "Vietnamese", "cy": "Welsh"}
    language_full = language_map.get(lang_code, lang_code)

    # Translate if needed
    if lang_code != 'en':
        try:
            translator = pipeline("translation", model=f"Helsinki-NLP/opus-mt-{lang_code}-en")
            chunks = [transcript[i:i+512] for i in range(0, len(transcript), 512)]
            translated_text = " ".join([translator(chunk)[0]['translation_text'] for chunk in chunks])
        except Exception as e:
            translated_text = transcript
    else:
        translated_text = transcript

    # ------- Token-aware chunking -------
    # max tokens must be less than 1024
    def chunk_text_token_aware(text, tokenizer, max_tokens=400, overlap=50):
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk_words = []
            while i < len(words):
                chunk_words.append(words[i])
                tokens = tokenizer.tokenize(" ".join(chunk_words))
                if len(tokens) > max_tokens:
                    chunk_words.pop()
                    break
                i += 1
            if not chunk_words:
                chunk_words.append(words[i])
                i += 1
            chunks.append(" ".join(chunk_words))
            prev_i = i
            i = max(i - overlap, 0)
            if i <= prev_i:
                break
        return chunks

    # ------- Tag Extraction -------
    def extract_tags(transcript, kw_model, tokenizer, top_n_per_chunk=5, final_top_n=10):
        all_keywords = []
        chunks = chunk_text_token_aware(transcript, tokenizer, max_tokens=400, overlap=50)

        for chunk in chunks:
            try:
                keywords = kw_model.extract_keywords(
                    chunk,
                    keyphrase_ngram_range=(1, 2),
                    stop_words='english',
                    use_maxsum=True,
                    top_n=top_n_per_chunk
                )
                all_keywords.extend(keywords)
            except:
                continue

        # Merge and sort
        unique_tags = {}
        for kw, score in all_keywords:
            if kw not in unique_tags or score > unique_tags[kw]:
                unique_tags[kw] = score
        sorted_tags = sorted(unique_tags.items(), key=lambda x: x[1], reverse=True)[:final_top_n]
        return [language_full] + [kw for kw, _ in sorted_tags if kw.lower() != language_full.lower()]

    try:
        tags = extract_tags(translated_text, kw_model, bert_tokenizer)
    except Exception:
        cleaned = re.sub(r'[^\w\s]', '', translated_text.lower())
        words = [w for w in cleaned.split() if len(w) > 3 and w not in {'the', 'and', 'this', 'with', 'that'}]
        tags = [language_full] + [w for w, _ in Counter(words).most_common(5)]

    # ------- BART Summary -------

    def chunk_text_for_summary(text, tokenizer, max_tokens=900):
        sentences = re.split(r'(?<=[.!?]) +', text)
        chunks, current_chunk = [], []

        for sentence in sentences:
            current_chunk.append(sentence)
            tokenized = tokenizer(" ".join(current_chunk), return_tensors="pt", truncation=False)
            if tokenized['input_ids'].shape[1] >= max_tokens:
                current_chunk.pop()
                chunks.append(" ".join(current_chunk))
                current_chunk = [sentence]

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    try:
        tokenized_input = bart_tokenizer(translated_text, return_tensors="pt", truncation=True, max_length=1024)
        if tokenized_input["input_ids"].shape[1] == 0:
            return jsonify({"error": "Summary input empty"}), 400

        summary_chunks = chunk_text_for_summary(translated_text, bart_tokenizer)
        intro_chunk = summary_chunks[0] if summary_chunks else translated_text  # for YouTube-style summary

        result = summarizer(
            intro_chunk,
            max_length=130,
            min_length=60,
            do_sample=False,
            clean_up_tokenization_spaces=True
        )
        short_summary = result[0]['summary_text']
    except Exception as e:
        traceback.print_exc()
        short_summary = "Summary generation failed."

    return jsonify({
        "tags": tags,
        "transcript": transcript,
        "shortSummary": short_summary,
        "language": language_full
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)
