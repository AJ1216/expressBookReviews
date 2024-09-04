const express = require('express');
const public_users = express.Router();
const axios = require('axios');
const books = require('./booksdb.js');

public_users.post('/books', async (req, res) => {
  try {
    const { title, author, year, isbn } = req.body;
    if (!title || !author || !year || !isbn) {
      return res.status(400).json({ error: 'Missing book data' });
    }
    const newBook = { title, author, year, isbn };
    console.log('Adding new book:', newBook);
    books.push(newBook);
    console.log('Books array after adding new book:', books);
    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Error adding book' });
  }
});

public_users.get('/books/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase().trim();
    console.log(`Searching for books by author: ${author}`);
    console.log('Books in database:', books.map((book) => book.author));
    const booksByAuthor = books.filter((book) => book.author.toLowerCase().trim() === author);
    if (!booksByAuthor.length) {
      return res.status(404).json({ error: 'No books found by this author' });
    }
    res.json(booksByAuthor);
  } catch (error) {
    console.error('Error fetching book data:', error);
    res.status(500).json({ error: 'Error fetching book data' });
  }
});

public_users.get('/id/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const book = books.find((book) => book.id === id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    return res.json(book);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching book' });
  }
});

public_users.get('/books/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase().trim();
    console.log(`Searching for book with title: ${title}`);
    console.log('Books in database:', books.map((book) => book.title));
    const booksByTitle = books.filter((book) => book.title.toLowerCase().trim() === title);
    if (!booksByTitle.length) {
      return res.status(404).json({ error: 'No books found with this title' });
    }
    res.json(booksByTitle);
  } catch (error) {
    console.error('Error fetching book data:', error);
    res.status(500).json({ error: 'Error fetching book data' });
  }
});

public_users.get('/review/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const book = books.find((book) => book.id === id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    return res.json(book.reviews);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching book reviews' });
  }
});

public_users.put('/books/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const book = books.find((book) => book.id === id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const { title, author, year } = req.body;
    book.title = title;
    book.author = author;
    book.year = year;
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Error updating book' });
  }
});

public_users.delete('/books/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const index = books.findIndex((book) => book.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Book not found' });
    }
    books.splice(index, 1);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting book' });
  }
});

module.exports = { general: public_users };