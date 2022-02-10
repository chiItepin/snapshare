import {Document, ObjectId} from 'mongoose';

interface INotification extends Document {
  _id: string | ObjectId;
  userId: string | ObjectId;
  type: 'post' | 'following';
  message: string;
  isSeen: boolean;
  resourceId?: string | ObjectId;
  createdAt?: string;
}

export default INotification;
