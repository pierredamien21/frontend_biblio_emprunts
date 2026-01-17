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
            window.location.href = "/login";
        }
        // If we redirect, we don't want to proceed with the rest of the error handling
        // or return a response, as the page will change.
        // However, if not in a browser environment, we should still throw an error.
        if (typeof window === 'undefined') {
            throw new Error("Unauthorized: Token expired or invalid.");
        }
        // In a browser, the redirect will prevent further execution, so we can just return
        // or throw a specific error if we want to ensure the function exits.
        // For now, let's assume the redirect is sufficient.
        return new Promise(() => { }); // Return a never-resolving promise to halt execution
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
