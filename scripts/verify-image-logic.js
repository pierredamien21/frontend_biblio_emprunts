
// Verification Script for getImageUrl Logic (Self-contained)

// Mock process if testing in non-Node environment (though we are in Node here)
if (typeof process === 'undefined') {
    global.process = { env: {} };
}

function getImageUrl(path) {
    if (!path) return "https://images.unsplash.com/photo-1543004218-ee141104975a?q=80&w=200&h=300&auto=format&fit=crop"
    if (path.startsWith("http")) return path

    // Custom heuristic: If path is just a filename (no slashes), assume it's a local public asset
    if (!path.includes("/")) {
        return `/${path}`
    }

    const apiUrl = "https://bibliotheque-emprunts.onrender.com"
    const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl
    const cleanPath = path.startsWith("/") ? path : `/${path}`
    return `${cleanApiUrl}${cleanPath}`
}

console.log("Testing getImageUrl logic...");
const cases = [
    { input: "photo.jpg", expected: "/photo.jpg", desc: "Local asset (public folder)" },
    { input: "covers/book.jpg", expected: "https://bibliotheque-emprunts.onrender.com/covers/book.jpg", desc: "API relative path" },
    { input: "/covers/book.jpg", expected: "https://bibliotheque-emprunts.onrender.com/covers/book.jpg", desc: "API absolute path" },
    { input: "https://example.com/img.png", expected: "https://example.com/img.png", desc: "External URL" },
    { input: null, expected: "https://images.unsplash.com/photo-1543004218-ee141104975a?q=80&w=200&h=300&auto=format&fit=crop", desc: "Null input" }
];

let success = true;
cases.forEach(c => {
    const result = getImageUrl(c.input);
    if (result !== c.expected) {
        console.error(`❌ FAILED: ${c.desc}.\n   Input: ${c.input}\n   Expected: ${c.expected}\n   Got: ${result}`);
        success = false;
    } else {
        console.log(`✅ PASS: ${c.desc}`);
    }
});

if (success) {
    console.log("\n✅ Image URL logic verified successfully.");
    process.exit(0);
} else {
    console.log("\n❌ Image URL logic verification FAILED.");
    process.exit(1);
}
