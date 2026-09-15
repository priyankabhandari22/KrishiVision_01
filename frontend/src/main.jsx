import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowRight, BarChart3, BookOpen, Check, ChevronLeft, CircleAlert,
  ClipboardList, Database, FileImage, History, Leaf, LineChart, LockKeyhole,
  Microscope, Search, ShieldCheck, Sparkles, Upload, WifiOff, X
} from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import logo from '../assets/logo-transparent.png';
import './styles.css';

const API = (window.KRISHIVISION_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const models = [
  { name: 'ResNet50', score: 84.09, note: 'Selected production model', color: 'orange' },
  { name: 'EfficientNet-B0', score: 77.53, note: 'Research benchmark', color: 'sage' },
  { name: 'MobileNetV3', score: 62.12, note: 'Research benchmark', color: 'stone' }
];
const researchSteps = [
  ['01', 'Leaf image', 'Citrus or Guava field image'],
  ['02', 'Preprocessing', 'Validation, resize, normalization'],
  ['03', 'Dataset split', 'Training, validation, test'],
  ['04', 'Deep learning models', 'ResNet50, EfficientNet-B0, MobileNetV3'],
  ['05', 'Evaluation', 'Accuracy benchmark and model selection'],
  ['06', 'Prediction', 'Disease, confidence, and explanation']
];
const diseaseClasses = {
  Guava: ['Disease Free', 'Phytopthora', 'Red rust', 'Scab', 'Styler and Root'],
  Citrus: ['Black spot', 'Melanose', 'Canker', 'Greening', 'Healthy']
};
const workflow = ['Upload leaf', 'Detect disease', 'Explain signal', 'Advise action', 'Prevent spread', 'Save history'];

function App() {
  const [screen, setScreen] = useState('home');
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const navigate = (next) => setScreen(next);

  return <div className="app-shell">
    {screen !== 'home' && <Header screen={screen} navigate={navigate} />}
    {screen === 'home' && <Landing navigate={navigate} />}
    {screen === 'farmer' && <FarmerPage report={report} setReport={setReport} navigate={navigate} />}
    {screen === 'research' && <ResearchPage />}
    {screen === 'admin' && <AdminPage history={history} setHistory={setHistory} setReport={setReport} navigate={navigate} />}
    <footer><span>KrishiVision</span><span>Inference-first crop intelligence</span><span>ResNet50 · Grad-CAM · Verified guidance</span></footer>
  </div>;
}

function Header({ screen, navigate }) {
  return <Navbar logoSrc={logo} onNavigate={navigate} links={[
    { label: 'Home', href: '/', screen: 'home' },
    { label: 'Farmer scan', href: '/farmer', screen: 'farmer', active: screen === 'farmer' },
    { label: 'Research', href: '/research', screen: 'research', active: screen === 'research' },
    { label: 'Admin', href: '/admin', screen: 'admin', active: screen === 'admin' },
  ]} />;
}

function Landing({ navigate }) {
  return <Home navigate={navigate} />;
  /* return <main className="landing page-width">
    <section className="hero-grid">
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-line" /> Leaf intelligence for the field</p>
        <h1>One leaf.<br /><em>Clearer action.</em></h1>
        <p className="hero-lede">KrishiVision connects a ResNet50 diagnosis to visual evidence and practical agricultural guidance, so a farmer can move from uncertainty to the next useful step.</p>
        <div className="hero-actions"><button className="button button-primary" onClick={() => navigate('farmer')}>Start a prediction <ArrowRight size={17} /></button><button className="text-button" onClick={() => navigate('research')}>See the model evidence <LineChart size={16} /></button></div>
        <div className="proof-row"><span><Check size={15} /> 84.09% test accuracy</span><span><ShieldCheck size={15} /> Verified disease knowledge</span></div>
      </div>
      <div className="hero-visual" aria-label="KrishiVision prediction preview">
        <div className="leaf-orbit orbit-one" /><div className="leaf-orbit orbit-two" />
        <div className="scan-card"><div className="scan-card-top"><span>LIVE PREVIEW</span><span className="signal"><span /> ready</span></div><div className="leaf-scan"><Leaf size={150} strokeWidth={1.1} /><span className="scan-pulse pulse-a" /><span className="scan-pulse pulse-b" /></div><div className="scan-result"><div><small>Example signal</small><strong>Citrus · Canker</strong></div><strong className="confidence">91.4%</strong></div></div>
        <span className="annotation annotation-top">01 / image evidence</span><span className="annotation annotation-bottom">heatmap + advisory</span>
      </div>
    </section>
    <section className="flow-strip"><div className="flow-heading"><span>THE WORKING FLOW</span><strong>From photo to field decision</strong></div>{workflow.map((step, index) => <div className="flow-step" key={step}><span>0{index + 1}</span><strong>{step}</strong>{index < workflow.length - 1 && <ArrowRight size={14} />}</div>)}</section>
    <section className="entry-grid"><Entry title="Farmer prediction" copy="Upload a leaf and receive disease, confidence, heatmap, immediate action, and long-term prevention." icon={<Upload />} action="Run a diagnosis" onClick={() => navigate('farmer')} /><Entry title="Research comparison" copy="See why ResNet50 is the selected model and inspect the benchmark story without training code." icon={<Microscope />} action="Open research" onClick={() => navigate('research')} /><Entry title="Admin dashboard" copy="Review predictions, confidence patterns, and history. Connect MongoDB Atlas when you are ready." icon={<Activity />} action="Open dashboard" onClick={() => navigate('admin')} /></section>
  </main>; */
}

function Entry({ title, copy, icon, action, onClick }) { return <article className="entry"><div className="entry-icon">{icon}</div><h2>{title}</h2><p>{copy}</p><button className="text-button" onClick={onClick}>{action} <ArrowRight size={15} /></button></article>; }

function FarmerPage({ report, setReport, navigate }) {
  const [file, setFile] = useState(null); const [preview, setPreview] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const chooseFile = (next) => { const selected = next?.[0]; if (!selected) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) return setError('Use a JPEG, PNG, or WebP leaf image.'); if (selected.size > 20 * 1024 * 1024) return setError('The image must be smaller than 20 MB.'); setError(''); setFile(selected); setPreview(URL.createObjectURL(selected)); };
  const predict = async (event) => { event.preventDefault(); if (!file) return; setLoading(true); setError(''); try { const body = new FormData(); body.append('file', file); const response = await fetch(`${API}/predict`, { method: 'POST', body }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.detail || `Prediction service returned ${response.status}.`); setReport({ ...data, preview }); } catch (err) { setError(`${err.message} Check that the FastAPI service is running.`); } finally { setLoading(false); } };
  return <main className="page-width inner-page"><PageIntro back={() => navigate('home')} icon={<Upload />} title="Farmer prediction" copy="Upload one clear leaf photo. The pipeline returns a model diagnosis, visual evidence, and guidance that stays within the verified knowledge base." />
    <div className="farmer-layout"><section className="work-panel"><div className="section-label">01 / INPUT</div><form onSubmit={predict}><label className={`dropzone ${file ? 'has-file' : ''}`}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseFile(event.target.files)} />{preview ? <img src={preview} alt="Selected leaf" /> : <><span className="upload-icon"><FileImage /></span><strong>Drop a leaf image here</strong><span>JPEG, PNG, or WebP · up to 20 MB</span><button type="button" className="button button-secondary">Browse image</button></>}</label>{file && <div className="file-row"><span><FileImage size={15} /> {file.name}</span><button type="button" onClick={() => { setFile(null); setPreview(''); }}>Remove <X size={14} /></button></div>}{error && <div className="error-box"><CircleAlert size={17} /> {error}</div>}<button className="button button-primary full-button" disabled={!file || loading}>{loading ? <><Activity className="spin" size={17} /> Running pipeline...</> : <>Run diagnosis <ArrowRight size={17} /></>}</button></form></section><WorkflowRail active={loading ? 1 : report ? 6 : 0} /></div>
    {report && <Report report={report} />}
  </main>;
}

function WorkflowRail({ active }) { return <aside className="workflow-rail"><div className="section-label">PIPELINE STATUS</div>{workflow.map((step, index) => <div className={`rail-step ${index < active ? 'complete' : ''} ${index === active ? 'current' : ''}`} key={step}><span>{index < active ? <Check size={13} /> : index + 1}</span><div><strong>{step}</strong><small>{index === active ? 'In progress' : index < active ? 'Complete' : 'Waiting'}</small></div></div>)}<div className="rail-note"><LockKeyhole size={15} /><span>Advisor language is grounded in the verified disease knowledge base.</span></div></aside>; }

function Report({ report }) { const [heatmap, setHeatmap] = useState(true); const percent = Math.round((report.confidence || 0) * 100); const sections = [['Problem explanation', report.explanation, BookOpen], ['Immediate action', report.immediate_actions, Sparkles], ['Disease spread prevention', report.spread_prevention, ShieldCheck], ['Long-term prevention', report.long_term_prevention?.long_term_monitoring, Leaf], ['Monitoring advice', report.long_term_prevention?.inspection_guidance, History]]; return <section className="report"><div className="section-label">02 / RESULT</div>{!report.is_confident && <div className="warning-box"><CircleAlert size={18} /><div><strong>Low-confidence result</strong><span>{report.confidence_warning || 'Use this result as a signal and confirm it with an agricultural expert.'}</span></div></div>}<div className="result-head"><div><span className="result-kicker">{report.crop} leaf / {report.status}</span><h2>{report.disease}</h2><p>ResNet50 classification with Grad-CAM explanation</p></div><div className="confidence-ring"><strong>{percent}%</strong><span>confidence</span></div></div><div className="evidence-grid"><div className="heatmap-box"><div className="panel-top"><span>VISUAL EVIDENCE</span><button onClick={() => setHeatmap(!heatmap)}>{heatmap ? 'Show original' : 'Show heatmap'}</button></div>{(heatmap ? report.heatmap_path : report.preview) ? <img src={heatmap ? `${API}${report.heatmap_path}` : report.preview} alt={heatmap ? 'Grad-CAM heatmap' : 'Original leaf'} /> : <div className="empty-heatmap"><WifiOff size={20} /> Heatmap unavailable for this result</div>}</div><div className="report-meta"><Meta label="Detected crop" value={report.crop} /><Meta label="Status" value={report.status} tone={report.status === 'healthy' ? 'good' : 'warn'} /><Meta label="Model" value="ResNet50 · 84.09%" /><Meta label="History" value={report.timestamp ? 'Loaded from history' : 'Saved after analysis'} /></div></div><div className="image-scope-note"><FileImage size={16} /><span>This report describes only this uploaded leaf. Accuracy, precision, recall, F1 score, and confusion matrices are evaluation metrics for labeled test datasets, not individual image predictions.</span></div><div className="advisory-grid">{sections.map(([title, content, Icon]) => <article className="advisory" key={title}><Icon size={18} /><h3>{title}</h3><Content value={content} /></article>)}</div><p className="disclaimer">{report.disclaimer || 'This advisory supports field observation and does not replace qualified agricultural advice.'}</p></section>; }
function Meta({ label, value, tone }) { return <div className="meta"><small>{label}</small><strong className={tone || ''}>{value || 'Not available'}</strong></div>; }
function Content({ value }) { if (Array.isArray(value)) return <ul>{value.map((item) => <li key={item}>{item}</li>)}</ul>; return <p>{value || 'Not available for this result.'}</p>; }

function ResearchPage() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [evaluation, setEvaluation] = useState(null);
  useEffect(() => { fetch(`${API}/evaluation`).then((response) => response.ok ? response.json() : null).then(setEvaluation).catch(() => setEvaluation(null)); }, []);
  const improvement = (models[0].score - models[2].score).toFixed(2);
  const selectedEvaluation = selectedModel.name === 'ResNet50' ? evaluation : evaluation?.evaluation_reports?.[selectedModel.name];
  const metrics = selectedModel.name === 'ResNet50' ? (evaluation?.combined_metrics || {}) : (selectedEvaluation || {});
  return <main className="page-width inner-page research-dashboard">
    <PageIntro back={() => window.history.back()} icon={<Microscope />} title="Research / model comparison" copy="A focused view of the recorded benchmark evidence behind KrishiVision's production model selection." />
    <section className="research-dashboard-intro"><div><span className="section-label">RESEARCH OVERVIEW</span><h2>Which model gives the clearest signal?</h2><p>KrishiVision compares three evaluated architectures for Citrus and Guava leaf classification. ResNet50 is currently selected for production based on the highest recorded test accuracy.</p></div><div className="research-status"><span className="status-dot"><span /> Evaluation snapshot</span><strong>3 models · 1 selected</strong><small>Metrics shown exactly as stored in the project</small></div></section>
    <section className="research-dashboard-section"><div className="dashboard-section-heading"><div><span className="section-label">MODEL COMPARISON OVERVIEW</span><h2>Evaluated candidates</h2></div><span className="dashboard-hint">Select a model to inspect it</span></div><div className="model-card-grid">{models.map((model, index) => <button className={`model-card ${index === 0 ? 'production' : ''} ${selectedModel.name === model.name ? 'active' : ''}`} key={model.name} onClick={() => setSelectedModel(model)}><div className="model-card-top"><span className={`model-dot ${model.color}`} /><span>{index === 0 ? 'PRODUCTION SELECTED' : 'BENCHMARK'}</span></div><strong>{model.name}</strong><div className="model-card-score">{model.score}%</div><small>test accuracy</small><span className="model-card-footer">{selectedModel.name === model.name ? 'Inspecting details' : 'View details'} <ArrowRight size={14} /></span></button>)}</div></section>
    <section className="research-dashboard-grid"><div className="dashboard-panel chart-panel"><div className="panel-heading"><div><span className="section-label">ACCURACY COMPARISON</span><h2>Test accuracy by model</h2></div><span className="chart-unit">% accuracy</span></div><AccuracyChart /></div><div className="dashboard-panel detail-panel"><span className="section-label">SELECTED MODEL</span><div className="detail-model-name"><span className={`model-dot ${selectedModel.color}`} /><h2>{selectedModel.name}</h2></div><div className="detail-score">{selectedModel.score}% <small>test accuracy</small></div><span className={selectedModel === models[0] ? 'detail-badge selected' : 'detail-badge'}>{selectedModel === models[0] ? 'Production selected' : 'Evaluated benchmark'}</span><p>{selectedModel === models[0] ? 'Highest recorded accuracy among the three evaluated candidates. This is the model used by the current inference pipeline.' : 'This model is retained as a comparison benchmark. It is not the current production selection.'}</p><div className="detail-meta"><span>Task<strong>10-class leaf classification</strong></span><span>Decision<strong>{selectedModel === models[0] ? 'Selected' : 'Not selected'}</strong></span></div></div></section>
    <section className="research-dashboard-section metrics-panel"><div className="dashboard-section-heading"><div><span className="section-label">PERFORMANCE METRICS</span><h2>Evaluation results</h2></div><span className="dashboard-hint">Official ResNet50 report · {metrics.total_samples || 396} samples</span></div><div className="metric-grid"><Metric label="Accuracy" value={`${metrics.accuracy ?? 84.09}%`} state="Official benchmark" /><Metric label="Weighted precision" value={metrics.precision != null ? `${metrics.precision}%` : '--'} state="Recorded" /><Metric label="Weighted recall" value={metrics.recall != null ? `${metrics.recall}%` : '--'} state="Recorded" /><Metric label="Weighted F1 score" value={metrics.f1_score != null ? `${metrics.f1_score}%` : '--'} state="Recorded" /></div></section>
    <section className="research-dashboard-grid lower-grid"><div className="dashboard-panel confusion-panel"><div className="panel-heading"><div><span className="section-label">EVALUATION</span><h2>{selectedModel.name} confusion matrix</h2></div><BarChart3 size={18} /></div><ConfusionMatrix evaluation={selectedEvaluation} /></div><div className="dashboard-panel insights-panel"><div className="panel-heading"><div><span className="section-label">RESEARCH INSIGHTS</span><h2>What the data says</h2></div><Sparkles size={18} /></div><ul><li>ResNet50 is the selected production model at 84.09% accuracy.</li><li>{selectedModel.name} weighted F1 score is {metrics.f1_score ?? '--'}% across {metrics.total_samples || 396} labeled samples.</li><li>ResNet50 leads MobileNetV3 by {improvement} percentage points.</li><li>The displayed matrix and per-class metrics come from the supplied evaluation report.</li></ul></div></section>
  </main>;
}

function AccuracyChart() { const chartHeight = 190; const chartTop = 15; const chartBottom = 160; return <div className="accuracy-chart"><div className="chart-y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-plot"><div className="chart-grid-lines"><i /><i /><i /><i /><i /></div><div className="chart-bars">{models.map((model) => <div className="chart-bar-column" key={model.name}><div className={`chart-bar ${model.color}`} style={{ height: `${(model.score / 100) * (chartBottom - chartTop)}px` }}><strong>{model.score}%</strong></div><span>{model.name}</span></div>)}</div></div></div>; }
function ConfusionMatrix({ evaluation }) { const matrix = evaluation?.confusion_matrix; if (!matrix?.matrix?.length) return <div className="confusion-empty"><strong>Evaluation data unavailable</strong></div>; const max = Math.max(...matrix.matrix.flat()); return <div className="confusion-table-wrap"><table className="confusion-table"><thead><tr><th>True / Predicted</th>{matrix.labels.map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{matrix.matrix.map((row, rowIndex) => <tr key={matrix.labels[rowIndex]}><th>{matrix.labels[rowIndex]}</th>{row.map((value, columnIndex) => <td key={`${rowIndex}-${columnIndex}`} style={{ opacity: value ? 0.45 + (value / max) * 0.55 : 0.18 }}>{value}</td>)}</tr>)}</tbody></table></div>; }
function TargetIcon() { return <span className="target-icon"><span /></span>; }
function Metric({ label, value, state }) { return <article className={`metric-card ${value ? 'available' : ''}`}><small>{label}</small><strong>{value || '--'}</strong><span>{state}</span></article>; }

function AdminPage({ history, setHistory, setReport, navigate }) { const [analytics, setAnalytics] = useState(null); const [loading, setLoading] = useState(false); const openHistoryReport = (item) => { const savedReport = item.full_advisory || item; setReport({ ...savedReport, crop: savedReport.crop || item.crop, disease: savedReport.disease || item.disease, status: savedReport.status || item.status, confidence: savedReport.confidence ?? item.confidence, is_confident: savedReport.is_confident ?? item.is_confident, heatmap_path: savedReport.heatmap_path || item.heatmap_path, timestamp: item.timestamp, preview: '' }); navigate('farmer'); }; const load = async () => { setLoading(true); try { const [a, h] = await Promise.all([fetch(`${API}/analytics`), fetch(`${API}/history?limit=100`)]); setAnalytics(await a.json()); const data = await h.json(); setHistory(data.history || []); } catch { setAnalytics(null); } finally { setLoading(false); } }; useEffect(() => { load(); }, []); return <main className="page-width inner-page"><PageIntro back={() => navigate('home')} icon={<Activity />} title="Admin / research dashboard" copy="A working control room for prediction history and model behavior, backed by the configured local MongoDB history service." /><div className="dashboard-actions"><div className="integration-note"><LockKeyhole size={16} /><span>Private workspace - MongoDB history connected</span></div><button className="button button-primary" onClick={load}>{loading ? 'Refreshing...' : 'Refresh live data'} <ArrowRight size={16} /></button></div>{analytics ? <div className="kpi-grid"><Kpi label="Total predictions" value={analytics.total_predictions} icon={<ClipboardList />} /><Kpi label="Healthy leaves" value={analytics.healthy_count} icon={<ShieldCheck />} tone="good" /><Kpi label="Diseased leaves" value={analytics.diseased_count} icon={<CircleAlert />} tone="warn" /><Kpi label="Average confidence" value={`${Math.round((analytics.average_confidence || 0) * 100)}%`} icon={<Activity />} /></div> : <div className="empty-dashboard"><BarChart3 size={26} /><h2>No live data loaded</h2><p>Use the refresh action to read the current FastAPI history. The starter view stays honest instead of inventing analytics.</p></div>}<section className="history-section"><div className="section-heading"><div><span className="section-label">PREDICTION HISTORY</span><h2>Recent field reports</h2></div><Search size={19} /></div><div className="history-table">{history.length ? history.map((item) => { const report = item.full_advisory || item; const crop = report.crop || item.crop; const disease = report.disease || item.disease; const status = report.status || item.status; const confidence = report.confidence ?? item.confidence; return <button className="history-row" key={item.id || item.timestamp} onClick={() => openHistoryReport(item)}><span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span><strong>{crop || 'Unknown crop'} · {disease || 'Unknown disease'}</strong><span>{confidence != null ? `${Math.round(confidence * 100)}% confidence` : 'Confidence unavailable'}</span><span className={status === 'healthy' ? 'good' : 'warn'}>{status || 'Unknown status'}</span><ArrowRight size={15} /></button>; }) : <p className="table-empty">Run a farmer prediction to populate this table.</p>}</div></section></main>; }
function Kpi({ label, value, icon, tone }) { return <article className={`kpi ${tone || ''}`}><span>{icon}</span><small>{label}</small><strong>{value ?? '—'}</strong></article>; }
function PageIntro({ back, icon, title, copy }) { return <div className="page-intro"><button className="back-button" onClick={back}><ChevronLeft size={16} /> Home</button><div className="title-icon">{icon}</div><h1>{title}</h1><p>{copy}</p></div>; }

createRoot(document.getElementById('root')).render(<App />);