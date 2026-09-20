import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CameraOff, Check, ImageUp, RotateCcw, Upload, X } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';

const ERROR_MESSAGES = {
  permission: {
    title: 'Camera access was denied.',
    body: 'You can upload a leaf image instead.',
  },
  'no-device': {
    title: 'No camera was detected on this device.',
    body: 'Please upload an image instead.',
  },
  unavailable: {
    title: 'The camera is currently unavailable.',
    body: 'Please try again or upload an image instead.',
  },
  unsupported: {
    title: 'Camera capture is not supported in this browser.',
    body: 'Please upload an image instead.',
  },
};

function CameraPage({ navigate, onUsePhoto }) {
  const [phase, setPhase] = useState('live');
  const [attempt, setAttempt] = useState(0);
  const [captured, setCaptured] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const capturedPreviewRef = useRef(null);

  useEffect(
    () => () => {
      if (capturedPreviewRef.current) {
        URL.revokeObjectURL(capturedPreviewRef.current);
        capturedPreviewRef.current = null;
      }
    },
    []
  );

  const back = () => navigate('dashboard');

  const handleCapture = (file, preview) => {
    if (capturedPreviewRef.current) URL.revokeObjectURL(capturedPreviewRef.current);
    capturedPreviewRef.current = preview;
    setCaptured({ file, preview });
    setPhase('captured');
  };

  const handleError = (type) => {
    setErrorType(type);
    setPhase('error');
  };

  const retake = () => {
    if (capturedPreviewRef.current) {
      URL.revokeObjectURL(capturedPreviewRef.current);
      capturedPreviewRef.current = null;
    }
    setCaptured(null);
    setErrorType(null);
    setPhase('live');
    setAttempt((current) => current + 1);
  };

  const usePhoto = () => {
    if (!captured) return;
    const { file, preview } = captured;
    capturedPreviewRef.current = null;
    setCaptured(null);
    onUsePhoto(file, preview);
  };

  const uploadInstead = () => {
    retake();
    navigate('farmer');
  };

  const error = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.unsupported;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-forestDeep text-parchment">
      <header className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3 px-4 py-4">
        <button
          type="button"
          onClick={back}
          aria-label="Back to dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A654C] px-3 py-2 text-sm font-semibold text-[#D4EA9A] transition hover:border-parchment/40 hover:text-parchment"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <h1 className="font-serif text-lg font-semibold text-parchment">Take Photo</h1>
        <button
          type="button"
          onClick={back}
          aria-label="Close camera"
          className="grid h-9 w-9 place-items-center rounded-lg border border-[#3A654C] text-[#D4EA9A] transition hover:border-parchment/40 hover:text-parchment"
        >
          <X size={18} />
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center px-4 pb-6">
        {phase === 'live' && (
          <CameraCapture key={attempt} onCapture={handleCapture} onError={handleError} />
        )}

        {phase === 'captured' && captured && (
          <section className="mx-auto w-full max-w-[640px]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
              <img src={captured.preview} alt="Captured leaf photo" className="block max-h-[60dvh] w-full object-contain" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={retake}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-parchment/40 px-5 py-3.5 text-sm font-semibold text-parchment transition hover:border-parchment hover:bg-white/10"
              >
                <RotateCcw size={17} /> Retake
              </button>
              <button
                type="button"
                onClick={usePhoto}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-turmeric px-5 py-3.5 text-sm font-semibold text-forestDeep shadow-[0_10px_24px_rgba(217,154,43,0.3)] transition hover:bg-[#E6AB3B]"
              >
                <Check size={17} /> Use This Photo
              </button>
            </div>
            <button
              type="button"
              onClick={uploadInstead}
              className="mx-auto mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#BFD5C3] underline-offset-4 transition hover:text-parchment hover:underline"
            >
              <ImageUp size={16} /> Upload an image instead
            </button>
          </section>
        )}

        {phase === 'error' && (
          <section className="mx-auto w-full max-w-[640px] rounded-2xl border border-white/10 bg-[#0C3A26]/80 px-6 py-10 text-center shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#3A654C] text-[#D4EA9A]">
              <CameraOff size={28} />
            </span>
            <h2 className="mt-5 font-serif text-xl font-semibold text-parchment">{error.title}</h2>
            <p className="mx-auto mt-2 max-w-[42ch] text-sm text-[#BFD5C3]">{error.body}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setErrorType(null);
                  setPhase('live');
                  setAttempt((current) => current + 1);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-turmeric px-5 py-3.5 text-sm font-semibold text-forestDeep transition hover:bg-[#E6AB3B] sm:w-auto"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => navigate('farmer')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-parchment/40 px-5 py-3.5 text-sm font-semibold text-parchment transition hover:border-parchment hover:bg-white/10 sm:w-auto"
              >
                <Upload size={17} /> Upload an Image Instead
              </button>
            </div>
          </section>
        )}

        {phase === 'live' && (
          <p className="mt-4 text-center">
            <button
              type="button"
              onClick={uploadInstead}
              className="text-sm font-semibold text-[#BFD5C3] underline-offset-4 transition hover:text-parchment hover:underline"
            >
              Upload an image instead
            </button>
          </p>
        )}
      </main>
    </div>
  );
}

export default CameraPage;