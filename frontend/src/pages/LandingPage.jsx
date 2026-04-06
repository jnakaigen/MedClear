import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: "Smart Severity Coding",
    desc: "Every finding is color-coded as Normal, Watch, or Urgent so you know what matters at a glance.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "Follow-Up Chat",
    desc: "Ask questions about your diagnosis in plain English. The AI remembers your full report.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
    title: "Health Timeline",
    desc: "Track how your health changes over time with interactive charts and trend analysis.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Multimodal Vision",
    desc: "Upload photos of handwritten notes or pill bottles. The AI reads directly from images.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Charts & Analytics",
    desc: "Beautiful severity charts, upload trends, and visual dashboards to understand your data.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Private & Secure",
    desc: "Your reports are encrypted and tied to your account. No one else can see your data.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Upload",
    desc: "Drop your PDF, image, or photo of a doctor's note.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    num: "2",
    title: "AI Analyzes",
    desc: "Our AI reads, extracts, and simplifies every finding.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    num: "3",
    title: "Understand",
    desc: "Get color-coded results in plain English you can act on.",
    color: "from-purple-500 to-pink-500",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* ====== HERO ====== */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-950 dark:to-indigo-950/20 animate-gradient" />
        <div className="absolute top-10 -left-20 w-[500px] h-[500px] bg-emerald-300/20 dark:bg-emerald-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 -right-20 w-[600px] h-[600px] bg-indigo-300/20 dark:bg-indigo-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
            AI-Powered Medical Report Simplifier
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-6 animate-slideUp">
            Understand Your
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
              Medical Reports
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slideUp" style={{ animationDelay: "0.1s" }}>
            Upload any medical report. Our AI translates complex jargon into
            plain English a 5th grader could understand.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp" style={{ animationDelay: "0.2s" }}>
            <Link
              to="/auth"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1 no-underline"
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-lg rounded-2xl border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 no-underline"
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 mt-16 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "5th Grade", label: "Reading Level" },
              { value: "30 sec", label: "Average Analysis" },
              { value: "PDF & Image", label: "Upload Formats" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section id="how-it-works" className="py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              How It Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 stagger-children">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Connector line (desktop only) */}
          <div className="hidden sm:block relative -mt-[106px] mb-12 mx-auto max-w-md">
            <div className="h-0.5 bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 dark:from-emerald-700 dark:via-blue-700 dark:to-purple-700 rounded-full" />
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Everything You Need</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Powerful Features
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== DEMO PREVIEW ====== */}
      <section className="py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">See It In Action</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              From Complex to Clear
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Before */}
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">Before: Medical Jargon</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-mono">
                "HbA1c (Glycated Hemoglobin): 7.8%
                (Ref: &lt;5.7%). Indicative of suboptimal
                glycemic control over the preceding
                2-3 months. Dyslipidemia with elevated
                LDL, reduced HDL, and
                hypertriglyceridemia."
              </p>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">After: Plain English</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                "Your blood sugar has been too high for
                the past 2-3 months. The 'bad'
                cholesterol is too high, and the 'good'
                cholesterol is too low. This could be
                bad for your heart."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA BANNER ====== */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden px-8 py-16 sm:px-16 text-center">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 animate-gradient" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Understand Your Health?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                Join MedClear and turn confusing medical reports into clear, actionable insights.
              </p>
              <Link
                to="/auth"
                className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-emerald-700 font-bold text-lg rounded-2xl transition-all shadow-xl hover:-translate-y-1 no-underline"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">MedClear</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built by Janaki Ratheesh
          </p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/jnakaigen/MedClear" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 no-underline transition-colors">
              GitHub
            </a>
            <Link to="/auth" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 no-underline transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
