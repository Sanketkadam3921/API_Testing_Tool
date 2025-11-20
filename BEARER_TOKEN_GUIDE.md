# Bearer Token Authentication Guide

## Overview

The API Testing Tool fully supports Bearer Token authentication. You can add Bearer tokens to your API requests in two ways:

1. **Quick Bearer Token Input** (Recommended) - A dedicated field in the Headers tab
2. **Manual Header Entry** - Add `Authorization` header manually in the Custom Headers section

## How to Use Bearer Tokens

### Method 1: Quick Bearer Token Input (Recommended)

1. Navigate to the **Testing** page
2. Select or create a request tab
3. Click on the **Headers** tab
4. In the **"Bearer Token (Quick Add)"** section at the top:
   - Enter your bearer token in the password-protected field
   - The token will be automatically formatted as `Bearer <your-token>`
   - The token field is password-protected for security
5. Click **Send** to make the request

**Note:** The token is automatically prefixed with "Bearer " if you don't include it.

### Method 2: Manual Header Entry

1. Navigate to the **Testing** page
2. Select or create a request tab
3. Click on the **Headers** tab
4. Scroll to the **Custom Headers** section
5. Click **Add Header**
6. Enter:
   - **Header name:** `Authorization`
   - **Header value:** `Bearer <your-token>`
7. Click **Send** to make the request

## Backend Verification

The backend properly forwards the `Authorization` header with Bearer tokens to the target API. You can verify this by:

1. Making a request to `https://httpbin.org/headers`
2. The response will echo back all headers, including your `Authorization` header
3. Verify that `"Authorization": "Bearer <your-token>"` appears in the response

## Testing Results

✅ **Backend Test:** PASSED
- Backend correctly forwards `Authorization: Bearer <token>` headers
- Headers are preserved when making requests to external APIs

✅ **Frontend Test:** IMPLEMENTED
- Quick Bearer Token input field in Headers tab
- Password-protected token field
- Automatic "Bearer " prefix formatting
- Clear button to remove token

## Example Request

```json
{
  "method": "GET",
  "url": "https://api.example.com/users",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Security Notes

- Bearer tokens are stored in browser localStorage (via Zustand persist)
- The token input field is password-protected to prevent shoulder-surfing
- Tokens are transmitted to the backend and forwarded to target APIs
- Consider clearing tokens after use in shared environments

## Troubleshooting

**Token not being sent:**
- Verify you're in the Headers tab
- Check that the Bearer Token field has a value
- Ensure you clicked Send after entering the token

**401 Unauthorized errors:**
- Verify your token is valid and not expired
- Check that the token is correctly formatted with "Bearer " prefix
- Ensure the target API accepts Bearer token authentication

**Token not appearing in response:**
- Use a test API like `https://httpbin.org/headers` to verify header forwarding
- Check the Response > Headers tab to see what headers were sent

