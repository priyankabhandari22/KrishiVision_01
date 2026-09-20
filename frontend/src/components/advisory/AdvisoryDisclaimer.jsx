import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';

export default function AdvisoryDisclaimer({ report, displayTitle }) {
  return (
    <div className="advisory-note">
      <div>
        <p className="advisory-note-line">
          <Info size={15} />
          <span>
            This report describes only this uploaded leaf, classified as <strong>{displayTitle}</strong>.
            It does not represent the whole farm or orchard.
          </span>
        </p>
        <p className="advisory-note-line">
          <Info size={15} />
          <span>
            Accuracy, precision, recall, F1 score, and confusion matrices are evaluation
            metrics for labeled test datasets, not individual image predictions.
          </span>
        </p>
        {report.disclaimer ? (
          <p className="advisory-note-line">
            <Info size={15} />
            <span>{report.disclaimer}</span>
          </p>
        ) : null}
      </div>
      {!report.is_confident ? (
        <p className="advisory-warning">
          <AlertTriangle size={15} />
          <span>{report.confidence_warning || 'Low-confidence result: use it as a signal and confirm it with an agricultural expert.'}</span>
        </p>
      ) : null}
    </div>
  );
}