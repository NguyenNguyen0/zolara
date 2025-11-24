// Test Redis connection
const { createClient } = require('redis');
require('dotenv').config();

async function testRedis() {
  const redisConfig = {
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  };

  if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
    console.log('✅ Using password authentication');
  } else {
    console.log('⚠️  No password configured');
  }

  console.log(`🔌 Connecting to Redis at ${redisConfig.socket.host}:${redisConfig.socket.port}...`);

  const client = createClient(redisConfig);

  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
    process.exit(1);
  });

  client.on('connect', () => {
    console.log('✅ Redis Client Connected!');
  });

  try {
    await client.connect();
    
    // Test set/get
    await client.set('test_key', 'Hello from Zolara!');
    const value = await client.get('test_key');
    console.log('✅ Test write/read successful:', value);
    
    await client.del('test_key');
    console.log('✅ Test cleanup successful');
    
    await client.disconnect();
    console.log('✅ All tests passed! Redis is working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testRedis();
