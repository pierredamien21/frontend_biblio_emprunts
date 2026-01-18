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

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("token");
            // Dispatch a custom event that the main app can listen to
            window.dispatchEvent(new Event("auth:unauthorized"));
        }
        // Throw an error to stop execution of the calling function
        throw new Error("Unauthorized: Token expired or invalid.");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = "Une erreur est survenue";
        if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
                errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
                // Handle Pydantic validation errors array
                errorMessage = errorData.detail.map((err: any) => `${err.loc?.join('.')} : ${err.msg}`).join(', ');
            } else {
                errorMessage = JSON.stringify(errorData.detail);
            }
        }
        throw new Error(errorMessage);
    }

    return response.json();
}
