// Timeline visualization component for branch history
function createTimelineVisualization() {
  const historyChartContainer = document.getElementById('history-chart');
  
  // Clear any existing content
  historyChartContainer.innerHTML = '';
  
  // If no dates available, show message
  if (availableDates.length <= 1) {
    historyChartContainer.innerHTML = '<p class="no-data-message">Not enough historical data available to create a timeline. Run analysis for multiple dates to see branch evolution over time.</p>';
    return;
  }
  
  // Create SVG container for timeline
  const margin = {top: 40, right: 30, bottom: 50, left: 50};
  const width = historyChartContainer.clientWidth - margin.left - margin.right;
  const height = 250 - margin.top - margin.bottom;
  
  const svg = d3.select("#history-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Filter out 'latest' and convert dates to Date objects
  const dateObjects = availableDates
    .filter(d => d !== 'latest')
    .map(d => ({date: new Date(d), dateStr: d}))
    .sort((a, b) => a.date - b.date);
  
  // If less than 2 dates, show message
  if (dateObjects.length < 2) {
    historyChartContainer.innerHTML = '<p class="no-data-message">Not enough historical data available to create a timeline. Run analysis for multiple dates to see branch evolution over time.</p>';
    return;
  }
  
  // Load data for each date
  Promise.all(dateObjects.map(d => loadBranchData(d.dateStr)))
    .then(results => {
      // Prepare data for visualization
      const timelineData = results.map((data, i) => ({
        date: dateObjects[i].date,
        dateStr: dateObjects[i].dateStr,
        mainCount: data.stats.main_count,
        releaseCount: data.stats.release_count,
        commonCount: data.stats.common_count
      }));
      
      // Create scales
      const xScale = d3.scaleTime()
        .domain(d3.extent(timelineData, d => d.date))
        .range([0, width]);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(timelineData, d => Math.max(d.mainCount, d.releaseCount))])
        .nice()
        .range([height, 0]);
      
      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%b %d")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");
      
      // Add Y axis
      svg.append("g")
        .call(d3.axisLeft(yScale));
      
      // Add X axis label
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .text("Date");
      
      // Add Y axis label
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .text("Branch Count");
      
      // Add title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Branch Evolution Over Time");
      
      // Create line generators
      const mainLine = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.mainCount))
        .curve(d3.curveMonotoneX);
      
      const releaseLine = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.releaseCount))
        .curve(d3.curveMonotoneX);
      
      const commonLine = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.commonCount))
        .curve(d3.curveMonotoneX);
      
      // Add the lines
      svg.append("path")
        .datum(timelineData)
        .attr("fill", "none")
        .attr("stroke", "#3182ce")
        .attr("stroke-width", 2)
        .attr("d", mainLine);
      
      svg.append("path")
        .datum(timelineData)
        .attr("fill", "none")
        .attr("stroke", "#dd6b20")
        .attr("stroke-width", 2)
        .attr("d", releaseLine);
      
      svg.append("path")
        .datum(timelineData)
        .attr("fill", "none")
        .attr("stroke", "#38b2ac")
        .attr("stroke-width", 2)
        .attr("d", commonLine);
      
      // Add dots for each data point
      svg.selectAll(".main-dot")
        .data(timelineData)
        .enter()
        .append("circle")
        .attr("class", "main-dot")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.mainCount))
        .attr("r", 5)
        .attr("fill", "#3182ce")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("r", 8);
          showTooltip(event, d, "main");
        })
        .on("mouseout", function() {
          d3.select(this).attr("r", 5);
          hideTooltip();
        })
        .on("click", function(event, d) {
          loadBranchData(d.dateStr).then(data => {
            createVennDiagram(data);
            updateBranchLists(data);
            addRepositoryInfo(data);
            updateCurrentDateDisplay(d.dateStr);
            
            // Update date picker to match selected date
            document.getElementById('analysis-date').value = d.dateStr;
            
            // Update active button in history dates
            document.querySelectorAll('.history-date-button').forEach(btn => {
              btn.classList.remove('active');
              if (btn.textContent === new Date(d.dateStr).toLocaleDateString()) {
                btn.classList.add('active');
              }
            });
          });
        });
      
      svg.selectAll(".release-dot")
        .data(timelineData)
        .enter()
        .append("circle")
        .attr("class", "release-dot")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.releaseCount))
        .attr("r", 5)
        .attr("fill", "#dd6b20")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("r", 8);
          showTooltip(event, d, "release");
        })
        .on("mouseout", function() {
          d3.select(this).attr("r", 5);
          hideTooltip();
        })
        .on("click", function(event, d) {
          loadBranchData(d.dateStr).then(data => {
            createVennDiagram(data);
            updateBranchLists(data);
            addRepositoryInfo(data);
            updateCurrentDateDisplay(d.dateStr);
            
            // Update date picker to match selected date
            document.getElementById('analysis-date').value = d.dateStr;
            
            // Update active button in history dates
            document.querySelectorAll('.history-date-button').forEach(btn => {
              btn.classList.remove('active');
              if (btn.textContent === new Date(d.dateStr).toLocaleDateString()) {
                btn.classList.add('active');
              }
            });
          });
        });
      
      svg.selectAll(".common-dot")
        .data(timelineData)
        .enter()
        .append("circle")
        .attr("class", "common-dot")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.commonCount))
        .attr("r", 5)
        .attr("fill", "#38b2ac")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("r", 8);
          showTooltip(event, d, "common");
        })
        .on("mouseout", function() {
          d3.select(this).attr("r", 5);
          hideTooltip();
        })
        .on("click", function(event, d) {
          loadBranchData(d.dateStr).then(data => {
            createVennDiagram(data);
            updateBranchLists(data);
            addRepositoryInfo(data);
            updateCurrentDateDisplay(d.dateStr);
            
            // Update date picker to match selected date
            document.getElementById('analysis-date').value = d.dateStr;
            
            // Update active button in history dates
            document.querySelectorAll('.history-date-button').forEach(btn => {
              btn.classList.remove('active');
              if (btn.textContent === new Date(d.dateStr).toLocaleDateString()) {
                btn.classList.add('active');
              }
            });
          });
        });
      
      // Add legend
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 120}, 0)`);
      
      // Main branch
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", "#3182ce");
      
      legend.append("text")
        .attr("x", 10)
        .attr("y", 5)
        .text("Main")
        .style("font-size", "12px");
      
      // Release branch
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 20)
        .attr("r", 5)
        .attr("fill", "#dd6b20");
      
      legend.append("text")
        .attr("x", 10)
        .attr("y", 25)
        .text("Release")
        .style("font-size", "12px");
      
      // Common branches
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 40)
        .attr("r", 5)
        .attr("fill", "#38b2ac");
      
      legend.append("text")
        .attr("x", 10)
        .attr("y", 45)
        .text("Common")
        .style("font-size", "12px");
      
      // Create tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "timeline-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("padding", "8px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
        .style("font-size", "12px")
        .style("pointer-events", "none");
      
      function showTooltip(event, d, type) {
        let content = `<strong>Date:</strong> ${d.date.toLocaleDateString()}<br>`;
        
        if (type === "main") {
          content += `<strong>Main branches:</strong> ${d.mainCount}`;
        } else if (type === "release") {
          content += `<strong>Release branches:</strong> ${d.releaseCount}`;
        } else if (type === "common") {
          content += `<strong>Common branches:</strong> ${d.commonCount}`;
        }
        
        tooltip
          .html(content)
          .style("visibility", "visible")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      }
      
      function hideTooltip() {
        tooltip.style("visibility", "hidden");
      }
    })
    .catch(error => {
      console.error("Error creating timeline:", error);
      historyChartContainer.innerHTML = `<p class="error-message">Error creating timeline: ${error.message}</p>`;
    });
}

// Update setupHistoryView function to include timeline creation
function setupHistoryView() {
  const showHistoryButton = document.getElementById('show-history-button');
  const historyDatesContainer = document.getElementById('history-dates');
  const historyChartContainer = document.getElementById('history-chart');
  
  // Initially hide the history dates and chart
  historyDatesContainer.style.display = 'none';
  historyChartContainer.style.display = 'none';
  
  // Toggle history visibility
  showHistoryButton.addEventListener('click', function() {
    if (historyDatesContainer.style.display === 'none') {
      historyDatesContainer.style.display = 'flex';
      historyChartContainer.style.display = 'block';
      showHistoryButton.textContent = 'Hide History';
      
      // Discover available dates and create timeline
      discoverAvailableDates().then(() => {
        createTimelineVisualization();
      });
    } else {
      historyDatesContainer.style.display = 'none';
      historyChartContainer.style.display = 'none';
      showHistoryButton.textContent = 'Show History';
    }
  });
}
