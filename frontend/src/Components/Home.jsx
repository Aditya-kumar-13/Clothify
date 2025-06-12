import React, { useState, useRef } from "react";
import "../css/Home.css";

const Home = () => {
    
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef(null);
    const apiUrl = import.meta.env.VITE_API_URL;
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setSelectedFile(file);
      setProducts([]);
      setCaption("");
      setRecommendationCount(0);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleRecommend = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setProducts([]);
    setCaption("");
    setRecommendationCount(0);
    setStatusMessage("Analyzing your style...");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const captionRes = await fetch(`${apiUrl}/recommend`, {
        method: "POST",
        body: formData,
      });

      if (!captionRes.ok) throw new Error("Caption API failed.");
      const { caption } = await captionRes.json();
      setCaption(caption);
      setStatusMessage(`Style detected: "${caption}". Searching for products...`);

      const scrapeRes = await fetch(`${apiUrl}/scrape?query=${encodeURIComponent(caption)}`);
      if (!scrapeRes.ok) throw new Error("Scrape API failed.");
      const { products: fetchedProducts } = await scrapeRes.json();

      setProducts(fetchedProducts);
      setRecommendationCount(fetchedProducts.length);
      setStatusMessage("");
    } catch (error) {
      console.error("Error during recommendation:", error.message);
      setStatusMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Clothify</h1>
        <p>AI-Powered Fashion Detection & Recommendations</p>
      </header>

      <main className="dashboard-main">
        {!image ? (
          <div className="upload-section">
            <div className="upload-card">
              <h2>Upload Your Outfit</h2>
              <p>Let AI analyze and recommend matching products</p>
              <button className="upload-button" onClick={triggerFileInput}>
                Choose Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
          </div>
        ) : (
          <div className="results-container">
            <div className="analysis-section">
              <div className="analysis-card">
                <div className="image-container">
                  <img src={image} alt="Uploaded" className="uploaded-image" />
                </div>
                <div className="style-info">
                  {caption && <p className="style-caption"><strong>Detected Style:</strong> {caption}</p>}
                  <p className="recommendation-count">{recommendationCount} Recommendations</p>
                </div>
                <div className="action-buttons">
                  {!loading && !products.length && (
                    <button className="primary-button" onClick={handleRecommend}>
                      Generate Recommendations
                    </button>
                  )}
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setImage(null);
                      setSelectedFile(null);
                      setProducts([]);
                      setCaption("");
                      setRecommendationCount(0);
                    }}
                  >
                    Clear Image
                  </button>
                </div>
              </div>
            </div>

            <div className="recommendations-section">
              <h2>Recommended Products</h2>
              
              {statusMessage && <div className="status-message">{statusMessage}</div>}

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Working on your style...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="recommendations-grid">
                  {['Myntra','Amazon'].map((source) => {
                    const sourceProducts = products.filter((p) => p.source === source);
                    if (sourceProducts.length === 0) return null;

                    return (
                      <div key={source} className="source-section">
                        <h3 className="source-title">{source}</h3>
                        <div className="products-scroll-container">
                          <div className="products-grid">
                            {sourceProducts.map((product, index) => (
                              <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="product-card-link"
                                key={index}
                              >
                                <div className="product-card">
                                  <div className="product-image-container">
                                    <img
                                      src={product.image}
                                      alt={product.title || 'Product'}
                                      className="product-image"
                                    />
                                  </div>
                                  <div className="product-info">
                                    <h4 className="product-title">
                                      {product.title.length > 40
                                        ? product.title.slice(0, 40) + '...'
                                        : product.title}
                                    </h4>
                                    <div className="product-meta">
                                      <span className="product-price">Rs{product.price}</span>
                                    </div>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No recommendations found</h3>
                  <p>Try another image or style.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;