
const fetch = require('node-fetch');
const FormData = require('form-data');

async function testAuth() {
    console.log("1. Attempting login...");
    const formData = new URLSearchParams();
    formData.append('username', 'admin');
    formData.append('password', 'admin123');

    try {
        const loginResp = await fetch('https://bibliotheque-emprunts.onrender.com/auth/login/unified', {
            method: 'POST',
            body: formData,
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
        console.log("Headers:", protectedResp.headers.raw());
        const body = await protectedResp.text();
        console.log("Body:", body);

    } catch (e) {
        console.error("Error:", e);
    }
}

testAuth();
