from flask import Flask, render_template, request, jsonify
from pytube import extract
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
import ast
import os
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Configure the API key
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def get_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([item["text"] for item in transcript])
    except Exception as e:
        logging.error(f"Error getting transcript: {str(e)}")
        raise

def generate_questions(transcript, difficulty="medium", n_questions=10):
    template = f"""
    You are a helpful assistant programmed to generate questions based on any text provided. For every chunk of text you receive, you're tasked with designing {n_questions} distinct questions. Each of these questions will be accompanied by 3 possible answers: one correct answer and two incorrect ones.

    For clarity and ease of processing, structure your response in a way that emulates a Python list of lists.

    Your output should be shaped as follows:

    1. An outer list that contains {n_questions} inner lists.
    2. Each inner list represents a set of question and answers, and contains exactly 4 strings in this order:
    - The generated question.
    - The correct answer.
    - The first incorrect answer.
    - The second incorrect answer.

    Your output should mirror this structure:
    [
        ["Generated Question 1", "Correct Answer 1", "Incorrect Answer 1.1", "Incorrect Answer 1.2"],
        ["Generated Question 2", "Correct Answer 2", "Incorrect Answer 2.1", "Incorrect Answer 2.2"],
        ...
    ]

    It is crucial that you adhere to this format as it's optimized for further Python processing.
    The level of difficulty of the questions should be {difficulty}.
    The provided text is as follows:
    {transcript}
    """

    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(template)
        return ast.literal_eval(response.text)
    except Exception as e:
        logging.error(f"Error generating questions: {str(e)}")
        raise

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    video_url = request.json['video_url']
    try:
        video_id = extract.video_id(video_url)
        transcript = get_transcript(video_id)
        questions = generate_questions(transcript)
        return jsonify(questions)
    except Exception as e:
        logging.error(f"Error in generate_quiz: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/test')
def test():
    return jsonify({"status": "ok", "message": "Test route is working"})
# if __name__ == '__main__':
#     app.run(debug=True)
