import { Router } from 'express';
import * as politicianController from '../controllers/politicianController.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(politicianController.index));
router.get('/:name', asyncHandler(politicianController.searchByName));
router.post('/', asyncHandler(politicianController.create));
router.delete('/:name', asyncHandler(politicianController.destroy));

export default router;
