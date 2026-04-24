import { useState } from 'react';
import { X, HelpCircle, Info, MapPin, ChevronRight, Phone, Mail, MessageSquare, Shield, Star, CheckCircle, Zap, Globe, Briefcase, Wrench } from 'lucide-react';

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────
const faqCategories = [
  {
    category: 'Getting Started',
    icon: <Briefcase size={14} />,
    items: [
      { q: 'How do I book a service?', a: 'Go to "Find Services", browse nearby verified Taskers, pick one that fits your needs, and click "Book Now". Fill in your preferred date, time, address, and a problem description, then confirm.' },
      { q: 'What is the difference between a Customer and a Tasker?', a: 'A Customer books services (e.g., plumbing, repairs). A Tasker is a verified professional who provides those services. You can only register as one role.' },
      { q: 'How are Taskers verified?', a: 'Every Tasker goes through a manual admin review before appearing on the platform. Their identity, skills, and service credentials are checked before approval.' },
    ]
  },
  {
    category: 'Bookings & Tracking',
    icon: <MapPin size={14} />,
    items: [
      { q: 'How do I track my Tasker?', a: 'Once a Tasker accepts your booking, tap "Live Track" on your bookings page. A real-time map shows the Tasker\'s location and the shortest route to your home with estimated arrival time.' },
      { q: 'What do the tracking statuses mean?', a: 'Booking Confirmed → Tasker Assigned → On the Way / Working → Completed. Each step lights up as the job progresses in real time.' },
      { q: 'How is the price calculated?', a: 'Estimated Total = Service Charge (Tasker\'s hourly rate) + Platform Fee (₹29) + Visit Charge (₹24). You see the full breakdown before confirming any booking.' },
    ]
  },
  {
    category: 'Ratings & Messaging',
    icon: <Star size={14} />,
    items: [
      { q: 'How do I rate a Tasker?', a: 'After a booking is marked "Completed", a Rate Tasker section appears on your booking card. Select 1–5 stars, optionally write a review, and submit. Each booking can only be rated once.' },
      { q: 'How do I message my Tasker?', a: 'On the Live Tracking page, click "Message Tasker" to open an in-app chat. Both parties can exchange messages in real time without sharing personal numbers.' },
      { q: 'How do notifications work?', a: 'The bell icon in the header shows a pulsing red dot for unread messages or new updates. Click it to view all recent notifications. It refreshes automatically every 8 seconds.' },
    ]
  },
  {
    category: 'For Taskers',
    icon: <Wrench size={14} />,
    items: [
      { q: 'How do I set up my Tasker profile?', a: 'Go to My Profile. Upload a photo, select your service types, enter your years of experience, and set your hourly rate. Your GPS location is saved automatically when you save the profile.' },
      { q: 'How do I accept job requests?', a: 'Go to "Job Requests". You\'ll see all pending booking requests. Click Accept to take the job or Decline to pass. Accepting notifies the customer immediately.' },
      { q: 'How do customers find me?', a: 'Customers search by GPS proximity and service type. Keep your profile updated with all your services and ensure your GPS location is active for maximum visibility.' },
    ]
  },
];

// ─── HELP & SUPPORT ───────────────────────────────────────────────────────────
const HelpContent = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);

  const contacts = [
    { icon: <Mail size={18} className="text-brand-500" />, label: 'Email Support', value: 'support@expertease.in' },
    { icon: <Phone size={18} className="text-brand-500" />, label: 'Customer Helpline', value: '+91 800 555 1234 (9AM–9PM)' },
    { icon: <MessageSquare size={18} className="text-brand-500" />, label: 'Live Chat', value: 'Available inside the app' },
  ];

  return (
    <div className="space-y-7">
      {/* Quick Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {[
          { icon: <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />, text: 'Allow location access for accurate Tasker search.' },
          { icon: <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />, text: 'Complete your profile with phone & city.' },
          { icon: <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />, text: 'Rate your Tasker after every completed job.' },
          { icon: <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />, text: 'Use in-app chat instead of sharing phone numbers.' },
        ].map((t, i) => (
          <div key={i} className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 font-medium">
            {t.icon}<span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* FAQ Category Tabs */}
      <div>
        <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
          <HelpCircle size={18} className="text-brand-500" /> Frequently Asked Questions
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {faqCategories.map((cat, i) => (
            <button
              key={i}
              onClick={() => { setActiveCategory(i); setOpenFaq(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeCategory === i ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.icon} {cat.category}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {faqCategories[activeCategory].items.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-bold text-slate-900 text-sm pr-4">{faq.q}</span>
                <ChevronRight size={16} className={`text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
          <Phone size={18} className="text-brand-500" /> Contact Us
        </h3>
        <div className="space-y-3">
          {contacts.map((c, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
              {c.icon}
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">{c.label}</div>
                <p className="text-sm font-bold text-slate-800">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex items-start gap-4">
        <Shield size={22} className="text-brand-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-black text-brand-900 mb-1">Safety First</h4>
          <p className="text-sm text-brand-700 leading-relaxed">All Taskers are verified by our admin team. Never share passwords, OTPs, or banking information with anyone on the platform.</p>
        </div>
      </div>
    </div>
  );
};

// ─── ABOUT EXPERTEASE ─────────────────────────────────────────────────────────
const AboutContent = () => (
  <div className="space-y-8">
    {/* Logo & Tagline */}
    <div className="text-center py-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl">
      <div className="text-4xl font-black text-white mb-2">
        Expert<span className="text-brand-400">Ease</span>
      </div>
      <p className="text-slate-400 font-medium">Your trusted local service marketplace</p>
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="bg-brand-500/20 border border-brand-500/30 text-brand-400 px-3 py-1 rounded-full text-xs font-bold">v1.0</span>
        <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">Live</span>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-3 text-center">
      {[
        { value: '2,500+', label: 'Verified Taskers' },
        { value: '10K+', label: 'Jobs Completed' },
        { value: '4.8★', label: 'Avg Rating' },
      ].map((s, i) => (
        <div key={i} className="bg-slate-900 rounded-2xl py-5">
          <div className="text-xl font-black text-white">{s.value}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">{s.label}</div>
        </div>
      ))}
    </div>

    {/* Mission */}
    <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
      <h3 className="text-base font-black text-slate-900">Our Mission</h3>
      <p>ExpertEase was built to solve a real problem: finding a reliable, skilled professional when you need one is too difficult. Searching through directories, making multiple calls, and wondering if someone will show up — it shouldn't be that hard.</p>
      <p>We make on-demand home services as easy as ordering food. Real-time GPS matching connects you with the nearest qualified Taskers. A seamless in-app messaging system keeps communication clear. A transparent review system builds trust on both sides.</p>
      <p>At the same time, we empower local skilled workers — electricians, plumbers, mechanics, carpenters — to grow their business digitally, manage bookings professionally, and earn fairly.</p>
    </div>

    {/* How It Works */}
    <div>
      <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
        <Zap size={18} className="text-amber-500" /> How It Works
      </h3>
      <div className="space-y-3">
        {[
          { step: '01', title: 'Share Your Location', desc: 'GPS finds nearby Taskers so help is always around the corner.' },
          { step: '02', title: 'Browse & Choose', desc: 'See Tasker profiles with services, experience, rates, and real ratings.' },
          { step: '03', title: 'Book in Seconds', desc: 'Select your service, preferred time, and confirm. Tasker is notified instantly.' },
          { step: '04', title: 'Track & Chat', desc: 'Follow your Tasker on a live map and message them — all in one app.' },
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <div className="w-9 h-9 bg-brand-500 text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0">{s.step}</div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">{s.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Why Choose */}
    <div>
      <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
        <Star size={18} className="text-amber-500 fill-amber-500" /> Why Choose ExpertEase?
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {[
          'Verified and trusted Taskers',
          'Book in under 2 minutes',
          'Real-time GPS-based matching',
          'Transparent ratings & reviews',
          'No hidden fees — clear pricing',
          'Live route tracking with ETA',
          'In-app messaging — no calls needed',
          'Reliable, community-first experience',
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />
            <span className="text-xs font-medium text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Vision & Promise */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2"><Globe size={18} className="text-brand-500" /><h4 className="font-black text-brand-900">Our Vision</h4></div>
        <p className="text-sm text-brand-700 leading-relaxed">To become the most trusted platform for local services by making expert help available anytime, anywhere.</p>
      </div>
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2"><Shield size={18} className="text-emerald-600" /><h4 className="font-black text-emerald-900">Our Promise</h4></div>
        <p className="text-sm text-emerald-700 leading-relaxed">Quality, trust, and convenience — the right expert at your doorstep when you need them most.</p>
      </div>
    </div>

    <div className="text-center text-xs text-slate-400 font-medium">
      © 2025 ExpertEase. All rights reserved. | Built with ❤️ for local communities.
    </div>
  </div>
);

// ─── MANAGE ADDRESSES ─────────────────────────────────────────────────────────
const AddressesContent = () => {
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedAddresses') || '[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ label: 'Home', line: '' });
  const [adding, setAdding] = useState(false);

  const save = () => {
    if (!form.line.trim()) return;
    const updated = [...addresses, { ...form, id: Date.now() }];
    setAddresses(updated);
    localStorage.setItem('savedAddresses', JSON.stringify(updated));
    setForm({ label: 'Home', line: '' });
    setAdding(false);
  };

  const remove = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('savedAddresses', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900">Saved Addresses</h3>
          <p className="text-sm text-slate-500 font-medium">Your addresses for quick booking</p>
        </div>
        <button onClick={() => setAdding(true)} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-brand-500/20">
          + Add New
        </button>
      </div>

      {adding && (
        <div className="bg-brand-50 border-2 border-brand-200 rounded-2xl p-5 space-y-4">
          <h4 className="font-black text-brand-900">Add New Address</h4>
          <div className="flex gap-3">
            {['Home', 'Work', 'Other'].map(l => (
              <button key={l} onClick={() => setForm({ ...form, label: l })}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${form.label === l ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>{l}</button>
            ))}
          </div>
          <input
            value={form.line}
            onChange={e => setForm({ ...form, line: e.target.value })}
            placeholder="Enter full address..."
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
          <div className="flex gap-3">
            <button onClick={save} className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-colors">Save Address</button>
            <button onClick={() => setAdding(false)} className="px-4 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !adding ? (
        <div className="text-center py-16 text-slate-400">
          <MapPin size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold text-slate-600">No saved addresses yet</p>
          <p className="text-sm">Add your home, work, or other frequent locations for quick booking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black text-brand-600 uppercase tracking-wide">{addr.label}</span>
                <p className="text-sm font-medium text-slate-700 truncate mt-0.5">{addr.line}</p>
              </div>
              <button onClick={() => remove(addr.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-lg font-bold">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAIN SETTINGS MODAL ──────────────────────────────────────────────────────
const SettingsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(null);

  const menuItems = [
    { id: 'help', icon: <HelpCircle size={22} className="text-brand-500" />, label: 'Help & Support', desc: 'FAQs, tips, and contact info' },
    { id: 'about', icon: <Info size={22} className="text-amber-500" />, label: 'About ExpertEase', desc: 'Our story, vision, and mission' },
    { id: 'addresses', icon: <MapPin size={22} className="text-emerald-500" />, label: 'Manage Addresses', desc: 'Save home, work, and other locations' },
  ];

  const titles = { help: 'Help & Support', about: 'About ExpertEase', addresses: 'Manage Addresses' };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-end">
      {/* Slide-in Panel */}
      <div className="h-full w-full max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            {activeTab && (
              <button onClick={() => setActiveTab(null)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight size={18} className="rotate-180" />
              </button>
            )}
            <h2 className="text-xl font-black text-slate-900">{activeTab ? titles[activeTab] : 'Settings'}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!activeTab ? (
            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Options</p>
              {menuItems.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className="w-full flex items-center gap-4 p-5 bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 rounded-2xl transition-all text-left group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">{item.icon}</div>
                  <div className="flex-1">
                    <div className="font-black text-slate-900 text-base">{item.label}</div>
                    <div className="text-sm text-slate-500 font-medium mt-0.5">{item.desc}</div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-brand-400 transition-colors" />
                </button>
              ))}

              {/* App version */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-medium">Expert<span className="text-brand-500">Ease</span> v1.0.0</p>
                <p className="text-xs text-slate-300 mt-1">© 2025 All rights reserved</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'help' && <HelpContent />}
              {activeTab === 'about' && <AboutContent />}
              {activeTab === 'addresses' && <AddressesContent />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
