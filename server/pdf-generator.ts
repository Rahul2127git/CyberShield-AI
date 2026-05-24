import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PDF Report Generator for CyberShield-AI
 * Generates professional security analysis reports in PDF format
 * Fixed: Improved text contrast, visibility, and layout
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #FFFFFF; 
          color: #1A1A1A; 
          padding: 40px;
          line-height: 1.6;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { 
          border-bottom: 3px solid #00C896; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .title { 
          font-size: 32px; 
          font-weight: bold; 
          color: #00C896; 
          margin-bottom: 10px;
        }
        .report-id { 
          font-size: 13px; 
          color: #555555;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .score-section {
          background: #F5F5F5;
          padding: 25px;
          border-radius: 8px;
          border-left: 5px solid #00C896;
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .score-item {
          flex: 1;
          min-width: 150px;
        }
        .score-label { 
          font-size: 13px; 
          color: #666666; 
          font-weight: 600;
          margin-bottom: 8px;
        }
        .score-value { 
          font-size: 28px; 
          font-weight: bold; 
          color: #00C896;
        }
        .risk-badge {
          display: inline-block;
          padding: 10px 18px;
          border-radius: 6px;
          font-weight: bold;
          color: white;
          background: ${riskColor};
          font-size: 15px;
        }
        .section { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1A1A1A;
          margin-bottom: 15px;
          border-bottom: 2px solid #00C896;
          padding-bottom: 10px;
        }
        .list-item {
          display: flex;
          margin-bottom: 12px;
          font-size: 13px;
          color: #333333;
          line-height: 1.7;
        }
        .bullet { 
          color: #00C896; 
          margin-right: 12px;
          min-width: 20px;
          font-weight: bold;
        }
        .list-text { 
          color: #333333; 
          line-height: 1.7;
          flex: 1;
        }
        .url-text {
          font-size: 13px; 
          color: #1A1A1A; 
          word-break: break-all; 
          font-family: 'Courier New', monospace;
          background: #F9F9F9;
          padding: 12px;
          border-radius: 4px;
          border-left: 3px solid #00C896;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #CCCCCC;
          font-size: 12px;
          color: #666666;
        }
        .footer p {
          margin-bottom: 5px;
        }
        .disclaimer {
          margin-top: 25px;
          padding: 15px;
          background: #FFF3CD;
          border-left: 4px solid #FF9800;
          font-size: 12px;
          color: #333333;
          border-radius: 4px;
        }
        .disclaimer strong {
          color: #E65100;
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
            <div class="score-item">
              <div class="score-label">Risk Level</div>
              <div class="risk-badge">${data.riskLevel.toUpperCase()}</div>
            </div>
            <div class="score-item">
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
              <div class="list-text" style="color: #00C896; font-weight: 600;">No major vulnerabilities detected. The URL appears to be secure.</div>
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
          <p><strong>CyberShield-AI Security Analysis Report</strong></p>
          <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
        </div>

        <div class="disclaimer">
          <strong>⚠️ Disclaimer:</strong> This report is generated by AI for educational and demonstration purposes. For critical security decisions, consult with qualified security professionals.
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #FFFFFF; 
          color: #1A1A1A; 
          padding: 40px;
          line-height: 1.6;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { 
          border-bottom: 3px solid #00C896; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .title { 
          font-size: 32px; 
          font-weight: bold; 
          color: #00C896; 
          margin-bottom: 10px;
        }
        .report-id { 
          font-size: 13px; 
          color: #555555;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .score-section {
          background: #F5F5F5;
          padding: 25px;
          border-radius: 8px;
          border-left: 5px solid #00C896;
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .score-item {
          flex: 1;
          min-width: 140px;
        }
        .score-label { 
          font-size: 13px; 
          color: #666666; 
          font-weight: 600;
          margin-bottom: 8px;
        }
        .score-value { 
          font-size: 28px; 
          font-weight: bold; 
          color: #00C896;
        }
        .risk-badge {
          display: inline-block;
          padding: 10px 18px;
          border-radius: 6px;
          font-weight: bold;
          color: white;
          background: ${riskColor};
          font-size: 15px;
        }
        .section { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1A1A1A;
          margin-bottom: 15px;
          border-bottom: 2px solid #00C896;
          padding-bottom: 10px;
        }
        .list-item {
          display: flex;
          margin-bottom: 12px;
          font-size: 13px;
          color: #333333;
          line-height: 1.7;
        }
        .bullet { 
          color: #00C896; 
          margin-right: 12px;
          min-width: 20px;
          font-weight: bold;
        }
        .list-text { 
          color: #333333; 
          line-height: 1.7;
          flex: 1;
        }
        .url-text {
          font-size: 13px; 
          color: #1A1A1A; 
          word-break: break-all; 
          font-family: 'Courier New', monospace;
          background: #F9F9F9;
          padding: 12px;
          border-radius: 4px;
          border-left: 3px solid #00C896;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #CCCCCC;
          font-size: 12px;
          color: #666666;
        }
        .footer p {
          margin-bottom: 5px;
        }
        .disclaimer {
          margin-top: 25px;
          padding: 15px;
          background: #FFF3CD;
          border-left: 4px solid #FF9800;
          font-size: 12px;
          color: #333333;
          border-radius: 4px;
        }
        .disclaimer strong {
          color: #E65100;
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
            <div class="score-item">
              <div class="score-label">Risk Level</div>
              <div class="risk-badge">${data.riskLevel.toUpperCase()}</div>
            </div>
            <div class="score-item">
              <div class="score-label">Phishing Probability</div>
              <div class="score-value">${(data.phishingProbability * 100).toFixed(1)}%</div>
            </div>
            <div class="score-item">
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
            <div class="list-text">Be wary of urgent requests for personal or financial information</div>
          </div>
        </div>

        <div class="footer">
          <p><strong>CyberShield-AI Phishing Detection Report</strong></p>
          <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
        </div>

        <div class="disclaimer">
          <strong>⚠️ Disclaimer:</strong> This report is generated by AI for educational and demonstration purposes. For critical security decisions, consult with qualified security professionals.
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
    good: '#FFD700',
    strong: '#00C896',
  };

  const strengthColor = strengthColors[data.level as keyof typeof strengthColors] || '#8B949E';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #FFFFFF; 
          color: #1A1A1A; 
          padding: 40px;
          line-height: 1.6;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { 
          border-bottom: 3px solid #00C896; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .title { 
          font-size: 32px; 
          font-weight: bold; 
          color: #00C896; 
          margin-bottom: 10px;
        }
        .report-id { 
          font-size: 13px; 
          color: #555555;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .score-section {
          background: #F5F5F5;
          padding: 25px;
          border-radius: 8px;
          border-left: 5px solid #00C896;
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .score-item {
          flex: 1;
          min-width: 150px;
        }
        .score-label { 
          font-size: 13px; 
          color: #666666; 
          font-weight: 600;
          margin-bottom: 8px;
        }
        .score-value { 
          font-size: 28px; 
          font-weight: bold; 
          color: #00C896;
        }
        .strength-badge {
          display: inline-block;
          padding: 10px 18px;
          border-radius: 6px;
          font-weight: bold;
          color: white;
          background: ${strengthColor};
          font-size: 15px;
        }
        .section { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1A1A1A;
          margin-bottom: 15px;
          border-bottom: 2px solid #00C896;
          padding-bottom: 10px;
        }
        .list-item {
          display: flex;
          margin-bottom: 12px;
          font-size: 13px;
          color: #333333;
          line-height: 1.7;
        }
        .bullet { 
          color: #00C896; 
          margin-right: 12px;
          min-width: 20px;
          font-weight: bold;
        }
        .list-text { 
          color: #333333; 
          line-height: 1.7;
          flex: 1;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #CCCCCC;
          font-size: 12px;
          color: #666666;
        }
        .footer p {
          margin-bottom: 5px;
        }
        .disclaimer {
          margin-top: 25px;
          padding: 15px;
          background: #FFF3CD;
          border-left: 4px solid #FF9800;
          font-size: 12px;
          color: #333333;
          border-radius: 4px;
        }
        .disclaimer strong {
          color: #E65100;
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
            <div class="score-item">
              <div class="score-label">Strength Level</div>
              <div class="strength-badge">${data.level.toUpperCase()}</div>
            </div>
            <div class="score-item">
              <div class="score-label">Strength Score</div>
              <div class="score-value">${(data.strength * 100).toFixed(0)}/100</div>
            </div>
            <div class="score-item">
              <div class="score-label">Time to Crack</div>
              <div class="score-value" style="font-size: 18px; color: #666666;">${data.crackTime}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Recommendations</div>
          ${data.suggestions.map(suggestion => `
            <div class="list-item">
              <div class="bullet">→</div>
              <div class="list-text">${suggestion}</div>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Password Security Best Practices</div>
          <div class="list-item">
            <div class="bullet">✓</div>
            <div class="list-text">Use a mix of uppercase, lowercase, numbers, and special characters</div>
          </div>
          <div class="list-item">
            <div class="bullet">✓</div>
            <div class="list-text">Make your password at least 12 characters long</div>
          </div>
          <div class="list-item">
            <div class="bullet">✓</div>
            <div class="list-text">Avoid using dictionary words or personal information</div>
          </div>
          <div class="list-item">
            <div class="bullet">✓</div>
            <div class="list-text">Use unique passwords for different accounts</div>
          </div>
          <div class="list-item">
            <div class="bullet">✓</div>
            <div class="list-text">Consider using a password manager to store passwords securely</div>
          </div>
        </div>

        <div class="footer">
          <p><strong>CyberShield-AI Password Strength Report</strong></p>
          <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
        </div>

        <div class="disclaimer">
          <strong>⚠️ Disclaimer:</strong> This report is generated by AI for educational and demonstration purposes. For critical security decisions, consult with qualified security professionals.
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}
