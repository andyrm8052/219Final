/**
 * Required External Modules
 */

const express = require('express');
const path = require("path");

//const open = require('open');
const bodyParser = require('body-parser');
//const cors = require('cors');
const app = express();

const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

require("dotenv").config();
const authRouter = require("./auth");

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(bodyParser.json());

//app.use(cors())

const citiesRoutes = require('./routes/cities.routes');
// using as middleware

/**
 * App Variables
 */
const port = process.env.PORT || "3000";


/**
 * Session Configuration
 */
const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};

if (app.get("env") === "production") {
    // Serve secure cookies, requires HTTPS
    session.cookie.secure = true;
}


/**
 * Passport Configuration
 */
const strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
        /**
         * Access tokens are used to authorize users to an API
         * (resource server)
         * accessToken is the token to call the Auth0 API
         * or a secured third-party API
         * extraParams.id_token has the JSON Web Token
         * profile has all the information from the user
         */
        return done(null, profile);
    }
);



/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.use(expressSession(session));

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Creating custom middleware with Express
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

/**
 * Routes Definitions
 */
// Router mounting
app.use("/", authRouter);

const secured = (req, res, next) => {
    if (req.user) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
};

// Defined routes
app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

app.get("/user", secured, (req, res) => {
    const { _raw, _json, ...userProfile } = req.user;
    res.render("user", {
        title: "Profile",
        userProfile: userProfile
    });
});

app.get("/cities", (req, res) => {
    res.render("cities");
});

// This route is not needed authentication
app.get('/api/public', (req, res) => {
    res.json({
        message: 'Hello from a public endpoint! Authentication is not needed to see this.',
    });
});

app.set('port', process.env.PORT || 8000);
app.use('/api/v1/cities', citiesRoutes);
app.set('ip', process.env.NODEJS_IP || '127.0.0.1');

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

app.use(express.static('docs'));
app.listen(app.get('port'), () => {
    //console.log('%s: Node server started', app.get('port'));
});
