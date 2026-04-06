import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTimeline } from "../api/medclear";

const SEVERITY_STYLES = {
  normal: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  watch: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  urgent: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
};

export default function TimelinePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Timeline</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          A chronological view of your medical reports and findings.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {entries.length === 0 && !error && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No timeline data yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Upload medical reports to build your health timeline.</p>
          <Link
            to="/upload"
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors no-underline"
          >
            Upload a Report
          </Link>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />

          <div className="space-y-8">
            {entries.map((entry, idx) => {
              const urgentCount = entry.findings.filter((f) => f.severity === "urgent").length;
              const watchCount = entry.findings.filter((f) => f.severity === "watch").length;
              const dotColor =
                urgentCount > 0 ? "bg-red-500" : watchCount > 0 ? "bg-amber-500" : "bg-emerald-500";

              return (
                <div key={idx} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 top-2 w-5 h-5 rounded-full ${dotColor} border-4 border-white dark:border-gray-950 z-10`} />

                  {/* Date label */}
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  {/* Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {entry.report_title}
                      </h3>
                      <Link
                        to={`/reports/${entry.report_id}`}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 no-underline"
                      >
                        Full report
                      </Link>
                    </div>

                    {/* Key findings */}
                    <div className="space-y-2 mb-4">
                      {entry.findings
                        .filter((f) => f.severity !== "normal")
                        .slice(0, 4)
                        .map((finding, fIdx) => {
                          const style = SEVERITY_STYLES[finding.severity];
                          return (
                            <div key={fIdx} className={`rounded-lg ${style.bg} px-3 py-2`}>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {finding.title}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${style.badge}`}>
                                  {finding.severity}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 pl-3.5">
                                {finding.simplified_text}
                              </p>
                            </div>
                          );
                        })}

                      {/* Normal count */}
                      {entry.findings.filter((f) => f.severity === "normal").length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                          + {entry.findings.filter((f) => f.severity === "normal").length} normal findings
                        </p>
                      )}
                    </div>

                    {/* Action items */}
                    {entry.action_items.length > 0 && (
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Action items
                        </p>
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
