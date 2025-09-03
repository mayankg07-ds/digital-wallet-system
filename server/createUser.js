// require('dotenv').config();
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const User = require('./models/User'); // adjust path if needed

// async function createUser() {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("✅ Connected to MongoDB");

//     const hashedPassword = await bcrypt.hash("test123", 10);

//     const newUser = new User({
//       username: "testuser",
//       email: "testuser@example.com",
//       password: hashedPassword,
//       isActive: true
//     });

//     await newUser.save();
//     console.log("🎉 Test user created successfully:", newUser);

//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Error creating test user:", err);
//     process.exit(1);
//   }
// }

// createUser();
