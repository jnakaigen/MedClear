import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getTimeline } from "../api/medclear";

const SEVERITY_STYLES = {
  normal: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  watch: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  urgent: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
};

export default function TimelinePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getTimeline();
        setEntries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  // Build trend chart data
  const trendData = entries.map((e) => {
    const counts = { normal: 0, watch: 0, urgent: 0 };
    e.findings.forEach((f) => { counts[f.severity] = (counts[f.severity] || 0) + 1; });
    return {
      date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...counts,
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Timeline</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track how your health findings change over time.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-3 mb-6">{error}</p>
      )}

      {entries.length === 0 && !error && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-scaleIn">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No timeline data yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Upload medical reports to build your health timeline.</p>
          <Link to="/upload" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5 no-underline">
            Upload a Report
          </Link>
        </div>
      )}

      {/* Trend chart */}
      {entries.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-8 animate-slideUp">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Severity Trend Across Reports</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} barCategoryGap="20%">
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="normal" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="watch" stackId="a" fill="#f59e0b" />
              <Bar dataKey="urgent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-gray-300 to-gray-200 dark:from-emerald-600 dark:via-gray-700 dark:to-gray-800" />

          <div className="space-y-8 stagger-children">
            {entries.map((entry, idx) => {
              const urgentCount = entry.findings.filter((f) => f.severity === "urgent").length;
              const watchCount = entry.findings.filter((f) => f.severity === "watch").length;
              const dotColor = urgentCount > 0 ? "bg-red-500" : watchCount > 0 ? "bg-amber-500" : "bg-emerald-500";
              const isExpanded = expandedIdx === idx;
              const nonNormalFindings = entry.findings.filter((f) => f.severity !== "normal");
              const normalCount = entry.findings.filter((f) => f.severity === "normal").length;

              return (
                <div key={idx} className="relative pl-16">
                  {/* Timeline dot with pulse */}
                  <div className="absolute left-3 top-2">
                    <div className={`w-7 h-7 rounded-full ${dotColor} border-4 border-white dark:border-gray-950 z-10 relative`}>
                      <div className={`absolute inset-0 rounded-full ${dotColor} animate-ping opacity-20`} />
                    </div>
                  </div>

                  {/* Date label */}
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  {/* Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{entry.report_title}</h3>
                      <Link to={`/reports/${entry.report_id}`} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 no-underline font-medium">
                        View full report
                      </Link>
                    </div>

                    {/* Key findings */}
                    <div className="space-y-2 mb-3">
                      {(isExpanded ? nonNormalFindings : nonNormalFindings.slice(0, 3)).map((finding, fIdx) => {
                        const style = SEVERITY_STYLES[finding.severity];
                        return (
                          <div key={fIdx} className={`rounded-lg ${style.bg} px-3 py-2`}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{finding.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${style.badge}`}>{finding.severity}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 pl-3.5">{finding.simplified_text}</p>
                          </div>
                        );
                      })}

                      {nonNormalFindings.length > 3 && (
                        <button
                          onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium pl-1"
                        >
                          {isExpanded ? "Show less" : `+ ${nonNormalFindings.length - 3} more findings`}
                        </button>
                      )}

                      {normalCount > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                          + {normalCount} normal findings
                        </p>
                      )}
                    </div>

                    {/* Action items */}
                    {entry.action_items.length > 0 && (
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Action items</p>
                        <ul className="space-y-1">
                          {entry.action_items.map((item, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
