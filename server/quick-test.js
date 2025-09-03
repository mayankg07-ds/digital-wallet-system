// // Quick test to verify registration functionality
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // Import models
// const User = require('./models/User.js');
// const Wallet = require('./models/Wallet.js');

// // Test configuration
// const TEST_USER = {
//   username: 'quicktest123',
//   email: 'quicktest123@example.com',
//   password: 'testpass123'
// };

// async function connectToDatabase() {
//   try {
//     // Use a test database
//     const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-wallet-test';
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ Connected to MongoDB');
//     return true;
//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error.message);
//     return false;
//   }
// }

// async function cleanupTestData() {
//   try {
//     await User.deleteOne({ email: TEST_USER.email });
//     await Wallet.deleteOne({ userId: { $exists: true } });
//     console.log('🧹 Cleaned up previous test data');
//   } catch (error) {
//     console.log('⚠️  Cleanup warning:', error.message);
//   }
// }

// async function testUserCreation() {
//   try {
//     console.log('\n🔍 Testing user creation...');
    
//     // Check if user already exists
//     const existingUser = await User.findOne({ 
//       $or: [{ email: TEST_USER.email }, { username: TEST_USER.username }] 
//     });
    
//     if (existingUser) {
//       console.log('⚠️  User already exists, cleaning up...');
//       await cleanupTestData();
//     }

//     // Create new user (password will be hashed by pre-save hook)
//     const user = new User({
//       username: TEST_USER.username,
//       email: TEST_USER.email,
//       password: TEST_USER.password
//     });

//     await user.save();
//     console.log('✅ User created successfully');
//     console.log('📋 User details:', {
//       id: user._id,
//       username: user.username,
//       email: user.email,
//       isActive: user.isActive,
//       isAdmin: user.isAdmin,
//       passwordHashed: user.password !== TEST_USER.password
//     });

//     return user;
//   } catch (error) {
//     console.error('❌ User creation failed:', error.message);
//     return null;
//   }
// }

// async function testWalletCreation(userId) {
//   try {
//     console.log('\n🔍 Testing wallet creation...');
    
//     const wallet = new Wallet({ userId });
//     await wallet.save();
    
//     console.log('✅ Wallet created successfully');
//     console.log('📋 Wallet details:', {
//       id: wallet._id,
//       userId: wallet.userId,
//       balance: wallet.balance,
//       currency: wallet.currency,
//       isLocked: wallet.isLocked
//     });

//     return wallet;
//   } catch (error) {
//     console.error('❌ Wallet creation failed:', error.message);
//     return null;
//   }
// }

// async function testPasswordHashing() {
//   try {
//     console.log('\n🔍 Testing password hashing...');
    
//     const user = await User.findOne({ email: TEST_USER.email });
//     if (!user) {
//       console.error('❌ User not found for password test');
//       return false;
//     }

//     // Test password comparison
//     const isMatch = await bcrypt.compare(TEST_USER.password, user.password);
    
//     if (isMatch) {
//       console.log('✅ Password hashing and comparison working correctly');
//       return true;
//     } else {
//       console.error('❌ Password comparison failed');
//       return false;
//     }
//   } catch (error) {
//     console.error('❌ Password hashing test failed:', error.message);
//     return false;
//   }
// }

// async function testDuplicateUserPrevention() {
//   try {
//     console.log('\n🔍 Testing duplicate user prevention...');
    
//     // Try to create the same user again
//     const duplicateUser = new User({
//       username: TEST_USER.username,
//       email: TEST_USER.email,
//       password: 'differentpassword'
//     });

//     await duplicateUser.save();
//     console.error('❌ Duplicate user was created (this should not happen)');
//     return false;
//   } catch (error) {
//     if (error.code === 11000) {
//       console.log('✅ Duplicate user correctly prevented:', error.message);
//       return true;
//     } else {
//       console.error('❌ Unexpected error:', error.message);
//       return false;
//     }
//   }
// }

// async function runRegistrationTests() {
//   console.log('🚀 Starting Registration Functionality Tests\n');
  
//   const results = {
//     databaseConnection: false,
//     userCreation: false,
//     walletCreation: false,
//     passwordHashing: false,
//     duplicatePrevention: false
//   };

//   // Test 1: Database connection
//   results.databaseConnection = await connectToDatabase();
//   if (!results.databaseConnection) {
//     console.log('\n❌ Cannot proceed - database connection failed');
//     console.log('💡 Make sure MongoDB is running');
//     return results;
//   }

//   // Clean up any existing test data
//   await cleanupTestData();

//   // Test 2: User creation
//   const user = await testUserCreation();
//   results.userCreation = !!user;

//   if (user) {
//     // Test 3: Wallet creation
//     const wallet = await testWalletCreation(user._id);
//     results.walletCreation = !!wallet;

//     // Test 4: Password hashing
//     results.passwordHashing = await testPasswordHashing();

//     // Test 5: Duplicate prevention
//     results.duplicatePrevention = await testDuplicateUserPrevention();
//   }

//   // Summary
//   console.log('\n📊 TEST SUMMARY');
//   console.log('================');
//   console.log(`Database Connection: ${results.databaseConnection ? '✅ PASS' : '❌ FAIL'}`);
//   console.log(`User Creation: ${results.userCreation ? '✅ PASS' : '❌ FAIL'}`);
//   console.log(`Wallet Creation: ${results.walletCreation ? '✅ PASS' : '❌ FAIL'}`);
//   console.log(`Password Hashing: ${results.passwordHashing ? '✅ PASS' : '❌ FAIL'}`);
//   console.log(`Duplicate Prevention: ${results.duplicatePrevention ? '✅ PASS' : '❌ FAIL'}`);

//   const passedTests = Object.values(results).filter(Boolean).length;
//   const totalTests = Object.keys(results).length;

//   console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);

//   if (passedTests === totalTests) {
//     console.log('🎉 All registration functionality tests passed!');
//     console.log('✅ The register new user feature is working correctly.');
//   } else {
//     console.log('⚠️  Some tests failed. Check the issues above.');
//   }

//   // Cleanup
//   await cleanupTestData();
//   await mongoose.disconnect();
//   console.log('\n🧹 Test cleanup completed');

//   return results;
// }

// // Run tests
// runRegistrationTests().catch(console.error);
