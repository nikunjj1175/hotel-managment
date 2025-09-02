const axios = require('axios');

// Test authentication flow
async function testAuth() {
  try {
    console.log('Testing authentication flow...');
    
    // Test login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'superadmin@example.com',
      password: 'password123'
    });
    
    console.log('Login successful:', {
      status: loginResponse.status,
      hasToken: !!loginResponse.data.token,
      hasUser: !!loginResponse.data.user,
      userRole: loginResponse.data.user?.role
    });
    
    const token = loginResponse.data.token;
    
    // Test cafe creation with token
    console.log('\n2. Testing cafe creation with token...');
    const cafeResponse = await axios.post('http://localhost:3000/api/cafes', {
      name: 'Test Cafe',
      address: 'Test Address',
      contactNumber: '1234567890',
      contactEmail: 'test@cafe.com',
      subscriptionPlan: {
        name: 'Starter',
        type: 'MONTHLY',
        price: 99,
        features: ['Up to 10 tables', 'Basic support'],
        maxTables: 10,
        maxStaff: 5
      },
      config: {
        kitchenEnabled: true,
        waiterEnabled: true,
        managerEnabled: true
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Cafe creation successful:', {
      status: cafeResponse.status,
      cafeId: cafeResponse.data._id
    });
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
  }
}

// Run the test
testAuth();

