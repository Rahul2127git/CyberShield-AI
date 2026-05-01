import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect as useReactEffect } from "react";
import { Eye, EyeOff, AlertTriangle, CheckCircle, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { trackPasswordAnalysis, trackPageView, trackFeatureUsage } from "@/lib/analytics";
import { downloadPDFReport } from "@/lib/html-to-pdf";

interface PasswordAnalysis {
  strength: number;
  level: string;
  crackTime: string;
  suggestions: string[];
}

export default function PasswordAnalyzer() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  const analyzePasswordMutation = trpc.security.analyzePassword.useQuery(
    { password },
    { enabled: false }
  );

  useReactEffect(() => {
    trackPageView('/password', 'Password Analyzer');
  }, []);

  useReactEffect(() => {
    if (password.trim()) {
      const timer = setTimeout(() => {
        analyzePasswordMutation.refetch().then(result => {
          if (result.data) {
            setAnalysis(result.data);
            trackPasswordAnalysis(result.data.strength, result.data.level);
          }
        });
      }, 300); // Debounce
      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
    }
  }, [password]);

  const getStrengthColor = (level: string) => {
    switch (level) {
      case "weak":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "strong":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getStrengthBarColor = (level: string) => {
    switch (level) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getScoreFromLevel = (level: string, strength: number) => {
    return Math.round(strength * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-poppins mb-2">Password Analyzer</h1>
          <p className="text-muted-foreground">Evaluate password strength using machine learning and get improvement suggestions</p>
        </div>

        {/* Input Section */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold font-poppins mb-4">Enter Password</h3>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password to analyze..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Your password is analyzed locally using ML models and never stored.</p>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Strength Meter */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4">Strength Assessment</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Strength</span>
                  <span className={`font-bold font-poppins text-lg ${getStrengthColor(analysis.level)}`}>
                    {analysis.level.toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getStrengthBarColor(analysis.level)}`}
                    style={{ width: `${analysis.strength * 100}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Score: {getScoreFromLevel(analysis.level, analysis.strength)}/100</p>
              </div>
            </Card>

            {/* Crack Time */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4">Estimated Crack Time</h3>
              <p className="text-3xl font-bold font-poppins text-accent">{analysis.crackTime}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Assuming 1 billion guesses per second with brute force attack
              </p>
            </Card>

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <Card className="bg-card border-border p-6">
                <h3 className="text-lg font-bold font-poppins mb-4">Improvement Suggestions</h3>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis.suggestions.length === 0 && (
              <Card className="bg-green-500/10 border-green-500/20 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold font-poppins text-green-400 mb-1">Excellent Password!</h3>
                    <p className="text-sm text-muted-foreground">Your password meets all security best practices and has strong entropy.</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Download Report Button */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  const strengthColors = {
                    weak: '#FF6B6B',
                    medium: '#FFA500',
                    strong: '#00C896',
                  };
                  const strengthColor = strengthColors[analysis.level as keyof typeof strengthColors] || '#8B949E';
                  
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
                          <div class="report-id">Report ID: PWD-${Date.now()}</div>
                          <div class="report-id">Generated: ${new Date().toLocaleString()}</div>
                        </div>

                        <div class="score-section">
                          <div class="score-row">
                            <div>
                              <div class="score-label">Strength Level</div>
                              <div class="strength-badge">${analysis.level.toUpperCase()}</div>
                            </div>
                            <div>
                              <div class="score-label">Score</div>
                              <div class="score-value">${getScoreFromLevel(analysis.level, analysis.strength)}/100</div>
                            </div>
                            <div>
                              <div class="score-label">Estimated Crack Time</div>
                              <div class="score-value">${analysis.crackTime}</div>
                            </div>
                          </div>
                        </div>

                        <div class="section">
                          <div class="section-title">Improvement Suggestions</div>
                          ${analysis.suggestions.length > 0 
                            ? analysis.suggestions.map(s => `<div class="list-item"><div class="bullet">•</div><div class="list-text">${s}</div></div>`).join('') 
                            : '<div class="list-text" style="color: #00C896;">✓ Your password is excellent! No improvements needed.</div>'}
                        </div>

                        <div class="section">
                          <div class="section-title">Best Practices</div>
                          <div class="list-item"><div class="bullet">•</div><div class="list-text">Use unique passwords for each account</div></div>
                          <div class="list-item"><div class="bullet">•</div><div class="list-text">Use a password manager to store passwords securely</div></div>
                          <div class="list-item"><div class="bullet">•</div><div class="list-text">Enable two-factor authentication when available</div></div>
                          <div class="list-item"><div class="bullet">•</div><div class="list-text">Never share your password with anyone</div></div>
                          <div class="list-item"><div class="bullet">•</div><div class="list-text">Change passwords if you suspect compromise</div></div>
                        </div>

                        <div class="footer">
                          <p>CyberShield-AI Password Strength Report</p>
                          <p>Generated on ${new Date().toLocaleString()}</p>
                        </div>

                        <div class="disclaimer">
                          ⚠️ Disclaimer: This report is generated by AI for educational and demonstration purposes. For critical security decisions, consult with qualified security professionals.
                        </div>
                      </div>
                    </body>
                    </html>
                  `;
                  
                  downloadPDFReport(htmlContent, `password-report-${new Date().getTime()}.pdf`);
                  trackFeatureUsage('download_password_report', { strength_level: analysis.level });
                }}
                className="bg-accent hover:bg-accent/90 text-primary-foreground gap-2"
              >
                <Download className="w-4 h-4" />
                📥 Download Report
              </Button>
            </div>

            {/* Best Practices */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4">Password Best Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use unique passwords for each account</li>
                <li>• Use a password manager to store passwords securely</li>
                <li>• Enable two-factor authentication when available</li>
                <li>• Never share your password with anyone</li>
                <li>• Change passwords if you suspect compromise</li>
                <li>• Avoid using personal information in passwords</li>
                <li>• Use at least 12 characters for strong passwords</li>
                <li>• Mix uppercase, lowercase, numbers, and special characters</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
