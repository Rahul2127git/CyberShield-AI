import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Shield, Zap, Lock, ArrowRight, Check } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold font-poppins">Cyber Security Toolkit</span>
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
      </nav>

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

        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold font-poppins mb-6 leading-tight">
              Professional Security Analysis
              <span className="block text-accent">All-in-One Platform</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Analyze URLs, detect phishing threats, evaluate password strength, and identify vulnerabilities
              with our comprehensive security toolkit. Perfect for students, developers, and security learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/dashboard")}
                className="bg-accent text-primary-foreground hover:bg-accent/90 gap-2"
              >
                Try Live Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Powerful Security Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
          <p>Cyber Security Toolkit • Professional Security Analysis Platform</p>
          <p className="mt-2">Built for students, developers, and security learners</p>
        </div>
      </footer>
    </div>
  );
}
