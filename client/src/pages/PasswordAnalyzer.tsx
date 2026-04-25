import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect as useReactEffect } from "react";
import { Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { trackPasswordAnalysis, trackPageView } from "@/lib/analytics";

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
