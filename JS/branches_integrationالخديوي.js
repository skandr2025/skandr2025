// Branches Integration with Dashboard
class BranchesIntegration {
    constructor() {
        this.branches = [];
        this.init();
    }

    init() {
        this.loadBranchesData();
        this.renderBranches();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for branches updates from dashboard
        window.addEventListener('storage', (e) => {
            if (e.key === 'websiteBranches') {
                this.loadBranchesData();
                this.renderBranches();
            }
        });

        // Listen for same-window updates
        document.addEventListener('branchesUpdated', (e) => {
            this.branches = e.detail.branches;
            this.renderBranches();
        });
    }

    loadBranchesData() {
        try {
            // Load from dashboard data
            const dashboardBranches = JSON.parse(localStorage.getItem('dashboardBranches') || '[]');
            const websiteBranches = JSON.parse(localStorage.getItem('websiteBranches') || '[]');
            
            // Use dashboard branches if available, otherwise use website branches
            this.branches = dashboardBranches.length > 0 ? dashboardBranches.filter(b => b.active) : websiteBranches;
            
            console.log('Branches loaded:', this.branches.length);
        } catch (error) {
            console.error('Error loading branches data:', error);
            this.branches = [];
        }
    }

    renderBranches() {
        const branchesSection = document.querySelector('#location .branches-grid');
        if (!branchesSection) return;

        if (this.branches.length === 0) {
            // Show default branches if no data available
            this.renderDefaultBranches();
            return;
        }

        branchesSection.innerHTML = this.branches.map(branch => `
            <div class="branch-card">
                <div class="branch-image">
                    <img src="${branch.image}" alt="${branch.name}">
                </div>
                
                <div class="branch-info">
                    <h3>${branch.name}</h3>
                    <div class="branch-details">
                        <div class="detail-item">
                            <i class="fa-solid fa-map-marker-alt"></i>
                            <span>${branch.address}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fa-solid fa-phone"></i>
                            <span>${branch.phone}</span>
                        </div>
                        ${branch.description ? `
                        <div class="detail-item">
                            <i class="fa-solid fa-info-circle"></i>
                            <span>${branch.description}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="branch-actions">
                        <a href="https://wa.me/${branch.phone}" class="action-btn order-btn">
                            <i class="fa-brands fa-whatsapp"></i>
                            اطلب الآن
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        console.log('Branches rendered:', this.branches.length);
    }

    renderDefaultBranches() {
        const branchesSection = document.querySelector('#location .branches-grid');
        if (!branchesSection) return;

        // Keep the existing static branches as fallback
        const defaultBranches = [
            {
                name: "مخزن الكورنيش",
                address: "شارع الكورنيش، الإسكندرية",
                phone: "01127765095",
                image: "img/WhatsApp Image 2025-11-07 at 04.38.35_fc6c4813.jpg"
            },
            {
                name: "مخزن فؤاد",
                address: "شارع فؤاد، الإسكندرية",
                phone: "01127765095",
                image: "img/WhatsApp Image 2025-11-07 at 04.38.34_e7e4af78.jpg"
            },
            {
                name: "مخزن الجيش",
                address: "شارع الجيش، الإسكندرية",
                phone: "01127765095",
                image: "img/WhatsApp Image 2025-11-07 at 04.42.12_cac159d6.jpg"
            }
        ];

        branchesSection.innerHTML = defaultBranches.map(branch => `
            <div class="branch-card">
                <div class="branch-image">
                    <img src="${branch.image}" alt="${branch.name}">
                </div>
                
                <div class="branch-info">
                    <h3>${branch.name}</h3>
                    <div class="branch-details">
                        <div class="detail-item">
                            <i class="fa-solid fa-map-marker-alt"></i>
                            <span>${branch.address}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fa-solid fa-phone"></i>
                            <span>${branch.phone}</span>
                        </div>
                    </div>
                    
                    <div class="branch-actions">
                        <a href="https://wa.me/${branch.phone}" class="action-btn order-btn">
                            <i class="fa-brands fa-whatsapp"></i>
                            اطلب الآن
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Method to refresh branches data
    refreshBranches() {
        this.loadBranchesData();
        this.renderBranches();
    }
}

// Initialize branches integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.branchesIntegration = new BranchesIntegration();
});

// Make refresh function available globally
window.refreshBranchesData = function() {
    if (window.branchesIntegration) {
        window.branchesIntegration.refreshBranches();
    }
};