import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Leaf,
  Microscope,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import logo from '../../assets/logo-transparent.png';
import leafPhoto from '../../assets/hero image.png';

const workflow = ['Upload leaf', 'Detect disease', 'Explain signal', 'Advise action', 'Prevent spread', 'Save record'];

const destinations = [
  { title: 'Farmer scan', description: 'Upload a leaf, see the disease, the confidence, and what to do about it.', screen: 'farmer', icon: <Camera size={18} /> },
  { title: 'Model research', description: 'Compare ResNet50, EfficientNet-B0, and MobileNetV3 on accuracy.', screen: 'research', icon: <Microscope size={18} /> },
  { title: 'Admin dashboard', description: 'Review prediction history, trends, and every saved report.', screen: 'admin', icon: <BookOpen size={18} /> },
];

function Home({ navigate }) {
  const links = [
    { label: 'Home', href: '/', active: true, screen: 'home' },
    { label: 'Farmer scan', href: '/farmer', screen: 'farmer' },
    { label: 'Research', href: '/research', screen: 'research' },
    { label: 'Admin', href: '/admin', screen: 'admin' },
  ];

  return (
    <div className="min-h-screen bg-forest px-4 py-4 font-sans text-parchment sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-2xl border border-[#24513B] bg-forest shadow-[0_24px_80px_rgba(22,41,29,0.28)]">
        <Navbar logoSrc={logo} links={links} onNavigate={navigate} />
        <section className="relative overflow-hidden border-b border-[#24513B] bg-[radial-gradient(circle_at_12%_70%,rgba(37,117,66,0.22),transparent_24%),linear-gradient(115deg,#073523,#022218)] px-7 py-12 text-parchment sm:px-12 lg:px-14 lg:py-10">
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full border border-leaf/10" />
          <div className="pointer-events-none absolute -left-10 bottom-6 h-44 w-44 rounded-full border border-leaf/10" />
          <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 min-[900px]:grid-cols-[0.92fr_1.08fr] min-[1100px]:gap-20">
            <div className="max-w-[610px]">
              <h1 className="max-w-[12ch] font-serif text-[42px] font-medium leading-[1.08] text-parchment sm:text-[52px] lg:text-[60px]">Know what&apos;s wrong with your grove before it <span className="text-[#86D84A]">spreads.</span></h1>
              <p className="mt-6 max-w-[49ch] text-base leading-relaxed text-[#BFD5C3] sm:text-lg">Photograph a citrus or guava leaf and get a verified diagnosis, explained in plain language, in under a minute.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={() => navigate('farmer')} className="inline-flex items-center gap-3 rounded-lg bg-turmeric px-5 py-3 text-sm font-semibold text-forestDeep shadow-[0_8px_20px_rgba(217,154,43,0.2)] transition hover:bg-[#E6AB3B]"><Camera size={18} /> Start a scan <ArrowRight size={16} /></button>
                <button type="button" onClick={() => navigate('research')} className="inline-flex items-center gap-3 rounded-lg border border-[#63816D] px-5 py-3 text-sm text-parchment transition hover:border-[#A8C5AC] hover:bg-[#0C422D]"><BookOpen size={17} /> See model research</button>
              </div>
              <div className="mt-8 grid max-w-[590px] grid-cols-2 gap-4 border-t border-[#3A654C] pt-5 sm:grid-cols-4">
                <Proof icon={<ShieldCheck />} value="84.09%" label="Test Accuracy" detail="ResNet50" />
                <Proof icon={<Check />} value="10" label="Disease Classes" />
                <Proof icon={<Zap />} value="Under 1 Minute" label="Results" />
                <Proof icon={<Camera />} value="Mobile" label="Friendly" />
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[620px]">
              <div className="rounded-2xl border border-[#3A7650] bg-[#174C32] p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]"><img src={leafPhoto} alt="Guava leaves and fruit on the tree" className="aspect-[1.08] w-full rounded-xl object-cover" /></div>
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border border-white/50 bg-parchment/95 px-5 py-4 text-soil shadow-[0_12px_30px_rgba(0,0,0,0.2)] sm:left-8 sm:right-auto sm:w-[300px]"><div><span className="block text-[11px] text-soilMuted">Likely Diagnosis</span><strong className="mt-1 block text-base">Guava Anthracnose</strong><span className="mt-1 block text-sm font-semibold text-success">Confidence: 92%</span></div><ChevronRight className="text-success" size={21} /></div>
            </div>
          </div>
        </section>
        <div className="border-b border-[#24513B] bg-[#06291D] px-7 py-4 sm:px-12 lg:px-14"><div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 text-sm text-[#BFD5C3]"><span className="inline-flex items-center gap-2"><Leaf size={18} className="text-[#86D84A]" /> Trusted by farmers and researchers</span><span className="text-[#86D84A]">ICAR</span><span>IARI</span><span>IHR</span><span>Krishi Vigyan Kendra</span><span className="inline-flex items-center gap-2"><span className="rounded-full bg-[#368D43] px-3 py-1 text-xs font-semibold text-white">+250</span> Farmers and growing</span></div></div>
      </div>
      <main id="resources" className="mx-auto max-w-[1240px] px-3 py-12 text-parchment sm:px-7"><section><p className="mb-4 text-sm font-semibold text-[#F5F0E1]">How a scan works</p><div className="relative grid grid-cols-3 gap-6 min-[700px]:flex min-[700px]:justify-between min-[700px]:gap-2"><div className="pointer-events-none absolute left-4 right-4 top-[15px] hidden border-t border-dashed border-parchment/50 min-[700px]:block" />{workflow.map((step, index) => <div key={step} className="relative z-10 flex flex-col items-center gap-2 text-center min-[700px]:flex-1"><span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-turmeric text-sm font-semibold text-forestDeep shadow-[0_2px_0_#B5791C]">{index + 1}</span><span className="text-xs font-medium text-parchment">{step}</span></div>)}</div></section><section id="about" className="mt-14"><p className="mb-4 text-sm text-parchment">Where to go</p><div className="grid grid-cols-1 gap-5 min-[700px]:grid-cols-3">{destinations.map((destination) => <article key={destination.title} className="rounded-xl bg-parchmentDark p-[22px] shadow-[5px_5px_0_#1F3D2B]"><div className="mb-7 grid h-10 w-10 place-items-center rounded-full bg-forest text-[#D4EA9A]">{destination.icon}</div><h2 className="font-serif text-[21px] font-medium text-soil">{destination.title}</h2><p className="mt-3 text-sm leading-relaxed text-soilMuted">{destination.description}</p><button type="button" onClick={() => navigate(destination.screen)} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-turmericDeep hover:text-rust">Open <ArrowRight size={15} /></button></article>)}</div></section></main>
    </div>
  );
}

function Proof({ icon, value, label, detail }) {
  return <div className="flex items-start gap-2 border-r border-[#3A654C] pr-3 last:border-0"><span className="mt-0.5 text-[#A7D84D]">{React.cloneElement(icon, { size: 19 })}</span><span><strong className="block text-sm font-semibold text-[#A7D84D]">{value}</strong><small className="block text-[11px] text-[#BFD5C3]">{label}{detail && <><br />({detail})</>}</small></span></div>;
}

export default Home;
