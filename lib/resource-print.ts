function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function resourcePrintDocument(title: string, text: string, locale = "en") {
  return `<!doctype html><html lang="${locale === "es" ? "es" : "en"}"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>@page{margin:18mm}body{font-family:Arial,sans-serif;color:#213047;line-height:1.5}h1{font-size:22px;margin:0 0 20px}pre{font-family:inherit;font-size:14px;white-space:pre-wrap;overflow-wrap:anywhere;margin:0}</style></head><body><h1>${escapeHtml(title)}</h1><pre>${escapeHtml(text)}</pre></body></html>`;
}

export function printResourceText(title: string, text: string, locale: string) {
  if (!text.trim()) return;
  const frame = document.createElement("iframe");
  frame.title = title;
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  frame.style.cssText = "position:fixed;width:1px;height:1px;bottom:0;left:0;border:0;pointer-events:none";
  frame.dataset.resourcePrint = "true";
  const cleanupTimer = window.setTimeout(() => frame.remove(), 120000);
  frame.addEventListener("load", () => {
    const printWindow = frame.contentWindow;
    if (!printWindow) { frame.remove(); window.clearTimeout(cleanupTimer); return; }
    printWindow.addEventListener("afterprint", () => { frame.remove(); window.clearTimeout(cleanupTimer); }, { once: true });
    printWindow.focus();
    printWindow.print();
  }, { once: true });
  frame.srcdoc = resourcePrintDocument(title, text, locale);
  document.body.appendChild(frame);
}
