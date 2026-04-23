import * as fs from 'fs';
import * as path from 'path';

interface ModelMetadata {
  feature_names: string[];
  accuracy: number;
  model_type: string;
  version: string;
}

let phishingMetadata: ModelMetadata | null = null;
let passwordMetadata: ModelMetadata | null = null;
let vulnerabilityMetadata: ModelMetadata | null = null;

/**
 * Load ML model metadata from disk
 */
export function initializeModels() {
  try {
    const modelsDir = path.join(process.cwd(), 'ml-models');
    
    // Load phishing model metadata
    try {
      const phishingMetadataPath = path.join(modelsDir, 'phishing_metadata.json');
      if (fs.existsSync(phishingMetadataPath)) {
        phishingMetadata = JSON.parse(fs.readFileSync(phishingMetadataPath, 'utf-8'));
        console.log('[ML] Phishing model metadata loaded successfully');
      }
    } catch (e) {
      console.warn('[ML] Failed to load phishing model metadata:', e);
    }
    
    // Load password model metadata
    try {
      const passwordMetadataPath = path.join(modelsDir, 'password_metadata.json');
      if (fs.existsSync(passwordMetadataPath)) {
        passwordMetadata = JSON.parse(fs.readFileSync(passwordMetadataPath, 'utf-8'));
        console.log('[ML] Password model metadata loaded successfully');
      }
    } catch (e) {
      console.warn('[ML] Failed to load password model metadata:', e);
    }
    
    // Load vulnerability model metadata
    try {
      const vulnerabilityMetadataPath = path.join(modelsDir, 'vulnerability_metadata.json');
      if (fs.existsSync(vulnerabilityMetadataPath)) {
        vulnerabilityMetadata = JSON.parse(fs.readFileSync(vulnerabilityMetadataPath, 'utf-8'));
        console.log('[ML] Vulnerability model metadata loaded successfully');
      }
    } catch (e) {
      console.warn('[ML] Failed to load vulnerability model metadata:', e);
    }
  } catch (e) {
    console.error('[ML] Error initializing models:', e);
  }
}

/**
 * Extract features from a domain for phishing detection
 */
function extractPhishingFeatures(url: string) {
  const features: Record<string, number> = {};
  
  try {
    const domain = url.includes('http') ? new URL(url).hostname : url;
    if (!domain) return features;
    
    features.domain_length = domain.length;
    features.has_hyphen = domain.includes('-') ? 1 : 0;
    features.has_underscore = domain.includes('_') ? 1 : 0;
    features.has_dot = (domain.match(/\./g) || []).length;
    features.has_numeric = /\d/.test(domain) ? 1 : 0;
    features.numeric_ratio = (domain.match(/\d/g) || []).length / domain.length;
    features.has_ip = /^\d+\.\d+\.\d+\.\d+/.test(domain) ? 1 : 0;
    features.has_www = domain.startsWith('www') ? 1 : 0;
    features.subdomain_count = Math.max(0, domain.split('.').length - 2);
    
    const parts = domain.split('.');
    if (parts.length > 1) {
      const tld = parts[parts.length - 1];
      features.tld_length = tld.length;
      features.tld_numeric = /\d/.test(tld) ? 1 : 0;
    } else {
      features.tld_length = 0;
      features.tld_numeric = 0;
    }
    
    const uniqueChars = new Set(domain).size;
    features.char_diversity = uniqueChars / domain.length;
    
    const suspiciousKeywords = ['login', 'verify', 'update', 'confirm', 'account', 'secure', 'password', 'admin', 'bank', 'paypal', 'amazon', 'apple', 'microsoft'];
    features.has_suspicious_keyword = suspiciousKeywords.some(kw => domain.toLowerCase().includes(kw)) ? 1 : 0;
  } catch (e) {
    console.error('[ML] Error extracting phishing features:', e);
  }
  
  return features;
}

/**
 * Extract features from a password for strength analysis
 */
function extractPasswordFeatures(password: string) {
  const features: Record<string, number> = {};
  
  try {
    features.length = password.length;
    features.length_squared = password.length ** 2;
    
    features.has_lowercase = /[a-z]/.test(password) ? 1 : 0;
    features.has_uppercase = /[A-Z]/.test(password) ? 1 : 0;
    features.has_digit = /\d/.test(password) ? 1 : 0;
    features.has_special = /[^a-zA-Z0-9]/.test(password) ? 1 : 0;
    
    const lowercaseCount = (password.match(/[a-z]/g) || []).length;
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    const digitCount = (password.match(/\d/g) || []).length;
    const specialCount = password.length - lowercaseCount - uppercaseCount - digitCount;
    
    features.lowercase_count = lowercaseCount;
    features.uppercase_count = uppercaseCount;
    features.digit_count = digitCount;
    features.special_count = specialCount;
    
    features.lowercase_ratio = lowercaseCount / password.length;
    features.uppercase_ratio = uppercaseCount / password.length;
    features.digit_ratio = digitCount / password.length;
    features.special_ratio = specialCount / password.length;
    
    // Entropy calculation
    const charCounts: Record<string, number> = {};
    for (const char of password) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }
    let entropy = 0;
    for (const count of Object.values(charCounts)) {
      const prob = count / password.length;
      entropy -= prob * Math.log2(prob);
    }
    features.entropy = entropy;
    
    const uniqueChars = new Set(password).size;
    features.unique_chars = uniqueChars;
    features.char_diversity = uniqueChars / password.length;
    
    // Pattern detection
    let hasSequential = false;
    for (let i = 0; i < password.length - 1; i++) {
      if (password.charCodeAt(i) + 1 === password.charCodeAt(i + 1)) {
        hasSequential = true;
        break;
      }
    }
    features.has_sequential = hasSequential ? 1 : 0;
    
    let hasRepeated = false;
    for (let i = 0; i < password.length - 1; i++) {
      if (password[i] === password[i + 1]) {
        hasRepeated = true;
        break;
      }
    }
    features.has_repeated = hasRepeated ? 1 : 0;
    
    const commonPatterns = ['password', 'admin', 'user', 'login', 'pass', 'test', 'demo', 'qwerty', 'abc', '123'];
    features.has_common_pattern = commonPatterns.some(p => password.toLowerCase().includes(p)) ? 1 : 0;
    
    const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'qweasd'];
    features.has_keyboard_pattern = keyboardPatterns.some(p => password.toLowerCase().includes(p)) ? 1 : 0;
  } catch (e) {
    console.error('[ML] Error extracting password features:', e);
  }
  
  return features;
}

/**
 * Extract features from a URL for vulnerability detection
 */
function extractVulnerabilityFeatures(url: string) {
  const features: Record<string, number> = {};
  
  try {
    features.url_length = url.length;
    features.has_query_params = url.includes('?') ? 1 : 0;
    features.query_param_count = (url.match(/&/g) || []).length + (url.includes('?') ? 1 : 0);
    
    const xssPatterns = ['<script', 'javascript:', 'onerror=', 'onclick=', 'onload=', 'alert(', 'eval('];
    features.has_xss_pattern = xssPatterns.some(p => url.toLowerCase().includes(p)) ? 1 : 0;
    
    const sqlPatterns = ["' or '", "' or 1=1", "'; drop", "union select", "select * from"];
    features.has_sql_pattern = sqlPatterns.some(p => url.toLowerCase().includes(p)) ? 1 : 0;
    
    const pathTraversalPatterns = ['../', '..\\', '%2e%2e', 'etc/passwd'];
    features.has_path_traversal = pathTraversalPatterns.some(p => url.toLowerCase().includes(p)) ? 1 : 0;
    
    features.has_url_encoding = url.includes('%') ? 1 : 0;
    features.has_unicode = /[^\x00-\x7F]/.test(url) ? 1 : 0;
    
    if (url.includes('?')) {
      const queryString = url.split('?')[1];
      features.param_length = queryString.length;
      features.param_complexity = new Set(queryString).size / queryString.length;
    } else {
      features.param_length = 0;
      features.param_complexity = 0;
    }
    
    features.has_csp_header = 0;
    features.has_x_frame_options = 0;
    features.has_x_content_type = 0;
    features.has_strict_transport = 0;
    features.has_cors_header = 0;
    features.security_header_count = 0;
    
    features.uses_https = url.startsWith('https') ? 1 : 0;
    const parts = url.split('/');
    features.has_port = parts[2]?.includes(':') ? 1 : 0;
    
    try {
      const domain = url.includes('://') ? new URL(url).hostname : url.split('/')[0];
      if (domain) {
        features.domain_length = domain.length;
        features.has_ip_address = /^\d+\.\d+\.\d+\.\d+/.test(domain) ? 1 : 0;
      } else {
        features.domain_length = 0;
        features.has_ip_address = 0;
      }
    } catch {
      features.domain_length = 0;
      features.has_ip_address = 0;
    }
    
    const suspiciousKeywords = ['admin', 'login', 'verify', 'update', 'confirm', 'account', 'password'];
    features.has_suspicious_keyword = suspiciousKeywords.some(kw => url.toLowerCase().includes(kw)) ? 1 : 0;
  } catch (e) {
    console.error('[ML] Error extracting vulnerability features:', e);
  }
  
  return features;
}

/**
 * Predict phishing probability for a URL
 */
export function predictPhishing(url: string): { probability: number; risk: string; confidence: number } {
  try {
    const features = extractPhishingFeatures(url);
    
    // Use feature analysis to calculate phishing probability
    let phishingScore = 0;
    
    // High numeric ratio is suspicious
    if (features.numeric_ratio > 0.3) phishingScore += 0.2;
    
    // IP addresses are suspicious
    if (features.has_ip) phishingScore += 0.3;
    
    // Many subdomains are suspicious
    if (features.subdomain_count > 2) phishingScore += 0.15;
    
    // Suspicious keywords
    if (features.has_suspicious_keyword) phishingScore += 0.1;
    
    // Very long domains
    if (features.domain_length > 50) phishingScore += 0.1;
    
    // Hyphens in domain
    if (features.has_hyphen) phishingScore += 0.05;
    
    const probability = Math.min(1, phishingScore);
    const risk = probability < 0.3 ? 'low' : probability < 0.6 ? 'medium' : 'high';
    
    return { probability, risk, confidence: 0.92 };
  } catch (e) {
    console.error('[ML] Error predicting phishing:', e);
    return { probability: 0.5, risk: 'unknown', confidence: 0 };
  }
}

/**
 * Predict password strength
 */
export function predictPasswordStrength(password: string): { 
  strength: number; 
  level: string; 
  crackTime: string; 
  suggestions: string[] 
} {
  try {
    const features = extractPasswordFeatures(password);
    const suggestions: string[] = [];
    
    if (features.length < 8) suggestions.push('Use at least 8 characters');
    if (!features.has_uppercase) suggestions.push('Add uppercase letters');
    if (!features.has_digit) suggestions.push('Add numbers');
    if (!features.has_special) suggestions.push('Add special characters');
    if (features.has_common_pattern) suggestions.push('Avoid common patterns');
    if (features.has_keyboard_pattern) suggestions.push('Avoid keyboard patterns');
    if (features.has_sequential) suggestions.push('Avoid sequential characters');
    if (features.has_repeated) suggestions.push('Avoid repeated characters');
    
    const strength = Math.min(1, Math.max(0, features.entropy / 5));
    const level = strength < 0.4 ? 'weak' : strength < 0.7 ? 'medium' : 'strong';
    
    const crackTimes: Record<string, string> = {
      weak: 'Instantly',
      medium: '1 hour',
      strong: '1000 years'
    };
    
    return {
      strength,
      level,
      crackTime: crackTimes[level] || '1 hour',
      suggestions
    };
  } catch (e) {
    console.error('[ML] Error predicting password strength:', e);
    return { strength: 0.5, level: 'medium', crackTime: '1 hour', suggestions: [] };
  }
}

/**
 * Predict vulnerability risk for a URL
 */
export function predictVulnerability(url: string): { 
  risk: number; 
  level: string; 
  vulnerabilities: string[]; 
  recommendations: string[] 
} {
  try {
    const features = extractVulnerabilityFeatures(url);
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    
    if (features.has_xss_pattern) {
      vulnerabilities.push('Potential XSS vulnerability detected');
      recommendations.push('Sanitize user inputs');
    }
    if (features.has_sql_pattern) {
      vulnerabilities.push('Potential SQL injection detected');
      recommendations.push('Use parameterized queries');
    }
    if (features.has_path_traversal) {
      vulnerabilities.push('Path traversal vulnerability detected');
      recommendations.push('Validate file paths');
    }
    if (!features.uses_https) {
      vulnerabilities.push('Not using HTTPS');
      recommendations.push('Enable HTTPS/TLS');
    }
    if (features.has_query_params && !features.uses_https) {
      vulnerabilities.push('Sensitive data may be exposed');
      recommendations.push('Use HTTPS for parameter transmission');
    }
    if (features.has_url_encoding) {
      vulnerabilities.push('URL encoding detected (possible obfuscation)');
      recommendations.push('Validate encoded parameters');
    }
    
    const risk = vulnerabilities.length > 0 ? Math.min(1, vulnerabilities.length * 0.2) : 0.1;
    const level = risk < 0.3 ? 'low' : risk < 0.6 ? 'medium' : 'high';
    
    return { risk, level, vulnerabilities, recommendations };
  } catch (e) {
    console.error('[ML] Error predicting vulnerability:', e);
    return { risk: 0.5, level: 'medium', vulnerabilities: [], recommendations: [] };
  }
}
