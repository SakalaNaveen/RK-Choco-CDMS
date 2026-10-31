import React, { useEffect, useState } from "react";
import "./App.css";

import {
  FaHome,
  FaBoxOpen,
  FaTags,
  FaClipboardList,
  FaUser,
  FaUserPlus,
  FaShoppingCart,
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTimesCircle,
  FaInfoCircle,
  FaTruck,
  FaShieldAlt,
  FaStore,
  FaShoppingBag
} from "react-icons/fa";

import heroChocolate from "./assets/images/heroChocolate.png";
import oreo from "./assets/images/oreo.png";
import dairyMilk from "./assets/images/dairyMilk.png";
import kitkat from "./assets/images/kitkat.png";
import fiveStar from "./assets/images/fiveStar.png";
import munch from "./assets/images/munch.png";
import milkybar from "./assets/images/milkybar.png";
import perk from "./assets/images/perk.png";

import Products from "./components/products/Products";

/* =========================================================
   STORAGE KEYS
========================================================= */

const CART_KEY = "rkChocoCart";
const ORDER_KEY = "rkChocoOrder";
const API_BASE = "https://rk-choco-cdms.onrender.com/api";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Unable to connect to RK Choco server.");
  }
  return result;
}

/* =========================================================
   STORAGE HELPERS
========================================================= */

const readCart = () => {
  try {
    const read = (storage) => {
      const raw = storage.getItem(CART_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Object.fromEntries(parsed.filter(Boolean).map((item) => [String(item.id), item]));
      }
      return parsed && typeof parsed === "object" ? parsed : {};
    };
    // Products.js and App.js historically used different storage types.
    // Merge both so adding another product never replaces the existing cart.
    const sessionCart = read(sessionStorage);
    const legacyCart = read(localStorage);
    const merged = { ...sessionCart, ...legacyCart };
    sessionStorage.setItem(CART_KEY, JSON.stringify(merged));
    localStorage.setItem(CART_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return {};
  }
};

const saveCart = (cart) => {
  const safeCart = cart && typeof cart === "object" ? cart : {};
  sessionStorage.setItem(CART_KEY, JSON.stringify(safeCart));
  // Keep legacy Products.js in sync until its own cart writer is updated.
  localStorage.setItem(CART_KEY, JSON.stringify(safeCart));
};

// Customer accounts and orders are stored in MongoDB through the API.
// Cart and the current page's order summary use sessionStorage only.

/* =========================================================
   DATE HELPERS
========================================================= */

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";

  return new Date(timestamp).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
};

const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";

  return new Date(timestamp).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }
  );
};

const getExpectedDelivery = (timestamp) => {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp);
  date.setDate(date.getDate() + 3);

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
};

const canCancelOrder = (order) => {
  if (!order) return false;

  if (order.status === "Order Cancelled") {
    return false;
  }

  if (!order.orderTimestamp) {
    return false;
  }

  return (
    Date.now() - Number(order.orderTimestamp) <
    24 * 60 * 60 * 1000
  );
};

/* =========================================================
   THEME
========================================================= */

const theme = {
  dark: "#35140d",
  dark2: "#542116",
  primary: "#74331f",
  primary2: "#8f4527",
  gold: "#e0aa4f",
  goldLight: "#f7d58b",
  cream: "#fff8ed",
  cream2: "#f5e5ca",
  text: "#3b5268",
  muted: "#718196",
  white: "#ffffff",
  green: "#218c4d",
  red: "#b43c2c"
};

/* =========================================================
   COMMON STYLES
========================================================= */

const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg,#fffaf2 0%,#f7ead4 48%,#fff8ed 100%)"
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #ead4b1",
  borderRadius: "20px",
  boxShadow:
    "0 15px 40px rgba(80,42,20,0.10)"
};


/* =========================================================
   NAVBAR
========================================================= */

function Navbar() {
  const currentPath = window.location.pathname;

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const result = await apiRequest("/customers/session");

        console.log("Customer session:", result);

        if (active) {
          setLoggedIn(
            Boolean(result?.success && result?.customer)
          );
        }
      } catch (error) {
        console.error("Navbar session check failed:", error);

        if (active) {
          setLoggedIn(false);
        }
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [currentPath]);

  const go = (path) => {
    window.location.href = path;
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "linear-gradient(135deg,#32120b,#632719,#8d4326)",
        boxShadow: "0 8px 25px rgba(48,20,10,0.25)",
        borderBottom: "1px solid rgba(247,213,139,0.25)"
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          minHeight: "82px",
          padding: "0 25px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap"
        }}
      >
        <button
          onClick={() => go("/")}
          style={{
            border: "none",
            background: "transparent",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            padding: 0
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "14px",
              background: "linear-gradient(135deg,#f6cf79,#fff0c7)",
              color: theme.dark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "19px",
              fontWeight: 900,
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)"
            }}
          >
            RK
          </div>

          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontFamily: "Georgia,serif",
                fontSize: "25px",
                fontWeight: 700
              }}
            >
              RK Choco
            </div>

            <div
              style={{
                fontSize: "10px",
                color: theme.goldLight,
                letterSpacing: "1.5px",
                fontWeight: 700
              }}
            >
              PREMIUM CHOCOLATE DISTRIBUTOR
            </div>
          </div>
        </button>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <NavButton
            icon={<FaHome />}
            text="Home"
            active={currentPath === "/"}
            onClick={() => go("/")}
          />

          <NavButton
            icon={<FaBoxOpen />}
            text="Products"
            active={currentPath === "/products"}
            onClick={() => go("/products")}
          />

          <NavButton
            icon={<FaTags />}
            text="Brands"
            active={currentPath === "/brands"}
            onClick={() => go("/brands")}
          />

          <NavButton
            icon={<FaClipboardList />}
            text="Orders"
            active={currentPath === "/orders"}
            onClick={() => go("/orders")}
          />

          <NavButton
            icon={<FaShoppingCart />}
            text="Cart"
            active={currentPath === "/cart"}
            onClick={() => go("/cart")}
          />

          {loggedIn ? (
            <NavButton
              icon={<FaUser />}
              text="Profile"
              active={currentPath === "/profile"}
              onClick={() => go("/profile")}
            />
          ) : (
            <>
              <NavButton
                icon={<FaUser />}
                text="Login"
                active={currentPath === "/login"}
                onClick={() => go("/login")}
              />

              <button
                onClick={() => go("/register")}
                style={{
                  border: "1px solid #f3ca72",
                  background: "linear-gradient(135deg,#e4ad4f,#f5ce7a)",
                  color: "#4a1b10",
                  borderRadius: "10px",
                  padding: "10px 15px",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.15)"
                }}
              >
                <FaUserPlus />
                Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/* =========================================================
   BACK BUTTON
========================================================= */

function BackButton({
  text = "Back to Home",
  path = "/"
}) {
  return (
    <button
      onClick={() => {
        window.location.href = path;
      }}
      style={{
        border: "1px solid #c9984d",
        background: "#fffaf1",
        color: theme.primary,
        borderRadius: "10px",
        padding: "11px 17px",
        fontWeight: 900,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        boxShadow:
          "0 5px 15px rgba(90,45,20,0.08)"
      }}
    >
      <FaArrowLeft />
      {text}
    </button>
  );
}

/* =========================================================
   FOOTER - HOME ONLY
========================================================= */

function Footer() {
  return (
    <footer
      style={{
        marginTop: "70px",
        background:
          "linear-gradient(135deg,#32120b,#5e2518,#7f3b24)",
        color: "#fff",
        padding: "45px 25px 20px"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(230px,1fr))",
          gap: "30px"
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "Georgia,serif",
              color: "#f5cf7a"
            }}
          >
            RK Choco
          </h2>

          <p
            style={{
              color: "#f3ddbd",
              lineHeight: 1.7
            }}
          >
            India's Trusted Chocolate Distributor.
            Premium chocolates, reliable service and
            professional distribution.
          </p>
        </div>

        <div>
          <h3 style={{ color: "#f5cf7a" }}>
            Quick Links
          </h3>

          <p
            onClick={() =>
              (window.location.href = "/")
            }
            style={{ cursor: "pointer" }}
          >
            Home
          </p>

          <p
            onClick={() =>
              (window.location.href = "/products")
            }
            style={{ cursor: "pointer" }}
          >
            Products
          </p>

          <p
            onClick={() =>
              (window.location.href = "/brands")
            }
            style={{ cursor: "pointer" }}
          >
            Brands
          </p>
        </div>

        <div>
          <h3 style={{ color: "#f5cf7a" }}>
            Contact
          </h3>

          <p>
            <FaPhone /> &nbsp; +91 9014497793
          </p>

          <p>
            <FaEnvelope /> &nbsp; rkchoco sn942076@gmail.com
          </p>

          <p>
            <FaMapMarkerAlt /> &nbsp; Andhra Pradesh,
            India
          </p>
        </div>
      </div>

      <div
        style={{
          borderTop:
            "1px solid rgba(255,255,255,0.15)",
          marginTop: "30px",
          paddingTop: "18px",
          textAlign: "center",
          color: "#e9d5bb",
          fontSize: "14px"
        }}
      >
        © 2026 RK Choco. All Rights Reserved.
      </div>
    </footer>
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

function HomePage() {
  const brands = [
    {
      name: "OREO",
      image: oreo,
      description:
        "Oreo is a popular chocolate sandwich biscuit loved for its crunchy biscuit and creamy filling."
    },
    {
      name: "DAIRY MILK",
      image: dairyMilk,
      description:
        "Cadbury Dairy Milk is a smooth and creamy milk chocolate loved by chocolate customers."
    },
    {
      name: "KITKAT",
      image: kitkat,
      description:
        "KitKat is a crispy wafer chocolate covered with smooth chocolate."
    },
    {
      name: "5 STAR",
      image: fiveStar,
      description:
        "5 Star is a popular caramel chocolate known for its chewy caramel and chocolate combination."
    },
    {
      name: "MUNCH",
      image: munch,
      description:
        "Munch is a crunchy wafer chocolate product."
    },
    {
      name: "MILKYBAR",
      image: milkybar,
      description:
        "Milkybar is a creamy white chocolate product."
    },
    {
      name: "PERK",
      image: perk,
      description:
        "Perk is a light and crispy wafer chocolate."
    }
  ];

  const stats = [
    {
      icon: <FaStore />,
      number: "500+",
      title: "Retail Shops",
      detail:
        "RK Choco proudly serves 500+ retail shops with dependable chocolate distribution and regular service."
    },
    {
      icon: <FaTags />,
      number: "20+",
      title: "Chocolate Brands",
      detail:
        "We provide chocolates from 20+ trusted and popular chocolate brands for retail and wholesale partners."
    },
    {
      icon: <FaTruck />,
      number: "24/7",
      title: "Customer Support",
      detail:
        "Shop owners can receive support for products, orders and distribution requirements whenever needed."
    },
    {
      icon: <FaShieldAlt />,
      number: "100%",
      title: "Quality Service",
      detail:
        "We focus on genuine products, proper handling and reliable quality for every chocolate order."
    }
  ];

  const [activeStat, setActiveStat] = useState(null);

  const goToProducts = () => {
    window.location.href = "/products";
  };

  return (
    <div style={pageStyle}>
      <Navbar />

      {/* HERO SECTION */}
      <section
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
          padding: "70px 25px 45px",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: "45px",
          alignItems: "center"
        }}
      >
        <div>
          <span
            style={{
              display: "inline-block",
              background: "#f6dfb5",
              color: theme.primary,
              borderRadius: "30px",
              padding: "9px 17px",
              fontWeight: 900,
              fontSize: "13px",
              letterSpacing: "1px",
              marginBottom: "20px"
            }}
          >
            🍫 PREMIUM CHOCOLATE DISTRIBUTOR
          </span>

          <h1
            style={{
              fontFamily: "Georgia,serif",
              fontSize: "clamp(42px,6vw,72px)",
              lineHeight: 1.02,
              color: theme.dark,
              margin: "0 0 20px"
            }}
          >
            India's Trusted
            <br />
            <span style={{ color: theme.primary2 }}>
              Chocolate Distributor
            </span>
          </h1>

          <p
            style={{
              color: theme.text,
              fontSize: "18px",
              lineHeight: 1.8,
              maxWidth: "650px"
            }}
          >
            Discover premium chocolate brands,
            trusted products and reliable
            distribution service with RK Choco.
          </p>

          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              marginTop: "28px"
            }}
          >
            <button
              onClick={goToProducts}
              style={{
                border: "none",
                background:
                  "linear-gradient(135deg,#71301d,#a44f2b)",
                color: "#fff",
                padding: "15px 24px",
                borderRadius: "12px",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow:
                  "0 12px 25px rgba(112,48,29,0.25)"
              }}
            >
              <FaShoppingBag /> &nbsp;
              Shop Chocolates
            </button>

            <button
              onClick={() =>
                (window.location.href = "/brands")
              }
              style={{
                border: "1px solid #c9984d",
                background: "#fffaf2",
                color: theme.primary,
                padding: "14px 23px",
                borderRadius: "12px",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              <FaTags /> &nbsp; Explore Brands
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              marginTop: "35px"
            }}
          >
            <TrustItem
              icon={<FaShieldAlt />}
              text="Quality Products"
            />

            <TrustItem
              icon={<FaTruck />}
              text="Reliable Delivery"
            />

            <TrustItem
              icon={<FaStore />}
              text="Distributor Friendly"
            />
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            minHeight: "430px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "25px",
            background:
              "radial-gradient(circle at center,#fff4d8,#f4dfbd)"
          }}
        >
          <img
            src={heroChocolate}
            alt="RK Choco"
            style={{
              width: "100%",
              maxWidth: "560px",
              maxHeight: "430px",
              objectFit: "contain"
            }}
          />
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
          padding: "5px 25px 45px"
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: "22px 18px",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: "0",
            flexWrap: "nowrap",
            overflow: "hidden"
          }}
        >
          {stats.map((stat, index) => (
            <React.Fragment key={stat.title}>
              <button
                onClick={() =>
                  setActiveStat(
                    activeStat === index ? null : index
                  )
                }
                style={{
                  flex: 1,
                  border: "none",
                  background:
                    activeStat === index
                      ? "#fff6e5"
                      : "transparent",
                  borderRadius: "14px",
                  padding: "12px 15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    minWidth: "48px",
                    borderRadius: "14px",
                    background: "#f5e3c3",
                    color: theme.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                  }}
                >
                  {stat.icon}
                </div>

                <div style={{ textAlign: "left" }}>
                  <strong
                    style={{
                      display: "block",
                      color: theme.dark,
                      fontSize: "24px",
                      lineHeight: 1
                    }}
                  >
                    {stat.number}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: theme.text,
                      fontWeight: 800,
                      marginTop: "6px",
                      fontSize: "14px"
                    }}
                  >
                    {stat.title}
                  </span>
                </div>
              </button>

              {index < stats.length - 1 && (
                <div
                  style={{
                    width: "1px",
                    background: "#ead8bd",
                    margin: "5px 0"
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {activeStat !== null && (
          <div
            style={{
              ...cardStyle,
              marginTop: "15px",
              padding: "18px 22px",
              textAlign: "center",
              color: theme.text
            }}
          >
            {stats[activeStat].detail}
          </div>
        )}
      </section>

      {/* CHOCOLATE BRANDS SECTION */}
      <section
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
          padding: "30px 25px 70px"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              color: theme.primary2,
              fontWeight: 900,
              letterSpacing: "2px"
            }}
          >
            OUR BRANDS
          </span>

          <h2
            style={{
              fontFamily: "Georgia,serif",
              fontSize: "42px",
              color: theme.dark,
              margin: "10px 0"
            }}
          >
            Chocolate Brands
          </h2>

          <p style={{ color: theme.muted }}>
            Quality chocolates from popular and
            trusted brands.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(170px,1fr))",
            gap: "20px",
            marginTop: "35px"
          }}
        >
          {brands.map((brand) => (
            <div
              key={brand.name}
              style={{
                ...cardStyle,
                minHeight: "215px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                background:
                  "linear-gradient(180deg,#fff,#fff9ef)"
              }}
            >
              <div
                style={{
                  height: "125px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <img
                  src={brand.image}
                  alt={brand.name}
                  style={{
                    width: "145px",
                    height: "115px",
                    objectFit: "contain"
                  }}
                />
              </div>

              <strong
                style={{
                  color: theme.primary,
                  fontSize: "17px"
                }}
              >
                {brand.name}
              </strong>

              <button
                onClick={goToProducts}
                style={{
                  marginTop: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#b77c28",
                  fontWeight: 900,
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "8px 12px"
                }}
              >
                View Product
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({ icon, text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        color: theme.primary,
        fontWeight: 800,
        background: "#fffaf1",
        border: "1px solid #ecd5ae",
        borderRadius: "30px",
        padding: "10px 14px"
      }}
    >
      {icon}
      {text}
    </div>
  );
}

/* =========================================================
   BRANDS PAGE
========================================================= */

function BrandsPage() {
  const [mongoProducts, setMongoProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/products`,
          {
            method: "GET",
            cache: "no-store",
            credentials: "include"
          }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Unable to load products."
          );
        }

        const products = Array.isArray(result)
          ? result
          : Array.isArray(result.products)
          ? result.products
          : [];

        if (active) {
          setMongoProducts(products);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load products."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const getFallbackImage = (product) => {
    const name = String(
      product.name || product.brand || ""
    ).toLowerCase();

    if (name.includes("kitkat") || name.includes("kit kat")) {
      return kitkat;
    }

    if (name.includes("dairy milk") || name.includes("cadbury")) {
      return dairyMilk;
    }

    if (name.includes("5 star") || name.includes("five star")) {
      return fiveStar;
    }

    if (name.includes("munch")) {
      return munch;
    }

    if (name.includes("milkybar") || name.includes("milky bar")) {
      return milkybar;
    }

    if (name.includes("perk")) {
      return perk;
    }

    if (name.includes("oreo")) {
      return oreo;
    }

    return heroChocolate;
  };

  const getProductImage = (product) => {
    const image =
      product.image ||
      product.imageUrl ||
      product.imagePath ||
      "";

    if (!image) {
      return getFallbackImage(product);
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `http://localhost:5000${image}`;
    }

    return getFallbackImage(product);
  };

  return (
    <div style={pageStyle}>
      <Navbar />

      <main
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
          padding: "25px"
        }}
      >
        <BackButton
          text="Back to Home"
          path="/"
        />

        <div
          style={{
            textAlign: "center",
            margin: "35px 0"
          }}
        >
          <h1
            style={{
              color: theme.dark,
              fontFamily: "Georgia,serif",
              fontSize: "42px",
              marginBottom: "10px"
            }}
          >
            Our Chocolate Brands
          </h1>

          <p style={{ color: theme.muted }}>
            Explore our chocolate products and trusted brands.
          </p>
        </div>

        {loading ? (
          <div
            style={{
              ...cardStyle,
              padding: "35px",
              textAlign: "center"
            }}
          >
            Loading chocolate brands...
          </div>
        ) : error ? (
          <div
            style={{
              ...cardStyle,
              padding: "25px",
              textAlign: "center",
              color: theme.red
            }}
          >
            {error}
          </div>
        ) : mongoProducts.length === 0 ? (
          <div
            style={{
              ...cardStyle,
              padding: "35px",
              textAlign: "center"
            }}
          >
            No products available.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(230px,1fr))",
              gap: "25px"
            }}
          >
            {mongoProducts.map((product, index) => {
              const productName =
                product.name || product.brand || "Chocolate";

              const brandName =
                product.brand || product.name || "RK Choco";

              const price = Number(product.price || 0);
              const stock = Math.max(
                0,
                Number(product.stock || 0)
              );

              return (
                <div
                  key={
                    product._id ||
                    product.id ||
                    `${productName}-${index}`
                  }
                  style={{
                    ...cardStyle,
                    overflow: "hidden",
                    padding: "20px",
                    textAlign: "center"
                  }}
                >
                  <div
                    style={{
                      height: "190px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "15px",
                      background: "#fffaf2",
                      borderRadius: "12px",
                      padding: "10px"
                    }}
                  >
                    <img
                      src={getProductImage(product)}
                      alt={productName}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          getFallbackImage(product);
                      }}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain"
                      }}
                    />
                  </div>

                  <h2
                    style={{
                      color: theme.dark,
                      fontFamily: "Georgia,serif",
                      fontSize: "22px",
                      margin: "10px 0"
                    }}
                  >
                    {productName}
                  </h2>

                  <p
                    style={{
                      color: theme.muted,
                      fontWeight: 700,
                      margin: "5px 0"
                    }}
                  >
                    {brandName}
                  </p>

                  <p
                    style={{
                      color: theme.primary2,
                      fontSize: "20px",
                      fontWeight: 900,
                      margin: "12px 0"
                    }}
                  >
                    ₹{price}
                  </p>

                  <p
                    style={{
                      color: stock > 0 ? theme.green : theme.red,
                      fontWeight: 800,
                      margin: "8px 0 18px"
                    }}
                  >
                    {stock > 0
                      ? `Available Stock: ${stock}`
                      : "Out of Stock"}
                  </p>

                  <button
                    onClick={() => {
                      window.location.href = "/products";
                    }}
                    style={{
                      ...mainButtonStyle,
                      width: "100%"
                    }}
                  >
                    View Products
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}


/* =========================================================
   BRAND PRODUCT MODAL
========================================================= */

function BrandProductModal({
  product,
  close
}) {
  const [quantity, setQuantity] =
    useState(1);

  const total =
    product.price * quantity;

  const addToCart = () => {
    const rawCart = readCart();

    const cart =
      rawCart &&
      typeof rawCart === "object" &&
      !Array.isArray(rawCart)
        ? rawCart
        : {};

    const id =
      product.name
        .toLowerCase()
        .replace(/\s+/g, "-");

    const existing = cart[id];

    if (existing) {
      cart[id] = {
        ...existing,
        quantity:
          Number(existing.quantity || 0) +
          quantity
      };
    } else {
      cart[id] = {
        id,
        mongoId: product.mongoId || undefined,
        productId: product.mongoId || undefined,
        name: product.name,
        company: product.company,
        image: product.image,
        price: product.price,
        quantity,
        pieces: product.pieces,
        stock: product.stock
      };
    }

    saveCart(cart);

    alert(
      `${product.name} added to cart successfully.`
    );

    close();
  };

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background:
          "rgba(34,13,7,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          ...cardStyle,
          width: "100%",
          maxWidth: "900px",
          padding: "35px",
          position: "relative",
          display: "grid",
          gridTemplateColumns:
            "0.9fr 1.1fr",
          gap: "35px"
        }}
      >
        <button
          onClick={close}
          style={{
            position: "absolute",
            right: "15px",
            top: "12px",
            border: "none",
            background: "#f3dfc2",
            color: theme.primary,
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "22px"
          }}
        >
          ×
        </button>

        <div
          style={{
            minHeight: "350px",
            background:
              "linear-gradient(135deg,#fff9ee,#f3dfbe)",
            borderRadius: "18px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              maxWidth: "360px",
              height: "330px",
              objectFit: "contain"
            }}
          />
        </div>

        <div>
          <span
            style={{
              color: "#b57b27",
              fontWeight: 900,
              letterSpacing: "2px",
              fontSize: "12px"
            }}
          >
            CHOCOLATE PRODUCT
          </span>

          <h1
            style={{
              color: theme.dark,
              fontFamily: "Georgia,serif",
              fontSize: "42px",
              margin: "8px 0"
            }}
          >
            {product.name}
          </h1>

          <h3
            style={{
              color: theme.primary2,
              marginBottom: "10px"
            }}
          >
            {product.company}
          </h3>

          <p
            style={{
              color: theme.text,
              lineHeight: 1.7
            }}
          >
            {product.description}
          </p>

          <div
            style={{
              background: "#fff7e8",
              border:
                "1px solid #ead2aa",
              borderRadius: "14px",
              padding: "18px",
              margin: "20px 0"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "10px"
              }}
            >
              <strong>Price</strong>

              <strong
                style={{
                  color: theme.primary2,
                  fontSize: "20px"
                }}
              >
                ₹{product.price} / Box
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "10px"
              }}
            >
              <span>Box Quantity</span>

              <span>
                1 Box = {product.pieces} Pieces
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between"
              }}
            >
              <span>Stock</span>

              <span>{product.stock}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px"
            }}
          >
            <strong>Quantity</strong>

            <button
              onClick={() =>
                setQuantity(
                  Math.max(1, quantity - 1)
                )
              }
              style={qtyButtonStyle}
            >
              −
            </button>

            <strong
              style={{
                minWidth: "30px",
                textAlign: "center"
              }}
            >
              {quantity}
            </strong>

            <button
              onClick={() =>
                setQuantity(
                  Math.min(
                    product.stock,
                    quantity + 1
                  )
                )
              }
              style={qtyButtonStyle}
            >
              +
            </button>
          </div>

          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: theme.dark,
              marginBottom: "18px"
            }}
          >
            Total ₹{total}
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px"
            }}
          >
            <button
              onClick={() =>
                alert(
                  `${product.name}\n\n${product.company}\n\n${product.description}\n\n₹${product.price} / Box`
                )
              }
              style={{
                flex: 1,
                border:
                  "1px solid #bd8a40",
                background: "#fffaf2",
                color: theme.primary,
                padding: "14px",
                borderRadius: "10px",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              <FaInfoCircle /> Details
            </button>

            <button
              onClick={addToCart}
              style={{
                flex: 1,
                border: "none",
                background:
                  "linear-gradient(135deg,#74331f,#a34d29)",
                color: "#fff",
                padding: "14px",
                borderRadius: "10px",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const qtyButtonStyle = {
  width: "35px",
  height: "35px",
  border: "1px solid #d1a261",
  background: "#fff7e8",
  color: theme.primary,
  borderRadius: "8px",
  fontSize: "20px",
  fontWeight: 900,
  cursor: "pointer"
};

/* =========================================================
   CART PAGE
========================================================= */

function CartPage() {
  const [cart, setCart] = useState(() => {
    const raw = readCart();

    if (Array.isArray(raw)) {
      const normalized = {};

      raw.forEach((item) => {
        if (!item || item.id == null) {
          return;
        }

        normalized[String(item.id)] = {
          ...item,
          id: String(item.id),
          quantity: Math.max(
            1,
            Number(item.quantity || 1)
          )
        };
      });

      return normalized;
    }

    const normalized = {};

    Object.entries(raw || {}).forEach(
      ([key, item]) => {
        if (
          !item ||
          typeof item !== "object"
        ) {
          return;
        }

        normalized[String(key)] = {
          ...item,
          id:
            item.id != null
              ? String(item.id)
              : String(key),
          quantity: Math.max(
            1,
            Number(item.quantity || 1)
          )
        };
      }
    );

    return normalized;
  });

  const products = Object.values(
    cart || {}
  ).filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.id != null
  );

  const totalBoxes = products.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0),
    0
  );

  const totalAmount = products.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const updateCart = (updated) => {
    setCart(updated);
    saveCart(updated);
  };

  const increase = (id) => {
    const key = String(id);

    const currentProduct =
      cart?.[key];

    if (!currentProduct) {
      return;
    }

    const currentQuantity = Math.max(
      1,
      Number(
        currentProduct.quantity || 1
      )
    );

    const updated = {
      ...cart,
      [key]: {
        ...currentProduct,
        quantity:
          currentQuantity + 1
      }
    };

    updateCart(updated);
  };

  const decrease = (id) => {
    const key = String(id);

    const currentProduct =
      cart?.[key];

    if (!currentProduct) {
      return;
    }

    const currentQuantity = Math.max(
      1,
      Number(
        currentProduct.quantity || 1
      )
    );

    if (currentQuantity <= 1) {
      return;
    }

    const updated = {
      ...cart,
      [key]: {
        ...currentProduct,
        quantity:
          currentQuantity - 1
      }
    };

    updateCart(updated);
  };

  const remove = (id) => {
    const key = String(id);

    const updated = {
      ...cart
    };

    delete updated[key];

    updateCart(updated);
  };

  const placeOrder = () => {
    if (!products.length) {
      alert(
        "Please add chocolates to your cart first."
      );
      return;
    }

    const timestamp = Date.now();

    const order = {
      orderId:
        "RK" +
        timestamp.toString().slice(-8),
      orderTimestamp: timestamp,
      status: "Order Details Pending",
      products: products.map(
        (item) => ({
          ...item,
          quantity: Math.max(
            1,
            Number(item.quantity || 1)
          )
        })
      ),
      totalBoxes,
      totalAmount,
      expectedDelivery:
        getExpectedDelivery(timestamp)
    };

    sessionStorage.setItem(
      ORDER_KEY,
      JSON.stringify(order)
    );

    window.location.href =
      "/order-details";
  };

  return (
    <div style={pageStyle}>
      <Navbar />

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "25px"
        }}
      >
        <BackButton
          text="Continue Shopping"
          path="/products"
        />

        <h1
          style={{
            fontFamily: "Georgia,serif",
            color: theme.dark,
            fontSize: "45px",
            marginTop: "30px"
          }}
        >
          Shopping Cart
        </h1>

        {!products.length ? (
          <div
            style={{
              ...cardStyle,
              padding: "60px 25px",
              textAlign: "center",
              marginTop: "25px"
            }}
          >
            <FaShoppingCart
              style={{
                fontSize: "55px",
                color: "#cda05a"
              }}
            />

            <h2
              style={{
                color: theme.dark
              }}
            >
              Your cart is empty
            </h2>

            <p style={{ color: theme.muted }}>
              Add your favourite chocolates to
              continue.
            </p>

            <button
              onClick={() =>
                (window.location.href =
                  "/products")
              }
              style={mainButtonStyle}
            >
              Shop Products
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.5fr 0.8fr",
              gap: "25px",
              marginTop: "25px"
            }}
          >
            <div>
              {products.map((item) => {
                const safeQuantity =
                  Math.max(
                    1,
                    Number(
                      item.quantity || 1
                    )
                  );

                return (
                  <div
                    key={item.id}
                    style={{
                      ...cardStyle,
                      padding: "18px",
                      display: "grid",
                      gridTemplateColumns:
                        "110px 1fr auto",
                      gap: "18px",
                      alignItems: "center",
                      marginBottom: "15px"
                    }}
                  >
                    <div
                      style={{
                        height: "100px",
                        background: "#fff5df",
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent:
                          "center",
                        alignItems: "center"
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "95px",
                          height: "85px",
                          objectFit:
                            "contain"
                        }}
                      />
                    </div>

                    <div>
                      <h3
                        style={{
                          color: theme.dark,
                          margin:
                            "0 0 5px"
                        }}
                      >
                        {item.name}
                      </h3>

                      <p
                        style={{
                          color: theme.muted,
                          margin:
                            "0 0 10px"
                        }}
                      >
                        ₹{item.price} / Box
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "9px"
                        }}
                      >
                        <button
                          onClick={() =>
                            decrease(
                              item.id
                            )
                          }
                          style={
                            qtyButtonStyle
                          }
                        >
                          −
                        </button>

                        <strong>
                          {safeQuantity}
                        </strong>

                        <button
                          onClick={() =>
                            increase(
                              item.id
                            )
                          }
                          style={
                            qtyButtonStyle
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign:
                          "right"
                      }}
                    >
                      <strong
                        style={{
                          color:
                            theme.primary2,
                          fontSize:
                            "19px"
                        }}
                      >
                        ₹
                        {Number(
                          item.price || 0
                        ) *
                          safeQuantity}
                      </strong>

                      <br />

                      <button
                        onClick={() =>
                          remove(
                            item.id
                          )
                        }
                        style={{
                          marginTop:
                            "15px",
                          border: "none",
                          background:
                            "#fff0ed",
                          color:
                            theme.red,
                          borderRadius:
                            "8px",
                          padding:
                            "8px 10px",
                          cursor:
                            "pointer",
                          fontWeight: 800
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <div
                style={{
                  ...cardStyle,
                  padding: "25px",
                  position: "sticky",
                  top: "105px"
                }}
              >
                <h2
                  style={{
                    color: theme.dark,
                    fontFamily:
                      "Georgia,serif"
                  }}
                >
                  Order Summary
                </h2>

                <SummaryRow
                  label="Products"
                  value={products.length}
                />

                <SummaryRow
                  label="Total Boxes"
                  value={totalBoxes}
                />

                <hr
                  style={{
                    border: 0,
                    borderTop:
                      "1px solid #ead7bb"
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    fontSize: "22px",
                    fontWeight: 900,
                    color: theme.dark,
                    margin:
                      "18px 0 22px"
                  }}
                >
                  <span>Total</span>

                  <span>
                    ₹{totalAmount}
                  </span>
                </div>

                <button
                  onClick={placeOrder}
                  style={{
                    ...mainButtonStyle,
                    width: "100%"
                  }}
                >
                  <FaCheckCircle />
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryRow({
  label,
  value
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        color: theme.text,
        margin: "14px 0"
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const mainButtonStyle = {
  border: "none",
  background:
    "linear-gradient(135deg,#74331f,#a34d29)",
  color: "#fff",
  borderRadius: "10px",
  padding: "14px 20px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow:
    "0 10px 22px rgba(116,51,31,0.22)"
};

/* =========================================================
   ORDER SUCCESS
========================================================= */

function OrderSuccessPage() {
  const order =
    JSON.parse(
      sessionStorage.getItem(ORDER_KEY) ||
        "null"
    );

  return (
    <div style={pageStyle}>
      <Navbar />

      <main
        style={{
          minHeight: "75vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px"
        }}
      >
        <div
          style={{
            ...cardStyle,
            maxWidth: "700px",
            width: "100%",
            padding: "45px",
            textAlign: "center"
          }}
        >
          <FaCheckCircle
            style={{
              fontSize: "75px",
              color: theme.green
            }}
          />

          <h1
            style={{
              color: theme.green,
              fontFamily: "Georgia,serif",
              fontSize: "42px"
            }}
          >
            Place Order Successful!
          </h1>

          <p
            style={{
              color: theme.text,
              fontSize: "17px",
              fontWeight: 700
            }}
          >
            Your order has been placed successfully.
          </p>

          {order && (
            <>
              <p
                style={{
                  color: theme.text,
                  fontSize: "17px"
                }}
              >
                Your Order ID:
              </p>

              <h2
                style={{
                  color: theme.primary2
                }}
              >
                {order.orderId}
              </h2>

              <p
                style={{
                  color: theme.muted
                }}
              >
                Order Date:{" "}
                {formatDate(
                  order.orderTimestamp
                )}
              </p>

              <p
                style={{
                  color: theme.muted
                }}
              >
                Order Time:{" "}
                {formatTime(
                  order.orderTimestamp
                )}
              </p>

              <p
                style={{
                  color: theme.muted
                }}
              >
                Expected Delivery:{" "}
                {order.expectedDelivery}
              </p>

              <p
                style={{
                  color: theme.green,
                  fontWeight: 900
                }}
              >
                Status:{" "}
                {order.status ||
                  "Order Placed"}
              </p>

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#f8f0e2",
                  borderRadius: "12px",
                  textAlign: "left"
                }}
              >
                <h3
                  style={{
                    color: theme.dark,
                    marginTop: 0
                  }}
                >
                  Order Details
                </h3>

                {order.products?.map(
                  (item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        padding:
                          "8px 0"
                      }}
                    >
                      <span>
                        {item.name} ×{" "}
                        {item.quantity}
                      </span>

                      <strong>
                        ₹
                        {Number(
                          item.price || 0
                        ) *
                          Number(
                            item.quantity ||
                              0
                          )}
                      </strong>
                    </div>
                  )
                )}

                <hr
                  style={{
                    border: 0,
                    borderTop:
                      "1px solid #ddc8a8"
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    color: theme.text,
                    fontWeight: 800,
                    marginTop: "10px"
                  }}
                >
                  <span>Total Boxes</span>
                  <span>
                    {order.totalBoxes}
                  </span>
                </div>

                <p
                  style={{
                    textAlign: "right",
                    fontWeight: 900,
                    color: theme.dark,
                    fontSize: "20px"
                  }}
                >
                  Grand Total: ₹
                  {order.totalAmount}
                </p>
              </div>
            </>
          )}

          {/* =================================================
              SUCCESS PAGE BUTTONS
          ================================================= */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "25px"
            }}
          >
            <button
              onClick={() =>
                (window.location.href =
                  "/orders")
              }
              style={{
                ...mainButtonStyle,
                width: "100%"
              }}
            >
              <FaClipboardList /> &nbsp;
              View Order
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/products")
              }
              style={{
                ...mainButtonStyle,
                width: "100%"
              }}
            >
              <FaShoppingBag /> &nbsp;
              Continue Shopping
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/")
              }
              style={{
                width: "100%",
                border:
                  "1px solid #c9984d",
                background:
                  "#fffaf2",
                color:
                  theme.primary,
                borderRadius:
                  "10px",
                padding:
                  "14px 20px",
                fontWeight:
                  900,
                cursor:
                  "pointer"
              }}
            >
              <FaHome /> &nbsp;
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   ORDERS PAGE
   NO OTHER CHANGES
========================================================= */

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("rkChocoCurrentUser") || "null"); }
    catch { return null; }
  });

  const loadCustomerOrders = async () => {
    try {
      setOrdersError("");
      const result = await apiRequest("/orders/my-orders");
      const normalized = (result.orders || []).map(order => ({
        ...order,
        orderId: order.id || order._id,
        orderTimestamp: order.createdAt ? new Date(order.createdAt).getTime() : 0,
        placedAt: order.createdAt,
        status: String(order.status || "Placed").toLowerCase() === "cancelled" ? "Order Cancelled" : (order.status || "Order Placed"),
        products: (order.items || order.products || []).map(item => ({
          ...item,
          id: item.productId || item.id || item._id,
          name: item.name || item.title || "Chocolate",
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0)
        })),
        totalAmount: Number(order.grandTotal ?? order.totalAmount ?? 0),
        totalBoxes: Number(order.totalBoxes || 0),
        customerPhone: order.customerPhone || order.phone || "—"
      }));
      setOrders(normalized);
    } catch (error) {
      setOrdersError(error.message || "Unable to load your orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => { loadCustomerOrders(); }, []);

  const cancelOrder = async (orderId) => {
    const order = orders.find(item => String(item.orderId) === String(orderId));
    if (!order || !canCancelOrder({ ...order, status: order.status === "Order Cancelled" ? "Order Cancelled" : order.status })) {
      alert("This order can no longer be cancelled.");
      return;
    }
    try {
      await apiRequest(`/orders/${encodeURIComponent(order._id || order.id || orderId)}/cancel`, { method: "PATCH" });
      await loadCustomerOrders();
    } catch (error) {
      alert(error.message || "Unable to cancel this order.");
    }
  };

  return (
    <div style={pageStyle}>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "25px" }}>
        <BackButton text="Back to Products" path="/products" />
        <h1 style={{ fontFamily: "Georgia,serif", color: theme.dark, fontSize: "45px", marginTop: "30px" }}>My Orders</h1>
        {ordersError && <div style={{ ...cardStyle, color: theme.red, padding: "15px", marginTop: "20px" }}>{ordersError}</div>}
        {loadingOrders ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "35px", marginTop: "25px" }}>Loading your orders from MongoDB...</div>
        ) : !orders.length ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "60px 25px", marginTop: "25px" }}>
            <FaClipboardList style={{ fontSize: "60px", color: "#c89b55" }} />
            <h2 style={{ color: theme.dark }}>No Orders Yet</h2>
            <p style={{ color: theme.muted }}>Your placed orders will appear here.</p>
            <button onClick={() => window.location.href = "/products"} style={mainButtonStyle}>Browse Products</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "18px", marginTop: "25px" }}>
            {orders.map(order => (
              <div key={order._id || order.orderId} style={{ ...cardStyle, padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <strong style={{ color: theme.dark }}>Order ID: {order.orderId}</strong>
                  <strong style={{ color: String(order.status).toLowerCase().includes("cancel") ? theme.red : theme.green }}>{order.status}</strong>
                </div>
                <p style={{ color: theme.muted }}>Date: {formatDate(order.orderTimestamp)} · Time: {formatTime(order.orderTimestamp)}</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {order.products.map((item, index) => <div key={`${item.id || item.name}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}><span>{item.name} × {item.quantity}</span><strong>₹{Number(item.price || 0) * Number(item.quantity || 0)}</strong></div>)}
                </div>
                <hr style={{ border: 0, borderTop: "1px solid #ead4b1", margin: "16px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}><span>Total Boxes: <strong>{order.totalBoxes}</strong></span><span>Grand Total: <strong style={{ color: theme.primary }}>₹{order.totalAmount}</strong></span></div>
                {canCancelOrder({ ...order, status: order.status === "Order Cancelled" ? "Order Cancelled" : order.status }) && <button onClick={() => cancelOrder(order.orderId)} style={{ ...mainButtonStyle, marginTop: "15px", background: "#fff", color: theme.red, border: "1px solid #d8a39b", boxShadow: "none" }}><FaTimesCircle /> Cancel Order</button>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* =========================================================
   ORDER DETAILS PAGE
   ONLY REQUESTED CHANGES:
   - REMOVE ORDER ID
   - REMOVE DATE
   - REMOVE TIME
   - REMOVE EXPECTED DELIVERY
   - KEEP TOTAL BOXES
   - KEEP GRAND TOTAL
========================================================= */

function OrderDetailsPage() {
  const order =
    JSON.parse(
      sessionStorage.getItem(ORDER_KEY) ||
      "null"
    );

  const currentUser =
    JSON.parse(
      sessionStorage.getItem(
        "rkChocoCurrentUser"
      ) || "null"
    );

  const [name, setName] =
    useState(
      currentUser?.name || ""
    );

  const [phone, setPhone] =
    useState(
      currentUser?.phone || ""
    );

  const [address, setAddress] =
    useState(
      currentUser?.address || ""
    );

  const [error, setError] =
    useState("");

  const submitOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!order) {
      setError("No order details available. Please return to your cart.");
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill all the delivery details.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    const currentUser = (() => {
      try { return JSON.parse(sessionStorage.getItem("rkChocoCurrentUser") || "null"); }
      catch { return null; }
    })();

    const finalOrder = {
      ...order,
      status: "Order Placed",
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      customerEmail: String(currentUser?.email || "").trim().toLowerCase(),
      placedAt: Date.now(),
      totalBoxes: Number(order.totalBoxes || 0),
      grandTotal: Number(order.totalAmount || order.grandTotal || 0)
    };

    if (!finalOrder.customerEmail) {
      setError("Please log in before placing an order.");
      return;
    }

    try {
      const result = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: finalOrder.products.map(item => ({
            id: item.id,
            productId: item.mongoId || item.productId || item._id || undefined,
            name: item.name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1)
          })),
          deliveryDetails: {
            name: finalOrder.customerName,
            phone: finalOrder.customerPhone,
            address: finalOrder.customerAddress
          }
        })
      });
      const dbOrder = result.order || {};
      const savedOrder = {
        ...finalOrder,
        _id: dbOrder._id || dbOrder.id || "",
        id: dbOrder.id || dbOrder._id || "",
        orderId: dbOrder.id || dbOrder._id || finalOrder.orderId,
        status: dbOrder.status || "Placed",
        orderTimestamp: dbOrder.createdAt ? new Date(dbOrder.createdAt).getTime() : finalOrder.placedAt,
        placedAt: dbOrder.createdAt || new Date(finalOrder.placedAt).toISOString(),
        totalBoxes: Number(dbOrder.totalBoxes ?? finalOrder.totalBoxes),
        totalAmount: Number(dbOrder.grandTotal ?? finalOrder.grandTotal),
        grandTotal: Number(dbOrder.grandTotal ?? finalOrder.grandTotal),
        products: finalOrder.products
      };
      sessionStorage.setItem(ORDER_KEY, JSON.stringify(savedOrder));
      saveCart({});
      window.location.href = "/order-success";
    } catch (error) {
      setError(error.message || "Unable to place order. Please try again.");
    }
  };

  return (
    <div style={pageStyle}>
      <Navbar />

      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "25px"
        }}
      >
        <BackButton
          text="Back to Cart"
          path="/cart"
        />

        <div
          style={{
            ...cardStyle,
            padding: "30px",
            marginTop: "25px"
          }}
        >
          <h1
            style={{
              color: theme.dark,
              fontFamily: "Georgia,serif",
              fontSize: "40px"
            }}
          >
            Order Details
          </h1>

          {!order ? (
            <div>
              <p
                style={{
                  color: theme.muted
                }}
              >
                No order details available.
              </p>

              <button
                onClick={() =>
                  (window.location.href =
                    "/cart")
                }
                style={mainButtonStyle}
              >
                Back to Cart
              </button>
            </div>
          ) : (
            <>
              {/* =================================================
                  ORDER ID / DATE / TIME / EXPECTED DELIVERY
                  REMOVED FROM THIS PAGE
              ================================================= */}

              <h2
                style={{
                  color: theme.dark,
                  fontFamily:
                    "Georgia,serif",
                  marginTop: "30px"
                }}
              >
                Your Products
              </h2>

              <div
                style={{
                  borderTop:
                    "1px solid #ead9bf",
                  borderBottom:
                    "1px solid #ead9bf",
                  padding: "10px 0"
                }}
              >
                {order.products?.map(
                  (item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        padding:
                          "12px 0",
                        borderBottom:
                          "1px solid #f0e2cd"
                      }}
                    >
                      <span>
                        {item.name} ×{" "}
                        {item.quantity}
                      </span>

                      <strong
                        style={{
                          color:
                            theme.primary2
                        }}
                      >
                        ₹
                        {Number(
                          item.price ||
                            0
                        ) *
                          Number(
                            item.quantity ||
                              0
                          )}
                      </strong>
                    </div>
                  )
                )}
              </div>

              {/* =================================================
                  TOTAL BOXES + GRAND TOTAL
              ================================================= */}

              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  background: "#fff7e8",
                  border:
                    "1px solid #ead2aa",
                  borderRadius: "14px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "12px",
                    color:
                      theme.text,
                    fontSize:
                      "18px",
                    fontWeight:
                      800
                  }}
                >
                  <span>Total Boxes</span>

                  <span>
                    {order.totalBoxes}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    color:
                      theme.primary2,
                    fontSize:
                      "24px",
                    fontWeight:
                      900
                  }}
                >
                  <span>Grand Total</span>

                  <span>
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    background:
                      "#fff0ed",
                    border:
                      "1px solid #e1aaa0",
                    color:
                      theme.red,
                    padding: "12px",
                    borderRadius:
                      "10px",
                    marginTop: "20px",
                    fontWeight: 700
                  }}
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={submitOrder}
                style={{
                  marginTop: "30px"
                }}
              >
                <h2
                  style={{
                    color: theme.dark,
                    fontFamily:
                      "Georgia,serif"
                  }}
                >
                  Delivery Details
                </h2>

                <label
                  style={{
                    display:
                      "block",
                    color:
                      theme.text,
                    fontWeight:
                      900,
                    marginTop:
                      "18px",
                    marginBottom:
                      "8px"
                  }}
                >
                  Full Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  style={
                    authInputStyle
                  }
                />

                <label
                  style={{
                    display:
                      "block",
                    color:
                      theme.text,
                    fontWeight:
                      900,
                    marginTop:
                      "18px",
                    marginBottom:
                      "8px"
                  }}
                >
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="Enter 10-digit phone number"
                  style={
                    authInputStyle
                  }
                />

                <label
                  style={{
                    display:
                      "block",
                    color:
                      theme.text,
                    fontWeight:
                      900,
                    marginTop:
                      "18px",
                    marginBottom:
                      "8px"
                  }}
                >
                  Delivery Address
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter your delivery address"
                  rows="4"
                  style={{
                    ...authInputStyle,
                    resize:
                      "vertical"
                  }}
                />

                <button
                  type="submit"
                  style={{
                    ...mainButtonStyle,
                    width: "100%",
                    marginTop: "25px"
                  }}
                >
                  <FaCheckCircle />{" "}
                  Place Order
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   AUTH PAGE STYLES
========================================================= */

const authPageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg,#fff8ed,#f3dfc0,#fffaf3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "30px 20px"
};

const authBoxStyle = {
  width: "100%",
  maxWidth: "1050px",
  background: "#fff",
  borderRadius: "25px",
  overflow: "hidden",
  boxShadow:
    "0 25px 70px rgba(70,35,15,0.18)",
  border: "1px solid #ead2aa",
  display: "grid",
  gridTemplateColumns:
    "0.9fr 1.1fr"
};

const authSingleBoxStyle = {
  width: "100%",
  maxWidth: "650px",
  background: "#fff",
  borderRadius: "25px",
  overflow: "hidden",
  boxShadow:
    "0 25px 70px rgba(70,35,15,0.18)",
  border: "1px solid #ead2aa"
};

function AuthBrandSide() {
  return (
    <div
      style={{
        background:
          "linear-gradient(145deg,#35140d,#74331f,#9a4b29)",
        color: "#fff",
        padding: "50px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "75px",
          height: "75px",
          borderRadius: "20px",
          background:
            "linear-gradient(135deg,#f2c76e,#fff0c8)",
          color: theme.dark,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: "26px",
          marginBottom: "25px"
        }}
      >
        RK
      </div>

      <div
        style={{
          color: theme.goldLight,
          fontWeight: 900,
          letterSpacing: "2px",
          fontSize: "12px"
        }}
      >
        PREMIUM CHOCOLATE DISTRIBUTOR
      </div>

      <h1
        style={{
          fontFamily: "Georgia,serif",
          fontSize: "48px",
          margin: "15px 0"
        }}
      >
        RK Choco
      </h1>

      <h2
        style={{
          color: "#ffe3aa",
          fontFamily: "Georgia,serif",
          fontWeight: 500,
          lineHeight: 1.3
        }}
      >
        India's Trusted
        <br />
        Chocolate Distributor
      </h2>

      <p
        style={{
          color: "#f4dec6",
          lineHeight: 1.8
        }}
      >
        Premium chocolate products,
        reliable distribution and trusted
        service for retailers.
      </p>
    </div>
  );
}

/* =========================================================
   LOGIN PAGE
========================================================= */

function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const result = await apiRequest("/customers/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password })
      });
      const customer = result.customer;
      if (!customer) throw new Error("Login succeeded but customer details were not returned.");
      sessionStorage.setItem("rkChocoCurrentUser", JSON.stringify(customer));
      setSuccess("Login Successful! Welcome to RK Choco.");
      window.setTimeout(() => { window.location.href = "/"; }, 700);
    } catch (error) {
      setError(error.message || "Unable to log in. Please try again.");
    }
  };

  return (
    <div style={authPageStyle}>
      <div style={authSingleBoxStyle}>
        <div
          style={{
            padding: "45px 50px",
            background: "#fffdf9"
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px"
            }}
          >
            <div
              style={{
                width: "65px",
                height: "65px",
                margin:
                  "0 auto 15px",
                borderRadius: "50%",
                background: "#f5e4c8",
                color:
                  theme.primary,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "25px"
              }}
            >
              <FaUser />
            </div>

            <h1
              style={{
                fontFamily:
                  "Georgia,serif",
                color:
                  theme.dark,
                fontSize:
                  "40px",
                margin:
                  "0 0 7px"
              }}
            >
              Welcome Back
            </h1>

            <p
              style={{
                color:
                  theme.muted
              }}
            >
              Login to your RK Choco account
            </p>
          </div>

          {error && (
            <div
              style={{
                background:
                  "#fff0ed",
                color:
                  theme.red,
                border:
                  "1px solid #e3aaa0",
                padding: "12px",
                borderRadius:
                  "10px",
                marginBottom:
                  "18px",
                fontWeight: 700
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background:
                  "#e9f8ef",
                color:
                  theme.green,
                border:
                  "1px solid #8bd6a8",
                padding:
                  "13px 15px",
                borderRadius:
                  "10px",
                marginBottom:
                  "18px",
                fontWeight: 800,
                textAlign:
                  "center"
              }}
            >
              <FaCheckCircle />{" "}
              &nbsp;
              {success}
            </div>
          )}

          <form onSubmit={login}>
            <AuthLabel
              icon={<FaEnvelope />}
              text="Email Address"
            />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              style={
                authInputStyle
              }
            />

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginTop: "20px",
                marginBottom:
                  "8px"
              }}
            >
              <AuthLabel
                icon={<FaLock />}
                text="Password"
              />

              <button
                type="button"
                onClick={() =>
                  (window.location.href =
                    "/forgot-password")
                }
                style={{
                  border: "none",
                  background:
                    "none",
                  color:
                    theme.primary2,
                  fontWeight:
                    900,
                  cursor:
                    "pointer"
                }}
              >
                Forgot Password?
              </button>
            </div>

            <div
              style={{
                position:
                  "relative"
              }}
            >
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your password"
                style={{
                  ...authInputStyle,
                  paddingRight:
                    "50px"
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position:
                    "absolute",
                  right: "14px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background:
                    "none",
                  color:
                    theme.muted,
                  cursor:
                    "pointer"
                }}
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>

            <button
              type="submit"
              style={{
                ...mainButtonStyle,
                width: "100%",
                marginTop:
                  "25px"
              }}
            >
              <FaUser /> &nbsp;
              Login
            </button>
          </form>

          <p
            style={{
              textAlign:
                "center",
              color:
                theme.muted,
              marginTop:
                "22px"
            }}
          >
            Don't have an account?

            <button
              onClick={() =>
                (window.location.href =
                  "/register")
              }
              style={{
                border: "none",
                background:
                  "none",
                color:
                  theme.primary2,
                fontWeight:
                  900,
                cursor:
                  "pointer"
              }}
            >
              Register
            </button>
          </p>

          <BackButton />
        </div>
      </div>
    </div>
  );
}

function AuthLabel({
  icon,
  text
}) {
  return (
    <label
      style={{
        display: "block",
        color: theme.text,
        fontWeight: 900,
        marginBottom: "8px"
      }}
    >
      {icon} &nbsp; {text}
    </label>
  );
}

const authInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #dfc7a4",
  outline: "none",
  background: "#fffdfa",
  color: theme.text,
  fontSize: "15px"
};

/* =========================================================
   FORGOT PASSWORD PAGE
========================================================= */

function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const resetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError("Please fill all the fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    try {
      const result = await apiRequest("/customers/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          confirmPassword
        })
      });
      setMessage(result.message || "Password changed successfully.");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.message || "Unable to reset password.");
    }
  };

  return (
    <div style={authPageStyle}>
      <div style={authSingleBoxStyle}>
        <div
          style={{
            padding: "40px 50px",
            background: "#fffdf9"
          }}
        >
          <div
            style={{
              textAlign:
                "center",
              marginBottom:
                "22px"
            }}
          >
            <div
              style={{
                width: "65px",
                height: "65px",
                margin:
                  "0 auto 12px",
                borderRadius:
                  "50%",
                background:
                  "#f5e4c8",
                color:
                  theme.primary,
                display: "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
                fontSize:
                  "25px"
              }}
            >
              <FaKey />
            </div>

            <h1
              style={{
                fontFamily:
                  "Georgia,serif",
                color:
                  theme.dark,
                fontSize:
                  "38px",
                margin:
                  "0 0 6px"
              }}
            >
              Forgot Password
            </h1>

            <p
              style={{
                color:
                  theme.muted,
                margin: 0
              }}
            >
              Verify your account and create a
              new password.
            </p>
          </div>

          {error && (
            <div
              style={{
                background:
                  "#fff0ed",
                border:
                  "1px solid #e1aaa0",
                color:
                  theme.red,
                padding:
                  "12px",
                borderRadius:
                  "10px",
                marginBottom:
                  "15px",
                fontWeight:
                  700
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                background:
                  "#eaf8ef",
                border:
                  "1px solid #93d7aa",
                color:
                  theme.green,
                padding:
                  "12px",
                borderRadius:
                  "10px",
                marginBottom:
                  "15px",
                fontWeight:
                  700,
                textAlign:
                  "center"
              }}
            >
              <FaCheckCircle /> &nbsp;
              {message}
            </div>
          )}

          <form onSubmit={resetPassword}>
            <AuthLabel
              icon={<FaEnvelope />}
              text="Email Address"
            />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter registered email"
              style={
                authInputStyle
              }
            />

            <div
              style={{
                marginTop:
                  "17px"
              }}
            >
              <AuthLabel
                icon={<FaPhone />}
                text="Phone Number"
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="Enter registered phone number"
                style={
                  authInputStyle
                }
              />
            </div>

            <div
              style={{
                marginTop:
                  "17px"
              }}
            >
              <AuthLabel
                icon={<FaLock />}
                text="New Password"
              />

              <div
                style={{
                  position:
                    "relative"
                }}
              >
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                  style={{
                    ...authInputStyle,
                    paddingRight:
                      "50px"
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={{
                    position:
                      "absolute",
                    right: "14px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    border: "none",
                    background:
                      "none",
                    color:
                      theme.muted,
                    cursor:
                      "pointer"
                  }}
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "17px"
              }}
            >
              <AuthLabel
                icon={<FaLock />}
                text="Confirm Password"
              />

              <div
                style={{
                  position:
                    "relative"
                }}
              >
                <input
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  style={{
                    ...authInputStyle,
                    paddingRight:
                      "50px"
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(
                      !showConfirm
                    )
                  }
                  style={{
                    position:
                      "absolute",
                    right: "14px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    border: "none",
                    background:
                      "none",
                    color:
                      theme.muted,
                    cursor:
                      "pointer"
                  }}
                >
                  {showConfirm ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...mainButtonStyle,
                width: "100%",
                marginTop:
                  "23px"
              }}
            >
              <FaKey /> &nbsp;
              Reset Password
            </button>
          </form>

          <button
            onClick={() =>
              (window.location.href =
                "/login")
            }
            style={{
              width: "100%",
              marginTop:
                "15px",
              border:
                "1px solid #c9984d",
              background:
                "#fffaf2",
              color:
                theme.primary,
              borderRadius:
                "10px",
              padding:
                "12px",
              fontWeight:
                900,
              cursor:
                "pointer"
            }}
          >
            <FaArrowLeft /> &nbsp;
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REGISTER PAGE
========================================================= */

function RegisterPage() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const register = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !password || !confirmPassword) {
      setError("Please fill all the fields.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    try {
      const result = await apiRequest("/customers/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          password
        })
      });
      setSuccess(result.message || "Registration successful. Your account has been saved.");
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => { window.location.href = "/login"; }, 900);
    } catch (error) {
      setError(error.message || "Unable to register. Please try again.");
    }
  };

  return (
    <div style={authPageStyle}>
      <div style={authSingleBoxStyle}>
        <div
          style={{
            padding: "35px 50px",
            background: "#fffdf9"
          }}
        >
          <div
            style={{
              textAlign:
                "center",
              marginBottom:
                "20px"
            }}
          >
            <h1
              style={{
                fontFamily:
                  "Georgia,serif",
                color:
                  theme.dark,
                fontSize:
                  "38px",
                margin: 0
              }}
            >
              Create Account
            </h1>

            <p
              style={{
                color:
                  theme.muted
              }}
            >
              Join RK Choco today
            </p>
          </div>

          {error && (
            <div
              style={{
                background:
                  "#fff0ed",
                color:
                  theme.red,
                border:
                  "1px solid #e1aaa0",
                padding:
                  "11px",
                borderRadius:
                  "10px",
                marginBottom:
                  "14px",
                fontWeight:
                  700
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background:
                  "#e9f8ef",
                color:
                  theme.green,
                border:
                  "1px solid #8bd6a8",
                padding:
                  "13px 15px",
                borderRadius:
                  "10px",
                marginBottom:
                  "18px",
                fontWeight:
                  800,
                textAlign:
                  "center"
              }}
            >
              <FaCheckCircle />{" "}
              &nbsp;
              {success}
            </div>
          )}

          <form onSubmit={register}>
            <AuthLabel
              icon={<FaUser />}
              text="Full Name"
            />

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Enter your full name"
              style={
                authInputStyle
              }
            />

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "15px",
                marginTop:
                  "15px"
              }}
            >
              <div>
                <AuthLabel
                  icon={
                    <FaEnvelope />
                  }
                  text="Email"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Email"
                  style={
                    authInputStyle
                  }
                />
              </div>

              <div>
                <AuthLabel
                  icon={
                    <FaPhone />
                  }
                  text="Phone"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="Phone number"
                  style={
                    authInputStyle
                  }
                />
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "15px"
              }}
            >
              <AuthLabel
                icon={
                  <FaMapMarkerAlt />
                }
                text="Address"
              />

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                placeholder="Enter your address"
                rows="3"
                style={{
                  ...authInputStyle,
                  resize:
                    "vertical"
                }}
              />
            </div>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "15px",
                marginTop:
                  "15px"
              }}
            >
              <div>
                <AuthLabel
                  icon={
                    <FaLock />
                  }
                  text="Password"
                />

                <div
                  style={{
                    position:
                      "relative"
                  }}
                >
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Password"
                    style={{
                      ...authInputStyle,
                      paddingRight:
                        "45px"
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    style={{
                      position:
                        "absolute",
                      right:
                        "12px",
                      top:
                        "50%",
                      transform:
                        "translateY(-50%)",
                      border:
                        "none",
                      background:
                        "none",
                      cursor:
                        "pointer",
                      color:
                        theme.muted
                    }}
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <AuthLabel
                  icon={
                    <FaLock />
                  }
                  text="Confirm Password"
                />

                <div
                  style={{
                    position:
                      "relative"
                  }}
                >
                  <input
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm password"
                    style={{
                      ...authInputStyle,
                      paddingRight:
                        "45px"
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        !showConfirm
                      )
                    }
                    style={{
                      position:
                        "absolute",
                      right:
                        "12px",
                      top:
                        "50%",
                      transform:
                        "translateY(-50%)",
                      border:
                        "none",
                      background:
                        "none",
                      cursor:
                        "pointer",
                      color:
                        theme.muted
                    }}
                  >
                    {showConfirm ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...mainButtonStyle,
                width: "100%",
                marginTop:
                  "22px"
              }}
            >
              <FaUserPlus /> &nbsp;
              Create Account
            </button>
          </form>

          <p
            style={{
              textAlign:
                "center",
              color:
                theme.muted,
              marginTop:
                "18px"
            }}
          >
            Already have an account?

            <button
              onClick={() =>
                (window.location.href =
                  "/login")
              }
              style={{
                border: "none",
                background:
                  "none",
                color:
                  theme.primary2,
                fontWeight:
                  900,
                cursor:
                  "pointer"
              }}
            >
              Login
            </button>
          </p>

          <BackButton />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCTS WRAPPER
========================================================= */

function ProductsPage() {
  return (
    <div style={pageStyle}>
      <Navbar />

      <main
        style={{
          padding: "25px"
        }}
      >
        <div
          style={{
            maxWidth: "1250px",
            margin: "0 auto 20px"
          }}
        >
          <BackButton
            text="Back to Home"
            path="/"
          />
        </div>

        <Products />
      </main>
    </div>
  );
}

/* =========================================================
   PROFILE PAGE
   Customer details loaded from MongoDB session
========================================================= */

function ProfilePage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setError("");

        const result = await apiRequest("/customers/session");

        if (!result.success || !result.customer) {
          throw new Error("Please log in to view your profile.");
        }

        if (active) {
          setCustomer(result.customer);
          sessionStorage.setItem(
            "rkChocoCurrentUser",
            JSON.stringify(result.customer)
          );
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load profile.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await apiRequest("/customers/logout", {
        method: "POST"
      });

      sessionStorage.removeItem("rkChocoCurrentUser");
      sessionStorage.removeItem(ORDER_KEY);

      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  const profileRow = (label, value) => (
    <div
      key={label}
      style={{
        padding: "16px 0",
        borderBottom: "1px solid #f0e2cd"
      }}
    >
      <div
        style={{
          color: theme.muted,
          fontSize: "13px",
          fontWeight: 800,
          marginBottom: "6px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: theme.dark,
          fontSize: "16px",
          fontWeight: 700,
          overflowWrap: "anywhere"
        }}
      >
        {value || "Not provided"}
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <Navbar />

      <main
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          padding: "30px 20px 60px"
        }}
      >
        <BackButton text="Back to Home" path="/" />

        <div
          style={{
            ...cardStyle,
            padding: "30px",
            marginTop: "25px"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                margin: "0 auto 15px",
                background: "#f5e4c8",
                color: theme.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px"
              }}
            >
              <FaUser />
            </div>

            <h1
              style={{
                color: theme.dark,
                fontFamily: "Georgia,serif",
                fontSize: "38px",
                margin: "0 0 8px"
              }}
            >
              My Profile
            </h1>

            <p style={{ color: theme.muted, margin: 0 }}>
              Your RK Choco account details
            </p>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: "25px" }}>
              Loading your profile from MongoDB...
            </p>
          ) : error ? (
            <div
              style={{
                background: "#fff0ed",
                color: theme.red,
                border: "1px solid #e1aaa0",
                borderRadius: "10px",
                padding: "15px",
                textAlign: "center"
              }}
            >
              <p>{error}</p>

              <button
                onClick={() => {
                  window.location.href = "/login";
                }}
                style={mainButtonStyle}
              >
                <FaUser /> Login
              </button>
            </div>
          ) : customer ? (
            <>
              {profileRow("Full Name", customer.name)}
              {profileRow("Email Address", customer.email)}
              {profileRow("Phone Number", customer.phone)}
              {profileRow("Delivery Address", customer.address)}

              <button
                onClick={logout}
                disabled={loggingOut}
                style={{
                  ...mainButtonStyle,
                  width: "100%",
                  marginTop: "25px",
                  background: "#fff",
                  color: theme.red,
                  border: "1px solid #d8a39b",
                  boxShadow: "none",
                  opacity: loggingOut ? 0.7 : 1
                }}
              >
                <FaTimesCircle /> &nbsp;
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <LoginPage />;
  }

  if (path === "/register") {
    return <RegisterPage />;
  }

  if (path === "/forgot-password") {
    return <ForgotPasswordPage />;
  }

  if (path === "/profile") {
    return <ProfilePage />;
  }

  if (path === "/products") {
    return <ProductsPage />;
  }

  if (path === "/brands") {
    return <BrandsPage />;
  }

  if (path === "/cart") {
    return <CartPage />;
  }

  if (path === "/orders") {
    return <OrdersPage />;
  }

  if (path === "/order-details") {
    return <OrderDetailsPage />;
  }

  if (path === "/order-success") {
    return <OrderSuccessPage />;
  }

  return <HomePage />;
}

export default App;