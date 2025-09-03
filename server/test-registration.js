const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test data
const testUser = {
  username: 'testuser123',
  email: 'testuser123@example.com',
  password: 'password123'
};

const duplicateUser = {
  username: 'testuser123',
  email: 'testuser123@example.com', 
  password: 'password456'
};

// Test functions
async function testServerConnection() {
  try {
    console.log('🔍 Testing server connection...');
    const response = await axios.get(BASE_URL);
    console.log('✅ Server is running:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  try {
    console.log('\n🔍 Testing user registration...');
    console.log('📤 Sending registration request with data:', {
      username: testUser.username,
      email: testUser.email,
      password: '[HIDDEN]'
    });

    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('📋 Response:', {
      message: response.data.message,
      user: response.data.user,
      tokenReceived: !!response.data.token
    });
    
    return {
      success: true,
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

async function testDuplicateRegistration() {
  try {
    console.log('\n🔍 Testing duplicate user registration (should fail)...');
    const response = await axios.post(`${API_URL}/auth/register`, duplicateUser);
    
    console.log('❌ Unexpected success - duplicate registration should have failed');
    return { success: false, error: 'Duplicate registration unexpectedly succeeded' };
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Duplicate registration correctly rejected:', error.response.data.message);
      return { success: true };
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

async function testInvalidRegistration() {
  try {
    console.log('\n🔍 Testing invalid registration data...');
    
    // Test missing fields
    const invalidData = { username: 'test' }; // Missing email and password
    
    const response = await axios.post(`${API_URL}/auth/register`, invalidData);
    console.log('❌ Unexpected success - invalid data should have failed');
    return { success: false };
  } catch (error) {
    console.log('✅ Invalid registration correctly rejected:', error.response?.data?.message || error.message);
    return { success: true };
  }
}

async function testLoginWithNewUser(token, user) {
  try {
    console.log('\n🔍 Testing login with newly registered user...');
    
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    console.log('✅ Login successful!');
    console.log('📋 Login response:', {
      message: response.data.message,
      user: response.data.user,
      tokenReceived: !!response.data.token
    });
    
    return { success: true, token: response.data.token };
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// Main test runner
async function runRegistrationTests() {
  console.log('🚀 Starting Digital Wallet Registration Tests\n');
  
  const results = {
    serverConnection: false,
    userRegistration: false,
    duplicateRegistration: false,
    invalidRegistration: false,
    loginTest: false
  };
  
  // Test 1: Server connection
  results.serverConnection = await testServerConnection();
  if (!results.serverConnection) {
    console.log('\n❌ Cannot proceed with tests - server is not running');
    console.log('💡 Please start the server with: npm run dev or npm start');
    return results;
  }
  
  // Test 2: User registration
  const registrationResult = await testUserRegistration();
  results.userRegistration = registrationResult.success;
  
  if (registrationResult.success) {
    // Test 3: Duplicate registration
    results.duplicateRegistration = (await testDuplicateRegistration()).success;
    
    // Test 4: Invalid registration
    results.invalidRegistration = (await testInvalidRegistration()).success;
    
    // Test 5: Login with new user
    const loginResult = await testLoginWithNewUser(registrationResult.token, registrationResult.user);
    results.loginTest = loginResult.success;
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`Server Connection: ${results.serverConnection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Registration: ${results.userRegistration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Duplicate Prevention: ${results.duplicateRegistration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invalid Data Handling: ${results.invalidRegistration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login Functionality: ${results.loginTest ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Registration functionality is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
  
  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runRegistrationTests().catch(console.error);
}

module.exports = { runRegistrationTests };
