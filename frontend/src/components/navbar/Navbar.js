import React from "react";

import {
  FaHome,
  FaBoxOpen,
  FaTags,
  FaClipboardList,
  FaUser,
  FaUserPlus
} from "react-icons/fa";

import "./Navbar.css";

function Navbar() {
  return (
    <header className="rk-navbar">

      <div className="rk-navbar-container">

        {/* LOGO */}

        <div className="rk-brand">

          <div className="rk-logo-box">
            RK
          </div>

          <div className="rk-brand-text">

            <h2>
              RK Choco
            </h2>

            <p>
              Premium Chocolate Distributor
            </p>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="rk-navigation">

          <a href="/">
            <FaHome />
            <span>Home</span>
          </a>

          <a href="/products">
            <FaBoxOpen />
            <span>Products</span>
          </a>

          <a href="/brands">
            <FaTags />
            <span>Brands</span>
          </a>

          <a href="/orders">
            <FaClipboardList />
            <span>Orders</span>
          </a>

        </nav>


        {/* LOGIN + REGISTER */}

        <div className="rk-auth-buttons">

          <a
            href="/login"
            className="rk-login-button"
          >
            <FaUser />
            <span>Login</span>
          </a>


          <a
            href="/register"
            className="rk-register-button"
          >
            <FaUserPlus />
            <span>Register</span>
          </a>

        </div>

      </div>

    </header>
  );
}

export default Navbar;