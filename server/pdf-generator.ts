import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PDF Report Generator for CyberShield-AI
 * Generates professional security analysis reports in PDF format
 */

export interface VulnerabilityReportData {
  url: string;
  riskScore: number;
  riskLevel: string;
  vulnerabilities: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface PhishingReportData {
  url: string;
  phishingProbability: number;
  riskLevel: string;
  confidence: number;
  timestamp: Date;
}

export interface PasswordReportData {
  strength: number;
  level: string;
  crackTime: string;
  suggestions: string[];
  timestamp: Date;
}

/**
 * Generate Vulnerability Scan Report PDF
 */
export function generateVulnerabilityPDF(data: VulnerabilityReportData): string {
  const riskColors = {
    low: '#00C896',
    medium: '#FFA500',
    high: '#FF6B6B',
  };

  const riskColor = riskColors[data.riskLevel as keyof typeof riskColors] || '#8B949E';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #0B0F14; 
          color: #E6EDF3; 
          padding: 40px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { 
          border-bottom: 2px solid #00C896; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .title { 
          font-size: 28px; 
          font-weight: bold; 
          color: #00C896; 
          margin-bottom: 8px;
        }
        .report-id { 
          font-size: 12px; 
          color: #8B949E;
          margin-bottom: 4px;
        }
        .score-section {
          background: #161B22;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #00C896;
          margin-bottom: 30px;
        }
        .score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .score-label { font-size: 12px; color: #8B949E; }
        .score-value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #00C896;
        }
        .risk-badge {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          color: white;
          background: ${riskColor};
          font-size: 14px;
        }
        .section { margin-bottom: 25px; }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #E6EDF3;
          margin-bottom: 12px;
          border-bottom: 1px solid #30363D;
          padding-bottom: 8px;
        }
        .list-item {
          display: flex;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .bullet { 
          color: #00C896; 
          margin-right: 10px;
          min-width: 20px;
        }
        .list-text { 
          color: #C9D1D9; 
          line-height: 1.6;
        }
        .url-text {
          font-size: 12px; 
          color: #C9D1D9; 
          word-break: break-all; 
          font-family: monospace;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #30363D;
          font-size: 10px;
          color: #8B949E;
        }
        .disclaimer {
          margin-top: 20px;
          padding: 12px;
          background: rgba(255, 107, 107, 0.1);
          border-left: 3px solid #FF6B6B;
          font-size: 11px;
          color: #FF6B6B;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">🛡️ Vulnerability Scan Report</div>
          <div class="report-id">Report ID: VSR-${Date.now()}</div>
          <div class="report-id">Generated: ${new Date(data.timestamp).toLocaleString()}</div>
        </div>

        <div class="score-section">
          <div class="score-row">
            <div>
              <div class="score-label">Risk Level</div>
              <div class="risk-badge">${data.riskLevel.toUpperCase()}</div>
            </div>
            <div>
              <div class="score-label">Risk Score</div>
              <div class="score-value">${(data.riskScore * 100).toFixed(0)}/100</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">URL Analyzed</div>
          <div class="url-text">${data.url}</div>
        </div>

        ${data.vulnerabilities.length > 0 ? `
          <div class="section">
            <div class="section-title">Vulnerabilities Found (${data.vulnerabilities.length})</div>
            ${data.vulnerabilities.map(vuln => `
              <div class="list-item">
                <div class="bullet">⚠️</div>
                <div class="list-text">${vuln}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="section">
            <div class="section-title">Security Status</div>
            <div class="list-item">
              <div class="bullet">✓</div>
              <div class="list-text" style="color: #00C896;">No major vulnerabilities detected. The URL appears to be secure.</div>
            </div>
          </div>
        `}

        ${data.recommendations.length > 0 ? `
          <div class="section">
            <div class="section-title">Recommendations</div>
            ${data.recommendations.map(rec => `
              <div class="list-item">
                <div class="bullet">→</div>
                <div class="list-text">${rec}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          <p>CyberShield-AI Security Analysis Report</p>
          <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
        </div>

        <div class="disclaimer">
          ⚠️ Disclaimer: This report is generated by AI for educational and demonstration purposes. For critical security decisions, consult with qualified security professionals.
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}

/**
 * Generate Phishing Detection Report PDF
 */
export function generatePhishingPDF(data: PhishingReportData): string {
  const riskColors = {
    low: '#00C896',
    medium: '#FFA500',
    high: '#FF6B6B',
  };

  const riskColor = riskColors[data.riskLevel as keyof typeof riskColors] || '#8B949E';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #0B0F14; 
          color: #E6EDF3; 
          padding: 40px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { 
          border-bottom: 2px solid #00C896; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .title { 
          font-size: 28px; 
          font-weight: bold; 
          color: #00C896; 
          margin-bottom: 8px;
        }
        .report-id { 
          font-size: 12px; 
          color: #8B949E;
          margin-bottom: 4px;
        }
        .score-section {
          background: #161B22;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #00C896;
          margin-bottom: 30px;
        }
        .score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .score-label { font-size: 12px; color: #8B949E; }
        .score-value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #00C896;
        }
        .risk-badge {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          color: white;
          background: ${riskColor};
          font-size: 14px;
        }
        .section { margin-bottom: 25px; }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #E6EDF3;
          margin-bottom: 12px;
          border-bottom: 1px solid #30363D;
          padding-bottom: 8px;
        }
        .list-item {
          display: flex;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .bullet { 
          color: #00C896; 
          margin-right: 10px;
          min-width: 20px;
        }
        .list-text { 
          color: #C9D1D9; 
          line-height: 1.6;
        }
        .url-text {
          font-size: 12px; 
          color: #C9D1D9; 
          word-break: break-all; 
          font-family: monospace;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #30363D;
          font-size: 10px;
          color: #8B949E;
        }
        .disclaimer {
          margin-top: 20px;
          padding: 12px;
          background: rgba(255, 107, 107, 0.1);
          border-left: 3px solid #FF6B6B;
          font-size: 11px;
          color: #FF6B6B;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">🎣 Phishing Detection Report</div>
          <div class="report-id">Report ID: PDR-${Date.now()}</div>
          <div class="report-id">Generated: ${new Date(data.timestamp).toLocaleString()}</div>
        </div>

        <div class="score-section">
          <div class="score-row">
            <div>
              <div class="score-label">Risk Level</div>
              <div class="risk-badge">${data.riskLevel.toUpperCase()}</div>
            </div>
            <div>
              <div class="score-label">Phishing Probability</div>
              <div class="score-value">${(data.phishingProbability * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div class="score-label">Confidence</div>
              <div class="score-value">${(data.confidence * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">URL Analyzed</div>
          <div class="url-text">${data.url}</div>
        </div>

        <div class="section">
          <div class="section-title">Assessment</div>
          <div class="list-item">
            <div class="bullet">${data.riskLevel === 'low' ? '✓' : '⚠️'}</div>
            <div class="list-text">
              ${data.riskLevel === 'low' 
                ? 'This URL appears to be legitimate. No major phishing indicators detected.'
                : data.riskLevel === 'medium'
                ? 'This URL shows some suspicious characteristics. Exercise caution before clicking or entering credentials.'
                : 'This URL shows high-risk characteristics. Avoid clicking this link and do not enter any personal information.'}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Safety Tips</div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Never click links from unsolicited emails or messages</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Verify the sender's email address carefully</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Hover over links to see the actual URL before clicking</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Look for HTTPS and valid SSL certificates</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Report suspicious emails to your email provider</div>
          </div>
        </div>

        <div class="footer">
          <p>CyberShield-AI Phishing Detection Report</p>
          <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
        </div>

        <div class="disclaimer">
          ⚠️ Disclaimer: This report is generated by AI for educational and demonstration purposes. For critical security decisions, consult with qualified security professionals.
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}

/**
 * Generate Password Strength Report PDF
 */
export function generatePasswordPDF(data: PasswordReportData): string {
  const strengthColors = {
    weak: '#FF6B6B',
    fair: '#FFA500',
    good: '#00C896',
    strong: '#00C896',
  };

  const strengthColor = strengthColors[data.level as keyof typeof strengthColors] || '#8B949E';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #0B0F14; 
          color: #E6EDF3; 
          padding: 40px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { 
          border-bottom: 2px solid #00C896; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .title { 
          font-size: 28px; 
          font-weight: bold; 
          color: #00C896; 
          margin-bottom: 8px;
        }
        .report-id { 
          font-size: 12px; 
          color: #8B949E;
          margin-bottom: 4px;
        }
        .score-section {
          background: #161B22;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #00C896;
          margin-bottom: 30px;
        }
        .score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .score-label { font-size: 12px; color: #8B949E; }
        .score-value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #00C896;
        }
        .strength-badge {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          color: white;
          background: ${strengthColor};
          font-size: 14px;
        }
        .section { margin-bottom: 25px; }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #E6EDF3;
          margin-bottom: 12px;
          border-bottom: 1px solid #30363D;
          padding-bottom: 8px;
        }
        .list-item {
          display: flex;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .bullet { 
          color: #00C896; 
          margin-right: 10px;
          min-width: 20px;
        }
        .list-text { 
          color: #C9D1D9; 
          line-height: 1.6;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #30363D;
          font-size: 10px;
          color: #8B949E;
        }
        .disclaimer {
          margin-top: 20px;
          padding: 12px;
          background: rgba(255, 107, 107, 0.1);
          border-left: 3px solid #FF6B6B;
          font-size: 11px;
          color: #FF6B6B;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">🔐 Password Strength Report</div>
          <div class="report-id">Report ID: PSR-${Date.now()}</div>
          <div class="report-id">Generated: ${new Date(data.timestamp).toLocaleString()}</div>
        </div>

        <div class="score-section">
          <div class="score-row">
            <div>
              <div class="score-label">Strength Level</div>
              <div class="strength-badge">${data.level.toUpperCase()}</div>
            </div>
            <div>
              <div class="score-label">Estimated Crack Time</div>
              <div class="score-value" style="font-size: 16px;">${data.crackTime}</div>
            </div>
          </div>
        </div>

        ${data.suggestions.length > 0 ? `
          <div class="section">
            <div class="section-title">Improvement Suggestions</div>
            ${data.suggestions.map(suggestion => `
              <div class="list-item">
                <div class="bullet">→</div>
                <div class="list-text">${suggestion}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="section">
            <div class="section-title">Password Assessment</div>
            <div class="list-item">
              <div class="bullet">✓</div>
              <div class="list-text" style="color: #00C896;">Your password meets all security best practices and has strong entropy.</div>
            </div>
          </div>
        `}

        <div class="section">
          <div class="section-title">Password Best Practices</div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Use unique passwords for each account</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Use a password manager to store passwords securely</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Enable two-factor authentication when available</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Never share your password with anyone</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Change passwords if you suspect compromise</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Avoid using personal information in passwords</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Use at least 12 characters for strong passwords</div>
          </div>
          <div class="list-item">
            <div class="bullet">→</div>
            <div class="list-text">Mix uppercase, lowercase, numbers, and special characters</div>
          </div>
        </div>

        <div class="footer">
          <p>CyberShield-AI Password Strength Report</p>
          <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
        </div>

        <div class="disclaimer">
          ⚠️ Disclaimer: This report is generated by AI for educational and demonstration purposes. For critical security decisions, consult with qualified security professionals.
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}
