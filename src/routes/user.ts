import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    console.log("req user = ", req.user);
    if (req.user) {
        res.json({ user: req.user, success: true });
    } else {
        res.status(401).json({ success: false, message: "Not Authenticated" });
    }
});

router.post("/logout", (req: Request, res: Response, next) => {
    if (!req.user) {
        return res.status(400).json({
            success: false,
            message: "Invalid request to logout",
        });
    }
    req.logout(function (err) {
        if (err) {
            return res
                .status(401)
                .json({ success: false, message: "Error while logging out" });
        }
        res.status(200).json({ success: true, message: "User logged out" });
    });
});

router.get("/login/failed", (req: Request, res: Response) => {
    res.status(401).json({ success: false, message: "Unauthorized" });
});

export { router };
