import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import problemRoutes from "./routes/problem.routes.js";
import executionRoute from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/problems',problemRoutes);
app.use('/api/v1/execute-code',executionRoute);
app.use('/api/v1/submission',submissionRoutes);  
app.use('/api/v1/playlist',playlistRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});