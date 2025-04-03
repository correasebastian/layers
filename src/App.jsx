import React from 'react';
// Import the new component
import ImageWithAnnotationsGrid from './ImageWithAnnotationsGrid';
// Make sure the image path is correct
import "./index.css"

function App() {
  return (
    <div className="App">
      <h1>Product Details (Grid Layout)</h1>
      <ImageWithAnnotationsGrid
        imageUrl={"https://res.cloudinary.com/dcgdzm4ai/image/upload/v1743702712/lines/sofa-lines_skb2b5.png"}
        altText="Comfortable beige sofa with feature annotations (Grid Layout)"
      />
    </div>
  );
}

export default App;