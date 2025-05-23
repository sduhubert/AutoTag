import os
import ffmpeg
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import whisper
import re
import time
import time
from collections import Counter
from flask_cors import CORS
from transformers import pipeline
from keybert import KeyBERT
from transformers import pipeline, AutoTokenizer

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
bart_tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
# At top of your file, after imports and model init:
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/distilbert-base-nli-mean-tokens")
bart_model = "facebook/bart-large-cnn"
summarizer = pipeline("summarization", model=bart_model, tokenizer=bart_tokenizer)

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

    # Check if the audio file was created
    if not os.path.exists(audio_path):
        return jsonify({"error": "Audio conversion failed"}), 500

    # Use Whisper to transcribe audio
    result = whisper_model.transcribe(audio_path)
    transcript = result["text"]

    # Check if the transcript is empty
    if not transcript.strip():
        return jsonify({"error": "Transcription failed, no text detected"}), 500

    # Save transcript to file
    transcript_filename = audio_filename.rsplit('.', 1)[0] + '.txt'
    transcript_path = os.path.join(TRANSCRIPTS_FOLDER, transcript_filename)
    with open(transcript_path, 'w') as f:
        f.write(transcript)


    # -- Generate tags with BERT --


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

    # smaller chunks (around 512 tokens limit)
    chunks_for_tags = chunk_text_token_aware(transcript, tokenizer, max_tokens=400, overlap=50)

    def extract_tags_from_transcript(transcript, kw_model, top_n_per_chunk=5, final_top_n=10):
        all_keywords = []

        chunks = chunks_for_tags

        for idx, chunk in enumerate(chunks):
            tokens = tokenizer.tokenize(chunk)
            print(f"Chunk {idx} length in tokens: {len(tokens)}")

                            
            print(f"Processing chunk with {len(chunk.split())} words")
            keywords = kw_model.extract_keywords(
                chunk,
                keyphrase_ngram_range=(1, 1),
                stop_words='english',
                top_n=top_n_per_chunk
            )
            all_keywords.extend(keywords)

        # Merge duplicates keeping highest score
        unique_tags = {}
        for kw, score in all_keywords:
            if kw not in unique_tags or score > unique_tags[kw]:
                unique_tags[kw] = score

        # Sort by score and select top tags
        sorted_tags = sorted(unique_tags.items(), key=lambda x: x[1], reverse=True)[:final_top_n]

        # Return keywords
        tags = [kw for kw, score in sorted_tags]
        return tags

    try:
<<<<<<< HEAD
        tags = extract_tags_from_transcript(transcript, kw_model)
    except Exception as e:
        print("Error in tag extraction:", e)
        return jsonify({"error": "Tag extraction failed", "details": str(e)}), 500    


    # -- Summary --
 
    
    # dividing into chuncks because of the token limit around 1024 for BART
    def chunk_text_for_summary(text, tokenizer, max_tokens=1000):
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
            chunks.append(" ".join(chunk_words))
        return chunks

 
    # Check if transcript is empty or None
    if not transcript or not transcript.strip():
        return jsonify({"error": "Transcript is empty, cannot summarize"}), 400
=======
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
>>>>>>> b55b579 (filter by language)

    try:
        # Tokenize with truncation to verify input size
        tokenized_input = bart_tokenizer(transcript, return_tensors="pt", truncation=True, max_length=1024)
        if tokenized_input["input_ids"].shape[1] == 0:
            return jsonify({"error": "Tokenized input is empty, cannot summarize"}), 400

        print(f"Tokens in input: {tokenized_input['input_ids'].shape[1]}")

        summary_chunks = chunk_text_for_summary(transcript, bart_tokenizer, max_tokens=1000)
        all_summaries = []

        for chunk in summary_chunks:
            # skip empty chunks
            if chunk.strip():
                summary_result = summarizer(
                    chunk,
                    max_length=130,
                    min_length=30,
                    do_sample=False
                )
                all_summaries.append(summary_result[0]['summary_text'])

        # chunk summaries joined into a final summary string
        final_summary = " ".join(all_summaries)

<<<<<<< HEAD

=======
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
>>>>>>> b55b579 (filter by language)

    except Exception as e:
        print("Error in summarization:", e)
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Summarization failed", "details": str(e)}), 500

    print("Short summary:", final_summary)

    return jsonify({
        "tags": tags, # Extracted using KeyBERT based on transcript content
        "transcript": transcript,
        "shortSummary": final_summary, # Generated using BART summarization model
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)