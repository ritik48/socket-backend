"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = void 0;
let cookieOptions;
if (process.env.NODE_ENV !== "development") {
    exports.cookieOptions = cookieOptions = {
        secure: true,
        sameSite: "none",
        httpOnly: true,
    };
}
else {
    exports.cookieOptions = cookieOptions = {
        secure: false,
        httpOnly: true,
    };
}
