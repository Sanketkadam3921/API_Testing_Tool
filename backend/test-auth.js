#!/usr/bin/env node

/**
 * Test script for authentication endpoints
 * Run: node test-auth.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testAuth() {
    console.log('🧪 Testing Authentication Endpoints...\n');

    try {
        // Test 1: Register a new user
        console.log('1️⃣ Testing Signup...');
        const testEmail = `test${Date.now()}@example.com`;
        const signupResponse = await axios.post(`${API_URL}/api/auth/register`, {
            name: 'Test User',
            email: testEmail,
            password: 'test123456'
        });

        if (signupResponse.data.success && signupResponse.data.token) {
            console.log('✅ Signup successful!');
            console.log('   User:', signupResponse.data.user);
            console.log('   Token received:', signupResponse.data.token ? 'Yes' : 'No');
            
            const token = signupResponse.data.token;
            const userId = signupResponse.data.user.id;

            // Test 2: Login with the same credentials
            console.log('\n2️⃣ Testing Login...');
            const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
                email: testEmail,
                password: 'test123456'
            });

            if (loginResponse.data.success && loginResponse.data.token) {
                console.log('✅ Login successful!');
                console.log('   User:', loginResponse.data.user);
                console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');
            } else {
                console.log('❌ Login failed:', loginResponse.data);
                return;
            }

            // Test 3: Get profile with token
            console.log('\n3️⃣ Testing Profile with JWT Token...');
            const profileResponse = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (profileResponse.data.success) {
                console.log('✅ Profile fetch successful!');
                console.log('   Profile:', profileResponse.data.user);
            } else {
                console.log('❌ Profile fetch failed:', profileResponse.data);
            }

            // Test 4: Test invalid credentials
            console.log('\n4️⃣ Testing Invalid Login...');
            try {
                await axios.post(`${API_URL}/api/auth/login`, {
                    email: testEmail,
                    password: 'wrongpassword'
                });
                console.log('❌ Invalid login should have failed!');
            } catch (error) {
                if (error.response?.status === 401) {
                    console.log('✅ Invalid login correctly rejected (401)');
                } else {
                    console.log('⚠️  Unexpected error:', error.response?.status);
                }
            }

            // Test 5: Test duplicate email registration
            console.log('\n5️⃣ Testing Duplicate Email Registration...');
            try {
                await axios.post(`${API_URL}/api/auth/register`, {
                    name: 'Another User',
                    email: testEmail,
                    password: 'test123456'
                });
                console.log('❌ Duplicate registration should have failed!');
            } catch (error) {
                if (error.response?.status === 400) {
                    console.log('✅ Duplicate email correctly rejected (400)');
                } else {
                    console.log('⚠️  Unexpected error:', error.response?.status);
                }
            }

            console.log('\n🎉 All authentication tests completed!');
        } else {
            console.log('❌ Signup failed:', signupResponse.data);
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Cannot connect to server. Make sure the backend is running on', API_URL);
        } else {
            console.error('❌ Test failed:', error.response?.data || error.message);
        }
        process.exit(1);
    }
}

testAuth();

