import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { trackPhishingDetection, trackPageView, trackFeatureUsage } from "@/lib/analytics";

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
                  const reportText = `PHISHING DETECTION REPORT\n================================\nURL: ${result.url}\nRisk Level: ${result.riskLevel.toUpperCase()}\nPhishing Probability: ${(result.phishingProbability * 100).toFixed(1)}%\nConfidence: ${(result.confidence * 100).toFixed(0)}%\nAnalyzed at: ${new Date(result.timestamp).toLocaleString()}\n\nASSESSMENT:\n${result.riskLevel === 'low' ? 'This URL appears to be legitimate. No major phishing indicators detected.' : result.riskLevel === 'medium' ? 'This URL shows some suspicious characteristics. Exercise caution before clicking or entering credentials.' : 'This URL shows high-risk characteristics. Avoid clicking this link and do not enter any personal information.'}`;
                  const blob = new Blob([reportText], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `phishing-report-${new Date().getTime()}.txt`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  trackFeatureUsage('download_phishing_report', { risk_level: result.riskLevel });
                }}
                className="bg-accent hover:bg-accent/90 text-primary-foreground gap-2"
              >
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
