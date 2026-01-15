const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bibliotheque-emprunts.onrender.com";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const headers: any = {
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...options.headers,
    };

    if (!(options.body instanceof FormData) && !headers["Content-Type"] && options.method !== 'GET') {
        headers["Content-Type"] = "application/json";
    }

    // DEBUG: Log API calls
    console.log(`🚀 API Request: ${endpoint}`, { headers, method: options.method || 'GET' });

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Une erreur est survenue");
    }

    return response.json();
}
