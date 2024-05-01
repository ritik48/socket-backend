"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.router = router;
router.get("/", (req, res) => {
    if (req.user) {
        res.json({ user: req.user, success: true });
    }
    else {
        res.status(401).json({ success: false, message: "Not Authenticated" });
    }
});
router.post("/logout", (req, res, next) => {
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
router.get("/login/failed", (req, res) => {
    res.status(401).json({ success: false, message: "Unauthorized" });
});
