/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IFile {
    _id: string;
    title: string;
    content: string;

    file: {
        data: any;
        contentType: string;
        originalName: string;
    } | null;

    typePerson: string;
}

export interface IFileDraft {
    title: string;
    content: string;
    typePerson: string;
}