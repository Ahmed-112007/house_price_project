import os
import json
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="House Price Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)

MODEL_PATH = os.path.join(BASE_DIR, "models", "house_price.pkl")
LOCATIONS_PATH = os.path.join(BASE_DIR, "models", "locations.json")

model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully with joblib!")
    except Exception as e:
        print(f"Error loading model: {e}")
class PredictionRequest(BaseModel):
    location: str
    carpet_area: float
    floor: int
    bathrooms: int
    balconies: int
    furnishing: str
    transaction: str
    ownership: str
    facing: str

@app.get("/")
def read_root():
    return {"message": "House Price Prediction API is Running!"}

@app.get("/locations")
def get_locations():
    if os.path.exists(LOCATIONS_PATH):
        try:
            with open(LOCATIONS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return {"locations": data}
                return data
        except Exception as e:
            print(f"Error reading locations.json: {e}")
    return {"locations": []}

@app.post("/predict")
def predict_price(data: PredictionRequest):
    if model is None:
        raise HTTPException(
            status_code=500, 
            detail="Model file not loaded."
        )
    
    try:

          
        input_data = pd.DataFrame([{
            'location': data.location,
            'location_clean': data.location,  
            'bedrooms': data.bathrooms,      
            'carpet_area': data.carpet_area,
            'floor': data.floor,
            'bathrooms': data.bathrooms,
            'balconies': data.balconies,
            'furnishing': data.furnishing,
            'transaction': data.transaction,
            'ownership': data.ownership,
            'facing': data.facing
        }])
        
        prediction = model.predict(input_data)[0]
        
        return {
            "status": "success",
            "predicted_price": round(float(prediction), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))