import {
  Schema,
  model,
  ClientSession,
  PaginateModel,
} from 'mongoose';
import INotification from './types/notification';
import mongoosePaginate from 'mongoose-paginate-v2';

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'User Id is required'],
  },
  type: {
    type: String,
    required: true,
  },
  resourceId: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  isSeen: {
    type: Boolean,
    default: false,
  },
}, {timestamps: true});

NotificationSchema.plugin(mongoosePaginate);

const Notification = model<INotification, PaginateModel<INotification>>(
    'notification',
    NotificationSchema);

export const getNotifications = async (query: any, page = 1, limit = 10) => {
  try {
    return await Notification.paginate(query, {
      sort: '-createdAt',
      page,
      limit,
    });
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving notifications');
  }
};

export const create = async (
    body: any,
    session : ClientSession | undefined,
) => {
  try {
    return await Notification
        .create([body], {session: session});
  } catch (err) {
    console.log(err);
    throw Error('Error while creating Notification');
  }
};

export default Notification;
