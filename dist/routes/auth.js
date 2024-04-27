"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
exports.router = router;
const SUCCESS_REDIRECT = process.env.SUCCESS_REDIRECT || "http://localhost:5173/game";
console.log(SUCCESS_REDIRECT);
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["email", "profile"],
    prompt: "select_account",
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    successRedirect: SUCCESS_REDIRECT,
    failureRedirect: "/login/failed",
}));
