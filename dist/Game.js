"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const messages_1 = require("./messages");
var Direction;
(function (Direction) {
    Direction["UP"] = "UP";
    Direction["DOWN"] = "DOWN";
    Direction["LEFT"] = "LEFT";
    Direction["RIGHT"] = "RIGHT";
})(Direction || (Direction = {}));
class Game {
    // private turn: User;
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        // this.turn = player1;
        // this.board = [];
        // for (let i = 0; i < 10; i++) {
        //     this.board[i] = [];
        //     for (let j = 0; j < 10; j++) {
        //         this.board[i][j] = "0";
        //     }
        // }
        this.row = 13;
        this.col = 25;
        this.board = [];
        for (let i = 0; i < this.row; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.col; j++) {
                this.board[i][j] = "0";
            }
        }
        this.board[this.row - 1][0] = player1.username;
        this.board[this.row - 1][this.col - 1] = player2.username;
        this.player1.socket.send(JSON.stringify({
            type: messages_1.ACTIVE,
            payload: {
                message: `It's your turn`,
                board: this.board,
                square_size: 40,
                opponent: this.player2.username,
            },
        }));
        this.player2.socket.send(JSON.stringify({
            type: messages_1.ACTIVE,
            payload: {
                message: `Its your turn`,
                board: this.board,
                square_size: 40,
                opponent: this.player1.username,
            },
        }));
    }
    move(socket, direction) {
        const currentPos = this.getPlayerPosition(socket === this.player1.socket ? this.player1 : this.player2);
        const newPos = Object.assign({}, currentPos);
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
            socket.send(JSON.stringify({
                type: messages_1.ERROR,
                status: false,
                payload: { message: "Not a valid move" },
            }));
            return;
        }
        // update the board
        this.board[currentPos.x][currentPos.y] = "0";
        this.board[newPos.x][newPos.y] =
            socket === this.player1.socket
                ? this.player1.username
                : this.player2.username;
        // send the users the updated board and also the info of whose turn it is
        this.player1.socket.send(JSON.stringify({
            type: messages_1.MOVE,
            payload: {
                board: this.board,
                message: `It's your turn`,
            },
        }));
        this.player2.socket.send(JSON.stringify({
            type: messages_1.MOVE,
            payload: {
                board: this.board,
                message: `It's your turn`,
            },
        }));
    }
    getPlayerPosition(user) {
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                if (this.board[i][j] === user.username) {
                    return { x: i, y: j };
                }
            }
        }
        return { x: 0, y: 0 };
    }
    isMoveValid({ x, y }) {
        if (x >= this.row ||
            x < 0 ||
            y >= this.col ||
            y < 0 ||
            this.board[x][y] !== "0")
            return false;
        return true;
    }
}
exports.Game = Game;
