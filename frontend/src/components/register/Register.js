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
  FaTruck
} from "react-icons/fa";

import "./Register.css";
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
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
    <div className="register-page">

      {/* Chocolate background */}

      <div className="register-chocolate register-chocolate-1">
        🍫
      </div>

      <div className="register-chocolate register-chocolate-2">
        🍫
      </div>

      <div className="register-chocolate register-chocolate-3">
        🍫
      </div>

      <div className="register-chocolate register-chocolate-4">
        🍫
      </div>


      {/* Home */}

      <Link
        to="/"
        className="register-home-button"
      >
        <FaHome />
        <span>Back to Home</span>
      </Link>


      <div className="register-card-container">

        {/* LEFT */}

        <div className="register-left">

          <div className="register-logo">
            RK
          </div>

          <div className="register-left-content">

            <div className="register-badge">
              <FaChocolateBar />
              <span>JOIN RK CHOCO</span>
            </div>

            <h1>
              Grow Your
              <br />

              <span>
                Sweet Business.
              </span>
            </h1>

            <p>
              Create your RK Choco account and
              manage your chocolate business
              with ease.
            </p>

            <div className="register-features">

              <div className="register-feature">

                <div className="register-feature-icon">
                  <FaStore />
                </div>

                <div>
                  <strong>
                    Shop Management
                  </strong>

                  <small>
                    Manage your shop easily.
                  </small>
                </div>

              </div>


              <div className="register-feature">

                <div className="register-feature-icon">
                  <FaTruck />
                </div>

                <div>
                  <strong>
                    Easy Ordering
                  </strong>

                  <small>
                    Order chocolates easily.
                  </small>
                </div>

              </div>


              <div className="register-feature">

                <div className="register-feature-icon">
                  <FaShieldAlt />
                </div>

                <div>
                  <strong>
                    Trusted Service
                  </strong>

                  <small>
                    Reliable distribution support.
                  </small>
                </div>

              </div>

            </div>

          </div>

          <p className="register-footer">
            © 2026 RK Choco Distributors
          </p>

        </div>


        {/* RIGHT */}

        <div className="register-right">

          <div className="register-heading">

            <div className="register-icon">
              <FaStore />
            </div>

            <div>

              <span>
                RK CHOCO
              </span>

              <h2>
                Create Account
              </h2>

            </div>

          </div>

          <p className="register-description">
            Register your shop and start ordering.
          </p>


          <form onSubmit={handleSubmit}>

            {/* NAME + SHOP */}

            <div className="register-two-column">

              <div>

                <label>
                  Owner Name
                </label>

                <div className="register-input-box">

                  <FaUser />

                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div>

                <label>
                  Shop Name
                </label>

                <div className="register-input-box">

                  <FaStore />

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

            <label>
              Email Address
            </label>

            <div className="register-input-box">

              <FaEnvelope />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />

            </div>


            {/* PHONE */}

            <label>
              Phone Number
            </label>

            <div className="register-input-box">

              <FaPhone />

              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />

            </div>


            {/* PASSWORD */}

            <div className="register-two-column">

              <div>

                <label>
                  Password
                </label>

                <div className="register-input-box">

                  <FaLock />

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
                    className="register-eye-button"
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


              <div>

                <label>
                  Confirm Password
                </label>

                <div className="register-input-box">

                  <FaLock />

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
                    className="register-eye-button"
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

            <label className="register-terms">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the RK Choco terms
                and conditions.
              </span>

            </label>


            {/* REGISTER */}

            <button
              type="submit"
              className="register-submit"
            >
              Create My Account
              <FaArrowRight />
            </button>

          </form>


          <div className="register-divider">
            <span>OR</span>
          </div>


          <p className="register-login">

            Already have an account?

            <Link to="/login">
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;