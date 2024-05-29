import { Router } from 'express';

import asyncHandler from '../../util/async-handler';
import validate from '../../util/validate';
import getMe from '../middleware/get-me';
import hasRole from '../middleware/has-role';
import hasSession from '../middleware/has-session';
import rateLimit from '../middleware/rate-limit';
import SessionController from './controller';
import SessionValidation from './validation';

/**
 * Handle all session-related endpoints.
 *
 * @returns Express router.
 */
const SessionHandler = () => {
  const handler = Router();

  // Allow rate limiters.
  handler.use(rateLimit(100, 'sessions'));

  // Only allow below handlers for authenticated users.
  handler.use(asyncHandler(hasSession));

  // Check personal sessions.
  handler
    .route('/me')
    .get(getMe, asyncHandler(SessionController.getUserSessions));

  // Allow self session invalidation.
  handler
    .route('/me/:id')
    .delete(
      validate(SessionValidation.deleteUserSession),
      asyncHandler(SessionController.deleteMySession),
    );

  // Only allow administrators.
  handler.use(asyncHandler(hasRole('admin')));

  // Only allow session checking and session invalidation (admins).
  handler.route('/').get(asyncHandler(SessionController.getAllSessions));

  // Allow session invalidation.
  handler
    .route('/:id')
    .delete(
      validate(SessionValidation.deleteSession),
      asyncHandler(SessionController.deleteSession),
    );

  return handler;
};

export default SessionHandler;
