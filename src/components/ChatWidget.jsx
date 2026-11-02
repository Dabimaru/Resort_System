import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerChatThread, sendCustomerChatMessage } from '../services/api';

const defaultGreeting = [
  {
    id: 'greeting',
    sender: 'support',
    senderName: 'Azure Cove Concierge',
    text: 'Hello! We are here to help you with reservations, room availability, and resort information.',
    createdAt: new Date().toISOString(),
  },
];

export default function ChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(defaultGreeting);
  const [loading, setLoading] = useState(false);

  const loadThread = async () => {
    const token = localStorage.getItem('azureCoveToken');
    if (!token) {
      setMessages(defaultGreeting);
      return;
    }

    try {
      const response = await getCustomerChatThread(token);
      const thread = response?.thread;
      setMessages(thread?.messages?.length ? thread.messages : defaultGreeting);
    } catch (error) {
      setMessages(defaultGreeting);
    }
  };

  useEffect(() => {
    loadThread();
  }, []);

  const ensureAccount = () => {
    const token = localStorage.getItem('azureCoveToken');
    if (!token) {
      navigate('/auth?mode=signup&source=chat');
      return false;
    }

    return true;
  };

  const handleOpen = async () => {
    if (!ensureAccount()) {
      return;
    }

    setIsOpen((current) => !current);
    await loadThread();
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!ensureAccount()) {
      return;
    }

    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('azureCoveToken');
      const response = await sendCustomerChatMessage({ message: trimmed }, token);
      const thread = response?.thread;
      setMessages(thread?.messages?.length ? thread.messages : [...messages, { id: crypto.randomUUID(), sender: 'customer', senderName: 'You', text: trimmed, createdAt: new Date().toISOString() }]);
      setDraft('');
    } catch (error) {
      console.error('Unable to send chat message.', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start">
      {isOpen && (
        <div className="mb-3 w-[340px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/50">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-800 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Support</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">Online</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-slate-300 hover:text-white">✕</button>
          </div>

          <div className="max-h-[320px] space-y-3 overflow-y-auto bg-slate-950/70 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.sender === 'customer' ? 'bg-resort-500 text-slate-950' : 'bg-slate-800 text-slate-100'}`}>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-current/70">{message.senderName}</p>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="border-t border-white/10 bg-slate-900 p-3">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-resort-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !draft.trim()}
                className="rounded-full bg-resort-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-3 rounded-full bg-resort-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-resort-500/30 transition hover:scale-[1.02]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/10 text-base">💬</span>
        <span>Chat support</span>
      </button>
    </div>
  );
}
