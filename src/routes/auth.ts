import { Router, Request, Response } from "express";
import passport from "passport";

const router = Router();

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
        successRedirect: "http://localhost:5173/game",
        failureRedirect: "/login/failed",
    })
);

export { router };
