export function confidencePercent(confidence) {
  if (confidence == null || Number.isNaN(Number(confidence))) return null;
  return Math.round(Number(confidence) * 100);
}

export function reportTimestamp(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function reportIdLabel(value) {
  if (!value) return null;
  if (typeof value === "string" && /^[0-9a-fA-F]{12,}$/.test(value)) return value.slice(-8).toUpperCase();
  return String(value);
}

export function evidenceImageUrl(report, useHeatmap) {
  if (useHeatmap && report?.heatmap_path) return `${window.KRISHIVISION_API_URL || window.location.origin}${report.heatmap_path}`;
  return report?.preview || "";
}

export function titleCase(value) {
  if (!value) return "Not available";
  return String(value)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}