# Known API Bugs & Issues

This document tracks all identified bugs in the E-commerce API. Tests are written to **validate correct behavior**

## Legend

- 🔴 **Critical** - Security vulnerabilities or data corruption
- 🟠 **High** - Core functionality broken
- 🟡 **Medium** - Standards violation or poor UX
- 🟢 **Low** - Minor issues or edge cases

---

## Products API

### 🟡 BUG-001: Incorrect Content-Type Header

**Endpoint:** `GET /productsList`, `GET /brandsList`  
**Expected:** `Content-Type: application/json`  
**Actual:** `Content-Type: text/html; charset=utf-8`  
**Impact:** Violates REST API standards, may cause issues with API clients that rely on Content-Type  
**Test:** `products.api.spec.ts:18`, `brands.api.spec.ts:10`  
**Status:** Not fixed

---

### 🟡 BUG-002: Inconsistent POST Method Handling on GET Endpoint

**Endpoint:** `GET /productsList`  
**Expected:** Should consistently return `405 Method Not Allowed` for all POST requests  
**Actual:** Behavior depends on request body:

- POST without body: Returns `200 OK` with data (incorrect)
- POST with body: Returns `405` with vague message "This request method is not supported"

**Impact:**

- Violates REST conventions
- Inconsistent behavior is confusing for API consumers
- Vague error message doesn't help developers debug
- Security concern (accepting POST on GET endpoint)
- Poor API design (endpoint used for multiple purposes)

**Test:** `products.api.spec.ts:132`  
**Status:** Not fixed

**Additional Notes:**

- The endpoint appears to be reused in "All Products" page with POST
- This is not a good practice - endpoints should have clear, single purposes
- Error message should be descriptive and suggest the correct method

---

### 🔴 BUG-003: Search Doesn't Filter Results

**Endpoint:** `POST /searchProduct`  
**Expected:** Should return only products matching the search query  
**Actual:** Returns all products regardless of search term  
**Impact:** Search functionality is broken  
**Test:** `products.api.spec.ts:137`  
**Status:** Not fixed

---

### 🔴 BUG-004: Search with No Matches Returns All Products

**Endpoint:** `POST /searchProduct`  
**Expected:** Should return empty array when no products match  
**Actual:** Returns all products  
**Impact:** Users cannot distinguish between "all products" and "no results"  
**Test:** `products.api.spec.ts:213`  
**Status:** Not fixed

---

### 🟡 BUG-005: Empty Search Query Behavior Undefined

**Endpoint:** `POST /searchProduct`  
**Expected:** Should return `400 Bad Request` or all products with clear documentation  
**Actual:** Behavior is inconsistent  
**Impact:** Unclear API contract  
**Test:** `products.api.spec.ts:185`  
**Status:** Not fixed

---

### 🟡 BUG-006: Missing Required Parameter Doesn't Return Error

**Endpoint:** `POST /searchProduct`  
**Expected:** Should return `400 Bad Request` with clear error message  
**Actual:** Returns `200` or inconsistent response  
**Impact:** Poor error handling, difficult to debug  
**Test:** `products.api.spec.ts:241`  
**Status:** Not fixed

---

### 🟡 BUG-007: Invalid Endpoints Don't Return 404

**Endpoint:** Any invalid endpoint  
**Expected:** Should return `404 Not Found`  
**Actual:** May return `200` or other unexpected status  
**Impact:** Difficult to distinguish between valid and invalid endpoints  
**Test:** `products.api.spec.ts:288`  
**Status:** Not fixed

---

### 🔴 BUG-008: Malformed Request Body Not Rejected

**Endpoint:** `POST /searchProduct`  
**Expected:** Should return `400 Bad Request` with validation error  
**Actual:** May accept invalid data or return unclear error  
**Impact:** Security concern, data integrity risk  
**Test:** `products.api.spec.ts:304`  
**Status:** Not fixed

---

### 🔴 BUG-009: Missing Security Headers

**Endpoint:** All endpoints  
**Expected:** Should include `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`  
**Actual:** Security headers are missing  
**Impact:** Security vulnerability (XSS, clickjacking, MIME sniffing)  
**Test:** `products.api.spec.ts:325`  
**Status:** Not fixed

---

## Authentication API

### 🟡 BUG-010: HTTP Status Doesn't Reflect Error Type

**Endpoint:** All auth endpoints  
**Expected:** HTTP status should reflect the error (400 for bad requests, 401 for auth failures, 404 for not found)  
**Actual:** Always returns `200 OK`, error is only in response body  
**Impact:** Violates HTTP standards, makes error handling difficult for clients  
**Test:** `auth.api.spec.ts:26`  
**Status:** Not fixed

---

### 🟡 BUG-011: Missing Parameters Don't Return 400

**Endpoint:** `POST /verifyLogin`, `POST /createAccount`, `DELETE /deleteAccount`  
**Expected:** Should return `400 Bad Request` when required parameters are missing  
**Actual:** Returns `200 OK` with error in body  
**Impact:** See BUG-010  
**Test:** `auth.api.spec.ts:26`, `auth.api.spec.ts:163`, `auth.api.spec.ts:408`  
**Status:** Not fixed

---

### 🟡 BUG-012: Invalid Credentials Don't Return 401

**Endpoint:** `POST /verifyLogin`  
**Expected:** Should return `401 Unauthorized` for invalid credentials  
**Actual:** Returns `200 OK` with error in body  
**Impact:** See BUG-010  
**Test:** `auth.api.spec.ts:42`  
**Status:** Not fixed

---

### 🔴 BUG-013: SQL Injection Protection Unclear

**Endpoint:** `POST /verifyLogin`  
**Expected:** Should reject SQL injection attempts with `401 Unauthorized`  
**Actual:** Behavior unclear, needs verification  
**Impact:** Potential SQL injection vulnerability  
**Test:** `auth.api.spec.ts:112`  
**Status:** Needs investigation

---

### 🔴 BUG-014: XSS Sanitization Unclear

**Endpoint:** `POST /verifyLogin`, `POST /createAccount`  
**Expected:** Should sanitize XSS payloads and return `401 Unauthorized`  
**Actual:** Unclear if input is sanitized  
**Impact:** Potential XSS vulnerability  
**Test:** `auth.api.spec.ts:138`  
**Status:** Needs investigation

---

### 🟡 BUG-015: Duplicate Email Doesn't Return 409

**Endpoint:** `POST /createAccount`  
**Expected:** Should return `409 Conflict` when email already exists  
**Actual:** Returns `200 OK` with error in body  
**Impact:** See BUG-010  
**Test:** `auth.api.spec.ts:244`  
**Status:** Not fixed

---

### 🟡 BUG-016: Email Format Validation Missing

**Endpoint:** `POST /createAccount`  
**Expected:** Should return `400 Bad Request` for invalid email format  
**Actual:** May accept invalid emails  
**Impact:** Data integrity, potential delivery issues  
**Test:** `auth.api.spec.ts:313`  
**Status:** Not fixed

---

### 🟡 BUG-017: Non-existent Account Delete Doesn't Return 404

**Endpoint:** `DELETE /deleteAccount`  
**Expected:** Should return `404 Not Found` when account doesn't exist  
**Actual:** Returns `200 OK` with error in body  
**Impact:** See BUG-010  
**Test:** `auth.api.spec.ts:423`  
**Status:** Not fixed

---

---

## UI Bugs

### 🔴 BUG-018: UI Search Doesn't Filter Products

**Page:** Products page search functionality  
**Expected:** Search should filter products to show only matching items  
**Actual:** Shows all products regardless of search term  
**Related:** API BUG-003, BUG-004  
**Impact:** Users cannot find specific products, search feature is useless  
**Test:** `productsPage.ts:61`  
**Status:** Known issue, not fixed

**Note:** This is the UI manifestation of the API bug. Both need to be fixed together.

### 🟡 BUG-019: Login Error Message Lacks Visual Styling

**Page:** Login page  
**Expected:** Error message should have error styling (red color, warning icon, or error class)  
**Actual:** Error message appears as plain text without visual distinction  
**Impact:** Poor accessibility and user experience, especially for users with visual impairments  
**Location:** `loginPage.ts:48`  
**Status:** Not fixed  

**Note:** The error message is not visually distinct from regular text, which could cause users to miss important feedback about login failures.

---


## Summary

| Severity    | Count  |
| ----------- | ------ |
| 🔴 Critical | 6      |
| 🟠 High     | 0      |
| 🟡 Medium   | 13     |
| 🟢 Low      | 0      |
| **Total**   | **19** |

---

## Testing Philosophy

Our tests are written to **validate correct API behavior**, not to pass with buggy implementations. When a bug is found:

1. ✅ **DO:** Document the bug clearly with expected vs actual behavior
2. ✅ **DO:** Use `test.fixme()` for tests that fail due to bugs
3. ✅ **DO:** Write assertions for the **correct** behavior
4. ✅ **DO:** Add TODO comments for when bugs are fixed
5. ❌ **DON'T:** Adapt tests to pass with buggy behavior
6. ❌ **DON'T:** Skip tests without clear bug documentation
7. ❌ **DON'T:** Use vague comments like "API behavior inconsistent"

---

## Bug Report Template

```
### 🔴 BUG-XXX: Short Description
**Endpoint:** `METHOD /path`
**Expected:** What should happen
**Actual:** What actually happens
**Impact:** Business/technical impact
**Test:** `file.spec.ts:line`
**Status:** Not fixed / Under investigation / Fixed
```

---

_Last updated: 2025-10-13_
