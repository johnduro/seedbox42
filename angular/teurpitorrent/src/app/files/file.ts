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

export class FileClass implements File {
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

  constructor(file: File) {
    this._id = file._id;
    this.name = file.name;
    this.size = file.size;
    this.creator = file.creator;
    this.fileType = file.fileType;
    this.downloads = file.downloads;
    this.commentsNbr = file.commentsNbr;
    this.lastupdatedComment = file.lastupdatedComment;
    this.lastupdatedLocked = file.lastupdatedLocked;
    this.oldestLocked = file.oldestLocked;
    this.averageGrade = file.averageGrade;
    this.__v = file.__v;
    this.createdAt = file.createdAt;
    this.isLocked = file.isLocked;
    this.isLockedByUser = file.isLockedByUser;
  }

  convertSize(): string {
    const size_K = 1000;
    const size_B_str = 'B';
    const size_K_str = 'kB';
    const size_M_str = 'MB';
    const size_G_str = 'GB';
    const size_T_str = 'TB';

    if (this.size < size_K) return `${this.size} ${size_B_str}`;

    let convertedSize: number;
    let unit: string;

    if (this.size < Math.pow(size_K, 2)) {
      convertedSize = this.size / size_K;
      unit = size_K_str;
    } else if (this.size < Math.pow(size_K, 3)) {
      convertedSize = this.size / Math.pow(size_K, 2);
      unit = size_M_str;
    } else if (this.size < Math.pow(size_K, 4)) {
      convertedSize = this.size / Math.pow(size_K, 3);
      unit = size_G_str;
    } else {
      convertedSize = this.size / Math.pow(size_K, 4);
      unit = size_T_str;
    }

    // try to have at least 3 digits and at least 1 decimal
    return convertedSize <= 9.995 ? `${convertedSize.toFixed(2)} ${unit}` : `${convertedSize.toFixed(1)} ${unit}`;
  }
}

export interface FileDirectory {
  name: string;
  size: number;
  isDirectory: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  children?: FileDirectory[];
}

export interface User {
  _id: string;
  login: string;
  avatar: string;
  role: string;
}

export interface Comment {
  text: string;
  user: User;
  _id: string;
  createdAt: string;
}

export interface Locked {
  user: string;
  createdAt: string;
  _id: string;
}

export interface Grade {
  user: User;
  grade: number;
  _id: string;
}

export interface FileDetail {
  _id: string;
  name: string;
  size: number;
  creator: User;
  fileType: string;
  downloads: number;
  privacy: number;
  commentsNbr: number;
  lastupdatedComment: string;
  lastupdatedLocked: string;
  oldestLocked: string;
  averageGrade: number;
  comments: Comment[];
  locked: Locked[];
  grades: Grade[];
  __v: number;
  createdAt: string;
  isLocked: boolean;
  isLockedByUser: boolean;
  rateByUser: number;
}

export interface FileDetailAndDirectory {
  fileDirectory: FileDirectory;
  file: FileDetail;
}
