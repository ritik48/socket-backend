import dotenv from "dotenv";

dotenv.config();

import express from "express";

import passport from "passport";
import session from "express-session";
import cors from "cors";

import { passportInit } from "./passport";
import { GameManager } from "./GameManager";
import { router as userRouter } from "./routes/user";
import { router as authRouter } from "./routes/auth";
import { connectDb } from "./db";

import { WebSocketServer } from "ws";
import url from "url";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());
passportInit();

app.use("/user", userRouter);
app.use("/auth", authRouter);

const gameManager = new GameManager();

function socketInit() {
    const wss = new WebSocketServer({ port: 8000 });

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
}

connectDb()
    .then(() => {
        console.log("Connected to db.");

        app.listen(3000, () => {
            console.log("Express server listening on port 3000");
            socketInit();
        });
    })
    .catch((err) => console.log("Error connecting to db"));
