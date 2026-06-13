import client from "../api/client";

export const personService = {
    // Chấp nhận kiểu File để truyền qua FormData
    importData: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await client.post("/filesPerson/import", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

};