/* =========================================================
   ORDER SUCCESS
========================================================= */

function OrderSuccessPage() {
  const [order] = useState(() => {
    try {
      const savedOrder =
        sessionStorage.getItem("rkCompletedOrder");

      return savedOrder
        ? JSON.parse(savedOrder)
        : null;
    } catch (error) {
      console.error(
        "Unable to read completed order:",
        error
      );

      return null;
    }
  });

  const continueShopping = () => {
    window.location.href = "/products";
  };

  const goHome = () => {
    window.location.href = "/";
  };

  const viewMyOrders = () => {
    window.location.href = "/orders";
  };

  /* ORDER ID */
  const orderId =
    order?.orderId ||
    order?.id ||
    "ORD-" + Date.now();

  /* ORDER STATUS */
  const orderStatus =
    order?.orderStatus ||
    order?.status ||
    "Order Received";

  /* DATE & TIME */
  const getOrderDateTime = () => {
    const possibleDate =
      order?.orderDateTime ||
      order?.orderDate ||
      order?.createdAt ||
      order?.date;

    if (possibleDate) {
      const date = new Date(possibleDate);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      }

      return possibleDate;
    }

    return new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fff8f0, #f8ead8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          background: "#ffffff",
          borderRadius: "25px",
          padding: "45px 40px",
          textAlign: "center",
          boxShadow:
            "0 15px 45px rgba(80, 40, 10, 0.15)",
        }}
      >

        {/* SUCCESS ICON */}
        <div
          style={{
            width: "90px",
            height: "90px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            background: "#e8f8ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "55px",
            color: "#22a447",
          }}
        >
          ✓
        </div>

        {/* LABEL */}
        <div
          style={{
            color: "#159dcc",
            fontWeight: "800",
            letterSpacing: "4px",
            fontSize: "14px",
            marginBottom: "12px",
          }}
        >
          ORDER CONFIRMED
        </div>

        {/* TITLE */}
        <h1
          style={{
            margin: "0",
            color: "#4b260d",
            fontSize: "38px",
            fontWeight: "800",
          }}
        >
          Order Successfully Placed!
        </h1>

        {/* DIVIDER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            margin: "25px auto",
            maxWidth: "500px",
          }}
        >
          <span
            style={{
              flex: 1,
              height: "1px",
              background: "#d8b08a",
            }}
          />

          <span
            style={{
              color: "#b87945",
              fontSize: "22px",
            }}
          >
            ❧
          </span>

          <span
            style={{
              flex: 1,
              height: "1px",
              background: "#d8b08a",
            }}
          />
        </div>

        {/* THANK YOU */}
        <h2
          style={{
            color: "#7a461f",
            fontSize: "24px",
            marginBottom: "25px",
          }}
        >
          ❧ Thank you for your order! ❧
        </h2>

        {/* MESSAGE */}
        <div
          style={{
            background: "#f3fbff",
            border: "1px solid #ccecf8",
            borderRadius: "15px",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            textAlign: "left",
            marginBottom: "30px",
          }}
        >
          <FaClipboardCheck
            style={{
              color: "#159dcc",
              fontSize: "25px",
              flexShrink: 0,
            }}
          />

          <div>
            <strong
              style={{
                display: "block",
                color: "#333",
                marginBottom: "4px",
              }}
            >
              We have received your order and it is
              being processed.
            </strong>

            <small
              style={{
                color: "#777",
              }}
            >
              You will receive an order confirmation
              shortly.
            </small>
          </div>
        </div>

        {/* ORDER INFORMATION */}
        <div
          style={{
            border: "1px solid #ead8c7",
            borderRadius: "18px",
            overflow: "hidden",
            marginBottom: "30px",
            textAlign: "left",
          }}
        >

          {/* ORDER STATUS */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 25px",
              borderBottom: "1px solid #ead8c7",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#68401f",
                fontWeight: "700",
              }}
            >
              <FaClipboardCheck
                style={{
                  color: "#159dcc",
                  fontSize: "20px",
                }}
              />

              <span>
                Order Status
              </span>
            </div>

            <strong
              style={{
                color: "#20a044",
              }}
            >
              {orderStatus}
            </strong>
          </div>

          {/* ORDER ID */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 25px",
              borderBottom: "1px solid #ead8c7",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#68401f",
                fontWeight: "700",
              }}
            >
              <FaListAlt
                style={{
                  color: "#159dcc",
                  fontSize: "20px",
                }}
              />

              <span>
                Order ID
              </span>
            </div>

            <strong
              style={{
                color: "#4b260d",
              }}
            >
              {orderId}
            </strong>
          </div>

          {/* DATE & TIME */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 25px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#68401f",
                fontWeight: "700",
              }}
            >
              <FaClock
                style={{
                  color: "#159dcc",
                  fontSize: "20px",
                }}
              />

              <span>
                Order Date &amp; Time
              </span>
            </div>

            <strong
              style={{
                color: "#4b260d",
                textAlign: "right",
              }}
            >
              {getOrderDateTime()}
            </strong>
          </div>

        </div>

        {/* DELIVERY MESSAGE */}
        <div
          style={{
            background: "#fff8ed",
            border: "1px solid #f0d7b5",
            borderRadius: "14px",
            padding: "15px 20px",
            marginBottom: "30px",
            color: "#7a4b20",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaClock />

          <span>
            We will notify you when your order is on
            the way!
          </span>
        </div>

        {/* BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >

          {/* CONTINUE SHOPPING */}
          <button
            onClick={continueShopping}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "14px 25px",
              background: "#159dcc",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <FaShoppingBag />
            Continue Shopping
          </button>

          {/* BACK HOME */}
          <button
            onClick={goHome}
            style={{
              border: "1px solid #7a461f",
              borderRadius: "12px",
              padding: "14px 25px",
              background: "#ffffff",
              color: "#7a461f",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <FaHome />
            Back to Home
          </button>

          {/* VIEW MY ORDERS */}
          <button
            onClick={viewMyOrders}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "14px 25px",
              background: "#4b260d",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <FaListAlt />
            View My Orders
          </button>

        </div>

      </div>
    </div>
  );
}