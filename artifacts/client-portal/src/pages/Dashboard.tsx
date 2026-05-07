import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Globe, Settings, LogOut, ArrowRight, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ChangeRequest {
  id: number;
  requestType: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [recent, setRecent] = useState<ChangeRequest[]>([]);

  useEffect(() => {
    api.getRequests().then(r => setRecent(r.slice(0, 3))).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (s === "in_progress") return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const statusLabel = (s: string) => {
    if (s === "completed") return "Completed";
    if (s === "in_progress") return "In Progress";
    return "Pending";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Client Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, {user?.businessName}
          </h1>
          <p className="text-muted-foreground">
            Use this portal to request updates to your website. We typically turn changes around within 24–48 hours.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => setLocation("/site-settings")}
            className="group bg-primary hover:bg-primary/90 rounded-xl p-6 text-left transition-all"
          >
            <Settings className="w-8 h-8 text-white mb-3" />
            <h2 className="text-lg font-bold text-white mb-1">Request Changes</h2>
            <p className="text-white/70 text-sm mb-4">Update your business info, services, photos, and more.</p>
            <div className="flex items-center gap-1 text-white font-medium text-sm">
              Get started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <div className="bg-card border border-border rounded-xl p-6">
            <Clock className="w-8 h-8 text-primary mb-3" />
            <h2 className="text-lg font-bold text-white mb-1">Turnaround Time</h2>
            <p className="text-muted-foreground text-sm">
              All change requests are handled within <strong className="text-white">24–48 hours</strong>. We'll apply your updates and let you know when they're live.
            </p>
          </div>
        </div>

        {/* Recent requests */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Recent Requests</h2>
              <button onClick={() => setLocation("/site-settings")} className="text-sm text-primary hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-2">
              {recent.map(r => (
                <div key={r.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon(r.status)}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {r.requestType === "structured" ? "Quick Update" : "Custom Request"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    r.status === "completed" ? "bg-green-500/15 text-green-400" :
                    r.status === "in_progress" ? "bg-yellow-500/15 text-yellow-400" :
                    "bg-white/8 text-muted-foreground"
                  }`}>
                    {statusLabel(r.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
