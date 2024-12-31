
export interface User {
    _id: string;
    login: string;
    avatar: string;
    role: string;
    createdAt: string;
    __v: number;
}

export interface ChatMessage {
    _id: string;
    message: string;
    user: User;
    createdAt: string;
    __v: number;
}