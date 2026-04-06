import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import ResultsCard from "../components/ResultsCard";
import FollowUpChat from "../components/FollowUpChat";
import { analyzeReport } from "../api/medclear";

function AnalyzingProgress() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Extracting text from document...");

  useEffect(() => {
    const stages = [
      { at: 15, text: "Extracting text from document..." },
      { at: 35, text: "Sending to AI for analysis..." },
      { at: 55, text: "Identifying medical findings..." },
      { at: 75, text: "Classifying severity levels..." },
      { at: 90, text: "Generating simplified report..." },
    ];

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 3 + 0.5;
        if (next >= 95) { clearInterval(interval); return 95; }
        const currentStage = [...stages].reverse().find((s) => next >= s.at);
        if (currentStage) setStage(currentStage.text);
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 animate-fadeIn">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
        <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3">{stage}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">This may take up to a minute</p>
      </div>
    </div>
  );
}

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
        <div className="space-y-6 animate-fadeIn">
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
            <div className="flex justify-center animate-slideUp">
              <button
                onClick={handleAnalyze}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                Analyze Report
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-5 animate-slideUp">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              <button onClick={() => setError(null)} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline font-medium">
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading with progress */}
      {loading && <AnalyzingProgress />}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6 animate-slideUp">
          <ResultsCard data={result} />

          <FollowUpChat reportId={reportId} />

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5"
            >
              Upload Another Report
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
