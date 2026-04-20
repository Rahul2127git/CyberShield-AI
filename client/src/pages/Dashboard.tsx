import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    safeScans: 0,
  });

  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    // Load from localStorage
    const savedStats = localStorage.getItem("cst_stats");
    const savedScans = localStorage.getItem("cst_scans");

    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedScans) setRecentScans(JSON.parse(savedScans).slice(0, 5));
  }, []);

  const chartData = [
    { name: "Mon", scans: 4, threats: 2 },
    { name: "Tue", scans: 3, threats: 1 },
    { name: "Wed", scans: 2, threats: 0 },
    { name: "Thu", scans: 5, threats: 2 },
    { name: "Fri", scans: 6, threats: 3 },
    { name: "Sat", scans: 2, threats: 1 },
    { name: "Sun", scans: 3, threats: 1 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-poppins mb-2">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor your security analysis activity and threats</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Total Scans</p>
                <p className="text-3xl font-bold font-poppins">{stats.totalScans}</p>
              </div>
              <Activity className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Threats Detected</p>
                <p className="text-3xl font-bold font-poppins text-red-400">{stats.threatsDetected}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Safe Scans</p>
                <p className="text-3xl font-bold font-poppins text-green-400">{stats.safeScans}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Avg. Response</p>
                <p className="text-3xl font-bold font-poppins">245ms</p>
              </div>
              <Clock className="w-8 h-8 text-accent" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-bold font-poppins mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="name" stroke="#8B949E" />
                <YAxis stroke="#8B949E" />
                <Tooltip contentStyle={{ backgroundColor: "#1A1F2E", border: "1px solid #30363D" }} />
                <Bar dataKey="scans" fill="#00C896" radius={[4, 4, 0, 0]} />
                <Bar dataKey="threats" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-bold font-poppins mb-4">Threat Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="name" stroke="#8B949E" />
                <YAxis stroke="#8B949E" />
                <Tooltip contentStyle={{ backgroundColor: "#1A1F2E", border: "1px solid #30363D" }} />
                <Line type="monotone" dataKey="threats" stroke="#FF6B6B" strokeWidth={2} dot={{ fill: "#FF6B6B" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold font-poppins mb-4">Recent Scans</h3>
          {recentScans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No scans yet. Start by using one of the analysis tools.</p>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan, idx) => (
                <div key={idx} className="scan-card flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-mono text-sm text-foreground break-all">{scan.input}</p>
                    <p className="text-xs text-muted-foreground mt-1">{scan.type} • {scan.timestamp}</p>
                  </div>
                  <span className={`risk-badge risk-${scan.riskLevel}`}>{scan.riskLevel.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
