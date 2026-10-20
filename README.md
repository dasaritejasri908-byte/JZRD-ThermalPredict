# JZRD ThermalPredict

## Machine Learning-Assisted Thermal Conductivity Estimation

JZRD ThermalPredict is a research prototype that estimates the thermal conductivity of polymer composites using a trained ExtraTrees regression model.

**Live Demo:** https://jzrd-thermalpredict-teju.streamlit.app/

## Project Overview

This project combines machine learning with an interactive web application to explore thermal conductivity estimation from material properties.

## Features

* Interactive material-property inputs
* ExtraTrees regression model
* Model-validation visualizations
* Streamlit-based interface

## Technology Stack

* Python
* Scikit-learn
* Pandas and NumPy
* Matplotlib
* Streamlit
* Joblib

## Model Workflow

1. Prepare the available material dataset.
2. Process the input features.
3. Train the regression model.
4. Save and load the trained model.
5. Generate thermal conductivity estimates.
6. Review the available validation results.

## Limitations

Predictions are computational estimates, not experimental measurements. The current model does not support temperature-dependent predictions. Model reliability depends on the dataset and validation methodology.

## Disclaimer

This project is intended for research and educational exploration. Predictions should not replace experimental measurements or validated engineering analysis.

