import { Router, type IRouter } from "express";
import healthRouter from "./health";
import spillsRouter from "./spills";
import authRouter from "./auth";
import privateMessagesRouter from "./private-messages";
import priorityConfessionsRouter from "./priority-confessions";
import adminRouter from "./admin";
import matchmakingRouter from "./matchmaking";

const router: IRouter = Router();

router.use(healthRouter);
router.use(spillsRouter);
router.use(authRouter);
router.use(privateMessagesRouter);
router.use(priorityConfessionsRouter);
router.use(adminRouter);
router.use(matchmakingRouter);

export default router;
