import React, { useState } from "react";

import {
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaBoxOpen,
  FaShoppingBag,
  FaHome,
  FaArrowLeft,
} from "react-icons/fa";

import "./Orders.css";

const ORDER_KEY = "rkChocoOrder";

function Orders() {
  const [order] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          ORDER_KEY
        );

      if (!saved) {
        return null;
      }

      return JSON.parse(saved);
    } catch (error) {
      console.error(
        "Order read error:",
        error
      );

      return null;
    }
  });

  /* =================================================
     NO ORDER
  ================================================= */

  if (!order) {
    return (
      <div className="orders-page">

        {/* BACK TO PRODUCTS */}

        <button
          type="button"
          className="orders-back-products"
          onClick={() =>
            (window.location.href =
              "/products")
          }
        >
          <FaArrowLeft />
          Back to Products
        </button>

        <div className="orders-container">

          <div className="orders-empty-card">

            <div className="orders-empty-icon">
              <FaClipboardList />
            </div>

            <span className="orders-label">
              MY ORDERS
            </span>

            <h1>
              No Orders Found
            </h1>

            <p>
              You have not placed any orders yet.
            </p>

            <button
              className="orders-primary-button"
              onClick={() =>
                (window.location.href =
                  "/products")
              }
            >
              <FaShoppingBag />
              Continue Shopping
            </button>

          </div>
        </div>
      </div>
    );
  }

  const orderId =
    order.orderId ||
    order.id ||
    "ORD-" +
      Date.now();

  const orderDate =
    order.orderDate ||
    order.orderDateTime ||
    order.createdAt ||
    new Date().toLocaleString(
      "en-IN"
    );

  const orderStatus =
    order.status ||
    "Order Received";

  const totalBoxes =
    Number(
      order.totalBoxes ||
        0
    );

  const totalAmount =
    Number(
      order.totalAmount ||
        order.total ||
        0
    );

  const continueShopping = () => {
    window.location.href =
      "/products";
  };

  const goHome = () => {
    window.location.href =
      "/";
  };

  const goBack = () => {
    window.history.back();
  };

  const products =
    order.products ||
    order.items ||
    [];

  return (
    <div className="orders-page">

      {/* BACK TO PRODUCTS */}

      <button
        type="button"
        className="orders-back-products"
        onClick={
          continueShopping
        }
      >
        <FaArrowLeft />
        Back to Products
      </button>

      <div className="orders-container">

        <div className="orders-header">

          <div>

            <div className="orders-label">
              RK CHOCO
            </div>

            <h1>
              My Orders
            </h1>

            <p>
              View and track your RK Choco orders.
            </p>

          </div>

          <div className="orders-header-icon">
            <FaClipboardList />
          </div>

        </div>

        <div className="order-card">

          <div className="order-card-top">

            <div>

              <span className="order-small-label">
                ORDER ID
              </span>

              <h2>
                {orderId}
              </h2>

            </div>

            <div className="order-status">

              <FaCheckCircle />

              <span>
                {orderStatus}
              </span>

            </div>

          </div>

          <div className="order-info-grid">

            <div className="order-info-box">

              <div className="order-info-icon">
                <FaClock />
              </div>

              <div>

                <span>
                  Order Date &amp; Time
                </span>

                <strong>
                  {orderDate}
                </strong>

              </div>

            </div>

            <div className="order-info-box">

              <div className="order-info-icon">
                <FaBoxOpen />
              </div>

              <div>

                <span>
                  Total Boxes
                </span>

                <strong>
                  {totalBoxes}
                </strong>

              </div>

            </div>

            <div className="order-info-box">

              <div className="order-info-icon">
                ₹
              </div>

              <div>

                <span>
                  Grand Total
                </span>

                <strong className="orders-total">
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>

          </div>

          <div className="customer-section">

            <div className="section-title">
              Customer Details
            </div>

            <div className="customer-grid">

              <div>

                <span>
                  Customer
                </span>

                <strong>
                  {order.customerName ||
                    "N/A"}
                </strong>

              </div>

              <div>

                <span>
                  Mobile
                </span>

                <strong>
                  {order.mobile ||
                    order.phone ||
                    "N/A"}
                </strong>

              </div>

              <div className="customer-address">

                <span>
                  Delivery Address
                </span>

                <strong>

                  {order.address ||
                    "N/A"}

                  {order.city
                    ? `, ${order.city}`
                    : ""}

                  {order.pincode
                    ? ` - ${order.pincode}`
                    : ""}

                </strong>

              </div>

            </div>

          </div>

          {products.length >
            0 && (

            <div className="products-section">

              <div className="section-title">
                Ordered Products
              </div>

              <div className="products-list">

                {products.map(
                  (
                    product,
                    index
                  ) => (

                    <div
                      className="ordered-product"
                      key={
                        product.id ||
                        index
                      }
                    >

                      <div className="ordered-product-image">

                        {product.image ? (
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name ||
                              "Chocolate"
                            }
                          />
                        ) : (
                          <FaBoxOpen />
                        )}

                      </div>

                      <div className="ordered-product-details">

                        <span>
                          {product.brand ||
                            "RK Choco"}
                        </span>

                        <h3>
                          {product.name ||
                            "Chocolate Product"}
                        </h3>

                        <p>
                          ₹
                          {
                            product.price ||
                            0
                          }{" "}
                          / Box
                        </p>

                      </div>

                      <div className="ordered-product-quantity">

                        <strong>
                          {
                            product.quantity ||
                            0
                          }
                        </strong>

                        <span>
                          Boxes
                        </span>

                      </div>

                      <div className="ordered-product-total">

                        ₹
                        {Number(
                          product.price ||
                            0
                        ) *
                          Number(
                            product.quantity ||
                              0
                          )}

                      </div>

                    </div>
                  )
                )}

              </div>
            </div>
          )}

          <div className="order-grand-total">

            <span>
              Grand Total
            </span>

            <strong>
              ₹
              {totalAmount.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div className="orders-buttons">

            <button
              className="orders-primary-button"
              onClick={
                continueShopping
              }
            >
              <FaShoppingBag />
              Continue Shopping
            </button>

            <button
              className="orders-secondary-button"
              onClick={goHome}
            >
              <FaHome />
              Back to Home
            </button>

            <button
              className="orders-back-button"
              onClick={goBack}
            >
              <FaArrowLeft />
              Back
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Orders;