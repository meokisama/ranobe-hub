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
