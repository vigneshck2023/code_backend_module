require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();

const { initializeDatabase } = require("../db/db.connect");
const Book = require("../models/book.models");

app.use(express.json());
app.use(cors({ origin: "*", credentials: true, optionsSuccessStatus: 200 }));

initializeDatabase();

// ---------------- CREATE BOOK ----------------
async function createBook(newBook) {
    try {
        const book = new Book(newBook);
        return await book.save();
    } catch (error) {
        throw error;
    }
}

app.get("/", (req, res) => {
    res.send("Hello from Express Server");
});

app.post("/books", async (req, res) => {
    try {
        const savedBook = await createBook(req.body);
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
        if (books.length) {
            res.json(books);
        } else {
            res.status(404).json({ error: "No books found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// ---------------- READ BY GENRE ----------------
app.get("/books/genre/:bookGenre", async (req, res) => {
    try {
        const books = await Book.find({ genre: req.params.bookGenre });
        if (books.length) {
            res.json(books);
        } else {
            res.status(404).json({ error: "No books found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// ---------------- READ BY YEAR ----------------
app.get("/books/year/:bookYear", async (req, res) => {
    try {
        const books = await Book.find({ publishedYear: req.params.bookYear });
        if (books.length) {
            res.json(books);
        } else {
            res.status(404).json({ error: "No books found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// ---------------- UPDATE BY ID ----------------
app.put("/books/id/:bookId", async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.bookId, req.body, { new: true, runValidators: true });
        if (updatedBook) {
            res.status(200).json({ message: "Book updated successfully", book: updatedBook });
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update book." });
    }
});

// ---------------- UPDATE BY TITLE ----------------
app.post("/books/title/:bookTitle", async (req, res) => {
    try {
        const updatedBook = await Book.findOneAndUpdate({ title: req.params.bookTitle }, req.body, { new: true, runValidators: true });
        if (updatedBook) {
            res.status(200).json({ message: "Book updated successfully", book: updatedBook });
        } else {
            res.status(404).json({ error: "Book does not exist" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update book" });
    }
});

// ---------------- DELETE BOOK ----------------
app.delete("/books/:bookId", async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.bookId);
        if (deletedBook) {
            res.status(200).json({ message: "Book deleted successfully", book: deletedBook });
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete book." });
    }
});

// Export handler for Vercel
module.exports = serverless(app);
