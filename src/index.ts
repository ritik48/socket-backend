import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";

import url from "url";

const wss = new WebSocketServer({ port: 8000 });

const x = "hello";

const gameManager = new GameManager();

wss.on("connection", function connection(socket, req) {
    socket.on("error", console.error);

    //@ts-ignore
    const username: string = url.parse(req.url, true).query.name;

    gameManager.addUser({ socket, username });

    socket.on("close", () => {
        gameManager.removeUser(socket);
        gameManager.removeGame(socket);
        console.log(username + " disconnected");
        // console.log("current users = ", gameManager.users);
    });
});
