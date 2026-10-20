from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

MODEL_FILE = BASE_DIR / "models" / "thermal_conductivity_model.joblib"
HTML_FILE = BASE_DIR / "index.html"
CSS_FILE = BASE_DIR / "style.css"
JS_FILE = BASE_DIR / "script.js"


# --------------------------------------------------
# APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="JZRD ThermoPredict API",
    description="Trained ML model API for thermal conductivity estimation.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --------------------------------------------------
# LOAD TRAINED MODEL
# --------------------------------------------------

_model_bundle = None


def get_model_bundle():
    global _model_bundle

    if _model_bundle is None:
        if not MODEL_FILE.exists():
            raise HTTPException(
                status_code=500,
                detail="Trained model file not found.",
            )

        try:
            _model_bundle = joblib.load(MODEL_FILE)
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Could not load the trained model: {exc}",
            )

    return _model_bundle


# --------------------------------------------------
# FRONTEND ROUTES
# --------------------------------------------------

@app.get("/")
def home():
    if not HTML_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="index.html was not found in the repository root.",
        )

    return FileResponse(HTML_FILE, media_type="text/html")


@app.get("/style.css")
def styles():
    if not CSS_FILE.exists():
        raise HTTPException(status_code=404, detail="style.css not found.")

    return FileResponse(CSS_FILE, media_type="text/css")


@app.get("/script.js")
def scripts():
    if not JS_FILE.exists():
        raise HTTPException(status_code=404, detail="script.js not found.")

    return FileResponse(
        JS_FILE,
        media_type="application/javascript",
    )


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "application": "JZRD ThermoPredict",
        "model_file_exists": MODEL_FILE.exists(),
    }


# --------------------------------------------------
# INPUT VALIDATION
# --------------------------------------------------

class PredictionInput(BaseModel):
    Vf: float = Field(ge=0, le=1)
    omega: float = Field(ge=0, le=1)
    diameter: float = Field(gt=0)
    km: float = Field(gt=0)
    kf: float = Field(gt=0)
    Ri: float = Field(ge=0)


# --------------------------------------------------
# TRAINED MODEL PREDICTION
# --------------------------------------------------

@app.post("/predict")
def predict(data: PredictionInput):
    bundle = get_model_bundle()

    try:
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

        missing_features = [
            feature for feature in features
            if feature not in values
        ]

        if missing_features:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Model feature mapping is incomplete: "
                    + ", ".join(missing_features)
                ),
            )

        input_df = pd.DataFrame(
            [[values[feature] for feature in features]],
            columns=features,
        )

        prediction = float(model.predict(input_df)[0])

        return {
            "status": "success",
            "prediction": prediction,
            "model": bundle.get(
                "model_name",
                "Saved regression model",
            ),
            "warning": (
                "Research estimate only; not an experimental measurement. "
                "The current model does not support temperature-dependent predictions."
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {exc}",
        )


