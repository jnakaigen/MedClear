import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const SEVERITY_STYLES = {
  normal: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    label: "Normal",
    color: "#10b981",
  },
  watch: {
    border: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    label: "Watch",
    color: "#f59e0b",
  },
  urgent: {
    border: "border-l-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    label: "Urgent",
    color: "#ef4444",
  },
};

export default function ResultsCard({ data }) {
  // Compute severity counts for the chart
  const severityCounts = { normal: 0, watch: 0, urgent: 0 };
  data.sections.forEach((s) => {
    severityCounts[s.severity] = (severityCounts[s.severity] || 0) + 1;
  });
  const totalSections = data.sections.length;

  const pieData = Object.entries(severityCounts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: SEVERITY_STYLES[key].label,
      value,
      color: SEVERITY_STYLES[key].color,
    }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Report title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        {data.report_title}
      </h2>

      {/* Summary + Severity overview row */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Summary */}
        <div className="sm:col-span-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">Summary</h3>
          </div>
          <p className="text-base leading-relaxed text-indigo-800 dark:text-indigo-200">
            {data.summary}
          </p>
        </div>

        {/* Severity donut */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 flex flex-col items-center justify-center">
          <ResponsiveContainer width={110} height={110}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-2">
            {Object.entries(severityCounts).map(
              ([sev, count]) =>
                count > 0 && (
                  <span key={sev} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_STYLES[sev].color }} />
                    {count}
                  </span>
                )
            )}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{totalSections} findings</p>
        </div>
      </div>

      {/* Severity bar */}
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex">
        {["normal", "watch", "urgent"].map((sev) => {
          const pct = totalSections > 0 ? (severityCounts[sev] / totalSections) * 100 : 0;
          return pct > 0 ? (
            <div
              key={sev}
              className="h-full transition-all duration-1000"
              style={{ width: `${pct}%`, backgroundColor: SEVERITY_STYLES[sev].color }}
            />
          ) : null;
        })}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Detailed Breakdown
        </h3>
        <div className="stagger-children space-y-4">
          {data.sections.map((section, idx) => {
            const style = SEVERITY_STYLES[section.severity] || SEVERITY_STYLES.normal;
            return (
              <div
                key={idx}
                className={`rounded-xl border-l-4 ${style.border} ${style.bg} p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 w-6 h-6 rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h4>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${style.badge}`}>
                    {style.label}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      In the report
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                      {section.original_text}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      What this means
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed">
                      {section.simplified_text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action items */}
      {data.action_items.length > 0 && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-6 animate-slideUp">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">
              What You Should Do
            </h3>
          </div>
          <ul className="space-y-2.5">
            {data.action_items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-md border-2 border-emerald-400 dark:border-emerald-500 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className="text-base text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow up */}
      <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">Follow-Up</h3>
        </div>
        <p className="text-base text-blue-800 dark:text-blue-200 leading-relaxed">{data.follow_up}</p>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
        This is an AI-generated simplification. Always consult your healthcare provider for medical decisions.
      </p>
    </div>
  );
}
