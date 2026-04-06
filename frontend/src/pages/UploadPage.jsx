import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import LoadingSpinner from "../components/LoadingSpinner";
import ResultsCard from "../components/ResultsCard";
import FollowUpChat from "../components/FollowUpChat";
import { analyzeReport } from "../api/medclear";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const response = await analyzeReport(file);
      setResult(response.data);
      setReportId(response.report_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setReportId(null);
    setError(null);
  }

  return (
    <main className="max-w-3xl mx-auto w-full px-4 py-8">
      {/* Upload state */}
      {!result && !loading && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Upload Your Medical Report
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              We'll translate the medical jargon into simple, easy-to-understand language.
            </p>
          </div>

          <FileUpload onFileSelected={setFile} selectedFile={file} />

          {file && (
            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg shadow-emerald-500/25"
              >
                Analyze Report
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-5">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          <ResultsCard data={result} />

          <FollowUpChat reportId={reportId} />

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Upload Another Report
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
