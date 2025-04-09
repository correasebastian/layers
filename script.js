// Load data from JSON file
async function loadBranchData() {
    try {
        const response = await fetch('analyzed_branch_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading branch data:', error);
        // Fall back to sample data if loading fails
        return {
            main: ["feature/profile-789", "feature/payment-456", "feature/auth-123"],
            release: ["feature/notification-202", "feature/search-101", "feature/auth-123"],
            common: ["feature/auth-123"],
            mainOnly: ["feature/profile-789", "feature/payment-456"],
            releaseOnly: ["feature/notification-202", "feature/search-101"],
            stats: {
                total_branches: 5,
                main_count: 3,
                release_count: 3,
                common_count: 1,
                main_only_count: 2,
                release_only_count: 2,
                repository: "example/private-repo",
                common_percentage: 20.0,
                main_only_percentage: 40.0,
                release_only_percentage: 40.0
            }
        };
    }
}

// Create Venn Diagram visualization
async function createVennDiagram() {
    // Load data from JSON file
    const branchData = await loadBranchData();
    
    // Update counts in the UI
    document.getElementById('main-count').textContent = branchData.stats?.main_count;
    document.getElementById('release-count').textContent = branchData.stats?.release_count;
    document.getElementById('common-count').textContent = branchData.stats?.common_count;
    
    // Update repository name if available
    if (branchData.stats && branchData.stats?.repository) {
        const repoName = branchData.stats?.repository;
        document.querySelector('header p').textContent = `Visualizing differences between main and release branches in ${repoName}`;
    }
    
    const container = document.getElementById('venn-diagram');
    const width = container.clientWidth;
    const height = 450;
    
    // Clear any existing SVG
    container.innerHTML = '';
    
    // Create SVG
    const svg = d3.select("#venn-diagram")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // Circle properties
    const radius = Math.min(width, height) / 4;
    const offset = radius * 0.7;
    
    // Create gradient for main circle
    const mainGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "mainGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    mainGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#4299e1")
        .attr("stop-opacity", 0.7);
    
    mainGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#3182ce")
        .attr("stop-opacity", 0.7);
    
    // Create gradient for release circle
    const releaseGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "releaseGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    releaseGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ed8936")
        .attr("stop-opacity", 0.7);
    
    releaseGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#dd6b20")
        .attr("stop-opacity", 0.7);
    
    // Draw main branch circle
    const mainCircle = svg.append("circle")
        .attr("cx", -offset)
        .attr("cy", 0)
        .attr("r", radius)
        .style("fill", "url(#mainGradient)")
        .style("stroke", "#2b6cb0")
        .style("stroke-width", 2)
        .attr("class", "main-circle");
    
    // Draw release branch circle
    const releaseCircle = svg.append("circle")
        .attr("cx", offset)
        .attr("cy", 0)
        .attr("r", radius)
        .style("fill", "url(#releaseGradient)")
        .style("stroke", "#c05621")
        .style("stroke-width", 2)
        .attr("class", "release-circle");
    
    // Add labels with background
    // Main label
    svg.append("rect")
        .attr("x", -offset - 40)
        .attr("y", -radius - 30)
        .attr("width", 80)
        .attr("height", 24)
        .attr("rx", 12)
        .attr("ry", 12)
        .style("fill", "#2b6cb0");
    
    svg.append("text")
        .attr("x", -offset)
        .attr("y", -radius - 14)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("Main");
    
    // Release label
    svg.append("rect")
        .attr("x", offset - 40)
        .attr("y", -radius - 30)
        .attr("width", 80)
        .attr("height", 24)
        .attr("rx", 12)
        .attr("ry", 12)
        .style("fill", "#c05621");
    
    svg.append("text")
        .attr("x", offset)
        .attr("y", -radius - 14)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("Release");
    
    // Add branch counts with circles
    // Main only count
    svg.append("circle")
        .attr("cx", -offset)
        .attr("cy", -20)
        .attr("r", 25)
        .style("fill", "white")
        .style("fill-opacity", 0.8)
        .style("stroke", "#2b6cb0")
        .style("stroke-width", 2);
    
    svg.append("text")
        .attr("x", -offset)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#2b6cb0")
        .text(branchData.mainOnly.length);
    
    // Release only count
    svg.append("circle")
        .attr("cx", offset)
        .attr("cy", -20)
        .attr("r", 25)
        .style("fill", "white")
        .style("fill-opacity", 0.8)
        .style("stroke", "#c05621")
        .style("stroke-width", 2);
    
    svg.append("text")
        .attr("x", offset)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#c05621")
        .text(branchData.releaseOnly.length);
    
    // Common count
    svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 25)
        .style("fill", "white")
        .style("fill-opacity", 0.8)
        .style("stroke", "#38b2ac")
        .style("stroke-width", 2);
    
    svg.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#38b2ac")
        .text(branchData.common.length);
    
    // Add intersection label
    svg.append("rect")
        .attr("x", -60)
        .attr("y", radius + 10)
        .attr("width", 120)
        .attr("height", 24)
        .attr("rx", 12)
        .attr("ry", 12)
        .style("fill", "#38b2ac");
    
    svg.append("text")
        .attr("x", 0)
        .attr("y", radius + 26)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("Common Branches");
    
    // Add branch names to the diagram
    // Main only branches
    let mainOnlyY = 40;
    branchData.mainOnly.forEach((branch, i) => {
        svg.append("text")
            .attr("x", -offset)
            .attr("y", mainOnlyY + i * 20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#2d3748")
            .text(branch.split('/')[1]);
    });
    
    // Release only branches
    let releaseOnlyY = 40;
    branchData.releaseOnly.forEach((branch, i) => {
        svg.append("text")
            .attr("x", offset)
            .attr("y", releaseOnlyY + i * 20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#2d3748")
            .text(branch.split('/')[1]);
    });
    
    // Common branches
    let commonY = -50;
    branchData.common.forEach((branch, i) => {
        svg.append("text")
            .attr("x", 0)
            .attr("y", commonY + i * 20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#2d3748")
            .text(branch.split('/')[1]);
    });
    
    // Add hover effects
    mainCircle.on("mouseover", function() {
        d3.select(this)
            .transition()
            .duration(300)
            .style("fill-opacity", 0.9)
            .attr("r", radius * 1.05);
            
        // Highlight main branch items
        document.querySelectorAll('#main-branches li, #main-only li').forEach(item => {
            item.classList.add('highlight');
        });
    }).on("mouseout", function() {
        d3.select(this)
            .transition()
            .duration(300)
            .style("fill-opacity", 0.7)
            .attr("r", radius);
            
        // Remove highlight from main branch items
        document.querySelectorAll('#main-branches li, #main-only li').forEach(item => {
            item.classList.remove('highlight');
        });
    });
    
    releaseCircle.on("mouseover", function() {
        d3.select(this)
            .transition()
            .duration(300)
            .style("fill-opacity", 0.9)
            .attr("r", radius * 1.05);
            
        // Highlight release branch items
        document.querySelectorAll('#release-branches li, #release-only li').forEach(item => {
            item.classList.add('highlight');
        });
    }).on("mouseout", function() {
        d3.select(this)
            .transition()
            .duration(300)
            .style("fill-opacity", 0.7)
            .attr("r", radius);
            
        // Remove highlight from release branch items
        document.querySelectorAll('#release-branches li, #release-only li').forEach(item => {
            item.classList.remove('highlight');
        });
    });
    
    // Add statistics to the visualization
    if (branchData.stats) {
        const stats = branchData.stats;
        
        // Add percentage labels
        svg.append("text")
            .attr("x", -offset)
            .attr("y", -radius - 50)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#4a5568")
            .text(`${stats.main_only_percentage}% of total`);
            
        svg.append("text")
            .attr("x", offset)
            .attr("y", -radius - 50)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#4a5568")
            .text(`${stats.release_only_percentage}% of total`);
            
        svg.append("text")
            .attr("x", 0)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#4a5568")
            .text(`${stats.common_percentage}% of total`);
    }
}

// Update branch lists in the UI
async function updateBranchLists() {
    const branchData = await loadBranchData();
    
    // Update main branches list
    const mainBranchesList = document.getElementById('main-branches');
    mainBranchesList.innerHTML = '';
    branchData.main.forEach(branch => {
        const li = document.createElement('li');
        li.textContent = branch;
        mainBranchesList.appendChild(li);
    });
    
    // Update release branches list
    const releaseBranchesList = document.getElementById('release-branches');
    releaseBranchesList.innerHTML = '';
    branchData.release.forEach(branch => {
        const li = document.createElement('li');
        li.textContent = branch;
        releaseBranchesList.appendChild(li);
    });
    
    // Update main only branches list
    const mainOnlyList = document.getElementById('main-only');
    mainOnlyList.innerHTML = '';
    branchData.mainOnly.forEach(branch => {
        const li = document.createElement('li');
        li.textContent = branch;
        mainOnlyList.appendChild(li);
    });
    
    // Update release only branches list
    const releaseOnlyList = document.getElementById('release-only');
    releaseOnlyList.innerHTML = '';
    branchData.releaseOnly.forEach(branch => {
        const li = document.createElement('li');
        li.textContent = branch;
        releaseOnlyList.appendChild(li);
    });
    
    // Update common branches list
    const commonBranchesList = document.getElementById('common-branches');
    commonBranchesList.innerHTML = '';
    branchData.common.forEach(branch => {
        const li = document.createElement('li');
        li.textContent = branch;
        commonBranchesList.appendChild(li);
    });
}

// Add repository information section
function addRepositoryInfo() {
    loadBranchData().then(data => {
        if (data.stats && data.stats.repository) {
            const repoInfo = document.createElement('section');
            repoInfo.className = 'repository-info';
            
            const timestamp = data.stats.timestamp ? new Date(data.stats.timestamp).toLocaleString() : 'Unknown';
            
            repoInfo.innerHTML = `
                <h2>Repository Information</h2>
                <div class="repo-details">
                    <div class="repo-detail-item">
                        <h3>Repository</h3>
                        <p>${data.stats.repository}</p>
                    </div>
                    <div class="repo-detail-item">
                        <h3>Last Updated</h3>
                        <p>${timestamp}</p>
                    </div>
                    <div class="repo-detail-item">
                        <h3>Total Branches</h3>
                        <p>${data.stats.total_branches}</p>
                    </div>
                </div>
            `;
            
            // Insert after the overview section
            const overviewSection = document.querySelector('.overview');
            overviewSection.parentNode.insertBefore(repoInfo, overviewSection.nextSibling);
        }
    });
}

// Add event listeners for interactive features
function addInteractiveFeatures() {
    // Add hover effects for branch items
    const branchItems = document.querySelectorAll('li');
    branchItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        item.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
        
        // Add click event to show branch details
        item.addEventListener('click', function() {
            const branchName = this.textContent.trim();
            showBranchDetails(branchName);
        });
    });
    
    // Highlight related items when hovering over a branch
    const mainBranches = document.querySelectorAll('#main-branches li');
    const releaseBranches = document.querySelectorAll('#release-branches li');
    const commonBranches = document.querySelectorAll('#common-branches li');
    const mainOnlyBranches = document.querySelectorAll('#main-only li');
    const releaseOnlyBranches = document.querySelectorAll('#release-only li');
    
    // Function to find matching elements
    function findMatchingElements(text) {
        const matches = [];
        document.querySelectorAll('li').forEach(li => {
            if (li.textContent.trim() === text) {
                matches.push(li);
            }
        });
        return matches;
    }
    
    // Add highlighting for all branch items
    document.querySelectorAll('li').forEach(item => {
        item.addEventListener('mouseenter', function() {
            const branchText = this.textContent.trim();
            const matchingElements = findMatchingElements(branchText);
            
            matchingElements.forEach(el => {
                if (el !== this) {
                    el.classList.add('related');
                }
            });
        });
        
        item.addEventListener('mouseleave', function() {
            const branchText = this.textContent.trim();
            const matchingElements = findMatchingElements(branchText);
            
            matchingElements.forEach(el => {
                if (el !== this) {
                    el.classList.remove('related');
                }
            });
        });
    });
    
    // Make the visualization responsive
    window.addEventListener('resize', function() {
        createVennDiagram();
    });
}

// Setup filter and search functionality
function setupFilterAndSearch() {
    // Create filter and search elements
    const overviewSection = document.querySelector('.overview');
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <div class="search-box">
            <input type="text" id="branch-search" placeholder="Search branches...">
            <button id="search-button">Search</button>
        </div>
        <div class="filter-options">
            <label><input type="checkbox" id="filter-main" checked> Main</label>
            <label><input type="checkbox" id="filter-release" checked> Release</label>
            <label><input type="checkbox" id="filter-common" checked> Common</label>
        </div>
    `;
    
    overviewSection.appendChild(filterContainer);
    
    // Add search functionality
    const searchInput = document.getElementById('branch-search');
    const searchButton = document.getElementById('search-button');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const allBranches = document.querySelectorAll('li');
        
        allBranches.forEach(branch => {
            const branchText = branch.textContent.toLowerCase();
            if (branchText.includes(searchTerm) || searchTerm === '') {
                branch.style.display = '';
            } else {
                branch.style.display = 'none';
            }
        });
    }
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Add filter functionality
    const filterMain = document.getElementById('filter-main');
    const filterRelease = document.getElementById('filter-release');
    const filterCommon = document.getElementById('filter-common');
    
    function applyFilters() {
        loadBranchData().then(branchData => {
            const showMain = filterMain.checked;
            const showRelease = filterRelease.checked;
            const showCommon = filterCommon.checked;
            
            // Main branches
            document.querySelectorAll('#main-branches li').forEach(item => {
                const isCommon = branchData.common.includes(item.textContent.trim());
                if ((showMain && !isCommon) || (showCommon && isCommon)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Release branches
            document.querySelectorAll('#release-branches li').forEach(item => {
                const isCommon = branchData.common.includes(item.textContent.trim());
                if ((showRelease && !isCommon) || (showCommon && isCommon)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Main only branches
            document.querySelectorAll('#main-only li').forEach(item => {
                item.style.display = showMain ? '' : 'none';
            });
            
            // Release only branches
            document.querySelectorAll('#release-only li').forEach(item => {
                item.style.display = showRelease ? '' : 'none';
            });
            
            // Common branches
            document.querySelectorAll('#common-branches li').forEach(item => {
                item.style.display = showCommon ? '' : 'none';
            });
        });
    }
    
    filterMain.addEventListener('change', applyFilters);
    filterRelease.addEventListener('change', applyFilters);
    filterCommon.addEventListener('change', applyFilters);
}

// Setup animations
function setupAnimations() {
    // Add animation class to sections
    document.querySelectorAll('section').forEach((section, index) => {
        section.classList.add('animate-section');
        section.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add animation to branch items
    document.querySelectorAll('li').forEach((item, index) => {
        item.classList.add('animate-item');
        item.style.animationDelay = `${0.5 + (index * 0.05)}s`;
    });
}

// Setup tooltips
function setupTooltips() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    
    // Add tooltips to branch items
    loadBranchData().then(branchData => {
        document.querySelectorAll('li').forEach(item => {
            item.addEventListener('mouseenter', function(e) {
                const branchName = this.textContent.trim();
                const branchType = getBranchType(branchName, branchData);
                
                tooltip.innerHTML = `
                    <div class="tooltip-title">${branchName}</div>
                    <div class="tooltip-content">
                        <div>Type: ${branchType}</div>
                        <div>ID: ${getBranchId(branchName)}</div>
                    </div>
                `;
                
                tooltip.style.display = 'block';
                positionTooltip(e);
            });
            
            item.addEventListener('mousemove', positionTooltip);
            
            item.addEventListener('mouseleave', function() {
                tooltip.style.display = 'none';
            });
        });
    });
    
    function positionTooltip(e) {
        const x = e.clientX + 10;
        const y = e.clientY + 10;
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }
    
    function getBranchType(branchName, branchData) {
        if (branchData.common.includes(branchName)) {
            return 'Common (in both main and release)';
        } else if (branchData.mainOnly.includes(branchName)) {
            return 'Main only';
        } else if (branchData.releaseOnly.includes(branchName)) {
            return 'Release only';
        }
        return 'Unknown';
    }
    
    function getBranchId(branchName) {
        const match = branchName.match(/\d+$/);
        return match ? match[0] : 'N/A';
    }
}

// Show branch details in a modal
function showBranchDetails(branchName) {
    loadBranchData().then(branchData => {
        // Check if modal already exists
        let modal = document.getElementById('branch-modal');
        
        if (!modal) {
            // Create modal
            modal = document.createElement('div');
            modal.id = 'branch-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h2 id="modal-title"></h2>
                    <div id="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add close button functionality
            const closeButton = modal.querySelector('.close-button');
            closeButton.addEventListener('click', function() {
                modal.style.display = 'none';
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Update modal content
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = branchName;
        
        // Determine branch type and details
        let branchType = '';
        let branchDetails = '';
        
        if (branchData.common.includes(branchName)) {
            branchType = 'Common Branch';
            branchDetails = `
                <p>This branch appears in both main and release branches.</p>
                <div class="branch-details-section">
                    <h3>Branch Information</h3>
                    <ul>
                        <li><strong>ID:</strong> ${branchName.split('-')[1] || 'N/A'}</li>
                        <li><strong>Type:</strong> ${branchName.split('/')[0] || 'N/A'}</li>
                        <li><strong>Feature:</strong> ${branchName.split('/')[1]?.split('-')[0] || 'N/A'}</li>
                    </ul>
                </div>
                <div class="branch-details-section">
                    <h3>Merge Status</h3>
                    <ul>
                        <li><strong>Merged to Main:</strong> Yes</li>
                        <li><strong>Merged to Release:</strong> Yes</li>
                    </ul>
                </div>
            `;
        } else if (branchData.mainOnly.includes(branchName)) {
            branchType = 'Main Only Branch';
            branchDetails = `
                <p>This branch appears only in the main branch.</p>
                <div class="branch-details-section">
                    <h3>Branch Information</h3>
                    <ul>
                        <li><strong>ID:</strong> ${branchName.split('-')[1] || 'N/A'}</li>
                        <li><strong>Type:</strong> ${branchName.split('/')[0] || 'N/A'}</li>
                        <li><strong>Feature:</strong> ${branchName.split('/')[1]?.split('-')[0] || 'N/A'}</li>
                    </ul>
                </div>
                <div class="branch-details-section">
                    <h3>Merge Status</h3>
                    <ul>
                        <li><strong>Merged to Main:</strong> Yes</li>
                        <li><strong>Merged to Release:</strong> No</li>
                    </ul>
                </div>
            `;
        } else if (branchData.releaseOnly.includes(branchName)) {
            branchType = 'Release Only Branch';
            branchDetails = `
                <p>This branch appears only in the release branch.</p>
                <div class="branch-details-section">
                    <h3>Branch Information</h3>
                    <ul>
                        <li><strong>ID:</strong> ${branchName.split('-')[1] || 'N/A'}</li>
                        <li><strong>Type:</strong> ${branchName.split('/')[0] || 'N/A'}</li>
                        <li><strong>Feature:</strong> ${branchName.split('/')[1]?.split('-')[0] || 'N/A'}</li>
                    </ul>
                </div>
                <div class="branch-details-section">
                    <h3>Merge Status</h3>
                    <ul>
                        <li><strong>Merged to Main:</strong> No</li>
                        <li><strong>Merged to Release:</strong> Yes</li>
                    </ul>
                </div>
            `;
        }
        
        modalBody.innerHTML = `
            <div class="branch-type">${branchType}</div>
            ${branchDetails}
        `;
        
        // Show modal
        modal.style.display = 'block';
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Load data and update UI
    await createVennDiagram();
    await updateBranchLists();
    
    // Add repository information
    addRepositoryInfo();
    
    // Setup interactive features
    addInteractiveFeatures();
    setupFilterAndSearch();
    setupAnimations();
    setupTooltips();
});