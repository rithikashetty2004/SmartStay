from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import pandas as pd
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

# groq api key
API_KEY = ""  # Replace with your api key
print(API_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Groq client
client = Groq(api_key=API_KEY)

# Load JSON and CSV files from the "data" folder
DATA_FOLDER = "data"

def load_json(filename):
    """Load JSON data from a file."""
    try:
        with open(os.path.join(DATA_FOLDER, filename), "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return {}

def load_csv(filename):
    """Load CSV data as a Pandas DataFrame."""
    try:
        return pd.read_csv(os.path.join(DATA_FOLDER, filename))
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return pd.DataFrame()

# Load all data
staff_data = load_json("staff.json")
hotel_historic_data = load_csv("Hotel_Historic_Dataset.csv")
hotel_activities_data = load_csv("Updated_Hotel_Activities_Dataset.csv")
hotel_list_data = load_csv("Updated_Hotel_List.csv")

# Route for generating quick policies
@app.route('/generate-policy', methods=['POST'])
def generate_policy():
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    try:
        prompt = f"In response to this hospitality-related query, provide a clear and concise guideline: {user_message}."
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
        )

        if chat_completion.choices:
            response = chat_completion.choices[0].message.content.strip()
            return jsonify({"policy": response})
        else:
            return jsonify({"error": "No choices returned from API"}), 500

    except Exception as e:
        print(f"Error in generate_policy: {e}")
        return jsonify({"error": str(e)}), 500

# Route for Smart Stay hotel recommendations
@app.route('/smartstay-recommendations', methods=['POST'])
def smartstay_recommendations():
    data = request.json
    preferences = data.get("preferences", "")

    if not preferences:
        return jsonify({"error": "User preferences are required"}), 400

    try:
        prompt = f"Suggest the best hotel stay experience based on these preferences: {preferences}."
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            max_tokens=200
        )

        if chat_completion.choices:
            response = chat_completion.choices[0].message.content.strip()
            return jsonify({"recommendation": response})
        else:
            return jsonify({"error": "No choices returned from API"}), 500

    except Exception as e:
        print(f"Error in smartstay_recommendations: {e}")
        return jsonify({"error": str(e)}), 500

# New Route for answering customer queries based on JSON and CSV data
@app.route('/customer-query', methods=['POST'])
def customer_query():
    data = request.json
    user_query = data.get("query", "")

    if not user_query:
        return jsonify({"error": "Query is required"}), 400

    # Check if the query is related to hotels
    if "hotel" in user_query.lower():
        matching_hotels = hotel_list_data[hotel_list_data['Hotel Name'].str.contains(user_query, case=False, na=False)]
        if not matching_hotels.empty:
            hotel_names = matching_hotels['Hotel Name'].tolist()
            return jsonify({"response": f"We found the following hotels matching your search: {', '.join(hotel_names)}"})

    # Check if the query is related to hotel activities
    if "activities" in user_query.lower():
        available_activities = hotel_activities_data['Activity Name'].dropna().unique().tolist()
        return jsonify({"response": f"Available hotel activities include: {', '.join(available_activities)}"})

    # Check if the query is about expenses
    if "expense" in user_query.lower() or "budget" in user_query.lower():
        avg_expense = hotel_historic_data['Average Expense'].mean()
        return jsonify({"response": f"The average expense for hotels in our database is ${avg_expense:.2f} per night."})

    # If no match, use AI
    try:
        prompt = f"Respond to this hotel-related customer query: {user_query}."
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            max_tokens=200
        )

        if chat_completion.choices:
            response = chat_completion.choices[0].message.content.strip()
            return jsonify({"response": response})
        else:
            return jsonify({"error": "No choices returned from API"}), 500

    except Exception as e:
        print(f"Error in customer_query: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
