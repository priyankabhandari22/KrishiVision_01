/**
 * UncertaintyBanner component displayed only when is_confident is false.
 * 
 * @param {Object} props
 * @param {boolean} props.is_confident - Confidence status flag from prediction result
 * @param {string} [props.confidence_warning] - Warning text describing low confidence / recommendation to re-photograph
 * @param {string} [props.warningIconSrc='../assets/warning.svg'] - Icon path for warning symbol
 * @returns {HTMLElement|null} Returns element if is_confident is false, null otherwise
 */
export function createUncertaintyBanner({ is_confident, confidence_warning, warningIconSrc = '../assets/warning.svg' }) {
    // Only render if is_confident is false
    if (is_confident !== false && is_confident !== 0) {
        return null;
    }

    const container = document.createElement('div');
    container.className = 'uncertainty-banner';
    container.style.cssText = `
        background-color: var(--warning-bg, #fff3cd);
        color: var(--warning-text, #856404);
        border: 1px solid var(--warning-border, #ffeeba);
        padding: 1rem 1.25rem;
        border-radius: 6px;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        font-weight: 500;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    `;

    const defaultMsg = 'Low confidence prediction. Advice provided is generalized. Consider consulting an expert or re-photographing the leaf under better lighting.';
    const message = confidence_warning || defaultMsg;

    container.innerHTML = `
        <img src="${warningIconSrc}" alt="Warning" style="width: 24px; height: 24px; flex-shrink: 0; margin-top: 2px;" onerror="this.style.display='none'">
        <div style="flex: 1; line-height: 1.5;">
            <strong style="display: block; margin-bottom: 0.25rem; font-weight: 600;">Uncertainty Warning</strong>
            <span>${message}</span>
        </div>
    `;

    return container;
}
