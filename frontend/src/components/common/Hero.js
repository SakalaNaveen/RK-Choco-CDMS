import "./Hero.css";

function Hero() {
  return (
    <section className="hero-section">

      <div className="hero-content">

        <h1>
          Chocolate Distribution
          <br />
          Management System
        </h1>

        <p>
          A smart platform for chocolate distributors and shop owners.
          Manage products, stock, and orders easily from anywhere.
        </p>

        <div className="hero-buttons">

          <button className="primary-btn">
            Shop Login
          </button>

          <button className="secondary-btn">
            Admin Login
          </button>

        </div>

      </div>

    </section>
  );
}

export default Hero;