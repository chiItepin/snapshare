import {Document} from 'mongoose';
import IUser from './user';

interface IFollowing extends Document {
  _id: string;
  user: string | IUser;
  byUserId: string;
  createdAt: string;
}

export default IFollowing;
