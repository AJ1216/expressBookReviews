const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  const newUser = { username, password };
  users.push(newUser);
  return res.json({ message: 'User registered successfully' });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find(book => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.json(book);
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  const booksByAuthor = books.filter(book => book.author === author);
  if (booksByAuthor.length === 0) {
    return res.status(404).json({ error: 'No books found by this author' });
  }
  return res.json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const booksByTitle = books.filter(book => book.title === title);
  if (booksByTitle.length === 0) {
    return res.status(404).json({ error: 'No books found with this title' });
  }
  return res.json(booksByTitle);
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = books.find(book => book.isbn === isbn).review;
  if (!review) {
    return res.status(404).json({ error: 'No review found for this book' });
  }
  return res.json(review);
});

module.exports.general = public_users;