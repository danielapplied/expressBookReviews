const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
let registeredUsers  = [];
const public_users = express.Router();

// Get the book list available in the shop
// Task 1
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
// Task 2
public_users.get('/isbn/:isbn',function (req, res) {
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
  
// Get book details based on author
// Task 3
public_users.get('/author/:author',function (req, res) {
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

// Get all books based on title
// Task 4
public_users.get('/title/:title',function (req, res) {
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

//  Get book review
// Task 5
public_users.get('/review/:isbn',function (req, res) {
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

// Task 6
// Complete the code for registering a new user
public_users.post("/register", (req,res) => {

    const username = req.body.username;
    const password = req.body.password;

    // Check if user already exists

    const existingUser = registeredUsers.find(user => 
        user.username === username || user.email === email
    );
    
    if (existingUser) {
        return res.status(400).json({ 
            success: false, 
            message: "User already exists" 
        });
    }
    
    // Create new user object
    const newUser = {
        username: username,
        password: password,
    };
    
    // Add user to array
    registeredUsers.push(newUser);
    
    res.json({ 
        success: true, 
        message: "User registered successfully",
    });

});

module.exports = { public_users , registeredUsers };
