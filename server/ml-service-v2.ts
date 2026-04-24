import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PhishingResult {
  probability: number;
  risk: string;
  confidence: number;
  features: Record<string, number>;
}

interface PasswordResult {
  level: string;
  strength: number;
  crackTime: string;
  suggestions: string[];
}

interface VulnerabilityResult {
  level: string;
  risk: number;
  vulnerabilities: string[];
  recommendations: string[];
}

// Helper function to call Python for ML predictions
function callPythonML(scriptPath: string, inputData: string): string {
  try {
    const result = execSync(`python3 "${scriptPath}" '${inputData}'`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000
    });
    return result.trim();
  } catch (error) {
    console.error('[ML] Python execution error:', error);
    throw new Error('ML prediction failed');
  }
}

/**
 * Predict phishing probability for a URL using trained model
 */
export function predictPhishing(url: string): PhishingResult {
  try {
    const scriptPath = path.join(process.cwd(), 'ml-models', 'predict_phishing.py');
    
    // Extract URL features
    const features = extractPhishingFeatures(url);
    
    // Call Python prediction script
    const predictionScript = `
import json
import pickle
import numpy as np
from urllib.parse import urlparse
import sys

# Load model
with open('ml-models/trained_models/phishing_model.pkl', 'rb') as f:
    model_data = pickle.load(f)

model = model_data['model']
scaler = model_data['scaler']
feature_names = model_data['feature_names']

# Prepare features
features = json.loads('${JSON.stringify(features)}')
feature_vector = np.array([[features[name] for name in feature_names]])
feature_scaled = scaler.transform(feature_vector)

# Predict
probability = model.predict_proba(feature_scaled)[0][1]
prediction = model.predict(feature_scaled)[0]

print(json.dumps({
    'probability': float(probability),
    'prediction': int(prediction)
}))
`;

    const result = JSON.parse(execSync(`python3 -c "${predictionScript}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    }));

    const probability = result.probability;
    let risk = 'low';
    if (probability > 0.7) risk = 'high';
    else if (probability > 0.4) risk = 'medium';

    return {
      probability,
      risk,
      confidence: Math.abs(probability - 0.5) * 2,
      features
    };
  } catch (error) {
    console.error('[ML] Phishing prediction error:', error);
    // Fallback to heuristic
    return fallbackPhishingPrediction(url);
  }
}

/**
 * Predict password strength using trained model
 */
export function predictPasswordStrength(password: string): PasswordResult {
  try {
    const features = extractPasswordFeatures(password);

    const predictionScript = `
import json
import pickle
import numpy as np
import sys

# Load model
with open('ml-models/trained_models/password_model.pkl', 'rb') as f:
    model_data = pickle.load(f)

model = model_data['model']
scaler = model_data['scaler']
feature_names = model_data['feature_names']

# Prepare features
features = json.loads('${JSON.stringify(features)}')
feature_vector = np.array([[features[name] for name in feature_names]])
feature_scaled = scaler.transform(feature_vector)

# Predict
strength_prob = model.predict_proba(feature_scaled)[0][1]
prediction = model.predict(feature_scaled)[0]

print(json.dumps({
    'strength': float(strength_prob),
    'prediction': int(prediction)
}))
`;

    const result = JSON.parse(execSync(`python3 -c "${predictionScript}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    }));

    const strength = result.strength;
    let level = 'weak';
    if (strength > 0.7) level = 'strong';
    else if (strength > 0.4) level = 'medium';

    // Generate suggestions
    const suggestions = generatePasswordSuggestions(password, features);

    // Estimate crack time
    const crackTime = estimateCrackTime(features);

    return {
      level,
      strength,
      crackTime,
      suggestions
    };
  } catch (error) {
    console.error('[ML] Password prediction error:', error);
    return fallbackPasswordPrediction(password);
  }
}

/**
 * Predict vulnerability risk for a URL
 */
export function predictVulnerability(url: string): VulnerabilityResult {
  try {
    const features = extractVulnerabilityFeatures(url);

    const predictionScript = `
import json
import pickle
import numpy as np
import sys

# Load model
with open('ml-models/trained_models/vulnerability_model.pkl', 'rb') as f:
    model_data = pickle.load(f)

model = model_data['model']
scaler = model_data['scaler']
feature_names = model_data['feature_names']

# Prepare features
features = json.loads('${JSON.stringify(features)}')
feature_vector = np.array([[features[name] for name in feature_names]])
feature_scaled = scaler.transform(feature_vector)

# Predict
risk_prob = model.predict_proba(feature_scaled)[0][1]
prediction = model.predict(feature_scaled)[0]

print(json.dumps({
    'risk': float(risk_prob),
    'prediction': int(prediction)
}))
`;

    const result = JSON.parse(execSync(`python3 -c "${predictionScript}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    }));

    const risk = result.risk;
    let level = 'low';
    if (risk > 0.7) level = 'high';
    else if (risk > 0.4) level = 'medium';

    const vulnerabilities = detectVulnerabilities(url, features);
    const recommendations = generateRecommendations(url, vulnerabilities);

    return {
      level,
      risk,
      vulnerabilities,
      recommendations
    };
  } catch (error) {
    console.error('[ML] Vulnerability prediction error:', error);
    return fallbackVulnerabilityPrediction(url);
  }
}

// ============================================================================
// FEATURE EXTRACTION FUNCTIONS
// ============================================================================

function extractPhishingFeatures(url: string): Record<string, number> {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    const domain = urlObj.hostname?.toLowerCase() || '';
    const path = urlObj.pathname.toLowerCase();

    const features: Record<string, number> = {
      url_length: url.length,
      domain_length: domain.length,
      path_length: path.length,
      digit_count: (domain.match(/\d/g) || []).length,
      special_char_count: (domain.match(/[^a-z0-9.]/g) || []).length,
      digit_ratio: (domain.match(/\d/g) || []).length / domain.length,
      subdomain_count: (domain.match(/\./g) || []).length - 1,
      has_hyphen: domain.includes('-') ? 1 : 0,
      has_underscore: domain.includes('_') ? 1 : 0,
      has_at: url.includes('@') ? 1 : 0,
      is_ip: /^\d+\.\d+\.\d+\.\d+/.test(domain) ? 1 : 0,
      tld_length: domain.split('.').pop()?.length || 0,
      domain_entropy: calculateEntropy(domain),
      suspicious_keyword_count: countSuspiciousKeywords(domain),
      has_query: url.includes('?') ? 1 : 0,
      query_length: urlObj.search.length,
      has_fragment: url.includes('#') ? 1 : 0
    };

    return features;
  } catch (error) {
    return {
      url_length: 0, domain_length: 0, path_length: 0, digit_count: 0,
      special_char_count: 0, digit_ratio: 0, subdomain_count: 0,
      has_hyphen: 0, has_underscore: 0, has_at: 0, is_ip: 0,
      tld_length: 0, domain_entropy: 0, suspicious_keyword_count: 0,
      has_query: 0, query_length: 0, has_fragment: 0
    };
  }
}

function extractPasswordFeatures(password: string): Record<string, number> {
  const features: Record<string, number> = {
    length: password.length,
    length_squared: password.length ** 2,
    lowercase_count: (password.match(/[a-z]/g) || []).length,
    uppercase_count: (password.match(/[A-Z]/g) || []).length,
    digit_count: (password.match(/\d/g) || []).length,
    special_count: (password.match(/[^a-zA-Z0-9]/g) || []).length,
    lowercase_ratio: (password.match(/[a-z]/g) || []).length / password.length,
    uppercase_ratio: (password.match(/[A-Z]/g) || []).length / password.length,
    digit_ratio: (password.match(/\d/g) || []).length / password.length,
    special_ratio: (password.match(/[^a-zA-Z0-9]/g) || []).length / password.length,
    charset_size: calculateCharsetSize(password),
    entropy: calculatePasswordEntropy(password),
    has_sequential: hasSequential(password) ? 1 : 0,
    has_repeated: hasRepeated(password) ? 1 : 0,
    common_pattern: hasCommonPattern(password) ? 1 : 0,
    keyboard_pattern: hasKeyboardPattern(password) ? 1 : 0,
    max_consecutive: findMaxConsecutive(password)
  };

  return features;
}

function extractVulnerabilityFeatures(url: string): Record<string, number> {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);

    const features: Record<string, number> = {
      is_https: urlObj.protocol === 'https:' ? 1 : 0,
      has_query: urlObj.search ? 1 : 0,
      query_length: urlObj.search.length,
      query_param_count: (urlObj.search.match(/=/g) || []).length,
      path_length: urlObj.pathname.length,
      path_depth: (urlObj.pathname.match(/\//g) || []).length,
      xss_risk: hasXSSPatterns(url) ? 1 : 0,
      sql_risk: hasSQLPatterns(url) ? 1 : 0,
      traversal_risk: hasTraversalPatterns(url) ? 1 : 0,
      has_encoding: url.includes('%') ? 1 : 0,
      encoding_count: (url.match(/%/g) || []).length,
      special_char_count: (url.match(/[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]/g) || []).length
    };

    return features;
  } catch (error) {
    return {
      is_https: 0, has_query: 0, query_length: 0, query_param_count: 0,
      path_length: 0, path_depth: 0, xss_risk: 0, sql_risk: 0,
      traversal_risk: 0, has_encoding: 0, encoding_count: 0, special_char_count: 0
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateEntropy(text: string): number {
  const freq: Record<string, number> = {};
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / text.length;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

function countSuspiciousKeywords(domain: string): number {
  const keywords = ['verify', 'confirm', 'update', 'login', 'account', 'secure',
    'paypal', 'amazon', 'apple', 'google', 'microsoft', 'bank', 'admin'];
  return keywords.filter(kw => domain.includes(kw)).length;
}

function calculateCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/\d/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 32;
  return size;
}

function calculatePasswordEntropy(password: string): number {
  const charsetSize = calculateCharsetSize(password);
  return password.length * Math.log2(charsetSize || 1);
}

function hasSequential(password: string): boolean {
  const sequences = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < password.length - 2; i++) {
    if (sequences.includes(password.substring(i, i + 3).toLowerCase())) {
      return true;
    }
  }
  return false;
}

function hasRepeated(password: string): boolean {
  const uniqueChars = new Set(password).size;
  return uniqueChars < password.length * 0.7;
}

function hasCommonPattern(password: string): boolean {
  const patterns = ['password', 'qwerty', '123456', 'abc', 'admin', 'letmein', 'welcome'];
  return patterns.some(p => password.toLowerCase().includes(p));
}

function hasKeyboardPattern(password: string): boolean {
  const patterns = ['qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'qweasd'];
  return patterns.some(p => password.toLowerCase().includes(p));
}

function findMaxConsecutive(password: string): number {
  let max = 1, current = 1;
  for (let i = 1; i < password.length; i++) {
    if (password[i] === password[i - 1]) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 1;
    }
  }
  return max;
}

function hasXSSPatterns(url: string): boolean {
  const patterns = ['<', '>', 'script', 'javascript', 'onerror', 'onclick'];
  return patterns.some(p => url.toLowerCase().includes(p));
}

function hasSQLPatterns(url: string): boolean {
  const patterns = ['union', 'select', 'where', 'drop', 'insert', 'delete', 'or 1=1'];
  return patterns.some(p => url.toLowerCase().includes(p));
}

function hasTraversalPatterns(url: string): boolean {
  const patterns = ['../', '..\\', '%2e%2e', 'etc/passwd'];
  return patterns.some(p => url.toLowerCase().includes(p));
}

function detectVulnerabilities(url: string, features: Record<string, number>): string[] {
  const vulns: string[] = [];

  if (!features.is_https) {
    vulns.push('⚠️ HTTPS Not Used - Data transmitted in plaintext');
  }

  if (features.xss_risk) {
    vulns.push('🔴 Potential XSS Vulnerability - Script injection patterns detected');
  }

  if (features.sql_risk) {
    vulns.push('🔴 Potential SQL Injection - SQL keywords in query parameters');
  }

  if (features.traversal_risk) {
    vulns.push('🔴 Path Traversal Risk - Directory traversal patterns detected');
  }

  if (features.encoding_count > 5) {
    vulns.push('⚠️ Excessive URL Encoding - May indicate obfuscation');
  }

  if (features.query_param_count > 10) {
    vulns.push('⚠️ Multiple Query Parameters - Increased attack surface');
  }

  return vulns;
}

function generateRecommendations(url: string, vulnerabilities: string[]): string[] {
  const recs: string[] = [];

  if (vulnerabilities.length === 0) {
    recs.push('✓ URL appears secure - no obvious vulnerabilities detected');
  } else {
    recs.push('• Use HTTPS for all connections');
    recs.push('• Validate and sanitize all user inputs');
    recs.push('• Use parameterized queries to prevent SQL injection');
    recs.push('• Implement Content Security Policy (CSP) headers');
    recs.push('• Use Web Application Firewall (WAF)');
  }

  return recs;
}

function generatePasswordSuggestions(password: string, features: Record<string, number>): string[] {
  const suggestions: string[] = [];

  if (features.length < 12) {
    suggestions.push('Use at least 12 characters for strong security');
  }

  if (features.lowercase_count === 0) {
    suggestions.push('Add lowercase letters (a-z)');
  }

  if (features.uppercase_count === 0) {
    suggestions.push('Add uppercase letters (A-Z)');
  }

  if (features.digit_count === 0) {
    suggestions.push('Add numbers (0-9)');
  }

  if (features.special_count === 0) {
    suggestions.push('Add special characters (!@#$%^&*)');
  }

  if (hasCommonPattern(password)) {
    suggestions.push('Avoid common patterns and dictionary words');
  }

  if (hasKeyboardPattern(password)) {
    suggestions.push('Avoid keyboard patterns (qwerty, asdfgh, etc)');
  }

  if (features.max_consecutive > 2) {
    suggestions.push('Avoid repeating characters');
  }

  return suggestions;
}

function estimateCrackTime(features: Record<string, number>): string {
  const entropy = features.entropy || 0;
  const guessesPerSecond = 1e9; // 1 billion guesses/sec
  const seconds = Math.pow(2, entropy) / (2 * guessesPerSecond);

  if (seconds < 1) return 'Less than a second';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000)} years`;
  return 'Centuries';
}

// ============================================================================
// FALLBACK FUNCTIONS (for error handling)
// ============================================================================

function fallbackPhishingPrediction(url: string): PhishingResult {
  const features = extractPhishingFeatures(url);
  let probability = 0.2;

  if (features.is_ip) probability += 0.3;
  if (features.digit_ratio > 0.3) probability += 0.2;
  if (features.suspicious_keyword_count > 0) probability += 0.1;
  if (features.has_at) probability += 0.2;

  probability = Math.min(probability, 0.95);

  return {
    probability,
    risk: probability > 0.7 ? 'high' : probability > 0.4 ? 'medium' : 'low',
    confidence: 0.7,
    features
  };
}

function fallbackPasswordPrediction(password: string): PasswordResult {
  const features = extractPasswordFeatures(password);
  let strength = 0.3;

  if (features.length >= 12) strength += 0.2;
  if (features.lowercase_count > 0) strength += 0.15;
  if (features.uppercase_count > 0) strength += 0.15;
  if (features.digit_count > 0) strength += 0.15;
  if (features.special_count > 0) strength += 0.15;

  strength = Math.min(strength, 0.95);

  const suggestions = generatePasswordSuggestions(password, features);

  return {
    level: strength > 0.7 ? 'strong' : strength > 0.4 ? 'medium' : 'weak',
    strength,
    crackTime: estimateCrackTime(features),
    suggestions
  };
}

function fallbackVulnerabilityPrediction(url: string): VulnerabilityResult {
  const features = extractVulnerabilityFeatures(url);
  let risk = 0.1;

  if (!features.is_https) risk += 0.3;
  if (features.xss_risk) risk += 0.3;
  if (features.sql_risk) risk += 0.3;
  if (features.traversal_risk) risk += 0.2;

  risk = Math.min(risk, 0.95);

  const vulnerabilities = detectVulnerabilities(url, features);

  return {
    level: risk > 0.7 ? 'high' : risk > 0.4 ? 'medium' : 'low',
    risk,
    vulnerabilities,
    recommendations: generateRecommendations(url, vulnerabilities)
  };
}
