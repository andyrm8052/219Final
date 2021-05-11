/**
 * Required External Modules
 */

const express = require('express');
const path = require("path");

const app = express();

const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

require("dotenv").config();
const authRouter = require("./auth");

const citiesRoutes = require('./routes/cities.routes');
const request = require("request");


const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const accessTokenSecret = 'youraccesstokensecret';

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


// Creating custom middleware with Express
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    if (req.user) {
        if (typeof (res._headers.authorization) === "undefined") {
            const accessToken = jwt.sign(req.user._json, accessTokenSecret, {expiresIn: '10m'});
            res.setHeader('Authorized', 'Bearer ' + accessToken);
        }
    }else if (!req.user){
        try {
            res.setHeader('Authorizeed', ' ');
        }catch{}
    }
    next();
});


const authenticateJWT = (req, res, next) => {
    if (req.user) {
        const authHeader = res._headers.authorization;
        console.log(authHeader);
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, accessTokenSecret, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }
                req.user = user;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    } else {
        console.log("Incorrect Token");
        req.session.returnTo = req.originalUrl;
        res.redirect("/login");
    }
};


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



/**
 * Routes Definitions
 */
// Router mounting
app.use("/", authRouter);


// Defined routes
const secured = (req, res, next) => {
    if (req.user) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
};

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



// This route is not needed authentication
app.get('/citiesTable', authenticateJWT, (req, res, next) => {
    request("http://localhost:8000/api/v1/cities", (err, response, body) => {
        if (err || response.statusCode !== 200) {
            return res.sendStatus(500);
        }
        res.render('citiesTable', { title : 'Home', cities : JSON.parse(body).data });
        next();
    });
});

app.get('/form', authenticateJWT, (req, res) => {
    res.render("form", { title: "Search" });
});

app.get('/add', authenticateJWT, (req, res) => {
    res.render("form", { title: "Search" });
});

app.get('/edit', authenticateJWT, (req, res) => {
    res.render("form", { title: "Search" });
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
