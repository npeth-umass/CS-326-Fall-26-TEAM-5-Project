import { Router } from 'express';
import * as tradeController from '../controllers/tradeController.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(tradeController.index));
router.post('/', asyncHandler(tradeController.create));

router.post('/', asyncHandler(tradeController.create));               // form.js → JSON reply
router.delete('/:id', asyncHandler(tradeController.destroy));         // Delete buttons

export default router;