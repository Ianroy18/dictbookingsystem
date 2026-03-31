import { useEffect, useState } from "react";
import { Users, TrendingUp, ShoppingCart, Activity, FileText, Settings } from "lucide-react";
import { StatCardsSkeleton, ActivitySkeleton } from "./Skeleton";

const stats = [
  { title: "Total Users",     value: "12,480", change: "+8.2% this month",  positive: true,  icon: <Users className="w-5 h-5" /> },
  { title: "Total Revenue",   value: "₱ 284,540", change: "+5.1% this month", positive: true, icon: <TrendingUp className="w-5 h-5" /> },
  { title: "New Orders",      value: "1,345",  change: "-2.3% this week",   positive: false, icon: <ShoppingCart className="w-5 h-5" /> },
  { title: "Active Sessions", value: "318",    change: "+12.5% today",      positive: true,  icon: <Activity className="w-5 h-5" /> },
];

const recentActivity = [
  { user: "juan.dela.cruz",  action: "Created a new document",      time: "2 min ago" },
  { user: "maria.santos",    action: "Updated profile settings",     time: "15 min ago" },
  { user: "pedro.reyes",     action: "Submitted request #1042",      time: "32 min ago" },
  { user: "ana.garcia",      action: "Logged in from new device",    time: "1 hr ago" },
  { user: "carlo.lim",       action: "Deleted draft #0091",          time: "3 hr ago" },
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  // Simulate initial data fetch — replace with real API call
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>

      {/* Welcome Banner */}
      <div className="rounded-2xl bg-primary/10 border border-primary/20 px-6 py-5 mb-6 flex items-center justify-between sm:flex-col sm:items-start sm:gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Good day, Admin!</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening in your system today.
          </p>
        </div>
        <span className="text-3xl sm:hidden">📊</span>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-6 lg:grid-cols-2 sm:grid-cols-1">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                <span className="p-2 rounded-lg bg-primary/10 text-primary">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={`text-xs font-medium ${stat.positive ? "text-green-500" : "text-destructive"}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Two-column section */}
      <div className="grid grid-cols-[1fr_320px] gap-4 lg:grid-cols-1">

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          {loading ? (
            <ActivitySkeleton />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-accent flex items-center justify-center text-xs font-bold uppercase text-muted-foreground">
                    {item.user.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.user}</p>
                    <p className="text-xs text-muted-foreground">{item.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground mb-1">Quick Actions</h3>
          {[
            { label: "Add New User",    icon: <Users className="w-4 h-4" /> },
            { label: "Create Document", icon: <FileText className="w-4 h-4" /> },
            { label: "View Reports",    icon: <TrendingUp className="w-4 h-4" /> },
            { label: "System Settings", icon: <Settings className="w-4 h-4" /> },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border hover:bg-accent hover:border-primary/40 text-sm text-foreground transition-colors"
            >
              <span className="text-primary">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

      </div>
    </>
  );
};

export default Dashboard;
