const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
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

// Task 7: Login as a Registered user
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if session is available
    if (!req.session) {
        return res.status(500).json({ message: "Session not configured" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, 
            username
        };
        
        return res.status(200).json({ message: "User successfully logged in" , "token": accessToken });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Task 8: Add/Modify a book review
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
