
// Using native fetch in Node 18+
async function testAuth() {
    console.log("1. Attempting login...");

    // Manual form-urlencoded string construction to avoid dependencies
    const params = new URLSearchParams();
    params.append('username', 'admin');
    params.append('password', 'admin123');

    try {
        const loginResp = await fetch('https://bibliotheque-emprunts.onrender.com/auth/login/unified', {
            method: 'POST',
            body: params,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (!loginResp.ok) {
            console.error("Login failed:", await loginResp.text());
            return;
        }

        const loginData = await loginResp.json();
        console.log("Login successful. Token:", loginData.access_token);

        const token = loginData.access_token;

        console.log("\n2. Attempting to fetch bibliothecaires with token...");
        const protectedResp = await fetch('https://bibliotheque-emprunts.onrender.com/bibliothecaires/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`Status: ${protectedResp.status}`);

        const body = await protectedResp.text();
        console.log("Body:", body);

    } catch (e) {
        console.error("Error:", e);
    }
}

testAuth();
