/**
 * AdminDashboard.js
 * -----------------
 * Admin & Research Analytics Dashboard displaying KPIs, disease distribution charts,
 * and prediction history logs.
 */

export function createAdminDashboardView(apiBaseUrl, onViewPredictionDetail) {
    const container = document.createElement('div');
    container.className = 'dashboard-view';

    container.innerHTML = `
        <div class="view-header flex-between">
            <div>
                <h2>Admin & Research Dashboard 📈</h2>
                <p>System analytics, diagnosis logs, and confidence monitoring.</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-secondary" id="export-csv-btn">📥 Export CSV</button>
                <button class="btn btn-danger" id="clear-history-btn">🗑️ Clear History</button>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-title">Total Diagnoses</div>
                <div class="kpi-value" id="kpi-total">-</div>
            </div>
            <div class="kpi-card kpi-success">
                <div class="kpi-title">Healthy Leaves</div>
                <div class="kpi-value" id="kpi-healthy">-</div>
            </div>
            <div class="kpi-card kpi-danger">
                <div class="kpi-title">Diseased Leaves</div>
                <div class="kpi-value" id="kpi-diseased">-</div>
            </div>
            <div class="kpi-card kpi-warning">
                <div class="kpi-title">Low-Confidence Flags (&lt;70%)</div>
                <div class="kpi-value" id="kpi-low-conf">-</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-title">Avg Model Confidence</div>
                <div class="kpi-value" id="kpi-avg-conf">-</div>
            </div>
        </div>

        <!-- Disease Distribution Breakdown -->
        <div class="card">
            <h3>Disease Frequency Distribution</h3>
            <div id="disease-distribution-container" class="distribution-list">
                <p style="color: var(--text-muted);">Loading analytics...</p>
            </div>
        </div>

        <!-- History Log Table -->
        <div class="card">
            <div class="flex-between margin-bottom-1">
                <h3>Prediction History Log</h3>
                <div class="filter-controls">
                    <input type="text" id="history-search" placeholder="Search disease, crop..." class="input-search">
                    <select id="crop-filter" class="select-filter">
                        <option value="">All Crops</option>
                        <option value="citrus">Citrus</option>
                        <option value="guava">Guava</option>
                    </select>
                </div>
            </div>

            <div class="table-responsive">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Filename</th>
                            <th>Crop</th>
                            <th>Diagnosed Condition</th>
                            <th>Status</th>
                            <th>Confidence</th>
                            <th>Grad-CAM</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="history-table-body">
                        <tr>
                            <td colspan="8" style="text-align: center; color: var(--text-muted);">
                                Loading prediction history...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Fetch Analytics & History data
    async function loadData() {
        try {
            // Load Analytics
            const analyticsRes = await fetch(`${apiBaseUrl}/analytics`);
            if (analyticsRes.ok) {
                const analytics = await analyticsRes.json();
                renderKPIs(analytics);
                renderDistribution(analytics.disease_distribution);
            }

            // Load History
            const historyRes = await fetch(`${apiBaseUrl}/history`);
            if (historyRes.ok) {
                const historyData = await historyRes.json();
                window._krishiHistoryCache = historyData.history || [];
                renderHistoryTable(window._krishiHistoryCache);
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        }
    }

    function renderKPIs(analytics) {
        container.querySelector('#kpi-total').textContent = analytics.total_predictions || 0;
        container.querySelector('#kpi-healthy').textContent = analytics.healthy_count || 0;
        container.querySelector('#kpi-diseased').textContent = analytics.diseased_count || 0;
        container.querySelector('#kpi-low-conf').textContent = analytics.low_confidence_count || 0;
        container.querySelector('#kpi-avg-conf').textContent = analytics.total_predictions > 0
            ? `${(analytics.average_confidence * 100).toFixed(1)}%`
            : '-';
    }

    function renderDistribution(dist) {
        const distContainer = container.querySelector('#disease-distribution-container');
        if (!dist || dist.length === 0) {
            distContainer.innerHTML = '<p style="color: var(--text-muted);">No prediction history recorded yet.</p>';
            return;
        }

        const maxCount = Math.max(...dist.map(d => d.count), 1);

        distContainer.innerHTML = dist.map(item => `
            <div class="dist-item">
                <div class="dist-header flex-between">
                    <span class="dist-name"><strong>${item.label}</strong></span>
                    <span class="dist-count">${item.count} count</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill ${item.status === 'healthy' ? 'winner-fill' : ''}" style="width: ${(item.count / maxCount) * 100}%;">
                        ${item.count}
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderHistoryTable(records) {
        const tbody = container.querySelector('#history-table-body');
        if (!records || records.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No history records found. Perform a leaf prediction on the Farmer Prediction Page to log history.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = records.map(r => {
            const dateStr = new Date(r.timestamp).toLocaleString();
            const statusClass = r.status === 'healthy' ? 'pill-success' : 'pill-danger';
            const confPct = (r.confidence * 100).toFixed(1) + '%';
            const heatmapBadge = r.heatmap_path
                ? '<span class="pill pill-info">🔥 Available</span>'
                : '<span class="pill pill-muted">N/A</span>';

            return `
                <tr>
                    <td style="font-size: 0.85rem; color: var(--text-muted);">${dateStr}</td>
                    <td style="font-weight: 500;">${r.filename}</td>
                    <td style="text-transform: capitalize;">${r.crop}</td>
                    <td><strong>${r.disease}</strong></td>
                    <td><span class="pill ${statusClass}">${r.status}</span></td>
                    <td>
                        ${confPct}
                        ${!r.is_confident ? '<span title="Low confidence warning" style="margin-left: 4px;">⚠️</span>' : ''}
                    </td>
                    <td>${heatmapBadge}</td>
                    <td>
                        <button class="btn btn-sm view-detail-btn" data-id="${r.id}">Inspect</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach detail listeners
        tbody.querySelectorAll('.view-detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const rec = records.find(r => r.id === id);
                if (rec && onViewPredictionDetail) {
                    onViewPredictionDetail(rec);
                }
            });
        });
    }

    // Attach Search & Filters
    const searchInput = container.querySelector('#history-search');
    const cropFilter = container.querySelector('#crop-filter');

    function filterRecords() {
        const query = (searchInput.value || '').toLowerCase();
        const selectedCrop = (cropFilter.value || '').toLowerCase();

        const filtered = (window._krishiHistoryCache || []).filter(r => {
            const matchesQuery = !query ||
                r.disease.toLowerCase().includes(query) ||
                r.filename.toLowerCase().includes(query) ||
                r.crop.toLowerCase().includes(query);
            const matchesCrop = !selectedCrop || r.crop.toLowerCase() === selectedCrop;
            return matchesQuery && matchesCrop;
        });

        renderHistoryTable(filtered);
    }

    searchInput.addEventListener('input', filterRecords);
    cropFilter.addEventListener('change', filterRecords);

    // Export CSV Listener
    container.querySelector('#export-csv-btn').addEventListener('click', () => {
        const records = window._krishiHistoryCache || [];
        if (records.length === 0) {
            alert('No records available to export.');
            return;
        }

        const headers = ["ID", "Timestamp", "Filename", "Crop", "Disease", "Status", "Confidence", "IsConfident"];
        const csvRows = [headers.join(",")];

        records.forEach(r => {
            const row = [
                r.id,
                `"${r.timestamp}"`,
                `"${r.filename}"`,
                r.crop,
                `"${r.disease}"`,
                r.status,
                r.confidence,
                r.is_confident
            ];
            csvRows.push(row.join(","));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `krishivision_prediction_history_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Clear History Listener
    container.querySelector('#clear-history-btn').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear all prediction history logs?')) return;

        try {
            const res = await fetch(`${apiBaseUrl}/history`, { method: 'DELETE' });
            if (res.ok) {
                alert('Prediction history cleared.');
                loadData();
            }
        } catch (err) {
            alert('Failed to clear history: ' + err.message);
        }
    });

    // Initial Load
    loadData();

    return container;
}
