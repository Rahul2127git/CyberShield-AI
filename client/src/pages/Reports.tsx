import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Download, Trash2, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { trackEvent } from "@/lib/analytics";

interface Scan {
  input: string;
  type: string;
  riskLevel: "low" | "medium" | "high";
  timestamp: string;
  details?: string;
  findings?: string[];
  recommendations?: string[];
}

export default function Reports() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [filteredScans, setFilteredScans] = useState<Scan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");

  useEffect(() => {
    // Load from localStorage
    const savedScans = localStorage.getItem("cst_scans");
    if (savedScans) {
      const parsed = JSON.parse(savedScans);
      setScans(parsed);
      setFilteredScans(parsed);
    }
  }, []);

  useEffect(() => {
    let filtered = scans;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((scan) => scan.input.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((scan) => scan.type === filterType);
    }

    // Filter by risk level
    if (filterRisk !== "all") {
      filtered = filtered.filter((scan) => scan.riskLevel === filterRisk);
    }

    setFilteredScans(filtered);
  }, [searchTerm, filterType, filterRisk, scans]);

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all scan history?")) {
      setScans([]);
      setFilteredScans([]);
      localStorage.removeItem("cst_scans");
    }
  };

  const handleDeleteScan = (index: number) => {
    const newScans = scans.filter((_, i) => i !== index);
    setScans(newScans);
    localStorage.setItem("cst_scans", JSON.stringify(newScans));
  };

  const getRiskScore = (level: string): number => {
    switch (level) {
      case "high":
        return 75;
      case "medium":
        return 50;
      case "low":
        return 25;
      default:
        return 0;
    }
  };

  const generateProfessionalPDF = (scan: Scan) => {
    // Track: PDF report download

    const riskScore = getRiskScore(scan.riskLevel);
    const reportId = `RPT-${Date.now().toString().slice(-6)}`;
    const generatedDate = new Date().toLocaleDateString();

    const findings = scan.findings || [
      `Analysis of ${scan.type} completed`,
      `Risk Level: ${scan.riskLevel.toUpperCase()}`,
      `Input: ${scan.input}`,
    ];

    const recommendations = scan.recommendations || [
      "Review security configurations regularly",
      "Implement recommended security measures",
      "Monitor for future threats",
      "Keep security tools updated",
    ];

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CyberShield-AI Security Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 0;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #0B0F14;
              color: #E6EDF3;
              line-height: 1.6;
            }
            
            .container {
              max-width: 900px;
              margin: 0 auto;
              background: #1a1f2e;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            
            .header {
              background: linear-gradient(135deg, #0B0F14 0%, #1a1f2e 100%);
              border-bottom: 2px solid #00C896;
              padding: 40px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            
            .header-left h1 {
              font-size: 28px;
              font-weight: bold;
              color: #E6EDF3;
              margin-bottom: 8px;
            }
            
            .header-meta {
              font-size: 12px;
              color: #8B949E;
              line-height: 1.8;
            }
            
            .header-right {
              background: #00C896;
              color: #0B0F14;
              padding: 12px 20px;
              border-radius: 6px;
              font-weight: 600;
              font-size: 14px;
            }
            
            .content {
              padding: 40px;
              flex: 1;
            }
            
            .score-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 40px;
            }
            
            .score-card {
              background: #0B0F14;
              border: 1px solid #30363D;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
            }
            
            .score-label {
              font-size: 14px;
              color: #8B949E;
              margin-bottom: 16px;
            }
            
            .score-circle {
              width: 120px;
              height: 120px;
              margin: 0 auto 20px;
              background: conic-gradient(#00C896 0deg, #00C896 ${riskScore * 3.6}deg, #30363D ${riskScore * 3.6}deg);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: bold;
              color: #00C896;
            }
            
            .risk-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 600;
              font-size: 14px;
              margin-top: 12px;
            }
            
            .risk-high { background: #FF6B6B; color: white; }
            .risk-medium { background: #FFB84D; color: white; }
            .risk-low { background: #00C896; color: white; }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
            }
            
            .summary-stat {
              background: #1a1f2e;
              border: 1px solid #30363D;
              border-radius: 6px;
              padding: 12px;
              text-align: center;
            }
            
            .summary-stat-value {
              font-size: 20px;
              font-weight: bold;
              color: #00C896;
              margin-bottom: 4px;
            }
            
            .summary-stat-label {
              font-size: 11px;
              color: #8B949E;
            }
            
            .section {
              margin-bottom: 40px;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #E6EDF3;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 2px solid #00C896;
            }
            
            .summary-text {
              background: #0B0F14;
              border-left: 4px solid #00C896;
              padding: 16px;
              border-radius: 4px;
              line-height: 1.6;
              color: #C9D1D9;
              font-size: 14px;
            }
            
            .findings-list {
              background: #0B0F14;
              border: 1px solid #30363D;
              border-radius: 8px;
              padding: 20px;
            }
            
            .finding-item {
              display: flex;
              gap: 12px;
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px solid #30363D;
            }
            
            .finding-item:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            
            .finding-icon {
              color: #FF6B6B;
              font-weight: bold;
              flex-shrink: 0;
            }
            
            .finding-text {
              color: #C9D1D9;
              font-size: 14px;
              line-height: 1.5;
            }
            
            .recommendations-list {
              background: #0B0F14;
              border: 1px solid #30363D;
              border-radius: 8px;
              padding: 20px;
            }
            
            .recommendation-item {
              display: flex;
              gap: 12px;
              margin-bottom: 16px;
              padding: 12px;
              background: #1a1f2e;
              border-left: 4px solid #00C896;
              border-radius: 4px;
            }
            
            .recommendation-item:last-child {
              margin-bottom: 0;
            }
            
            .recommendation-number {
              color: #00C896;
              font-weight: bold;
              flex-shrink: 0;
              min-width: 24px;
            }
            
            .recommendation-text {
              color: #C9D1D9;
              font-size: 14px;
              line-height: 1.5;
            }
            
            .risk-assessment {
              background: #0B0F14;
              border: 1px solid #30363D;
              border-radius: 8px;
              padding: 20px;
            }
            
            .risk-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px solid #30363D;
            }
            
            .risk-item:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            
            .risk-item-label {
              color: #C9D1D9;
            }
            
            .risk-item-value {
              color: #00C896;
              font-weight: 600;
            }
            
            .disclaimer {
              background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05));
              border: 1px solid #FF6B6B;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 40px;
              display: flex;
              gap: 12px;
            }
            
            .disclaimer-icon {
              color: #FF6B6B;
              flex-shrink: 0;
              font-weight: bold;
            }
            
            .disclaimer-text {
              color: #C9D1D9;
              font-size: 12px;
              line-height: 1.5;
            }
            
            .footer {
              background: #0B0F14;
              border-top: 1px solid #30363D;
              padding: 20px 40px;
              text-align: center;
              color: #8B949E;
              font-size: 12px;
            }
            
            .footer-text {
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-left">
                <h1>🛡️ CyberShield-AI Security Report</h1>
                <div class="header-meta">
                  <div>Report ID: ${reportId}</div>
                  <div>Generated: ${generatedDate}</div>
                  <div>Type: ${scan.type}</div>
                </div>
              </div>
              <div class="header-right">📥 Download PDF</div>
            </div>
            
            <div class="content">
              <div class="score-section">
                <div class="score-card">
                  <div class="score-label">Overall Security Score</div>
                  <div class="score-circle">${riskScore}</div>
                  <div class="score-label">out of 100</div>
                  <div class="risk-badge risk-${scan.riskLevel}">${scan.riskLevel.toUpperCase()}</div>
                </div>
                <div class="score-card">
                  <div class="score-label">Report Summary</div>
                  <div class="summary-grid">
                    <div class="summary-stat">
                      <div class="summary-stat-value">${findings.length}</div>
                      <div class="summary-stat-label">Findings</div>
                    </div>
                    <div class="summary-stat">
                      <div class="summary-stat-value">${recommendations.length}</div>
                      <div class="summary-stat-label">Recommendations</div>
                    </div>
                    <div class="summary-stat">
                      <div class="summary-stat-value">${new Date(scan.timestamp).toLocaleDateString()}</div>
                      <div class="summary-stat-label">Scanned</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">📋 Executive Summary</div>
                <div class="summary-text">
                  ${scan.details || `Security analysis of ${scan.type} completed. The scanned item has been assessed with a ${scan.riskLevel.toUpperCase()} risk level. This report provides detailed findings and personalized recommendations to improve security posture.`}
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">🔍 Key Findings</div>
                <div class="findings-list">
                  ${findings
                    .map(
                      (finding) => `
                    <div class="finding-item">
                      <div class="finding-icon">⚠️</div>
                      <div class="finding-text">${finding}</div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">💡 Personalized Recommendations</div>
                <div class="recommendations-list">
                  ${recommendations
                    .map(
                      (rec, idx) => `
                    <div class="recommendation-item">
                      <div class="recommendation-number">${idx + 1}</div>
                      <div class="recommendation-text">${rec}</div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">⚠️ Risk Assessment</div>
                <div class="risk-assessment">
                  <div class="risk-item">
                    <span class="risk-item-label">Risk Level:</span>
                    <span class="risk-item-value">${scan.riskLevel.toUpperCase()}</span>
                  </div>
                  <div class="risk-item">
                    <span class="risk-item-label">Security Score:</span>
                    <span class="risk-item-value">${riskScore}/100</span>
                  </div>
                  <div class="risk-item">
                    <span class="risk-item-label">Analysis Type:</span>
                    <span class="risk-item-value">${scan.type}</span>
                  </div>
                  <div class="risk-item">
                    <span class="risk-item-label">Scan Date:</span>
                    <span class="risk-item-value">${new Date(scan.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div class="disclaimer">
                <div class="disclaimer-icon">⚠️</div>
                <div class="disclaimer-text">
                  <strong>Security Disclaimer:</strong> This report is generated by CyberShield-AI for educational and informational purposes. Always consult with qualified security professionals for critical systems. This analysis is not a substitute for professional security audits.
                </div>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-text">CyberShield-AI © 2026 · Professional Security Analysis Platform</div>
              <div class="footer-text">Report generated on ${new Date().toLocaleString()}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create and download HTML version
    const htmlElement = document.createElement("a");
    htmlElement.setAttribute(
      "href",
      "data:text/html;charset=utf-8," + encodeURIComponent(html)
    );
    htmlElement.setAttribute(
      "download",
      `CyberShield-Report-${reportId}.html`
    );
    htmlElement.style.display = "none";
    document.body.appendChild(htmlElement);
    htmlElement.click();
    document.body.removeChild(htmlElement);

    // Try to generate PDF using html2pdf if available
    setTimeout(() => {
      try {
        const element = document.createElement("div");
        element.innerHTML = html;
        const opt = {
          margin: 0,
          filename: `CyberShield-Report-${reportId}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        };
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => {
          (window as any).html2pdf().set(opt).from(element).save();
        };
        document.head.appendChild(script);
      } catch (error) {
        console.log("PDF generation attempted. HTML file downloaded successfully.");
      }
    }, 100);
  };

  const handleExportReport = () => {
    const report = filteredScans
      .map(
        (scan) =>
          `${scan.timestamp} | ${scan.type} | ${scan.riskLevel.toUpperCase()} | ${scan.input}`
      )
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(report));
    element.setAttribute("download", `security-report-${Date.now()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const stats = {
    total: scans.length,
    high: scans.filter((s) => s.riskLevel === "high").length,
    medium: scans.filter((s) => s.riskLevel === "medium").length,
    low: scans.filter((s) => s.riskLevel === "low").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-poppins mb-2">Scan Reports</h1>
          <p className="text-muted-foreground">View and manage your security analysis history with professional PDF reports</p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-4">
            <p className="text-muted-foreground text-sm mb-1">Total Scans</p>
            <p className="text-2xl font-bold font-poppins">{stats.total}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-muted-foreground text-sm mb-1">High Risk</p>
            <p className="text-2xl font-bold font-poppins text-red-400">{stats.high}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-muted-foreground text-sm mb-1">Medium Risk</p>
            <p className="text-2xl font-bold font-poppins text-yellow-400">{stats.medium}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-muted-foreground text-sm mb-1">Low Risk</p>
            <p className="text-2xl font-bold font-poppins text-green-400">{stats.low}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold font-poppins mb-4">Filters & Search</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Search</label>
              <Input
                placeholder="Search scans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
              >
                <option value="all">All Types</option>
                <option value="Vulnerability Scan">Vulnerability Scan</option>
                <option value="Phishing Detection">Phishing Detection</option>
                <option value="Password Analysis">Password Analysis</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Risk Level</label>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
              >
                <option value="all">All Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Reports List */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-poppins">Scan History</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleExportReport}
                disabled={filteredScans.length === 0}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export All
              </Button>
              <Button
                onClick={handleClearAll}
                disabled={scans.length === 0}
                variant="outline"
                className="gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </div>

          {filteredScans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {scans.length === 0 ? "No scans yet. Start analyzing to build your report history." : "No scans match your filters."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredScans.map((scan, idx) => (
                <div key={idx} className="bg-secondary/30 border border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`risk-badge risk-${scan.riskLevel}`}>{scan.riskLevel.toUpperCase()}</span>
                        <span className="font-mono text-sm text-muted-foreground">{scan.type}</span>
                      </div>
                      <p className="font-mono text-sm max-w-2xl truncate">{scan.input}</p>
                      <p className="text-xs text-muted-foreground mt-2">{scan.timestamp}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => generateProfessionalPDF(scan)}
                        className="bg-accent hover:bg-accent/80 text-dark-bg gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        PDF Report
                      </Button>
                      <button
                        onClick={() => handleDeleteScan(scans.indexOf(scan))}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Export Info */}
        <Card className="bg-secondary/30 border-border p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Download professional PDF reports to share with team members or for compliance documentation. Each report includes executive summary, findings, and personalized recommendations.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
