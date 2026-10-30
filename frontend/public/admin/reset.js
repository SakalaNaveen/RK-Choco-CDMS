
/* ============================================================
   RK CHOCO ADMIN - RESET PASSWORD
   File: frontend/public/admin/reset.js
============================================================ */

"use strict";

(() => {
  const form = document.getElementById("resetForm");
  const message = document.getElementById("resetMessage");
  const updateButton = document.getElementById("updateButton");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  if (
    !form ||
    !message ||
    !updateButton ||
    !newPasswordInput ||
    !confirmPasswordInput
  ) {
    console.error("Reset password form elements were not found.");
    return;
  }

  const token = new URLSearchParams(window.location.search).get("token");

  const MIN_PASSWORD_LENGTH = 12;

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "message";
  }

  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;

      input.type =
        input.type === "password" ? "text" : "password";

      const visible = input.type === "text";

      button.setAttribute("aria-pressed", String(visible));
      button.setAttribute(
        "aria-label",
        visible ? "Hide password" : "Show password"
      );

      button.title = visible ? "Hide password" : "Show password";
    });
  });

  if (!token) {
    showMessage(
      "Reset link is missing or invalid. Please request a new reset email.",
      "error"
    );

    updateButton.disabled = true;
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      showMessage(
        `Please enter a password containing at least ${MIN_PASSWORD_LENGTH} characters.`,
        "error"
      );

      newPasswordInput.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "Passwords do not match. Enter the same password in both fields.",
        "error"
      );

      confirmPasswordInput.focus();
      return;
    }

    updateButton.disabled = true;
    updateButton.textContent = "Updating Password...";

    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          password: newPassword,
          newPassword,
          confirmPassword
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message ||
          "Password reset failed. Please request a new reset link if it has expired."
        );
      }

      showMessage(
        "Password updated successfully! Opening Admin Login...",
        "success"
      );

      form.reset();
      updateButton.textContent = "Password Updated";

      window.setTimeout(() => {
        window.location.replace("/admin/");
      }, 1200);

    } catch (error) {
      showMessage(
        error.message ||
        "Unable to connect to the server. Please try again.",
        "error"
      );

      updateButton.disabled = false;
      updateButton.textContent = "Update Password";
    }
  });
})();
