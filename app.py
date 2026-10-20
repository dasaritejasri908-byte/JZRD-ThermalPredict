import streamlit as st
import pandas as pd
import joblib
import matplotlib.pyplot as plt
from pathlib import Path

BASE_DIR = Path(__file__).parent
MODEL_FILE = BASE_DIR / "models" / "thermal_conductivity_model.joblib"
VALIDATION_FILE = BASE_DIR / "grouped_validation_predictions.csv"

st.set_page_config(
    page_title="JZRD ThermalPredict",
    page_icon="🔬",
    layout="wide"
)


@st.cache_resource
def load_model():
    return joblib.load(MODEL_FILE)


st.title("JZRD ThermalPredict")
st.subheader("Machine Learning Assisted Thermal Conductivity Estimation")

st.write(
    "Estimate composite thermal conductivity using material properties "
    "and a trained ExtraTrees regression model."
)

st.warning(
    "Research prototype. Predictions are estimates, not experimental "
    "measurements. The current model does not support temperature-dependent "
    "predictions."
)

if not MODEL_FILE.exists():
    st.error("Model file not found. Check the models folder.")
    st.stop()

bundle = load_model()
model = bundle["model"]
features = bundle["features"]

st.divider()
st.header("Enter Material Properties")

with st.form("prediction_form"):
    col1, col2 = st.columns(2)

    with col1:
        vf = st.number_input(
            "Filler volume fraction (Vf)",
            min_value=0.0,
            max_value=1.0,
            value=0.03
        )

        omega = st.number_input(
            "Filler weight fraction (omega)",
            min_value=0.0,
            max_value=1.0,
            value=0.04
        )

        particle_diameter = st.number_input(
            "Particle diameter (2r, metres)",
            min_value=0.0,
            value=0.000002,
            format="%.8f"
        )

    with col2:
        km = st.number_input(
            "Matrix thermal conductivity (km)",
            min_value=0.0,
            value=0.27
        )

        kf = st.number_input(
            "Filler thermal conductivity (kf)",
            min_value=0.0,
            value=60.0
        )

        ri = st.number_input(
            "Interfacial thermal resistance (Ri)",
            min_value=0.0,
            value=0.00000094,
            format="%.10f"
        )

    submitted = st.form_submit_button("Predict Thermal Conductivity")

if submitted:
    values = {
        "Vf": vf,
        "ω": omega,
        "2r": particle_diameter,
        "km": km,
        "kf": kf,
        "Ri": ri
    }

    input_df = pd.DataFrame([values], columns=features)
    prediction = float(model.predict(input_df)[0])

    st.divider()
    st.header("Prediction Result")
    st.metric("Estimated thermal conductivity (ka)", f"{prediction:.4f}")

    st.caption(f"Model: {bundle.get('model_name', 'Saved regression model')}")

    st.info(
        "This is an estimate from the trained model, not a measured "
        "experimental value."
    )

st.divider()
st.header("Model Validation")

if VALIDATION_FILE.exists():
    results = pd.read_csv(VALIDATION_FILE)

    if {"Actual_ka", "Predicted_ka"}.issubset(results.columns):
        fig, ax = plt.subplots()

        ax.scatter(results["Actual_ka"], results["Predicted_ka"])

        low = min(
            results["Actual_ka"].min(),
            results["Predicted_ka"].min()
        )
        high = max(
            results["Actual_ka"].max(),
            results["Predicted_ka"].max()
        )

        ax.plot([low, high], [low, high], linestyle="--")
        ax.set_xlabel("Actual ka")
        ax.set_ylabel("Predicted ka")
        ax.set_title("Actual vs Predicted - Held-out Material Systems")

        st.pyplot(fig)
        plt.close(fig)
else:
    st.info("Validation graph is not available yet.")

st.caption("JZRD ThermalPredict | Research prototype")