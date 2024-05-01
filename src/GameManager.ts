import { WebSocket } from "ws";
import { BOARD_SIZE, CLIENT_READY, GAME_OVER, INIT, MOVE } from "./messages";
import { Game } from "./Game";

interface User {
    socket: WebSocket;
    username: string;
    id: string;
}

export class GameManager {
    public users: User[];
    private games: Game[];
    private pendingUser: User | null;

    private board: string[][];

    constructor() {
        this.users = [];
        this.pendingUser = null;

        this.games = [];

        this.board = [];
        for (let i = 0; i < 13; i++) {
            this.board[i] = [];
            for (let j = 0; j < 25; j++) {
                this.board[i][j] = "0";
            }
        }
    }

    addUser({ socket, username, id }: User) {
        this.users.push({ socket, username, id });
        this.addHandler({ socket, username, id });

        // socket.send(
        //     JSON.stringify({
        //         type: BOARD_SIZE,
        //         payload: {
        //             board: this.board,
        //             square_size: 59,
        //         },
        //     })
        // );
    }
    addHandler({ socket, username, id }: User) {
        socket.on("message", (data: string) => {
            const message = JSON.parse(data);

            if (message.type === CLIENT_READY) {
                console.log("client ready");
                socket.send(
                    JSON.stringify({
                        type: BOARD_SIZE,
                        payload: {
                            board: this.board,
                            square_size: 40,
                        },
                    })
                );
            }
            if (message.type === INIT) {
                if (this.pendingUser) {
                    const game = new Game(
                        { socket, username, id },
                        this.pendingUser
                    );

                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = { socket, username, id };

                    socket.send(
                        JSON.stringify({
                            type: INIT,
                            payload: {
                                message: "Waiting for other user to join....",
                            },
                        })
                    );
                }
            }

            if (message.type === MOVE) {
                const game = this.games.find(
                    (g) =>
                        g.player1.socket === socket ||
                        g.player2.socket === socket
                );
                if (!game) return;

                game.move(socket, message.payload);
            }
        });
    }
    removeUser(socket: WebSocket) {
        this.users = this.users.filter((user) => user.socket != socket);

        // if the user who leaves is the pendingUser, then make pendingUser = NULL
        if (this.pendingUser) {
            if (socket === this.pendingUser.socket) {
                this.pendingUser = null;
            }
        }
    }
    removeGame(socket: WebSocket) {
        const game = this.games.find(
            (g) => g.player1.socket === socket || g.player2.socket === socket
        );

        if (!game) return;

        if (socket !== game.player1.socket) {
            game.player1.socket.send(
                JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        message: `${game.player2.username} left the game.`,
                        board: this.board,
                    },
                })
            );
            this.pendingUser = game.player1;
        }

        if (socket !== game.player2.socket) {
            game.player2.socket.send(
                JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        message: `${game.player1.username} left the game.`,
                        board: this.board,
                    },
                })
            );
            this.pendingUser = game.player2;
        }

        // remove the game
        this.games = this.games.filter(
            (game) =>
                game.player1.socket !== socket &&
                game?.player2.socket !== socket
        );
    }
}
