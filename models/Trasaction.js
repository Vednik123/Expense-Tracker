const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
