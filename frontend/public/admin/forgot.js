
/* ============================================================
   RK CHOCO ADMIN - FORGOT PASSWORD
   File: frontend/public/admin/forgot.js
   Backend: POST /api/admin/forgot-password
============================================================ */

"use strict";

(() => {
  const form = document.getElementById("forgotForm");
  const emailInput = document.getElementById("email");
  const message = document.getElementById("forgotMessage");
  const submitButton = document.getElementById("sendResetButton");

  if (!form || !emailInput || !message || !submitButton) {
    console.error("Forgot password form elements were not found.");
    return;
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "message";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const email = emailInput.value.trim();

    if (!email) {
      showMessage("Please enter your admin email address.", "error");
      emailInput.focus();
      return;
    }

    if (!emailInput.checkValidity()) {
      showMessage("Please enter a valid email address.", "error");
      emailInput.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again."
        );
      }

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || "Unable to process the reset request."
        );
      }

      showMessage(
        result.message ||
          "If the email matches the admin account, a reset link will be sent. Please check your inbox and spam folder.",
        "success"
      );

      form.reset();
    } catch (error) {
      showMessage(
        error.message ||
          "Unable to connect to the server. Please make sure the backend is running.",
        "error"
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send Reset Link";
    }
  });
})();
