// CRM Page - Consolidated JavaScript
// Combines component loading, initialization, and chart configuration

// ===========================================
// 0. THEME INITIALIZATION
// ===========================================

// Initialize theme from localStorage or default to dark
(function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('Theme initialized:', savedTheme);
})();

// Get theme-appropriate colors
function getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        return {
            background: '#1f2937',
            text: '#f9fafb',
            muted: '#d1d5db',
            grid: '#374151',
            border: '#4b5563',
            
            // Chart colors that work in both themes
            primary: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            purple: '#8b5cf6',
            
            // Accent colors for charts
            chartColors: [
                '#3b82f6',  // Blue
                '#10b981',  // Green  
                '#8b5cf6',  // Purple
                '#f59e0b',  // Orange
                '#ef4444'   // Red
            ]
        };
    } else {
        return {
            background: '#ffffff',
            text: '#111827',
            muted: '#6b7280',
            grid: '#e5e7eb',
            border: '#d1d5db',
            
            // Chart colors that work in both themes
            primary: '#2563eb',
            success: '#059669',
            warning: '#d97706',
            danger: '#dc2626',
            purple: '#7c3aed',
            
            // Accent colors for charts
            chartColors: [
                '#2563eb',  // Blue
                '#059669',  // Green  
                '#7c3aed',  // Purple
                '#d97706',  // Orange
                '#dc2626'   // Red
            ]
        };
    }
}

// Store chart instances for proper cleanup
let chartInstances = {
    engagement: null,
    performance: null
};

// Set Chart.js global defaults based on theme
function setChartDefaults() {
    if (typeof Chart !== 'undefined') {
        const colors = getThemeColors();
        Chart.defaults.color = colors.text;
        Chart.defaults.borderColor = colors.grid;
        Chart.defaults.backgroundColor = colors.background;
        Chart.defaults.font = {
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 12
        };
    }
}

// ===========================================
// 1. COMPONENT LOADING AND INITIALIZATION
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                   background: rgba(248, 250, 252, 0.95); z-index: 9999; 
                   display: flex; align-items: center; justify-content: center;">
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 4px solid #e2e8f0; 
                           border-top: 4px solid #2563eb; border-radius: 50%; 
                           animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p style="color: #64748b; font-weight: 500;">Loading components...</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loadingOverlay);
    
    // Hide main content initially
    const pageWrapper = document.querySelector('.page-wrapper');
    if (pageWrapper) {
        pageWrapper.style.opacity = '0';
        pageWrapper.style.visibility = 'hidden';
        pageWrapper.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
    }
    
    // Track component loading
    let componentsLoaded = 0;
    const expectedComponents = ['navbar', 'footer'];
    const loadedComponents = new Set();
    
    function checkComponentsLoaded(event) {
        const componentPath = event.detail?.componentPath;
        if (componentPath) {
            if (componentPath.includes('navbar')) {
                loadedComponents.add('navbar');
            } else if (componentPath.includes('footer')) {
                loadedComponents.add('footer');
            }
        }
        
        // Check if all expected components are loaded
        if (loadedComponents.size >= expectedComponents.length) {
            setTimeout(() => {
                if (pageWrapper) {
                    pageWrapper.style.opacity = '1';
                    pageWrapper.style.visibility = 'visible';
                }
                if (loadingOverlay) {
                    loadingOverlay.remove();
                }
            }, 300);
        }
    }
    
    // Listen for component load events
    document.addEventListener('componentLoaded', checkComponentsLoaded);
    
    // Fallback timeout to show content even if components fail to load
    setTimeout(() => {
        if (pageWrapper) {
            pageWrapper.style.opacity = '1';
            pageWrapper.style.visibility = 'visible';
        }
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }, 3000);

    // ===========================================
    // 2. CHART INITIALIZATION
    // ===========================================
    
    // Wait for the page to be visible before initializing charts
    const initCharts = () => {
        console.log('Attempting to initialize charts...');
        
        // Check if chart elements exist
        const engagementCanvas = document.getElementById('engagementWeightChart');
        const performanceCanvas = document.getElementById('performanceCategoryChart');
        
        console.log('Chart elements found:', { engagementCanvas, performanceCanvas });
        
        if (!engagementCanvas || !performanceCanvas) {
            console.log('Chart elements not found, retrying in 500ms...');
            // Retry after a short delay if elements don't exist yet
            setTimeout(initCharts, 500);
            return;
        }
        
        console.log('Initializing charts...');
        // Set Chart.js global defaults for theme
        setChartDefaults();
        
        initEngagementChart();
        initPerformanceChart();
        console.log('Charts initialization completed');
    };
    
    // Start chart initialization after a short delay to ensure DOM is fully ready
    setTimeout(initCharts, 100);
});

// ===========================================
// 3. CHART CONFIGURATIONS
// ===========================================

// Engagement Weight Chart - Based on Educational Research
function initEngagementChart() {
    console.log('Initializing engagement chart...');
    
    // Destroy existing chart if it exists
    if (chartInstances.engagement) {
        chartInstances.engagement.destroy();
    }
    
    const colors = getThemeColors();
    console.log('Theme colors:', colors);
    const engagementCtx = document.getElementById('engagementWeightChart').getContext('2d');
    console.log('Engagement chart context:', engagementCtx);
    
    const chartData = {
        // Weights based on learning science research and academic outcomes correlation
        labels: ['Assignment Submissions', 'Class Participation', 'Quiz Performance', 'Peer Collaboration', 'Event Attendance'],
        datasets: [{
            // Research-based weightings: Assignments (30%) are strongest predictor of success,
            // followed by participation (25%), assessments (20%), collaboration (15%), and events (10%)
            data: [30, 25, 20, 15, 10],
            backgroundColor: colors.chartColors,
            borderWidth: 2,
            borderColor: colors.background
        }]
    };
    
    console.log('Chart data:', chartData);
    
    chartInstances.engagement = new Chart(engagementCtx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: colors.text,
                        font: {
                            size: 14,
                            family: "Inter, sans-serif",
                            weight: '500'
                        },
                        boxWidth: 12,
                        boxHeight: 12,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const dataset = data.datasets[0];
                                    return {
                                        text: label + ' (' + dataset.data[i] + '%)',
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: dataset.borderWidth,
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: colors.background,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            layout: {
                padding: {
                    bottom: 20
                }
            }
        }
    });
    
    console.log('Engagement chart created:', chartInstances.engagement);
}

// Performance Category Chart - Based on Normal Distribution in Educational Settings
function initPerformanceChart() {
    console.log('Initializing performance chart...');
    
    // Destroy existing chart if it exists
    if (chartInstances.performance) {
        chartInstances.performance.destroy();
    }
    
    const colors = getThemeColors();
    console.log('Performance chart colors:', colors);
    const performanceCtx = document.getElementById('performanceCategoryChart').getContext('2d');
    console.log('Performance chart context:', performanceCtx);
    
    const chartData = {
        labels: ['High Engagement', 'Moderate Engagement', 'Low Engagement'],
        datasets: [{
            label: 'Student Count',
            // Data follows typical educational performance distribution:
            // ~25% high performers, ~60% average performers, ~15% at-risk students
            // Based on 2,500 total students: 625 high, 1,500 moderate, 375 low
            data: [625, 1500, 375],
            backgroundColor: [
                colors.success,  // Green for high engagement
                colors.warning,  // Orange for moderate engagement
                colors.danger    // Red for low engagement (intervention needed)
            ],
            borderWidth: 0,
            borderRadius: 8
        }]
    };
    
    console.log('Performance chart data:', chartData);
    console.log('Chart labels:', chartData.labels);
    console.log('Colors being used:', {
        text: colors.text,
        grid: colors.grid,
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger
    });
    
    chartInstances.performance = new Chart(performanceCtx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: colors.text,
                        font: {
                            size: 14,
                            family: "Inter, sans-serif",
                            weight: '500'
                        },
                        padding: 20,
                        usePointStyle: true,
                        generateLabels: function(chart) {
                            return [{
                                text: 'Student Distribution by Engagement Level',
                                fillStyle: colors.primary,
                                strokeStyle: colors.primary,
                                lineWidth: 0,
                                hidden: false,
                                index: 0
                            }];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: colors.background,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                            return context.dataset.label + ': ' + context.parsed.y + ' students (' + percentage + '%)';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Students',
                        color: '#000000', // Force black for visibility
                        font: {
                            size: 13,
                            weight: 'bold',
                            family: "Inter, sans-serif"
                        }
                    },
                    grid: {
                        color: colors.grid,
                        lineWidth: 1,
                        display: true
                    },
                    ticks: {
                        color: '#000000', // Force black for visibility
                        font: {
                            size: 12,
                            family: "Inter, sans-serif"
                        },
                        padding: 8,
                        display: true
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Engagement Categories',
                        color: '#000000', // Force black for visibility
                        font: {
                            size: 13,
                            weight: 'bold',
                            family: "Inter, sans-serif"
                        }
                    },
                    grid: {
                        color: colors.grid,
                        lineWidth: 1,
                        display: true
                    },
                    ticks: {
                        color: '#000000', // Force black for visibility
                        font: {
                            size: 12,
                            family: "Inter, sans-serif"
                        },
                        padding: 8,
                        maxRotation: 0,
                        display: true
                    }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            }
        }
    });
    
    console.log('Performance chart created:', chartInstances.performance);
}

// ===========================================
// ===========================================
// 4. UTILITY FUNCTIONS
// ===========================================

// Add any additional CRM-specific utility functions here
// Example: Data formatting, API calls, event handlers, etc.

// Function to update charts when theme changes
function updateChartsForTheme() {
    console.log('Updating charts for theme change');
    
    // Simply reinitialize charts
    setTimeout(() => {
        console.log('Re-initializing charts...');
        initEngagementChart();
        initPerformanceChart();
    }, 100);
}

// Function to force chart refresh (for debugging)
function forceRefreshCharts() {
    console.log('Force refreshing charts...');
    updateChartsForTheme();
}

// Make function available globally for debugging
window.forceRefreshCharts = forceRefreshCharts;

// Listen for theme changes
document.addEventListener('themeChanged', updateChartsForTheme);

// Also listen for manual theme attribute changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            updateChartsForTheme();
        }
    });
});
observer.observe(document.documentElement, { attributes: true });

// Force refresh charts after page load (for debugging)
setTimeout(() => {
    console.log('Auto-refreshing charts after page load...');
    forceRefreshCharts();
}, 2000);
// Example: Data formatting, API calls, event handlers, etc.

// CRM Analytics Helper Functions
const CRMAnalytics = {
    // Calculate engagement score based on activities
    calculateEngagementScore: function(activities) {
        const weights = {
            assignments: 0.30,
            participation: 0.25,
            quizzes: 0.20,
            collaboration: 0.15,
            events: 0.10
        };
        
        let totalScore = 0;
        Object.keys(weights).forEach(key => {
            if (activities[key] !== undefined) {
                totalScore += activities[key] * weights[key];
            }
        });
        
        return Math.round(totalScore);
    },
    
    // Categorize student based on engagement score
    categorizeEngagement: function(score) {
        if (score >= 80) return 'High Engagement';
        if (score >= 50) return 'Moderate Engagement';
        return 'Low Engagement';
    },
    
    // Format currency for revenue calculations
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    }
};

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CRMAnalytics };
}