require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated; 
const genl_routes = require('./router/general.js').general;

const app = express();
const secretKey = process.env.JWT_SECRET_KEY || 'my_test_secret_key_1234567890';
const sessionSecret = process.env.SESSION_SECRET || secretKey;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (optional)
app.use(session({
  secret: sessionSecret,
  resave: true,
  saveUninitialized: true
}));

// Define authenticateToken function
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid token.' });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid token.' });
  }
};

// Register route
app.post("/customer/auth/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  // Register logic here
  // For demonstration purposes, we'll just store the user in memory
  const users = req.session.users || [];
  users.push({ username, password });
  req.session.users = users;
  res.json({ message: 'User registered successfully' });
});

// Login route
app.post("/customer/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  // Login logic here
  // For demonstration purposes, we'll just find the user in memory
  const users = req.session.users || [];
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

// Protected routes
app.use("/customer/auth", authenticateToken, customer_routes);

// Public routes
app.use("/", genl_routes);

app.post("/", (req, res) => {
  // Handle POST request to root URL
  res.send("POST request received");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));