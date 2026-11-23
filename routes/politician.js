import { Router } from "express";
import * as politicianController from "../controllers/politicianController.js";
import { asyncHandler } from "../asyncHandler.js";
import { requireLogin } from "../middleware/requireLogin.js";

const router = Router();

router.get("/", asyncHandler(politicianController.index));
router.get("/:name", asyncHandler(politicianController.searchByName));
router.post("/", requireLogin, asyncHandler(politicianController.create));
router.delete(
  "/:name",
  requireLogin,
  asyncHandler(politicianController.destroy),
);

export default router;
