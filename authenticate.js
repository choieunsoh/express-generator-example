const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Users = require("./models/users");

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

require("dotenv").config();
const { SECRET_KEY } = process.env;

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
