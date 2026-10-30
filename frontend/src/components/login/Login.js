function LoginPage() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [forgotEmail, setForgotEmail] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const navigate = (path) => {
    window.location.href = path;
  };

  /* ================================
     LOGIN
  ================================= */

  const handleLogin = (e) => {
    e.preventDefault();

    const users = getUsers();

    const user = users.find(
      (item) =>
        item.email?.toLowerCase() ===
          email.trim().toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setMessage("Invalid email or password.");
      return;
    }

    localStorage.setItem(
      "rkChocoLoggedIn",
      "true"
    );

    localStorage.setItem(
      "rkChocoCurrentUser",
      JSON.stringify(user)
    );

    setMessage("Login successful!");

    setTimeout(() => {
      navigate("/");
    }, 700);
  };

  /* ================================
     OPEN FORGOT PASSWORD
  ================================= */

  const openForgotPassword = () => {
    setForgotEmail(email);
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setShowForgotPassword(true);
  };

  /* ================================
     CLOSE FORGOT PASSWORD
  ================================= */

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setNewPassword("");
    setConfirmPassword("");
  };

  /* ================================
     RESET PASSWORD
  ================================= */

  const handleForgotPassword = (e) => {
    e.preventDefault();

    if (
      !forgotEmail.trim() ||
      !newPassword ||
      !confirmPassword
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const users = getUsers();

    const userIndex = users.findIndex(
      (user) =>
        user.email?.toLowerCase() ===
        forgotEmail.trim().toLowerCase()
    );

    if (userIndex === -1) {
      alert(
        "Email not found. Please register first."
      );
      return;
    }

    users[userIndex].password = newPassword;

    setJSON(
      "rkChocoUsers",
      users
    );

    alert(
      "Password reset successfully!"
    );

    closeForgotPassword();
  };

  return (
    <div style={authPageStyle}>

      <div style={authContainerStyle}>

        {/* =====================================
            LEFT SIDE
        ====================================== */}

        <AuthBrandSide />

        {/* =====================================
            RIGHT SIDE
        ====================================== */}

        <div style={authRightStyle}>

          {/* BACK TO HOME */}

          <button
            onClick={() => navigate("/")}
            style={{
              border: "none",
              background: "transparent",
              color: "#3c1b12",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontWeight: "700",
              marginBottom: "20px",
              width: "fit-content",
              fontSize: "14px",
            }}
          >
            <FaArrowLeft />
            Back to Home
          </button>

          {/* LOGIN TITLE */}

          <h2
            style={{
              color: "#3c1b12",
              fontSize: "34px",
              margin: "0 0 8px",
            }}
          >
            Login
          </h2>

          <p
            style={{
              color: "#735c50",
              marginBottom: "25px",
            }}
          >
            Login to continue to RK Choco.
          </p>

          {/* =====================================
              LOGIN FORM
          ====================================== */}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "700",
                color: "#3c1b12",
              }}
            >
              Email
            </label>

            <div
              style={{
                position: "relative",
                marginBottom: "18px",
              }}
            >

              <FaEnvelope
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "15px",
                  color: "#8d6d5b",
                }}
              />

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                style={{
                  ...authInputStyle,
                  paddingLeft: "42px",
                }}
              />

            </div>

            {/* PASSWORD */}

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "700",
                color: "#3c1b12",
              }}
            >
              Password
            </label>

            <div
              style={{
                position: "relative",
                marginBottom: "10px",
              }}
            >

              <FaLock
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "15px",
                  color: "#8d6d5b",
                }}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                style={{
                  ...authInputStyle,
                  paddingLeft: "42px",
                  paddingRight: "45px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "10px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#6e5144",
                  fontSize: "18px",
                }}
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            {/* =====================================
                FORGOT PASSWORD
                THIS WILL DEFINITELY SHOW
            ====================================== */}

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "22px",
                marginTop: "5px",
              }}
            >

              <button
                type="button"
                onClick={openForgotPassword}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#8b4513",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "800",
                  padding: "6px 0",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </button>

            </div>

            {/* MESSAGE */}

            {message && (
              <p
                style={{
                  color: message.includes(
                    "successful"
                  )
                    ? "green"
                    : "#b42318",
                  fontWeight: "700",
                }}
              >
                {message}
              </p>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              style={{
                ...primaryButton,
                width: "100%",
                marginTop: "2px",
              }}
            >
              <FaUser />
              Login
            </button>

          </form>

          {/* REGISTER */}

          <p
            style={{
              textAlign: "center",
              marginTop: "22px",
              color: "#735c50",
            }}
          >
            Don't have an account?{" "}

            <span
              onClick={() =>
                navigate("/register")
              }
              style={{
                color: "#3c1b12",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Register
            </span>
          </p>

        </div>
      </div>

      {/* ==================================================
          FORGOT PASSWORD POPUP
      =================================================== */}

      {showForgotPassword && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background:
              "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "470px",
              background: "#fff",
              borderRadius: "22px",
              padding: "35px",
              boxSizing: "border-box",
              position: "relative",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.35)",
            }}
          >

            {/* CLOSE */}

            <button
              type="button"
              onClick={closeForgotPassword}
              style={{
                position: "absolute",
                right: "15px",
                top: "15px",
                width: "35px",
                height: "35px",
                border: "none",
                borderRadius: "50%",
                background: "#f3eee9",
                color: "#3c1b12",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              <FaTimesCircle />
            </button>

            {/* ICON */}

            <div
              style={{
                width: "65px",
                height: "65px",
                borderRadius: "50%",
                background: "#f5e4d4",
                color: "#8b4513",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                fontSize: "25px",
              }}
            >
              <FaLock />
            </div>

            {/* TITLE */}

            <h2
              style={{
                textAlign: "center",
                color: "#3c1b12",
                margin: "0 0 8px",
                fontSize: "28px",
              }}
            >
              Forgot Password?
            </h2>

            <p
              style={{
                textAlign: "center",
                color: "#735c50",
                marginBottom: "25px",
              }}
            >
              Reset your RK Choco password.
            </p>

            <form
              onSubmit={handleForgotPassword}
            >

              {/* EMAIL */}

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#3c1b12",
                }}
              >
                Email
              </label>

              <div
                style={{
                  position: "relative",
                  marginBottom: "18px",
                }}
              >

                <FaEnvelope
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "15px",
                    color: "#8d6d5b",
                  }}
                />

                <input
                  type="email"
                  placeholder="Enter registered email"
                  value={forgotEmail}
                  onChange={(e) =>
                    setForgotEmail(
                      e.target.value
                    )
                  }
                  required
                  style={{
                    ...authInputStyle,
                    paddingLeft: "42px",
                  }}
                />

              </div>

              {/* NEW PASSWORD */}

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#3c1b12",
                }}
              >
                New Password
              </label>

              <div
                style={{
                  position: "relative",
                  marginBottom: "18px",
                }}
              >

                <FaLock
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "15px",
                    color: "#8d6d5b",
                  }}
                />

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  required
                  style={{
                    ...authInputStyle,
                    paddingLeft: "42px",
                  }}
                />

              </div>

              {/* CONFIRM PASSWORD */}

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#3c1b12",
                }}
              >
                Confirm Password
              </label>

              <div
                style={{
                  position: "relative",
                  marginBottom: "22px",
                }}
              >

                <FaLock
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "15px",
                    color: "#8d6d5b",
                  }}
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                  style={{
                    ...authInputStyle,
                    paddingLeft: "42px",
                  }}
                />

              </div>

              {/* RESET */}

              <button
                type="submit"
                style={{
                  ...primaryButton,
                  width: "100%",
                }}
              >
                <FaLock />
                Reset Password
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}