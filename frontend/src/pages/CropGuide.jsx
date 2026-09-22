import React, { useState } from 'react';
import {
  BookOpen, Check, ChevronLeft, CircleAlert, Clock, Eye, Leaf,
  ListChecks, LockKeyhole, Microscope, ShieldCheck, Sprout, UserRound
} from 'lucide-react';
import PageIntro from '../components/PageIntro';
import {
  RESOURCES,
  getDiseaseContent,
  TIMELINE_NOTES,
} from '../data/diseaseContent';

const CROPS = [
  { slug: 'guava', label: 'Guava', blurb: 'A popular subtropical fruit crop. KrishiVision supports guava leaf classification and provides verified management guidance for the diseases below.' },
  { slug: 'citrus', label: 'Citrus', blurb: 'A group of subtropical fruit trees (oranges, mandarins, limes, lemons). KrishiVision supports citrus leaf classification with verified disease guidance.' },
];

const DISEASE_KEYS = {
  guava: ['phytopthora', 'red-rust', 'scab', 'styler-and-root', 'disease-free'],
  citrus: ['canker', 'greening', 'black-spot', 'melanose', 'healthy'],
};

function CropGuidePage({ navigate }) {
  const [crop, setCrop] = useState('guava');
  const active = CROPS.find((item) => item.slug === crop) || CROPS[0];
  const diseases = DISEASE_KEYS[crop];

  return (
    <main className="w-full min-w-0">
      <PageIntro
        back={() => navigate('dashboard')}
        icon={<BookOpen />}
        title="Crop Guide"
        copy="A reference for the crops KrishiVision supports - what to look for in the field, how to prevent spread, and when to call an agricultural expert. Guidance below comes from the same verified knowledge base used by your advisory reports."
      />

      <div className="crop-guide-tabs" role="tablist" aria-label="Choose a crop">
        {CROPS.map((item) => (
          <button
            key={item.slug}
            type="button"
            role="tab"
            aria-selected={crop === item.slug}
            onClick={() => setCrop(item.slug)}
            className={`crop-guide-tab${crop === item.slug ? ' active' : ''}`}
          >
            <Sprout size={17} /> {item.label}
          </button>
        ))}
      </div>

      <section className="crop-guide-orbiter" key={crop}>
        <div className="crop-guide-orbiter-copy">
          <span className="section-label">SUPPORTED CROP</span>
          <h2>{active.label}</h2>
          <p>{active.blurb}</p>
          <div className="crop-guide-orbiter-meta">
            <span><Check size={14} /> Detection pipeline trained for this crop</span>
            <span><ShieldCheck size={14} /> {diseases.length} disease classes verified</span>
            <span><Microscope size={14} /> ResNet50 Â· Grad-CAM</span>
          </div>
        </div>
        <div className="crop-guide-orbiter-diseases">
          {diseases.map((disease) => {
            const content = getDiseaseContent(crop, disease);
            return (
              <span className="crop-guide-chip" key={`${crop}-${disease}`}>
                {content.displayTitle}
              </span>
            );
          })}
        </div>
      </section>

      <section className="crop-guide-disease-grid">
        {diseases.map((disease) => (
          <DiseaseRefCard crop={crop} disease={disease} key={`${crop}-${disease}`} />
        ))}
      </section>
    </main>
  );
}

function DiseaseRefCard({ crop, disease }) {
  const content = getDiseaseContent(crop, disease);
  const healthy = disease === 'disease-free' || disease === 'healthy';
  const expertTips = content.expertHelp || [];

  return (
    <article className={`crop-guide-card${healthy ? ' healthy-card' : ''}`}>
      <header className="crop-guide-card-head">
        <span className="crop-guide-card-mark">{healthy ? <Leaf size={15} /> : <Eye size={15} />}</span>
        <div>
          <h3>{content.displayTitle}</h3>
          {healthy ? <p>No disease detected on this class of leaf - routine care guidance.</p> : <p>Managed within the KrishiVision verified knowledge base.</p>}
        </div>
      </header>

      <section className="crop-guide-block">
        <span className="crop-guide-block-label"><ListChecks size={13} /> How to identify</span>
        <ul className="crop-guide-list">
          {(content.keyPoints || []).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="crop-guide-block">
        <span className="crop-guide-block-label"><Eye size={13} /> Monitoring tips</span>
        <ul className="crop-guide-list">
          {(content.monitoring || []).map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="crop-guide-block">
        <span className="crop-guide-block-label"><UserRound size={13} /> When to consult an expert</span>
        <ul className="crop-guide-list expert-list">
          {expertTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <span className="crop-guide-safety"><CircleAlert size={13} /> Not a substitute for a field visit or lab confirmation.</span>
      </section>

      <section className="crop-guide-block">
        <span className="crop-guide-block-label"><Clock size={13} /> Recovery expectation</span>
        <p className="crop-guide-recovery-note">{healthy ? TIMELINE_NOTES.healthy : TIMELINE_NOTES.diseased}</p>
      </section>

      {content.resources?.length > 0 && (
        <section className="crop-guide-block crop-guide-resources">
          <span className="crop-guide-block-label"><LockKeyhole size={13} /> Verified resources</span>
          <div className="crop-guide-resource-list">
            {content.resources.map((key) => {
              const resource = RESOURCES[key];
              if (!resource) return null;
              return (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="crop-guide-resource-link"
                  key={key}
                >
                  <strong>{resource.title}</strong>
                  <span>{resource.note}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}

export default CropGuidePage;
