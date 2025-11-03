export const getAuthToken = (): string => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
};

export const setAuthToken = (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("authToken", token);
};

export const clearAuthToken = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("authToken");
};
