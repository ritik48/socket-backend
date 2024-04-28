import dotenv from "dotenv";

dotenv.config();

import express from "express";
import { createServer } from "http";

import passport from "passport";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";

import { passportInit } from "./passport";
import { GameManager } from "./GameManager";
import { router as userRouter } from "./routes/user";
import { router as authRouter } from "./routes/auth";
import { connectDb } from "./db";

import { WebSocketServer } from "ws";
import url from "url";

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server: server });

const CLIENT_URL = process.env.CLIENT || "http://localhost:5173";
const PORT = process.env.PORT || 3000;

const MONGO_URI =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/socket-db";

const store = MongoStore.create({
    mongoUrl: MONGO_URI,
    crypto: {
        secret: "thisshouldbeabettersecret!",
    },
});

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

app.use(
    session({
        store,
        secret: "secretkey",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true, sameSite: "none", httpOnly: true },
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.enable("trust proxy");

passportInit();

app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Server online" });
});

app.use("/user", userRouter);
app.use("/auth", authRouter);

const gameManager = new GameManager();

wss.on("connection", function connection(socket, req) {
    socket.on("error", console.error);

    //@ts-ignore
    const username: string = url.parse(req.url, true).query.name;

    gameManager.addUser({ socket, username });
    console.log("connected ", username);

    socket.on("close", () => {
        gameManager.removeUser(socket);
        gameManager.removeGame(socket);
        console.log(username + " disconnected");
        // console.log("current users = ", gameManager.users);
    });
});

connectDb()
    .then(() => {
        console.log("Connected to db.");

        server.listen(PORT, () => {
            console.log("Express server listening on port 3000");
        });
    })
    .catch((err) => console.log("Error connecting to db"));
