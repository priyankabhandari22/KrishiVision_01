/**
 * ModelComparison.js
 * ------------------
 * Interactive view comparing ResNet50 (84.09%) vs EfficientNet-B0 (77.53%) vs MobileNetV3 (62.12%).
 */

export function createModelComparisonView() {
    const container = document.createElement('div');
    container.className = 'research-view';

    container.innerHTML = `
        <div class="view-header">
            <h2>Model Benchmark & Research Comparison 📊</h2>
            <p>Evaluation conducted across Citrus and Guava leaf disease datasets in Google Colab.</p>
        </div>

        <!-- Model Summary Cards -->
        <div class="model-cards-grid">
            <div class="model-card winner-card">
                <div class="model-badge winner-badge">🏆 Selected for Production</div>
                <h3>ResNet50</h3>
                <div class="model-stat">
                    <span class="stat-number">84.09%</span>
                    <span class="stat-desc">Test Accuracy</span>
                </div>
                <ul class="model-specs">
                    <li><strong>Architecture:</strong> Deep Residual Network (50 layers)</li>
                    <li><strong>Parameters:</strong> ~25.6 Million</li>
                    <li><strong>Grad-CAM Quality:</strong> Outstanding (conv5_block3_out)</li>
                    <li><strong>Key Advantage:</strong> Superior accuracy on complex lesion patterns</li>
                </ul>
            </div>

            <div class="model-card">
                <div class="model-badge">Evaluated Candidate</div>
                <h3>EfficientNet-B0</h3>
                <div class="model-stat">
                    <span class="stat-number">77.53%</span>
                    <span class="stat-desc">Test Accuracy</span>
                </div>
                <ul class="model-specs">
                    <li><strong>Architecture:</strong> Compound Scaled CNN</li>
                    <li><strong>Parameters:</strong> ~5.3 Million</li>
                    <li><strong>Grad-CAM Quality:</strong> Moderate feature localization</li>
                    <li><strong>Tradeoff:</strong> Lower accuracy (-6.56% vs ResNet50)</li>
                </ul>
            </div>

            <div class="model-card">
                <div class="model-badge">Evaluated Candidate</div>
                <h3>MobileNetV3 Large</h3>
                <div class="model-stat">
                    <span class="stat-number">62.12%</span>
                    <span class="stat-desc">Test Accuracy</span>
                </div>
                <ul class="model-specs">
                    <li><strong>Architecture:</strong> Lightweight Mobile Architecture</li>
                    <li><strong>Parameters:</strong> ~3.2 Million</li>
                    <li><strong>Grad-CAM Quality:</strong> Diffuse heatmaps</li>
                    <li><strong>Tradeoff:</strong> High error rate on early-stage symptoms</li>
                </ul>
            </div>
        </div>

        <!-- Metric Comparison Bar Chart Visualizer -->
        <div class="chart-section card">
            <h3>Model Performance Comparison</h3>
            <div class="bar-chart-container">
                <div class="bar-row">
                    <span class="bar-label">ResNet50 (Selected)</span>
                    <div class="bar-track">
                        <div class="bar-fill winner-fill" style="width: 84.09%;">84.09%</div>
                    </div>
                </div>
                <div class="bar-row">
                    <span class="bar-label">EfficientNet-B0</span>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: 77.53%;">77.53%</div>
                    </div>
                </div>
                <div class="bar-row">
                    <span class="bar-label">MobileNetV3</span>
                    <div class="bar-track">
                        <div class="bar-fill error-fill" style="width: 62.12%;">62.12%</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Technical Comparison Table -->
        <div class="table-section card">
            <h3>Architectural & Deployment Tradeoff Matrix</h3>
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Metric / Feature</th>
                        <th>ResNet50</th>
                        <th>EfficientNet-B0</th>
                        <th>MobileNetV3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Classification Accuracy</strong></td>
                        <td><span class="pill pill-success">84.09%</span></td>
                        <td><span class="pill pill-warning">77.53%</span></td>
                        <td><span class="pill pill-danger">62.12%</span></td>
                    </tr>
                    <tr>
                        <td><strong>Model File Size</strong></td>
                        <td>~95 MB</td>
                        <td>~17 MB</td>
                        <td>~13 MB</td>
                    </tr>
                    <tr>
                        <td><strong>Grad-CAM Heatmap Resolution</strong></td>
                        <td>High (7×7 feature map)</td>
                        <td>Medium</td>
                        <td>Low / Diffuse</td>
                    </tr>
                    <tr>
                        <td><strong>Edge Inference Latency (CPU)</strong></td>
                        <td>~120 ms</td>
                        <td>~45 ms</td>
                        <td>~25 ms</td>
                    </tr>
                    <tr>
                        <td><strong>Production Status</strong></td>
                        <td><strong>Active Model</strong></td>
                        <td>Archived</td>
                        <td>Archived</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 10 Class Supported Matrix -->
        <div class="card">
            <h3>Supported Diagnosis Categories (10 Classes)</h3>
            <div class="classes-grid">
                <div class="crop-category">
                    <h4>🍊 Citrus Classes</h4>
                    <ul>
                        <li>Citrus Black spot</li>
                        <li>Citrus Melanose</li>
                        <li>Citrus Canker</li>
                        <li>Citrus Greening (HLB)</li>
                        <li>Citrus Healthy</li>
                    </ul>
                </div>
                <div class="crop-category">
                    <h4>🍈 Guava Classes</h4>
                    <ul>
                        <li>Guava Disease Free</li>
                        <li>Guava Phytopthora</li>
                        <li>Guava Red rust</li>
                        <li>Guava Scab</li>
                        <li>Guava Styler and Root Rot</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    return container;
}
