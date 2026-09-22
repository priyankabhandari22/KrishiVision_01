import { confidencePercent, reportTimestamp, titleCase, reportIdLabel } from "./reportUtils";
import { RESOURCES } from "../data/diseaseContent";

const PAGE_W = 210;
const M = 16;
const CW = PAGE_W - M * 2;
const BOTTOM = 270;

const BRAND = [31, 81, 59];
const GOLD = [217, 154, 43];
const INK = [27, 43, 34];
const MUTED = [91, 107, 95];
const LINE = [220, 227, 215];
const SOFT = [242, 246, 238];

function wrap(doc, value, maxWidth) {
  const text = String(value || "");
  const lines = doc.splitTextToSize(text, maxWidth);
  return lines.length ? lines : [""];
}

function ensure(doc, height, cursor) {
  if (cursor.y + height > BOTTOM) {
    doc.addPage();
    return { x: M, y: 22 };
  }
  return cursor;
}

function sectionTitle(doc, cursor, num, title) {
  const layout = ensure(doc, 16, cursor);
  layout.y += 2;
  doc.setFillColor(...SOFT);
  doc.roundedRect(layout.x, layout.y - 7, CW, 10, 2, 2, "F");
  doc.setFillColor(...GOLD);
  doc.roundedRect(layout.x, layout.y - 7, 5, 10, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND);
  doc.text(num ? `${num}.  ${title}` : title, layout.x + 9, layout.y + 0.2);
  return { x: M, y: layout.y + 11 };
}

function bullets(doc, cursor, items, { marker = "•", size = 9.5, lineHeight = 5.4 } = {}) {
  let y = cursor.y;
  const list = Array.isArray(items) ? items : [];
  list.forEach((item) => {
    if (!item) return;
    const layout = ensure(doc, 10, { x: M, y });
    y = layout.y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...GOLD);
    doc.text(marker, layout.x, y + 1.4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    const lines = wrap(doc, item, CW - 7);
    lines.forEach((line, index) => {
      doc.text(line, layout.x + 6, y + 1.4 + index * lineHeight);
    });
    y += Math.max(lines.length, 1) * lineHeight + 1.6;
  });
  return { x: M, y };
}

function paragraph(doc, cursor, value, { size = 9.5, color = INK, lineHeight = 5.4, style = "normal" } = {}) {
  const layout = ensure(doc, 10, cursor);
  const lines = wrap(doc, value, CW - 8);
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  lines.forEach((line, index) => {
    doc.text(line, layout.x + 4, layout.y + 1.4 + index * lineHeight);
  });
  return { x: M, y: layout.y + lines.length * lineHeight + 2 };
}

function noteBox(doc, cursor, value) {
  const layout = ensure(doc, 14, cursor);
  doc.setDrawColor(...LINE);
  doc.setFillColor(255, 255, 255);
  const lines = wrap(doc, value, CW - 12);
  const height = lines.length * 5 + 10;
  const final = ensure(doc, height, layout);
  doc.roundedRect(final.x, final.y, CW, height, 2, 2, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  lines.forEach((line, index) => {
    doc.text(line, final.x + 6, final.y + 9 + index * 5.6);
  });
  return { x: M, y: final.y + height + 4 };
}

async function loadImage(src) {
  if (!src) throw new Error("no image src");
  let targetSrc = src;
  if (typeof src === 'string' && src.startsWith('/')) {
    const apiBase = (window.KRISHIVISION_API_URL || window.location.origin).replace(/\/$/, '');
    targetSrc = `${apiBase}${src}`;
  }

  if (typeof targetSrc === 'string' && (targetSrc.startsWith('data:') || targetSrc.startsWith('blob:'))) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const targetWidth = 960;
          const ratio = Math.max(1, Math.round((img.naturalWidth || 400) / targetWidth));
          const width = Math.round((img.naturalWidth || 400) / ratio);
          const height = Math.round((img.naturalHeight || 300) / ratio);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.85), width, height });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("unable to decode image"));
      img.src = targetSrc;
    });
  }

  const response = await fetch(targetSrc);
  if (!response.ok) throw new Error("unable to load image");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("unable to decode image"));
      img.src = objectUrl;
    });
    const targetWidth = 960;
    const ratio = Math.max(1, Math.round((img.naturalWidth || 400) / targetWidth));
    const width = Math.round((img.naturalWidth || 400) / ratio);
    const height = Math.round((img.naturalHeight || 300) / ratio);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), width, height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function drawBrandHeader(doc, logoUrl) {
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, PAGE_W, 34, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 34, PAGE_W, 1.2, "F");
  let logoOffset = 0;
  if (logoUrl) {
    try {
      const converted = await loadImage(logoUrl);
      if (converted && converted.dataUrl) {
        const chip = 16;
        const logoH = Math.min(chip - 4, (chip - 8) * (converted.height / converted.width || 1));
        const logoW = logoH * (converted.width / converted.height || 1);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, 8, chip, chip, 4, 4, "F");
        doc.addImage(converted.dataUrl, "JPEG", M + (chip - logoW) / 2, 8 + (chip - logoH) / 2, logoW, logoH, undefined, "FAST");
        logoOffset = chip + 6;
      }
    } catch (_) {
      /* logo embedding is optional */
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text("KrishiVision", M + logoOffset, 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text("AI Advisory Report", M + logoOffset, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(217, 229, 221);
  doc.text("Inference-first crop intelligence · ResNet50 · Grad-CAM · Verified knowledge base", PAGE_W - M, 29, { align: "right" });
}

function metaBox(doc, cursor, report, content, percent, timestamp, reportId) {
  const rowHeight = 6.4;
  const rows = [
    ["Crop", titleCase(report.crop)],
    ["Detected condition", content?.displayTitle || "Detected Condition"],
    ["Confidence", percent == null ? "Not available" : `${percent}%`],
    ["Diagnosis", titleCase(report.status)],
    ["Date and time", timestamp],
    reportId ? ["Report ID", reportId] : null
  ].filter(Boolean);
  const height = rows.length * rowHeight + 12;
  const layout = ensure(doc, height + 6, cursor);
  doc.setDrawColor(...LINE);
  doc.setFillColor(...SOFT);
  doc.roundedRect(layout.x, layout.y, CW, height, 3, 3, "FD");
  rows.forEach(([label, value], index) => {
    const y = layout.y + 9 + index * rowHeight;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(String(label || "").toUpperCase(), layout.x + 8, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(String(value || ""), layout.x + CW / 2, y);
  });
  return { x: M, y: layout.y + height + 6 };
}

function timeline(doc, cursor, content) {
  let y = cursor.y;
  const items = Array.isArray(content?.timeline) ? content.timeline : [];
  items.forEach((entry) => {
    if (!entry) return;
    const periodStr = String(entry.period || "");
    const titleStr = String(entry.title || "");
    const descStr = String(entry.description || "");
    const lines = wrap(doc, descStr, CW - 10);
    const height = lines.length * 5 + 11;
    const layout = ensure(doc, height, { x: M, y });
    y = layout.y;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...LINE);
    doc.roundedRect(layout.x, layout.y, CW, height, 2.5, 2.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text(periodStr, layout.x + 6, layout.y + 7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND);
    const titleLines = wrap(doc, titleStr, CW - 42);
    titleLines.forEach((line, index) => {
      doc.text(line, layout.x + 44, layout.y + 7 + index * 6);
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    lines.forEach((line, index) => {
      doc.text(line, layout.x + 6, layout.y + 15 + index * 5);
    });
    y += height + 3;
  });
  return { x: M, y };
}

function resources(doc, cursor, content) {
  let y = cursor.y;
  const resKeys = Array.isArray(content?.resources) ? content.resources : [];
  resKeys.forEach((key) => {
    const resource = RESOURCES[key];
    if (!resource) return;
    const lines = wrap(doc, resource.note || "", CW - 6);
    const height = lines.length * 5 + 12;
    const layout = ensure(doc, height, { x: M, y });
    y = layout.y;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...LINE);
    doc.roundedRect(layout.x, layout.y, CW, height, 2.5, 2.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND);
    doc.text(String(resource.title || ""), layout.x + 6, layout.y + 6.5);
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    lines.forEach((line, index) => {
      doc.text(line, layout.x + 6, layout.y + 12 + index * 4.8);
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GOLD);
    const urlY = y + height - 3.5;
    const url = String(resource.url || "");
    if (url) {
      doc.textWithLink(url, layout.x + 6, urlY, { url });
      doc.link(layout.x + 6, urlY - 1, doc.getTextWidth(url), 2, { url });
    }
    y += height + 3;
  });
  return { x: M, y };
}

function safety(doc, cursor, report, content) {
  const lines = [];
  lines.push(`This report describes only the uploaded leaf. The uploaded leaf is classified as ${content?.displayTitle || "Detected Condition"}.`);
  lines.push("Accuracy, precision, recall, F1 score, and confusion matrices are evaluation metrics for labeled test datasets, not individual image predictions.");
  if (report.disclaimer) lines.push(report.disclaimer);
  let y = cursor.y;
  lines.forEach((value) => {
    const layout = ensure(doc, 10, { x: M, y });
    y = layout.y;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    const wrapped = wrap(doc, value, CW - 8);
    wrapped.forEach((line, index) => {
      doc.text(line, layout.x + 4, layout.y + 1 + index * 4.8);
    });
    y += wrapped.length * 4.8 + 1.2;
  });
  return { x: M, y };
}

function addFooter(doc) {
  const count = doc.getNumberOfPages();
  for (let page = 1; page <= count; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("This advisory supports field observation and does not replace qualified agricultural advice.", M, 287);
    doc.text(`KrishiVision AI Advisory Report · Page ${page} of ${count}`, PAGE_W - M, 287, { align: "right" });
  }
  return doc;
}

export async function generatePdf(report, content, options = {}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: "KrishiVision AI Advisory Report", subject: "Crop disease advisory", author: "KrishiVision" });

  const percent = confidencePercent(report.confidence);
  const timestamp = reportTimestamp(report.timestamp);
  const reportId = reportIdLabel(report.id || report._id);
  const diseased = report.status !== "healthy";
  const note = diseased ? TIMELINE_NOTE_DISEASED() : TIMELINE_NOTE_HEALTHY();

  let cursor = { x: M, y: 44 };
  await drawBrandHeader(doc, options.logoUrl);
  cursor = metaBox(doc, cursor, report, content, percent, timestamp, reportId);

  const previewUrl = options.preview || report?.preview;
  const heatmapUrl = options.heatmapPath || report?.heatmap_path;
  const images = [];
  if (previewUrl) {
    try {
      const converted = await loadImage(previewUrl);
      if (converted && converted.dataUrl) {
        images.push({ dataUrl: converted.dataUrl, label: "Uploaded leaf", ratio: converted.height / converted.width || 0.75 });
      }
    } catch (err) {
      console.warn("Preview image loading skipped for PDF:", err);
    }
  }
  if (heatmapUrl) {
    try {
      const converted = await loadImage(heatmapUrl);
      if (converted && converted.dataUrl) {
        images.push({ dataUrl: converted.dataUrl, label: "Grad-CAM heatmap", ratio: converted.height / converted.width || 0.75 });
      }
    } catch (err) {
      console.warn("Heatmap image loading skipped for PDF:", err);
    }
  }

  if (images.length) {
    cursor = sectionTitle(doc, cursor, "", "Prediction result");
    const boxW = images.length === 2 ? (CW - 6) / 2 : CW;
    images.forEach((image, index) => {
      const imgW = boxW - 8;
      const imgH = Math.min(56, imgW * image.ratio);
      const layout = ensure(doc, 20, cursor);
      cursor.x = M + index * (boxW + 6);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...LINE);
      doc.roundedRect(cursor.x, layout.y, boxW, imgH + 12, 2.5, 2.5, "FD");
      doc.addImage(image.dataUrl, "JPEG", cursor.x + 4, layout.y + 4, imgW, imgH, undefined, "FAST");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(image.label, cursor.x + 4, layout.y + imgH + 9);
      cursor.y = layout.y + imgH + 12;
      cursor.x = M;
    });
    cursor.y += 4;
  }

  cursor = sectionTitle(doc, cursor, 1, "Problem explanation");
  cursor = paragraph(doc, cursor, report.explanation || content?.displayTitle || "Detected condition");
  cursor = { x: M, y: cursor.y + 1 };
  cursor = bullets(doc, cursor, content?.keyPoints);

  cursor = sectionTitle(doc, cursor, 2, "Immediate action");
  cursor = bullets(doc, cursor, Array.isArray(report.immediate_actions) ? report.immediate_actions : [], { marker: "✓" });

  cursor = sectionTitle(doc, cursor, 3, "Disease spread prevention");
  cursor = bullets(doc, cursor, Array.isArray(report.spread_prevention) ? report.spread_prevention : []);

  cursor = sectionTitle(doc, cursor, 4, "Long-term prevention");
  const ltp = report.long_term_prevention || {};
  if (ltp.inspection_frequency) {
    cursor = paragraph(doc, cursor, `Inspection frequency: ${ltp.inspection_frequency}`);
  }
  if (Array.isArray(ltp.universal_hygiene_practices) && ltp.universal_hygiene_practices.length) {
    cursor = bullets(doc, cursor, ltp.universal_hygiene_practices);
  }
  if (Array.isArray(ltp.long_term_monitoring) && ltp.long_term_monitoring.length) {
    cursor = bullets(doc, cursor, ltp.long_term_monitoring);
  }

  cursor = sectionTitle(doc, cursor, 5, "Expected management timeline");
  cursor = timeline(doc, cursor, content);
  cursor = noteBox(doc, cursor, note);

  cursor = sectionTitle(doc, cursor, 6, "Monitoring advice");
  if (ltp.inspection_guidance) {
    cursor = { x: M, y: cursor.y + 1 };
    cursor = paragraph(doc, cursor, ltp.inspection_guidance);
    cursor = { x: M, y: cursor.y + 1 };
  }
  cursor = bullets(doc, cursor, content?.monitoring);

  cursor = sectionTitle(doc, cursor, 7, "When to contact an expert");
  cursor = bullets(doc, cursor, content?.expertHelp);

  cursor = sectionTitle(doc, cursor, 8, "Helpful resources");
  cursor = resources(doc, cursor, content);

  cursor = sectionTitle(doc, cursor, "", "Important notes");
  cursor = safety(doc, cursor, report, content);

  addFooter(doc);
  const suffix = `${String(report.crop || "crop")}-${String(report.disease || "result")}`.replace(/[^a-z0-9_-]/gi, "-");
  doc.save(`KrishiVision-Advisory-${suffix}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function TIMELINE_NOTE_DISEASED() {
  return "Recovery time cannot be reliably predicted from a single leaf image. Continue monitoring and follow the recommended management steps. Actual response depends on disease severity, weather, crop condition and management practices.";
}

function TIMELINE_NOTE_HEALTHY() {
  return "This schedule reflects routine maintenance because no disease was detected on the uploaded leaf. Continue regular care and keep monitoring.";
}