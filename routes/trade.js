import { Router } from "express";
import * as tradeController from "../controllers/tradeController.js";
import { asyncHandler } from "../asyncHandler.js";
import { requireLogin } from "../middleware/requireLogin.js";

const router = Router();

router.get("/", asyncHandler(tradeController.index));
router.post("/", asyncHandler(tradeController.create));
router.delete("/:id", asyncHandler(tradeController.destroy)); // Delete buttons

export default router;
