#!/usr/bin/env python3
"""
Password Strength ML Model Training
Trains a classifier to evaluate password strength based on entropy and patterns.
"""

import json
import math
import pickle
from pathlib import Path

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def calculate_entropy(password):
    """Calculate Shannon entropy of a password."""
    if not password:
        return 0
    
    char_counts = {}
    for char in password:
        char_counts[char] = char_counts.get(char, 0) + 1
    
    entropy = 0
    for count in char_counts.values():
        probability = count / len(password)
        entropy -= probability * math.log2(probability)
    
    return entropy


def extract_password_features(password):
    """Extract features from a password for strength analysis."""
    features = {}
    
    # Basic length features
    features['length'] = len(password)
    features['length_squared'] = len(password) ** 2
    
    # Character type features
    features['has_lowercase'] = 1 if any(c.islower() for c in password) else 0
    features['has_uppercase'] = 1 if any(c.isupper() for c in password) else 0
    features['has_digit'] = 1 if any(c.isdigit() for c in password) else 0
    features['has_special'] = 1 if any(not c.isalnum() for c in password) else 0
    
    # Count features
    lowercase_count = sum(1 for c in password if c.islower())
    uppercase_count = sum(1 for c in password if c.isupper())
    digit_count = sum(1 for c in password if c.isdigit())
    special_count = sum(1 for c in password if not c.isalnum())
    
    features['lowercase_count'] = lowercase_count
    features['uppercase_count'] = uppercase_count
    features['digit_count'] = digit_count
    features['special_count'] = special_count
    
    # Ratios
    features['lowercase_ratio'] = lowercase_count / len(password) if password else 0
    features['uppercase_ratio'] = uppercase_count / len(password) if password else 0
    features['digit_ratio'] = digit_count / len(password) if password else 0
    features['special_ratio'] = special_count / len(password) if password else 0
    
    # Entropy
    features['entropy'] = calculate_entropy(password)
    
    # Uniqueness
    unique_chars = len(set(password))
    features['unique_chars'] = unique_chars
    features['char_diversity'] = unique_chars / len(password) if password else 0
    
    # Pattern detection
    features['has_sequential'] = 1 if any(
        ord(password[i]) + 1 == ord(password[i+1]) 
        for i in range(len(password)-1)
    ) else 0
    
    features['has_repeated'] = 1 if any(
        password[i] == password[i+1] 
        for i in range(len(password)-1)
    ) else 0
    
    # Common patterns
    common_patterns = ['password', 'admin', 'user', 'login', 'pass', 'test', 'demo', 'qwerty', 'abc', '123']
    features['has_common_pattern'] = 1 if any(pattern in password.lower() for pattern in common_patterns) else 0
    
    # Keyboard patterns (simple check)
    keyboard_patterns = ['qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'qweasd']
    features['has_keyboard_pattern'] = 1 if any(pattern in password.lower() for pattern in keyboard_patterns) else 0
    
    return features


def load_password_dataset():
    """Load password dataset."""
    datasets_path = Path(__file__).parent / 'datasets'
    common_passwords = []
    
    password_file = datasets_path / 'common_passwords.txt'
    if password_file.exists():
        with open(password_file, 'r', encoding='utf-8', errors='ignore') as f:
            common_passwords = [line.strip() for line in f if line.strip()]
    
    print(f"Loaded {len(common_passwords)} common weak passwords")
    return common_passwords


def generate_strong_passwords(count=500):
    """Generate synthetic strong passwords for training."""
    import string
    import random
    
    strong_passwords = []
    
    for _ in range(count):
        length = random.randint(12, 20)
        password = []
        
        # Ensure mix of character types
        password.append(random.choice(string.ascii_lowercase))
        password.append(random.choice(string.ascii_uppercase))
        password.append(random.choice(string.digits))
        password.append(random.choice(string.punctuation))
        
        # Fill rest randomly
        chars = string.ascii_letters + string.digits + string.punctuation
        for _ in range(length - 4):
            password.append(random.choice(chars))
        
        random.shuffle(password)
        strong_passwords.append(''.join(password))
    
    return strong_passwords


def prepare_training_data(common_passwords):
    """Prepare training data with weak and strong passwords."""
    X_data = []
    y_data = []
    
    # Weak passwords (label: 0)
    for password in common_passwords:
        try:
            features = extract_password_features(password)
            X_data.append(features)
            y_data.append(0)  # Weak
        except:
            pass
    
    # Strong passwords (label: 1)
    strong_passwords = generate_strong_passwords(len(common_passwords))
    for password in strong_passwords:
        try:
            features = extract_password_features(password)
            X_data.append(features)
            y_data.append(1)  # Strong
        except:
            pass
    
    print(f"Prepared {len(X_data)} samples for training")
    print(f"Weak passwords: {sum(1 for y in y_data if y == 0)}, Strong passwords: {sum(1 for y in y_data if y == 1)}")
    
    return X_data, y_data


def train_model(X_data, y_data):
    """Train the password strength model."""
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
    
    # Train Gradient Boosting classifier
    print("\nTraining Gradient Boosting classifier...")
    model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Weak', 'Strong']))
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
    model_path = Path(__file__).parent / 'password_model.pkl'
    scaler_path = Path(__file__).parent / 'password_scaler.pkl'
    metadata_path = Path(__file__).parent / 'password_metadata.json'
    
    # Save model and scaler
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    
    # Save metadata
    metadata = {
        'feature_names': feature_names,
        'accuracy': float(accuracy),
        'model_type': 'GradientBoostingClassifier',
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
    print("Password Strength ML Model Training")
    print("=" * 60)
    
    # Load datasets
    common_passwords = load_password_dataset()
    
    # Prepare training data
    X_data, y_data = prepare_training_data(common_passwords)
    
    # Train model
    model, scaler, feature_names, accuracy = train_model(X_data, y_data)
    
    # Save model
    save_model(model, scaler, feature_names, accuracy)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
