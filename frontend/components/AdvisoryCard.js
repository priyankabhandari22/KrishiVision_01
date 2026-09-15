/**
 * AdvisoryCard component for displaying structured advisory recommendations.
 * Reusable for: explanation, immediate actions, spread-prevention, and long-term sections.
 * 
 * @param {Object} props
 * @param {string} props.title - Card header title
 * @param {string} [props.iconSrc='../assets/leaf.svg'] - Icon asset path or SVG
 * @param {string} [props.type='text'] - 'text' | 'list' | 'long-term'
 * @param {string|Array<string>|Object} props.data - Section content data
 * @returns {HTMLElement}
 */
export function createAdvisoryCard({ title, iconSrc = '../assets/leaf.svg', type = 'text', data }) {
    const card = document.createElement('div');
    card.className = `advisory-card advisory-card-${type}`;
    card.style.cssText = 'background: #ffffff; border-radius: 8px; border: 1px solid var(--border-color, #e0e0e0); padding: 1.25rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);';

    // Header HTML
    const headerHtml = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 2px solid var(--primary-light, #60ad5e); padding-bottom: 0.5rem;">
            <img src="${iconSrc}" alt="" style="width: 22px; height: 22px;" onerror="this.style.display='none'">
            <h3 style="color: var(--primary, #2e7d32); margin: 0; font-size: 1.15rem; font-weight: 600;">${title}</h3>
        </div>
    `;

    let bodyHtml = '';

    if (type === 'text') {
        const text = typeof data === 'string' ? data : (data || 'No details available.');
        bodyHtml = `<p style="margin: 0; color: var(--text-main, #333); line-height: 1.6;">${text}</p>`;
    } else if (type === 'list') {
        const items = Array.isArray(data) ? data : [];
        if (items.length > 0) {
            bodyHtml = `
                <ul style="padding-left: 1.25rem; margin: 0; color: var(--text-main, #333);">
                    ${items.map(item => `<li style="margin-bottom: 0.5rem; line-height: 1.5;">${item}</li>`).join('')}
                </ul>
            `;
        } else {
            bodyHtml = `<p style="color: var(--text-muted, #666); font-style: italic; margin: 0;">No specific actions listed.</p>`;
        }
    } else if (type === 'long-term') {
        const ltp = data || {};
        const freq = ltp.inspection_frequency || ltp.inspectionFrequency || 'Periodic';
        const guidance = ltp.inspection_guidance || ltp.inspectionGuidance || '';
        const monitoring = ltp.long_term_monitoring || ltp.longTermMonitoring || [];
        const hygiene = ltp.universal_hygiene_practices || ltp.universalHygienePractices || [];

        bodyHtml = `
            <div style="background: #f9f9f9; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; border: 1px solid var(--border-color, #e0e0e0);">
                <div style="font-weight: 600; color: var(--primary-dark, #005005); text-transform: capitalize;">
                    Inspection Frequency: ${freq}
                </div>
                ${guidance ? `<div style="color: var(--text-muted, #666); font-size: 0.9rem; margin-top: 0.25rem;">${guidance}</div>` : ''}
            </div>

            ${monitoring.length > 0 ? `
                <h4 style="margin: 1rem 0 0.5rem 0; color: var(--text-main, #333); font-size: 0.95rem;">Monitoring & Surveillance Steps</h4>
                <ul style="padding-left: 1.25rem; margin: 0 0 1rem 0; color: var(--text-main, #333);">
                    ${monitoring.map(item => `<li style="margin-bottom: 0.4rem; line-height: 1.4;">${item}</li>`).join('')}
                </ul>
            ` : ''}

            ${hygiene.length > 0 ? `
                <h4 style="margin: 1rem 0 0.5rem 0; color: var(--text-main, #333); font-size: 0.95rem;">Universal Hygiene Practices</h4>
                <ul style="padding-left: 1.25rem; margin: 0; color: var(--text-main, #333);">
                    ${hygiene.map(item => `<li style="margin-bottom: 0.4rem; line-height: 1.4;">${item}</li>`).join('')}
                </ul>
            ` : ''}
        `;
    }

    card.innerHTML = headerHtml + bodyHtml;
    return card;
}
