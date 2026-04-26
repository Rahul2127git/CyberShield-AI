import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Shield, Zap, Lock, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/dashboard", label: "Overview", icon: Home },
    { path: "/scanner", label: "Vulnerability Scanner", icon: Zap },
    { path: "/phishing", label: "Phishing Detection", icon: Shield },
    { path: "/password", label: "Password Analyzer", icon: Lock },
    { path: "/reports", label: "Reports", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold font-poppins">CyberShield-AI</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-secondary/30 min-h-screen">
          <nav className="p-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-accent text-primary-foreground font-semibold"
                      : "text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
