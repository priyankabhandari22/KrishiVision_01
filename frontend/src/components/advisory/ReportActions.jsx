import React from 'react';
import { Download, Printer, Loader2 } from 'lucide-react';

export default function ReportActions({ onDownload, downloading }) {
  return (
    <div className="report-actions">
      <button className="button button-primary" onClick={onDownload} disabled={downloading}>
        {downloading ? (
          <>
            <Loader2 className="spin" size={17} /> Preparing PDF...
          </>
        ) : (
          <>
            <Download size={17} /> Download PDF
          </>
        )}
      </button>
      <button className="button button-secondary" onClick={() => window.print()}>
        <Printer size={17} /> Print Report
      </button>
    </div>
  );
}