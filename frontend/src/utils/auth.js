// frontend/src/utils/auth.js

// ==========================================
// RK CHOCO - AUTHENTICATION UTILITIES
// ==========================================


// ------------------------------------------
// REGISTER USER
// ------------------------------------------
export const registerUser = (userData) => {
  localStorage.setItem(
    "rkChocoRegisteredUser",
    JSON.stringify(userData)
  );
};


// ------------------------------------------
// GET REGISTERED USER
// ------------------------------------------
export const getRegisteredUser = () => {
  const user = localStorage.getItem("rkChocoRegisteredUser");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Error reading registered user:", error);
    return null;
  }
};


// ------------------------------------------
// LOGIN USER
// ------------------------------------------
export const loginUser = (email, password) => {
  const registeredUser = getRegisteredUser();

  // No registered account
  if (!registeredUser) {
    return {
      success: false,
      message: "No registered account found. Please register first.",
    };
  }

  // Check email
  if (registeredUser.email !== email) {
    return {
      success: false,
      message: "Email address is not registered.",
    };
  }

  // Check password
  if (registeredUser.password !== password) {
    return {
      success: false,
      message: "Incorrect password.",
    };
  }

  // User information for logged-in session
  const loggedInUser = {
    name: registeredUser.name,
    email: registeredUser.email,
    phone: registeredUser.phone,
    shopName: registeredUser.shopName,
  };

  // Save logged-in user
  localStorage.setItem(
    "rkChocoUser",
    JSON.stringify(loggedInUser)
  );

  return {
    success: true,
    message: "Login successful!",
    user: loggedInUser,
  };
};


// ------------------------------------------
// GET CURRENT LOGGED-IN USER
// ------------------------------------------
export const getCurrentUser = () => {
  const user = localStorage.getItem("rkChocoUser");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Error reading logged-in user:", error);
    return null;
  }
};


// ------------------------------------------
// CHECK LOGIN STATUS
// ------------------------------------------
export const isLoggedIn = () => {
  const user = localStorage.getItem("rkChocoUser");

  return user !== null;
};


// ------------------------------------------
// LOGOUT USER
// ------------------------------------------
export const logoutUser = () => {
  localStorage.removeItem("rkChocoUser");
};


// ------------------------------------------
// CLEAR ALL AUTH DATA
// ------------------------------------------
export const clearAuthData = () => {
  localStorage.removeItem("rkChocoUser");
  localStorage.removeItem("rkChocoRegisteredUser");
};