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
  return res.json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const book = books.find(book => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  book.review = review;
  return res.json({ message: 'Review added successfully' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;