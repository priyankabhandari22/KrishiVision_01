import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowRight, BarChart3, Camera, Check, CircleAlert,
  FileImage, LockKeyhole, Microscope, Sparkles, Upload, X
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/Analytics';
import ComingSoonPage from './pages/ComingSoon';
import CropGuidePage from './pages/CropGuide';
import CameraPage from './pages/CameraPage';
import AppShell from './components/AppShell';
import PageIntro from './components/PageIntro';
import AdvisoryReport from './components/advisory/AdvisoryReport';
import { API, apiFetch } from './api';
import logo from '../assets/logo-transparent.png';
import './styles.css';

const PROTECTED_SCREENS = ['dashboard', 'farmer', 'camera', 'admin', 'analytics', 'crop-guide', 'profile'];

const models = [
  { name: 'ResNet50', score: 90.52, note: 'Combined test accuracy (guava 93.75% / citrus 88.82%)', color: 'orange' },
  { name: 'EfficientNet-B0', score: 82.76, note: 'Research benchmark', color: 'sage' },
  { name: 'MobileNetV3', score: 80.61, note: 'Research benchmark', color: 'stone' }
];
const workflow = ['Upload leaf', 'Detect disease', 'Explain signal', 'Advise action', 'Prevent spread', 'Save history'];

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-forest text-parchment">
      <div className="flex flex-col items-center gap-4">
        <img src={logo} alt="KrishiVision logo" className="h-20 w-auto object-contain" />
        <span className="flex items-center gap-2 text-sm text-[#BFD5C3]">
          <Activity className="animate-spin" size={16} /> Checking your session...
        </span>
      </div>
    </div>
  );
}

function App() {
  const { user, checking } = useAuth();
  const [screen, setScreen] = useState('home');
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [pendingCapture, setPendingCapture] = useState(null);
  const navigate = useCallback((next) => setScreen(next), []);

  useEffect(() => {
    if (checking) return;
    if (user) {
      if (screen === 'home' || screen === 'login' || screen === 'register') setScreen('dashboard');
    } else if (PROTECTED_SCREENS.includes(screen)) {
      setScreen('home');
    }
  }, [checking, user, screen]);

  if (checking) return <Splash />;

  const loggedIn = Boolean(user);
  const inShell = loggedIn && PROTECTED_SCREENS.includes(screen);

  return (
    <div className="app-shell">
      {screen === 'home' && <Home navigate={navigate} loggedIn={loggedIn} />}
          {screen === 'research' && (
            <div className="page-width research-page-wrap">
              <ResearchPage navigate={navigate} />
              <footer><span>KrishiVision</span><span>Inference-first crop intelligence</span><span>ResNet50 · Grad-CAM · Verified guidance</span></footer>
            </div>
          )}
      {!loggedIn && screen === 'login' && <Login navigate={navigate} />}
      {!loggedIn && screen === 'register' && <Register navigate={navigate} />}
      {screen === 'camera' && (
        <CameraPage
          navigate={navigate}
          onUsePhoto={(file, preview) => {
            setPendingCapture({ file, preview });
            navigate('farmer');
          }}
        />
      )}
      {inShell && screen !== 'camera' && (
        <AppShell screen={screen} navigate={navigate}>
          {screen === 'dashboard' && <Dashboard navigate={navigate} setReport={setReport} />}
          {screen === 'farmer' && (
            <FarmerPage
              report={report}
              setReport={setReport}
              navigate={navigate}
              initialFile={pendingCapture?.file}
              initialPreview={pendingCapture?.preview}
              onCaptureConsumed={() => setPendingCapture(null)}
            />
          )}
          {screen === 'admin' && <HistoryPage history={history} setHistory={setHistory} setReport={setReport} navigate={navigate} />}
          {screen === 'analytics' && <AnalyticsPage navigate={navigate} />}
          {screen === 'crop-guide' && <CropGuidePage navigate={navigate} />}
          {screen === 'profile' && <ComingSoonPage title="Profile" navigate={navigate} />}
        </AppShell>
      )}
    </div>
  );
}

function FarmerPage({ report, setReport, navigate, initialFile, initialPreview, onCaptureConsumed }) {
  const [file, setFile] = useState(initialFile || null); const [preview, setPreview] = useState(initialPreview || ''); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const fromCamera = Boolean(initialFile);
  useEffect(() => {
    if (initialFile) onCaptureConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const chooseFile = (next) => { const selected = next?.[0]; if (!selected) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) return setError('Use a JPEG, PNG, or WebP leaf image.'); if (selected.size > 20 * 1024 * 1024) return setError('The image must be smaller than 20 MB.'); setError(''); if (preview) URL.revokeObjectURL(preview); setFile(selected); setPreview(URL.createObjectURL(selected)); };
  const predict = async (event) => { event.preventDefault(); if (!file) return; setLoading(true); setError(''); try { const body = new FormData(); body.append('file', file); const { response, data } = await apiFetch('/predict', { method: 'POST', body }); if (!response.ok) throw new Error(data.detail || `Prediction service returned ${response.status}.`); setReport({ ...data, preview }); } catch (err) { setError(`${err.message} Check that the FastAPI service is running.`); } finally { setLoading(false); } };
  return <main className="w-full min-w-0"><PageIntro back={() => navigate('dashboard')} icon={<Upload />} title="Farmer prediction" copy="Upload one clear leaf photo. The pipeline returns a model diagnosis, visual evidence, and guidance that stays within the verified knowledge base." />
    {fromCamera && <div className="image-scope-note"><Camera size={16} /> Photo captured from your camera - review it below, then run it through the existing prediction pipeline.</div>}
    <div className="farmer-layout"><section className="work-panel"><div className="section-label">01 / INPUT</div><form onSubmit={predict}><label className={`dropzone ${file ? 'has-file' : ''}`}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseFile(event.target.files)} />{preview ? <img src={preview} alt="Selected leaf" /> : <><span className="upload-icon"><FileImage /></span><strong>Drop a leaf image here</strong><span>JPEG, PNG, or WebP · up to 20 MB</span><button type="button" className="button button-secondary">Browse image</button></>}</label>{file && <div className="file-row"><span><FileImage size={15} /> {file.name}</span><button type="button" onClick={() => { if (preview) URL.revokeObjectURL(preview); setFile(null); setPreview(''); }}>Remove <X size={14} /></button></div>}{error && <div className="error-box"><CircleAlert size={17} /> {error}</div>}<button className="button button-primary full-button" disabled={!file || loading}>{loading ? <><Activity className="spin" size={17} /> Running pipeline...</> : <>Run diagnosis <ArrowRight size={17} /></>}</button></form></section><WorkflowRail active={loading ? 1 : report ? 6 : 0} /></div>
    {report && <AdvisoryReport report={report} />}
  </main>;
}

function WorkflowRail({ active }) { return <aside className="workflow-rail"><div className="section-label">PIPELINE STATUS</div>{workflow.map((step, index) => <div className={`rail-step ${index < active ? 'complete' : ''} ${index === active ? 'current' : ''}`} key={step}><span>{index < active ? <Check size={13} /> : index + 1}</span><div><strong>{step}</strong><small>{index === active ? 'In progress' : index < active ? 'Complete' : 'Waiting'}</small></div></div>)}<div className="rail-note"><LockKeyhole size={15} /><span>Advisor language is grounded in the verified disease knowledge base.</span></div></aside>; }


function ResearchPage({ navigate }) {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [evaluation, setEvaluation] = useState(null);
  useEffect(() => { fetch(`${API}/evaluation`).then((response) => response.ok ? response.json() : null).then(setEvaluation).catch(() => setEvaluation(null)); }, []);
  const improvement = (models[0].score - models[2].score).toFixed(2);
  const selectedEvaluation = selectedModel.name === 'ResNet50' ? evaluation : evaluation?.evaluation_reports?.[selectedModel.name];
  const metrics = selectedModel.name === 'ResNet50' ? (evaluation?.combined_metrics || {}) : (selectedEvaluation || {});
  return <main className="page-width inner-page research-dashboard">
    <PageIntro back={() => (navigate ? navigate('home') : window.history.back())} icon={<Microscope />} title="Research / model comparison" copy="A focused view of the recorded benchmark evidence behind KrishiVision's production model selection." />
    <section className="research-dashboard-intro"><div><span className="section-label">RESEARCH OVERVIEW</span><h2>Which model gives the clearest signal?</h2><p>KrishiVision compares three evaluated architectures for Citrus and Guava leaf classification. ResNet50 is currently selected for production based on the highest recorded test accuracy.</p></div><div className="research-status"><span className="status-dot"><span /> Evaluation snapshot</span><strong>3 models · 1 selected</strong><small>Metrics shown exactly as stored in the project</small></div></section>
    <section className="research-dashboard-section"><div className="dashboard-section-heading"><div><span className="section-label">MODEL COMPARISON OVERVIEW</span><h2>Evaluated candidates</h2></div><span className="dashboard-hint">Select a model to inspect it</span></div><div className="model-card-grid">{models.map((model, index) => <button className={`model-card ${index === 0 ? 'production' : ''} ${selectedModel.name === model.name ? 'active' : ''}`} key={model.name} onClick={() => setSelectedModel(model)}><div className="model-card-top"><span className={`model-dot ${model.color}`} /><span>{index === 0 ? 'PRODUCTION SELECTED' : 'BENCHMARK'}</span></div><strong>{model.name}</strong><div className="model-card-score">{model.score}%</div><small>test accuracy</small><span className="model-card-footer">{selectedModel.name === model.name ? 'Inspecting details' : 'View details'} <ArrowRight size={14} /></span></button>)}</div></section>
    <section className="research-dashboard-grid"><div className="dashboard-panel chart-panel"><div className="panel-heading"><div><span className="section-label">ACCURACY COMPARISON</span><h2>Test accuracy by model</h2></div><span className="chart-unit">% accuracy</span></div><AccuracyChart /></div><div className="dashboard-panel detail-panel"><span className="section-label">SELECTED MODEL</span><div className="detail-model-name"><span className={`model-dot ${selectedModel.color}`} /><h2>{selectedModel.name}</h2></div><div className="detail-score">{selectedModel.score}% <small>test accuracy</small></div><span className={selectedModel === models[0] ? 'detail-badge selected' : 'detail-badge'}>{selectedModel === models[0] ? 'Production selected' : 'Evaluated benchmark'}</span><p>{selectedModel === models[0] ? 'Highest recorded accuracy among the three evaluated candidates. This is the model used by the current inference pipeline.' : 'This model is retained as a comparison benchmark. It is not the current production selection.'}</p><div className="detail-meta"><span>Task<strong>5-class per crop (guava & citrus)</strong></span><span>Decision<strong>{selectedModel === models[0] ? 'Selected' : 'Not selected'}</strong></span></div></div></section>
    <section className="research-dashboard-section metrics-panel"><div className="dashboard-section-heading"><div><span className="section-label">PERFORMANCE METRICS</span><h2>Evaluation results</h2></div><span className="dashboard-hint">Official ResNet50 report · {metrics.total_samples || 232} samples</span></div><div className="metric-grid"><Metric label="Accuracy" value={`${metrics.accuracy ?? 90.52}%`} state="Official benchmark" /><Metric label="Weighted precision" value={metrics.precision != null ? `${metrics.precision}%` : '--'} state="Recorded" /><Metric label="Weighted recall" value={metrics.recall != null ? `${metrics.recall}%` : '--'} state="Recorded" /><Metric label="Weighted F1 score" value={metrics.f1_score != null ? `${metrics.f1_score}%` : '--'} state="Recorded" /></div></section>
    <section className="research-dashboard-grid lower-grid"><div className="dashboard-panel confusion-panel"><div className="panel-heading"><div><span className="section-label">EVALUATION</span><h2>{selectedModel.name} confusion matrix</h2></div><BarChart3 size={18} /></div><ConfusionMatrix evaluation={selectedEvaluation} /></div><div className="dashboard-panel insights-panel"><div className="panel-heading"><div><span className="section-label">RESEARCH INSIGHTS</span><h2>What the data says</h2></div><Sparkles size={18} /></div><ul><li>ResNet50 is the selected production model at 90.52% combined test accuracy.</li><li>{selectedModel.name} weighted F1 score is {metrics.f1_score ?? '--'}% across {metrics.total_samples || 232} labeled samples.</li><li>ResNet50 leads MobileNetV3 by {improvement} percentage points.</li><li>The displayed matrix and per-class metrics come from the supplied evaluation report.</li></ul></div></section>
  </main>;
}

function AccuracyChart() { const chartHeight = 190; const chartTop = 15; const chartBottom = 160; return <div className="accuracy-chart"><div className="chart-y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-plot"><div className="chart-grid-lines"><i /><i /><i /><i /><i /></div><div className="chart-bars">{models.map((model) => <div className="chart-bar-column" key={model.name}><div className={`chart-bar ${model.color}`} style={{ height: `${(model.score / 100) * (chartBottom - chartTop)}px` }}><strong>{model.score}%</strong></div><span>{model.name}</span></div>)}</div></div></div>; }
function ConfusionMatrix({ evaluation }) { const matrix = evaluation?.confusion_matrix; if (!matrix?.matrix?.length) return <div className="confusion-empty"><strong>Evaluation data unavailable</strong></div>; const max = Math.max(...matrix.matrix.flat()); return <div className="confusion-table-wrap"><table className="confusion-table"><thead><tr><th>True / Predicted</th>{matrix.labels.map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{matrix.matrix.map((row, rowIndex) => <tr key={matrix.labels[rowIndex]}><th>{matrix.labels[rowIndex]}</th>{row.map((value, columnIndex) => <td key={`${rowIndex}-${columnIndex}`} style={{ opacity: value ? 0.45 + (value / max) * 0.55 : 0.18 }}>{value}</td>)}</tr>)}</tbody></table></div>; }
function Metric({ label, value, state }) { return <article className={`metric-card ${value ? 'available' : ''}`}><small>{label}</small><strong>{value || '--'}</strong><span>{state}</span></article>; }

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);