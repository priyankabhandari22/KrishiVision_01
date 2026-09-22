import React, { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

function Navbar({ logoSrc, links, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const handleLinkClick = (event, link) => {
    if (!onNavigate || !link.screen) return;
    event.preventDefault();
    setMenuOpen(false);
    onNavigate(link.screen);
  };

  const linkClasses = (link) =>
    `rounded border px-3.5 py-1.5 text-sm no-underline transition-colors max-[640px]:px-3 max-[640px]:py-1.5 max-[390px]:text-xs ${
      link.active
        ? 'border-turmeric bg-turmeric font-semibold text-forestDeep'
        : 'border-parchment/35 text-parchment hover:border-parchment hover:bg-forestDeep'
    }`;

  const mobileLinkClasses = (link) =>
    `block w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium no-underline transition-colors ${
      link.active
        ? 'border-turmeric bg-turmeric font-semibold text-forestDeep'
        : 'border-parchment/35 text-parchment hover:border-parchment hover:bg-forestDeep'
    }`;

  return (
    <header ref={headerRef} className="relative z-10 border-b border-parchment/15 bg-forest px-6 py-3.5 text-parchment sm:px-10 lg:px-14">
      <div className="flex w-full flex-wrap items-center justify-between gap-5">
        <a href="/" className="flex shrink-0 items-center gap-3 no-underline" onClick={(event) => handleLinkClick(event, { screen: 'home' })}>
          <img src={logoSrc} alt="KrishiVision logo" className="h-[78px] w-auto object-contain max-[640px]:h-[62px]" />
          <span className="flex flex-col gap-1">
            <span className="font-serif text-lg font-semibold text-parchment">KrishiVision</span>
            <span className="text-xs text-[#A9D7A0]">AI for Healthy Crops</span>
          </span>
        </a>
        <nav aria-label="Primary navigation" className="flex flex-wrap items-center justify-end gap-2.5 max-[760px]:hidden">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              onClick={(event) => handleLinkClick(event, link)}
              className={linkClasses(link)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navbar-menu"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-parchment/35 text-parchment transition-colors hover:border-parchment hover:bg-forestDeep min-[761px]:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-navbar-menu" className="absolute inset-x-0 top-full z-10 border-b border-parchment/20 bg-forest shadow-[0_18px_30px_rgba(0,0,0,0.3)] min-[761px]:hidden">
          <div className="w-full px-6 pb-4 sm:px-10">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-2 border-t border-parchment/15 pt-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-current={link.active ? 'page' : undefined}
                  onClick={(event) => handleLinkClick(event, link)}
                  className={mobileLinkClasses(link)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;