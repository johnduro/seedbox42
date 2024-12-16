export interface User {
    _id: string;
    login: string;
    mail: string;
    avatar: string;
    role: string;
    createdAt: string;
    __v: number;
}

export interface ConnectedUsers {
    connectedUsers: number;
    logins: string[];
  }