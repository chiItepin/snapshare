import {Request} from 'express';
import {handleUserNotFound} from '../helpers';
import {IAuthResponse} from '../../middleware/auth';
import Notification, {getNotifications} from '../../models/notification';
const User = require('../../models/user');

export const listNotifications = async (req: Request, res: IAuthResponse) => {
  const page = req?.query?.page ? Number(req?.query?.page) : 1;
  const limit = req?.query?.limit ? Number(req?.query?.limit) : 20;
  const userId = res.userId;

  try {
    const requestedUser = await User.getUser({_id: userId});

    if (!requestedUser) {
      handleUserNotFound(res);
    }

    const notifications = await getNotifications(
        {}, page, limit);

    return res.status(200).json({
      status: 200,
      data: notifications,
      message: 'List of notifications',
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: err?.message || '',
    });
  }
};

export const updateNotificationsSeenStatus = async (
    req: Request, res: IAuthResponse) => {
  const userId = res.userId;

  try {
    const {status} = req.body;
    if (![true, false].includes(status)) {
      throw new Error('Invalid status');
    }
    const requestedUser = await User.getUser({_id: userId});

    if (!requestedUser) {
      handleUserNotFound(res);
    }

    const updatedNotifications = await Notification.updateMany(
        {
          userId,
          isSeen: !status,
        },
        {
          isSeen: status,
        },
    );
    console.log(updatedNotifications.modifiedCount);

    return res.status(200).json({
      status: 200,
      message: `${updatedNotifications.modifiedCount} Notifications updated`,
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: err?.message || 'Unknown error occurred',
    });
  }
};
