import { Router } from "express";
import {
  createProject,
  getProject,
  listProjects,
} from "../controllers/projects.controller";

const router = Router();

router.post("/", createProject);
router.get("/", listProjects);
router.get("/:id", getProject);

export default router;
