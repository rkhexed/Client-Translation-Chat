from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load the trained ML model
with open('model/your_model.pkl', 'rb') as model_file:
    ml_model = pickle.load(model_file)

@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text', '')
    
    # Use the ML model to predict the translation (adapt as needed)
    translated_text = ml_model.predict([text])
    
    return jsonify({'translated_text': translated_text})

if __name__ == '__main__':
    app.run(port=5000)

