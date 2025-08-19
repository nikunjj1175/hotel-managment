const testSuperAdminRegistration = async () => {
  const baseUrl = 'http://localhost:3000'; // Change this to your server URL
  
  console.log('🧪 Testing SUPER_ADMIN Registration...\n');

  // Test data
  const testData = {
    name: 'nikunj',
    email: 'abc@gmail.com',
    password: '12345678',
    role: 'SUPER_ADMIN'
  };

  try {
    // Step 1: Check if SUPER_ADMIN exists
    console.log('1️⃣ Checking if SUPER_ADMIN exists...');
    const checkResponse = await fetch(`${baseUrl}/api/auth/check-super-admin`);
    const checkData = await checkResponse.json();
    console.log('Result:', checkData);

    if (checkData.exists) {
      console.log('❌ SUPER_ADMIN already exists. Cannot register another one.');
      return;
    }

    // Step 2: Register new SUPER_ADMIN
    console.log('\n2️⃣ Registering new SUPER_ADMIN...');
    const registerResponse = await fetch(`${baseUrl}/api/auth/register-super-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const registerData = await registerResponse.json();
    console.log('Registration Result:', registerData);

    if (registerResponse.ok) {
      console.log('✅ SUPER_ADMIN registered successfully!');
      console.log('User ID:', registerData.user.id);
      console.log('Email:', registerData.user.email);
      console.log('Role:', registerData.user.role);
    } else {
      console.log('❌ Registration failed:', registerData.message);
    }

    // Step 3: Verify registration by checking again
    console.log('\n3️⃣ Verifying registration...');
    const verifyResponse = await fetch(`${baseUrl}/api/auth/check-super-admin`);
    const verifyData = await verifyResponse.json();
    console.log('Verification Result:', verifyData);

    if (verifyData.exists) {
      console.log('✅ Verification successful! SUPER_ADMIN now exists.');
    } else {
      console.log('❌ Verification failed! SUPER_ADMIN not found.');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
};

// Test with invalid data
const testInvalidRegistration = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('\n🧪 Testing Invalid Registration...\n');

  const invalidTestCases = [
    {
      name: 'Missing Fields Test',
      data: { name: 'Test', email: 'test@test.com' }, // Missing password and secretKey
      expectedError: 'Missing required fields'
    },
    {
      name: 'Invalid Email Test',
      data: { name: 'Test', email: 'invalid-email', password: 'password123' },
      expectedError: 'Invalid email format'
    },
    {
      name: 'Weak Password Test',
      data: { name: 'Test', email: 'test@test.com', password: '123' },
      expectedError: 'Password must be at least 8 characters long'
    }
  ];

  for (const testCase of invalidTestCases) {
    console.log(`Testing: ${testCase.name}`);
    try {
      const response = await fetch(`${baseUrl}/api/auth/register-super-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const data = await response.json();
      console.log('Response:', data.message);
      
      if (!response.ok && data.message.includes(testCase.expectedError)) {
        console.log('✅ Expected error received');
      } else {
        console.log('❌ Unexpected response');
      }
    } catch (error) {
      console.log('❌ Network error:', error.message);
    }
    console.log('---');
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting SUPER_ADMIN Registration Tests\n');
  
  await testSuperAdminRegistration();
  await testInvalidRegistration();
  
  console.log('\n🏁 Tests completed!');
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testSuperAdminRegistration, testInvalidRegistration, runTests };
}

// Run if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
}
