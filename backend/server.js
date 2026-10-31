/* =========================================================
   RK CHOCO - COMPLETE MONGODB BACKEND
   Product Image Upload Enabled
   File: backend/server.js
========================================================= */

require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { MongoClient, ObjectId } = require("mongodb");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const DB_NAME = process.env.MONGODB_DB_NAME || "rkchoco";
const MONGODB_URI = process.env.MONGODB_URI;

const ADMIN_FOLDER = path.join(__dirname, "../frontend/public/admin");
const DATA_FOLDER = path.join(__dirname, "data");
const ADMIN_FILE = path.join(DATA_FOLDER, "admin.json");

const UPLOAD_FOLDER = path.join(__dirname, "uploads", "products");

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is missing in backend/.env");
  process.exit(1);
}

app.disable("x-powered-by");
app.set("trust proxy", 1);

/* =========================================================
   PRODUCT IMAGE UPLOAD CONFIGURATION
========================================================= */

fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const safeExtension = [".jpg", ".jpeg", ".png", ".webp"].includes(
      extension
    )
      ? extension
      : ".jpg";

    const filename =
      `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExtension}`;

    cb(null, filename);
  }
});

const uploadProductImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG and WEBP images are allowed.")
      );
    }

    cb(null, true);
  }
});


/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "https://rk-choco-frontend.onrender.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.29.199:3000"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);

  if (origin && isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));


/* =========================================================
   SERVE UPLOADED PRODUCT IMAGES
========================================================= */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================================================
   SESSION
========================================================= */

app.use(
  session({
    name: "rkChocoAdminSession",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 60 * 60 * 1000
    }
  })
);

/* =========================================================
   DATABASE AND HELPERS
========================================================= */

const mongoClient = new MongoClient(MONGODB_URI);

let db;
let customers;
let products;
let orders;

const resetTokens = new Map();

const fail = (res, status, message) =>
  res.status(status).json({
    success: false,
    message
  });

const cleanEmail = value =>
  String(value || "").trim().toLowerCase();

const validEmail = value =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const oid = value =>
  ObjectId.isValid(String(value || ""))
    ? new ObjectId(String(value))
    : null;

const normalizeStatus = value =>
  String(value || "Placed").trim().toLowerCase();

function requireCustomer(req, res, next) {
  if (!req.session.customerId) {
    return fail(res, 401, "Please log in to continue.");
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.adminLoggedIn) {
    return fail(res, 401, "Please log in to the admin dashboard.");
  }

  next();
}

function publicCustomer(customer) {
  return {
    _id: String(customer._id),
    id: String(customer._id),
    name: customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    address: customer.address || "",
    createdAt: customer.createdAt || null
  };
}

function publicProduct(product) {
  return {
    ...product,
    _id: String(product._id),
    id: String(product._id),
    name: product.name || product.title || "Chocolate"
  };
}

function publicOrder(order) {
  return {
    ...order,
    _id: String(order._id),
    id: String(order._id),
    customerId: String(order.customerId)
  };
}

function saveSession(req, res, payload) {
  req.session.save(error => {
    if (error) {
      console.error("Session save error:", error);
      return fail(res, 500, "Unable to save session.");
    }

    return res.json(payload);
  });
}

function deleteUploadedProductImage(imagePath) {
  const value = String(imagePath || "");

  if (!value.startsWith("/uploads/products/")) {
    return;
  }

  const filename = path.basename(value);
  const filePath = path.join(UPLOAD_FOLDER, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Product image deletion error:", error.message);
  }
}

function getUploadedImagePath(req) {
  return req.file
    ? `/uploads/products/${req.file.filename}`
    : "";
}

/* =========================================================
   ADMIN CONFIGURATION
========================================================= */

function readAdmin() {
  try {
    if (!fs.existsSync(ADMIN_FILE)) return null;

    return JSON.parse(fs.readFileSync(ADMIN_FILE, "utf8"));
  } catch (error) {
    console.error("Admin configuration error:", error.message);
    return null;
  }
}

function saveAdmin(admin) {
  fs.mkdirSync(DATA_FOLDER, { recursive: true });

  fs.writeFileSync(
    ADMIN_FILE,
    JSON.stringify(admin, null, 2),
    "utf8"
  );
}

async function initializeAdmin() {
  fs.mkdirSync(DATA_FOLDER, { recursive: true });

  let admin = readAdmin();

  if (!admin) {
    if (!process.env.ADMIN_INITIAL_PASSWORD) {
      throw new Error(
        "Set ADMIN_INITIAL_PASSWORD in backend/.env before first startup."
      );
    }

    admin = {
      username: process.env.ADMIN_USERNAME || "admin",
      email: cleanEmail(process.env.ADMIN_EMAIL),
      passwordHash: await bcrypt.hash(
        process.env.ADMIN_INITIAL_PASSWORD,
        12
      )
    };

    saveAdmin(admin);
    console.log("Initial admin account created.");
    return;
  }

  if (admin.password && !admin.passwordHash) {
    admin.passwordHash = await bcrypt.hash(admin.password, 12);
    delete admin.password;
    saveAdmin(admin);
  }

  if (!admin.passwordHash && process.env.ADMIN_INITIAL_PASSWORD) {
    admin.passwordHash = await bcrypt.hash(
      process.env.ADMIN_INITIAL_PASSWORD,
      12
    );

    saveAdmin(admin);
  }
}

/* =========================================================
   DEFAULT PRODUCTS
   Existing products are not overwritten.
========================================================= */

async function seedProducts() {
  const defaults = [
    {
      name: "KitKat",
      brand: "Nestlé KitKat",
      price: 30,
      stock: 60,
      unit: "1 Box = 10 Pieces",
      image: "kitkat.png"
    },
    {
      name: "Dairy Milk",
      brand: "Cadbury Dairy Milk",
      price: 40,
      stock: 55,
      unit: "1 Box = 10 Pieces",
      image: "dairyMilk.png"
    },
    {
      name: "5 Star",
      brand: "Cadbury 5 Star",
      price: 30,
      stock: 70,
      unit: "1 Box = 10 Pieces",
      image: "fiveStar.png"
    },
    {
      name: "Munch",
      brand: "Nestlé Munch",
      price: 20,
      stock: 65,
      unit: "1 Box = 10 Pieces",
      image: "munch.png"
    },
    {
      name: "Milkybar",
      brand: "Nestlé Milkybar",
      price: 30,
      stock: 50,
      unit: "1 Box = 10 Pieces",
      image: "milkybar.png"
    },
    {
      name: "Perk",
      brand: "Cadbury Perk",
      price: 20,
      stock: 45,
      unit: "1 Box = 10 Pieces",
      image: "perk.png"
    },
    {
      name: "Oreo",
      brand: "Oreo",
      price: 30,
      stock: 50,
      unit: "1 Box = 10 Pieces",
      image: "oreo.png"
    }
  ];

  for (const product of defaults) {
    await products.updateOne(
      { name: { $regex: `^${product.name}$`, $options: "i" } },
      {
        $setOnInsert: {
          ...product,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  }
}

/* =========================================================
   CUSTOMER REGISTRATION
========================================================= */

app.post("/api/customers/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || "");
    const phone = String(req.body.phone || "").trim();
    const address = String(req.body.address || "").trim();

    if (!name || !validEmail(email) || password.length < 6) {
      return fail(
        res,
        400,
        "Enter a name, valid email and password of at least 6 characters."
      );
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return fail(res, 400, "Enter a valid 10-digit phone number.");
    }

    if (await customers.findOne({ email })) {
      return fail(res, 409, "An account with this email already exists.");
    }

    const now = new Date();

    const customer = {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      phone,
      address,
      createdAt: now,
      updatedAt: now
    };

    const result = await customers.insertOne(customer);
    customer._id = result.insertedId;

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      customer: publicCustomer(customer)
    });
  } catch (error) {
    if (error.code === 11000) {
      return fail(res, 409, "This email is already registered.");
    }

    console.error("Customer registration error:", error);
    return fail(res, 500, "Unable to register customer.");
  }
});

/* =========================================================
   CUSTOMER LOGIN
========================================================= */

app.post("/api/customers/login", async (req, res) => {
  try {
    const customer = await customers.findOne({
      email: cleanEmail(req.body.email)
    });

    if (
      !customer ||
      !customer.passwordHash ||
      !(await bcrypt.compare(
        String(req.body.password || ""),
        customer.passwordHash
      ))
    ) {
      return fail(res, 401, "Invalid email or password.");
    }

    req.session.customerId = String(customer._id);
    req.session.customerEmail = customer.email;

    return saveSession(req, res, {
      success: true,
      message: "Login successful.",
      customer: publicCustomer(customer)
    });
  } catch (error) {
    console.error("Customer login error:", error);
    return fail(res, 500, "Unable to log in.");
  }
});

/* =========================================================
   CUSTOMER SESSION
========================================================= */

app.get("/api/customers/session", requireCustomer, async (req, res) => {
  try {
    const customer = await customers.findOne({
      _id: oid(req.session.customerId)
    });

    if (!customer) {
      delete req.session.customerId;
      delete req.session.customerEmail;

      return fail(res, 401, "Customer account was not found.");
    }

    return res.json({
      success: true,
      customer: publicCustomer(customer)
    });
  } catch (error) {
    console.error("Customer session error:", error);
    return fail(res, 500, "Unable to load customer session.");
  }
});

/* =========================================================
   CUSTOMER LOGOUT
========================================================= */

app.post("/api/customers/logout", (req, res) => {
  delete req.session.customerId;
  delete req.session.customerEmail;

  return saveSession(req, res, {
    success: true,
    message: "Customer logged out successfully."
  });
});

/* =========================================================
   CUSTOMER FORGOT PASSWORD
========================================================= */

app.post("/api/customers/forgot-password", async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");
    const confirmPassword = String(req.body.confirmPassword || "");

    if (!email || !phone || !password || !confirmPassword) {
      return fail(res, 400, "Please fill all the fields.");
    }

    if (password.length < 6) {
      return fail(res, 400, "Password must contain at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return fail(res, 400, "Passwords do not match.");
    }

    const result = await customers.updateOne(
      { email, phone },
      {
        $set: {
          passwordHash: await bcrypt.hash(password, 12),
          updatedAt: new Date()
        }
      }
    );

    if (!result.matchedCount) {
      return fail(
        res,
        404,
        "Email and phone number do not match a registered account."
      );
    }

    return res.json({
      success: true,
      message: "Password changed successfully. Please log in."
    });
  } catch (error) {
    console.error("Customer password reset error:", error);
    return fail(res, 500, "Unable to reset password.");
  }
});

/* =========================================================
   PUBLIC PRODUCTS
========================================================= */

app.get("/api/products-debug", (req, res) => {
  res.json({
    success: true,
    message: "Correct server.js is running."
  });
});

app.get("/api/products", async (req, res) => {
  try {
    const list = await products.find({}).sort({ name: 1 }).toArray();

    return res
      .set("Cache-Control", "no-store")
      .json({
        success: true,
        products: list.map(publicProduct)
      });
  } catch (error) {
    console.error("Products error:", error);
    return fail(res, 500, "Unable to load products from MongoDB.");
  }
});

/* =========================================================
   CUSTOMER PLACE ORDER
========================================================= */

app.post("/api/orders", requireCustomer, async (req, res) => {
  const mongoSession = mongoClient.startSession();

  try {
    const customerId = oid(req.session.customerId);

    if (!customerId) {
      return fail(res, 401, "Please log in again.");
    }

    const customer = await customers.findOne({ _id: customerId });

    if (!customer) {
      return fail(res, 401, "Customer account was not found.");
    }

    const input = Array.isArray(req.body.items)
      ? req.body.items
      : Array.isArray(req.body.products)
        ? req.body.products
        : [];

    if (!input.length) {
      return fail(res, 400, "Your cart is empty.");
    }

    const normalizeName = value =>
      String(value || "")
        .trim()
        .replace(/^(cadbury|nestlé|nestle)\s+/i, "")
        .replace(/\s+/g, " ")
        .toLowerCase();

    const escapeRegex = value =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const byProductId = new Map();

    for (const raw of input) {
      const quantity = Number(raw.quantity ?? raw.qty ?? 1);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return fail(res, 400, "Invalid product quantity.");
      }

      const rawName = String(
        raw.name || raw.title || raw.productName || ""
      ).trim();

      const rawBrand = String(raw.brand || raw.company || "").trim();

      const productId = oid(
        raw.productId || raw.mongoId || raw._id || raw.id
      );

      let product = productId
        ? await products.findOne({ _id: productId })
        : null;

      if (!product) {
        const candidates = [
          ...new Set(
            [rawName, rawBrand]
              .filter(Boolean)
              .flatMap(value => [value, normalizeName(value)])
          )
        ];

        for (const candidate of candidates) {
          const escaped = escapeRegex(candidate);

          product = await products.findOne({
            $or: [
              { name: { $regex: `^${escaped}$`, $options: "i" } },
              { brand: { $regex: `^${escaped}$`, $options: "i" } }
            ]
          });

          if (product) break;
        }
      }

      if (!product) {
        const wanted = new Set(
          [normalizeName(rawName), normalizeName(rawBrand)].filter(Boolean)
        );

        const allProducts = await products.find({}).toArray();

        product =
          allProducts.find(
            item =>
              wanted.has(normalizeName(item.name)) ||
              wanted.has(normalizeName(item.brand))
          ) || null;
      }

      if (!product) {
        return fail(
          res,
          400,
          `Product "${rawName || rawBrand || "selected"}" was not found in MongoDB.`
        );
      }

      const key = String(product._id);
      const current = byProductId.get(key);

      byProductId.set(key, {
        product,
        quantity: quantity + (current ? current.quantity : 0)
      });
    }

    const items = [];
    let totalBoxes = 0;
    let grandTotal = 0;

    for (const { product, quantity } of byProductId.values()) {
      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return fail(res, 400, `Invalid price for ${product.name}.`);
      }

      items.push({
        productId: String(product._id),
        name: product.name || product.title || "Chocolate",
        brand: product.brand || "",
        price,
        quantity,
        subtotal: price * quantity
      });

      totalBoxes += quantity;
      grandTotal += price * quantity;
    }

    const delivery = req.body.deliveryDetails || {};

    const order = {
      customerId,
      customerName: String(
        delivery.fullName || delivery.name || customer.name || ""
      ).trim(),
      customerEmail: customer.email,
      customerPhone: String(
        delivery.phone || delivery.phoneNumber || customer.phone || ""
      ).trim(),
      customerAddress: String(
        delivery.address ||
          delivery.deliveryAddress ||
          customer.address ||
          ""
      ).trim(),
      items,
      totalBoxes,
      grandTotal,
      status: "Placed",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let insertedOrderId;

    await mongoSession.withTransaction(async () => {
      for (const item of items) {
        const result = await products.updateOne(
          {
            _id: new ObjectId(item.productId),
            stock: { $gte: item.quantity }
          },
          {
            $inc: { stock: -item.quantity },
            $set: { updatedAt: new Date() }
          },
          { session: mongoSession }
        );

        if (!result.matchedCount) {
          const error = new Error(
            `Not enough stock for ${item.name}. Reduce the quantity and try again.`
          );
          error.code = "INSUFFICIENT_STOCK";
          throw error;
        }
      }

      const result = await orders.insertOne(order, {
        session: mongoSession
      });

      insertedOrderId = result.insertedId;
    });

    order._id = insertedOrderId;

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: publicOrder(order)
    });
  } catch (error) {
    if (error.code === "INSUFFICIENT_STOCK") {
      return fail(res, 409, error.message);
    }

    console.error("Place order error:", error);

    return fail(
      res,
      500,
      "Unable to place order. Please check the backend terminal."
    );
  } finally {
    await mongoSession.endSession();
  }
});

/* =========================================================
   CUSTOMER ORDER HISTORY
========================================================= */

app.get("/api/orders/my-orders", requireCustomer, async (req, res) => {
  try {
    const list = await orders
      .find({ customerId: oid(req.session.customerId) })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({
      success: true,
      orders: list.map(publicOrder)
    });
  } catch (error) {
    console.error("Customer order history error:", error);
    return fail(res, 500, "Unable to load your orders.");
  }
});

/* =========================================================
   CUSTOMER CANCEL ORDER
========================================================= */

app.patch("/api/orders/:id/cancel", requireCustomer, async (req, res) => {
  const mongoSession = mongoClient.startSession();

  try {
    const _id = oid(req.params.id);
    const customerId = oid(req.session.customerId);

    if (!_id) {
      return fail(res, 400, "Invalid order ID.");
    }

    let notFound = false;
    let invalidStatus = false;
    let expired = false;

    await mongoSession.withTransaction(async () => {
      const order = await orders.findOne(
        { _id, customerId },
        { session: mongoSession }
      );

      if (!order) {
        notFound = true;
        return;
      }

      const status = normalizeStatus(order.status);

      if (["cancelled", "delivered"].includes(status)) {
        invalidStatus = true;
        return;
      }

      if (
        !order.createdAt ||
        Date.now() - new Date(order.createdAt).getTime() >=
          24 * 60 * 60 * 1000
      ) {
        expired = true;
        return;
      }

      const changed = await orders.updateOne(
        {
          _id,
          customerId,
          status: order.status
        },
        {
          $set: {
            status: "Cancelled",
            updatedAt: new Date()
          }
        },
        { session: mongoSession }
      );

      if (!changed.modifiedCount) {
        invalidStatus = true;
        return;
      }

      for (const item of order.items || []) {
        const productId = oid(item.productId);

        if (productId) {
          await products.updateOne(
            { _id: productId },
            {
              $inc: { stock: Number(item.quantity) || 0 },
              $set: { updatedAt: new Date() }
            },
            { session: mongoSession }
          );
        }
      }
    });

    if (notFound) return fail(res, 404, "Order not found.");

    if (invalidStatus) {
      return fail(res, 400, "This order can no longer be cancelled.");
    }

    if (expired) {
      return fail(
        res,
        400,
        "Orders can only be cancelled within 24 hours of placement."
      );
    }

    return res.json({
      success: true,
      message: "Order cancelled successfully."
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return fail(res, 500, "Unable to cancel order.");
  } finally {
    await mongoSession.endSession();
  }
});

/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post("/api/admin/login", async (req, res) => {
  try {
    const loginValue = String(
      req.body.email ||
      req.body.adminEmail ||
      req.body.username ||
      ""
    ).trim();

    const password = String(req.body.password || "");
    const admin = readAdmin();

    if (!admin || !admin.passwordHash) {
      return fail(
        res,
        500,
        "Admin account is not configured. Check backend/data/admin.json."
      );
    }

    const savedUsername = String(admin.username || "").trim();
    const savedEmail = cleanEmail(
      admin.email || process.env.ADMIN_EMAIL || ""
    );

    const matchesUsername =
      loginValue.toLowerCase() === savedUsername.toLowerCase();

    const matchesEmail =
      Boolean(savedEmail) &&
      cleanEmail(loginValue) === savedEmail;

    if (!matchesUsername && !matchesEmail) {
      return fail(res, 401, "Invalid username or password.");
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return fail(res, 401, "Invalid username or password.");
    }

    req.session.adminLoggedIn = true;
    req.session.adminUsername = savedUsername || "admin";

    return saveSession(req, res, {
      success: true,
      message: "Admin login successful.",
      authenticated: true,
      loggedIn: true,
      username: req.session.adminUsername
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return fail(res, 500, "Admin login failed.");
  }
});

/* =========================================================
   ADMIN SESSION
========================================================= */

app.get("/api/admin/session", (req, res) => {
  const loggedIn = Boolean(req.session.adminLoggedIn);

  return res
    .set("Cache-Control", "no-store")
    .json({
      success: true,
      authenticated: loggedIn,
      loggedIn,
      isAuthenticated: loggedIn,
      username: loggedIn
        ? req.session.adminUsername || "admin"
        : null
    });
});

/* =========================================================
   ADMIN LOGOUT
========================================================= */

app.post("/api/admin/logout", (req, res) => {
  delete req.session.adminLoggedIn;
  delete req.session.adminUsername;

  return saveSession(req, res, {
    success: true,
    message: "Admin logged out successfully."
  });
});

/* =========================================================
   ADMIN FORGOT PASSWORD - RESEND API
========================================================= */

app.post("/api/admin/forgot-password", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your admin email address."
      });
    }

    const resendApiKey = String(
      process.env.RESEND_API_KEY || ""
    ).trim();

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is missing.");

      return res.status(500).json({
        success: false,
        message: "Email service is not configured."
      });
    }

    const admin = readAdmin();

    const adminEmail = String(admin?.email || "")
      .trim()
      .toLowerCase();

    if (!adminEmail || email !== adminEmail) {
      return res.json({
        success: true,
        message: "If the admin email is registered, a reset link will be sent."
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const baseUrl = String(
      process.env.ADMIN_RESET_BASE_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      "https://rk-choco-cdms.onrender.com"
    ).replace(/\/+$/, "");

    const resetUrl =
      `${baseUrl}/admin/reset-password.html?token=${token}`;

    const emailResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "RK Choco Admin <onboarding@resend.dev>",
          to: [adminEmail],
          subject: "RK Choco Admin - Reset Your Password",
          text:
            "A password reset was requested for your RK Choco Admin account.\n\n" +
            `Open this link to set a new password:\n${resetUrl}\n\n` +
            "This link expires in 15 minutes. If you did not request this, ignore this email.",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
              <h2 style="color:#542b19">RK Choco Admin</h2>
              <p>A password reset was requested for your admin account.</p>
              <p>
                <a href="${resetUrl}"
                   style="display:inline-block;background:#542b19;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px">
                  Reset Password
                </a>
              </p>
              <p>If the button does not work, open this link:</p>
              <p style="word-break:break-all">${resetUrl}</p>
              <p>This link expires in 15 minutes.</p>
              <p>If you did not request this, you can ignore this email.</p>
            </div>
          `
        })
      }
    );

    const responseText = await emailResponse.text();

    let resendResult = {};

    try {
      resendResult = responseText ? JSON.parse(responseText) : {};
    } catch {
      resendResult = { message: responseText };
    }

    if (!emailResponse.ok) {
      console.error(
        "Resend API error:",
        emailResponse.status,
        resendResult
      );

      return res.status(500).json({
        success: false,
        message: "Could not send the reset email. Please check Resend settings."
      });
    }

    resetTokens.set(token, {
      email: adminEmail,
      expiresAt: Date.now() + 15 * 60 * 1000
    });

    console.log("Admin password reset email sent successfully.");

    return res.json({
      success: true,
      message: "Password reset link sent. Please check your inbox and spam folder."
    });

  } catch (error) {
    console.error(
      "Admin forgot password Resend error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Could not send the reset email. Please try again."
    });
  }
});


/* =========================================================
   ADMIN RESET PASSWORD
   Fixed: password / newPassword / confirmPassword
========================================================= */

app.post("/api/admin/reset-password", async (req, res) => {
  try {
    const token = String(req.body.token || "").trim();

    // Accept both field names sent by the frontend.
    const password = String(
      req.body.newPassword || req.body.password || ""
    );

    const confirmPassword = String(
      req.body.confirmPassword || ""
    );

    // Validate reset token first.
    const item = resetTokens.get(token);

    if (!token || !item || item.expiresAt < Date.now()) {
      resetTokens.delete(token);

      return fail(
        res,
        400,
        "Reset link is invalid or expired. Please request a new link."
      );
    }

    // Validate password.
    if (password.length < 12) {
      return fail(
        res,
        400,
        "Password must contain at least 12 characters."
      );
    }

    // Confirm password is required.
    if (!confirmPassword) {
      return fail(
        res,
        400,
        "Please confirm your new password."
      );
    }

    // Both passwords must match.
    if (password !== confirmPassword) {
      return fail(
        res,
        400,
        "Passwords do not match."
      );
    }

    const admin = readAdmin();

    if (!admin) {
      return fail(
        res,
        500,
        "Admin account was not found."
      );
    }

    // Confirm that the token belongs to this admin account.
    const adminEmail = String(admin.email || "")
      .trim()
      .toLowerCase();

    if (adminEmail !== String(item.email || "").trim().toLowerCase()) {
      resetTokens.delete(token);

      return fail(
        res,
        400,
        "Invalid password reset request."
      );
    }

    // Save the new encrypted password.
    admin.passwordHash = await bcrypt.hash(password, 12);

    delete admin.password;

    saveAdmin(admin);

    // A reset token can only be used once.
    resetTokens.delete(token);

    return res.json({
      success: true,
      message: "Admin password reset successfully. Please log in."
    });

  } catch (error) {
    console.error("Admin reset password error:", error);

    return fail(
      res,
      500,
      "Unable to reset password. Please try again."
    );
  }
});

/* =========================================================
   ADMIN CUSTOMERS API
========================================================= */

app.get("/api/admin/customers", requireAdmin, async (req, res) => {
  try {
    const list = await customers
      .find({})
      .project({ passwordHash: 0, password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return res
      .set("Cache-Control", "no-store")
      .json({
        success: true,
        customers: list.map(publicCustomer),
        total: list.length
      });
  } catch (error) {
    console.error("Admin customers error:", error);
    return fail(res, 500, "Unable to load customers from MongoDB.");
  }
});

/* =========================================================
   ADMIN PRODUCTS API
========================================================= */

app.get("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const list = await products
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({
      success: true,
      products: list.map(publicProduct),
      total: list.length
    });
  } catch (error) {
    console.error("Admin products error:", error);
    return fail(res, 500, "Unable to load products from MongoDB.");
  }
});

/* ADD PRODUCT WITH IMAGE UPLOAD */

app.post(
  "/api/admin/products",
  requireAdmin,
  uploadProductImage.single("imageFile"),
  async (req, res) => {
    try {
      const name = String(req.body.name || req.body.title || "").trim();
      const price = Number(req.body.price);
      const stock = Number(req.body.stock ?? 0);

      if (
        !name ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        if (req.file) {
          deleteUploadedProductImage(
            `/uploads/products/${req.file.filename}`
          );
        }

        return fail(res, 400, "Enter valid product details.");
      }

      const product = {
        name,
        brand: String(req.body.brand || "").trim(),
        price,
        stock,
        unit: String(req.body.unit || "1 Box = 10 Pieces").trim(),
        image: getUploadedImagePath(req) ||
          String(req.body.image || "").trim(),
        description: String(req.body.description || "").trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await products.insertOne(product);
      product._id = result.insertedId;

      return res.status(201).json({
        success: true,
        product: publicProduct(product)
      });
    } catch (error) {
      if (req.file) {
        deleteUploadedProductImage(
          `/uploads/products/${req.file.filename}`
        );
      }

      console.error("Add product error:", error);
      return fail(res, 500, "Unable to add product.");
    }
  }
);

/* UPDATE PRODUCT AND REPLACE OR REMOVE IMAGE */

app.put(
  "/api/admin/products/:id",
  requireAdmin,
  uploadProductImage.single("imageFile"),
  async (req, res) => {
    try {
      const _id = oid(req.params.id);

      if (!_id) {
        if (req.file) {
          deleteUploadedProductImage(
            `/uploads/products/${req.file.filename}`
          );
        }

        return fail(res, 400, "Invalid product ID.");
      }

      const existing = await products.findOne({ _id });

      if (!existing) {
        if (req.file) {
          deleteUploadedProductImage(
            `/uploads/products/${req.file.filename}`
          );
        }

        return fail(res, 404, "Product not found.");
      }

      const update = {};

      for (const key of ["name", "brand", "unit", "description"]) {
        if (req.body[key] !== undefined) {
          update[key] = String(req.body[key]).trim();
        }
      }

      for (const key of ["price", "stock"]) {
        if (req.body[key] !== undefined) {
          update[key] = Number(req.body[key]);

          if (
            !Number.isFinite(update[key]) ||
            update[key] < 0 ||
            (key === "stock" && !Number.isInteger(update[key]))
          ) {
            if (req.file) {
              deleteUploadedProductImage(
                `/uploads/products/${req.file.filename}`
              );
            }

            return fail(res, 400, "Invalid product details.");
          }
        }
      }

      if (update.name !== undefined && !update.name) {
        if (req.file) {
          deleteUploadedProductImage(
            `/uploads/products/${req.file.filename}`
          );
        }

        return fail(res, 400, "Product name is required.");
      }

      const removeImage =
        String(req.body.removeImage || "") === "true";

      if (req.file) {
        update.image = getUploadedImagePath(req);
      } else if (removeImage) {
        update.image = "";
      } else if (req.body.image !== undefined) {
        update.image = String(req.body.image).trim();
      }

      update.updatedAt = new Date();

      await products.updateOne(
        { _id },
        { $set: update }
      );

      if (
        (req.file || removeImage) &&
        existing.image &&
        existing.image !== update.image
      ) {
        deleteUploadedProductImage(existing.image);
      }

      const updatedProduct = await products.findOne({ _id });

      return res.json({
        success: true,
        product: publicProduct(updatedProduct)
      });
    } catch (error) {
      if (req.file) {
        deleteUploadedProductImage(
          `/uploads/products/${req.file.filename}`
        );
      }

      console.error("Update product error:", error);
      return fail(res, 500, "Unable to update product.");
    }
  }
);

/* DELETE PRODUCT */

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const _id = oid(req.params.id);

    if (!_id) {
      return fail(res, 400, "Invalid product ID.");
    }

    const existing = await products.findOne({ _id });

    if (!existing) {
      return fail(res, 404, "Product not found.");
    }

    const result = await products.deleteOne({ _id });

    if (!result.deletedCount) {
      return fail(res, 404, "Product not found.");
    }

    deleteUploadedProductImage(existing.image);

    return res.json({
      success: true,
      message: "Product deleted successfully."
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return fail(res, 500, "Unable to delete product.");
  }
});

/* =========================================================
   ADMIN ORDERS API
========================================================= */

app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  try {
    const list = await orders
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res
      .set("Cache-Control", "no-store")
      .json({
        success: true,
        orders: list.map(publicOrder),
        total: list.length
      });
  } catch (error) {
    console.error("Admin orders error:", error);
    return fail(res, 500, "Unable to load orders from MongoDB.");
  }
});

app.patch(
  "/api/admin/orders/:id/status",
  requireAdmin,
  async (req, res) => {
    try {
      const _id = oid(req.params.id);
      let status = String(req.body.status || "").trim();

      const aliases = {
        "Order Placed": "Placed",
        Pending: "Placed",
        "Order Cancelled": "Cancelled",
        "Out for Delivery": "Shipped"
      };

      status = aliases[status] || status;

      const allowed = [
        "Placed",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
      ];

      if (!_id || !allowed.includes(status)) {
        return fail(res, 400, "Invalid order ID or status.");
      }

      const existing = await orders.findOne({ _id });

      if (!existing) {
        return fail(res, 404, "Order not found.");
      }

      const oldStatus = normalizeStatus(existing.status);
      const newStatus = normalizeStatus(status);

      if (oldStatus === "cancelled" && newStatus !== "cancelled") {
        return fail(res, 400, "A cancelled order cannot be reopened.");
      }

      if (oldStatus === "delivered" && newStatus !== "delivered") {
        return fail(res, 400, "A delivered order cannot be changed.");
      }

      return await updateAdminOrderStatus(req, res, _id, status);
    } catch (error) {
      console.error("Update order status error:", error);
      return fail(res, 500, "Unable to update order status.");
    }
  }
);

async function updateAdminOrderStatus(req, res, _id, status) {
  const mongoSession = mongoClient.startSession();

  try {
    await mongoSession.withTransaction(async () => {
      const order = await orders.findOne(
        { _id },
        { session: mongoSession }
      );

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const oldStatus = normalizeStatus(order.status);
      const newStatus = normalizeStatus(status);

      if (oldStatus === newStatus) return;

      if (oldStatus === "cancelled" || oldStatus === "delivered") {
        throw new Error("ORDER_STATUS_LOCKED");
      }

      if (newStatus === "cancelled") {
        for (const item of order.items || []) {
          const productId = oid(item.productId);

          if (productId) {
            await products.updateOne(
              { _id: productId },
              {
                $inc: { stock: Number(item.quantity) || 0 },
                $set: { updatedAt: new Date() }
              },
              { session: mongoSession }
            );
          }
        }
      }

      await orders.updateOne(
        { _id },
        {
          $set: {
            status,
            updatedAt: new Date()
          }
        },
        { session: mongoSession }
      );
    });

    return res.json({
      success: true,
      message: "Order status updated."
    });
  } catch (error) {
    if (error.message === "ORDER_NOT_FOUND") {
      return fail(res, 404, "Order not found.");
    }

    if (error.message === "ORDER_STATUS_LOCKED") {
      return fail(res, 400, "This order status cannot be changed.");
    }

    console.error("Admin order transaction error:", error);
    return fail(res, 500, "Unable to update order status.");
  } finally {
    await mongoSession.endSession();
  }
}

/* =========================================================
   ADMIN REPORTS API
========================================================= */

app.get("/api/admin/reports", requireAdmin, async (req, res) => {
  try {
    const [totalCustomers, totalProducts, allOrders] =
      await Promise.all([
        customers.countDocuments({}),
        products.countDocuments({}),
        orders
          .find({})
          .project({
            status: 1,
            grandTotal: 1,
            totalBoxes: 1,
            createdAt: 1
          })
          .toArray()
      ]);

    const statusOf = order => normalizeStatus(order.status);

    const totalOrders = allOrders.length;

    const cancelledOrders = allOrders.filter(
      order => statusOf(order) === "cancelled"
    ).length;

    const deliveredOrders = allOrders.filter(
      order => statusOf(order) === "delivered"
    ).length;

    const activeOrders = allOrders.filter(
      order => !["cancelled", "delivered"].includes(statusOf(order))
    ).length;

    const totalRevenue = allOrders
      .filter(order => statusOf(order) !== "cancelled")
      .reduce(
        (sum, order) => sum + (Number(order.grandTotal) || 0),
        0
      );

    const totalBoxesSold = allOrders
      .filter(order => statusOf(order) !== "cancelled")
      .reduce(
        (sum, order) => sum + (Number(order.totalBoxes) || 0),
        0
      );

    return res
      .set("Cache-Control", "no-store")
      .json({
        success: true,
        reports: {
          totalCustomers,
          totalProducts,
          totalOrders,
          activeOrders,
          pendingOrders: activeOrders,
          cancelledOrders,
          deliveredOrders,
          totalBoxesSold,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalSales: Number(totalRevenue.toFixed(2))
        }
      });
  } catch (error) {
    console.error("Admin reports error:", error);
    return fail(res, 500, "Unable to generate reports from MongoDB.");
  }
});

/* =========================================================
   ROOT AND HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.send("RK Choco backend is running.");
});

app.get("/api/health", async (req, res) => {
  try {
    await db.command({ ping: 1 });

    return res.json({
      success: true,
      message: "RK Choco API and MongoDB are running.",
      database: DB_NAME
    });
  } catch (error) {
    return fail(res, 503, "MongoDB is unavailable.");
  }
});

/* =========================================================
   ADMIN PAGES
========================================================= */

app.get(/^\/admin\/?$/, (req, res) => {
  res.sendFile(path.join(ADMIN_FOLDER, "index.html"));
});

app.get("/admin/reset-password.html", (req, res) => {
  res.sendFile(path.join(ADMIN_FOLDER, "reset-password.html"));
});

for (const page of [
  "dashboard.html",
  "products.html",
  "customers.html",
  "orders.html",
  "reports.html"
]) {
  app.get(`/admin/${page}`, (req, res, next) => {
    if (!req.session.adminLoggedIn) {
      return res.redirect("/admin/");
    }

    res.sendFile(path.join(ADMIN_FOLDER, page), error => {
      if (error) next(error);
    });
  });
}

app.use(
  "/admin",
  express.static(ADMIN_FOLDER, { index: false })
);

/* =========================================================
   ERROR HANDLING
========================================================= */

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return fail(res, 404, "API route not found.");
  }

  return res.status(404).send("Page not found.");
});

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (res.headersSent) return next(error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return fail(res, 400, "Image size must be 5 MB or less.");
    }

    return fail(res, 400, error.message);
  }

  if (
    error.message === "Only JPG, PNG and WEBP images are allowed."
  ) {
    return fail(res, 400, error.message);
  }

  return fail(res, 500, "Internal server error.");
});

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    await mongoClient.connect();

    db = mongoClient.db(DB_NAME);

    customers = db.collection("customers");
    products = db.collection("products");
    orders = db.collection("orders");

    await customers.createIndex(
      { email: 1 },
      { unique: true }
    );

    await seedProducts();
    await initializeAdmin();

    app.listen(PORT, () => {
      console.log("======================================");
      console.log(`MongoDB connected: ${DB_NAME}`);
      console.log(`Backend: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log(`Products: http://localhost:${PORT}/api/products`);
      console.log(`Admin login: http://localhost:${PORT}/admin/`);
      console.log("Product image uploads are enabled.");
      console.log("RK Choco APIs are ready.");
      console.log("======================================");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

async function shutdown() {
  try {
    await mongoClient.close();
  } catch (error) {
    console.error("MongoDB shutdown error:", error.message);
  }

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();