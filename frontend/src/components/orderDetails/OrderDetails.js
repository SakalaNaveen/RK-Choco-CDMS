import React, { useState } from "react";
import "./OrderDetails.css";

import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaStore,
  FaCheck
} from "react-icons/fa";

function OrderDetails({ order, setOrder }) {

  const storedOrder =
    sessionStorage.getItem(
      "rkPendingOrder"
    );


  const initialOrder =
    order ||
    (
      storedOrder
        ? JSON.parse(storedOrder)
        : null
    );


  const [formData, setFormData] =
    useState({
      customerName: "",
      phone: "",
      shopName: "",
      address: ""
    });


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value
    });

  };


  const handleConfirm = (e) => {

    e.preventDefault();


    if (
      !formData.customerName.trim() ||
      !formData.phone.trim() ||
      !formData.shopName.trim() ||
      !formData.address.trim()
    ) {

      alert(
        "Please fill all order details."
      );

      return;
    }


    const finalOrder = {

      ...(initialOrder || {}),

      customerName:
        formData.customerName,

      phone:
        formData.phone,

      shopName:
        formData.shopName,

      address:
        formData.address,

      orderId:
        "RK" +
        Date.now()
          .toString()
          .slice(-5)

    };


    sessionStorage.setItem(
      "rkCompletedOrder",
      JSON.stringify(
        finalOrder
      )
    );


    if (setOrder) {
      setOrder(finalOrder);
    }


    window.location.href =
      "/order-success";
  };


  if (!initialOrder) {

    return (

      <div className="order-details-page">

        <div className="order-form-card">

          <h1>
            No Order Found
          </h1>

          <button
            onClick={() =>
              window.location.href =
                "/products"
            }
          >
            Continue Shopping
          </button>

        </div>

      </div>

    );
  }


  return (

    <div className="order-details-page">

      <div className="order-form-card">

        <span className="order-label">
          ORDER DETAILS
        </span>


        <h1>
          Complete Your Order
        </h1>


        <p className="order-description">
          Please enter your details to
          confirm your chocolate order.
        </p>


        {/* ORDER TOTAL */}

        <div className="order-total-box">

          <span>
            Grand Total
          </span>

          <strong>
            ₹{initialOrder.grandTotal}
          </strong>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleConfirm}
        >

          <div className="form-group">

            <label>
              <FaUser />
              Customer Name
            </label>

            <input
              type="text"
              name="customerName"
              value={
                formData.customerName
              }
              onChange={handleChange}
              placeholder="Enter your name"
            />

          </div>


          <div className="form-group">

            <label>
              <FaPhone />
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={
                formData.phone
              }
              onChange={handleChange}
              placeholder="Enter phone number"
            />

          </div>


          <div className="form-group">

            <label>
              <FaStore />
              Shop Name
            </label>

            <input
              type="text"
              name="shopName"
              value={
                formData.shopName
              }
              onChange={handleChange}
              placeholder="Enter shop name"
            />

          </div>


          <div className="form-group">

            <label>
              <FaMapMarkerAlt />
              Delivery Address
            </label>

            <textarea
              name="address"
              value={
                formData.address
              }
              onChange={handleChange}
              placeholder="Enter delivery address"
              rows="4"
            />

          </div>


          <button
            type="submit"
            className="confirm-order-button"
          >

            <FaCheck />

            Confirm Order

          </button>

        </form>

      </div>

    </div>

  );
}


export default OrderDetails;