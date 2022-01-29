const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Users = require("./models/users");

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

const FacebookTokenStrategy = require("passport-facebook-token");

require("dotenv").config();
const { SECRET_KEY, FB_CLIENT_ID, FB_CLIENT_SECRET } = process.env;

exports.local = passport.use(new LocalStrategy(Users.authenticate()));

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

exports.getToken = (user) => jwt.sign(user, SECRET_KEY, { expiresIn: 60 * 60 });

exports.jwtPassport = passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: SECRET_KEY,
    },
    (jwt_playload, done) => {
      console.log("JWT Playload: ", jwt_playload);
      Users.findOne({ _id: jwt_playload._id })
        .then((user) => (user ? done(null, user) : done(null, false)))
        .catch((err) => done(err, false));
    }
  )
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = (req, res, next) => {
  if (req.user?.admin) {
    next();
  } else {
    let err = new Error("You are not admin!");
    err.status = 403;
    return next(err);
  }
};

exports.facebookPassport = passport.use(
  new FacebookTokenStrategy(
    {
      clientID: FB_CLIENT_ID,
      clientSecret: FB_CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("accessToken:\", accessToken);
      console.log("refreshToken:\n", refreshToken);
      console.log("profile:\n", profile);
      Users.findOne({ facebookId: profile.id })
        .then(
          (user) => {
            if (user !== null) {
              return done(null, user);
            } else {
              user = new Users({ username: profile.displayName });
              user.facebookId = profile.id;
              user.firstName = profile.name.givenName;
              user.lastName = profile.name.familyName;
              user
                .save()
                .then(
                  (user) => {
                    if (user !== null) {
                      return done(null, user);
                    } else {
                      return done("Error", false);
                    }
                  },
                  (err) => done(err, false)
                )
                .catch((err) => done(err, false));
            }
          },
          (err) => done(err, false)
        )
        .catch((err) => done(err, false));
    }
  )
);
