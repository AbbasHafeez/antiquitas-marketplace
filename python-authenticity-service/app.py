# python-authenticity-service/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import os
from dotenv import load_dotenv


load_dotenv() 
PORT = int(os.environ.get("PORT", 5001))

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

@app.route('/estimate-authenticity', methods=['POST'])
def estimate_authenticity():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    item_name = data.get('name', 'Unknown Item')
    item_description = data.get('description', '')

    # Dummy logic for authenticity score
    # In a real app, this would involve complex rules, ML, etc.
    score = random.randint(50, 99)
    if "replica" in item_description.lower() or "copy" in item_description.lower():
        score = random.randint(10, 40)

    print(f"Received for authenticity: {item_name}. Estimated score: {score}")
    return jsonify({
        "itemName": item_name,
        "authenticityScore": score,
        "message": "Score estimated by Python Authenticity Service"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)