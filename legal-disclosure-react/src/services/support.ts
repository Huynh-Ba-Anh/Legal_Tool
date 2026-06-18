import client from "../api/client";
import type { ICreateSupport } from "../ts/ICreateSupport";
import type { ISupport } from "../ts/ISupport";

const supportService = {
    getAll: async (): Promise<ISupport[]> => {
        const response = await client.get("/support");
        return response.data;
    },

    getById: async (id: string): Promise<ISupport> => {
        const response = await client.get(`/support/${id}`);
        return response.data;
    },

    create: async (
        data: ICreateSupport
    ): Promise<ISupport> => {
        const response = await client.post(
            "/support",
            data
        );

        return response.data;
    },

    updateStatus: async (
        id: string,
        status: "pending" | "processing" | "done"
    ): Promise<ISupport> => {
        const response = await client.patch(
            `/support/${id}/status`,
            { status }
        );

        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await client.delete(`/support/${id}`);
    },
};

export default supportService;
