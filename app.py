from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
# Configure CORS to allow all origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Simple response templates
responses = {
    'greetings': [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Welcome! How may I assist you?"
    ],
    'resume': [
        "I can help you create a professional resume. What kind of experience do you have?",
        "Let's work on your resume. What's your current job title?",
        "I'll help you make your resume stand out. What industry are you targeting?"
    ],
    'interview': [
        "I can help you prepare for interviews. Would you like to practice some common questions?",
        "Let's get you ready for your interview. What role are you interviewing for?",
        "Interview preparation is crucial. What specific areas would you like to focus on?"
    ],
    'default': [
        "I understand you're looking for help. Could you be more specific?",
        "I'm here to assist you. Can you provide more details?",
        "I want to help you. What exactly would you like to know?"
    ]
}

def get_response_type(message):
    message = message.lower()
    if any(word in message for word in ['hi', 'hello', 'hey']):
        return 'greetings'
    elif any(word in message for word in ['resume', 'cv']):
        return 'resume'
    elif any(word in message for word in ['interview', 'job']):
        return 'interview'
    return 'default'

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
            
        user_message = data.get('message', '')
        
        # Get appropriate response type
        response_type = get_response_type(user_message)
        
        # Get random response from that type
        response = random.choice(responses[response_type])
        
        return jsonify({
            'response': response
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0') 