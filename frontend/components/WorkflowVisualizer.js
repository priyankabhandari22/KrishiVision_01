/**
 * WorkflowVisualizer.js
 * ---------------------
 * Interactive 12-step animated workflow stepper for KrishiVision pipeline.
 *
 * Steps:
 * 1. 🌿 Upload Leaf
 * 2. 🔬 Disease Detection
 * 3. 🏆 ResNet50 — 84.09%
 * 4. 📊 Confidence
 * 5. 🔥 Grad-CAM
 * 6. 🤖 AI Agricultural Advisor
 * 7. ⚠️ Problem Explanation
 * 8. 🚨 Immediate Action
 * 9. 🛡 Disease Spread Prevention
 * 10. 🌱 Long-Term Prevention
 * 11. 📅 Monitoring Advice
 * 12. 💾 Prediction History
 */

export const WORKFLOW_STEPS = [
    { id: 'upload', icon: '🌿', label: 'Upload Leaf' },
    { id: 'detect', icon: '🔬', label: 'Disease Detection' },
    { id: 'resnet', icon: '🏆', label: 'ResNet50 (84.09%)' },
    { id: 'confidence', icon: '📊', label: 'Confidence Score' },
    { id: 'gradcam', icon: '🔥', label: 'Grad-CAM Heatmap' },
    { id: 'advisor', icon: '🤖', label: 'AI Advisor' },
    { id: 'explanation', icon: '⚠️', label: 'Problem Explanation' },
    { id: 'immediate', icon: '🚨', label: 'Immediate Action' },
    { id: 'spread', icon: '🛡', label: 'Spread Prevention' },
    { id: 'longterm', icon: '🌱', label: 'Long-Term Action' },
    { id: 'monitoring', icon: '📅', label: 'Monitoring Advice' },
    { id: 'history', icon: '💾', label: 'Saved to History' }
];

export function createWorkflowVisualizer() {
    const container = document.createElement('div');
    container.className = 'workflow-container';

    container.innerHTML = `
        <div class="workflow-header">
            <h3>Pipeline Execution Flow</h3>
            <span class="workflow-badge">ResNet50 Engine • 84.09% Accuracy</span>
        </div>
        <div class="workflow-stepper">
            ${WORKFLOW_STEPS.map((step, idx) => `
                <div class="step-item" id="step-${step.id}" data-index="${idx}">
                    <div class="step-icon">${step.icon}</div>
                    <div class="step-label">${step.label}</div>
                    ${idx < WORKFLOW_STEPS.length - 1 ? '<div class="step-connector"></div>' : ''}
                </div>
            `).join('')}
        </div>
    `;

    return container;
}

export async function animateWorkflow(onStepChange) {
    for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
        const step = WORKFLOW_STEPS[i];
        const el = document.getElementById(`step-${step.id}`);
        if (el) {
            el.classList.add('active');
            if (i > 0) {
                const prev = document.getElementById(`step-${WORKFLOW_STEPS[i - 1].id}`);
                if (prev) {
                    prev.classList.remove('active');
                    prev.classList.add('completed');
                }
            }
        }
        if (onStepChange) onStepChange(step, i);
        // Short pause between steps for visual feedback
        await new Promise((r) => setTimeout(r, 120));
    }
}

export function resetWorkflow() {
    WORKFLOW_STEPS.forEach((step) => {
        const el = document.getElementById(`step-${step.id}`);
        if (el) {
            el.classList.remove('active', 'completed');
        }
    });
}
