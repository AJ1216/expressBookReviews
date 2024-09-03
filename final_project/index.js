const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if the Authorization header is present
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  // Verify the token using the secret key
  const secretKey = 'your_secret_key_here'; // Replace with a secure secret key
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Invalid token' });
    }

    // If the token is valid, add the decoded user data to the request object
    req.user = decoded;
    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));