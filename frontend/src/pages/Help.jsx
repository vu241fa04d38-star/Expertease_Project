import { useState } from 'react';
import {
  HelpCircle, ChevronDown, ChevronUp, Search, MapPin, Briefcase, Star,
  MessageCircle, CreditCard, Shield, Bell, User, Wrench, Clock, CheckCircle2,
  AlertTriangle, Phone, Mail, BookOpen
} from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    icon: <BookOpen size={18} />,
    color: 'bg-brand-100 text-brand-600',
    items: [
      {
        q: 'What is ExpertEase?',
        a: 'ExpertEase is an on-demand service platform that connects customers with verified local Taskers — skilled professionals who can help with home repairs, electrical work, plumbing, cleaning, and much more. You can search, book, track, and review service providers all from one place.'
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Register" on the login page. Choose your role: Customer (to book services) or Tasker (to offer services). Fill in your name, email, and password. You\'ll be logged in immediately after registering.'
      },
      {
        q: 'What is the difference between a Customer and a Tasker?',
        a: 'A Customer is someone who needs a service done — like plumbing, repairs, or cleaning. A Tasker is a verified professional who offers those services and gets paid through the platform. You can only register as one role.'
      },
    ]
  },
  {
    category: 'Booking a Service',
    icon: <Briefcase size={18} />,
    color: 'bg-amber-100 text-amber-600',
    items: [
      {
        q: 'How do I find and book a Tasker?',
        a: 'Go to "Find Services" from the sidebar. Your location is automatically detected. You\'ll see a map and a list of nearby Taskers. You can filter by service type. Click on a Tasker\'s card, then click "Book Now" to open the booking form. Fill in your preferred date, time, address, and a problem description, then confirm your booking.'
      },
      {
        q: 'Can I book a Tasker for a specific service type?',
        a: 'Yes! When booking, a dropdown lets you choose from the specific services that Tasker offers (e.g., AC Repair, Pipe Fixing, Tile Cleaning). You can also select General Inspection, Emergency Repair, or Maintenance.'
      },
      {
        q: 'How is the booking amount calculated?',
        a: 'The estimated total is broken into three parts: Service Charge (the Tasker\'s hourly rate), a Platform Fee of ₹29, and a Visit Charge of ₹24. The total is shown clearly before you confirm. The Tasker\'s rate per hour is set on their profile.'
      },
      {
        q: 'Can I cancel a booking?',
        a: 'Currently, you can view and track all your bookings from "My Bookings". If you need to cancel, we recommend messaging the Tasker directly via the in-app chat to coordinate. A formal cancellation feature is planned for a future update.'
      },
    ]
  },
  {
    category: 'Live Tracking',
    icon: <MapPin size={18} />,
    color: 'bg-emerald-100 text-emerald-600',
    items: [
      {
        q: 'How does Live Tracking work?',
        a: 'After your booking is accepted, you can click the "Live Track" button on your booking card. This opens a full map view showing your location (blue house icon) and your Tasker\'s current location (green wrench icon). A blue route line shows the shortest driving path from the Tasker to your home, along with the estimated travel time and distance.'
      },
      {
        q: 'Why is the route showing 0.0 km?',
        a: 'This can happen if the Tasker\'s registered GPS location is the same as your booking location (common in test environments). The map will still display both markers and calculate the best route. If you see this, it usually means the Tasker is already at or very near your location.'
      },
      {
        q: 'What do the different tracking statuses mean?',
        a: 'Booking Confirmed: your request has been sent. Tasker Assigned: a Tasker has accepted your booking. On the Way / Working: the Tasker is actively traveling to or working at your location. Completed: the job is done and you can now leave a rating.'
      },
    ]
  },
  {
    category: 'Ratings & Reviews',
    icon: <Star size={18} />,
    color: 'bg-yellow-100 text-yellow-600',
    items: [
      {
        q: 'How do I rate a Tasker?',
        a: 'Go to "My Bookings". Once a booking status changes to "Completed", a "Rate Tasker" section appears on that booking card. Click the stars to select your rating (1–5), optionally write a review comment, then click "Submit Rating". You can only rate each booking once.'
      },
      {
        q: 'Where are Tasker ratings displayed?',
        a: 'Ratings are averaged and shown on every Tasker card in both the "Find Services" list and on the map overview. The rating (e.g., 4.8 ★) and total review count (e.g., 12 reviews) are visible before you book, helping you choose the best professional.'
      },
      {
        q: 'Can I change my review after submitting?',
        a: 'Once a rating is submitted, it is saved permanently to maintain review integrity. Please make sure you are satisfied with your rating before submitting.'
      },
    ]
  },
  {
    category: 'Messaging & Notifications',
    icon: <MessageCircle size={18} />,
    color: 'bg-purple-100 text-purple-600',
    items: [
      {
        q: 'How do I message my Tasker?',
        a: 'On the Live Tracking page, click the "Message Tasker" button at the bottom of the sidebar. A chat window will open where you can send real-time messages. Similarly, Taskers can message you from their Job Requests page.'
      },
      {
        q: 'How do I know if I have a new message?',
        a: 'The bell icon in the top-right header will show a red pulsing dot when you have unread messages or new notifications. Clicking the bell takes you to the Notifications page, where you can see all recent messages and new booking requests. Clicking a message notification opens the chat directly.'
      },
      {
        q: 'How often does the notification count refresh?',
        a: 'Notifications automatically refresh every 8 seconds in the background, so you\'ll see new messages and status updates without needing to reload the page.'
      },
    ]
  },
  {
    category: 'For Taskers',
    icon: <Wrench size={18} />,
    color: 'bg-rose-100 text-rose-600',
    items: [
      {
        q: 'How do I set up my Tasker profile?',
        a: 'After logging in, go to "My Profile" from the sidebar. You can upload a profile photo, select your service types (from a full list of categories), set your years of experience, and set your hourly rate in ₹. Your GPS location is automatically saved when you save your profile.'
      },
      {
        q: 'How do I accept or decline a job request?',
        a: 'Go to "Job Requests" in your sidebar. You\'ll see all pending booking requests from customers. Each card shows the customer\'s name, service needed, location, date/time, and amount. Click "Accept" to take the job or "Decline" to pass on it. Accepting changes the booking status and notifies the customer.'
      },
      {
        q: 'How do I mark a job as complete?',
        a: 'In your "Job Requests" page, find the accepted booking and click "Mark as Complete". This updates the booking status to "Completed", which then allows the customer to leave a rating for you.'
      },
      {
        q: 'How do customers find me?',
        a: 'Your profile appears in search results based on your GPS location and the service types you have selected in your profile. The closer you are to the customer, the higher you appear. Customers also filter by service type, so make sure your profile lists all relevant skills.'
      },
    ]
  },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200 ${open ? 'bg-brand-50/40' : 'bg-white'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className={`font-bold text-sm ${open ? 'text-brand-700' : 'text-slate-800'}`}>{q}</span>
        {open
          ? <ChevronUp size={18} className="text-brand-500 shrink-0" />
          : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100/80 pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

const Help = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = faqs.map(section => ({
    ...section,
    items: section.items.filter(
      item =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(s => s.items.length > 0);

  const displayed = search
    ? filtered
    : activeCategory
      ? faqs.filter(f => f.category === activeCategory)
      : faqs;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 text-brand-500 rounded-2xl mx-auto">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-4xl font-black text-slate-900">Help & Support</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Everything you need to know about using <span className="text-brand-500 font-bold">ExpertEase</span>. Search below or browse by topic.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for help... e.g. 'how to book', 'track my tasker'"
          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all shadow-sm"
        />
      </div>

      {/* Category Chips */}
      {!search && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${!activeCategory ? 'bg-brand-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            All Topics
          </button>
          {faqs.map(f => (
            <button
              key={f.category}
              onClick={() => setActiveCategory(activeCategory === f.category ? null : f.category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeCategory === f.category ? 'bg-brand-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {f.icon} {f.category}
            </button>
          ))}
        </div>
      )}

      {/* FAQ Sections */}
      <div className="space-y-10">
        {displayed.map(section => (
          <div key={section.category}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${section.color}`}>
                {section.icon}
              </div>
              <h2 className="text-lg font-black text-slate-900">{section.category}</h2>
            </div>
            <div className="space-y-3">
              {section.items.map(item => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
        {displayed.length === 0 && (
          <div className="text-center py-16">
            <AlertTriangle size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="font-bold text-slate-500">No results found for "{search}"</p>
            <p className="text-sm text-slate-400 mt-1">Try different keywords or browse all topics.</p>
          </div>
        )}
      </div>

      {/* Contact Banner */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-8 text-white text-center space-y-4">
        <h3 className="text-2xl font-black">Still need help?</h3>
        <p className="text-brand-100 font-medium">Our support team is here for you. Reach out and we'll get back to you quickly.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
          <a href="mailto:support@expertease.in" className="flex items-center justify-center gap-2 bg-white text-brand-600 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-md">
            <Mail size={18} /> support@expertease.in
          </a>
          <a href="tel:+918005551234" className="flex items-center justify-center gap-2 bg-brand-600/60 border border-brand-400 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors">
            <Phone size={18} /> +91 800 555 1234
          </a>
        </div>
      </div>
    </div>
  );
};

export default Help;
