import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

interface PhishingResult {
  input: string;
  probability: number;
  keywords: string[];
  domainAnalysis: string;
  timestamp: string;
}

const PHISHING_KEYWORDS = [
  "verify", "confirm", "update", "urgent", "action required", "click here",
  "account suspended", "unusual activity", "reset password", "validate",
  "confirm identity", "security alert", "limited time", "act now",
];

export default function PhishingDetection() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhishingResult | null>(null);

  const analyzePhishing = () => {
    if (!input.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const inputLower = input.toLowerCase();
      let probability = 0;
      const detectedKeywords: string[] = [];

      // Check for phishing keywords
      PHISHING_KEYWORDS.forEach((keyword) => {
        if (inputLower.includes(keyword)) {
          detectedKeywords.push(keyword);
          probability += 15;
        }
      });

      // Check for suspicious patterns
      if (inputLower.includes("@") && !inputLower.includes("http")) {
        // Email analysis
        const emailParts = inputLower.split("@");
        if (emailParts[1].includes("gmail") || emailParts[1].includes("yahoo")) {
          probability += 10;
        }
      } else if (inputLower.includes("http")) {
        // URL analysis
        try {
          const url = new URL(inputLower.startsWith("http") ? inputLower : `https://${inputLower}`);
          const domain = url.hostname;

          if (domain.includes("bit.ly") || domain.includes("tinyurl") || domain.includes("short")) {
            probability += 20;
            detectedKeywords.push("shortened URL");
          }

          if (domain.includes("paypal") || domain.includes("amazon") || domain.includes("bank")) {
            probability += 15;
            detectedKeywords.push("impersonation risk");
          }

          if (url.hostname.split(".").length > 3) {
            probability += 10;
            detectedKeywords.push("subdomain suspicious");
          }
        } catch {}
      }

      // Add randomness for demo
      probability += Math.random() * 15;
      probability = Math.min(100, Math.max(0, probability));

      const domainAnalysis =
        probability > 70
          ? "This appears to be a phishing attempt. Do not click links or provide personal information."
          : probability > 40
            ? "This shows some suspicious characteristics. Exercise caution before interacting."
            : "This appears to be legitimate, but always verify sender information independently.";

      const phishingResult: PhishingResult = {
        input,
        probability: Math.round(probability),
        keywords: detectedKeywords,
        domainAnalysis,
        timestamp: new Date().toLocaleString(),
      };

      setResult(phishingResult);

      // Save to localStorage
      const stats = JSON.parse(localStorage.getItem("cst_stats") || '{"totalScans":0,"threatsDetected":0,"safeScans":0}');
      stats.totalScans++;
      if (probability > 70) stats.threatsDetected++;
      else stats.safeScans++;
      localStorage.setItem("cst_stats", JSON.stringify(stats));

      const scans = JSON.parse(localStorage.getItem("cst_scans") || "[]");
      scans.unshift({
        input: input.substring(0, 50),
        type: "Phishing Detection",
        riskLevel: probability > 70 ? "high" : probability > 40 ? "medium" : "low",
        timestamp: new Date().toLocaleTimeString(),
      });
      localStorage.setItem("cst_scans", JSON.stringify(scans.slice(0, 20)));

      setLoading(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-poppins mb-2">Phishing Detection</h1>
          <p className="text-muted-foreground">Analyze URLs and email content for phishing threats</p>
        </div>

        {/* Input Section */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold font-poppins mb-4">Analyze Content</h3>
          <div className="space-y-3">
            <Textarea
              placeholder="Paste URL, email text, or suspicious content here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-32 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={analyzePhishing}
              disabled={!input.trim() || loading}
              className="bg-accent text-primary-foreground hover:bg-accent/90 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Phishing Probability */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4">Phishing Probability</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className="text-3xl font-bold font-poppins">{result.probability}%</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      result.probability > 70
                        ? "bg-red-500"
                        : result.probability > 40
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${result.probability}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.probability > 70 && "🚨 High risk - Likely phishing"}
                  {result.probability > 40 && result.probability <= 70 && "⚠️ Medium risk - Suspicious"}
                  {result.probability <= 40 && "✓ Low risk - Appears legitimate"}
                </p>
              </div>
            </Card>

            {/* Detected Keywords */}
            {result.keywords.length > 0 && (
              <Card className="bg-card border-border p-6">
                <h3 className="text-lg font-bold font-poppins mb-4">Suspicious Keywords Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((keyword, idx) => (
                    <span key={idx} className="risk-badge risk-high">
                      {keyword}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Domain Analysis */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4">Analysis Summary</h3>
              <div className="flex items-start gap-3">
                {result.probability > 70 ? (
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                )}
                <p className="text-foreground">{result.domainAnalysis}</p>
              </div>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4">Safety Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Never click links from unsolicited emails</li>
                <li>• Always verify sender email addresses carefully</li>
                <li>• Check for spelling and grammar errors</li>
                <li>• Hover over links to see the actual URL before clicking</li>
                <li>• Be suspicious of urgent requests for personal information</li>
                <li>• Use multi-factor authentication on important accounts</li>
              </ul>
            </Card>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground">Analyzed: {result.timestamp}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
