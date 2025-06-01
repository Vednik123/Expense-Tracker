const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");

const app = express();
const port = 3000;

// Database setup
mongoose.connect("mongodb://localhost:27017/khatabook", { useNewUrlParser: true, useUnifiedTopology: true });

// User and Transaction schemas
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
const TransactionSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    amount: Number,
    type: { type: String, enum: ["credit", "debit"] },
    date: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model("User", UserSchema);
const Transaction = mongoose.model("Transaction", TransactionSchema);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/home", (req, res) => req.session.user ? res.sendFile(path.join(__dirname, "public", "home.html")) : res.redirect("/"));
app.get("/about", (req, res) => req.session.user ? res.sendFile(path.join(__dirname, "public", "aboutus.html")) : res.redirect("/"));
app.get("/contact", (req, res) => req.session.user ? res.sendFile(path.join(__dirname, "public", "contactus.html")) : res.redirect("/"));
app.get("/dashboard", (req, res) => req.session.user ? res.sendFile(path.join(__dirname, "public", "dashboard.html")) : res.redirect("/"));

// User Authentication
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
        await User.create({ username, password: hash });
        res.redirect("/");
    } catch {
        res.send("User already exists");
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.send("Invalid credentials");
    req.session.user = { _id: user._id, username: user.username };
    res.redirect("/home");
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));   
});

// API to check if user is logged in
app.get("/user", (req, res) => {
    if (!req.session.user) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, username: req.session.user.username });
});

// **API for Transactions**
app.post("/transaction", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

    const { name, amount, type } = req.body;
    if (!name || !amount || !type) return res.status(400).json({ error: "All fields are required" });

    try {
        const transaction = new Transaction({
            owner: req.session.user._id,
            name,
            amount,
            type
        });
        await transaction.save();
        res.json({ success: true, message: "Transaction added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/transactions", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

    try {
        const transactions = await Transaction.find({ owner: req.session.user._id }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Error fetching transactions" });
    }
});

// Contact Us Form
const Contact = require("../models/Contact"); // Adjust the path if needed

app.post("/contactUs", async (req, res) => {
    const { name, email, issue, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, Email, and Message are required fields." });
    }

    try {
        const contact = new Contact({ name, email, issue, message });
        await contact.save();
        res.redirect("/contact");
    } catch (error) {
        console.error("Error saving contact message:", error);
        res.redirect("/contact");
    }
});



// delete transaction
app.delete("/transaction/:id", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

    try {
        const { id } = req.params;
        const transaction = await Transaction.findOneAndDelete({ _id: id, owner: req.session.user._id });

        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.json({ success: true, message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});



app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
