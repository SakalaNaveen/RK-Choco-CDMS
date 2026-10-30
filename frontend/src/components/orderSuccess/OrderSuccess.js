import React, { useState } from "react";
import "./OrderSuccess.css";

import {
  FaCheckCircle,
  FaShoppingBag,
  FaClipboardList,
  FaClipboardCheck,
  FaClock,
} from "react-icons/fa";

function OrderSuccess() {

  const [order] = useState(() => {

    try {

      const storedOrder =
        localStorage.getItem("rkChocoOrder");

      return storedOrder
        ? JSON.parse(storedOrder)
        : null;

    } catch (error) {

      console.error(
        "Unable to read completed order:",
        error
      );

      return null;
    }

  });


  const orderId =
    order?.orderId ||
    order?.id ||
    `ORD-${Date.now()}`;


  const orderStatus =
    order?.orderStatus ||
    "Order Received";


  const getOrderDateTime = () => {

    const value =
      order?.orderDateTime ||
      order?.orderDate ||
      order?.createdAt;


    if (!value) {

      return new Date().toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }
      );

    }


    const date = new Date(value);


    if (Number.isNaN(date.getTime())) {

      return value;

    }


    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
    );

  };


  const continueShopping = () => {

    window.location.href =
      "/products";

  };


  const viewMyOrders = () => {

    window.location.href =
      "/orders";

  };


  return (

    <div className="success-page">

      <div className="success-card">

        {/* SUCCESS ICON */}

        <div className="success-icon-wrapper">

          <FaCheckCircle
            className="success-icon"
          />

          <span className="success-sparkle sparkle-one">
            ✦
          </span>

          <span className="success-sparkle sparkle-two">
            ✦
          </span>

        </div>


        {/* LABEL */}

        <div className="success-label">
          ORDER CONFIRMED
        </div>


        {/* TITLE */}

        <h1>
          Order Successfully Placed!
        </h1>


        {/* DIVIDER */}

        <div className="success-divider">

          <span></span>

          <span className="divider-symbol">
            ❧
          </span>

          <span></span>

        </div>


        {/* THANK YOU */}

        <h2 className="thank-you-title">

          <span>❧</span>

          Thank you for your order!

          <span>❧</span>

        </h2>


        {/* MESSAGE */}

        <div className="success-notification success-main-message">

          <FaClipboardCheck />

          <div>

            <strong>
              We have received your order
              and it is being processed.
            </strong>

            <small>
              You will receive an order
              confirmation shortly.
            </small>

          </div>

        </div>


        {/* ONLY ORDER INFORMATION */}

        <div className="order-information">

          {/* DATE & TIME */}

          <div className="order-info-row">

            <div className="order-info-left">

              <FaClock />

              <span>
                Order Date &amp; Time
              </span>

            </div>


            <strong>
              {getOrderDateTime()}
            </strong>

          </div>


          {/* ORDER ID */}

          <div className="order-info-row">

            <div className="order-info-left">

              <FaClipboardCheck />

              <span>
                Order ID
              </span>

            </div>


            <strong>
              {orderId}
            </strong>

          </div>


          {/* ORDER STATUS */}

          <div className="order-info-row">

            <div className="order-info-left">

              <FaCheckCircle />

              <span>
                Order Status
              </span>

            </div>


            <strong className="order-status">
              {orderStatus}
            </strong>

          </div>

        </div>


        {/* NOTIFICATION */}

        <div className="delivery-notification">

          <FaClock />

          <span>
            We will notify you when your
            order is on the way!
          </span>

        </div>


        {/* BUTTONS */}

        <div className="success-buttons">

          {/* CONTINUE SHOPPING */}

          <button
            className="success-shopping"
            onClick={continueShopping}
          >

            <FaShoppingBag />

            Continue Shopping

          </button>


          {/* VIEW MY ORDERS */}

          <button
            className="success-orders"
            onClick={viewMyOrders}
          >

            <FaClipboardList />

            View My Orders

          </button>

        </div>

      </div>

    </div>

  );

}

export default OrderSuccess;