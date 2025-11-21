import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function testEndpoints() {
    console.log('\n🧪 Testing Test API Endpoints\n');
    console.log('='.repeat(50));

    // Test 1: Get info
    console.log('\n1. Testing /api/test/info');
    try {
        const infoRes = await fetch(`${BASE_URL}/api/test/info`);
        const info = await infoRes.json();
        console.log('✅ Info endpoint works');
        console.log('   Available endpoints:', Object.keys(info.endpoints || {}).length);
    } catch (error) {
        console.log('❌ Info endpoint failed:', error.message);
    }

    // Test 2: Stable endpoint (should always succeed)
    console.log('\n2. Testing /api/test/stable');
    try {
        const stableRes = await fetch(`${BASE_URL}/api/test/stable`);
        const stable = await stableRes.json();
        if (stable.success) {
            console.log('✅ Stable endpoint works - returned success');
        } else {
            console.log('❌ Stable endpoint failed - should always succeed');
        }
    } catch (error) {
        console.log('❌ Stable endpoint error:', error.message);
    }

    // Test 3: Failing endpoint (should always fail)
    console.log('\n3. Testing /api/test/failing');
    try {
        const failingRes = await fetch(`${BASE_URL}/api/test/failing`);
        const failing = await failingRes.json();
        if (!failing.success) {
            console.log(`✅ Failing endpoint works - returned ${failingRes.status} error`);
        } else {
            console.log('❌ Failing endpoint failed - should always fail');
        }
    } catch (error) {
        console.log('❌ Failing endpoint error:', error.message);
    }

    // Test 4: Unstable endpoint with 30% success rate
    console.log('\n4. Testing /api/test/unstable?successRate=30 (10 requests)');
    let successes = 0;
    let failures = 0;
    
    for (let i = 0; i < 10; i++) {
        try {
            const res = await fetch(`${BASE_URL}/api/test/unstable?successRate=30`);
            const data = await res.json();
            if (data.success) {
                successes++;
            } else {
                failures++;
            }
        } catch (error) {
            failures++;
        }
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`   Results: ${successes} successes, ${failures} failures`);
    console.log(`   Success rate: ${(successes / 10 * 100).toFixed(1)}% (expected ~30%)`);

    // Test 5: Unstable endpoint with 70% success rate
    console.log('\n5. Testing /api/test/unstable?successRate=70 (10 requests)');
    successes = 0;
    failures = 0;
    
    for (let i = 0; i < 10; i++) {
        try {
            const res = await fetch(`${BASE_URL}/api/test/unstable?successRate=70`);
            const data = await res.json();
            if (data.success) {
                successes++;
            } else {
                failures++;
            }
        } catch (error) {
            failures++;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`   Results: ${successes} successes, ${failures} failures`);
    console.log(`   Success rate: ${(successes / 10 * 100).toFixed(1)}% (expected ~70%)`);

    // Test 6: Configurable endpoint
    console.log('\n6. Testing /api/test/configurable (POST)');
    try {
        const configRes = await fetch(`${BASE_URL}/api/test/configurable`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                successRate: 50,
                delay: 200,
                errorType: '500',
            }),
        });
        const config = await configRes.json();
        console.log(`✅ Configurable endpoint works - returned ${config.success ? 'success' : 'error'}`);
    } catch (error) {
        console.log('❌ Configurable endpoint error:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Test complete!\n');
    console.log('💡 Use these endpoints for monitoring testing:');
    console.log(`   - ${BASE_URL}/api/test/unstable?successRate=30 (30% success rate)`);
    console.log(`   - ${BASE_URL}/api/test/unstable?successRate=20 (20% success rate)`);
    console.log(`   - ${BASE_URL}/api/test/unstable?successRate=10 (10% success rate)`);
    console.log('\n');
}

testEndpoints().catch(console.error);

