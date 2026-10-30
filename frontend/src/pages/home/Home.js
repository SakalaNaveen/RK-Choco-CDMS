import React from "react";

import {
  FaCrown,
  FaShoppingBag,
  FaPlay,
  FaStore,
  FaTags,
  FaTruck,
  FaAward,
} from "react-icons/fa";

import Navbar from "../../components/navbar/Navbar";
import ChocolateHero from "../../components/chocolateHero/ChocolateHero";

import "./Home.css";

function Home() {
  return (
    <div className="rk-home">

      {/* =====================================
          NAVBAR
      ====================================== */}

      <Navbar />


      {/* =====================================
          HERO SECTION
      ====================================== */}

      <section className="hero-section">

        <div className="hero-container">

          {/* =================================
              LEFT SIDE
          ================================== */}

          <div className="hero-left">

            <div className="premium-badge">
              <FaCrown />
              <span>
                PREMIUM CHOCOLATE DISTRIBUTOR
              </span>
            </div>


            <h1>
              India's Trusted

              <span>
                Chocolate
              </span>

              <span>
                Distributor
              </span>
            </h1>


            <div className="gold-divider">

              <span></span>

              <span>
                ✦
              </span>

              <span></span>

            </div>


            <p className="hero-description">
              We deliver premium chocolates to retail stores,
              supermarkets and wholesale partners with quality,
              trust and fast delivery.
            </p>


            <div className="hero-actions">

              <button
                type="button"
                className="explore-button"
              >

                <FaShoppingBag />

                <span>
                  Explore Products
                </span>

                <span className="button-arrow">
                  ›
                </span>

              </button>


              <button
                type="button"
                className="story-button"
              >

                <FaPlay />

                <span>
                  Our Story
                </span>

              </button>

            </div>

          </div>


          {/* =================================
              RIGHT SIDE CHOCOLATE DESIGN
          ================================== */}

          <div className="hero-right">

            <ChocolateHero />

          </div>

        </div>


        {/* =====================================
            BUSINESS STATISTICS
        ====================================== */}

        <div className="statistics-card">


          {/* RETAIL STORES */}

          <div className="stat-item">

            <div className="stat-icon">
              <FaStore />
            </div>

            <div className="stat-text">

              <strong>
                500+
              </strong>

              <span>
                Retail Stores
              </span>

            </div>

          </div>


          <div className="stat-divider"></div>


          {/* BRANDS */}

          <div className="stat-item">

            <div className="stat-icon">
              <FaTags />
            </div>

            <div className="stat-text">

              <strong>
                20+
              </strong>

              <span>
                Brands
              </span>

            </div>

          </div>


          <div className="stat-divider"></div>


          {/* SUPPORT */}

          <div className="stat-item">

            <div className="stat-icon">
              <FaTruck />
            </div>

            <div className="stat-text">

              <strong>
                24/7
              </strong>

              <span>
                Support
              </span>

            </div>

          </div>


          <div className="stat-divider"></div>


          {/* QUALITY */}

          <div className="stat-item">

            <div className="stat-icon">
              <FaAward />
            </div>

            <div className="stat-text">

              <strong>
                100%
              </strong>

              <span>
                Quality Assured
              </span>

            </div>

          </div>


        </div>

      </section>

    </div>
  );
}

export default Home;