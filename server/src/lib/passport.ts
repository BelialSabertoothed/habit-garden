import passport from "passport";
import { Strategy as GoogleStrategy, type Profile } from "passport-google-oauth20";
import type { VerifyCallback } from "passport-oauth2";
import { User } from "../models/User.js";

export function initPassport() {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

  if (!CLIENT_ID || !CLIENT_SECRET || !CALLBACK_URL) {
    console.warn("⚠️ Google OAuth not configured — skipping Google strategy");
    return passport; // vrátíme instanci bez Google strategie
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const googleId = profile.id;

          let user = await User.findOne({ googleId });
          if (!user && email) user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              email,
              googleId,
              provider: "google",
              verified: true,
              nickname: profile.displayName,
              lastLoginAt: new Date(),
            });
          } else {
            user.googleId ||= googleId;
            user.provider = user.provider || "google";
            user.verified = true;
            user.lastLoginAt = new Date();
            await user.save();
          }

          return done(null, { id: user._id.toString() });
        } catch (e) {
          return done(e as Error);
        }
      }
    )
  );

  return passport;
}

export default passport;
