import {Request} from 'express';
import {startSession} from 'mongoose';
import {handleUserNotFound} from '../helpers';
import {IAuthResponse} from '../../middleware/auth';
import Following, {create, getFollowers} from '../../models/following';
const User = require('../../models/user');

exports.listFollowers = async function(req: Request, res: IAuthResponse) {
  const page = req?.query?.page ? Number(req?.query?.page) : 1;
  const limit = req?.query?.limit ? Number(req?.query?.limit) : 20;
  const byUserId = req?.params?.id;

  try {
    const requestedUser = await User.getUser({_id: byUserId});

    if (!requestedUser) {
      handleUserNotFound(res);
    }

    const followers = await getFollowers({
      byUserId,
    }, page, limit);

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
    const byUserId = res.userId;
    const {user} = req?.body;

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

    const existingFollower = await Following
        .find({byUserId, user}).exec();
    if (existingFollower && existingFollower?.length) {
      await Following
          .findOneAndDelete(
              {byUserId, user},
              {session});
    } else {
      await create(byUserId, user, session);
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
