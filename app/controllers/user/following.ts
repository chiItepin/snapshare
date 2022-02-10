import {Request} from 'express';
import {startSession} from 'mongoose';
import {IAuthResponse} from '../../middleware/auth';
import IFollowing from '../../models/types/following';
const Following = require('../../models/following');
const User = require('../../models/user');

const handleUserNotFound = (res: IAuthResponse) => {
  return res.status(404).json({
    status: 404,
    message: 'user requested is not found',
  });
};

exports.listFollowers = async function(req: Request, res: IAuthResponse) {
  const page = req?.query?.page || 1;
  const limit = req?.query?.limit || 20;
  const byUserId = req?.params?.id;

  try {
    const requestedUser = await User.getUser({_id: byUserId});

    if (!requestedUser) {
      handleUserNotFound(res);
    }

    const followers = await Following.getFollowers({}, page, limit);

    return res.status(200).json({
      status: 200,
      data: followers,
      message: 'List of followers',
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: err?.message || '',
    });
  }
};

exports.createFollower = async function(req: Request, res: IAuthResponse) {
  const session = await startSession();
  session.startTransaction();
  try {
    const {byUserId, user}: IFollowing = req?.body;

    if (!byUserId || !user || (user === byUserId)) {
      return res.status(400).json({
        status: 400,
        message: 'user requested is required',
      });
    }

    const requestedUser = await User.getUser({_id: user});

    if (!requestedUser) {
      handleUserNotFound(res);
    }

    const existingFollower = await Following.Following
        .find({byUserId, user}).exec();
    if (existingFollower && existingFollower?.length) {
      await Following.Following
          .findOneAndDelete(
              {byUserId, user},
              {session});
    } else {
      await Following.create(byUserId, user, session);
    }

    await session.commitTransaction();

    return res.status(200).json({
      status: 200,
      message: 'Follower updated',
    });
  } catch (err) {
    await session.abortTransaction();
    console.log(err);
    return res.status(400).json({
      status: 400,
      message: err?.message || 'Unknown error',
    });
  } finally {
    session.endSession();
  }
};
