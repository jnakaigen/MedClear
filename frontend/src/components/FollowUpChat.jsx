import { useState, useEffect, useRef } from "react";
import { sendChatMessage, getChatHistory } from "../api/medclear";

export default function FollowUpChat({ reportId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!reportId) return;
    getChatHistory(reportId)
      .then(setMessages)
      .catch(() => {});
  }, [reportId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(reportId, question);
      setMessages(data.history);
    } catch (err) {
      setError(err.message);
      // Remove optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  if (!reportId) return null;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Ask Follow-Up Questions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ask anything about your report — the AI has your full results as context.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-96 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No messages yet. Ask a question about your report below.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {[
                "What should I be concerned about?",
                "What diet changes do you recommend?",
                "Can you explain the urgent findings?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-500 text-white rounded-br-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 text-center">{error}</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your report..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}
