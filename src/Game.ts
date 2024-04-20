import { WebSocket } from "ws";
import { ACTIVE, ERROR, MOVE } from "./messages";

interface User {
    socket: WebSocket;
    username: string;
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

    private turn: User;

    constructor(player1: User, player2: User) {
        this.player1 = player1;
        this.player2 = player2;

        this.turn = player1;

        // this.board = [];
        // for (let i = 0; i < 10; i++) {
        //     this.board[i] = [];
        //     for (let j = 0; j < 10; j++) {
        //         this.board[i][j] = "0";
        //     }
        // }
        this.row = 10;
        this.col = 14;

        this.board = [];
        for (let i = 0; i < this.row; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.col; j++) {
                this.board[i][j] = "0";
            }
        }

        this.board[this.row - 1][0] = player1.username;
        this.board[this.row - 1][this.col - 1] = player2.username;

        this.player1.socket.send(
            JSON.stringify({
                type: ACTIVE,
                payload: {
                    message: `It's your turn, ${this.player1.username}`,
                    board: this.board,
                    square_size: 59,
                    opponent: this.player2.username,
                },
            })
        );
        this.player2.socket.send(
            JSON.stringify({
                type: ACTIVE,
                payload: {
                    message: `It's ${this.player1.username}'s turn`,
                    board: this.board,
                    square_size: 59,
                    opponent: this.player1.username,
                },
            })
        );
    }

    move(socket: WebSocket, direction: Direction) {
        if (this.turn.socket !== socket) {
            socket.send(
                JSON.stringify({
                    type: ERROR,
                    status: false,
                    payload: {
                        message: "Not your turn",
                    },
                })
            );
            return;
        }

        const currentPos = this.getPlayerPosition(this.turn);

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
            socket.send(
                JSON.stringify({
                    type: ERROR,
                    status: false,
                    payload: { message: "Not a valid move" },
                })
            );
            return;
        }

        // update the board
        this.board[currentPos.x][currentPos.y] = "0";
        this.board[newPos.x][newPos.y] = this.turn.username;

        // change the turn
        this.turn =
            this.turn.socket === this.player1.socket
                ? this.player2
                : this.player1;

        // send the users the updated board and also the info of whose turn it is
        socket.send(
            JSON.stringify({
                type: MOVE,
                payload: {
                    board: this.board,
                    message: `It's ${this.turn.username}'s turn`,
                },
            })
        );
        this.turn.socket.send(
            JSON.stringify({
                type: MOVE,
                payload: {
                    board: this.board,
                    message: `It's your turn`,
                },
            })
        );
    }

    getPlayerPosition(user: User): Coords {
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                if (this.board[i][j] === user.username) {
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
