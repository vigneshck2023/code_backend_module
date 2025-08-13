require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

const { initializeDatabase } = require("../db/db.connect");
const Book = require("../models/book.models");

const app = express();

app.use(express.json());
app.use(cors({ origin: "*", credentials: true, optionsSuccessStatus: 200 }));

// Middleware to ensure DB is connected before handling the request
app.use(async (req, res, next) => {
    try {
        await initializeDatabase();
        next();
    } catch (error) {
        res.status(500).json({ error: "Database connection failed", details: error.message });
    }
});

// ---------------- CREATE BOOK ----------------
app.post("/books", async (req, res) => {
    try {
        const book = new Book(req.body);
        const savedBook = await book.save();
        res.status(201).json({ message: "Book added successfully", book: savedBook });
    } catch (error) {
        res.status(500).json({ message: "Error adding book", error: error.message });
    }
});

// ---------------- READ ALL BOOKS ----------------
app.get("/booksData", async (req, res) => {
    try {
        const allBooks = await Book.find();
        if (allBooks.length) {
            res.json(allBooks);
        } else {
            res.status(404).json({ error: "No books found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// ---------------- READ BY TITLE ----------------
app.get("/books/title/:bookTitle", async (req, res) => {
    try {
        const books = await Book.find({ title: req.params.bookTitle });
        books.length ? res.json(books) : res.status(404).json({ error: "No books found" });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// ---------------- READ BY GENRE ----------------
app.get("/books/genre/:bookGenre", async (req, res) => {
    try {
        const books = await Book.find({ genre: req.params.bookGenre });
        books.length ? res.json(books) : res.status(404).json({ error: "No books found" });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// ---------------- READ BY YEAR ----------------
app.get("/books/year/:bookYear", async (req, res) => {
    try {
        const books = await Book.find({ publishedYear: req.params.bookYear });
        books.length ? res.json(books) : res.status(404).json({ error: "No books found" });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// ---------------- UPDATE BY ID ----------------
app.put("/books/id/:bookId", async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.bookId, req.body, {
            new: true,
            runValidators: true
        });
        updatedBook
            ? res.status(200).json({ message: "Book updated successfully", book: updatedBook })
            : res.status(404).json({ error: "Book not found" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update book." });
    }
});

// ---------------- UPDATE BY TITLE ----------------
app.post("/books/title/:bookTitle", async (req, res) => {
    try {
        const updatedBook = await Book.findOneAndUpdate(
            { title: req.params.bookTitle },
            req.body,
            { new: true, runValidators: true }
        );
        updatedBook
            ? res.status(200).json({ message: "Book updated successfully", book: updatedBook })
            : res.status(404).json({ error: "Book does not exist" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update book" });
    }
});

// ---------------- DELETE BOOK ----------------
app.delete("/books/:bookId", async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.bookId);
        deletedBook
            ? res.status(200).json({ message: "Book deleted successfully", book: deletedBook })
            : res.status(404).json({ error: "Book not found" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete book." });
    }
});

app.get("/", (req, res) => {
    res.send("Hello from Express Server");
});

module.exports = serverless(app);
