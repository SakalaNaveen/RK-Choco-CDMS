import React, { useEffect, useState } from "react";
import "./Products.css";

import {
  FaSearch,
  FaShoppingCart,
  FaInfoCircle
} from "react-icons/fa";

import dairyMilk from "../../assets/images/dairyMilk.png";
import kitkat from "../../assets/images/kitkat.png";
import fiveStar from "../../assets/images/fiveStar.png";
import munch from "../../assets/images/munch.png";
import oreo from "../../assets/images/oreo.png";
import milkybar from "../../assets/images/milkybar.png";
import perk from "../../assets/images/perk.png";

const API_URL = "https://rk-choco-cdms.onrender.com/api/products";
const BACKEND_URL = "https://rk-choco-cdms.onrender.com";
const imageMap = {
  dairymilk: dairyMilk,
  kitkat: kitkat,
  "5star": fiveStar,
  fivestar: fiveStar,
  munch: munch,
  oreo: oreo,
  milkybar: milkybar,
  perk: perk
};

const displayInfo = {
  "dairy milk": {
    id: 1,
    brand: "Cadbury",
    name: "Cadbury Dairy Milk"
  },
  kitkat: {
    id: 2,
    brand: "KitKat",
    name: "Nestlé KitKat"
  },
  "5 star": {
    id: 3,
    brand: "5 Star",
    name: "Cadbury 5 Star"
  },
  munch: {
    id: 4,
    brand: "Munch",
    name: "Nestlé Munch"
  },
  oreo: {
    id: 5,
    brand: "Oreo",
    name: "OREO Chocolate"
  },
  milkybar: {
    id: 6,
    brand: "Milkybar",
    name: "Nestlé Milkybar"
  },
  perk: {
    id: 7,
    brand: "Perk",
    name: "Cadbury Perk"
  }
};

function getProductImage(item) {
  const savedImage = String(
    item.image || item.imageUrl || ""
  ).trim();

  // Admin upload చేసిన image path
  if (savedImage.startsWith("http://") ||
      savedImage.startsWith("https://")) {
    return savedImage;
  }

  if (savedImage.startsWith("/")) {
    return `${BACKEND_URL}${savedImage}`;
  }

  // Existing product image filenames
  const imageName = savedImage
    .split("/")
    .pop()
    .replace(/\.(png|jpg|jpeg|webp|gif)$/i, "")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (imageName && imageMap[imageName]) {
    return imageMap[imageName];
  }

  // Existing product names ఆధారంగా image
  const productName = String(item.name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (imageMap[productName]) {
    return imageMap[productName];
  }

  return dairyMilk;
}

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [quantities, setQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(API_URL, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Unable to connect to the products API.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid products data received from server.");
        }

        const mappedProducts = data.products.map((item) => {
          const key = String(item.name || "")
            .trim()
            .toLowerCase();

          const info = displayInfo[key] || {
            id: String(item._id),
            brand: item.brand || "Chocolate",
            name: item.name || "Chocolate"
          };

          return {
            ...item,
            id: info.id,
            mongoId: String(item._id),
            brand: info.brand,
            name: info.name,
            image: getProductImage(item),
            price: Number(item.price) || 0,
            stock: Math.max(0, Number(item.stock) || 0),
            description: item.description || "",
            unit: item.unit || "1 Box = 10 Pieces"
          };
        });

        if (!isMounted) return;

        setProducts(mappedProducts);

        const params = new URLSearchParams(window.location.search);
        const requested = params.get("product");

        if (requested) {
          const search = requested.toLowerCase();

          const matchedProduct = mappedProducts.find((product) =>
            product.brand.toLowerCase() === search ||
            product.name.toLowerCase() === search ||
            product.mongoId === requested
          );

          if (matchedProduct) {
            setSelectedProduct(matchedProduct);
          }
        }
      } catch (error) {
        console.error("Load customer products error:", error);

        if (isMounted) {
          setErrorMessage(
            "Products could not be loaded. Please make sure the backend is running."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const getQuantity = (productId) => {
    return quantities[productId] || 1;
  };

  const increaseQuantity = (productId) => {
    const product = products.find(
      (item) => String(item.id) === String(productId)
    );

    if (!product) return;

    setQuantities((previous) => {
      const current = previous[productId] || 1;

      if (current >= product.stock) {
        return previous;
      }

      return {
        ...previous,
        [productId]: current + 1
      };
    });
  };

  const decreaseQuantity = (productId) => {
    setQuantities((previous) => {
      const current = previous[productId] || 1;

      if (current <= 1) {
        return previous;
      }

      return {
        ...previous,
        [productId]: current - 1
      };
    });
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      window.alert("This product is currently out of stock.");
      return;
    }

    const quantityToAdd = getQuantity(product.id);

    if (quantityToAdd > product.stock) {
      window.alert("Selected quantity exceeds available stock.");
      return;
    }

    let existingCart = [];

    try {
      const saved = localStorage.getItem("rkChocoCart");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          existingCart = parsed;
        } else if (parsed && typeof parsed === "object") {
          existingCart = Object.values(parsed);
        }
      }
    } catch {
      existingCart = [];
    }

    const existingIndex = existingCart.findIndex(
      (item) => Number(item.id) === Number(product.id)
    );

    if (existingIndex >= 0) {
      const existingQuantity = Number(
        existingCart[existingIndex].quantity || 0
      );

      if (existingQuantity + quantityToAdd > product.stock) {
        window.alert(
          `Only ${product.stock} boxes are available for ${product.name}.`
        );
        return;
      }

      existingCart[existingIndex] = {
        ...existingCart[existingIndex],
        ...product,
        quantity: existingQuantity + quantityToAdd
      };
    } else {
      existingCart.push({
        ...product,
        quantity: quantityToAdd
      });
    }

    localStorage.setItem(
      "rkChocoCart",
      JSON.stringify(existingCart)
    );

    window.location.href = "/cart";
  };

  const filteredProducts = products.filter((product) => {
    const search = searchText.toLowerCase().trim();

    return (
      product.name.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search)
    );
  });

  return (
    <div className="products-page">
      <section className="products-header">
        <span className="products-small-title">
          OUR PRODUCTS
        </span>

        <h1>Chocolate Products</h1>

        <p>
          Choose from our wide collection of trusted chocolate brands.
        </p>
      </section>

      <section className="product-tools">
        <div className="search-box">
          <FaSearch />

          <input
            type="text"
            placeholder="Search chocolates..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </section>

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "35px 20px",
            color: "#6b5c45",
            fontWeight: 700
          }}
        >
          Loading products...
        </div>
      )}

      {!loading && errorMessage && (
        <div
          role="alert"
          style={{
            textAlign: "center",
            padding: "35px 20px",
            color: "#b42318",
            fontWeight: 700
          }}
        >
          {errorMessage}

          <div style={{ marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                background: "#6b2d1c",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !errorMessage && (
        <>
          <div className="product-count">
            Showing <strong>{filteredProducts.length}</strong> products
          </div>

          <section className="product-grid">
            {filteredProducts.map((product) => {
              const quantity = getQuantity(product.id);
              const productTotal = product.price * quantity;

              return (
                <div className="product-card" key={product.mongoId}>
                  <div className="product-image-box">
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = dairyMilk;
                      }}
                    />
                  </div>

                  <div className="product-content">
                    <span className="product-brand">
                      {product.brand}
                    </span>

                    <h2>{product.name}</h2>

                    <p>{product.description}</p>

                    <div className="product-price">
                      ₹{product.price}
                      <span>/ Box</span>
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        color: "#6b5c45",
                        fontWeight: 700,
                        fontSize: "14px"
                      }}
                    >
                      📦 {product.unit}
                    </div>

                    <div
                      style={{
                        marginTop: "6px",
                        color: product.stock > 0 ? "#218c4d" : "#b42318",
                        fontWeight: 800,
                        fontSize: "14px"
                      }}
                    >
                      📦 Stock: {product.stock}
                    </div>

                    <div className="quantity-section">
                      <span>Quantity</span>

                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(product.id)}
                          disabled={quantity <= 1}
                        >
                          −
                        </button>

                        <strong>{quantity}</strong>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(product.id)}
                          disabled={
                            quantity >= product.stock ||
                            product.stock <= 0
                          }
                        >
                          +
                        </button>

                        <span className="boxes-text">Boxes</span>
                      </div>
                    </div>

                    <div className="product-total">
                      <span>Total</span>
                      <strong>₹{productTotal}</strong>
                    </div>

                    <div className="product-buttons">
                      <button
                        type="button"
                        className="details-button"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <FaInfoCircle />
                        Details
                      </button>

                      <button
                        type="button"
                        className="add-cart-button"
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        <FaShoppingCart />
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {filteredProducts.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "#6b5c45",
                fontSize: "18px",
                fontWeight: 700
              }}
            >
              No chocolates found.
            </div>
          )}
        </>
      )}

      {selectedProduct && (
        <div
          className="product-popup-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="popup-close"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = dairyMilk;
              }}
            />

            <span>{selectedProduct.brand}</span>

            <h2>{selectedProduct.name}</h2>

            <p>{selectedProduct.description}</p>

            <div className="popup-price">
              ₹{selectedProduct.price} / Box
            </div>

            <div className="popup-box-info">
              📦 {selectedProduct.unit}
            </div>

            <div
              style={{
                marginTop: "10px",
                color: selectedProduct.stock > 0 ? "#218c4d" : "#b42318",
                fontWeight: 800
              }}
            >
              📦 Stock: {selectedProduct.stock}
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >
              <strong>Quantity</strong>

              <button
                type="button"
                onClick={() => decreaseQuantity(selectedProduct.id)}
                disabled={getQuantity(selectedProduct.id) <= 1}
                style={{
                  width: "38px",
                  height: "38px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#f1e1c8",
                  color: "#6b2d1c",
                  fontSize: "22px",
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                −
              </button>

              <strong
                style={{
                  minWidth: "35px",
                  textAlign: "center",
                  fontSize: "18px"
                }}
              >
                {getQuantity(selectedProduct.id)}
              </strong>

              <button
                type="button"
                onClick={() => increaseQuantity(selectedProduct.id)}
                disabled={
                  getQuantity(selectedProduct.id) >= selectedProduct.stock ||
                  selectedProduct.stock <= 0
                }
                style={{
                  width: "38px",
                  height: "38px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#f1e1c8",
                  color: "#6b2d1c",
                  fontSize: "22px",
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                +
              </button>
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "12px 15px",
                borderRadius: "10px",
                background: "#fff7e8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "17px"
              }}
            >
              <strong>Total</strong>

              <strong
                style={{
                  color: "#c96a00",
                  fontSize: "21px"
                }}
              >
                ₹
                {Number(selectedProduct.price || 0) *
                  Number(getQuantity(selectedProduct.id) || 1)}
              </strong>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "18px"
              }}
            >
              <button
                type="button"
                onClick={() => {}}
                style={{
                  border: "1px solid #159dcc",
                  background: "#ffffff",
                  color: "#087ca8",
                  borderRadius: "10px",
                  padding: "13px",
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                <FaInfoCircle /> Details
              </button>

              <button
                type="button"
                onClick={() => addToCart(selectedProduct)}
                disabled={selectedProduct.stock <= 0}
                style={{
                  border: "none",
                  background: "linear-gradient(135deg,#159dcc,#087ca8)",
                  color: "#ffffff",
                  borderRadius: "10px",
                  padding: "13px",
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;