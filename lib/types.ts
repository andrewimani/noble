export interface Book {
  id: string; // slug identifier
  title: string;
  author: string;
  category: string;
  description?: string;
  publishedYear?: number;
  tags?: string[];
}

export default Book;
