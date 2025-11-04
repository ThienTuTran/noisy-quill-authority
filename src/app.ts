import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`noisy-quill-authority listening on :${port}`));
