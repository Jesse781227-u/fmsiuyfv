import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { resolve } from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const fmsDistDir = resolve(__dirname, "../../forgive-me-sister/dist/public");
app.use("/fms", express.static(fmsDistDir));
app.use("/fms", (_req, res) => {
  res.sendFile(resolve(fmsDistDir, "index.html"));
});

export default app;
