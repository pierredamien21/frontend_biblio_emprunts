const API_BASE_URL = "https://bibliotheque-emprunts.onrender.com";

async function login(username, password) {
    console.log(`Logging in as ${username}...`);
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/login/unified`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    });

    if (!response.ok) throw new Error(`Login failed: ${response.status}`);
    const data = await response.json();
    return data.access_token;
}

async function createItem(token, endpoint, payload, name) {
    console.log(`\nTesting Create ${name} (${endpoint})...`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log("Response:", text);

        if (response.ok) return true;
        return false;

    } catch (error) {
        console.error("❌ Network error:", error.message);
        return false;
    }
}

async function runDebug() {
    try {
        const token = await login("sly2", "staff123");
        console.log("✅ Admin Logged In");

        // 1. Create Category
        await createItem(token, "/categories/", {
            nom_categorie: "Debug Category " + Date.now(),
            description: "Created by debug script"
        }, "Category");

        // 2. Create Author
        await createItem(token, "/auteurs/", {
            nom: "Hugo_Debug",
            prenom: "Victor",
            biographie: "Test bio"
        }, "Author");

    } catch (e) {
        console.error("Fatal:", e.message);
    }
}

runDebug();
