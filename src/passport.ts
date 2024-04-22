import passport from "passport";
import passportGoogle from "passport-google-oauth20";
const GoogleStrategy = passportGoogle.Strategy;

import { User } from "./models/User";

const passportInit = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.CLIENT_ID as string,
                clientSecret: process.env.CLIENT_SECRET as string,
                callbackURL: process.env.GOOGLE_REDIRECT_URI,
            },
            async function (
                request: any,
                accessToken: any,
                refreshToken: any,
                profile: any,
                done: any
            ) {
                let user = await User.findOne({
                    email: profile.emails[0].value,
                });

                if (!user) {
                    user = await User.create({
                        email: profile.emails[0].value,
                        name: profile.displayName,
                    });
                }
                return done(null, {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                });
            }
        )
    );
    passport.serializeUser(function (user: any, cb) {
        process.nextTick(function () {
            return cb(null, {
                name: user.name,
                email: user.email,
            });
        });
    });

    passport.deserializeUser(function (user: any, cb) {
        process.nextTick(function () {
            return cb(null, user);
        });
    });
};

export { passportInit };
