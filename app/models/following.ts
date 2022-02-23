import {
  Schema,
  model,
  ClientSession,
  PaginateModel,
} from 'mongoose';
import IFollowing from './types/following';
import mongoosePaginate from 'mongoose-paginate-v2';
import IUser from './types/user';

const FollowingSchema = new Schema<IFollowing>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'User Id is required'],
  },
  byUserId: {
    type: String,
    required: true,
    index: true,
  },
}, {timestamps: true});

FollowingSchema.plugin(mongoosePaginate);

const Following = model<IFollowing, PaginateModel<IFollowing>>(
    'following',
    FollowingSchema,
);

export const getFollowers = async (query, page = 1, limit = 10) => {
  try {
    return await Following.paginate(query, {
      sort: '-createdAt',
      page,
      limit,
      populate: [{path: 'user', select: '-image'}],
    });
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving followers');
  }
};

export const create = async (
    byUserId: string,
    user: string | IUser,
    session : ClientSession | undefined,
) => {
  try {
    const newFollowingBody = {
      byUserId,
      user,
    };

    return await Following
        .create([newFollowingBody], {session: session});
  } catch (err) {
    console.log(err);
    throw Error('Error while following this User');
  }
};

export default Following;
