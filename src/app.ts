import "dotenv/config";
import express from "express";
import routes from "./routes.js";

const app = express();
app.use(express.json());
app.use(routes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`noisy-quill-authority listening on :${port}`));
