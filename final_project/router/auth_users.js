const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const { registeredUsers } = require('./general.js');

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

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

module.exports = function (app, myDataBase) {

// Only registered users can login
// Task 7
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    // Find user in registered users array
    const user = registeredUsers.find(u =>  (u.username === username ) && u.password === password );
    
    if (!user) {
        return res.status(401).json({ 
            success: false, 
            message: "Invalid credentials" 
        });
    }

    // Create new user object
    const activeUser = {
        username: username,
        loggedIn: true,
    };

    users.push(activeUser);
    
    res.json({ 
        success: true, 
        message: "Login successful",
    });
});

// Add a book review
// Task 8
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;
    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }
    let book = null;
    let bookKey = null; 
    for (let key in books) {
        if (books[key].isbn === isbn) {
            book = books[key];
            bookKey = key;
            break;
        }
    } 
    if (book) {
        if (!book.reviews) {
            book.reviews = {};
        }
        book.reviews[username] = review;
        books[bookKey] = book;
        
        return res.status(200).json({ 
            message: "Review added/modified successfully",
            book: book
        });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Task 9: Delete book review added by that particular user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    let book = null;
    let bookKey = null;
    for (let key in books) {
        if (books[key].isbn === isbn) {
            book = books[key];
            bookKey = key;
            break;
        }
    }
    if (book) {
        if (book.reviews && book.reviews[username]) {
            delete book.reviews[username];
            books[bookKey] = book;
            
            return res.status(200).json({ 
                message: "Review deleted successfully",
                book: book
            });
        } else {
            return res.status(404).json({ message: "Review not found for this user" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
