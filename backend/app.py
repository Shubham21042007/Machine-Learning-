from __future__ import annotations

import copy
import os
import re
from collections import defaultdict

import numpy as np
import pandas as pd
import shap
import xgboost as xgb
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="LASI Multi-Disease Prediction API",
    version="1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")


# =========================================================
# FEATURE LABELS
# =========================================================

FEATURE_LABELS = {
    "residence": "Residence",
    "dm003": "Sex",
    "dm005": "Age",
    "dm008": "Education",
    "dm021": "Marital Status",
    "we027_main": "Main Occupation",
    "hb001": "Tobacco Use",
    "hb101": "Alcohol Use",
    "hb211": "Vigorous Physical Activity",
    "hb213": "Moderate Physical Activity",
    "fs507": "Outdoor Games / Sports / Exercise / Yoga",
    "bm017": "Systolic Blood Pressure",
    "bm018": "Diastolic Blood Pressure",
    "bm019": "Pulse Rate",
    "bm028": "Grip Strength Left",
    "bm029": "Grip Strength Right",
    "bm030": "Grip Strength Left (2)",
    "bm031": "Grip Strength Right (2)",
    "bm056": "Timed Walk 1",
    "bm057": "Timed Walk 2",
    "bm061": "Distance Vision Left",
    "bm062": "Distance Vision Right",
    "bm063": "Near Vision Left",
    "bm064": "Near Vision Right",
    "bm067": "Height",
    "bm071": "Weight",
    "bm076": "Waist Circumference",
    "bm079": "Hip Circumference",
    "ht001_a": "Overall Health",
    "ht212": "Chest Pain or Discomfort",
    "ht219": "Sleep Question 1",
    "ht220": "Sleep Question 2",
    "ht221": "Sleep Question 3",
    "ht222": "Sleep Question 4",
    "ht225": "Often Troubled by Pain",
    "ht229s1": "Pain / Stiffness in Joints",
    "ht229s2": "Persistent Swelling in Feet / Ankles",
    "ht229s3": "Shortness of Breath While Awake",
    "ht229s4": "Persistent Dizziness / Light-headedness",
    "ht229s5": "Back Pain / Problem",
    "ht229s6": "Persistent Headaches",
    "ht229s7": "Severe Fatigue / Exhaustion",
    "ht229s8": "Wheezing / Whistling From Chest",
    "ht229s9": "Cough With or Without Phlegm",
}


CATEGORY_LABELS = {
    "hb001": {1: "Yes", 2: "No"},
    "hb101": {1: "Yes", 2: "No"},
    "hb211": {
        1: "Every Day",
        2: "More Than Once a Week",
        3: "Once a Week",
        4: "One to Three Times a Month",
        5: "Hardly Ever or Never",
    },
    "hb213": {
        1: "Every Day",
        2: "More Than Once a Week",
        3: "Once a Week",
        4: "One to Three Times a Month",
        5: "Hardly Ever or Never",
    },
    "fs507": {
        1: "Daily",
        2: "Several Times a Week",
        3: "Once a Week",
        4: "Several Times a Month",
        5: "At Least Once a Month",
        6: "Rarely / Once in a Year",
        7: "Never / Not Relevant",
    },
}


MODIFIABLE_FIELDS = ["hb001", "hb101", "hb211", "hb213", "fs507"]
IMMUTABLE_FIELDS = [
    "residence",
    "dm003",
    "dm005",
    "dm008",
    "dm021",
    "bm017",
    "bm018",
    "bm019",
    "bm028",
    "bm029",
    "bm030",
    "bm031",
    "bm056",
    "bm057",
    "bm061",
    "bm062",
    "bm063",
    "bm064",
    "bm067",
    "bm071",
    "bm076",
    "bm079",
    "ht001_a",
    "ht212",
    "ht219",
    "ht220",
    "ht221",
    "ht222",
    "ht225",
    "ht229s1",
    "ht229s2",
    "ht229s3",
    "ht229s4",
    "ht229s5",
    "ht229s6",
    "ht229s7",
    "ht229s8",
    "ht229s9",
    "we027_main",
]


# =========================================================
# LOAD PREPROCESSOR
# =========================================================

print("Loading preprocessor...")

preprocessor = joblib.load(
    os.path.join(MODEL_DIR, "preprocessor.pkl")
)

print("Preprocessor loaded.")


# =========================================================
# LOAD CALIBRATORS
# =========================================================

calibrators = joblib.load(
    os.path.join(MODEL_DIR, "calibrators.pkl")
)

print("Calibrators loaded.")


# =========================================================
# LOAD THRESHOLDS
# =========================================================

thresholds = joblib.load(
    os.path.join(MODEL_DIR, "thresholds.pkl")
)

print("Thresholds loaded.")


# =========================================================
# LOAD DISEASE NAMES
# =========================================================

disease_names = joblib.load(
    os.path.join(MODEL_DIR, "disease_names.pkl")
)

print("Diseases:", disease_names)


# =========================================================
# LOAD MODEL INFORMATION
# =========================================================

model_info = joblib.load(
    os.path.join(MODEL_DIR, "model_info.pkl")
)


# =========================================================
# LOAD MODELS
# =========================================================

models = {}

for disease in disease_names:

    if disease == "depression":
        print("Skipping depression.pkl - using .keras model")
        continue

    info = model_info[disease]

    if info["type"] == "xgboost":
        model_path = os.path.join(MODEL_DIR, info["file"])
        model = xgb.XGBClassifier()
        model.load_model(model_path)
        models[disease] = model
        print("Loaded XGBoost:", disease)
    else:
        model_path = os.path.join(MODEL_DIR, info["file"])
        model = joblib.load(model_path)
        models[disease] = model
        print("Loaded sklearn model:", disease)


# =========================================================
# DEPRESSION MODEL
# =========================================================

depression_model = None


def load_depression_model():
    global depression_model

    if depression_model is None:
        from tensorflow import keras

        print("Loading depression neural network...")
        depression_model = keras.models.load_model(
            os.path.join(MODEL_DIR, "depression_model.keras"),
            compile=False
        )
        print("Depression model loaded.")

    return depression_model


# =========================================================
# INPUT FORMAT
# =========================================================

class PatientData(BaseModel):
    data: dict


# =========================================================
# HELPERS
# =========================================================

def prepare_input_frame(data_dict):
    input_data = pd.DataFrame([data_dict])
    return input_data.reindex(columns=preprocessor.feature_names_in_)


def model_probability_for_disease(disease, data_dict):
    input_data = prepare_input_frame(data_dict)
    processed_data = preprocessor.transform(input_data)

    if disease == "depression":
        model = load_depression_model()
        raw_probability = float(model.predict(processed_data, verbose=0)[0][0])
    else:
        model = models[disease]
        raw_probability = float(model.predict_proba(processed_data)[0, 1])

    raw_probability = np.clip(raw_probability, 1e-7, 1 - 1e-7)
    logit_value = np.log(raw_probability / (1 - raw_probability))
    calibrated_probability = calibrators[disease].predict_proba(np.array([[logit_value]]))[0, 1]
    return float(calibrated_probability)


def normalized_feature_name(name):
    if name is None:
        return ""

    value = str(name)
    value = value.replace("cat__", "").replace("remainder__", "").replace("num__", "")
    value = value.split("__")[-1]
    value = re.sub(r"_\d+(?:\.\d+)?$", "", value)
    return value


def humanize_feature_name(raw_name):
    normalized = normalized_feature_name(raw_name)
    if normalized in FEATURE_LABELS:
        return FEATURE_LABELS[normalized]

    cleaned = normalized.replace("_", " ")
    return " ".join(part.capitalize() for part in cleaned.split())


def _extract_shap_values(explainer_output):
    if hasattr(explainer_output, "values"):
        values = np.asarray(explainer_output.values)
        if values.ndim == 3 and values.shape[-1] > 1:
            return values[0, :, 1]
        if values.ndim == 3:
            return values[0, :, 0]
        if values.ndim == 2 and values.shape[0] == 1:
            return values[0]
        return values

    if isinstance(explainer_output, list):
        if len(explainer_output) == 2:
            return np.asarray(explainer_output[1])
        return np.asarray(explainer_output[0])

    values = np.asarray(explainer_output)

    if values.ndim == 3 and values.shape[-1] > 1:
        return values[0, :, 1]

    if values.ndim == 3:
        return values[0, :, 0]

    if values.ndim == 2 and values.shape[0] == 1:
        return values[0]

    return values


def _linear_model_shap_values(model, processed_data):
    if hasattr(model, "estimators_") and len(model.estimators_) > 0:
        estimator = model.estimators_[0]
    else:
        estimator = getattr(model, "estimator", model)

    if not hasattr(estimator, "coef_"):
        return None

    coef = np.asarray(estimator.coef_)
    if coef.ndim == 2 and coef.shape[0] == 1:
        coef = coef[0]
    elif coef.ndim == 2 and coef.shape[1] > 1:
        coef = coef[0]

    transformed_row = np.asarray(processed_data)[0]
    return np.asarray(coef) * transformed_row


def generate_shap_for_disease(disease, data_dict):
    input_data = prepare_input_frame(data_dict)
    processed_data = preprocessor.transform(input_data)

    try:
        if disease == "depression":
            model = load_depression_model()
            explainer = shap.DeepExplainer(model, processed_data)
            shap_values = explainer.shap_values(processed_data)
            values = _extract_shap_values(shap_values)
        elif (
            hasattr(models[disease], "estimators_")
            and len(models[disease].estimators_) > 0
            and hasattr(models[disease].estimators_[0], "coef_")
        ):
            values = _linear_model_shap_values(models[disease], processed_data)
        elif hasattr(models[disease], "get_booster") or isinstance(models[disease], xgb.XGBClassifier):
            model = models[disease]
            explainer = shap.Explainer(model, processed_data)
            shap_values = explainer(processed_data)
            values = _extract_shap_values(shap_values)
        else:
            model = getattr(models[disease], "estimator", models[disease])
            explainer = shap.Explainer(model, processed_data)
            shap_values = explainer(processed_data)
            values = _extract_shap_values(shap_values)

        transformed_feature_names = list(preprocessor.get_feature_names_out())
        sample_values = np.asarray(values).reshape(-1)

        if len(sample_values) != len(transformed_feature_names):
            sample_values = np.asarray(values)[0].reshape(-1)

        if len(sample_values) != len(transformed_feature_names):
            if np.asarray(values).ndim > 1:
                sample_values = np.asarray(values).reshape(len(transformed_feature_names), -1).mean(axis=1)
            else:
                sample_values = np.asarray(values)

        if len(sample_values) != len(transformed_feature_names):
            sample_values = np.asarray(values).reshape(len(transformed_feature_names), -1).sum(axis=1)

        if len(sample_values) != len(transformed_feature_names):
            sample_values = np.asarray(values[:len(transformed_feature_names)])

        aggregated = defaultdict(float)
        for feature_name, contribution in zip(transformed_feature_names, sample_values):
            root_name = normalized_feature_name(feature_name)
            if root_name:
                aggregated[root_name] += float(contribution)

        ordered = sorted(
            aggregated.items(),
            key=lambda item: abs(item[1]),
            reverse=True
        )[:5]

        features = []
        for raw_name, contribution in ordered:
            value = data_dict.get(raw_name)
            if value is None:
                value = 0

            direction = "Higher risk" if contribution > 0 else "Lower risk"
            features.append({
                "feature": raw_name,
                "label": humanize_feature_name(raw_name),
                "value": value,
                "shap_value": float(contribution),
                "direction": direction,
            })

        if not features:
            for feature_name, contribution in zip(transformed_feature_names, sample_values):
                root_name = normalized_feature_name(feature_name)
                if root_name:
                    value = data_dict.get(root_name)
                    if value is None:
                        continue
                    features.append({
                        "feature": root_name,
                        "label": humanize_feature_name(root_name),
                        "value": value,
                        "shap_value": float(contribution),
                        "direction": "Higher risk" if contribution > 0 else "Lower risk",
                    })

        features = sorted(features, key=lambda item: abs(item["shap_value"]), reverse=True)[:5]

        return {
            "disease": disease,
            "features": features,
        }

    except Exception:
        return {
            "disease": disease,
            "features": [],
        }


def allowed_counterfactual_values(field_name, current_value):
    current_value = int(current_value)

    if field_name in ("hb001", "hb101"):
        if current_value == 1:
            return [2]
        return []

    if field_name in ("hb211", "hb213"):
        return [value for value in range(1, current_value) if value >= 1]

    if field_name == "fs507":
        return [value for value in range(1, current_value) if value >= 1]

    return []


def format_change_text(field_name, before_value, after_value):
    if field_name in ("hb001", "hb101"):
        before_label = CATEGORY_LABELS[field_name].get(int(before_value), str(before_value))
        after_label = CATEGORY_LABELS[field_name].get(int(after_value), str(after_value))
        return f"{FEATURE_LABELS[field_name]}: {before_label} → {after_label}"

    if field_name in ("hb211", "hb213", "fs507"):
        before_label = CATEGORY_LABELS[field_name].get(int(before_value), str(before_value))
        after_label = CATEGORY_LABELS[field_name].get(int(after_value), str(after_value))
        return f"{FEATURE_LABELS[field_name]}: {before_label} → {after_label}"

    return f"{FEATURE_LABELS.get(field_name, field_name)}: {before_value} → {after_value}"


def generate_counterfactual_for_disease(disease, patient_data):
    original_probability = model_probability_for_disease(disease, patient_data)
    base_value = copy.deepcopy(patient_data)
    best_result = None

    def candidate_score(candidate_changes, modified_values):
        probability_after = model_probability_for_disease(disease, modified_values)
        reduction = original_probability - probability_after
        if reduction <= 0:
            return None
        return {
            "probability_after": probability_after,
            "reduction": reduction,
            "changes": candidate_changes,
        }

    field_order = MODIFIABLE_FIELDS
    for field_name in field_order:
        for target_value in allowed_counterfactual_values(field_name, base_value.get(field_name, 0)):
            modified = copy.deepcopy(base_value)
            modified[field_name] = int(target_value)
            changes = [(field_name, int(base_value.get(field_name, 0)), int(target_value))]
            score = candidate_score(changes, modified)
            if score is not None:
                if best_result is None or score["reduction"] > best_result["reduction"]:
                    best_result = {**score, "modified": modified}

    for idx, first_field in enumerate(field_order):
        for second_field in field_order[idx + 1:]:
            first_values = allowed_counterfactual_values(first_field, base_value.get(first_field, 0))
            second_values = allowed_counterfactual_values(second_field, base_value.get(second_field, 0))

            for first_value in first_values:
                for second_value in second_values:
                    modified = copy.deepcopy(base_value)
                    modified[first_field] = int(first_value)
                    modified[second_field] = int(second_value)
                    changes = [
                        (first_field, int(base_value.get(first_field, 0)), int(first_value)),
                        (second_field, int(base_value.get(second_field, 0)), int(second_value)),
                    ]
                    score = candidate_score(changes, modified)
                    if score is not None:
                        if best_result is None or score["reduction"] > best_result["reduction"]:
                            best_result = {**score, "modified": modified}

    if best_result is None:
        return {
            "disease": disease,
            "counterfactual_found": False,
            "original_probability": float(original_probability),
            "new_probability": float(original_probability),
            "reduction": 0.0,
            "number_of_changes": 0,
            "changes": [],
        }

    best_changes = []
    for field_name, before_value, after_value in best_result["changes"]:
        best_changes.append(format_change_text(field_name, before_value, after_value))

    return {
        "disease": disease,
        "counterfactual_found": True,
        "original_probability": float(original_probability),
        "new_probability": float(best_result["probability_after"]),
        "reduction": float(best_result["reduction"]),
        "number_of_changes": len(best_result["changes"]),
        "changes": best_changes,
    }


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "LASI Multi-Disease Prediction API is running",
        "diseases": len(disease_names)
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "diseases": len(disease_names)
    }


# =========================================================
# PREDICTION
# =========================================================

@app.post("/predict")
def predict(patient: PatientData):
    input_data = prepare_input_frame(patient.data)
    processed_data = preprocessor.transform(input_data)

    predictions = {}

    for disease in disease_names:
        predictions[disease] = model_probability_for_disease(disease, patient.data)

    sorted_predictions = sorted(predictions.items(), key=lambda item: item[1], reverse=True)

    top5 = [
        {"disease": disease, "probability": float(probability)}
        for disease, probability in sorted_predictions[:5]
    ]

    rare_diseases = [
        "cancer",
        "chronic_renal_failure",
        "dementia",
        "depression",
        "glaucoma",
        "stroke",
    ]

    rare_alerts = []
    for disease in rare_diseases:
        probability = predictions[disease]
        threshold = float(thresholds[disease])
        if probability >= threshold:
            rare_alerts.append({
                "disease": disease,
                "probability": float(probability),
                "threshold": threshold,
            })

    highest_disease = sorted_predictions[0][0]
    highest_probability = sorted_predictions[0][1]

    shap_explanation = generate_shap_for_disease(highest_disease, patient.data)
    counterfactual = generate_counterfactual_for_disease(highest_disease, patient.data)

    return {
        "predictions": predictions,
        "top5": top5,
        "rare_alerts": rare_alerts,
        "highest_risk": {
            "disease": highest_disease,
            "probability": float(highest_probability),
        },
        "shap": shap_explanation,
        "counterfactual": counterfactual,
        "message": "These are model-based risk estimates, not medical diagnoses.",
    }