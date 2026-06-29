import client from "../api/client";
import type { IPerson } from "../ts/IPerson";

export const legalService = {
    searchPerson: async (cccd: string): Promise<IPerson> => {
        const response = await client.get(`/persons/search?cccd=${cccd}`);
        return response.data;
    },

    getAllLegalInfo: async (): Promise<IPerson[]> => {
        const response = await client.get("/persons/all");
        return response.data;
    },

    getHhvData: async () => {
        const response = await client.get("/hhv-data");
        return response.data.data;
    },

    getHhvDataCached: async () => {
        const response = await client.get("/hhv-data-cached");
        return response.data.data;
    },

    createLegalInfo: async (data: Omit<IPerson, '_id'>) => {
        const response = await client.post("/add", data);
        return response.data;
    }
};