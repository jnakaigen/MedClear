import { useState, useRef } from "react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/tiff",
  "image/bmp",
  "image/gif",
];

const ACCEPT_STRING = ".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.gif";

export default function FileUpload({ onFileSelected, selectedFile }) {
  const [dragActive, setDragActive] = useState(false);
  const [typeError, setTypeError] = useState(null);
  const inputRef = useRef(null);

  function validateAndSelect(file) {
    setTypeError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setTypeError("Please upload a PDF or image file (PNG, JPG, TIFF, BMP, GIF).");
      return;
    }
    onFileSelected(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    validateAndSelect(file);
  }

  function handleChange(e) {
    const file = e.target.files[0];
    validateAndSelect(file);
  }

  function handleDrag(e) {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  return (
    <div className="w-full">
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300
          ${
            dragActive
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 scale-[1.02] shadow-lg shadow-emerald-500/10"
              : selectedFile
              ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-600"
              : "border-gray-300 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md bg-white dark:bg-gray-900"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3 animate-scaleIn">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelected(null);
                setTypeError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                {dragActive ? "Drop your file here" : "Drag and drop your medical report here"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supports PDF, PNG, JPG, TIFF, BMP, GIF (max 10 MB)
            </p>
          </div>
        )}
      </div>

      {typeError && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
          {typeError}
        </p>
      )}
    </div>
  );
}
