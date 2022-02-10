import {IAuthResponse} from '../middleware/auth';

export const handleUserNotFound = (res: IAuthResponse) => {
  return res.status(404).json({
    status: 404,
    message: 'user requested is not found',
  });
};
