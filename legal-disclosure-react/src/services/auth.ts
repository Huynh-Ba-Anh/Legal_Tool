import client from "../api/client";
import type { LoginResponse } from "../ts/IAdmin";

export const adminService = {
    login: async (
        username: string,
        password: string
    ): Promise<LoginResponse> => {
        const response = await client.post("/users/login", {
            username,
            password,
        });

        const data = response.data;

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        return data;
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    getCurrentUser: () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },
};