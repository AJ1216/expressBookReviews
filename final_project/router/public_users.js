const express = require('express');
const public_users = express.Router();
const books = require('./booksdb.js');

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.json(Object.values(books));
});

// Get the book list available in the shop
public_users.get('/books', (req, res) => {
  try {
    return res.json(Object.values(books));
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Get book details based on ID
public_users.get('/id/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  const book = books[id];
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.json(book);
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author);
  if (booksByAuthor.length === 0) {
    return res.status(404).json({ error: 'No books found by this author' });
  }
  return res.json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title);
  if (booksByTitle.length === 0) {
    return res.status(404).json({ error: 'No books found with this title' });
  }
  return res.json(booksByTitle);
});

// Get book reviews
public_users.get('/review/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  const book = books[id];
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  const reviews = book.reviews || [];
  if (reviews.length === 0) {
    return res.status(404).json({ error: 'No reviews found for this book' });
  }
  return res.json(reviews.slice(0, 10)); // Limit to 10 reviews
});

module.exports = { general: public_users };