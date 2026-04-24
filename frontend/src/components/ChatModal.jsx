import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { X, Send, MessageCircle, Loader2, ImagePlus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ChatModal = ({ booking, onClose }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState(booking?.messages || []);
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem('token');
  const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

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
  }, [booking?._id, token]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => () => {
    if (selectedPreview) URL.revokeObjectURL(selectedPreview);
  }, [selectedPreview]);

  const clearSelectedImage = () => {
    if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    setSelectedImage(null);
    setSelectedPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    setSelectedImage(file);
    setSelectedPreview(URL.createObjectURL(file));
  };

  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (/^(https?:\/\/|blob:|data:)/i.test(imagePath)) return imagePath;
    if (!apiBaseUrl) return imagePath;
    return `${apiBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !selectedImage) || sending) return;

    setSending(true);
    // Optimistic update
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      senderId: user._id,
      text: trimmed || '',
      imageUrl: selectedPreview || '',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const formData = new FormData();
      if (trimmed) formData.append('text', trimmed);
      if (selectedImage) formData.append('image', selectedImage);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings/${booking._id}/messages`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setText('');
      clearSelectedImage();
    } catch (err) {
      console.error('Failed to send message', err);
      // Revert optimistic update on fail
      setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const normalizeId = (idLike) => String(idLike?._id || idLike || '');

  const getSenderName = (msg, isMe) => {
    if (isMe) return 'You';

    const senderId = normalizeId(msg.senderId);
    const customerId = normalizeId(booking?.customerId);
    const taskerId = normalizeId(booking?.taskerId);

    if (senderId && senderId === customerId) return booking?.customerId?.name || 'Customer';
    if (senderId && senderId === taskerId) return booking?.taskerId?.name || 'Tasker';
    return 'User';
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
              const isMe = normalizeId(msg.senderId) === normalizeId(user?._id);
              const senderName = getSenderName(msg, isMe);
              return (
                <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? 'bg-brand-500 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
                  }`}>
                    <p className={`text-[10px] font-bold mb-1 ${isMe ? 'text-brand-100 text-right' : 'text-slate-500'}`}>
                      {senderName}
                    </p>
                    {msg.text ? (
                      <p className="leading-relaxed">{msg.text}</p>
                    ) : null}
                    {msg.imageUrl ? (
                      <a href={buildImageUrl(msg.imageUrl)} target="_blank" rel="noreferrer">
                        <img
                          src={buildImageUrl(msg.imageUrl)}
                          alt="Chat attachment"
                          className="mt-2 rounded-xl max-h-52 w-full object-cover border border-black/10"
                        />
                      </a>
                    ) : null}
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
        <form onSubmit={handleSend} className="px-4 py-3 bg-white border-t border-slate-100 shrink-0">
          {selectedPreview ? (
            <div className="mb-2 relative w-24">
              <img
                src={selectedPreview}
                alt="Selected attachment"
                className="w-24 h-24 rounded-xl object-cover border border-slate-200"
              />
              <button
                type="button"
                onClick={clearSelectedImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/75 text-white flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors"
              aria-label="Attach image"
            >
              <ImagePlus size={16} />
            </button>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 text-slate-900 text-sm placeholder-slate-400 px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
            />
            <button
              type="submit"
              disabled={(!text.trim() && !selectedImage) || sending}
              className="w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md shadow-brand-500/30"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
