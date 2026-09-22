import React, { useEffect } from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  Camera,
  LayoutDashboard,
  LogOut,
  Microscope,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo-transparent.png';

const NAV_ITEMS = [
  { label: 'Dashboard', screen: 'dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Detect Disease', screen: 'farmer', icon: <Camera size={18} /> },
  { label: 'History', screen: 'admin', icon: <BookOpen size={18} /> },
  { label: 'Crop Guide', screen: 'crop-guide', icon: <Activity size={18} /> },
  { label: 'Analytics', screen: 'analytics', icon: <BarChart3 size={18} /> },
  { label: 'Research', screen: 'research', icon: <Microscope size={18} /> },
];

function Sidebar({ screen, navigate, menuOpen, onMenuChange }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onMenuChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, onMenuChange]);

  const go = (next) => {
    onMenuChange(false);
    navigate(next);
  };

  const displayName = user?.name?.trim() || 'Farmer';
  const initial = displayName.charAt(0).toUpperCase();

  const navList = (compact) => (
    <nav className="flex flex-col gap-0.5" aria-label="Farmer navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.screen}
          type="button"
          onClick={() => go(item.screen)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
            compact ? 'py-2' : 'py-2.5'
          } ${
            screen === item.screen
              ? 'bg-turmeric text-forestDeep'
              : 'text-[#BFD5C3] hover:bg-forestDeep hover:text-parchment'
          }`}
        >
          <span className="grid w-5 shrink-0 place-items-center">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );

  const menuLabel = <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8AA896]">Main menu</p>;

  const userSection = (
    <div>
      <div className="border-t border-[#3A654C] pt-3.5">
        <button
          type="button"
          onClick={() => go('profile')}
          title="Open profile"
          className="flex w-full items-center gap-3 rounded-xl bg-forestDeep/80 px-3 py-2.5 text-left transition hover:bg-forestDeep"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-turmeric text-sm font-bold text-forestDeep">
            {initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-parchment">{displayName}</span>
            <span className="block truncate text-[11px] text-[#8AA896]">{user?.email || 'Farmer account'}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            onMenuChange(false);
            logout();
          }}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg border border-rust/60 px-3.5 py-2 text-sm font-semibold text-[#FFD9C9] transition hover:bg-rust hover:text-white"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );

  const brand = (
    <div className="flex items-center gap-2.5">
      <img src={logo} alt="" className="h-11 w-auto object-contain" />
      <span className="flex flex-col">
        <span className="font-serif text-base font-semibold text-parchment">KrishiVision</span>
        <span className="text-[11px] text-[#A9D7A0]">Farmer workspace</span>
      </span>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col overflow-y-auto bg-forest px-3.5 pb-5 pt-5 text-parchment lg:flex">
        <div className="mb-7 px-2">{brand}</div>
        {menuLabel}
        <div className="mt-2">{navList(true)}</div>
        <div className="mt-auto pt-5">{userSection}</div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => onMenuChange(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-forest px-4 py-5 text-parchment shadow-2xl">
            <div className="mb-6 flex items-center justify-between px-1">
              {brand}
              <button type="button" onClick={() => onMenuChange(false)} aria-label="Close menu" className="rounded-lg p-1.5 text-[#BFD5C3] hover:text-parchment">
                <X size={20} />
              </button>
            </div>
            {menuLabel}
            <div className="mt-2">{navList(false)}</div>
            <div className="mt-auto pt-5">{userSection}</div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;