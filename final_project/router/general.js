const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Task 2: Get the books based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    let book = null;
    
    for (let key in books) {
        if (books[key].isbn === isbn) {
            book = books[key];
            break;
        }
    }
    
    if (book) {
        res.send(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// Task 3: Get all books by Author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    let booksByAuthor = [];
    
    for (let key in books) {
        if (books[key].author.toLowerCase().includes(author)) {
            booksByAuthor.push(books[key]);
        }
    }
    
    if (booksByAuthor.length > 0) {
        res.send(booksByAuthor);
    } else {
        res.status(404).json({ message: "No books found by this author" });
    }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    let booksByTitle = [];
    
    for (let key in books) {
        if (books[key].title.toLowerCase().includes(title)) {
            booksByTitle.push(books[key]);
        }
    }
    
    if (booksByTitle.length > 0) {
        res.send(booksByTitle);
    } else {
        res.status(404).json({ message: "No books found with this title" });
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    let book = null;
    
    for (let key in books) {
        if (books[key].isbn === isbn) {
            book = books[key];
            break;
        }
    }
    
    if (book) {
        res.send(book.reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// Task 6: Register New user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password && req.session && !req.session.hasOwnProperty('username') && !req.session.hasOwnProperty('password') ) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            req.session['username'] = username;
            req.session['password'] = password;
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Task 10: Get all books using async callback function
public_users.get('/async/books', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(books);
                }, 100);
            });
        };
        
        const allBooks = await getBooks();
        res.send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});

// Task 11: Search by ISBN using Promises
public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    const findBookByISBN = (isbn) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let book = null;
                for (let key in books) {
                    if (books[key].isbn === isbn) {
                        book = books[key];
                        break;
                    }
                }
                if (book) {
                    resolve(book);
                } else {
                    reject(new Error("Book not found"));
                }
            }, 100);
        });
    };
    
    findBookByISBN(isbn)
        .then(book => res.send(book))
        .catch(error => res.status(404).json({ message: error.message }));
});

// Task 12: Search by Author using Promises
public_users.get('/async/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    
    const findBooksByAuthor = (author) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let booksByAuthor = [];
                for (let key in books) {
                    if (books[key].author.toLowerCase().includes(author)) {
                        booksByAuthor.push(books[key]);
                    }
                }
                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject(new Error("No books found by this author"));
                }
            }, 100);
        });
    };
    
    findBooksByAuthor(author)
        .then(books => res.send(books))
        .catch(error => res.status(404).json({ message: error.message }));
});

// Task 13: Search by Title using Promises
public_users.get('/async/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    
    const findBooksByTitle = (title) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let booksByTitle = [];
                for (let key in books) {
                    if (books[key].title.toLowerCase().includes(title)) {
                        booksByTitle.push(books[key]);
                    }
                }
                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject(new Error("No books found with this title"));
                }
            }, 100);
        });
    };
    
    findBooksByTitle(title)
        .then(books => res.send(books))
        .catch(error => res.status(404).json({ message: error.message }));
});

// Helper function to authenticate user
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

module.exports.general = public_users;
