import React from "react";
import "./Cart.css";

import {
  FaShoppingCart,
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaClipboardCheck
} from "react-icons/fa";

function Cart({
  cart = [],
  setCart,
  setOrder
}) {
  const safeCart =
    Array.isArray(cart)
      ? cart
      : [];

  const getName = (item) => {
    return (
      item.name ||
      item.productName ||
      item.title ||
      "Chocolate Product"
    );
  };

  const getBrand = (item) => {
    return (
      item.brand ||
      item.category ||
      ""
    );
  };

  const getPrice = (item) => {
    return Number(
      item.price ||
        item.boxPrice ||
        item.amount ||
        0
    );
  };

  const getImage = (item) => {
    return (
      item.image ||
      item.img ||
      item.productImage ||
      ""
    );
  };

  const getQuantity = (item) => {
    const quantity =
      item.quantity ??
      item.boxes ??
      item.qty ??
      1;

    return Math.max(
      1,
      Number(quantity)
    );
  };

  const totalProducts =
    safeCart.length;

  const totalBoxes =
    safeCart.reduce(
      (total, item) =>
        total +
        getQuantity(item),
      0
    );

  const grandTotal =
    safeCart.reduce(
      (total, item) =>
        total +
        getPrice(item) *
          getQuantity(item),
      0
    );

  const updateQuantity = (
    index,
    newQuantity
  ) => {
    if (!setCart) return;

    const quantity =
      Math.max(
        1,
        Number(newQuantity)
      );

    const updatedCart =
      safeCart.map(
        (item, itemIndex) => {
          if (
            itemIndex !== index
          ) {
            return item;
          }

          return {
            ...item,
            quantity,
            boxes: quantity,
            qty: quantity
          };
        }
      );

    setCart(updatedCart);
  };

  const removeProduct = (
    index
  ) => {
    if (!setCart) return;

    const updatedCart =
      safeCart.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

    setCart(updatedCart);
  };

  const backToProducts = () => {
    window.location.href =
      "/products";
  };

  const continueShopping = () => {
    window.location.href =
      "/products";
  };

  const placeOrder = () => {
    if (safeCart.length === 0) {
      alert(
        "Please add products to your cart first."
      );
      return;
    }

    const orderData = {
      cart: safeCart,
      totalProducts,
      totalBoxes,
      grandTotal
    };

    sessionStorage.setItem(
      "rkPendingOrder",
      JSON.stringify(
        orderData
      )
    );

    if (setOrder) {
      setOrder(orderData);
    }

    window.location.href =
      "/order-details";
  };

  if (safeCart.length === 0) {
    return (
      <div className="cart-page">

        {/* BACK TO PRODUCTS */}

        <button
          type="button"
          className="back-home-button"
          onClick={
            backToProducts
          }
        >
          <FaArrowLeft />
          Back to Products
        </button>

        <section className="cart-header">
          <div>
            <span className="cart-label">
              SHOPPING CART
            </span>

            <h1>
              Added Products
            </h1>

            <p>
              Review your chocolates before
              placing your order.
            </p>
          </div>

          <div className="cart-grand-total">
            <span>
              Grand Total
            </span>

            <strong>
              ₹0
            </strong>
          </div>
        </section>

        <section className="empty-cart">
          <div className="empty-cart-icon">
            <FaShoppingCart />
          </div>

          <h2>
            Your Cart is Empty
          </h2>

          <p>
            Add some chocolates to your cart.
          </p>

          <button
            className="continue-shopping-button"
            onClick={
              continueShopping
            }
          >
            <FaArrowLeft />
            Continue Shopping
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="cart-page">

      {/* BACK TO PRODUCTS */}

      <button
        type="button"
        className="back-home-button"
        onClick={
          backToProducts
        }
      >
        <FaArrowLeft />
        Back to Products
      </button>

      <section className="cart-header">
        <div>
          <span className="cart-label">
            SHOPPING CART
          </span>

          <h1>
            Added Products
          </h1>

          <p>
            Review your chocolates before
            placing your order.
          </p>
        </div>

        <div className="cart-grand-total">
          <span>
            Grand Total
          </span>

          <strong>
            ₹{grandTotal}
          </strong>
        </div>
      </section>

      <section className="cart-main">

        <div className="cart-products-section">

          <div className="section-heading">
            <span>
              YOUR ITEMS
            </span>

            <h2>
              {totalProducts}{" "}
              {totalProducts === 1
                ? "Product"
                : "Products"}
            </h2>
          </div>

          <div className="cart-items">

            {safeCart.map(
              (item, index) => {
                const name =
                  getName(item);

                const brand =
                  getBrand(item);

                const price =
                  getPrice(item);

                const image =
                  getImage(item);

                const quantity =
                  getQuantity(item);

                const itemTotal =
                  price *
                  quantity;

                return (
                  <div
                    className="cart-item"
                    key={
                      item.id ||
                      item.productId ||
                      `${name}-${index}`
                    }
                  >
                    <div className="cart-item-image">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                        />
                      ) : (
                        <div className="no-image">
                          🍫
                        </div>
                      )}
                    </div>

                    <div className="cart-item-details">

                      {brand && (
                        <span className="cart-brand">
                          {brand}
                        </span>
                      )}

                      <h3>
                        {name}
                      </h3>

                      <p className="cart-price">
                        ₹{price} / Box
                      </p>

                      <div className="quantity-control">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              index,
                              quantity -
                                1
                            )
                          }
                          disabled={
                            quantity <=
                            1
                          }
                        >
                          <FaMinus />
                        </button>

                        <span>
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              index,
                              quantity +
                                1
                            )
                          }
                        >
                          <FaPlus />
                        </button>

                        <small>
                          Boxes
                        </small>
                      </div>
                    </div>

                    <div className="cart-item-right">

                      <span>
                        Total
                      </span>

                      <strong>
                        ₹{itemTotal}
                      </strong>

                      <button
                        type="button"
                        className="remove-button"
                        onClick={() =>
                          removeProduct(
                            index
                          )
                        }
                      >
                        <FaTrash />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <button
            className="continue-shopping-button"
            onClick={
              continueShopping
            }
          >
            <FaArrowLeft />
            Continue Shopping
          </button>
        </div>

        <aside className="order-summary">

          <div className="summary-icon">
            <FaClipboardCheck />
          </div>

          <span className="summary-label">
            ORDER SUMMARY
          </span>

          <h2>
            Your Order
          </h2>

          <div className="summary-line" />

          <div className="summary-row">
            <span>
              Total Products
            </span>

            <strong>
              {totalProducts}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Total Boxes
            </span>

            <strong>
              {totalBoxes}
            </strong>
          </div>

          <div className="summary-line" />

          <div className="summary-total">
            <span>
              Grand Total
            </span>

            <strong>
              ₹{grandTotal}
            </strong>
          </div>

          <button
            className="place-order-button"
            onClick={placeOrder}
          >
            <FaShoppingCart />
            Place Order
          </button>
        </aside>
      </section>
    </div>
  );
}

export default Cart;