# uvicorn main:app --reload

import cv2
import numpy as np
import face_recognition
import faiss
import csv
import os
import threading
from datetime import datetime
from fastapi import FastAPI, BackgroundTasks, UploadFile, File, HTTPException
from pydantic import BaseModel
import pytesseract
import re
import shutil
from pathlib import Path
import mysql.connector as mc
import joblib
import pandas as pd
import tensorflow as tf

from fastapi.middleware.cors import CORSMiddleware

import pickle

from starlette.middleware.cors import CORSMiddleware


ip = "192.168.43.174"

# Load the trained neural network model
model = tf.keras.models.load_model("neural_net_price_model.h5")
model.compile(optimizer="adam", loss="mse", metrics=["mae"])


# Load scalers
scaler_X = joblib.load("scaler_X.pkl")
scaler_y = joblib.load("scaler_y.pkl")



def get_db_connection():
#     CREATE DATABASE fyp_aadhar;
# USE fyp_aadhar;

# CREATE TABLE aadhar_details (
#     id INT AUTO_INCREMENT PRIMARY KEY,
#     aadhar_number VARCHAR(14) NOT NULL UNIQUE,  -- Aadhar numbers are stored in the format "XXXX XXXX XXXX"
#     name VARCHAR(255) NOT NULL,
#     gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
#     dob varchar(20) NOT NULL,  
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );

# select * from aadhar_details;
    
    return mc.connect(host="127.0.0.1", user="root", passwd="1234567890", database="fyp_aadhar")


# FastAPI app
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://localhost:5174",   # Add new frontend port
    "http://127.0.0.1:5174"    # Add new frontend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Explicitly allow both ports
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Load known faces
known_face_encodings = []
known_face_names = []

# Create FAISS index (128-dimensional)
face_index = faiss.IndexFlatL2(128)

if not os.path.exists("faces"):
    os.makedirs("faces")

# Load all known faces
def load_faces():
    global known_face_encodings, known_face_names, face_index

    known_face_encodings = []
    known_face_names = []
    face_index = faiss.IndexFlatL2(128)  # Reset index

    for filename in os.listdir("faces"):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            name = os.path.splitext(filename)[0]
            img_path = os.path.join("faces", filename)
            img = face_recognition.load_image_file(img_path)
            encoding = face_recognition.face_encodings(img)

            if encoding:
                face_encoding = np.array(encoding[0], dtype=np.float32)
                face_index.add(np.expand_dims(face_encoding, axis=0))
                known_face_names.append(name)

# Load faces at startup
load_faces()
print(f"Loaded {len(known_face_names)} faces.")

attendance_file = "attendance.csv"
marked_attendance = set()

# Attendance model for FastAPI
class Attendance(BaseModel):
    name: str
    timestamp: str

# Threaded Video Capture Class
class VideoStream:
    def __init__(self, url):
        self.stream = cv2.VideoCapture(url)
        self.ret, self.frame = self.stream.read()
        self.stopped = False
        threading.Thread(target=self.update, args=()).start()

    def update(self):
        while not self.stopped:
            self.ret, self.frame = self.stream.read()

    def read(self):
        return self.ret, self.frame

    def stop(self):
        self.stopped = True
        self.stream.release()

# Function to handle face recognition
def run_face_recognition():
    # video_capture = VideoStream("http://"+ip+":8080/video")  # IP Webcam Stream URL
    video_capture = VideoStream(0)  # Use local camera

    
    frame_count = 0
    while True:
        ret, frame = video_capture.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % 10 != 0:  # Skip 9 out of 10 frames for efficiency
            continue

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Use Haar Cascade for faster face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)

        face_locations = []
        for (x, y, w, h) in faces:
            face_locations.append((y, x + w, y + h, x))

        if face_locations:
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations, model="small")

            for face_encoding, (top, right, bottom, left) in zip(face_encodings, face_locations):
                face_encoding = np.array(face_encoding, dtype=np.float32).reshape(1, -1)

                # Search using FAISS
                distances, indices = face_index.search(face_encoding, k=1)

                # Set a threshold for valid matches
                THRESHOLD = 0.3
                best_match_index = indices[0][0] if distances[0][0] < THRESHOLD else -1

                name = known_face_names[best_match_index] if best_match_index != -1 else "Unknown"

                # Mark attendance only once
                if name != "Unknown" and name not in marked_attendance:
                    marked_attendance.add(name)
                    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    with open(attendance_file, "a") as file:
                        csv.writer(file).writerow([name, now])
                    print(f"Attendance marked for {name}")

                # Draw rectangle and text on frame
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                cv2.putText(frame, name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        cv2.imshow("Face Recognition Attendance", frame)
        key = cv2.waitKey(1) & 0xFF

        # Quit on 'q' or window closed
        if key == ord('q') or cv2.getWindowProperty("Face Recognition Attendance", cv2.WND_PROP_VISIBLE) < 1:
            print("Closing recognition window.")
            break


    video_capture.stop()
    cv2.destroyAllWindows()


# Endpoint to get attendance data
@app.get("/attendance/", response_model=list[Attendance])
def get_attendance():
    attendance = []
    if os.path.exists(attendance_file):
        with open(attendance_file, "r") as file:
            rows = csv.reader(file)
            for row in rows:
                if row:
                    name, timestamp = row
                    attendance.append(Attendance(name=name, timestamp=timestamp))
    return attendance

# Endpoint to start face recognition in the background
@app.post("/start-recognition/")
async def start_face_recognition(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_face_recognition)  # Starts recognition in background
    return {"message": "Face recognition started in background."}

# Endpoint to add a new face
@app.post("/add-face/{name}/")
async def add_face(name: str):
    if not name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty!")

    # ip_camera_url = "http://"+ip+":8080/video"  # Replace with your phone's IP camera URL
    ip_camera_url = 0  # This uses the local default webcam



    video_capture = cv2.VideoCapture(ip_camera_url)
    if not video_capture.isOpened():
        raise HTTPException(status_code=500, detail="Failed to connect to phone camera. Check IP and port.")

    print(f"Press 's' to capture face for {name}, 'q' to cancel.")

    while True:
        ret, frame = video_capture.read()
        if not ret:
            continue  # Skip if no frame is read

        cv2.imshow("Add Face - Press 's' to Save or close window to cancel", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("s"):
            img_path = f"faces/{name}.jpg"
            cv2.imwrite(img_path, frame)
            print(f"Face saved: {img_path}")
            break
        elif key == ord("q"):
            print("Cancelled by user (pressed 'q').")
            video_capture.release()
            cv2.destroyAllWindows()
            raise HTTPException(status_code=400, detail="Face addition canceled by user.")

        # Detect window close using getWindowProperty
        if cv2.getWindowProperty("Add Face - Press 's' to Save or close window to cancel", cv2.WND_PROP_VISIBLE) < 1:
            print("Window closed by user.")
            video_capture.release()
            cv2.destroyAllWindows()
            raise HTTPException(status_code=400, detail="Face addition canceled by closing window.")


    video_capture.release()
    cv2.destroyAllWindows()

    # Encode and add to FAISS index
    img = face_recognition.load_image_file(img_path)
    encoding = face_recognition.face_encodings(img)

    if encoding:
        face_encoding = np.array(encoding[0], dtype=np.float32)
        face_index.add(np.expand_dims(face_encoding, axis=0))
        known_face_names.append(name)
        print(f"New face added: {name}")
    else:
        os.remove(img_path)  # Delete the image if no face is detected
        raise HTTPException(status_code=400, detail="No face detected in the image.")

    return {"message": f"Face for {name} added successfully!"}



pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


class AadharOCR:
    def __init__(self, img_path):
        self.img_path = img_path
        self.user_aadhar_no = ""
        self.user_gender = ""
        self.user_dob = ""
        self.user_name = ""

    def extract_data(self):
        """Extracts Aadhar details using OCR."""
        img = cv2.imread(self.img_path)
        text = pytesseract.image_to_string(img)
        text_list = [line.strip() for line in text.split("\n") if line.strip()]

        # Extract Aadhar Number
        aadhar_pattern = r'^\d{4}\s\d{4}\s\d{4}$'
        for line in text_list:
            if re.match(aadhar_pattern, line):
                self.user_aadhar_no = line
                break

        # Extract Gender
        for line in text_list:
            if re.search(r'(Male|male|MALE)$', line):
                self.user_gender = "MALE"
                break
            elif re.search(r'(Female|female|FEMALE)$', line):
                self.user_gender = "FEMALE"
                break

        # Extract Date of Birth
        dob_pattern = r'(Year|Birth|YoB|YOB|DOB):?\s?(\d{4}|\d{2}/\d{2}/\d{4})'
        for line in text_list:
            match = re.search(dob_pattern, line)
            if match:
                self.user_dob = match.group(2)
                break

        # Extract Name (Assuming it is the line before DOB)
        dob_index = next((i for i, line in enumerate(text_list) if re.search(dob_pattern, line)), None)
        if dob_index and dob_index > 0:
            self.user_name = text_list[dob_index - 1]

        return {
            "aadhar_number": self.user_aadhar_no,
            "gender": self.user_gender,
            "dob": self.user_dob,
            "name": self.user_name,
        }

# def commit_to_db(data):
#     """Inserts extracted Aadhar details into MySQL database."""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         query = "INSERT INTO aadhar_details (aadhar_number, gender, dob, name) VALUES (%s, %s, %s, %s)"
#         cursor.execute(query, (data["aadhar_number"], data["gender"], data["dob"], data["name"]))
#         conn.commit()
#         cursor.close()
#         conn.close()
#         return {"message": "Data successfully committed!"}
#     except mc.Error as err:
#         raise HTTPException(status_code=500, detail=f"Database Error: {err}")

@app.post("/extract-aadhar/")
async def extract_aadhar(file: UploadFile = File(...)):
    """Handles image upload, runs OCR, and saves extracted details."""
    file_path = Path(f"temp_{file.filename}")
    
    # Save uploaded file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run OCR
    aadhar_ocr = AadharOCR(str(file_path))
    extracted_data = aadhar_ocr.extract_data()

    # Remove temp file after processing
    file_path.unlink()

    if not extracted_data["aadhar_number"]:
        raise HTTPException(status_code=400, detail="Could not extract Aadhar details. Try a clearer image.")

    # Save to DB
    # commit_to_db(extracted_data)

    return {"status": "success", "data": extracted_data}



class PricePredictionRequest(BaseModel):
    occupancy: float
    bedcount: int
    room_type: str
    month: str
    
dummy_columns = ['room_type_Deluxe','room_type_Luxury','room_type_Sharing','room_type_Suite','month_August','month_December',
                 'month_February','month_January','month_July','month_June','month_March','month_May','month_November',
                 'month_October','month_September']

# Load the correct feature column order
feature_columns = joblib.load("feature_columns.pkl")


@app.post("/predict")
def predict_price(data: PricePredictionRequest):
    # Convert input data to DataFrame
    input_data = pd.DataFrame([data.model_dump()])  # Use model_dump() instead of .dict()

    # One-hot encode categorical variables
    input_data = pd.get_dummies(input_data, columns=["room_type", "month"])

    # Ensure all required columns exist
    for col in dummy_columns:
        if col not in input_data:
            input_data[col] = 0  # Add missing columns

    # **Reorder columns to match training data**
    input_data = input_data.reindex(columns=feature_columns, fill_value=0)

    # Normalize input data
    input_scaled = scaler_X.transform(input_data)

    # Predict price (normalized)
    predicted_price_scaled = model.predict(input_scaled)

    # Convert back to original scale
    predicted_price = scaler_y.inverse_transform(predicted_price_scaled)[0][0]

    return {"predicted_price": float(predicted_price)}


with open("sentiment_model.pkl", "rb") as model_file:
    classifier = pickle.load(model_file)

with open("tfidf_vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)
    
# Define request model
class ReviewRequest(BaseModel):
    review: str
    
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = text.split()
    return ' '.join(tokens)

@app.post("/sentiment/")
def predict_sentiment(request: ReviewRequest):
    """Predicts sentiment for a given review using the loaded model."""
    processed_review = preprocess_text(request.review)
    review_tfidf = vectorizer.transform([processed_review])
    
    # Predict sentiment
    prediction = classifier.predict(review_tfidf)[0]
    probabilities = classifier.predict_proba(review_tfidf)[0]
    
    sentiment = "Positive" if prediction == 1 else "Negative"
    confidence = max(probabilities) * 100  # Convert probability to percentage
    
    return {"sentiment": sentiment, "confidence": f"{confidence:.2f}%"}    
