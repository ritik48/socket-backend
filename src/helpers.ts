import { CookieOptions, Session } from "express-session";

let cookieOptions: CookieOptions;

if (process.env.NODE_ENV !== "development") {
    cookieOptions = {
        secure: true,
        sameSite: "none",
        httpOnly: true,
    };
} else {
    cookieOptions = {
        secure: false,
        httpOnly: true,
    };
}

export { cookieOptions };
