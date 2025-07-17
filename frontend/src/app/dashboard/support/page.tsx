"use client";
import { useEffect, useState } from "react";
import api from "../../api";
import { FaPaperPlane, FaReply, FaCheckCircle, FaTimesCircle, FaRegClock } from "react-icons/fa";

// Replace 'any' with a specific Ticket type
interface Ticket {
  id: string;
  subject: string;
  status: string;
  // Add more fields as needed
}

const statusMap = {
  open: { label: "Open", color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: <FaRegClock className="text-yellow-500 mr-1" /> },
  answered: { label: "Answered", color: "text-green-600 bg-green-50 border-green-200", icon: <FaCheckCircle className="text-green-500 mr-1" /> },
  closed: { label: "Closed", color: "text-red-600 bg-red-50 border-red-200", icon: <FaTimesCircle className="text-red-500 mr-1" /> },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get("accounts/support/tickets/");
      console.log("Tickets API response:", res.data);
      // Check if res.data is an array, if not, try to find the results
      const ticketsData = Array.isArray(res.data) ? res.data : (res.data.results || res.data.tickets || []);
      setTickets(ticketsData);
      setError("");
    } catch (err) {
      console.error("Tickets API error:", err);
      setError("Failed to load tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");
    try {
      await api.post("accounts/support/tickets/", { subject, message });
      setSuccess("Your ticket has been submitted.");
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch {
      setError("Failed to submit ticket.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-3xl mx-auto mt-10 w-full animate-fade-in">
      <h1 className="font-extrabold text-3xl mb-8 text-blue-700">Support Tickets</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mb-10 bg-blue-50/60 rounded-2xl p-6 shadow">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required maxLength={255}
            className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-white text-blue-900 text-base shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4}
            className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-white text-blue-900 text-base shadow-sm" />
        </div>
        <button type="submit" disabled={sending} className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition duration-200 shadow-lg cursor-pointer text-lg">
          {sending ? "Sending..." : <><FaPaperPlane className="inline mr-2" />Send Ticket</>}
        </button>
        {error && <div className="text-red-600 font-bold text-center">{error}</div>}
        {success && <div className="text-green-600 font-bold text-center">{success}</div>}
      </form>
      <h2 className="font-bold text-2xl mb-4 text-blue-700">Your Tickets</h2>
      {loading ? (
        <div className="text-blue-400 animate-pulse text-lg">Loading tickets...</div>
      ) : error ? (
        <div className="text-red-500 font-bold text-center">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-gray-400 text-lg">No tickets yet.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {tickets.map((t) => (
            <div key={t.id} className="bg-blue-50/60 rounded-2xl p-6 shadow flex flex-col gap-2 border border-blue-100">
              <div className="flex items-center gap-3 mb-1">
                <span className={`font-bold text-base px-3 py-1 rounded-xl border ${statusMap[t.status]?.color || ''} flex items-center gap-1`}>{statusMap[t.status]?.icon}{statusMap[t.status]?.label || t.status}</span>
                <span className="text-blue-900 font-semibold text-lg">{t.subject}</span>
                <span className="text-gray-400 text-xs ml-auto">{new Date(t.created_at).toLocaleString()}</span>
              </div>
              <div className="text-blue-900 whitespace-pre-line mb-2">{t.message}</div>
              {t.reply && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-2 flex items-start gap-2">
                  <FaReply className="text-green-600 mt-1" />
                  <div>
                    <div className="font-bold text-green-700 mb-1">Admin Reply:</div>
                    <div className="text-green-900 whitespace-pre-line">{t.reply}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
} 