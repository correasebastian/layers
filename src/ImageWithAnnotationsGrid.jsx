import React from 'react';
// import './ImageWithAnnotationsGrid.css'; // Using a new CSS file for clarity

// Data remains the same - coordinates are relative to the overlay/image area
const defaultFeatures = [
  {
    id: 'seat-height',
    line: { top: '12%', left: '15%', width: '10%', height: '1px' },
    text: { top: '8%', left: '15%', content: 'SEAT HEIGHT\nLorem ipsum dolor sit amet...' }
  },
  {
    id: 'seat-comfort',
    line: { top: '12%', left: '45%', width: '10%', height: '1px' },
    text: { top: '8%', left: '45%', content: 'SEAT COMFORT\nFind the soft supportive fit...' }
  },
  {
    id: 'seat-depth',
    line: { top: '12%', left: '75%', width: '10%', height: '1px' },
    text: { top: '8%', left: '75%', content: 'SEAT DEPTH\nClassic 303C medium seat depth...' }
  },
  {
    id: 'bottom-left',
    line: { top: '82%', left: '26.5%', width: '2px', height: '8%',  origin: '0 0' },
    text: { top: '86%', left: '27.5%', content: 'Lower Feature\nDetails here...' }
  },
   {
    id: 'arm-rest',
    line: { top: '20%', left: '80.5%', width: '2px', height: '20%',  origin: '0 0' },
    text: { top: '20%', left: '81.5%', content: 'Armrest Detail\nFSC Certified Wood...' }
  },
   {
    id: 'ky-rest',
    line: { top: '20%', left: '8%', width: '2px', height: '33%',  origin: '0 0' },
    text: { top: '20%', left: '9%', content: 'Armrest Detail\nFSC Certified Wood...' }
  }
  // top: 20%;
  //   left: 8%;
  //   width: 2px;
  //   height: 33%;
  //   /* transform: rotate(-90deg); */
  //   transform-origin: 0px 0px;
];

const ImageWithAnnotationsGrid = ({ imageUrl, features = defaultFeatures, altText = "Annotated product" }) => {
  return (
    // The container is now a Grid parent
    <div className="annotation-container-grid">
      {/* Layer 1: Background Image - Placed in the grid */}
      <img
        src={imageUrl}
        alt={altText}
        className="background-image-grid"
      />

      {/* Layer 2 & 3: Annotations Overlay - Placed in the SAME grid cell */}
      {/* This overlay needs position: relative for its children */}
      <div className="annotations-overlay-grid">
        {features.map(feature => (
          // Annotations (lines/text) are still absolutely positioned *within* the overlay
          <React.Fragment key={feature.id}>
            {/* Layer 2: Line */}
            <div
              className="annotation-line" // Re-use previous style name or create new
              style={{
                top: feature.line.top,
                left: feature.line.left,
                width: feature.line.width,
                height: feature.line.height,
                transform: feature.line.rotate ? `rotate(${feature.line.rotate}deg)` : 'none',
                transformOrigin: feature.line.origin
              }}
            />
            {/* Layer 3: Text */}
            <div
              className="annotation-text" // Re-use previous style name or create new
              style={{
                top: feature.text.top,
                left: feature.text.left,
              }}
            >
              {feature.text.content.split('\n').map((line, index) => (
                <span key={index} className={index === 0 ? 'title' : 'description'}>
                  {line}
                </span>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ImageWithAnnotationsGrid;