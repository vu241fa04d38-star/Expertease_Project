import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ChatModal = ({ booking, onClose }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState(booking?.messages || []);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const token = localStorage.getItem('token');

  // Determine the other person's name
  const otherUser = user.role === 'customer'
    ? (booking?.taskerId?.name || 'Tasker')
    : (booking?.customerId?.name || 'Customer');

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!booking?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings` , {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const updated = res.data.bookings.find(b => b._id === booking._id);
          if (updated) setMessages(updated.messages || []);
        }
      } catch (err) {
        console.error('Chat poll failed', err);
      }
    };

    // Mark messages as read on open
    axios.put(`${import.meta.env.VITE_API_URL}/api/bookings/${booking._id}/messages/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [booking?._id]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    // Optimistic update
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      senderId: user._id,
      text: trimmed,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setText('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings/${booking._id}/messages`, { text: trimmed }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to send message', err);
      // Revert optimistic update on fail
      setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md h-[520px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {otherUser.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-white text-sm">{otherUser}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                Active now
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <MessageCircle size={28} className="text-slate-300" />
              </div>
              <div>
                <p className="font-bold text-slate-600">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderId === user._id || msg.senderId?._id === user._id;
              return (
                <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? 'bg-brand-500 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-brand-200 text-right' : 'text-slate-400'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="px-4 py-3 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 text-slate-900 text-sm placeholder-slate-400 px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md shadow-brand-500/30"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
