"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passportInit = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = __importDefault(require("passport-google-oauth20"));
const GoogleStrategy = passport_google_oauth20_1.default.Strategy;
const User_1 = require("./models/User");
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/auth/google/callback";
const passportInit = () => {
    passport_1.default.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: GOOGLE_REDIRECT_URI,
    }, function (request, accessToken, refreshToken, profile, done) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield User_1.User.findOne({
                email: profile.emails[0].value,
            });
            console.log("user = ", user);
            if (!user) {
                user = yield User_1.User.create({
                    email: profile.emails[0].value,
                    name: profile.displayName,
                });
            }
            return done(null, {
                name: profile.displayName,
                email: profile.emails[0].value,
            });
        });
    }));
    passport_1.default.serializeUser(function (user, cb) {
        process.nextTick(function () {
            return cb(null, {
                name: user.name,
                email: user.email,
            });
        });
    });
    passport_1.default.deserializeUser(function (user, cb) {
        process.nextTick(function () {
            return cb(null, user);
        });
    });
};
exports.passportInit = passportInit;
