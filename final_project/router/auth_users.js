const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if the username is valid (e.g., not empty, not already taken)
  return username !== '' && !users.find(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check if the username and password match the ones in records
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};

// User registration endpoint
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ username }, 'your_secret_key_here', { expiresIn: '1h' });
  req.session.token = token;
  return res.json({ token });
});
// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ username }, 'your_secret_key_here', { expiresIn: '1h' });
  req.session.token = token;
  return res.json({ token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.token.username;
  const book = books.find(book => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  const existingReview = book.reviews.find(review => review.username === username);
  if (existingReview) {
    existingReview.review = review;
  } else {
    if (!book.reviews) {
      book.reviews = [];
    }
    book.reviews.push({ username, review });
  }
  return res.json({ message: 'Review added or modified successfully' });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.token.username;
  const book = books.find(book => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  if (book.reviews) {
    book.reviews = book.reviews.filter(review => review.username !== username);
  }
  return res.json({ message: 'Review deleted successfully' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;