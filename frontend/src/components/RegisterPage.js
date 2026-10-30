import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaChocolateBar,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaHome,
  FaStore,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";

import "./Auth.css";

import { registerUser } from "../utils/auth";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shopName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.shopName ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      alert("Passwords do not match");
      return;
    }

    registerUser(formData);

    alert("Registration successful!");

    navigate("/login");
  };

  return (
    <div className="auth-page register-page">

      {/* Chocolate background */}

      <div className="choco-floating choco-one">🍫</div>
      <div className="choco-floating choco-two">🍫</div>
      <div className="choco-floating choco-three">🍫</div>
      <div className="choco-floating choco-four">🍫</div>
      <div className="choco-floating choco-five">🍫</div>

      {/* Home */}

      <Link
        to="/"
        className="auth-home-button"
      >
        <FaHome />
        <span>Back to Home</span>
      </Link>

      {/* Main */}

      <div className="auth-container register-container">

        {/* LEFT */}

        <div className="auth-showcase">

          <div className="showcase-logo">

            <div className="rk-mini-logo">
              RK
            </div>

            <div>
              <h2>RK Choco</h2>

              <p>
                Premium Chocolate Distributor
              </p>
            </div>

          </div>

          <div className="showcase-content">

            <div className="animated-badge">

              <FaStore />

              <span>
                JOIN RK CHOCO
              </span>

            </div>

            <h1>
              Grow Your
              <br />

              <span className="animated-word">
                Sweet Business.
              </span>
            </h1>

            <p>
              Create your shop account and enjoy a smarter
              way to order premium chocolates from RK Choco
              Distributors.
            </p>

            <div className="showcase-features">

              <div className="feature-card">

                <div className="feature-icon">
                  <FaStore />
                </div>

                <div>

                  <strong>
                    Shop Management
                  </strong>

                  <small>
                    Manage your shop orders easily.
                  </small>

                </div>

              </div>

              <div className="feature-card">

                <div className="feature-icon">
                  <FaTruck />
                </div>

                <div>

                  <strong>
                    Easy Ordering
                  </strong>

                  <small>
                    Order chocolates from anywhere.
                  </small>

                </div>

              </div>

              <div className="feature-card">

                <div className="feature-icon">
                  <FaShieldAlt />
                </div>

                <div>

                  <strong>
                    Trusted Service
                  </strong>

                  <small>
                    Professional distribution support.
                  </small>

                </div>

              </div>

            </div>

          </div>

          <div className="showcase-footer">
            © 2026 RK Choco Distributors
          </div>

        </div>

        {/* RIGHT */}

        <div className="auth-form-area">

          <div className="auth-card register-card">

            <div className="auth-card-top">

              <div className="auth-icon-circle">
                <FaStore />
              </div>

              <div>

                <span className="small-title">
                  RK CHOCO
                </span>

                <h2>
                  Create Account
                </h2>

              </div>

            </div>

            <p className="auth-subtitle">
              Register your shop and start ordering.
            </p>

            <form onSubmit={handleSubmit}>

              {/* OWNER + SHOP */}

              <div className="two-column">

                <div className="input-group">

                  <label>
                    Owner Name
                  </label>

                  <div className="input-wrapper">

                    <FaUser className="input-icon" />

                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                    />

                  </div>

                </div>

                <div className="input-group">

                  <label>
                    Shop Name
                  </label>

                  <div className="input-wrapper">

                    <FaStore className="input-icon" />

                    <input
                      type="text"
                      name="shopName"
                      placeholder="Shop name"
                      value={formData.shopName}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </div>

              {/* EMAIL */}

              <div className="input-group">

                <label>
                  Email Address
                </label>

                <div className="input-wrapper">

                  <FaEnvelope className="input-icon" />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* PHONE */}

              <div className="input-group">

                <label>
                  Phone Number
                </label>

                <div className="input-wrapper">

                  <FaPhone className="input-icon" />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="two-column">

                <div className="input-group">

                  <label>
                    Password
                  </label>

                  <div className="input-wrapper">

                    <FaLock className="input-icon" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    <button
                      type="button"
                      className="password-button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM */}

                <div className="input-group">

                  <label>
                    Confirm Password
                  </label>

                  <div className="input-wrapper">

                    <FaLock className="input-icon" />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      placeholder="Confirm"
                      value={
                        formData.confirmPassword
                      }
                      onChange={handleChange}
                    />

                    <button
                      type="button"
                      className="password-button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

              </div>

              {/* TERMS */}

              <label className="terms-check">

                <input
                  type="checkbox"
                  required
                />

                <span>
                  I agree to the RK Choco terms and
                  conditions.
                </span>

              </label>

              {/* REGISTER */}

              <button
                type="submit"
                className="auth-submit-button"
              >
                <span>
                  Create My Account
                </span>

                <FaArrowRight />
              </button>

            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <p className="switch-text">

              Already have an account?

              <Link to="/login">
                {" "}Login
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;