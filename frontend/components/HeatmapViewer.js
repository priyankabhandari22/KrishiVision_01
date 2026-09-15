/**
 * HeatmapViewer component for presenting Grad-CAM heatmap with original image overlay toggle.
 * 
 * @param {Object} props
 * @param {string} [props.originalImgSrc] - Source URL or Data URL of the uploaded leaf image
 * @param {string} props.heatmapImgSrc - Source URL or Data URL of the Grad-CAM heatmap overlay
 * @param {string} [props.caption] - Caption describing the visualization
 * @returns {HTMLElement}
 */
export function createHeatmapViewer({ originalImgSrc, heatmapImgSrc, caption }) {
    const container = document.createElement('div');
    container.className = 'heatmap-viewer-container';
    container.style.cssText = 'text-align: center; margin-bottom: 2rem; background: #fafafa; padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color, #e0e0e0);';

    const defaultCaption = caption || 'Heatmap highlights the regions of the leaf that influenced the model diagnosis.';
    const hasOriginal = Boolean(originalImgSrc);

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <h3 style="color: var(--text-main, #333); font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 1 0 10 10"/></svg>
                Visual Explanation
            </h3>
            ${hasOriginal ? `
            <div class="toggle-group" style="display: inline-flex; border: 1px solid #ccc; border-radius: 6px; overflow: hidden; background: #fff;">
                <button type="button" class="heatmap-toggle-btn active" data-mode="heatmap" style="padding: 0.4rem 0.8rem; border: none; background: var(--primary, #2e7d32); color: #fff; font-size: 0.85rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">
                    Heatmap Overlay
                </button>
                <button type="button" class="heatmap-toggle-btn" data-mode="original" style="padding: 0.4rem 0.8rem; border: none; background: transparent; color: #555; font-size: 0.85rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">
                    Original Image
                </button>
            </div>
            ` : ''}
        </div>
        
        <div style="position: relative; display: inline-block; max-width: 100%;">
            <img class="heatmap-img-display" src="${heatmapImgSrc || originalImgSrc}" alt="Leaf Analysis Visualization" 
                 style="max-width: 100%; max-height: 400px; height: auto; border-radius: 6px; border: 1px solid var(--border-color, #e0e0e0); object-fit: contain; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
        </div>

        <div class="heatmap-caption" style="font-size: 0.85rem; color: var(--text-muted, #666); margin-top: 0.75rem; font-style: italic;">
            ${defaultCaption}
        </div>
    `;

    if (hasOriginal) {
        const toggleBtns = container.querySelectorAll('.heatmap-toggle-btn');
        const imgDisplay = container.querySelector('.heatmap-img-display');

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = '#555';
                });
                btn.classList.add('active');
                btn.style.background = 'var(--primary, #2e7d32)';
                btn.style.color = '#fff';

                const mode = btn.getAttribute('data-mode');
                if (mode === 'original') {
                    imgDisplay.src = originalImgSrc
                    imgDisplay.alt = 'Original Leaf Image';
                } else {
                    imgDisplay.src = heatmapImgSrc;
                    imgDisplay.alt = 'Grad-CAM Heatmap Analysis';
                }
            });
        });
    }

    return container;
}
