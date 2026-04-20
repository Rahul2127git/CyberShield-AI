import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Scan {
  input: string;
  type: string;
  riskLevel: "low" | "medium" | "high";
  timestamp: string;
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
          <p className="text-muted-foreground">View and manage your security analysis history</p>
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
                Export
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Input</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Risk Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.map((scan, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">{scan.timestamp}</td>
                      <td className="py-3 px-4 font-mono text-sm">{scan.type}</td>
                      <td className="py-3 px-4 font-mono text-sm max-w-xs truncate">{scan.input}</td>
                      <td className="py-3 px-4">
                        <span className={`risk-badge risk-${scan.riskLevel}`}>{scan.riskLevel.toUpperCase()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteScan(scans.indexOf(scan))}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Export Info */}
        <Card className="bg-secondary/30 border-border p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Export your scan reports to share with team members or for compliance documentation.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
