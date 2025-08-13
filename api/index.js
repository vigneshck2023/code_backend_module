require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const express = require("express");
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
        const savedBook = await book.save();
        return savedBook;
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
async function readAllBooks() {
    try {
        return await Book.find();
    } catch (error) {
        throw error;
    }
}

app.get("/booksData", async (req, res) => {
    try {
        const allBooks = await readAllBooks();
        if (allBooks.length !== 0) {
            res.json(allBooks);
        } else {
            res.status(404).json({ error: "No books found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// ---------------- READ BY TITLE ----------------
async function readBooksByTitle(bookTitle) {
    try {
        return await Book.find({ title: bookTitle });
    } catch (error) {
        throw error;
    }
}

app.get("/books/title/:bookTitle", async (req, res) => {
    try {
        const books = await readBooksByTitle(req.params.bookTitle);
        if (books.length !== 0) {
            res.json(books);
        } else {
            res.status(404).json({ error: "No books found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// ---------------- READ BY GENRE ----------------
async function readBooksByGenre(bookGenre) {
    try {
        return await Book.find({ genre: bookGenre });
    } catch (error) {
        throw error;
    }
}

app.get("/books/genre/:bookGenre", async (req, res) => {
    try {
        const genre = await readBooksByGenre(req.params.bookGenre);
        if (genre.length !== 0) {
            res.json(genre);
        } else {
            res.status(404).json({ error: "No books found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// ---------------- READ BY YEAR ----------------
async function readBooksByReleaseYear(bookYear) {
    try {
        return await Book.find({ publishedYear: bookYear });
    } catch (error) {
        throw error;
    }
}

app.get("/books/year/:bookYear", async (req, res) => {
    try {
        const year = await readBooksByReleaseYear(req.params.bookYear);
        if (year.length !== 0) {
            res.json(year);
        } else {
            res.status(404).json({ error: "No books found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// ---------------- UPDATE BOOK BY ID ----------------
async function updateBook(bookId, dataToUpdate) {
    try {
        return await Book.findByIdAndUpdate(bookId, dataToUpdate, { new: true, runValidators: true });
    } catch (error) {
        throw error;
    }
}

app.put("/books/id/:bookId", async (req, res) => {
    try {
        const updatedBook = await updateBook(req.params.bookId, req.body);
        if (updatedBook) {
            res.status(200).json({ message: "Book updated successfully", book: updatedBook });
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update book." });
    }
});

// ---------------- UPDATE BOOK BY TITLE ----------------
async function updateOne(bookTitle, dataToUpdate) {
    try {
        return await Book.findOneAndUpdate(
            { title: bookTitle },
            dataToUpdate,
            { new: true, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
}

app.post("/books/title/:bookTitle", async (req, res) => {
    try {
        const updatedBook = await updateOne(req.params.bookTitle, req.body);
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
async function deleteBook(bookId) {
    try {
        return await Book.findByIdAndDelete(bookId);
    } catch (error) {
        throw error;
    }
}

app.delete("/books/:bookId", async (req, res) => {
    try {
        const deletedBook = await deleteBook(req.params.bookId);
        if (deletedBook) {
            res.status(200).json({ message: "Book deleted successfully", book: deletedBook });
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete book." });
    }
});

// ---------------- START SERVER ----------------
module.exports = app;
module.exports.handler = serverless(app);