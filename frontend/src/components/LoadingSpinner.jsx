export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Analyzing your report...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          This may take up to a minute for large documents
        </p>
      </div>
    </div>
  );
}
