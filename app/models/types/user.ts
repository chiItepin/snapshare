import {Document} from 'mongoose';

interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  image?: string;
  createdAt: string;
}

export default IUser;
