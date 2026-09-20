import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import logo from '../../assets/logo-transparent.png';

function AuthLayout({ title, subtitle, children, onBack, footer }) {
  return (
    <div className="min-h-screen bg-forest px-4 py-6 font-sans text-parchment sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[440px] flex-col">
        <div className="flex flex-1 flex-col justify-center py-8">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#BFD5C3] transition hover:text-parchment"
          >
            <ArrowLeft size={16} /> Back to home
          </button>

          <div className="rounded-2xl border border-[#3A654C] bg-forestDeep/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-9">
            <div className="mb-7 flex flex-col items-center text-center">
              <img src={logo} alt="KrishiVision logo" className="h-20 w-auto object-contain" />
              <h1 className="mt-4 font-serif text-2xl font-semibold text-parchment">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-[#BFD5C3]">{subtitle}</p>
            </div>

            {children}
          </div>

          {footer && <div className="mt-5 text-center text-xs text-[#BFD5C3]">{footer}</div>}
        </div>
        <div className="flex items-center justify-center gap-2 pb-4 text-center text-xs text-[#8AA896]">
          <ShieldCheck size={13} /> Protected · KrishiVision farmer accounts
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;