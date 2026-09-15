/**
 * ConfidenceBar component for visually displaying prediction confidence score.
 * 
 * @param {Object} props
 * @param {number} props.confidence - Confidence value (0.0 to 1.0 or 0 to 100)
 * @param {boolean} [props.isConfident=true] - Whether prediction meets confidence threshold
 * @returns {HTMLElement}
 */
export function createConfidenceBar({ confidence, isConfident = true }) {
    const container = document.createElement('div');
    container.className = 'confidence-bar-container';

    const rawNum = typeof confidence === 'number' ? confidence : parseFloat(confidence) || 0;
    const percentage = rawNum <= 1 ? (rawNum * 100).toFixed(1) : rawNum.toFixed(1);
    const colorClass = isConfident ? 'high-confidence' : 'low-confidence';

    container.innerHTML = `
        <div class="confidence-header" style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted, #666); margin-bottom: 0.25rem;">
            <span>Confidence Level</span>
            <strong class="confidence-value" style="color: var(--text-main, #333);">${percentage}%</strong>
        </div>
        <div class="confidence-track" style="height: 10px; background-color: #e0e0e0; border-radius: 5px; overflow: hidden; width: 100%;">
            <div class="confidence-fill ${colorClass}" style="height: 100%; width: ${percentage}%; background-color: ${isConfident ? '#2e7d32' : '#d97706'}; transition: width 0.4s ease;"></div>
        </div>
    `;

    return container;
}
