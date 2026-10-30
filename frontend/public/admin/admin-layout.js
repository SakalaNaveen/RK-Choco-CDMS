
/* ==================================================
   RK CHOCO ADMIN - COMMON NAVBAR AND PAGE LAYOUT
   File: frontend/public/admin/admin-layout.js
================================================== */

(() => {
  "use strict";

  const currentPath = window.location.pathname.toLowerCase();

  // Do not display the admin navbar on login/reset pages.
  if (
    currentPath === "/admin/" ||
    currentPath.endsWith("/index.html") ||
    currentPath.includes("forgot-password") ||
    currentPath.includes("reset-password")
  ) {
    return;
  }

  document.body.classList.add("rk-admin");

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard.html",
      match: "dashboard.html"
    },
    {
      label: "Products",
      href: "/admin/products.html",
      match: "products.html"
    },
    {
      label: "Customers",
      href: "/admin/customers.html",
      match: "customers.html"
    },
    {
      label: "Orders",
      href: "/admin/orders.html",
      match: "orders.html"
    },
    {
      label: "Reports",
      href: "/admin/reports.html",
      match: "reports.html"
    }
  ];

  // Escape text before putting it into HTML.
  const escapeHTML = value =>
    String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  // Remove the old admin navbar so all pages use
  // the same navbar design.
  const oldHeader = document.querySelector(".rk-top");

  if (oldHeader) {
    oldHeader.remove();
  }

  const header = document.createElement("header");
  header.className = "rk-top";

  const links = navItems.map(item => {
    const active = currentPath.endsWith(item.match);

    return `
      <a
        href="${item.href}"
        class="${active ? "active" : ""}"
        ${active ? 'aria-current="page"' : ""}
      >
        ${escapeHTML(item.label)}
      </a>
    `;
  }).join("");

  header.innerHTML = `
    <a class="rk-brand" href="/admin/dashboard.html">
      <span class="rk-mark">RK</span>

      <span class="rk-brand-text">
        <b>RK Choco</b>
        <small>ADMIN PANEL</small>
      </span>
    </a>

    <nav class="rk-navigation" aria-label="Admin navigation">
      ${links}
    </nav>

    <button
      type="button"
      class="rk-logout"
      id="logoutBtn"
      data-admin-logout
    >
      Logout
    </button>
  `;

  document.body.insertBefore(header, document.body.firstChild);

  // Keep the existing page content and place it
  // inside a consistently sized main container.
  let main = document.querySelector("main");

  if (!main) {
    main = document.createElement("main");
    main.className = "rk-main";

    const elements = Array.from(document.body.children);

    elements.forEach(element => {
      if (element === header) return;

      if (
        element.tagName === "SCRIPT" ||
        element.tagName === "STYLE"
      ) {
        return;
      }

      main.appendChild(element);
    });

    header.after(main);
  } else {
    main.classList.add("rk-main");
  }

  // Use the same body layout on every admin page.
  document.body.classList.add("rk-admin");

  // Highlight the current page.
  header.querySelectorAll("nav a").forEach(link => {
    if (link.classList.contains("active")) {
      link.setAttribute("aria-current", "page");
    }
  });
})();
