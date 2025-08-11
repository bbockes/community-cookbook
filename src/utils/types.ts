export interface Cookbook {
  id: string;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  votes: number;
  tags: string[];
  publishedDate: string;
}