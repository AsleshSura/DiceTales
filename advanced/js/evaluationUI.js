/**
 * DiceTales - DM Evaluation UI Manager
 * Handles the display and interaction of DM evaluation metrics
 */

class EvaluationUI {
    constructor() {
        this.modal = null;
        this.button = null;
        this.aiManager = null;
        this.dmEvaluator = null;
        this.updateInterval = null;
        this.bindEvents();
    }

    initialize(aiManager) {
        this.aiManager = aiManager;
        this.dmEvaluator = aiManager?.dmEvaluator;
        
        if (this.dmEvaluator) {
            this.setupUI();
            this.startAutoUpdate();
            console.log('📊 Evaluation UI initialized');
        }
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.modal = document.getElementById('dm-evaluation-modal');
            this.button = document.getElementById('dm-evaluation-btn');
            
            if (this.button) {
                this.button.addEventListener('click', () => this.showModal());
            }

            // Toggle controls
            const enableEvalToggle = document.getElementById('enable-evaluation');
            const autoImproveToggle = document.getElementById('auto-improve');

            if (enableEvalToggle) {
                enableEvalToggle.addEventListener('change', (e) => {
                    if (this.aiManager) {
                        this.aiManager.enableEvaluation = e.target.checked;
                        console.log('📊 Evaluation', e.target.checked ? 'enabled' : 'disabled');
                    }
                });
            }

            if (autoImproveToggle) {
                autoImproveToggle.addEventListener('change', (e) => {
                    if (this.aiManager) {
                        this.aiManager.autoImprove = e.target.checked;
                        console.log('🔧 Auto-improvement', e.target.checked ? 'enabled' : 'disabled');
                    }
                });
            }
        });
    }

    setupUI() {
        // Sync toggle states with aiManager
        const enableEvalToggle = document.getElementById('enable-evaluation');
        const autoImproveToggle = document.getElementById('auto-improve');

        if (enableEvalToggle && this.aiManager) {
            enableEvalToggle.checked = this.aiManager.enableEvaluation;
        }

        if (autoImproveToggle && this.aiManager) {
            autoImproveToggle.checked = this.aiManager.autoImprove;
        }

        this.updateStats();
    }

    showModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.updateStats();
            this.updateRecentEvaluations();
        }
    }

    updateStats() {
        if (!this.dmEvaluator) return;

        const stats = this.dmEvaluator.getStats();
        
        if (stats.noData) {
            this.showNoDataMessage();
            return;
        }

        // Update overall stats
        document.getElementById('overall-score').textContent = 
            stats.averageScore ? (stats.averageScore.toFixed(1) + '/10') : '-';
        
        document.getElementById('total-evaluations').textContent = 
            stats.totalEvaluations || '0';
            
        document.getElementById('improvement-rate').textContent = 
            this.calculateImprovementRate(stats);

        // Update category scores
        this.updateCategoryScores(stats.categoryStats);
    }

    calculateImprovementRate(stats) {
        if (!stats.categoryStats) return '-';
        
        let improvingCount = 0;
        let totalCategories = 0;
        
        Object.values(stats.categoryStats).forEach(category => {
            if (category.trend === 'improving') improvingCount++;
            totalCategories++;
        });
        
        if (totalCategories === 0) return '-';
        
        const rate = (improvingCount / totalCategories * 100).toFixed(0);
        return rate + '%';
    }

    updateCategoryScores(categoryStats) {
        const container = document.getElementById('evaluation-categories');
        if (!container || !categoryStats) return;

        container.innerHTML = '<h3 style="color: #e5e7eb; margin-bottom: 1rem;">Performance by Category</h3>';

        Object.entries(categoryStats).forEach(([category, stats]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-score';
            
            const scorePercentage = (stats.average * 100).toFixed(0);
            const trendIcon = this.getTrendIcon(stats.trend);
            
            categoryDiv.innerHTML = `
                <div class="category-name">
                    ${this.getCategoryDisplayName(category)} ${trendIcon}
                </div>
                <div class="category-value">
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${scorePercentage}%"></div>
                    </div>
                    <div class="score-text">${(stats.average * 10).toFixed(1)}/10</div>
                </div>
            `;
            
            container.appendChild(categoryDiv);
        });
    }

    getTrendIcon(trend) {
        switch (trend) {
            case 'improving': return '📈';
            case 'declining': return '📉';
            default: return '📊';
        }
    }

    getCategoryDisplayName(category) {
        const names = {
            immersion: 'Immersion & Atmosphere',
            personality: 'DM Personality',
            engagement: 'Player Engagement',
            flow: 'Narrative Flow',
            authenticity: 'D&D Authenticity',
            creativity: 'Creative Flair'
        };
        return names[category] || category;
    }

    updateRecentEvaluations() {
        if (!this.dmEvaluator) return;

        const container = document.getElementById('evaluations-list');
        if (!container) return;

        const recent = this.dmEvaluator.responseHistory.slice(-5).reverse();
        
        if (recent.length === 0) {
            container.innerHTML = '<p style="color: #9ca3af; text-align: center;">No evaluations yet</p>';
            return;
        }

        container.innerHTML = '';

        recent.forEach((evaluation, index) => {
            const evaluationDiv = document.createElement('div');
            evaluationDiv.className = 'evaluation-item';
            
            const timeAgo = this.formatTimeAgo(evaluation.timestamp);
            const preview = this.truncateText(evaluation.response, 100);
            const topSuggestions = evaluation.suggestions.slice(0, 2);
            
            evaluationDiv.innerHTML = `
                <div class="evaluation-header">
                    <div class="evaluation-score">${evaluation.totalScore.toFixed(1)}/10</div>
                    <div class="evaluation-time">${timeAgo}</div>
                </div>
                <div class="evaluation-preview">${preview}</div>
                ${topSuggestions.length > 0 ? `
                    <div class="evaluation-suggestions">
                        💡 ${topSuggestions.join(' • ')}
                    </div>
                ` : ''}
            `;
            
            container.appendChild(evaluationDiv);
        });
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showNoDataMessage() {
        const statsContainer = document.getElementById('evaluation-stats');
        const categoriesContainer = document.getElementById('evaluation-categories');
        const evaluationsContainer = document.getElementById('evaluations-list');
        
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #9ca3af;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                    <h3>No Evaluation Data Yet</h3>
                    <p>Start a campaign to begin collecting DM performance metrics!</p>
                </div>
            `;
        }
        
        if (categoriesContainer) {
            categoriesContainer.innerHTML = '';
        }
        
        if (evaluationsContainer) {
            evaluationsContainer.innerHTML = '';
        }
    }

    startAutoUpdate() {
        // Update every 10 seconds when modal is visible
        this.updateInterval = setInterval(() => {
            if (this.modal && this.modal.style.display === 'flex') {
                this.updateStats();
                this.updateRecentEvaluations();
            }
        }, 10000);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize evaluation UI
document.addEventListener('DOMContentLoaded', () => {
    window.evaluationUI = new EvaluationUI();
    
    // Connect to AI manager when it's available
    const connectToAI = () => {
        if (window.aiManager) {
            window.evaluationUI.initialize(window.aiManager);
        } else {
            setTimeout(connectToAI, 1000);
        }
    };
    
    connectToAI();
});

// Make available globally
window.EvaluationUI = EvaluationUI;
