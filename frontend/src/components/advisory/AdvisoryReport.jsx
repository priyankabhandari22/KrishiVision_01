import React, { useState } from 'react';
import { getDiseaseContent, TIMELINE_NOTES } from '../../data/diseaseContent';
import { confidencePercent, reportTimestamp, reportIdLabel, titleCase } from '../../lib/reportUtils';
import { generatePdf } from '../../lib/pdfReport';
import logo from '../../../assets/logo-transparent.png';
import ReportHeader from './ReportHeader';
import ReportActions from './ReportActions';
import AdvisoryDisclaimer from './AdvisoryDisclaimer';
import PredictionSummary from './PredictionSummary';
import ProblemExplanation from './ProblemExplanation';
import ImmediateAction from './ImmediateAction';
import SpreadPrevention from './SpreadPrevention';
import LongTermPrevention from './LongTermPrevention';
import ManagementTimeline from './ManagementTimeline';
import MonitoringAdvice from './MonitoringAdvice';
import ExpertHelp from './ExpertHelp';
import HelpfulResources from './HelpfulResources';

export default function AdvisoryReport({ report }) {
  const content = getDiseaseContent(report.crop, report.disease);
  const percent = confidencePercent(report.confidence);
  const timestamp = reportTimestamp(report.timestamp);
  const reportId = reportIdLabel(report.id || report._id);
  const diseased = report.status !== 'healthy';
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await generatePdf(report, content, {
        preview: report.preview,
        heatmapPath: report.heatmap_path,
        logoUrl: logo
      });
    } catch (err) {
      console.error(err);
      window.alert('Could not generate the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="advisory-report">
      <ReportHeader
        crop={titleCase(report.crop)}
        displayDisease={content.displayTitle}
        confidence={percent}
        status={report.status}
        timestamp={timestamp}
        reportId={reportId}
      />
      <ReportActions onDownload={downloadPdf} downloading={downloading} />
      <AdvisoryDisclaimer report={report} displayTitle={content.displayTitle} />
      <PredictionSummary report={report} displayTitle={content.displayTitle} percent={percent} />
      <div className="advisory-flow">
        <ProblemExplanation report={report} content={content} />
        <ImmediateAction report={report} content={content} />
        <SpreadPrevention report={report} content={content} />
        <LongTermPrevention report={report} content={content} />
        <ManagementTimeline content={content} note={TIMELINE_NOTES[diseased ? 'diseased' : 'healthy']} />
        <MonitoringAdvice report={report} content={content} />
        <ExpertHelp content={content} />
        <HelpfulResources content={content} />
      </div>
      <ReportActions onDownload={downloadPdf} downloading={downloading} />
    </section>
  );
}