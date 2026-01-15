const API_BASE_URL = "https://bibliotheque-emprunts.onrender.com";

async function testLogin(username, password, format) {
    const endpoint = "/auth/login/unified";
    console.log(`\nTesting Login (${format}) for user: ${username}...`);

    let options = {
        method: "POST",
        headers: {}
    };

    if (format === "json") {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify({ username, password });
    } else {
        options.headers["Content-Type"] = "application/x-www-form-urlencoded";
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);
        options.body = formData.toString();
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        console.log(`Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        try {
            const json = JSON.parse(text);
            console.log("Response:", JSON.stringify(json, null, 2));
            if (response.ok && json.access_token) return true;
        } catch (e) {
            console.log("Response (text):", text);
        }
        return false;
    } catch (error) {
        console.error(`❌ FAILED: connection error`, error.message);
        return false;
    }
}

async function runTests() {
    // Test Credentials from README
    const creds = [
        { u: "membre@test.com", p: "password123", role: "Membre" },
        { u: "sly2", p: "staff123", role: "Bibliothécaire" }
    ];

    for (const cred of creds) {
        console.log(`\n=== Testing Role: ${cred.role} ===`);

        // Test FormData (Current Implementation)
        const fdSuccess = await testLogin(cred.u, cred.p, "form-data");
        if (fdSuccess) console.log("✅ Form Data worked!");
        else console.log("❌ Form Data failed.");

        // Test JSON (Documentation)
        const jsonSuccess = await testLogin(cred.u, cred.p, "json");
        if (jsonSuccess) console.log("✅ JSON worked!");
        else console.log("❌ JSON failed.");
    }
}

runTests();
