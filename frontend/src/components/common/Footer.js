import { FaFacebook, FaInstagram, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-section">
          <h2>🍫 CDMS</h2>
          <p>
            Chocolate Distribution Management System for distributors and shop owners.
          </p>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>

          <p><FaPhoneAlt /> +91 9876543210</p>

          <p><FaEnvelope /> cdms@gmail.com</p>
        </div>

        <div className="footer-section">

          <h3>Follow Us</h3>

          <div className="social-icons">
            <FaFacebook />
            <FaInstagram />
          </div>

        </div>

      </div>

      <hr />

      <p className="copyright">
        © 2026 Chocolate Distribution Management System. All Rights Reserved.
      </p>

    </footer>
  );
}

export default Footer;