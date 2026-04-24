#!/usr/bin/env python3
"""
Professional ML Model Training Pipeline
Trains models with proper validation, cross-validation, and hyperparameter tuning
"""

import json
import pickle
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, confusion_matrix, classification_report
)
import warnings
warnings.filterwarnings('ignore')

output_dir = Path("trained_models")
output_dir.mkdir(exist_ok=True)

print("=" * 80)
print("PROFESSIONAL ML MODEL TRAINING PIPELINE")
print("=" * 80)

# ============================================================================
# 1. PHISHING DETECTION MODEL
# ============================================================================
print("\n[PHISHING DETECTION] Training advanced phishing detection model...")
print("-" * 80)

with open('processed_datasets/phishing_features.json', 'r') as f:
    phishing_data = json.load(f)

# Prepare data
X_phishing = np.array([[d[k] for k in d.keys() if k != 'label'] for d in phishing_data])
y_phishing = np.array([d['label'] for d in phishing_data])
feature_names_phishing = [k for k in phishing_data[0].keys() if k != 'label']

print(f"  Dataset size: {len(X_phishing)} samples")
print(f"  Features: {len(feature_names_phishing)}")
print(f"  Class distribution: {np.bincount(y_phishing)}")

# Split data
X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(
    X_phishing, y_phishing, test_size=0.2, random_state=42, stratify=y_phishing
)

# Scale features
scaler_p = StandardScaler()
X_train_p_scaled = scaler_p.fit_transform(X_train_p)
X_test_p_scaled = scaler_p.transform(X_test_p)

# Train Random Forest with hyperparameter tuning
print("\n  Training Random Forest with hyperparameter tuning...")
param_grid_p = {
    'n_estimators': [100, 200],
    'max_depth': [10, 15, 20],
    'min_samples_split': [5, 10],
    'min_samples_leaf': [2, 4]
}

rf_p = RandomForestClassifier(random_state=42, n_jobs=-1)
grid_search_p = GridSearchCV(rf_p, param_grid_p, cv=5, scoring='f1', n_jobs=-1)
grid_search_p.fit(X_train_p_scaled, y_train_p)

best_model_p = grid_search_p.best_estimator_
print(f"  Best parameters: {grid_search_p.best_params_}")

# Evaluate
y_pred_p = best_model_p.predict(X_test_p_scaled)
y_pred_proba_p = best_model_p.predict_proba(X_test_p_scaled)[:, 1]

accuracy_p = accuracy_score(y_test_p, y_pred_p)
precision_p = precision_score(y_test_p, y_pred_p)
recall_p = recall_score(y_test_p, y_pred_p)
f1_p = f1_score(y_test_p, y_pred_p)
auc_p = roc_auc_score(y_test_p, y_pred_proba_p)

print(f"\n  Model Performance:")
print(f"    Accuracy:  {accuracy_p:.4f}")
print(f"    Precision: {precision_p:.4f}")
print(f"    Recall:    {recall_p:.4f}")
print(f"    F1-Score:  {f1_p:.4f}")
print(f"    ROC-AUC:   {auc_p:.4f}")
print(f"\n  Classification Report:")
print(classification_report(y_test_p, y_pred_p, target_names=['Legitimate', 'Phishing']))

# Cross-validation
cv_scores_p = cross_val_score(best_model_p, X_train_p_scaled, y_train_p, cv=5, scoring='f1')
print(f"  Cross-validation F1 scores: {cv_scores_p}")
print(f"  Mean CV F1: {cv_scores_p.mean():.4f} (+/- {cv_scores_p.std():.4f})")

# Save model
model_data_p = {
    'model': best_model_p,
    'scaler': scaler_p,
    'feature_names': feature_names_phishing,
    'metrics': {
        'accuracy': accuracy_p,
        'precision': precision_p,
        'recall': recall_p,
        'f1': f1_p,
        'auc': auc_p,
        'cv_mean': cv_scores_p.mean(),
        'cv_std': cv_scores_p.std()
    }
}

with open(output_dir / 'phishing_model.pkl', 'wb') as f:
    pickle.dump(model_data_p, f)
print(f"\n  ✓ Model saved to {output_dir / 'phishing_model.pkl'}")

# ============================================================================
# 2. PASSWORD STRENGTH MODEL
# ============================================================================
print("\n[PASSWORD STRENGTH] Training password strength evaluation model...")
print("-" * 80)

with open('processed_datasets/password_features.json', 'r') as f:
    password_data = json.load(f)

# Prepare data
X_password = np.array([[d[k] for k in d.keys() if k != 'label'] for d in password_data])
y_password = np.array([d['label'] for d in password_data])
feature_names_password = [k for k in password_data[0].keys() if k != 'label']

print(f"  Dataset size: {len(X_password)} samples")
print(f"  Features: {len(feature_names_password)}")
print(f"  Class distribution: {np.bincount(y_password)}")

# Split data
X_train_pwd, X_test_pwd, y_train_pwd, y_test_pwd = train_test_split(
    X_password, y_password, test_size=0.2, random_state=42, stratify=y_password
)

# Scale features
scaler_pwd = StandardScaler()
X_train_pwd_scaled = scaler_pwd.fit_transform(X_train_pwd)
X_test_pwd_scaled = scaler_pwd.transform(X_test_pwd)

# Train Gradient Boosting
print("\n  Training Gradient Boosting Classifier...")
param_grid_pwd = {
    'n_estimators': [100, 200],
    'learning_rate': [0.05, 0.1],
    'max_depth': [5, 7],
    'min_samples_split': [5, 10]
}

gb_pwd = GradientBoostingClassifier(random_state=42)
grid_search_pwd = GridSearchCV(gb_pwd, param_grid_pwd, cv=5, scoring='f1', n_jobs=-1)
grid_search_pwd.fit(X_train_pwd_scaled, y_train_pwd)

best_model_pwd = grid_search_pwd.best_estimator_
print(f"  Best parameters: {grid_search_pwd.best_params_}")

# Evaluate
y_pred_pwd = best_model_pwd.predict(X_test_pwd_scaled)
y_pred_proba_pwd = best_model_pwd.predict_proba(X_test_pwd_scaled)[:, 1]

accuracy_pwd = accuracy_score(y_test_pwd, y_pred_pwd)
precision_pwd = precision_score(y_test_pwd, y_pred_pwd)
recall_pwd = recall_score(y_test_pwd, y_pred_pwd)
f1_pwd = f1_score(y_test_pwd, y_pred_pwd)
auc_pwd = roc_auc_score(y_test_pwd, y_pred_proba_pwd)

print(f"\n  Model Performance:")
print(f"    Accuracy:  {accuracy_pwd:.4f}")
print(f"    Precision: {precision_pwd:.4f}")
print(f"    Recall:    {recall_pwd:.4f}")
print(f"    F1-Score:  {f1_pwd:.4f}")
print(f"    ROC-AUC:   {auc_pwd:.4f}")
print(f"\n  Classification Report:")
print(classification_report(y_test_pwd, y_pred_pwd, target_names=['Weak', 'Strong']))

# Cross-validation
cv_scores_pwd = cross_val_score(best_model_pwd, X_train_pwd_scaled, y_train_pwd, cv=5, scoring='f1')
print(f"  Cross-validation F1 scores: {cv_scores_pwd}")
print(f"  Mean CV F1: {cv_scores_pwd.mean():.4f} (+/- {cv_scores_pwd.std():.4f})")

# Save model
model_data_pwd = {
    'model': best_model_pwd,
    'scaler': scaler_pwd,
    'feature_names': feature_names_password,
    'metrics': {
        'accuracy': accuracy_pwd,
        'precision': precision_pwd,
        'recall': recall_pwd,
        'f1': f1_pwd,
        'auc': auc_pwd,
        'cv_mean': cv_scores_pwd.mean(),
        'cv_std': cv_scores_pwd.std()
    }
}

with open(output_dir / 'password_model.pkl', 'wb') as f:
    pickle.dump(model_data_pwd, f)
print(f"\n  ✓ Model saved to {output_dir / 'password_model.pkl'}")

# ============================================================================
# 3. VULNERABILITY DETECTION MODEL
# ============================================================================
print("\n[VULNERABILITY DETECTION] Training vulnerability detection model...")
print("-" * 80)

with open('processed_datasets/vulnerability_features.json', 'r') as f:
    vulnerability_data = json.load(f)

# Prepare data
X_vuln = np.array([[d[k] for k in d.keys() if k != 'label'] for d in vulnerability_data])
y_vuln = np.array([d['label'] for d in vulnerability_data])
feature_names_vuln = [k for k in vulnerability_data[0].keys() if k != 'label']

print(f"  Dataset size: {len(X_vuln)} samples")
print(f"  Features: {len(feature_names_vuln)}")
print(f"  Class distribution: {np.bincount(y_vuln)}")

# Split data
X_train_v, X_test_v, y_train_v, y_test_v = train_test_split(
    X_vuln, y_vuln, test_size=0.2, random_state=42, stratify=y_vuln
)

# Scale features
scaler_v = StandardScaler()
X_train_v_scaled = scaler_v.fit_transform(X_train_v)
X_test_v_scaled = scaler_v.transform(X_test_v)

# Train Random Forest
print("\n  Training Random Forest Classifier...")
param_grid_v = {
    'n_estimators': [100, 200],
    'max_depth': [10, 15],
    'min_samples_split': [5, 10],
    'min_samples_leaf': [2, 4]
}

rf_v = RandomForestClassifier(random_state=42, n_jobs=-1)
grid_search_v = GridSearchCV(rf_v, param_grid_v, cv=5, scoring='f1', n_jobs=-1)
grid_search_v.fit(X_train_v_scaled, y_train_v)

best_model_v = grid_search_v.best_estimator_
print(f"  Best parameters: {grid_search_v.best_params_}")

# Evaluate
y_pred_v = best_model_v.predict(X_test_v_scaled)
y_pred_proba_v = best_model_v.predict_proba(X_test_v_scaled)[:, 1]

accuracy_v = accuracy_score(y_test_v, y_pred_v)
precision_v = precision_score(y_test_v, y_pred_v)
recall_v = recall_score(y_test_v, y_pred_v)
f1_v = f1_score(y_test_v, y_pred_v)
auc_v = roc_auc_score(y_test_v, y_pred_proba_v)

print(f"\n  Model Performance:")
print(f"    Accuracy:  {accuracy_v:.4f}")
print(f"    Precision: {precision_v:.4f}")
print(f"    Recall:    {recall_v:.4f}")
print(f"    F1-Score:  {f1_v:.4f}")
print(f"    ROC-AUC:   {auc_v:.4f}")
print(f"\n  Classification Report:")
print(classification_report(y_test_v, y_pred_v, target_names=['Safe', 'Vulnerable']))

# Cross-validation
cv_scores_v = cross_val_score(best_model_v, X_train_v_scaled, y_train_v, cv=5, scoring='f1')
print(f"  Cross-validation F1 scores: {cv_scores_v}")
print(f"  Mean CV F1: {cv_scores_v.mean():.4f} (+/- {cv_scores_v.std():.4f})")

# Save model
model_data_v = {
    'model': best_model_v,
    'scaler': scaler_v,
    'feature_names': feature_names_vuln,
    'metrics': {
        'accuracy': accuracy_v,
        'precision': precision_v,
        'recall': recall_v,
        'f1': f1_v,
        'auc': auc_v,
        'cv_mean': cv_scores_v.mean(),
        'cv_std': cv_scores_v.std()
    }
}

with open(output_dir / 'vulnerability_model.pkl', 'wb') as f:
    pickle.dump(model_data_v, f)
print(f"\n  ✓ Model saved to {output_dir / 'vulnerability_model.pkl'}")

# ============================================================================
# SUMMARY AND COMPARISON
# ============================================================================
print("\n" + "=" * 80)
print("TRAINING SUMMARY")
print("=" * 80)

summary = {
    'phishing': {
        'accuracy': accuracy_p,
        'f1': f1_p,
        'auc': auc_p,
        'cv_mean': cv_scores_p.mean()
    },
    'password': {
        'accuracy': accuracy_pwd,
        'f1': f1_pwd,
        'auc': auc_pwd,
        'cv_mean': cv_scores_pwd.mean()
    },
    'vulnerability': {
        'accuracy': accuracy_v,
        'f1': f1_v,
        'auc': auc_v,
        'cv_mean': cv_scores_v.mean()
    }
}

print("\nModel Performance Comparison:")
print(f"{'Model':<20} {'Accuracy':<12} {'F1-Score':<12} {'ROC-AUC':<12} {'CV Mean':<12}")
print("-" * 68)
for model_name, metrics in summary.items():
    print(f"{model_name:<20} {metrics['accuracy']:<12.4f} {metrics['f1']:<12.4f} "
          f"{metrics['auc']:<12.4f} {metrics['cv_mean']:<12.4f}")

# Save summary
with open(output_dir / 'training_summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"\n✓ All models trained and saved to {output_dir}/")
print(f"✓ Training summary saved to {output_dir / 'training_summary.json'}")
print("\n" + "=" * 80)
