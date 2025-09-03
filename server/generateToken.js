require('dotenv').config();
const jwt = require('jsonwebtoken');

const userId = "68b6a24b4b698940d54bdac5"; // use your user's _id
const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

console.log("✅ Test token:", token);
