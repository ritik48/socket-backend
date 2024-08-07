"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uuid_1 = require("uuid");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const passport_2 = require("./passport");
const GameManager_1 = require("./GameManager");
const user_1 = require("./routes/user");
const auth_1 = require("./routes/auth");
const db_1 = require("./db");
const ws_1 = require("ws");
const url_1 = __importDefault(require("url"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server: server });
const CLIENT_URL = process.env.CLIENT || "http://localhost:5173";
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/socket-db";
const store = connect_mongo_1.default.create({
    mongoUrl: MONGO_URI,
    crypto: {
        secret: "thisshouldbeabettersecret!",
    },
});
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
    credentials: true,
}));
app.use((0, express_session_1.default)({
    store,
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 2,
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.enable("trust proxy");
(0, passport_2.passportInit)();
app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Server online" });
});
app.use("/user", user_1.router);
app.use("/auth", auth_1.router);
const gameManager = new GameManager_1.GameManager();
wss.on("connection", function connection(socket, req) {
    socket.on("error", console.error);
    //@ts-ignore
    const username = url_1.default.parse(req.url, true).query.name;
    const id = (0, uuid_1.v4)();
    gameManager.addUser({ socket, username, id });
    console.log("connected ", username);
    socket.on("close", () => {
        gameManager.removeUser(socket);
        gameManager.removeGame(socket);
        console.log(username + " disconnected");
        // console.log("current users = ", gameManager.users);
    });
});
(0, db_1.connectDb)()
    .then(() => {
    console.log("Connected to db.");
    server.listen(PORT, () => {
        console.log("Express server listening on port " + PORT);
    });
})
    .catch((err) => console.log("Error connecting to db"));
