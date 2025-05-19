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