const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
const books = require('./booksdb.js');
let users = [];

const secretKey = process.env.JWT_SECRET_KEY || 'my_test_secret_key_1234567890';

// Validate username
const isValidUsername = (username) => {
  return username && username !== '' && !users.find(user => user.username === username);
};

// Authenticate user
const authenticateUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};

// User registration endpoint
regd_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (!isValidUsername(username)) {
    return res.status(400).json({ error: 'Username is already taken. Please choose a different username.' });
  }
  users.push({ username, password });
  return res.status(201).json({ message: 'User registered successfully' });
});

// User login endpoint
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (!authenticateUser(username, password)) {
    return res.status(401).json({ error: 'Invalid username or password. Please try again.' });
  }
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token has expired. Please log in again.' });
        }
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add or modify a book review
regd_users.put("/auth/review/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const review = req.query.review; // Get the review from the query parameter
  const username = req.user.username;
  const book = books[id];

  if (!book) {
    return res.status(404).json({ error: 'Book not found. Please try again.' });
  }

  if (!review || review === '') {
    return res.status(400).json({ error: 'Review is required' });
  }

  // Check if the user already has a review for this book
  const existingReview = book.reviews.find(r => r.username === username);
  if (existingReview) {
    // Update the existing review
    existingReview.review = review;
  } else {
    // Add a new review
    book.reviews.push({ username, review });
  }

  return res.json({ message: 'Review added or modified successfully' });
});

// Delete a book review
regd_users.delete("/auth/review/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const username = req.user.username;
  const book = books[id];

  if (!book) {
    return res.status(404).json({ error: 'Book not found. Please try again.' });
  }

  if (!book.reviews || book.reviews.length === 0) {
    return res.status(404).json({ error: 'No reviews found for this book' });
  }

  const initialReviewCount = book.reviews.length;
  book.reviews = book.reviews.filter(review => review.username !== username);

  if (book.reviews.length === initialReviewCount) {
    return res.status(404).json({ error: 'Review not found' });
  }

  return res.json({ message: 'Review deleted successfully' });
});

// Use the regd_users router
app.use('/customer', regd_users);

// Start the server
// Start the server
const port = 5001; // Cambia el puerto si el 5000 ya está en uso
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
}).on('error', (err) => {
  console.error('Error starting server:', err);
});

module.exports = { authenticated: regd_users, isValidUsername, users, app };