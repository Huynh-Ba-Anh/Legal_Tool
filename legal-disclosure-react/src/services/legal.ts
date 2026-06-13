import client from "../api/client";
import type { IPerson } from "../ts/IPerson";

export const legalService = {
    // Hàm tìm kiếm người dùng theo số giấy tờ (CCCD/CMND)
    searchPerson: async (cccd: string): Promise<IPerson> => {
        const response = await client.get(`/persons/search?cccd=${cccd}`);
        return response.data;
    },

    // Hàm lấy danh sách toàn bộ (nếu cần quản trị)
    getAllLegalInfo: async (): Promise<IPerson[]> => {
        const response = await client.get("/persons/all");
        return response.data;
    },

    // Hàm thêm mới thông tin (cho Admin)
    createLegalInfo: async (data: Omit<IPerson, '_id'>) => {
        const response = await client.post("/add", data);
        return response.data;
    }
};