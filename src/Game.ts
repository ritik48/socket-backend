import { WebSocket } from "ws";
import { ACTIVE, ERROR, MOVE } from "./messages";

interface User {
    socket: WebSocket;
    username: string;
    id: string;
}

enum Direction {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
}

interface Coords {
    x: number;
    y: number;
}

export class Game {
    public player1: User;
    public player2: User;

    private row: number;
    private col: number;

    private board: string[][];

    constructor(player1: User, player2: User) {
        this.player1 = player1;
        this.player2 = player2;

        this.row = 13;
        this.col = 25;

        this.board = [];
        for (let i = 0; i < this.row; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.col; j++) {
                this.board[i][j] = "0";
            }
        }

        this.board[this.row - 1][0] = player1.id;
        this.board[this.row - 1][this.col - 1] = player2.id;

        this.player1.socket.send(
            JSON.stringify({
                type: ACTIVE,
                payload: {
                    board: this.board,
                    square_size: 40,
                    opponent: {
                        username: this.player2.username,
                        id: this.player2.id,
                    },
                },
            })
        );
        this.player2.socket.send(
            JSON.stringify({
                type: ACTIVE,
                payload: {
                    board: this.board,
                    square_size: 40,
                    opponent: {
                        username: this.player1.username,
                        id: this.player1.id,
                    },
                },
            })
        );
    }

    move(socket: WebSocket, direction: Direction) {
        const currentPos = this.getPlayerPosition(
            socket === this.player1.socket ? this.player1 : this.player2
        );

        const newPos = { ...currentPos };

        if (direction === Direction.DOWN) {
            newPos.x += 1;
        }
        if (direction === Direction.UP) {
            newPos.x -= 1;
        }
        if (direction === Direction.LEFT) {
            newPos.y -= 1;
        }
        if (direction === Direction.RIGHT) {
            newPos.y += 1;
        }

        if (!this.isMoveValid(newPos)) {
            // socket.send(
            //     JSON.stringify({
            //         type: ERROR,
            //         status: false,
            //         payload: { message: "Not a valid move" },
            //     })
            // );
            return;
        }

        // update the board
        this.board[currentPos.x][currentPos.y] = "0";
        this.board[newPos.x][newPos.y] =
            socket === this.player1.socket ? this.player1.id : this.player2.id;

        // send the users the updated board and also the info of whose turn it is
        this.player1.socket.send(
            JSON.stringify({
                type: MOVE,
                payload: {
                    board: this.board,
                },
            })
        );
        this.player2.socket.send(
            JSON.stringify({
                type: MOVE,
                payload: {
                    board: this.board,
                },
            })
        );
    }

    getPlayerPosition(user: User): Coords {
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                if (this.board[i][j] === user.id) {
                    return { x: i, y: j };
                }
            }
        }
        return { x: 0, y: 0 };
    }
    isMoveValid({ x, y }: Coords) {
        if (
            x >= this.row ||
            x < 0 ||
            y >= this.col ||
            y < 0 ||
            this.board[x][y] !== "0"
        )
            return false;
        return true;
    }
}
