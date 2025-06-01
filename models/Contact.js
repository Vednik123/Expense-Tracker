// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    issue: { type: String },
    message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
