import {Schema, model, ClientSession} from 'mongoose';
import IFollowing from './types/following';
import mongoosePaginate from 'mongoose-paginate-v2';

const FollowingSchema = new Schema<IFollowing>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'User Id is required'],
  },
  byUserId: {
    type: String,
    required: true,
  },
}, {timestamps: true});

FollowingSchema.plugin(mongoosePaginate);

exports.Following = model<IFollowing>('following', FollowingSchema);

exports.getFollowers = async (query, page = 1, limit = 10) => {
  try {
    return await exports.Following.paginate(query, {
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

exports.create = async (
    byUserId: string, user: string, session : ClientSession | undefined) => {
  try {
    const newFollowingBody = {
      byUserId,
      user,
    };

    return await exports.Following
        .create([newFollowingBody], {session: session});
  } catch (err) {
    console.log(err);
    throw Error('Error while following this User');
  }
};
