export interface Publisher {
  _id: string;
  name: string;
}

export interface Ebook {
  _id: string;
  name: string;
  author: string;
  illustrator: string;
  coverImage: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  releaseDate: string;
  publisher: Publisher;
}

export interface Konorano {
  _id: string;
  name: string;
  author: string; // Always "宝島社"
  coverImage: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  releaseDate: string;
  viURL: string; // Link to Vietnamese translation
}
