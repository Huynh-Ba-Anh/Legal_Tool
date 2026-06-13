export interface IUser {
    _id: string;
    username: string;
    role: "admin" | "manager";
}

export interface LoginResponse {
    token: string;
    user: IUser;
    message: string;
}