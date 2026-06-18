import client from "../api/client";
import type { IFile } from "../ts/IFile";

export const fileService = {

    getObligations: async (typePerson: string): Promise<IFile[]> => {
        const response = await client.get(`/filesInform?typePerson=${typePerson}`);
        return response.data;
    },

    getAll: async (): Promise<IFile[]> => {
        const response = await client.get(`/filesInform/get-all`);
        return response.data;
    },

    update: async (
        id: string,
        formData: FormData
    ): Promise<IFile> => {
        const response = await client.patch(
            `filesInform/${id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await client.delete(`filesInform/${id}`);
    },

    create: async (data: FormData) => {
        const res = await client.post("/filesInform", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return res.data;
    }

};