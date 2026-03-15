import api from "./api";

export interface User {
    id: string;
    email: string;
    name?: string;
}

// * Validate the session by calling the /me endpoint.
export const checkAuth = async (): Promise<User | null> => {
    try {
        const response = await api.get("/auth/me");
        return response.data;
    } catch {
        return null;
    }
}

// * Logs out by calling the backend to clear the HttpOnly cookies.
export const logout = async () => {
    try {
        await api.post("/auth/logout");
        window.location.href = "/login";
    } catch (error) {
        console.error("Logout failed", error);
    }
}
