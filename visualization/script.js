// Global variables for date handling
let currentAnalysisDate = 'latest';
let availableDates = [];

// Load data from JSON file with date parameter
async function loadBranchData(date = null) {
    try {
        // Construct URL with date parameter if provided
        let url = 'analyzed_branch_data.json';
        if (date && date !== 'latest') {
            // Format date for filename (remove dashes)
            const dateStr = date.replace(/-/g, '');
            url = `analyzed_branch_data_${dateStr}.json`;
        }
        
        console.log(`Loading data from: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Update current date display
        updateCurrentDateDisplay(data.stats?.analysis_date || 'latest');
        
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
                release_only_percentage: 40.0,
                analysis_date: 'latest'
            }
        };
    }
}

// Update the current date display
function updateCurrentDateDisplay(date) {
    const currentDateElement = document.getElementById('current-date');
    currentAnalysisDate = date;
    
    if (date === 'latest') {
        currentDateElement.textContent = 'Latest';
    } else {
        // Format date for display (YYYY-MM-DD)
        const displayDate = new Date(date);
        currentDateElement.textContent = displayDate.toLocaleDateString();
    }
}

// Set up date picker functionality
function setupDatePicker() {
    const datePicker = document.getElementById('analysis-date');
    const updateButton = document.getElementById('update-date-button');
    
    // Set default date to today
    const today = new Date();
    datePicker.valueAsDate = today;
    
    // Load data for the selected date when button is clicked
    updateButton.addEventListener('click', async function() {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading';
        updateButton.appendChild(loadingIndicator);
        updateButton.disabled = true;
        
        try {
            const selectedDate = datePicker.value;
            const branchData = await loadBranchData(selectedDate);
            
            // Update visualization and lists
            createVennDiagram(branchData);
            updateBranchLists(branchData);
            
            // Add this date to available dates if not already there
            if (!availableDates.includes(selectedDate)) {
                availableDates.push(selectedDate);
                updateHistoryDates();
            }
        } catch (error) {
            console.error('Error updating data:', error);
            alert('Failed to load data for the selected date. Please try another date.');
        } finally {
            // Remove loading indicator
            updateButton.removeChild(loadingIndicator);
            updateButton.disabled = false;
        }
    });
}

// Create Venn Diagram visualization
async function createVennDiagram(branchData = null) {
    // Load data if not provided
    if (!branchData) {
        branchData = await loadBranchData();
    }
    
    // Update counts in the UI
    document.getElementById('main-count').textContent = branchData.stats.main_count;
    document.getElementById('release-count').textContent = branchData.stats.release_count;
    document.getElementById('common-count').textContent = branchData.stats.common_count;
    
    // Update repository name if available
    if (branchData.stats && branchData.stats.repository) {
        const repoName = branchData.stats.repository;
        document.querySelector('header p').textContent = `Visualizing differences between main and release branches in ${repoName}`;
    }
    
    // Update last updated timestamp
    if (branchData.stats && branchData.stats.timestamp) {
        const timestamp = new Date(branchData.stats.timestamp).toLocaleString();
        document.getElementById('last-updated').textContent = timestamp;
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
    
    // Add analysis date if available
    if (branchData.stats && branchData.stats.analysis_date && branchData.stats.analysis_date !== 'latest') {
        const analysisDate = new Date(branchData.stats.analysis_date).toLocaleDateString();
        
        svg.append("text")
            .attr("x", 0)
            .attr("y", -radius - 70)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#4a5568")
            .text(`Analysis Date: ${analysisDate}`);
    }
}

// Update branch lists in the UI
async function updateBranchLists(branchData = null) {
    // Load data if not provided
    if (!branchData) {
        branchData = await loadBranchData();
    }
    
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
    
    // Add event listeners to branch items
    addInteractiveFeatures();
}

// Add repository information section
function addRepositoryInfo(branchData = null) {
    // Use provided data or load it
    const dataPromise = branchData ? Promise.resolve(branchData) : loadBranchData();
    
    dataPromise.then(data => {
        if (data.stats && data.stats.repository) {
            // Check if repository info section already exists
            let repoInfo = document.querySelector('.repository-info');
            
            if (!repoInfo) {
                repoInfo = document.createElement('section');
                repoInfo.className = 'repository-info';
                
                // Insert after the overview section
                const overviewSection = document.querySelector('.overview');
                overviewSection.parentNode.insertBefore(repoInfo, overviewSection.nextSibling);
            }
            
            const timestamp = data.stats.timestamp ? new Date(data.stats.timestamp).toLocaleString() : 'Unknown';
            const analysisDate = data.stats.analysis_date && data.stats.analysis_date !== 'latest' 
                ? new Date(data.stats.analysis_date).toLocaleDateString() 
                : 'Latest';
            
            repoInfo.innerHTML = `
                <h2>Repository Information</h2>
                <div class="repo-details">
                    <div class="repo-detail-item">
                        <h3>Repository</h3>
                        <p>${data.stats.repository}</p>
                    </div>
                    <div class="repo-detail-item">
                        <h3>Analysis Date</h3>
                        <p>${analysisDate}</p>
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

// Setup history view functionality
function setupHistoryView() {
    const showHistoryButton = document.getElementById('show-history-button');
    const historyDatesContainer = document.getElementById('history-dates');
    const historyChartContainer = document.getElementById('history-chart');
    
    // Initially hide the history dates
    historyDatesContainer.style.display = 'none';
    
    // Toggle history dates visibility
    showHistoryButton.addEventListener('click', function() {
        if (historyDatesContainer.style.display === 'none') {
            historyDatesContainer.style.display = 'flex';
            showHistoryButton.textContent = 'Hide History';
            
            // Discover available dates
            discoverAvailableDates();
        } else {
            historyDatesContainer.style.display = 'none';
            showHistoryButton.textContent = 'Show History';
        }
    });
}

// Discover available date files
async function discoverAvailableDates() {
    const historyDatesContainer = document.getElementById('history-dates');
    historyDatesContainer.innerHTML = '<div class="loading"></div>';
    
    try {
        // In a real implementation, you would fetch a list of available dates from the server
        // For this demo, we'll simulate discovering dates by trying to load a few recent dates
        const today = new Date();
        const potentialDates = [];
        
        // Try the last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            potentialDates.push(date.toISOString().split('T')[0]);
        }
        
        // Add any dates we already know about
        availableDates.forEach(date => {
            if (!potentialDates.includes(date)) {
                potentialDates.push(date);
            }
        });
        
        // Clear existing dates
        availableDates = [];
        
        // Check each date
        const checkPromises = potentialDates.map(async date => {
            try {
                const dateStr = date.replace(/-/g, '');
                const url = `analyzed_branch_data_${dateStr}.json`;
                const response = await fetch(url, { method: 'HEAD' });
                
                if (response.ok) {
                    availableDates.push(date);
                }
            } catch (error) {
                // Ignore errors for files that don't exist
            }
        });
        
        await Promise.all(checkPromises);
        
        // Always add 'latest'
        if (!availableDates.includes('latest')) {
            availableDates.push('latest');
        }
        
        // Sort dates (latest first)
        availableDates.sort((a, b) => {
            if (a === 'latest') return -1;
            if (b === 'latest') return 1;
            return new Date(b) - new Date(a);
        });
        
        // Update the UI
        updateHistoryDates();
    } catch (error) {
        console.error('Error discovering dates:', error);
        historyDatesContainer.innerHTML = 'Failed to load history dates.';
    }
}

// Update history dates in the UI
function updateHistoryDates() {
    const historyDatesContainer = document.getElementById('history-dates');
    historyDatesContainer.innerHTML = '';
    
    if (availableDates.length === 0) {
        historyDatesContainer.innerHTML = 'No historical data available.';
        return;
    }
    
    availableDates.forEach(date => {
        const dateButton = document.createElement('button');
        dateButton.className = 'history-date-button';
        
        if (date === currentAnalysisDate) {
            dateButton.classList.add('active');
        }
        
        if (date === 'latest') {
            dateButton.textContent = 'Latest';
        } else {
            const displayDate = new Date(date);
            dateButton.textContent = displayDate.toLocaleDateString();
        }
        
        dateButton.addEventListener('click', async () => {
            try {
                // Update active button
                document.querySelectorAll('.history-date-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                dateButton.classList.add('active');
                
                // Load data for this date
                const branchData = await loadBranchData(date);
                
                // Update visualization and lists
                createVennDiagram(branchData);
                updateBranchLists(branchData);
                addRepositoryInfo(branchData);
                
                // Update date picker to match selected date
                if (date !== 'latest') {
                    document.getElementById('analysis-date').value = date;
                }
            } catch (error) {
                console.error('Error loading historical data:', error);
                alert('Failed to load data for the selected date.');
            }
        });
        
        historyDatesContainer.appendChild(dateButton);
    });
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
        
        // Add analysis date information
        let dateInfo = '';
        if (currentAnalysisDate && currentAnalysisDate !== 'latest') {
            const displayDate = new Date(currentAnalysisDate).toLocaleDateString();
            dateInfo = `<p class="date-info">Analysis as of: ${displayDate}</p>`;
        }
        
        modalBody.innerHTML = `
            <div class="branch-type">${branchType}</div>
            ${dateInfo}
            ${branchDetails}
        `;
        
        // Show modal
        modal.style.display = 'block';
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Set up date picker
    setupDatePicker();
    
    // Load data and update UI
    const branchData = await loadBranchData();
    await createVennDiagram(branchData);
    await updateBranchLists(branchData);
    
    // Add repository information
    addRepositoryInfo(branchData);
    
    // Setup interactive features
    addInteractiveFeatures();
    setupFilterAndSearch();
    setupHistoryView();
    
    // Make the visualization responsive
    window.addEventListener('resize', function() {
        createVennDiagram();
    });
});
