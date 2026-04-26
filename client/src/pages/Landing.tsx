import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Shield, Zap, Lock, ArrowRight, Check } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold font-poppins">CyberShield-AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="text-foreground hover:text-accent"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-accent text-primary-foreground hover:bg-accent/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663549046349/Y9mCbBAM9svnntZNAc6WU5/hero-banner-UFUSYPoRF9cmGPeezkn3o2.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-background" />

        <div className="container relative z-10 flex flex-col items-center justify-center text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold font-poppins mb-6 leading-tight">
              Professional Security Analysis
              <span className="block text-accent">All-in-One Platform</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Analyze URLs, detect phishing threats, evaluate password strength, and identify vulnerabilities
              with our comprehensive security toolkit. Perfect for students, developers, and security learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/dashboard")}
                className="bg-accent text-primary-foreground hover:bg-accent/90 gap-2"
              >
                Try Live Demo <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = 'https://github.com/cybershield-ai/cybershield-ai';
                  link.target = '_blank';
                  link.click();
                }}
                className="border-accent text-accent hover:bg-accent/10 gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Download
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 border-t border-border">
        <div className="container">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Powerful Security Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Comprehensive analysis features designed for security professionals and learners
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Vulnerability Scanner */}
            <div className="scan-card">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-poppins mb-2">Vulnerability Scanner</h3>
                  <p className="text-muted-foreground mb-4">
                    Analyze URLs for security headers, XSS patterns, SQL injection risks, and identify
                    potential vulnerabilities with detailed risk assessment.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      Security Headers Analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      XSS & SQL Pattern Detection
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      Risk Level Classification
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Phishing Detection */}
            <div className="scan-card">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-poppins mb-2">Phishing Detection</h3>
                  <p className="text-muted-foreground mb-4">
                    Identify phishing attempts by analyzing URLs and email content for suspicious
                    keywords, domain anomalies, and social engineering indicators.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      Phishing Probability Score
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      Suspicious Keyword Detection
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      Domain Analysis Summary
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Password Analyzer */}
            <div className="scan-card">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-poppins mb-2">Password Analyzer</h3>
                  <p className="text-muted-foreground mb-4">
                    Evaluate password strength with real-time feedback on complexity, entropy, and
                    estimated crack time. Get actionable improvement suggestions.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      Strength Meter & Score
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      Estimated Crack Time
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      Improvement Suggestions
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 border-t border-border bg-secondary/30">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-6">
            Ready to Analyze Your Security?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start using our comprehensive security toolkit today. No registration required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background/50">
        <div className="container text-center text-muted-foreground text-sm">
          <p>CyberShield - AI • Professional Security Analysis Platform</p>
          <p className="mt-2">Built for students, developers, and security learners</p>
        </div>
      </footer>
    </div>
  );
}
