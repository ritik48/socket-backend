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
        failureRedirect: "/login/failed",
    }),
    (req, res) => {
        console.log("inside callback = ", req.user);
        res.redirect(SUCCESS_REDIRECT);
    }
);

export { router };
