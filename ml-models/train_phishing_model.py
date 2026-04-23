#!/usr/bin/env python3
"""
Phishing Detection ML Model Training
Trains a Random Forest classifier to detect phishing URLs based on domain features.
"""

import json
import pickle
import re
from pathlib import Path
from urllib.parse import urlparse

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def extract_domain_features(url):
    """Extract features from a URL for phishing detection."""
    features = {}
    
    try:
        parsed = urlparse(url if url.startswith('http') else f'http://{url}')
        domain = parsed.netloc or parsed.path
    except:
        domain = url
    
    # Basic domain features
    features['domain_length'] = len(domain)
    features['has_hyphen'] = 1 if '-' in domain else 0
    features['has_underscore'] = 1 if '_' in domain else 0
    features['has_dot'] = domain.count('.')
    features['has_numeric'] = 1 if any(c.isdigit() for c in domain) else 0
    features['numeric_ratio'] = sum(1 for c in domain if c.isdigit()) / len(domain) if domain else 0
    
    # Check for suspicious patterns
    features['has_ip'] = 1 if re.match(r'^\d+\.\d+\.\d+\.\d+', domain) else 0
    features['has_www'] = 1 if domain.startswith('www') else 0
    features['subdomain_count'] = domain.count('.') - 1 if domain.count('.') > 0 else 0
    
    # TLD analysis
    parts = domain.split('.')
    if len(parts) > 1:
        tld = parts[-1]
        features['tld_length'] = len(tld)
        features['tld_numeric'] = 1 if any(c.isdigit() for c in tld) else 0
    else:
        features['tld_length'] = 0
        features['tld_numeric'] = 0
    
    # Entropy-like feature (character diversity)
    unique_chars = len(set(domain))
    features['char_diversity'] = unique_chars / len(domain) if domain else 0
    
    # Suspicious keywords
    suspicious_keywords = ['login', 'verify', 'update', 'confirm', 'account', 'secure', 'password', 'admin', 'bank', 'paypal', 'amazon', 'apple', 'microsoft']
    features['has_suspicious_keyword'] = 1 if any(keyword in domain.lower() for keyword in suspicious_keywords) else 0
    
    return features


def load_datasets():
    """Load phishing and legitimate domain datasets."""
    datasets_path = Path(__file__).parent / 'datasets'
    
    phishing_domains = []
    legitimate_domains = []
    
    # Load phishing domains
    phishing_file = datasets_path / 'phishing_domains.txt'
    if phishing_file.exists():
        with open(phishing_file, 'r', encoding='utf-8', errors='ignore') as f:
            phishing_domains = [line.strip() for line in f if line.strip()]
    
    # Load legitimate domains
    legitimate_file = datasets_path / 'legitimate_domains.txt'
    if legitimate_file.exists():
        with open(legitimate_file, 'r', encoding='utf-8', errors='ignore') as f:
            legitimate_domains = [line.strip() for line in f if line.strip()]
    
    print(f"Loaded {len(phishing_domains)} phishing domains")
    print(f"Loaded {len(legitimate_domains)} legitimate domains")
    
    return phishing_domains, legitimate_domains


def prepare_training_data(phishing_domains, legitimate_domains, sample_size=5000):
    """Prepare training data with balanced samples."""
    # Balance the dataset
    sample_phishing = phishing_domains[:sample_size]
    sample_legitimate = legitimate_domains * (sample_size // len(legitimate_domains) + 1)
    sample_legitimate = sample_legitimate[:sample_size]
    
    X_data = []
    y_data = []
    
    # Extract features from phishing domains
    for domain in sample_phishing:
        try:
            features = extract_domain_features(domain)
            X_data.append(features)
            y_data.append(1)  # Phishing
        except:
            pass
    
    # Extract features from legitimate domains
    for domain in sample_legitimate:
        try:
            features = extract_domain_features(domain)
            X_data.append(features)
            y_data.append(0)  # Legitimate
        except:
            pass
    
    print(f"Prepared {len(X_data)} samples for training")
    print(f"Phishing samples: {sum(y_data)}, Legitimate samples: {len(y_data) - sum(y_data)}")
    
    return X_data, y_data


def train_model(X_data, y_data):
    """Train the phishing detection model."""
    # Convert feature dicts to arrays
    feature_names = list(X_data[0].keys())
    X_array = np.array([[sample[key] for key in feature_names] for sample in X_data])
    y_array = np.array(y_data)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_array, y_array, test_size=0.2, random_state=42, stratify=y_array
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest classifier
    print("\nTraining Random Forest classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing']))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Feature importance
    print("\nTop 10 Most Important Features:")
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:10]
    for i, idx in enumerate(indices):
        print(f"{i+1}. {feature_names[idx]}: {importances[idx]:.4f}")
    
    return model, scaler, feature_names, accuracy


def save_model(model, scaler, feature_names, accuracy):
    """Save the trained model and metadata."""
    model_path = Path(__file__).parent / 'phishing_model.pkl'
    scaler_path = Path(__file__).parent / 'phishing_scaler.pkl'
    metadata_path = Path(__file__).parent / 'phishing_metadata.json'
    
    # Save model and scaler
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    
    # Save metadata
    metadata = {
        'feature_names': feature_names,
        'accuracy': float(accuracy),
        'model_type': 'RandomForestClassifier',
        'version': '1.0'
    }
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\nModel saved to {model_path}")
    print(f"Scaler saved to {scaler_path}")
    print(f"Metadata saved to {metadata_path}")


def main():
    """Main training pipeline."""
    print("=" * 60)
    print("Phishing Detection ML Model Training")
    print("=" * 60)
    
    # Load datasets
    phishing_domains, legitimate_domains = load_datasets()
    
    # Prepare training data
    X_data, y_data = prepare_training_data(phishing_domains, legitimate_domains, sample_size=5000)
    
    # Train model
    model, scaler, feature_names, accuracy = train_model(X_data, y_data)
    
    # Save model
    save_model(model, scaler, feature_names, accuracy)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
