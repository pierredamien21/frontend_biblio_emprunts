const API_BASE_URL = "https://bibliotheque-emprunts.onrender.com";

async function testEndpoint(endpoint, description) {
    console.log(`\nTesting ${description} (${endpoint})...`);
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            console.error(`❌ FAILED: Request failed with status ${response.status}`);
            return false;
        }

        const data = await response.json();
        console.log("Data received:", Array.isArray(data) ? `Array with ${data.length} items` : "Object");

        if (Array.isArray(data) && data.length > 0) {
            console.log("Sample item:", JSON.stringify(data[0], null, 2));
            console.log("✅ PASS: Data looks valid");
        } else if (Array.isArray(data) && data.length === 0) {
            console.log("⚠️ WARNING: Endpoint returned empty array (might be correct but check DB)");
            console.log("✅ PASS: Valid empty array");
        } else {
            console.log("✅ PASS: Valid response");
        }
        return true;

    } catch (error) {
        console.error(`❌ FAILED: connection error`, error.message);
        return false;
    }
}

async function runTests() {
    console.log("Starting API Integration Tests...");
    console.log(`Target: ${API_BASE_URL}`);

    const booksSuccess = await testEndpoint("/livres/", "Books Endpoint");
    const categoriesSuccess = await testEndpoint("/categories/", "Categories Endpoint");

    console.log("\n=== SUMMARY ===");
    if (booksSuccess && categoriesSuccess) {
        console.log("✅ All public endpoints are reachable and returning JSON.");
    } else {
        console.log("❌ Some endpoints failed. Check backend status or CORS.");
    }
}

runTests();
