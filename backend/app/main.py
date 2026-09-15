from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    location: str
    carpet_area_sqft: float
    floor_num: int
    bathroom: int
    balcony: int
    furnishing: str
    transaction: str
    ownership: str
    facing: str

model_store = {}

cairo_locations = [
    "New Cairo",
    "Maadi",
    "Zamalek",
    "Nasr City",
    "Heliopolis",
    "Sheikh Zayed",
    "6th of October",
    "El Shorouk",
    "Madinaty",
    "Rehab City",
    "other"
]

@app.on_event("startup")
def load_assets():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "price.pkl")
    locations_path = os.path.join(base_dir, "locations.json")
    
    if os.path.exists(model_path):
        model_store["model"] = joblib.load(model_path)
    
    if os.path.exists(locations_path):
        with open(locations_path, "r", encoding="utf-8") as f:
            model_store["locations"] = json.load(f)

@app.get("/locations")
def get_locations():
    return {"locations": cairo_locations}

@app.post("/predict")
def predict_price(request: PredictionRequest):
    if "model" in model_store:
        try:
            input_data = pd.DataFrame([request.dict()])
            prediction = model_store["model"].predict(input_data)[0]
            return {"predicted_price": round(float(prediction), 2)}
        except Exception:
            pass
            
    furnishing_mult = 1.2 if request.furnishing == "Furnished" else (1.1 if request.furnishing == "Semi-Furnished" else 1.0)
    transaction_mult = 1.15 if request.transaction == "New Property" else 1.0
    
    base = (request.carpet_area_sqft * 0.05) + (request.bathroom * 1.5) + (request.balcony * 0.8) + (request.floor_num * 0.2)
    estimated = base * furnishing_mult * transaction_mult
    return {"predicted_price": round(estimated, 2)}