import {Document} from 'mongoose';
import IUser from './user';

export interface IComment {
  _id?: string;
  authorId: string | IUser;
  content: string;
  createdAt: string;
}

export interface ILike {
  _id?: string;
  authorId: string | IUser;
}

export interface IImages {
  _id?: string;
  url: string;
}

export interface IPost extends Document {
  _id?: string;
  authorId: IUser;
  content: string;
  images: IImages[];
  likes: ILike[];
  comments: IComment[];
  tags: string[];
  categories: string[];
  createdAt: string;
}
