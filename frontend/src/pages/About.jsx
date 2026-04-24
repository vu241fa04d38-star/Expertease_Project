import {
  Zap, Shield, Star, Users, MapPin, Wrench, CheckCircle2, TrendingUp,
  Heart, Globe, Clock, Award, ArrowRight
} from 'lucide-react';

const stats = [
  { value: '10,000+', label: 'Happy Customers', icon: <Users size={22} /> },
  { value: '2,500+', label: 'Verified Taskers', icon: <Wrench size={22} /> },
  { value: '50+', label: 'Service Categories', icon: <Zap size={22} /> },
  { value: '4.8 ★', label: 'Average Rating', icon: <Star size={22} /> },
];

const values = [
  {
    icon: <Shield size={28} />,
    color: 'from-brand-400 to-brand-600',
    title: 'Trust & Safety',
    description: 'Every Tasker is manually reviewed before joining the platform. We verify their skills, identity, and service history to ensure you only work with reliable professionals.'
  },
  {
    icon: <Clock size={28} />,
    color: 'from-amber-400 to-orange-500',
    title: 'Speed & Convenience',
    description: 'Book a skilled professional in minutes — not days. ExpertEase connects you with nearby Taskers who can be at your door quickly, powered by real-time GPS location.'
  },
  {
    icon: <Star size={28} />,
    color: 'from-emerald-400 to-teal-600',
    title: 'Quality You Can Count On',
    description: 'Our transparent rating and review system means you always know who you\'re booking. Taskers are motivated to do excellent work because their reputation depends on it.'
  },
  {
    icon: <Heart size={28} />,
    color: 'from-rose-400 to-pink-600',
    title: 'Community First',
    description: 'ExpertEase empowers local skilled workers to build sustainable income while giving customers access to quality services they can trust — strengthening the community.'
  },
  {
    icon: <Globe size={28} />,
    color: 'from-violet-400 to-purple-600',
    title: 'Transparent Pricing',
    description: 'No hidden fees. You see the full estimated cost (service charge, platform fee, and visit charge) before confirming any booking. You\'re always in control of your spend.'
  },
  {
    icon: <TrendingUp size={28} />,
    color: 'from-cyan-400 to-blue-600',
    title: 'Empowering Taskers',
    description: 'Taskers set their own rates and availability. The platform gives them real-time job requests, a built-in communication tool, and route navigation to make every job seamless.'
  },
];

const timeline = [
  {
    year: '2024',
    title: 'The Idea',
    description: 'Founded by a team passionate about bridging the gap between customers and skilled local workers using modern technology.'
  },
  {
    year: 'Early 2025',
    title: 'Platform Built',
    description: 'Full-stack development completed — real-time maps, booking engine, messaging, and role-based dashboards launched.'
  },
  {
    year: 'Mid 2025',
    title: 'Ratings & Reviews',
    description: 'The trust layer — integrated a 5-star review system so customers can share feedback and the best Taskers get recognized.'
  },
  {
    year: 'Now',
    title: 'Growing Strong',
    description: 'Expanding to new cities, onboarding more service categories, and continuously improving based on real user feedback.'
  },
];

const howItWorks = [
  { step: '01', title: 'Share Your Location', desc: 'ExpertEase uses your GPS to find nearby Taskers, so help is always just around the corner.', icon: <MapPin size={24} /> },
  { step: '02', title: 'Browse & Choose', desc: 'View Tasker profiles with their services, experience, hourly rates, and real customer ratings. Pick the best fit.', icon: <Star size={24} /> },
  { step: '03', title: 'Book in Seconds', desc: 'Select your service, preferred date and time, and confirm. Your request is sent to the Tasker instantly.', icon: <CheckCircle2 size={24} /> },
  { step: '04', title: 'Track & Chat', desc: 'Follow your Tasker on the live map and message them directly — all in one app, no phone calls needed.', icon: <Zap size={24} /> },
];

const About = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-12">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 rounded-3xl p-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-400/30 text-brand-300 text-sm font-bold px-4 py-1.5 rounded-full mb-6">
            <Zap size={14} /> About ExpertEase
          </div>
          <h1 className="text-5xl font-black mb-4 leading-tight">
            On-Demand Services,<br />
            <span className="text-brand-400">Delivered with Trust</span>
          </h1>
          <p className="text-slate-300 text-lg font-medium max-w-2xl leading-relaxed">
            ExpertEase is a smart, location-aware platform that connects you with verified local Taskers for home repairs, maintenance, and much more. We believe that getting quality help at home should be fast, transparent, and hassle-free.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              {s.icon}
            </div>
            <div className="text-3xl font-black text-slate-900">{s.value}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-100 text-brand-500 rounded-xl flex items-center justify-center">
            <Award size={22} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Our Mission</h2>
        </div>
        <p className="text-slate-600 text-base leading-relaxed">
          We built ExpertEase to solve a simple problem: finding a reliable, skilled professional when you need one is too difficult and time-consuming. Searching through directories, making multiple phone calls, and wondering if someone will actually show up — it shouldn't be that hard.
        </p>
        <p className="text-slate-600 text-base leading-relaxed">
          Our mission is to make on-demand home services as easy as ordering food. We leverage real-time GPS location to match customers with the nearest qualified Taskers, give both parties a seamless communication channel, and build trust through verified profiles and transparent reviews.
        </p>
        <p className="text-slate-600 text-base leading-relaxed">
          At the same time, we're committed to empowering skilled local workers — electricians, plumbers, mechanics, carpenters — by giving them a digital platform to grow their business, manage bookings professionally, and earn fairly.
        </p>
      </div>

      {/* How It Works */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 text-center">How ExpertEase Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {howItWorks.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex gap-5 hover:shadow-md transition-shadow group">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-brand-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  {step.icon}
                </div>
              </div>
              <div>
                <span className="text-xs font-black text-brand-400 uppercase tracking-wider">Step {step.step}</span>
                <h3 className="font-black text-slate-900 mt-0.5">{step.title}</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Values */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((v, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${v.color} text-white flex items-center justify-center shadow-md`}>
                {v.icon}
              </div>
              <h3 className="font-black text-slate-900">{v.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 space-y-4">
        <h2 className="text-2xl font-black text-slate-900 mb-8">Our Story</h2>
        <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[13px] before:w-0.5 before:bg-gradient-to-b before:from-brand-400 before:to-brand-100">
          {timeline.map((t, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-8 w-7 h-7 bg-brand-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xs font-black text-brand-500 uppercase tracking-wider">{t.year}</span>
              <h3 className="font-black text-slate-900 mt-1">{t.title}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-3xl p-10 text-center text-white space-y-4 shadow-xl shadow-brand-500/20">
        <h3 className="text-3xl font-black">Ready to get started?</h3>
        <p className="text-brand-100 font-medium max-w-lg mx-auto">
          Join thousands of customers who've discovered a smarter way to get things done at home.
        </p>
        <div className="flex justify-center gap-4 mt-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white/20 border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold">
            <CheckCircle2 size={16} /> Free to Sign Up
          </div>
          <div className="flex items-center gap-2 bg-white/20 border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold">
            <Shield size={16} /> Verified Taskers
          </div>
          <div className="flex items-center gap-2 bg-white/20 border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold">
            <Star size={16} /> Rated 4.8/5
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
