import { WebSocket } from "ws";
import { GAME_OVER, INIT, MOVE } from "./messages";
import { Game } from "./Game";

interface User {
    socket: WebSocket;
    username: string;
}

export class GameManager {
    public users: User[];
    private games: Game[];
    private pendingUser: User | null;

    constructor() {
        this.users = [];
        this.pendingUser = null;

        this.games = [];
    }

    addUser({ socket, username }: User) {
        this.users.push({ socket, username });
        this.addHandler({ socket, username });
    }
    addHandler({ socket, username }: User) {
        socket.on("message", (data: string) => {
            const message = JSON.parse(data);

            if (message.type === INIT) {
                if (this.pendingUser) {
                    const game = new Game(
                        { socket, username },
                        this.pendingUser
                    );

                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = { socket, username };

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
        const this_users_game = this.games.find(
            (g) => g.player1.socket === socket || g.player2.socket === socket
        );

        // send the other user notification that their opponent left
        if (socket === this_users_game?.player1.socket) {
            this_users_game.player2.socket.send(
                JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        message: `${this_users_game.player1.username} left the game.`,
                    },
                })
            );
        } else if (socket === this_users_game?.player2.socket) {
            this_users_game.player1.socket.send(
                JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        message: `${this_users_game.player2.username} left the game.`,
                    },
                })
            );
        }

        // remove the game when any of the opponent leaves
        this.games = this.games.filter(
            (g) => g.player1.socket !== socket && g.player2.socket !== socket
        );

        // remove the user from list
        this.users = this.users.filter((user) => user.socket != socket);
    }
}
