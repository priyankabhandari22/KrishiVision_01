import React from 'react';

function Navbar({ logoSrc, links, onNavigate }) {
  const handleLinkClick = (event, link) => {
    if (!onNavigate || !link.screen) return;
    event.preventDefault();
    onNavigate(link.screen);
  };

  return (
    <header className="relative z-10 border-b border-parchment/15 bg-forest px-7 py-3.5 text-parchment">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-4">
        <a href="/" className="flex shrink-0 items-center gap-3 no-underline" onClick={(event) => handleLinkClick(event, { screen: 'home' })}>
          <img src={logoSrc} alt="KrishiVision logo" className="h-[78px] w-auto object-contain max-[640px]:h-[62px]" />
          <span className="flex flex-col gap-1">
            <span className="font-serif text-lg font-semibold text-parchment">KrishiVision</span>
            <span className="text-xs text-[#A9D7A0]">AI for Healthy Crops</span>
          </span>
        </a>
        <nav aria-label="Primary navigation" className="flex flex-wrap items-center justify-end gap-2.5 max-[760px]:w-full max-[760px]:justify-start">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              onClick={(event) => handleLinkClick(event, link)}
              className={`rounded border px-3.5 py-1.5 text-sm no-underline transition-colors max-[640px]:px-3 max-[640px]:py-1.5 max-[390px]:text-xs ${
                link.active
                  ? 'border-turmeric bg-turmeric font-semibold text-forestDeep'
                  : 'border-parchment/35 text-parchment hover:border-parchment hover:bg-forestDeep'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
