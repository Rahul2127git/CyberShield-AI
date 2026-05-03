import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle, Shield, Download, AlertCircle, TrendingUp, Eye, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { trackPhishingDetection, trackPageView, trackFeatureUsage } from "@/lib/analytics";
import { downloadPDFReport } from "@/lib/html-to-pdf";

interface PhishingResult {
  url: string;
  phishingProbability: number;
  riskLevel: string;
  confidence: number;
  threatIndicators: string[];
  riskFactors: string[];
  timestamp: Date;
}

export default function PhishingDetection() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<PhishingResult | null>(null);
  const [error, setError] = useState("");
  
  useEffect(() => {
    trackPageView('/phishing', 'Phishing Detection');
  }, []);
  
  const analyzePhishingMutation = trpc.security.analyzePhishing.useQuery(
    { url },
    { enabled: false }
  );

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setError("");
    setResult(null);
    trackFeatureUsage('phishing_detection_initiated', { url_domain: new URL(url).hostname });

    try {
      const response = await analyzePhishingMutation.refetch();
      if (response.data) {
        setResult(response.data);
        trackPhishingDetection(url, response.data.phishingProbability, response.data.riskLevel === 'high');
      }
    } catch (err) {
      setError("Failed to analyze URL. Please try again.");
      console.error(err);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-500/10 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "high":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-poppins mb-2">Phishing Detection</h1>
          <p className="text-muted-foreground">Advanced ML-powered analysis to detect phishing URLs, social engineering tactics, and suspicious domain patterns</p>
        </div>

        {/* Input Section */}
        <Card className="bg-card border-border p-6 hover:border-accent/50 transition-colors">
          <h3 className="text-lg font-bold font-poppins mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent" />
            Analyze URL for Phishing Threats
          </h3>
          <div className="space-y-4">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={analyzePhishingMutation.isLoading || !url.trim()}
              className="w-full bg-accent hover:bg-accent/90 text-primary-foreground font-semibold"
            >
              {analyzePhishingMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Analyze for Phishing
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Risk Assessment Card */}
            <Card className={`border-2 p-8 ${getRiskBgColor(result.riskLevel)}`}>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">Phishing Risk Assessment</h2>
                    <p className="text-sm text-muted-foreground">
                      {result.riskLevel === 'high' ? 'This URL shows strong indicators of a phishing attempt.' : 
                       result.riskLevel === 'medium' ? 'This URL has some suspicious characteristics.' :
                       'This URL appears to be legitimate.'}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border ${getRiskBadgeColor(result.riskLevel)}`}>
                    <div className={`text-3xl font-bold ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Phishing Probability</p>
                    <p className="text-2xl font-bold text-accent">{(result.phishingProbability * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Confidence Score</p>
                    <p className="text-2xl font-bold text-accent">{(result.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-foreground">Risk Score</p>
                    <p className="text-sm font-bold text-accent">
                      {(result.phishingProbability * 100).toFixed(1)}/100
                    </p>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden border border-secondary">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.riskLevel === "low"
                          ? "bg-gradient-to-r from-green-500 to-green-400"
                          : result.riskLevel === "medium"
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                          : "bg-gradient-to-r from-red-500 to-red-400"
                      }`}
                      style={{ width: `${result.phishingProbability * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-secondary/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">URL Analyzed</p>
                  <p className="text-sm text-foreground break-all font-mono bg-secondary/30 p-2 rounded">{result.url}</p>
                </div>
              </div>
            </Card>

            {/* Threat Indicators */}
            {result.threatIndicators && result.threatIndicators.length > 0 && (
              <Card className="bg-card border-border p-6">
                <h3 className="text-lg font-bold font-poppins mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Threat Indicators Detected ({result.threatIndicators.length})
                </h3>
                <div className="space-y-3">
                  {result.threatIndicators.map((indicator, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:border-red-500/40 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{indicator}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Risk Factors */}
            {result.riskFactors && result.riskFactors.length > 0 && (
              <Card className="bg-card border-border p-6">
                <h3 className="text-lg font-bold font-poppins mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Risk Factors Analysis
                </h3>
                <div className="space-y-3">
                  {result.riskFactors.map((factor, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                      <span className="text-accent font-bold text-lg flex-shrink-0 mt-0">•</span>
                      <span className="text-sm text-foreground">{factor}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Security Summary */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Security Summary
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-foreground mb-2"><span className="font-semibold">Analysis Result:</span></p>
                  <p className="text-sm text-muted-foreground">
                    {result.riskLevel === 'high' 
                      ? '⚠️ HIGH RISK: This URL exhibits characteristics commonly associated with phishing attacks. Do not enter credentials or personal information.'
                      : result.riskLevel === 'medium'
                      ? '⚠️ MEDIUM RISK: This URL has some suspicious characteristics. Exercise caution and verify the domain before interacting.'
                      : '✓ LOW RISK: This URL appears to be legitimate based on analysis. However, always verify URLs independently.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Protection Tips */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4">How to Protect Yourself</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm font-semibold text-accent mb-2">🔍 Before Clicking</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Hover over links to see the actual URL</li>
                    <li>• Check for HTTPS and padlock icon</li>
                    <li>• Verify sender email address</li>
                    <li>• Look for spelling errors in domain</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm font-semibold text-accent mb-2">🛡️ General Safety</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Never share passwords via email</li>
                    <li>• Enable two-factor authentication</li>
                    <li>• Keep software updated</li>
                    <li>• Report suspicious emails</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Analysis completed at {new Date(result.timestamp).toLocaleString()}</span>
            </div>

            {/* Download Report Button */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  const riskColors = {
                    low: '#00C896',
                    medium: '#FFA500',
                    high: '#FF6B6B',
                  };
                  const riskColor = riskColors[result.riskLevel as keyof typeof riskColors] || '#8B949E';
                  
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
                          margin-bottom: 5px;
                        }
                        .subtitle { 
                          font-size: 14px; 
                          color: #8B949E;
                        }
                        .report-id {
                          font-size: 12px;
                          color: #8B949E;
                          margin-top: 10px;
                          font-family: monospace;
                        }
                        .section {
                          margin-bottom: 30px;
                          padding: 20px;
                          background: #161B22;
                          border-left: 4px solid #00C896;
                          border-radius: 4px;
                        }
                        .section-title {
                          font-size: 18px;
                          font-weight: bold;
                          color: #00C896;
                          margin-bottom: 15px;
                        }
                        .risk-badge {
                          display: inline-block;
                          padding: 8px 16px;
                          border-radius: 4px;
                          font-weight: bold;
                          font-size: 14px;
                          margin-bottom: 15px;
                          background: ${riskColor}20;
                          color: ${riskColor};
                          border: 1px solid ${riskColor}40;
                        }
                        .score-bar {
                          background: #30363D;
                          height: 8px;
                          border-radius: 4px;
                          overflow: hidden;
                          margin-bottom: 10px;
                        }
                        .score-fill {
                          height: 100%;
                          background: ${riskColor};
                          width: ${result.phishingProbability * 100}%;
                        }
                        .threat-item {
                          margin-bottom: 12px;
                          padding: 12px;
                          background: #0D1117;
                          border-left: 3px solid #FF6B6B;
                          border-radius: 4px;
                        }
                        .footer {
                          margin-top: 40px;
                          padding-top: 20px;
                          border-top: 1px solid #30363D;
                          font-size: 12px;
                          color: #8B949E;
                          text-align: center;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <div class="title">🎣 Phishing Detection Report</div>
                          <div class="subtitle">CyberShield-AI Security Analysis</div>
                          <div class="report-id">Report ID: ${Date.now()}</div>
                        </div>

                        <div class="section">
                          <div class="section-title">Risk Assessment</div>
                          <div class="risk-badge">${result.riskLevel.toUpperCase()}</div>
                          <div>Phishing Probability: ${(result.phishingProbability * 100).toFixed(1)}%</div>
                          <div>Confidence Score: ${(result.confidence * 100).toFixed(1)}%</div>
                          <div class="score-bar"><div class="score-fill"></div></div>
                        </div>

                        <div class="section">
                          <div class="section-title">URL Analyzed</div>
                          <div style="word-break: break-all; font-family: monospace; font-size: 12px; color: #8B949E;">${result.url}</div>
                        </div>

                        ${result.threatIndicators && result.threatIndicators.length > 0 ? `
                        <div class="section">
                          <div class="section-title">Threat Indicators (${result.threatIndicators.length})</div>
                          ${result.threatIndicators.map(t => `<div class="threat-item">${t}</div>`).join('')}
                        </div>
                        ` : ''}

                        ${result.riskFactors && result.riskFactors.length > 0 ? `
                        <div class="section">
                          <div class="section-title">Risk Factors</div>
                          ${result.riskFactors.map(f => `<div class="threat-item">${f}</div>`).join('')}
                        </div>
                        ` : ''}

                        <div class="footer">
                          <p>Generated by CyberShield-AI on ${new Date().toLocaleString()}</p>
                          <p>This report is for informational purposes only. Always verify URLs independently.</p>
                        </div>
                      </div>
                    </body>
                    </html>
                  `;
                  
                  downloadPDFReport(htmlContent, `phishing-report-${Date.now()}.pdf`);
                }}
                className="flex-1 bg-accent hover:bg-accent/90 text-primary-foreground font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
