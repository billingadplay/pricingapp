import { Router } from "express";
import quoteRouter from "./quote.routes";
import projectsRouter from "./projects.routes";
import exportRouter from "./export.routes";

const apiRouter = Router();

apiRouter.use("/quote", quoteRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/export", exportRouter);

export default apiRouter;
