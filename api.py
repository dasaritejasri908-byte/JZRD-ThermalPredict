from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).parent
MODEL_FILE = BASE_DIR / "models" / "thermal_conductivity_model.joblib"

app = FastAPI(title="JZRD ThermoPredict API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class PredictionInput(BaseModel):
    Vf: float = Field(ge=0, le=1)
    omega: float = Field(ge=0, le=1)
    diameter: float = Field(gt=0)
    km: float = Field(gt=0)
    kf: float = Field(gt=0)
    Ri: float = Field(ge=0)


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/predict")
def predict(data: PredictionInput):
    if not MODEL_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Trained model file was not found."
        )

    try:
        bundle = joblib.load(MODEL_FILE)
        model = bundle["model"]
        features = bundle["features"]

        values = {
            "Vf": data.Vf,
            "ω": data.omega,
            "2r": data.diameter,
            "km": data.km,
            "kf": data.kf,
            "Ri": data.Ri,
        }

        input_df = pd.DataFrame(
            [[values[feature] for feature in features]],
            columns=features,
        )

        prediction = float(model.predict(input_df)[0])

        return {
            "status": "success",
            "prediction": prediction,
            "model": bundle.get("model_name", "Saved ExtraTrees model"),
            "warning": (
                "Research estimate only; not an experimental measurement. "
                "The model does not support temperature-dependent predictions."
            ),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {exc}",
        )
