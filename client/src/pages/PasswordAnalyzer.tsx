import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect as useReactEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle, Lock, Download, AlertCircle, TrendingUp, Eye, EyeOff, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { trackPasswordAnalysis, trackPageView, trackFeatureUsage } from "@/lib/analytics";
import { downloadPDFReport } from "@/lib/html-to-pdf";

interface PasswordResult {
  strength: number;
  level: string;
  crackTime: string;
  suggestions: string[];
  entropyScore: number;
  charsetSize: number;
  vulnerabilities: string[];
  timestamp: Date;
}

export default function PasswordAnalyzer() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<PasswordResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useReactEffect(() => {
    trackPageView('/password', 'Password Analyzer');
  }, []);

  const analyzePasswordMutation = trpc.security.analyzePassword.useQuery(
    { password },
    { enabled: false }
  );

  const handleAnalyze = async () => {
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    setError("");
    setResult(null);
    trackFeatureUsage('password_analysis_initiated', { password_length: password.length });

    try {
      const response = await analyzePasswordMutation.refetch();
      if (response.data) {
        setResult(response.data);
        trackPasswordAnalysis(password.length, response.data.level);
      }
    } catch (err) {
      setError("Failed to analyze password. Please try again.");
      console.error(err);
    }
  };

  const getStrengthColor = (level: string) => {
    switch (level) {
      case "strong":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "weak":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStrengthBgColor = (level: string) => {
    switch (level) {
      case "strong":
        return "bg-green-500/10 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "weak":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStrengthBadgeColor = (level: string) => {
    switch (level) {
      case "strong":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "weak":
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
          <h1 className="text-4xl font-bold font-poppins mb-2">Password Analyzer</h1>
          <p className="text-muted-foreground">Comprehensive password strength analysis with entropy calculation, vulnerability detection, and security recommendations</p>
        </div>

        {/* Input Section */}
        <Card className="bg-card border-border p-6 hover:border-accent/50 transition-colors">
          <h3 className="text-lg font-bold font-poppins mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            Enter Password to Analyze
          </h3>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={analyzePasswordMutation.isLoading || !password.trim()}
              className="w-full bg-accent hover:bg-accent/90 text-primary-foreground font-semibold"
            >
              {analyzePasswordMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Password
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Strength Assessment Card */}
            <Card className={`border-2 p-8 ${getStrengthBgColor(result.level)}`}>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">Password Strength Assessment</h2>
                    <p className="text-sm text-muted-foreground">
                      {result.level === 'strong' ? 'Excellent password strength. This password is highly resistant to brute-force attacks.' :
                       result.level === 'medium' ? 'Moderate password strength. Consider adding more complexity for better security.' :
                       'Weak password. Please use a stronger password with more character variety.'}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border ${getStrengthBadgeColor(result.level)}`}>
                    <div className={`text-3xl font-bold ${getStrengthColor(result.level)}`}>
                      {result.level.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Strength Score</p>
                    <p className="text-2xl font-bold text-accent">{(result.strength * 100).toFixed(0)}%</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Entropy</p>
                    <p className="text-2xl font-bold text-accent">{result.entropyScore.toFixed(1)} bits</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Charset Size</p>
                    <p className="text-2xl font-bold text-accent">{result.charsetSize}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-foreground">Overall Strength</p>
                    <p className="text-sm font-bold text-accent">
                      {(result.strength * 100).toFixed(0)}/100
                    </p>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden border border-secondary">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.level === "strong"
                          ? "bg-gradient-to-r from-green-500 to-green-400"
                          : result.level === "medium"
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                          : "bg-gradient-to-r from-red-500 to-red-400"
                      }`}
                      style={{ width: `${result.strength * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-secondary/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Estimated Crack Time</p>
                  <p className="text-lg font-bold text-accent">{result.crackTime}</p>
                  <p className="text-xs text-muted-foreground mt-1">Time to crack with 1 billion guesses/second</p>
                </div>
              </div>
            </Card>

            {/* Vulnerabilities */}
            {result.vulnerabilities && result.vulnerabilities.length > 0 && (
              <Card className="bg-card border-border p-6">
                <h3 className="text-lg font-bold font-poppins mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Security Vulnerabilities ({result.vulnerabilities.length})
                </h3>
                <div className="space-y-3">
                  {result.vulnerabilities.map((vuln, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:border-red-500/40 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{vuln}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {result.vulnerabilities && result.vulnerabilities.length === 0 && (
              <Card className="bg-green-500/10 border-green-500/20 border-2 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold font-poppins text-green-400 mb-1">No Vulnerabilities Detected</h3>
                    <p className="text-sm text-muted-foreground">Your password does not contain common patterns or known weaknesses.</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Character Analysis */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Character Composition Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Length</p>
                  <p className="text-xl font-bold text-accent">{password.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">characters</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Lowercase</p>
                  <p className="text-xl font-bold text-accent">{(password.match(/[a-z]/g) || []).length}</p>
                  <p className="text-xs text-muted-foreground mt-1">a-z</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Uppercase</p>
                  <p className="text-xl font-bold text-accent">{(password.match(/[A-Z]/g) || []).length}</p>
                  <p className="text-xs text-muted-foreground mt-1">A-Z</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Numbers</p>
                  <p className="text-xl font-bold text-accent">{(password.match(/\d/g) || []).length}</p>
                  <p className="text-xs text-muted-foreground mt-1">0-9</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Special</p>
                  <p className="text-xl font-bold text-accent">{(password.match(/[^a-zA-Z0-9]/g) || []).length}</p>
                  <p className="text-xs text-muted-foreground mt-1">!@#$%^&*</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Unique Chars</p>
                  <p className="text-xl font-bold text-accent">{new Set(password).size}</p>
                  <p className="text-xs text-muted-foreground mt-1">variety</p>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            {result.suggestions && result.suggestions.length > 0 && (
              <Card className="bg-card border-border p-6">
                <h3 className="text-lg font-bold font-poppins mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-accent" />
                  Improvement Recommendations
                </h3>
                <div className="space-y-3">
                  {result.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <span className="text-accent font-bold text-lg flex-shrink-0 mt-0">→</span>
                      <span className="text-sm text-foreground">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Best Practices */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4">Password Security Best Practices</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm font-semibold text-accent mb-2">✓ Do's</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use at least 12 characters</li>
                    <li>• Mix uppercase, lowercase, numbers, and symbols</li>
                    <li>• Use unique passwords for each account</li>
                    <li>• Enable two-factor authentication</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm font-semibold text-accent mb-2">✗ Don'ts</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Don't use personal information (name, DOB)</li>
                    <li>• Don't use dictionary words</li>
                    <li>• Don't reuse passwords</li>
                    <li>• Don't share passwords via email/chat</li>
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
                  const strengthColors = {
                    strong: '#00C896',
                    medium: '#FFA500',
                    weak: '#FF6B6B',
                  };
                  const strengthColor = strengthColors[result.level as keyof typeof strengthColors] || '#8B949E';
                  
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
                        .strength-badge {
                          display: inline-block;
                          padding: 8px 16px;
                          border-radius: 4px;
                          font-weight: bold;
                          font-size: 14px;
                          margin-bottom: 15px;
                          background: ${strengthColor}20;
                          color: ${strengthColor};
                          border: 1px solid ${strengthColor}40;
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
                          background: ${strengthColor};
                          width: ${result.strength * 100}%;
                        }
                        .vulnerability-item {
                          margin-bottom: 12px;
                          padding: 12px;
                          background: #0D1117;
                          border-left: 3px solid #FF6B6B;
                          border-radius: 4px;
                        }
                        .recommendation-item {
                          margin-bottom: 12px;
                          padding: 12px;
                          background: #0D1117;
                          border-left: 3px solid #00C896;
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
                          <div class="title">🔐 Password Analysis Report</div>
                          <div class="subtitle">CyberShield-AI Security Analysis</div>
                          <div class="report-id">Report ID: ${Date.now()}</div>
                        </div>

                        <div class="section">
                          <div class="section-title">Strength Assessment</div>
                          <div class="strength-badge">${result.level.toUpperCase()}</div>
                          <div>Strength Score: ${(result.strength * 100).toFixed(0)}/100</div>
                          <div>Entropy: ${result.entropyScore.toFixed(1)} bits</div>
                          <div>Charset Size: ${result.charsetSize}</div>
                          <div class="score-bar"><div class="score-fill"></div></div>
                        </div>

                        <div class="section">
                          <div class="section-title">Crack Time Estimate</div>
                          <div style="font-size: 16px; font-weight: bold; color: #00C896;">${result.crackTime}</div>
                          <div style="font-size: 12px; color: #8B949E; margin-top: 8px;">Estimated time to crack with 1 billion guesses/second</div>
                        </div>

                        ${result.vulnerabilities && result.vulnerabilities.length > 0 ? `
                        <div class="section">
                          <div class="section-title">Vulnerabilities Found (${result.vulnerabilities.length})</div>
                          ${result.vulnerabilities.map(v => `<div class="vulnerability-item">${v}</div>`).join('')}
                        </div>
                        ` : ''}

                        ${result.suggestions && result.suggestions.length > 0 ? `
                        <div class="section">
                          <div class="section-title">Recommendations</div>
                          ${result.suggestions.map(s => `<div class="recommendation-item">${s}</div>`).join('')}
                        </div>
                        ` : ''}

                        <div class="footer">
                          <p>Generated by CyberShield-AI on ${new Date().toLocaleString()}</p>
                          <p>This report is for informational purposes only. Use strong, unique passwords for all accounts.</p>
                        </div>
                      </div>
                    </body>
                    </html>
                  `;
                  
                  downloadPDFReport(htmlContent, `password-report-${Date.now()}.pdf`);
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
