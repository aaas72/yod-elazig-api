// Usage: node scripts/testRefreshToken.js <refreshToken>
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
const refreshToken = process.argv[2];

if (!refreshToken) {
  console.error('Usage: node scripts/testRefreshToken.js <refreshToken>');
  process.exit(1);
}

async function testRefresh() {
  try {
    const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
    console.log('Refresh response:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

testRefresh();
