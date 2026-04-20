import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";

interface PasswordAnalysis {
  strength: "weak" | "fair" | "good" | "strong";
  score: number;
  crackTime: string;
  suggestions: string[];
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumbers: boolean;
  hasSpecial: boolean;
  length: number;
}

export default function PasswordAnalyzer() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  const analyzePassword = (pwd: string) => {
    if (!pwd) {
      setAnalysis(null);
      return;
    }

    const hasLowercase = /[a-z]/.test(pwd);
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    const length = pwd.length;

    let score = 0;
    const suggestions: string[] = [];

    // Length scoring
    if (length >= 8) score += 20;
    if (length >= 12) score += 20;
    if (length >= 16) score += 20;
    else suggestions.push("Use at least 12 characters");

    // Complexity scoring
    if (hasLowercase) score += 15;
    else suggestions.push("Add lowercase letters");

    if (hasUppercase) score += 15;
    else suggestions.push("Add uppercase letters");

    if (hasNumbers) score += 15;
    else suggestions.push("Add numbers");

    if (hasSpecial) score += 15;
    else suggestions.push("Add special characters (!@#$%^&*)");

    // Determine strength
    let strength: "weak" | "fair" | "good" | "strong" = "weak";
    if (score >= 80) strength = "strong";
    else if (score >= 60) strength = "good";
    else if (score >= 40) strength = "fair";

    // Estimate crack time (simplified)
    const charsetSize = (hasLowercase ? 26 : 0) + (hasUppercase ? 26 : 0) + (hasNumbers ? 10 : 0) + (hasSpecial ? 32 : 0);
    const possibilities = Math.pow(charsetSize, length);
    const guessesPerSecond = 1e9; // 1 billion guesses per second
    const seconds = possibilities / (2 * guessesPerSecond);

    let crackTime = "Less than a second";
    if (seconds > 60) crackTime = `${Math.round(seconds / 60)} minutes`;
    if (seconds > 3600) crackTime = `${Math.round(seconds / 3600)} hours`;
    if (seconds > 86400) crackTime = `${Math.round(seconds / 86400)} days`;
    if (seconds > 31536000) crackTime = `${Math.round(seconds / 31536000)} years`;
    if (seconds > 31536000 * 1000) crackTime = "Centuries";

    setAnalysis({
      strength,
      score: Math.min(100, score),
      crackTime,
      suggestions,
      hasLowercase,
      hasUppercase,
      hasNumbers,
      hasSpecial,
      length,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    analyzePassword(pwd);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-poppins mb-2">Password Analyzer</h1>
          <p className="text-muted-foreground">Evaluate password strength and get improvement suggestions</p>
        </div>

        {/* Input Section */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold font-poppins mb-4">Enter Password</h3>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password to analyze..."
              value={password}
              onChange={handlePasswordChange}
              className="pr-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Your password is analyzed locally and never sent to any server.</p>
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
                  <span className={`font-bold font-poppins text-lg ${
                    analysis.strength === "strong" ? "text-green-400" :
                    analysis.strength === "good" ? "text-blue-400" :
                    analysis.strength === "fair" ? "text-yellow-400" :
                    "text-red-400"
                  }`}>
                    {analysis.strength.toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      analysis.strength === "strong"
                        ? "bg-green-500"
                        : analysis.strength === "good"
                          ? "bg-blue-500"
                          : analysis.strength === "fair"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                    }`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Score: {analysis.score}/100</p>
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

            {/* Character Requirements */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold font-poppins mb-4">Character Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">Length: {analysis.length} characters</span>
                  {analysis.length >= 12 ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">Lowercase (a-z)</span>
                  {analysis.hasLowercase ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">Uppercase (A-Z)</span>
                  {analysis.hasUppercase ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">Numbers (0-9)</span>
                  {analysis.hasNumbers ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">Special (!@#$%^&*)</span>
                  {analysis.hasSpecial ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
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
              </ul>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
