import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle, Shield, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { trackPhishingDetection, trackPageView, trackFeatureUsage } from "@/lib/analytics";
import { downloadPDFReport } from "@/lib/html-to-pdf";

interface PhishingResult {
  url: string;
  phishingProbability: number;
  riskLevel: string;
  confidence: number;
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
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-red-500";
      default:
        return "text-gray-500";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Phishing Detection</h1>
        <p className="text-muted-foreground">
          Analyze URLs and detect potential phishing threats using machine learning.
        </p>
      </div>

      <Card className="p-6 border-border bg-card">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Enter URL to Analyze
            </label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={analyzePhishingMutation.isLoading || !url.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-primary-foreground"
          >
            {analyzePhishingMutation.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Analyze URL
              </>
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className={`p-6 border ${getRiskBgColor(result.riskLevel)}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Analysis Results</h2>
              <div className={`text-2xl font-bold ${getRiskColor(result.riskLevel)}`}>
                {result.riskLevel.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phishing Probability</p>
                <p className="text-2xl font-bold text-foreground">
                  {(result.phishingProbability * 100).toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold text-foreground">
                  {(result.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">URL Analyzed</p>
              <p className="text-sm text-muted-foreground break-all">{result.url}</p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-background/50 rounded">
              {result.riskLevel === "low" ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {result.riskLevel === "low"
                    ? "This URL appears to be legitimate"
                    : result.riskLevel === "medium"
                    ? "This URL shows some suspicious characteristics"
                    : "This URL shows high-risk characteristics"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.riskLevel === "low"
                    ? "No major phishing indicators detected."
                    : result.riskLevel === "medium"
                    ? "Exercise caution before clicking or entering credentials."
                    : "Avoid clicking this link and do not enter any personal information."}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                Analyzed at {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Download Report Button */}
            <div className="flex gap-3 pt-4">
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
                          <div class="report-id">Report ID: PHR-${Date.now()}</div>
                          <div class="report-id">Generated: ${new Date(result.timestamp).toLocaleString()}</div>
                        </div>

                        <div class="score-section">
                          <div class="score-row">
                            <div>
                              <div class="score-label">Risk Level</div>
                              <div class="risk-badge">${result.riskLevel.toUpperCase()}</div>
                            </div>
                            <div>
                              <div class="score-label">Phishing Probability</div>
                              <div class="score-value">${(result.phishingProbability * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <div class="score-label">Confidence</div>
                              <div class="score-value">${(result.confidence * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>

                        <div class="section">
                          <div class="section-title">URL Analyzed</div>
                          <div class="url-text">${result.url}</div>
                        </div>

                        <div class="section">
                          <div class="section-title">Assessment</div>
                          <div class="list-item">
                            <div class="bullet">${result.riskLevel === 'low' ? '✓' : '⚠️'}</div>
                            <div class="list-text">
                              ${result.riskLevel === 'low' 
                                ? 'This URL appears to be legitimate. No major phishing indicators detected.' 
                                : result.riskLevel === 'medium' 
                                ? 'This URL shows some suspicious characteristics. Exercise caution before clicking or entering credentials.' 
                                : 'This URL shows high-risk characteristics. Avoid clicking this link and do not enter any personal information.'}
                            </div>
                          </div>
                        </div>

                        <div class="footer">
                          <p>CyberShield-AI Phishing Detection Report</p>
                          <p>Generated on ${new Date(result.timestamp).toLocaleString()}</p>
                        </div>

                        <div class="disclaimer">
                          ⚠️ Disclaimer: This report is generated by AI for educational and demonstration purposes. For critical security decisions, consult with qualified security professionals.
                        </div>
                      </div>
                    </body>
                    </html>
                  `;
                  
                  downloadPDFReport(htmlContent, `phishing-report-${new Date().getTime()}.pdf`);
                  trackFeatureUsage('download_phishing_report', { risk_level: result.riskLevel });
                }}
                className="bg-accent hover:bg-accent/90 text-primary-foreground gap-2"
              >
                <Download className="w-4 h-4" />
                📥 Download Report
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 border-border bg-card">
        <h3 className="text-lg font-bold text-foreground mb-3">How It Works</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-accent">•</span>
            <span>Analyzes domain structure and patterns</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">•</span>
            <span>Detects suspicious keywords and characteristics</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">•</span>
            <span>Uses machine learning trained on real phishing datasets</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">•</span>
            <span>Provides confidence scores for accuracy assessment</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
