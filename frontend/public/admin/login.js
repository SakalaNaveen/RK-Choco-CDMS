
"use strict";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm && loginMessage) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            loginMessage.textContent = "Please enter email and password.";
            return;
        }

        loginMessage.textContent = "Checking login details...";

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                loginMessage.textContent =
                    result.message || "Login failed. Please try again.";
                return;
            }

            loginMessage.textContent = "Login successful! Opening dashboard...";

            window.location.href =
                result.redirect || "/admin/dashboard.html";

        } catch (error) {
            console.error("Admin login error:", error);

            loginMessage.textContent =
                "Cannot connect to the backend server.";
        }
    });
}
