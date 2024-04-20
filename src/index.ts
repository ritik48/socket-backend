import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";

const wss = new WebSocketServer({ port: 8000 });

const x = "hello";

const gameManager = new GameManager();

wss.on("connection", function connection(socket, req) {
    socket.on("error", console.error);

    const url = new URL(req.url ?? "", `http://${req.headers.host}`);

    const username: string = url.searchParams.get("name")!;

    // console.log(username + " connected");

    gameManager.addUser({ socket, username });

    socket.on("close", () => {
        gameManager.removeUser(socket);
        gameManager.removeGame(socket);
        console.log(username + " disconnected");
        // console.log("current users = ", gameManager.users);
    });
});
