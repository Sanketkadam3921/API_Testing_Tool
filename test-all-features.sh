#!/bin/bash

# Comprehensive Test Script for API Testing Tool
# Tests all backend endpoints and functionality

BASE_URL="${API_URL:-http://localhost:3001}"
USER_ID="default-user-id"

echo "🧪 API Testing Tool - Comprehensive Test Suite"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
    fi
}

echo "Testing Base URL: $BASE_URL"
echo ""

# 1. Health Check
echo "1. Testing Health Endpoint..."
curl -s "$BASE_URL/health" | grep -q "success" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

# 2. API Test Endpoint
echo ""
echo "2. Testing API Test Endpoint..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/test" \
    -H "Content-Type: application/json" \
    -d '{
        "method": "GET",
        "url": "https://httpbin.org/get",
        "headers": {
            "Authorization": "Bearer test-token"
        }
    }')
echo "$RESPONSE" | grep -q "success" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

# 3. History Endpoints
echo ""
echo "3. Testing History Endpoints..."
curl -s "$BASE_URL/api/history?user_id=$USER_ID" | grep -q "success" && echo -e "${GREEN}✅ History GET PASS${NC}" || echo -e "${RED}❌ History GET FAIL${NC}"
curl -s "$BASE_URL/api/history/stats?user_id=$USER_ID" | grep -q "success" && echo -e "${GREEN}✅ History Stats PASS${NC}" || echo -e "${RED}❌ History Stats FAIL${NC}"

# 4. Environments Endpoints
echo ""
echo "4. Testing Environment Endpoints..."
ENV_RESPONSE=$(curl -s -X POST "$BASE_URL/api/environments" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test Environment\",
        \"variables\": {\"test\": \"value\"},
        \"user_id\": \"$USER_ID\"
    }")
echo "$ENV_RESPONSE" | grep -q "success" && echo -e "${GREEN}✅ Environment CREATE PASS${NC}" || echo -e "${RED}❌ Environment CREATE FAIL${NC}"

curl -s "$BASE_URL/api/environments?user_id=$USER_ID" | grep -q "success" && echo -e "${GREEN}✅ Environment GET PASS${NC}" || echo -e "${RED}❌ Environment GET FAIL${NC}"

# 5. Batch Endpoint
echo ""
echo "5. Testing Batch Execution..."
BATCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/batch/execute" \
    -H "Content-Type: application/json" \
    -d '{
        "requests": [
            {"method": "GET", "url": "https://httpbin.org/get"},
            {"method": "GET", "url": "https://httpbin.org/json"}
        ],
        "options": {
            "mode": "parallel"
        }
    }')
echo "$BATCH_RESPONSE" | grep -q "success" && echo -e "${GREEN}✅ Batch Execution PASS${NC}" || echo -e "${RED}❌ Batch Execution FAIL${NC}"

# 6. Collections Endpoints
echo ""
echo "6. Testing Collections Endpoints..."
curl -s "$BASE_URL/api/collections?user_id=$USER_ID" | grep -q "success" && echo -e "${GREEN}✅ Collections GET PASS${NC}" || echo -e "${RED}❌ Collections GET FAIL${NC}"

# 7. Monitors Endpoints
echo ""
echo "7. Testing Monitors Endpoints..."
curl -s "$BASE_URL/api/monitors?user_id=$USER_ID" | grep -q "success" && echo -e "${GREEN}✅ Monitors GET PASS${NC}" || echo -e "${RED}❌ Monitors GET FAIL${NC}"
curl -s "$BASE_URL/api/monitors/stats?user_id=$USER_ID" | grep -q "success" && echo -e "${GREEN}✅ Monitor Stats PASS${NC}" || echo -e "${RED}❌ Monitor Stats FAIL${NC}"

# 8. Alerts Endpoints
echo ""
echo "8. Testing Alerts Endpoints..."
curl -s "$BASE_URL/api/alerts?user_id=$USER_ID" | grep -q "success" && echo -e "${GREEN}✅ Alerts GET PASS${NC}" || echo -e "${RED}❌ Alerts GET FAIL${NC}"

echo ""
echo "================================================"
echo "✅ Test Suite Complete!"
echo ""
echo "Note: Some tests may show partial failures if database"
echo "migrations haven't been run yet. Run migrations first:"
echo ""
echo "  psql \$DATABASE_URL -f backend/database/migrations/003_create_request_history.sql"
echo "  psql \$DATABASE_URL -f backend/database/migrations/004_create_environments.sql"
echo ""

