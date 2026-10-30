/* ============================================================
   RK CHOCO ADMIN DASHBOARD
   File: frontend/public/admin/admin.js
   Data source: Express API + MongoDB
   Product Images: Multer Upload
============================================================ */

"use strict";

(() => {
  const API = "/api/admin";

  const $ = (id) => document.getElementById(id);

  let products = [];
  let customers = [];
  let orders = [];
  let editingProductId = null;
  let toastTimer = null;

  /* ----------------------------------------------------------
     COMMON HELPERS
  ---------------------------------------------------------- */

  async function apiRequest(path, options = {}) {
    const isFormData = options.body instanceof FormData;

    const requestOptions = {
      ...options,
      credentials: "same-origin",
      headers: {
        ...(isFormData ? {} : options.body ? {
          "Content-Type": "application/json"
        } : {}),
        ...(options.headers || {})
      }
    };

    const response = await fetch(`${API}${path}`, requestOptions);

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (response.status === 401 || response.status === 403) {
      if (!window.location.pathname.endsWith("/admin/")) {
        window.location.replace("/admin/");
      }

      throw new Error("Please log in to the admin dashboard.");
    }

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Unable to complete the request.");
    }

    return result;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function money(value) {
    const amount = Number(value || 0);

    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    });
  }

  function getId(record) {
    return String(record?._id || record?.id || "");
  }

  function setText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = value ?? "";
    }
  }

  /* ----------------------------------------------------------
     GREEN / RED NOTIFICATION MESSAGE
     Appears at the top-right, outside the product modal.
  ---------------------------------------------------------- */

  function showMessage(message, success = false) {
    let toast = $("rkAdminToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "rkAdminToast";

      Object.assign(toast.style, {
        position: "fixed",
        top: "25px",
        right: "25px",
        zIndex: "999999",
        minWidth: "260px",
        maxWidth: "calc(100vw - 40px)",
        padding: "15px 22px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "600",
        lineHeight: "1.5",
        boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
        display: "none",
        opacity: "0",
        transition: "opacity 0.25s ease",
        boxSizing: "border-box"
      });

      document.body.appendChild(toast);
    }

    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }

    toast.textContent = message;

    if (success) {
      toast.style.background = "#e8f7ed";
      toast.style.color = "#18743a";
      toast.style.border = "1px solid #a7dfb8";
    } else {
      toast.style.background = "#fff0ef";
      toast.style.color = "#b42318";
      toast.style.border = "1px solid #f3b5b0";
    }

    toast.style.display = "block";

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });

    toastTimer = setTimeout(() => {
      toast.style.opacity = "0";

      setTimeout(() => {
        toast.style.display = "none";
      }, 300);
    }, 4000);
  }

  function showError(error) {
    showMessage(
      error?.message || "Something went wrong. Please try again.",
      false
    );
  }

  function showLoading(tbodyId, columns, message = "Loading data...") {
    const body = $(tbodyId);

    if (body) {
      body.innerHTML = `
        <tr>
          <td class="rk-empty" colspan="${columns}">
            ${escapeHTML(message)}
          </td>
        </tr>
      `;
    }
  }

  function showEmpty(tbodyId, columns, message) {
    const body = $(tbodyId);

    if (body) {
      body.innerHTML = `
        <tr>
          <td class="rk-empty" colspan="${columns}">
            ${escapeHTML(message)}
          </td>
        </tr>
      `;
    }
  }

  function getArray(result, keys) {
    for (const key of keys) {
      if (Array.isArray(result?.[key])) {
        return result[key];
      }
    }

    return [];
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return escapeHTML(value);
    }

    return date.toLocaleDateString("en-IN");
  }

  function getCustomerName(customer) {
    return customer.name ||
      customer.fullName ||
      customer.username ||
      customer.customerName ||
      "—";
  }

  function getCustomerEmail(customer) {
    return customer.email || customer.emailAddress || "—";
  }

  function getOrderDate(order) {
    return order.createdAt ||
      order.orderDate ||
      order.date ||
      order.placedAt ||
      null;
  }

  function getOrderStatus(order) {
    return String(order.status || order.orderStatus || "Pending");
  }

  function getOrderTotal(order) {
    const directTotal =
      order.grandTotal ??
      order.totalAmount ??
      order.totalPrice ??
      order.amount ??
      order.total;

    if (directTotal !== undefined && directTotal !== null) {
      return Number(directTotal) || 0;
    }

    const items = order.items || order.products || order.orderItems || [];

    if (Array.isArray(items)) {
      return items.reduce((sum, item) => {
        const price = Number(item.price || item.unitPrice || 0);
        const quantity = Number(
          item.quantity || item.boxes || item.qty || 0
        );

        return sum + price * quantity;
      }, 0);
    }

    return 0;
  }

  function getOrderCustomer(order) {
    if (typeof order.customer === "object" && order.customer) {
      return getCustomerName(order.customer);
    }

    return order.customerName ||
      order.name ||
      order.userName ||
      order.email ||
      "—";
  }

  function getStatusClass(status) {
    const normalized = String(status || "Pending")
      .toLowerCase()
      .replace(/\s+/g, "-");

    return `rk-status ${escapeHTML(normalized)}`;
  }

  /* ----------------------------------------------------------
     ADMIN SESSION AND LOGOUT
  ---------------------------------------------------------- */

  async function checkSession() {
    try {
      const result = await apiRequest("/session");

      const authenticated =
        result.authenticated === true ||
        result.loggedIn === true ||
        result.isAuthenticated === true;

      if (!authenticated) {
        window.location.replace("/admin/");
        return false;
      }

      return true;
    } catch (error) {
      if (!window.location.pathname.endsWith("/admin/")) {
        showError(error);
      }

      return false;
    }
  }

  async function logout() {
    const buttons = document.querySelectorAll("#logoutBtn");

    buttons.forEach((button) => {
      button.disabled = true;
    });

    try {
      await apiRequest("/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.replace("/admin/");
    }
  }

  document.querySelectorAll("#logoutBtn").forEach((button) => {
    button.addEventListener("click", logout);
  });

  /* ----------------------------------------------------------
     PRODUCTS
  ---------------------------------------------------------- */

  async function loadProducts() {
    showLoading("productsTableBody", 6);

    try {
      const result = await apiRequest("/products");

      products = getArray(result, ["products", "data", "items"]);

      renderProducts();
      updateProductStats();
      filterProducts();
    } catch (error) {
      showError(error);
      showEmpty("productsTableBody", 6, error.message);
    }
  }

  function updateProductStats() {
    setText("totalProducts", products.length);

    setText(
      "availableProducts",
      products.filter((product) =>
        Number(product.stock ?? product.quantity ?? 0) > 0
      ).length
    );

    setText(
      "lowStockProducts",
      products.filter((product) => {
        const stock = Number(product.stock ?? product.quantity ?? 0);
        return stock > 0 && stock <= 10;
      }).length
    );

    setText("dashboardProducts", products.length);
  }

  /* ----------------------------------------------------------
     PRODUCT TABLE
     Image | Product Name | Brand | Price | Stock | Action
  ---------------------------------------------------------- */

  function renderProducts() {
    const body = $("productsTableBody");

    if (!body) return;

    const table = body.closest("table");

    // Center Image and Action column headings.
    if (table) {
      const headers = table.querySelectorAll("thead th");

      if (headers.length >= 6) {
        [0, 5].forEach((index) => {
          headers[index].style.setProperty(
            "text-align",
            "center",
            "important"
          );

          headers[index].style.setProperty(
            "vertical-align",
            "middle",
            "important"
          );
        });
      }
    }

    if (!products.length) {
      showEmpty("productsTableBody", 6, "No products found in MongoDB.");
      return;
    }

    body.innerHTML = products.map((product) => {
      const id = getId(product);
      const name = product.name || product.productName || "—";
      const brand = product.brand || product.brandName || "—";
      const price = Number(product.price || product.sellingPrice || 0);
      const stock = Number(product.stock ?? product.quantity ?? 0);
      const image = product.image || product.imageUrl || "";

      return `
        <tr
          data-product-row="${escapeHTML(id)}"
          data-product-name="${escapeHTML(name.toLowerCase())}"
          data-product-stock="${stock}"
        >

          <td class="rk-product-image-cell"
              style="text-align:center !important;vertical-align:middle !important;">
            ${
              image
                ? `<img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    class="rk-product-table-image"
                    style="width:55px;height:55px;object-fit:contain;border-radius:8px;display:block;margin:0 auto;"
                    onerror="this.style.display='none'"
                  >`
                : `<div
                    class="rk-no-product-image"
                    style="width:55px;height:55px;background:#f3eee9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;margin:0 auto;">
                    No Image
                  </div>`
            }
          </td>

          <td style="vertical-align:middle;">
            <strong>${escapeHTML(name)}</strong>
          </td>

          <td style="vertical-align:middle;">
            ${escapeHTML(brand)}
          </td>

          <td style="vertical-align:middle;">
            ${money(price)}
          </td>

          <td style="vertical-align:middle;">
            <strong>${stock}</strong>
          </td>

          <td class="rk-product-action-cell"
              style="text-align:center !important;vertical-align:middle !important;">
            <div class="rk-product-action-buttons"
                 style="display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;">

              <button
                class="rk-btn rk-btn-small"
                type="button"
                data-edit-product="${escapeHTML(id)}"
              >
                Edit
              </button>

              <button
                class="rk-btn rk-btn-danger rk-btn-small"
                type="button"
                data-delete-product="${escapeHTML(id)}"
              >
                Delete
              </button>

            </div>
          </td>

        </tr>
      `;
    }).join("");
  }

  function filterProducts() {
    const search = ($("productSearch")?.value || "")
      .trim()
      .toLowerCase();

    const stockFilter = $("stockFilter")?.value || "all";

    document.querySelectorAll("[data-product-row]").forEach((row) => {
      const name = row.dataset.productName || "";
      const stock = Number(row.dataset.productStock || 0);

      const matchesSearch = name.includes(search);

      let matchesStock = true;

      if (stockFilter === "available") {
        matchesStock = stock > 0;
      } else if (stockFilter === "out") {
        matchesStock = stock <= 0;
      } else if (stockFilter === "low") {
        matchesStock = stock > 0 && stock <= 10;
      }

      row.style.display =
        matchesSearch && matchesStock ? "" : "none";
    });
  }

  function setProductImagePreview(imagePath) {
    const preview = $("productImagePreview");

    if (!preview) return;

    if (imagePath) {
      preview.src = imagePath;
      preview.style.display = "block";

      preview.onerror = () => {
        preview.style.display = "none";
      };
    } else {
      preview.removeAttribute("src");
      preview.style.display = "none";
    }
  }

  /* ----------------------------------------------------------
     PRODUCT MODAL
  ---------------------------------------------------------- */

  function openProductModal(product = null) {
    const modal = $("productModal");
    const form = $("productForm");

    if (!modal || !form) {
      showMessage(
        "The product form is missing. Please check products.html.",
        false
      );
      return;
    }

    editingProductId = product ? getId(product) : null;

    form.reset();

    const title = $("productModalTitle");

    if (title) {
      title.textContent = product ? "Edit Product" : "Add Product";
    }

    if ($("productId")) {
      $("productId").value = editingProductId || "";
    }

    if ($("productName")) {
      $("productName").value =
        product?.name || product?.productName || "";
    }

    if ($("productBrand")) {
      $("productBrand").value =
        product?.brand || product?.brandName || "";
    }

    if ($("productPrice")) {
      $("productPrice").value =
        product?.price ?? product?.sellingPrice ?? "";
    }

    if ($("productStock")) {
      $("productStock").value =
        product?.stock ?? product?.quantity ?? 0;
    }

    if ($("productUnit")) {
      $("productUnit").value = product?.unit || "1 Box = 10 Pieces";
    }

    if ($("productImage")) {
      $("productImage").value =
        product?.image || product?.imageUrl || "";
    }

    if ($("productDescription")) {
      $("productDescription").value = product?.description || "";
    }

    if ($("productImageFile")) {
      $("productImageFile").value = "";
    }

    if ($("removeProductImage")) {
      $("removeProductImage").value = "false";
    }

    setProductImagePreview(
      product?.image || product?.imageUrl || ""
    );

    setText(
      "productImageStatus",
      product?.image || product?.imageUrl
        ? "Current product image"
        : "No product image selected"
    );

    modal.classList.add("open");

    Object.assign(modal.style, {
      display: "flex",
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      minHeight: "100vh",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: "rgba(0, 0, 0, 0.60)",
      zIndex: "99999",
      overflowY: "auto",
      boxSizing: "border-box"
    });

    const panel = modal.querySelector(
      ".modal-content, .modal-box, .modal-dialog, .product-modal-content"
    ) || modal.firstElementChild;

    if (panel) {
      Object.assign(panel.style, {
        display: "block",
        position: "relative",
        width: "100%",
        maxWidth: "650px",
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
        margin: "auto",
        background: "#ffffff",
        borderRadius: "14px",
        padding: "25px",
        boxSizing: "border-box",
        boxShadow: "0 15px 50px rgba(0,0,0,0.25)"
      });
    }

    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    const modal = $("productModal");

    if (!modal) return;

    modal.classList.remove("open");
    modal.style.display = "none";
    document.body.style.overflow = "";

    editingProductId = null;
  }

  async function saveProduct(event) {
    event.preventDefault();

    const name = $("productName")?.value.trim() || "";
    const brand = $("productBrand")?.value.trim() || "";
    const price = Number($("productPrice")?.value);
    const stock = Number($("productStock")?.value);

    const unit = $("productUnit")?.value.trim() ||
      "1 Box = 10 Pieces";

    const description =
      $("productDescription")?.value.trim() || "";

    const image = $("productImage")?.value.trim() || "";

    const imageFile = $("productImageFile")?.files?.[0] || null;

    const removeImage =
      $("removeProductImage")?.value === "true";

    if (!name || !brand) {
      showMessage("Please enter product name and brand.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      showMessage("Price must be greater than zero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      showMessage("Stock must be a non-negative whole number.");
      return;
    }

    if (imageFile) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowedTypes.includes(imageFile.type)) {
        showMessage("Please select JPG, PNG or WEBP image.");
        return;
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        showMessage("Image size must be less than 5 MB.");
        return;
      }
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("brand", brand);
    formData.append("price", String(price));
    formData.append("stock", String(stock));
    formData.append("unit", unit);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("removeImage", removeImage ? "true" : "false");

    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    const submitButton = $("saveProductBtn") ||
      $("productForm")?.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Saving...";
    }

    try {
      if (editingProductId) {
        await apiRequest(
          `/products/${encodeURIComponent(editingProductId)}`,
          {
            method: "PUT",
            body: formData
          }
        );

        closeProductModal();
        showMessage("Product Updated Successfully!", true);
      } else {
        await apiRequest("/products", {
          method: "POST",
          body: formData
        });

        closeProductModal();
        showMessage("Product Added Successfully!", true);
      }

      await loadProducts();
    } catch (error) {
      showError(error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Save Product";
      }
    }
  }

  async function deleteProduct(id) {
    const product = products.find((item) => getId(item) === id);

    if (!product) return;

    const productName =
      product.name || product.productName || "this product";

    if (!window.confirm(`Delete "${productName}"?`)) {
      return;
    }

    try {
      await apiRequest(`/products/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });

      showMessage("Product Deleted Successfully!", true);
      await loadProducts();
    } catch (error) {
      showError(error);
    }
  }

  /* Product event listeners */

  $("productForm")?.addEventListener("submit", saveProduct);

  $("addProductBtn")?.addEventListener("click", () => {
    openProductModal();
  });

  $("closeProductModal")?.addEventListener(
    "click",
    closeProductModal
  );

  $("closeModalBtn")?.addEventListener(
    "click",
    closeProductModal
  );

  $("cancelProductBtn")?.addEventListener(
    "click",
    closeProductModal
  );

  $("productModal")?.addEventListener("click", (event) => {
    if (event.target === $("productModal")) {
      closeProductModal();
    }
  });

  $("productsTableBody")?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-product]");
    const deleteButton = event.target.closest("[data-delete-product]");

    if (editButton) {
      const id = editButton.dataset.editProduct;

      const product = products.find(
        (item) => getId(item) === id
      );

      if (product) {
        openProductModal(product);
      }
    }

    if (deleteButton) {
      deleteProduct(deleteButton.dataset.deleteProduct);
    }
  });

  $("refreshProductsBtn")?.addEventListener("click", loadProducts);
  $("refreshProducts")?.addEventListener("click", loadProducts);

  $("productSearch")?.addEventListener("input", filterProducts);
  $("stockFilter")?.addEventListener("change", filterProducts);

  /* ----------------------------------------------------------
     CUSTOMERS
  ---------------------------------------------------------- */

  async function loadCustomers() {
    showLoading("customersTableBody", 5);

    try {
      const result = await apiRequest("/customers");

      customers = getArray(
        result,
        ["customers", "users", "data", "items"]
      );

      renderCustomers();
      updateCustomerStats();
    } catch (error) {
      showError(error);
      showEmpty("customersTableBody", 5, error.message);
    }
  }

  function updateCustomerStats() {
    setText("totalCustomers", customers.length);
    setText("registeredCustomers", customers.length);
    setText("dashboardCustomers", customers.length);
    setText("reportCustomers", customers.length);
  }

  function renderCustomers() {
    const body = $("customersTableBody");

    if (!body) return;

    if (!customers.length) {
      showEmpty(
        "customersTableBody",
        5,
        "No customers found in MongoDB."
      );
      return;
    }

    body.innerHTML = customers.map((customer, index) => {
      const name = getCustomerName(customer);
      const email = getCustomerEmail(customer);

      const phone = customer.phone ||
        customer.phoneNumber ||
        customer.mobile ||
        "—";

      const createdAt = customer.createdAt ||
        customer.registeredAt ||
        customer.date ||
        null;

      return `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${escapeHTML(name)}</strong></td>
          <td>${escapeHTML(email)}</td>
          <td>${escapeHTML(phone)}</td>
          <td>${formatDate(createdAt)}</td>
        </tr>
      `;
    }).join("");
  }

  $("refreshCustomersBtn")?.addEventListener(
    "click",
    loadCustomers
  );

  /* ----------------------------------------------------------
     ORDERS
  ---------------------------------------------------------- */

  async function loadOrders() {
    showLoading("ordersTableBody", 8);

    try {
      const result = await apiRequest("/orders");

      orders = getArray(result, ["orders", "data", "items"]);

      renderOrders();
      updateOrderStats();
    } catch (error) {
      showError(error);
      showEmpty("ordersTableBody", 8, error.message);
    }
  }

  function updateOrderStats() {
    const pending = orders.filter((order) => {
      const status = getOrderStatus(order).toLowerCase();

      return status === "pending" || status === "processing";
    });

    const completed = orders.filter((order) => {
      const status = getOrderStatus(order).toLowerCase();

      return status === "completed" || status === "delivered";
    });

    const revenue = orders.reduce((sum, order) => {
      const status = getOrderStatus(order).toLowerCase();

      if (status === "cancelled") return sum;

      return sum + getOrderTotal(order);
    }, 0);

    setText("totalOrders", orders.length);
    setText("pendingOrders", pending.length);
    setText("completedOrders", completed.length);
    setText("totalRevenue", money(revenue));

    setText("dashboardOrders", orders.length);
    setText("dashboardRevenue", money(revenue));

    setText("reportOrders", orders.length);
    setText("reportRevenue", money(revenue));
  }

  function renderOrders() {
    const body = $("ordersTableBody");

    if (!body) return;

    if (!orders.length) {
      showEmpty(
        "ordersTableBody",
        8,
        "No orders found in MongoDB."
      );
      return;
    }

    body.innerHTML = orders.map((order, index) => {
      const id = getId(order);

      const displayId = order.orderId ||
        order.orderNumber ||
        id ||
        `Order ${index + 1}`;

      const date = getOrderDate(order);
      const status = getOrderStatus(order);
      const total = getOrderTotal(order);

      return `
        <tr>
          <td>${escapeHTML(displayId)}</td>
          <td>${escapeHTML(getOrderCustomer(order))}</td>
          <td>${formatDate(date)}</td>
          <td>${money(total)}</td>

          <td>
            <span class="${getStatusClass(status)}">
              ${escapeHTML(status)}
            </span>
          </td>

          <td>
            ${escapeHTML(String(
              order.paymentMethod ||
              order.paymentStatus ||
              "—"
            ))}
          </td>

          <td>
            ${escapeHTML(String(
              order.items?.length ||
              order.products?.length ||
              0
            ))}
          </td>

          <td>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <select
                class="rk-select"
                style="min-width:130px"
                data-order-status="${escapeHTML(id)}"
                aria-label="Update order status"
              >
                ${[
                  "Pending",
                  "Processing",
                  "Confirmed",
                  "Completed",
                  "Delivered",
                  "Cancelled"
                ].map((option) => `
                  <option
                    value="${option}"
                    ${option.toLowerCase() === status.toLowerCase() ? "selected" : ""}
                  >
                    ${option}
                  </option>
                `).join("")}
              </select>

              <button
                class="rk-btn rk-btn-small"
                type="button"
                data-update-order="${escapeHTML(id)}"
              >
                Save
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  async function updateOrderStatus(id) {
    const select = document.querySelector(
      `[data-order-status="${CSS.escape(id)}"]`
    );

    if (!select) return;

    try {
      await apiRequest(
        `/orders/${encodeURIComponent(id)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: select.value
          })
        }
      );

      showMessage("Order status updated successfully.", true);

      await loadOrders();
    } catch (error) {
      showError(error);
    }
  }

  $("ordersTableBody")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-update-order]");

    if (button) {
      updateOrderStatus(button.dataset.updateOrder);
    }
  });

  $("refreshOrdersBtn")?.addEventListener("click", loadOrders);

  /* ----------------------------------------------------------
     REPORTS
  ---------------------------------------------------------- */

  async function loadReports() {
    showLoading("salesReportBody", 4);
    showLoading("orderStatusReportBody", 3);
    showLoading("stockReportBody", 4);

    try {
      const [
        productResult,
        customerResult,
        orderResult
      ] = await Promise.all([
        apiRequest("/products"),
        apiRequest("/customers"),
        apiRequest("/orders")
      ]);

      products = getArray(
        productResult,
        ["products", "data", "items"]
      );

      customers = getArray(
        customerResult,
        ["customers", "users", "data", "items"]
      );

      orders = getArray(
        orderResult,
        ["orders", "data", "items"]
      );

      updateProductStats();
      updateCustomerStats();
      updateOrderStats();

      renderSalesReport();
      renderOrderStatusReport();
      renderStockReport();
    } catch (error) {
      showError(error);

      showEmpty("salesReportBody", 4, error.message);
      showEmpty("orderStatusReportBody", 3, error.message);
      showEmpty("stockReportBody", 4, error.message);
    }
  }

  function renderSalesReport() {
    const body = $("salesReportBody");

    if (!body) return;

    if (!orders.length) {
      showEmpty(
        "salesReportBody",
        4,
        "No sales data available."
      );
      return;
    }

    const grouped = new Map();

    orders.forEach((order) => {
      if (getOrderStatus(order).toLowerCase() === "cancelled") {
        return;
      }

      const date = getOrderDate(order);
      const label = date ? formatDate(date) : "Unknown date";

      const existing = grouped.get(label) || {
        count: 0,
        revenue: 0
      };

      existing.count += 1;
      existing.revenue += getOrderTotal(order);

      grouped.set(label, existing);
    });

    const rows = Array.from(grouped.entries());

    body.innerHTML = rows.map(([date, value]) => `
      <tr>
        <td>${escapeHTML(date)}</td>
        <td>${value.count}</td>
        <td>${money(value.revenue)}</td>
        <td>
          ${value.count
            ? money(value.revenue / value.count)
            : money(0)}
        </td>
      </tr>
    `).join("");

    if (!rows.length) {
      showEmpty(
        "salesReportBody",
        4,
        "No sales data available."
      );
    }
  }

  function renderOrderStatusReport() {
    const body = $("orderStatusReportBody");

    if (!body) return;

    if (!orders.length) {
      showEmpty(
        "orderStatusReportBody",
        3,
        "No order status data available."
      );
      return;
    }

    const grouped = {};

    orders.forEach((order) => {
      const status = getOrderStatus(order);

      grouped[status] = (grouped[status] || 0) + 1;
    });

    body.innerHTML = Object.entries(grouped).map(
      ([status, count]) => `
        <tr>
          <td>
            <span class="${getStatusClass(status)}">
              ${escapeHTML(status)}
            </span>
          </td>

          <td>${count}</td>

          <td>
            ${orders.length
              ? `${((count / orders.length) * 100).toFixed(1)}%`
              : "0%"}
          </td>
        </tr>
      `
    ).join("");
  }

  function renderStockReport() {
    const body = $("stockReportBody");

    if (!body) return;

    if (!products.length) {
      showEmpty(
        "stockReportBody",
        4,
        "No product stock data available."
      );
      return;
    }

    body.innerHTML = products.map((product) => {
      const name = product.name || product.productName || "—";
      const brand = product.brand || product.brandName || "—";

      const stock = Number(
        product.stock ?? product.quantity ?? 0
      );

      const stockLabel = stock <= 0
        ? "Out of Stock"
        : stock <= 10
          ? "Low Stock"
          : "Available";

      return `
        <tr>
          <td>${escapeHTML(name)}</td>
          <td>${escapeHTML(brand)}</td>
          <td>${stock}</td>

          <td>
            <span class="${getStatusClass(stockLabel)}">
              ${stockLabel}
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }

  $("refreshReportsBtn")?.addEventListener(
    "click",
    loadReports
  );

  /* ----------------------------------------------------------
     DASHBOARD OVERVIEW
  ---------------------------------------------------------- */

  async function loadDashboardOverview() {
    try {
      const [
        productResult,
        customerResult,
        orderResult
      ] = await Promise.all([
        apiRequest("/products"),
        apiRequest("/customers"),
        apiRequest("/orders")
      ]);

      products = getArray(
        productResult,
        ["products", "data", "items"]
      );

      customers = getArray(
        customerResult,
        ["customers", "users", "data", "items"]
      );

      orders = getArray(
        orderResult,
        ["orders", "data", "items"]
      );

      updateProductStats();
      updateCustomerStats();
      updateOrderStats();

      setText("dashboardProducts", products.length);
      setText("dashboardCustomers", customers.length);
      setText("dashboardOrders", orders.length);
    } catch (error) {
      showError(error);
    }
  }

  $("refreshDashboardBtn")?.addEventListener(
    "click",
    loadDashboardOverview
  );

  /* ----------------------------------------------------------
     PAGE INITIALIZATION
  ---------------------------------------------------------- */

  async function initializePage() {
    const path = window.location.pathname.toLowerCase();

    const isDashboard =
      path.endsWith("/dashboard.html") ||
      Boolean($("dashboardProducts")) ||
      Boolean($("dashboardRevenue"));

    const isProductsPage =
      path.endsWith("/products.html") ||
      Boolean($("productsTableBody"));

    const isCustomersPage =
      path.endsWith("/customers.html") ||
      Boolean($("customersTableBody"));

    const isOrdersPage =
      path.endsWith("/orders.html") ||
      Boolean($("ordersTableBody"));

    const isReportsPage =
      path.endsWith("/reports.html") ||
      Boolean($("salesReportBody")) ||
      Boolean($("reportRevenue"));

    if (
      !isDashboard &&
      !isProductsPage &&
      !isCustomersPage &&
      !isOrdersPage &&
      !isReportsPage
    ) {
      return;
    }

    const authenticated = await checkSession();

    if (!authenticated) return;

    if (isProductsPage) await loadProducts();
    if (isCustomersPage) await loadCustomers();
    if (isOrdersPage) await loadOrders();
    if (isReportsPage) await loadReports();
    if (isDashboard) await loadDashboardOverview();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializePage
    );
  } else {
    initializePage();
  }
})();