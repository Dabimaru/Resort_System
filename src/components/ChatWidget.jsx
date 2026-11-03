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
        <div className="mb-3 w-[340px] overflow-hidden card-surface-elevated shadow-elevation-4">
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div>
              <p className="text-body-sm font-semibold text-text-primary">Support</p>
              <p className="text-caption text-state-success">Online</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="text-body-sm text-text-muted hover:text-text-primary">✕</button>
          </div>

          <div className="max-h-[320px] space-y-3 overflow-y-auto bg-surface/50 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-body-sm ${message.sender === 'customer' ? 'bg-resort-500 text-text-inverse' : 'bg-surface-elevated text-text-primary'}`}>
                  <p className="mb-1 text-caption text-current/70">{message.senderName}</p>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="border-t border-border bg-surface p-3">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message..."
                className="form-input flex-1 rounded-full py-2 text-body-sm"
              />
              <button
                type="submit"
                disabled={loading || !draft.trim()}
                className="btn-primary btn-icon"
              >
                {loading ? <span className="spinner" /> : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={handleOpen}
        className="btn-primary flex items-center gap-3 shadow-elevation-2 hover:scale-[1.02]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/20 text-base">💬</span>
        <span className="hidden sm:inline">Chat support</span>
      </button>
    </div>
  );
}
