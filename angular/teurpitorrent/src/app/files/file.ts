export interface Creator {
    _id: string;
    login: string;
    avatar: string;
    role: string;
  }
  
  export interface File {
    _id: string;
    name: string;
    size: number;
    creator: Creator;
    fileType: string;
    downloads: number;
    commentsNbr: number;
    lastupdatedComment: string | null;
    lastupdatedLocked: string | null;
    oldestLocked: string | null;
    averageGrade: number;
    __v: number;
    createdAt: string;
    isLocked: boolean;
    isLockedByUser: boolean;
  }

  export interface FileDirectory {
    name: string;
    size: number;
    isDirectory: boolean;
    createdAt: string;
    updatedAt: string;
    children?: FileDirectory[];
  }

  export interface FileDetail {
    fileDirectory: FileDirectory;
    file: File;
  }
  