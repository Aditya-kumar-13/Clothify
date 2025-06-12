import React, { useState, useRef, useEffect } from "react";
import "../css/Home.css";

const Home = () => {
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [avatarMode, setAvatarMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stats, setStats] = useState({
    recommendations: 0,
    categories: {},
    priceRange: [0, 0],
    caption: ""
    });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setSelectedFile(file);
      setProducts([]);
    }
  };

  const handleRecommend = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setProducts([]);
    setStats({
        recommendations: 0,
        categories: {},
        priceRange: [0, 0],
        caption: "",
    });

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
        const captionResponse = await fetch("http://localhost:5000/recommend", {
        method: "POST",
        body: formData,
        });

        if (!captionResponse.ok) throw new Error("Caption API failed.");

        const { caption } = await captionResponse.json();
        console.log("Caption:", caption);
        setStats((prev) => ({ ...prev, caption }));

        const scrapeResponse = await fetch(
        `http://localhost:5000/scrape?query=${encodeURIComponent(caption)}`
        );

        if (!scrapeResponse.ok) throw new Error("Scrape API failed.");

        const { products: fetchedProducts } = await scrapeResponse.json();

        setProducts(fetchedProducts);

        const categories = {};
        let minPrice = Infinity;
        let maxPrice = 0;

        fetchedProducts.forEach((product) => {
        categories[product.category] = (categories[product.category] || 0) + 1;
        const price = parseFloat(product.price.replace(/[^0-9.]/g, ""));
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
        });

        setStats({
        recommendations: fetchedProducts.length,
        categories,
        priceRange: [minPrice || 0, maxPrice || 0],
        caption,
        });
    } catch (error) {
        console.error("Error during recommendation:", error.message);
        alert("Failed to generate recommendations. Please try again.");
    }

    setLoading(false);
    };



  const drawAvatar = (product, isAccessory = false) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const avatarImg = new Image();
    avatarImg.src = "/avatar.png";

    avatarImg.onload = () => {
      ctx.drawImage(avatarImg, 50, 50, 100, 200);
      const productImg = new Image();
      productImg.crossOrigin = "anonymous";
      productImg.src = product.image;

      productImg.onload = () => {
        if (isAccessory) {
          ctx.drawImage(productImg, 90, 70, 40, 40);
        } else {
          ctx.drawImage(productImg, 70, 100, 60, 80);
        }
      };
    };
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const categories = [...new Set(products.map(product => product.category))];

  return (
    <div className="app-container">
      {/* <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <h1 className="app-title">Clothify<span className="ai-badge">AI</span></h1>
          </div> */}
          {/* <nav className="nav-links">
            <button className="nav-button active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Dashboard</span>
            </button>
            <button className="nav-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Discover</span>
            </button>
            <button className="nav-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Profile</span>
            </button>
          </nav> */}
          {/* <div className="user-profile">
            <div className="avatar">JD</div>
          </div>
        </div>
      </header> */}

      <main className="app-content">
        <div className="dashboard-grid">
          {!image ? (
            <div className="upload-card-container">
              <div className="upload-card">
                <div className="upload-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <h2>Upload Your Outfit</h2>
                <p>Get AI-powered fashion recommendations tailored to your style</p>
                <button className="primary-button" onClick={triggerFileInput}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Choose Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="analytics-section">
                <div className="analytics-card">
                  <h3>Style Analysis</h3>
                  {stats.caption && (
                    <div className="caption-preview">
                        <strong>Detected Style:</strong> <em>{stats.caption}</em>
                    </div>
                    )}

                  <div className="analytics-content">
                    <img src={image} alt="Uploaded" className="analysis-image" />
                    <div className="stats-container">
                      <div className="stat-item">
                        <div className="stat-value">{stats.recommendations}</div>
                        <div className="stat-label">Recommendations</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">${stats.priceRange[0]} - ${stats.priceRange[1]}</div>
                        <div className="stat-label">Price Range</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{Object.keys(stats.categories).length}</div>
                        <div className="stat-label">Categories</div>
                      </div>
                    </div>
                  </div>
                  <div className="action-buttons">
                    {!loading && !products.length && (
                      <button className="primary-button" onClick={handleRecommend}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                        Generate Recommendations
                      </button>
                    )}
                    <button className="secondary-button" onClick={() => {
                      setImage(null);
                      setSelectedFile(null);
                      setProducts([]);
                      setAvatarMode(false);
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Clear Image
                    </button>
                  </div>
                </div>

                {avatarMode && (
                  <div className="avatar-card">
                    <h3>Virtual Try-On</h3>
                    <div className="avatar-content">
                      <canvas 
                        ref={canvasRef}
                        width="200" 
                        height="300" 
                        className="avatar-canvas" 
                      />
                      <div className="avatar-controls">
                        <button className="secondary-button" onClick={clearCanvas}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          Clear
                        </button>
                        <p className="avatar-hint">Click "Try On" on any product below</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="recommendations-section">
                <div className="section-header">
                  <h2>Recommended Products</h2>
                  <div className="category-filter">
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Analyzing your style and generating recommendations...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="products-grid">
                    {filteredProducts.map((product, index) => (
                      <div className="product-card" key={index}>
                        <div className="product-image-container">
                          <img src={product.image} alt={product.name} className="product-image" />
                          <div className="product-overlay">
                            <button
                              className="try-on-button"
                              onClick={() =>
                                drawAvatar(product, product.category === "Accessories")
                              }
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                              </svg>
                              Try On
                            </button>
                            <button className="wishlist-button">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="product-info">
                          <h4>{product.name}</h4>
                          <div className="product-meta">
                            <span className="product-category">{product.category}</span>
                            <span className="product-price">{product.price}</span>
                          </div>
                          <div className="product-actions">
                            <button className="action-button">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                              </svg>
                              Details
                            </button>
                            <button className="action-button primary">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                              </svg>
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3>No recommendations found</h3>
                    <p>Try uploading a different image or check back later</p>
                    <button className="secondary-button" onClick={() => setImage(null)}>
                      Upload New Image
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;