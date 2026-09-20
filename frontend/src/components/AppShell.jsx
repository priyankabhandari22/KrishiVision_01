import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo-transparent.png';

function AppShell({ screen, navigate, children }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (user?.name?.trim() || 'F').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F4F1E6] font-sans text-soil">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#3A654C] bg-forest px-4 py-2.5 lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <img src={logo} alt="" className="h-10 w-auto shrink-0 object-contain" />
          <span className="min-w-0">
            <span className="block truncate font-serif text-base font-semibold leading-tight text-parchment">KrishiVision</span>
            <span className="block truncate text-[11px] text-[#A9D7A0]">Farmer workspace</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation menu"
            className="grid h-11 w-11 place-items-center rounded-lg border border-parchment/30 text-parchment"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            type="button"
            onClick={() => navigate('profile')}
            aria-label="Open profile"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-turmeric text-sm font-bold text-forestDeep"
          >
            {initial}
          </button>
        </div>
      </header>

      <div className="flex min-h-screen">
        <Sidebar screen={screen} navigate={navigate} menuOpen={menuOpen} onMenuChange={setMenuOpen} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto w-full max-w-[1280px] grow overflow-x-clip px-4 py-6 sm:px-6 lg:px-8 lg:py-9">{children}</div>
          <footer className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 pb-8 sm:px-6 lg:px-8 text-xs text-soilMuted">
            <span className="font-semibold text-soil">KrishiVision</span>
            <span>Inference-first crop intelligence</span>
            <span>ResNet50 · Grad-CAM · Verified guidance</span>
            <span>© {new Date().getFullYear()} KrishiVision</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default AppShell;