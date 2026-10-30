import { FaTruck, FaStore, FaCube } from "react-icons/fa";
import "./Logo.css";

function Logo() {
  return (
    <div className="cdms-logo">

      <div className="logo-emblem">

        <div className="logo-emblem-ring">

          <div className="logo-icon-row">
            <FaTruck />
            <FaStore />
          </div>

          <div className="logo-chocolate">
            <FaCube />
          </div>

          <div className="logo-text">
            CDMS
          </div>

        </div>

      </div>

      <div className="logo-information">
        <h1>CDMS</h1>

        <p>
          Chocolate Distribution Management System
        </p>
      </div>

    </div>
  );
}

export default Logo;