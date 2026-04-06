import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ResultsCard from "../components/ResultsCard";
import { getReport } from "../api/medclear";

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getReport(id);
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-5 text-center">
          <p className="text-red-800 dark:text-red-300">{error}</p>
          <Link to="/" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto w-full px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 no-underline">
          Dashboard
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700 dark:text-gray-300">{report.report_title}</span>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
        <span>
          Uploaded{" "}
          {new Date(report.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span>{report.filename}</span>
      </div>

      <ResultsCard data={report} />
    </main>
  );
}
