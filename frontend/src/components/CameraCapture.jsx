import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

function classifyCameraError(error) {
  const name = error?.name || '';
  if (
    name === 'NotAllowedError' ||
    name === 'PermissionDeniedError' ||
    name === 'SecurityError' ||
    name === 'PermissionDismissedError'
  ) {
    return 'permission';
  }
  if (
    name === 'NotFoundError' ||
    name === 'DevicesNotFoundError' ||
    name === 'NoDistinctAllDevicesError'
  ) {
    return 'no-device';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return 'unavailable';
  }
  if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
    return 'overconstrained';
  }
  return 'unsupported';
}

function getVideoInputs() {
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.enumerateDevices !== 'function') {
    return Promise.resolve([]);
  }
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => devices.filter((device) => device.kind === 'videoinput'))
    .catch(() => []);
}

function pickRearDeviceId(videoInputs) {
  for (const device of videoInputs) {
    const label = (device.label || '').toLowerCase();
    if (label && /rear|back|environment/.test(label)) return device.deviceId;
  }
  return null;
}

async function tryGetUserMedia(constraints) {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    return { error: classifyCameraError(error) };
  }
}

function CameraCapture({ onCapture, onError }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const onCaptureRef = useRef(onCapture);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState('starting');
  const [aspect, setAspect] = useState(4 / 3);

  onCaptureRef.current = onCapture;
  onErrorRef.current = onError;

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const reportError = (kind) => {
    setStatus('error');
    onErrorRef.current?.(kind);
  };

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      reportError('unsupported');
      return;
    }

    const videoInputs = await getVideoInputs();
    const rearDeviceId = pickRearDeviceId(videoInputs);
    const resolution = { width: { ideal: 1280 }, height: { ideal: 720 } };

    const attempts = [
      rearDeviceId
        ? { video: { ...resolution, deviceId: { exact: rearDeviceId }, facingMode: { exact: 'environment' } }, audio: false }
        : { video: { ...resolution, facingMode: { exact: 'environment' } }, audio: false },
      { video: { ...resolution, facingMode: { ideal: 'environment' } }, audio: false },
      { video: true, audio: false },
    ];

    let stream = null;
    for (const constraints of attempts) {
      const result = await tryGetUserMedia(constraints);
      if (result.error) {
        if (result.error === 'overconstrained' || result.error === 'no-device') continue;
        reportError(result.error);
        return;
      }
      stream = result;
      break;
    }

    if (!stream) {
      reportError('unavailable');
      return;
    }

    const track = stream.getVideoTracks()[0];
    const currentFacing =
      track && typeof track.getSettings === 'function' ? track.getSettings().facingMode : undefined;

    if (track && currentFacing === 'front') {
      const labelledInputs = await getVideoInputs();
      const labelledRearId = pickRearDeviceId(labelledInputs);
      const currentDeviceId = track.getSettings().deviceId;
      if (labelledRearId && labelledRearId !== currentDeviceId) {
        try {
          const upgraded = await navigator.mediaDevices.getUserMedia({
            video: { ...resolution, deviceId: { exact: labelledRearId }, facingMode: { exact: 'environment' } },
            audio: false,
          });
          stream.getTracks().forEach((t) => t.stop());
          stream = upgraded;
        } catch {
          /* keep the working stream; never crash on an upgrade failure */
        }
      }
    }

    streamRef.current = stream;
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        /* autoplay is best-effort; the video element is muted + playsInline */
      }
      if (video.videoWidth && video.videoHeight) {
        setAspect(video.videoWidth / video.videoHeight);
      }
    }
    setStatus('live');
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      const video = videoRef.current;
      if (video) video.srcObject = null;
    };
  }, [startCamera]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      stopStream();
      onCaptureRef.current?.(file, previewUrl);
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="relative w-full max-w-[640px] max-h-[70dvh] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
         style={{ aspectRatio: aspect }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-contain"
        aria-label="Live camera preview"
      />
      {status === 'live' && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[64%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative aspect-[4/3] rounded-[46%_46%_46%_46%/38%_38%_38%_38%] border-2 border-leaf/70" />
        </div>
      )}
      {status === 'live' && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-[#D4EA9A]">
          Center the leaf inside the frame
        </p>
      )}
      {status === 'starting' && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 text-[#D4EA9A]">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="animate-spin" size={18} /> Preparing camera…
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={capture}
        disabled={status !== 'live'}
        aria-label="Capture leaf photo"
        title="Capture photo"
        className="absolute bottom-4 left-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full border-4 border-[#F5F0E1]/90 bg-black/25 transition hover:bg-black/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="h-14 w-14 rounded-full bg-turmeric shadow-[0_10px_26px_rgba(217,154,43,0.55)]" />
      </button>
    </div>
  );
}

export default CameraCapture;