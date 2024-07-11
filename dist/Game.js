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
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.dest_row = 5;
        this.dest_col = 8;
        this.row = 13;
        this.col = 25;
        this.board = [];
        this.initializeBoard();
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
            // socket.send(
            //     JSON.stringify({
            //         type: ERROR,
            //         status: false,
            //         payload: { message: "Not a valid move" },
            //     })
            // );
            return;
        }
        const hasWon = this.checkWin(newPos);
        if (hasWon) {
            const winner = this.player1.socket === socket
                ? this.player1.username
                : this.player2.username;
            this.player1.socket.send(JSON.stringify({
                type: "WIN",
                payload: {
                    player: this.player1.socket === socket
                        ? this.player1.id
                        : this.player2.id,
                    cur_x: newPos.x,
                    cur_y: newPos.y,
                    old_x: currentPos.x,
                    old_y: currentPos.y,
                    message: `${winner} won the game.`,
                },
            }));
            this.player2.socket.send(JSON.stringify({
                type: "WIN",
                payload: {
                    player: this.player1.socket === socket
                        ? this.player1.id
                        : this.player2.id,
                    cur_x: newPos.x,
                    cur_y: newPos.y,
                    old_x: currentPos.x,
                    old_y: currentPos.y,
                    message: `${winner} won the game.`,
                },
            }));
        }
        // update the board
        this.board[currentPos.x][currentPos.y] = "0";
        this.board[newPos.x][newPos.y] =
            socket === this.player1.socket ? this.player1.id : this.player2.id;
        // send the users the old position, new position as well as the userID who moved
        this.player1.socket.send(JSON.stringify({
            type: messages_1.MOVE,
            payload: {
                player: this.player1.socket === socket
                    ? this.player1.id
                    : this.player2.id,
                cur_x: newPos.x,
                cur_y: newPos.y,
                old_x: currentPos.x,
                old_y: currentPos.y,
            },
        }));
        this.player2.socket.send(JSON.stringify({
            type: messages_1.MOVE,
            payload: {
                player: this.player1.socket === socket
                    ? this.player1.id
                    : this.player2.id,
                cur_x: newPos.x,
                cur_y: newPos.y,
                old_x: currentPos.x,
                old_y: currentPos.y,
            },
        }));
    }
    getPlayerPosition(user) {
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                if (this.board[i][j] === user.id) {
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
    checkWin(pos) {
        return pos.x === this.dest_row && pos.y === this.dest_col;
    }
    getRandomPosition() {
        let x;
        do {
            x = Math.floor(Math.random() * this.row);
        } while (x > this.row);
        let y;
        do {
            y = Math.floor(Math.random() * this.col);
        } while (x > this.row);
        return { x, y };
    }
    getTargetPosition(player1_pos, player2_pos) {
        let x;
        do {
            x = Math.floor(Math.random() * this.row);
        } while (x > this.row && x !== player1_pos.x && x !== player2_pos.x);
        let y;
        do {
            y = Math.floor(Math.random() * this.col);
        } while (y > this.col && y !== player1_pos.y && player2_pos.y);
        return { x, y };
    }
    initializeBoard() {
        for (let i = 0; i < this.row; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.col; j++) {
                this.board[i][j] = "0";
            }
        }
        const player1_pos = this.getRandomPosition();
        const player2_pos = this.getRandomPosition();
        this.board[player1_pos.x][player1_pos.y] = this.player1.id;
        this.board[player2_pos.x][player2_pos.y] = this.player2.id;
        const { x, y } = this.getTargetPosition(player1_pos, player2_pos);
        this.dest_row = x;
        this.dest_col = y;
        this.player1.socket.send(JSON.stringify({
            type: messages_1.ACTIVE,
            payload: {
                board: this.board,
                square_size: 40,
                opponent: {
                    username: this.player2.username,
                    id: this.player2.id,
                },
                target: {
                    x: this.dest_row,
                    y: this.dest_col,
                },
            },
        }));
        this.player2.socket.send(JSON.stringify({
            type: messages_1.ACTIVE,
            payload: {
                board: this.board,
                square_size: 40,
                opponent: {
                    username: this.player1.username,
                    id: this.player1.id,
                },
                target: {
                    x: this.dest_row,
                    y: this.dest_col,
                },
            },
        }));
    }
}
exports.Game = Game;
