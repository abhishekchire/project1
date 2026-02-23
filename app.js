if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
console.log(process.env.secret);
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/expressError.js');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const Listing = require('./models/listing.js');


//routers files
const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const UserRouter = require('./routes/user.js');

const wrapAsync = require('./utils/wrapAsync.js');
const { title } = require('process');

const MONGO_URL = process.env.ATLASDB_URL;

main().then(() => {
    console.log('connected to db');

}).catch((err) => {
    console.log(err);

})
async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
        secret: process.env.SESSION_SECRET
    },
    touchAfter: 24 * 3600,
});

store.on("error", (e) => {
    console.log("Session store error:", e);
});
const sessionOptions = {
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

app.get("/listings", async (req, res) => {
    let search = req.query.search?.trim();
    let allListings;
    if (search) {
        allListings = await Listing.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }
res.render("listings/index", { allListings,search });
});


app.get("/listings/contactus", async (req, res) => {
    res.render("filters/contactus");
})

app.get("/listings/aboutUs", async (req, res) => {
    res.render("filters/aboutUs.ejs")
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", UserRouter);


app.use((err, req, res, next) => {
    let { statusCode = 404, message = "something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
})

app.listen(8080, () => {
    console.log(`server is listening on port 8080`);

})