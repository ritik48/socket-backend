import { Router, Request, Response } from "express";
import passport from "passport";

const router = Router();

const SUCCESS_REDIRECT =
    process.env.SUCCESS_REDIRECT || "http://localhost:5173/game";

console.log(SUCCESS_REDIRECT);

router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["email", "profile"],
        prompt: "select_account",
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: SUCCESS_REDIRECT,
        failureRedirect: "/login/failed",
    })
);

export { router };
