import React from "react";
import "./Footer.css";

import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="rk-footer">

      {/* =========================================
          FOOTER MAIN
      ========================================= */}

      <div className="rk-footer-container">

        {/* =========================================
            COMPANY
        ========================================= */}

        <div className="rk-footer-column rk-footer-company">

          <div className="rk-footer-logo">
            RK
          </div>

          <h2>
            RK Choco
          </h2>

          <p className="rk-footer-tagline">
            Premium Chocolate Distributor
          </p>

          <p className="rk-footer-description">
            We deliver premium chocolates to retail stores,
            supermarkets and wholesale partners with quality,
            trust and reliable service.
          </p>

        </div>


        {/* =========================================
            QUICK LINKS
        ========================================= */}

        <div className="rk-footer-column">

          <h3>
            Quick Links
          </h3>

          <div className="rk-footer-line"></div>

          <a href="/">
            Home
          </a>

          <a href="/products">
            Products
          </a>

          <a href="/#brands">
            Brands
          </a>

          <a href="/#orders">
            Orders
          </a>

        </div>


        {/* =========================================
            CONTACT
        ========================================= */}

        <div className="rk-footer-column">

          <h3>
            Contact Us
          </h3>

          <div className="rk-footer-line"></div>

          <div className="rk-footer-contact">

            <FaPhoneAlt />

            <span>
              +91 XXXXX XXXXX
            </span>

          </div>


          <div className="rk-footer-contact">

            <FaEnvelope />

            <span>
              info@rkchoco.com
            </span>

          </div>


          <div className="rk-footer-contact">

            <FaMapMarkerAlt />

            <span>
              Andhra Pradesh, India
            </span>

          </div>

        </div>


        {/* =========================================
            SOCIAL MEDIA
        ========================================= */}

        <div className="rk-footer-column">

          <h3>
            Follow Us
          </h3>

          <div className="rk-footer-line"></div>

          <p className="rk-footer-social-text">
            Stay connected with RK Choco
            for updates and new products.
          </p>


          <div className="rk-footer-social">

            <a
              href="#facebook"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>


            <a
              href="#instagram"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>


            <a
              href="#whatsapp"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>

          </div>

        </div>

      </div>


      {/* =========================================
          FOOTER BOTTOM
      ========================================= */}

      <div className="rk-footer-bottom">

        <p>
          © {new Date().getFullYear()} RK Choco.
          All Rights Reserved.
        </p>

        <p>
          Premium Chocolate Distributor
        </p>

      </div>

    </footer>
  );
}

export default Footer;