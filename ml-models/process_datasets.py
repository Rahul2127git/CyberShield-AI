#!/usr/bin/env python3
"""
Comprehensive dataset processing pipeline for ML model training
Processes real datasets from Kaggle, GitHub, and UCI
"""

import os
import re
import json
import hashlib
from urllib.parse import urlparse
from collections import Counter
import numpy as np
from pathlib import Path

# Create output directory
output_dir = Path("processed_datasets")
output_dir.mkdir(exist_ok=True)

print("[PROCESSING] Starting comprehensive dataset processing...")

# ============================================================================
# 1. PHISHING DETECTION DATASET PROCESSING
# ============================================================================
print("\n[PHISHING] Processing phishing detection datasets...")

def extract_url_features(url):
    """Extract comprehensive features from URL for phishing detection"""
    features = {}
    
    try:
        # Parse URL
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        path = parsed.path.lower()
        
        # Basic features
        features['url_length'] = len(url)
        features['domain_length'] = len(domain)
        features['path_length'] = len(path)
        
        # Character analysis
        features['digit_count'] = sum(1 for c in domain if c.isdigit())
        features['special_char_count'] = sum(1 for c in domain if not c.isalnum() and c != '.')
        features['digit_ratio'] = features['digit_count'] / len(domain) if domain else 0
        
        # Domain structure
        features['subdomain_count'] = domain.count('.') - 1
        features['has_hyphen'] = 1 if '-' in domain else 0
        features['has_underscore'] = 1 if '_' in domain else 0
        features['has_at'] = 1 if '@' in url else 0
        
        # IP address detection
        features['is_ip'] = 1 if re.match(r'^\d+\.\d+\.\d+\.\d+', domain) else 0
        
        # TLD analysis
        tld = domain.split('.')[-1] if '.' in domain else domain
        features['tld_length'] = len(tld)
        
        # Entropy calculation (randomness indicator)
        entropy = 0
        for char in domain:
            if char.isalnum() or char == '.':
                entropy -= (1/len(domain)) * np.log2(1/len(domain) + 1e-10)
        features['domain_entropy'] = entropy
        
        # Suspicious keywords
        suspicious_keywords = ['verify', 'confirm', 'update', 'login', 'account', 'secure', 
                             'paypal', 'amazon', 'apple', 'google', 'microsoft', 'bank',
                             'admin', 'panel', 'signin', 'password', 'credential']
        features['suspicious_keyword_count'] = sum(1 for kw in suspicious_keywords if kw in domain)
        
        # URL structure patterns
        features['has_query'] = 1 if '?' in url else 0
        features['query_length'] = len(parsed.query) if parsed.query else 0
        features['has_fragment'] = 1 if '#' in url else 0
        
        return features
    except Exception as e:
        return None

# Process phishing URLs
phishing_urls = []
legitimate_urls = []

print("  Loading phishing URLs...")
try:
    with open('raw_datasets/phishing_active.txt', 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            url = line.strip()
            if url and len(url) > 5:
                phishing_urls.append(url)
except Exception as e:
    print(f"  Warning: Could not load phishing URLs: {e}")

print(f"  Loaded {len(phishing_urls)} phishing URLs")

# Create legitimate URLs from common domains
print("  Creating legitimate URLs dataset...")
legitimate_domains = [
    'google.com', 'facebook.com', 'amazon.com', 'github.com', 'stackoverflow.com',
    'wikipedia.org', 'reddit.com', 'twitter.com', 'youtube.com', 'linkedin.com',
    'microsoft.com', 'apple.com', 'netflix.com', 'spotify.com', 'dropbox.com',
    'slack.com', 'discord.com', 'telegram.org', 'whatsapp.com', 'instagram.com',
    'pinterest.com', 'tumblr.com', 'medium.com', 'dev.to', 'hashnode.com',
    'npm.org', 'pypi.org', 'rubygems.org', 'crates.io', 'packagist.org',
    'docker.com', 'kubernetes.io', 'golang.org', 'rust-lang.org', 'python.org',
    'nodejs.org', 'ruby-lang.org', 'php.net', 'perl.org', 'swift.org',
    'oracle.com', 'ibm.com', 'intel.com', 'nvidia.com', 'amd.com',
    'github.io', 'netlify.com', 'vercel.com', 'heroku.com', 'aws.amazon.com',
    'azure.microsoft.com', 'cloud.google.com', 'digitalocean.com', 'linode.com',
    'vultr.com', 'hetzner.com', 'ovh.com', 'rackspace.com', 'softlayer.com'
]

# Generate legitimate URLs with various paths
for domain in legitimate_domains:
    legitimate_urls.append(f'https://{domain}')
    legitimate_urls.append(f'https://www.{domain}')
    legitimate_urls.append(f'https://api.{domain}')
    legitimate_urls.append(f'https://docs.{domain}')
    legitimate_urls.append(f'https://blog.{domain}')
    legitimate_urls.append(f'https://{domain}/login')
    legitimate_urls.append(f'https://{domain}/account')
    legitimate_urls.append(f'https://{domain}/search?q=test')

print(f"  Created {len(legitimate_urls)} legitimate URLs")

# Extract features and create dataset
print("  Extracting features from URLs...")
phishing_data = []
legitimate_data = []

for url in phishing_urls[:5000]:  # Use first 5000 for training
    features = extract_url_features(url)
    if features:
        features['label'] = 1  # Phishing
        phishing_data.append(features)

for url in legitimate_urls:
    features = extract_url_features(url)
    if features:
        features['label'] = 0  # Legitimate
        legitimate_data.append(features)

# Balance dataset
min_samples = min(len(phishing_data), len(legitimate_data))
phishing_data = phishing_data[:min_samples]
legitimate_data = legitimate_data[:min_samples]

phishing_dataset = phishing_data + legitimate_data
print(f"  Created balanced dataset: {len(phishing_dataset)} samples")

# Save phishing dataset
with open(output_dir / 'phishing_features.json', 'w') as f:
    json.dump(phishing_dataset, f)
print(f"  Saved phishing features to {output_dir / 'phishing_features.json'}")

# ============================================================================
# 2. PASSWORD STRENGTH DATASET PROCESSING
# ============================================================================
print("\n[PASSWORD] Processing password strength dataset...")

def extract_password_features(password):
    """Extract comprehensive features from password"""
    features = {}
    
    if not password:
        return None
    
    # Length features
    features['length'] = len(password)
    features['length_squared'] = len(password) ** 2
    
    # Character type counts
    features['lowercase_count'] = sum(1 for c in password if c.islower())
    features['uppercase_count'] = sum(1 for c in password if c.isupper())
    features['digit_count'] = sum(1 for c in password if c.isdigit())
    features['special_count'] = sum(1 for c in password if not c.isalnum())
    
    # Character type ratios
    features['lowercase_ratio'] = features['lowercase_count'] / len(password)
    features['uppercase_ratio'] = features['uppercase_count'] / len(password)
    features['digit_ratio'] = features['digit_count'] / len(password)
    features['special_ratio'] = features['special_count'] / len(password)
    
    # Entropy calculation
    charset_size = 0
    if features['lowercase_count'] > 0:
        charset_size += 26
    if features['uppercase_count'] > 0:
        charset_size += 26
    if features['digit_count'] > 0:
        charset_size += 10
    if features['special_count'] > 0:
        charset_size += 32
    
    features['charset_size'] = charset_size
    features['entropy'] = len(password) * np.log2(charset_size) if charset_size > 0 else 0
    
    # Pattern detection
    features['has_sequential'] = 1 if any(password[i:i+3] in 'abcdefghijklmnopqrstuvwxyz0123456789' 
                                          for i in range(len(password)-2)) else 0
    features['has_repeated'] = 1 if len(set(password)) < len(password) * 0.7 else 0
    
    # Common pattern detection
    common_patterns = ['password', 'qwerty', '123456', 'abc', 'admin', 'letmein', 'welcome']
    features['common_pattern'] = 1 if any(pattern in password.lower() for pattern in common_patterns) else 0
    
    # Keyboard pattern (QWERTY sequences)
    qwerty_sequences = ['qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'qweasd']
    features['keyboard_pattern'] = 1 if any(seq in password.lower() for seq in qwerty_sequences) else 0
    
    # Consecutive character count
    max_consecutive = 1
    current_consecutive = 1
    for i in range(1, len(password)):
        if password[i] == password[i-1]:
            current_consecutive += 1
            max_consecutive = max(max_consecutive, current_consecutive)
        else:
            current_consecutive = 1
    features['max_consecutive'] = max_consecutive
    
    return features

# Process passwords
print("  Loading weak passwords from RockYou dataset...")
weak_passwords = []
strong_passwords = []

try:
    with open('raw_datasets/rockyou.txt', 'r', encoding='utf-8', errors='ignore') as f:
        for i, line in enumerate(f):
            password = line.strip()
            if password and 4 <= len(password) <= 50:
                weak_passwords.append(password)
            if i >= 50000:  # Limit to first 50k for processing
                break
except Exception as e:
    print(f"  Warning: Could not load passwords: {e}")

print(f"  Loaded {len(weak_passwords)} weak passwords")

# Create strong passwords dataset
print("  Generating strong passwords...")
strong_password_patterns = []
for length in [12, 14, 16, 18, 20]:
    for _ in range(50):
        # Generate strong password with all character types
        chars = []
        chars.extend(np.random.choice(list('abcdefghijklmnopqrstuvwxyz'), 2))
        chars.extend(np.random.choice(list('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 2))
        chars.extend(np.random.choice(list('0123456789'), 2))
        chars.extend(np.random.choice(list('!@#$%^&*()_+-=[]{}|;:,.<>?'), 2))
        chars.extend(np.random.choice(list('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 
                                     length - 8))
        np.random.shuffle(chars)
        strong_password_patterns.append(''.join(chars))

strong_passwords = strong_password_patterns
print(f"  Generated {len(strong_passwords)} strong passwords")

# Extract features
print("  Extracting password features...")
weak_pwd_data = []
strong_pwd_data = []

for pwd in weak_passwords[:2000]:
    features = extract_password_features(pwd)
    if features:
        features['label'] = 0  # Weak
        weak_pwd_data.append(features)

for pwd in strong_passwords[:2000]:
    features = extract_password_features(pwd)
    if features:
        features['label'] = 1  # Strong
        strong_pwd_data.append(features)

password_dataset = weak_pwd_data + strong_pwd_data
print(f"  Created password dataset: {len(password_dataset)} samples")

# Save password dataset
with open(output_dir / 'password_features.json', 'w') as f:
    json.dump(password_dataset, f)
print(f"  Saved password features to {output_dir / 'password_features.json'}")

# ============================================================================
# 3. VULNERABILITY DETECTION DATASET PROCESSING
# ============================================================================
print("\n[VULNERABILITY] Processing vulnerability detection dataset...")

def extract_url_vulnerability_features(url):
    """Extract features for vulnerability detection"""
    features = {}
    
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        parsed = urlparse(url)
        
        # Protocol security
        features['is_https'] = 1 if parsed.scheme == 'https' else 0
        
        # Query string analysis
        features['has_query'] = 1 if parsed.query else 0
        features['query_length'] = len(parsed.query)
        features['query_param_count'] = parsed.query.count('=')
        
        # Path analysis
        features['path_length'] = len(parsed.path)
        features['path_depth'] = parsed.path.count('/')
        
        # Suspicious patterns
        xss_patterns = ['<', '>', 'script', 'javascript', 'onerror', 'onclick']
        features['xss_risk'] = 1 if any(pattern in url.lower() for pattern in xss_patterns) else 0
        
        sql_patterns = ['union', 'select', 'where', 'drop', 'insert', 'delete', 'or 1=1', 'or 1=']
        features['sql_risk'] = 1 if any(pattern in url.lower() for pattern in sql_patterns) else 0
        
        traversal_patterns = ['../', '..\\', '%2e%2e', 'etc/passwd']
        features['traversal_risk'] = 1 if any(pattern in url.lower() for pattern in traversal_patterns) else 0
        
        # URL encoding anomalies
        features['has_encoding'] = 1 if '%' in url else 0
        features['encoding_count'] = url.count('%')
        
        # Suspicious characters
        features['special_char_count'] = sum(1 for c in url if not c.isalnum() and c not in '.-_/:?=&#')
        
        return features
    except:
        return None

# Create vulnerability dataset
print("  Creating vulnerability detection dataset...")
vulnerable_urls = []
safe_urls = []

# Vulnerable URLs with various attack patterns
vulnerable_patterns = [
    'https://example.com?id=1 OR 1=1',
    'https://example.com?search=<script>alert(1)</script>',
    'https://example.com?file=../../etc/passwd',
    'https://example.com?user=admin\' OR \'1\'=\'1',
    'https://example.com?id=1; DROP TABLE users--',
    'https://example.com?search=%3Cscript%3E',
    'https://example.com?page=../../../etc/passwd',
    'http://example.com?data=sensitive',  # No HTTPS
    'https://example.com?id=1 UNION SELECT * FROM passwords',
    'https://example.com?search=<img src=x onerror=alert(1)>',
]

for pattern in vulnerable_patterns:
    for i in range(50):
        vulnerable_urls.append(pattern + f'&param{i}=value')

# Safe URLs
safe_patterns = [
    'https://example.com',
    'https://example.com/api/users',
    'https://example.com/search?q=test',
    'https://api.example.com/v1/data',
    'https://secure.example.com/account',
    'https://www.example.com/products',
    'https://example.com/blog/post-123',
    'https://cdn.example.com/images/file.jpg',
]

for pattern in safe_patterns:
    for i in range(100):
        safe_urls.append(pattern + f'?param{i}=value')

# Extract features
print("  Extracting vulnerability features...")
vulnerable_data = []
safe_data = []

for url in vulnerable_urls[:500]:
    features = extract_url_vulnerability_features(url)
    if features:
        features['label'] = 1  # Vulnerable
        vulnerable_data.append(features)

for url in safe_urls[:500]:
    features = extract_url_vulnerability_features(url)
    if features:
        features['label'] = 0  # Safe
        safe_data.append(features)

vulnerability_dataset = vulnerable_data + safe_data
print(f"  Created vulnerability dataset: {len(vulnerability_dataset)} samples")

# Save vulnerability dataset
with open(output_dir / 'vulnerability_features.json', 'w') as f:
    json.dump(vulnerability_dataset, f)
print(f"  Saved vulnerability features to {output_dir / 'vulnerability_features.json'}")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n[SUMMARY] Dataset processing complete!")
print(f"  ✓ Phishing dataset: {len(phishing_dataset)} samples")
print(f"  ✓ Password dataset: {len(password_dataset)} samples")
print(f"  ✓ Vulnerability dataset: {len(vulnerability_dataset)} samples")
print(f"  ✓ Total samples: {len(phishing_dataset) + len(password_dataset) + len(vulnerability_dataset)}")
print(f"\nAll datasets saved to: {output_dir}/")
