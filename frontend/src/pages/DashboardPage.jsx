import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { getReports, deleteReport } from "../api/medclear";

const SEVERITY_COLORS = {
  normal: "#10b981",
  watch: "#f59e0b",
  urgent: "#ef4444",
};

const SEVERITY_DOT = {
  normal: "bg-emerald-500",
  watch: "bg-amber-500",
  urgent: "bg-red-500",
};

function AnimatedCounter({ end, duration = 1000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  // Compute aggregate stats
  const totalReports = reports.length;
  const totalSeverity = { normal: 0, watch: 0, urgent: 0 };
  reports.forEach((r) => {
    Object.entries(r.severity_counts).forEach(([sev, count]) => {
      totalSeverity[sev] = (totalSeverity[sev] || 0) + count;
    });
  });
  const totalFindings = totalSeverity.normal + totalSeverity.watch + totalSeverity.urgent;
  const normalPct = totalFindings > 0 ? Math.round((totalSeverity.normal / totalFindings) * 100) : 0;

  const pieData = [
    { name: "Normal", value: totalSeverity.normal, color: SEVERITY_COLORS.normal },
    { name: "Watch", value: totalSeverity.watch, color: SEVERITY_COLORS.watch },
    { name: "Urgent", value: totalSeverity.urgent, color: SEVERITY_COLORS.urgent },
  ].filter((d) => d.value > 0);

  // Reports over time (group by date)
  const timeData = reports
    .slice()
    .reverse()
    .reduce((acc, r) => {
      const date = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.reports += 1;
        existing.urgent += r.severity_counts.urgent || 0;
      } else {
        acc.push({ date, reports: 1, urgent: r.severity_counts.urgent || 0 });
      }
      return acc;
    }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {reports.length === 0
              ? "Upload your first medical report to get started."
              : "Here's an overview of your health data."}
          </p>
        </div>
        <Link
          to="/upload"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 no-underline"
        >
          + Upload Report
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {/* Stats + Charts */}
      {reports.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 stagger-children">
          {/* Stat cards */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              <AnimatedCounter end={totalReports} />
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Findings</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              <AnimatedCounter end={totalFindings} />
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Normal Rate</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <AnimatedCounter end={normalPct} />%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Urgent Findings</p>
            <p className={`text-3xl font-bold mt-1 ${totalSeverity.urgent > 0 ? "text-red-500" : "text-gray-400 dark:text-gray-600"}`}>
              <AnimatedCounter end={totalSeverity.urgent} />
            </p>
          </div>
        </div>
      )}

      {/* Charts row */}
      {reports.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 mb-8 animate-slideUp">
          {/* Severity distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Severity Distribution</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5">
                {[
                  { label: "Normal", count: totalSeverity.normal, color: "bg-emerald-500" },
                  { label: "Watch", count: totalSeverity.watch, color: "bg-amber-500" },
                  { label: "Urgent", count: totalSeverity.urgent, color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upload activity */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Upload Activity</h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="reports" stroke="#10b981" strokeWidth={2} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Empty state */}
      {reports.length === 0 && !error && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-scaleIn">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No reports yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Upload a medical report to see it simplified here.</p>
          <Link
            to="/upload"
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5 no-underline"
          >
            Upload Your First Report
          </Link>
        </div>
      )}

      {/* Report grid */}
      {reports.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Reports</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {reports.map((report) => (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group no-underline block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                    {report.report_title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(report.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 -mt-1 -mr-1"
                    title="Delete report"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {report.summary}
                </p>

                {/* Severity mini bar */}
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex mb-3">
                  {["normal", "watch", "urgent"].map((sev) => {
                    const count = report.severity_counts[sev] || 0;
                    const total = Object.values(report.severity_counts).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return pct > 0 ? (
                      <div key={sev} className="h-full" style={{ width: `${pct}%`, backgroundColor: SEVERITY_COLORS[sev] }} />
                    ) : null;
                  })}
                </div>

                {/* Severity dots */}
                <div className="flex items-center gap-3 mb-3">
                  {Object.entries(report.severity_counts).map(
                    ([sev, count]) =>
                      count > 0 && (
                        <span key={sev} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[sev]}`} />
                          {count} {sev}
                        </span>
                      )
                  )}
                </div>

                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(report.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
