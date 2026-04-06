import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const [dark, setDark] = useState(() => {
    return localStorage.getItem("medclear-theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("medclear-theme", dark ? "dark" : "light");
  }, [dark]);

  function isActive(path) {
    return location.pathname === path;
  }

  const linkClass = (path) =>
    `text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
      isActive(path)
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">MedClear</span>
        </Link>

        {/* Nav links */}
        {isAuthenticated && (
          <nav className="hidden sm:flex items-center gap-1">
            <Link to="/" className={linkClass("/")}>Dashboard</Link>
            <Link to="/upload" className={linkClass("/upload")}>Upload</Link>
            <Link to="/timeline" className={linkClass("/timeline")}>Timeline</Link>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Dark mode */}
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* User menu */}
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {isAuthenticated && (
        <nav className="sm:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex gap-1">
          <Link to="/" className={linkClass("/")}>Dashboard</Link>
          <Link to="/upload" className={linkClass("/upload")}>Upload</Link>
          <Link to="/timeline" className={linkClass("/timeline")}>Timeline</Link>
        </nav>
      )}
    </header>
  );
}
