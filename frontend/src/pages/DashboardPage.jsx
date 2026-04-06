import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getReports, deleteReport } from "../api/medclear";

const SEVERITY_DOT = {
  normal: "bg-emerald-500",
  watch: "bg-amber-500",
  urgent: "bg-red-500",
};

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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {reports.length === 0
              ? "Upload your first medical report to get started."
              : `You have ${reports.length} report${reports.length !== 1 ? "s" : ""} on file.`}
          </p>
        </div>
        <Link
          to="/upload"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/25 no-underline"
        >
          + Upload Report
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {/* Empty state */}
      {reports.length === 0 && !error && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No reports yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Upload a medical report to see it simplified here.</p>
          <Link
            to="/upload"
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors no-underline"
          >
            Upload Your First Report
          </Link>
        </div>
      )}

      {/* Report grid */}
      {reports.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                  {report.report_title}
                </h3>
                <button
                  onClick={() => handleDelete(report.id)}
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

              {/* Severity dots */}
              <div className="flex items-center gap-3 mb-4">
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

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(report.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <Link
                  to={`/reports/${report.id}`}
                  className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline no-underline"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
