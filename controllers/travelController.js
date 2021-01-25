const express = require("express");

const router = express.Router();

const db = require("../models/");

const path = require("path");

const isAuthenticated = require("../config/middleware/isAuthenticated");

const passport = require("../config/passport");

// Requiring our models and passport as we've configured it
const zomato = require("../controllers/zomato");
const amadeus = require("../controllers/amadeus");

//HTML ROUTES

router.get("/", (req, res) => {
    // If the user already has an account send them to the search page
    if (req.user) {
        res.redirect("/search");
    }
    // res.sendFile(path.join(__dirname, "../public/signup.html"));
    res.render("signup");
});

router.get("/login", (req, res) => {
    // If the user already has an account send them to the search page
    if (req.user) {
        res.redirect("/search");
    }
    // res.sendFile(path.join(__dirname, "../public/login.html"));
    res.render("login");
});

// Here we've add our isAuthenticated middleware to this route.
// If a user who is not logged in tries to access this route they will be redirected to the signup page
router.get("/search", isAuthenticated, (req, res) => {
    // res.sendFile(path.join(__dirname, "../public/search.html"));
    res.render("search");
});

// Here we've add our isAuthenticated middleware to this route.
// If a user who is not logged in tries to access this route they will be redirected to the signup page
router.get("/result", isAuthenticated, (req, res) => {
    // res.sendFile(path.join(__dirname, "../public/result.html"));
    res.render("result");
});

//SIGNUP & LOGIN API ROUTES

// Using the passport.authenticate middleware with our local strategy.
// If the user has valid login credentials, send them to the search page.
// Otherwise the user will be sent an error
router.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
});

// Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
// how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
// otherwise send back an error
router.post("/api/signup", (req, res) => {
    db.User.create({
            email: req.body.email,
            password: req.body.password,
        })
        .then(() => {
            res.redirect(307, "/api/login");
        })
        .catch((err) => {
            res.status(401).json(err);
        });
});

// Route for logging user out
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// Route for getting some data about our user to be used client side
router.get("/api/user_data", (req, res) => {
    if (!req.user) {
        // The user is not logged in, send back an empty object
        res.json({});
    } else {
        // Otherwise send back the user's email and id
        // Sending back a password, even a hashed password, isn't a good idea
        res.json({
            email: req.user.email,
            id: req.user.id,
        });
    }
});

//ITINERARY API ROUTES

//Route for export
// GET route for getting all of the saved itenrary items
router.get("/api/itinerary", (req, res) => {
    // findAll returns all entries for a table when used with no options
    db.Itinerary.findAll({
        where: {
            memberID: "test", // not test but equal to the users ID from login
        },
    }).then((result) => res.json(result));
});

// POST route for saving a new itinerary item
router.post("/api/itinerary", (req, res) => {
    console.log(req.body);
    // Create takes an argument of an object describing the item we want to
    // Insert into our table. We pass in an object with a text and complete property.
    db.Itinerary.create({
        memberId: req.user.id, //this may come from a different place than the rest - referring to the user that is currently logged in
        activityId: "test",
        activityImageURL: "test",
        activityName: "test",
        activityDescription: "test",
        restaurantName: "test",
        restaurantDescription: "test",
        restaurantPhoto: "test",
        restaurantLocation: "test",
        menuURL: "test",
        userRating: "test",
    }).then((result) => res.json(result)); // result may not be the right name for
});
// Deleting a previously saved item
router.delete("/api/itinerary/:activityId", (req, res) => {
    // We just have to specify which itinerary item we want to destroy with "where"
    db.Itinerary.destroy({
        where: {
            id: req.params.activityId, // we get this value from a click on a button of the item it's attached to
        },
    }).then((result) => res.json(result));
});

// Call Api function from Class 'zomato'
router.get("/api/restaurants", (req, res) => {
    zomato.getZomatoCityId(req.query.city).then(function(cityId) {
        zomato.getZomatoRestaurant(cityId).then((result) => {
            let allRestaurnt = {
                restaurants: result.restaurants.map((o) => [
                    (restaurant = {
                        name: o.restaurant.name,
                        url: o.restaurant.url,
                        address: o.restaurant.location.address,
                        rating: o.restaurant.all_reviews.rating,
                        review: o.restaurant.all_reviews.review_text,
                        menu: o.restaurant.menu_url,
                        phone: o.restaurant.phone_numbers,
                        photos: o.restaurant.featured_image,
                    }),
                ]),
            };

            // ==== TESTING ON result.js ====
            // console.log(allRestaurnt.restaurants);
            res.json(allRestaurnt);

            // // ==== PREPARED FOR HANDLE_BAR=====
            // res.render('search', {allRestaurnt});
        });
    });
});

// Get Activities from Amadeus API
router.get("/api/activity", (req, res) => {
    //Get geo-location
    amadeus.getActivity(req.query.city).then(function(geocode) {
        // Get amadeus token
        amadeus.getTokenActivities().then(function(token) {
            // Get amadeus Activities
            amadeus.getActivityResult(token, geocode).then(function(activities) {
                let act = activities.data.slice(0, 3);
                // console.log(act);
                let allActivities = {
                    activities: act.map((o) => [
                        (Activity = {
                            name: o.name,
                            description: o.shortDescription,
                            rating: o.rating,
                            price: o.price.amount,
                            photo: o.pictures[0],
                            website: o.bookingLink
                        }),
                    ]),
                };
                // console.log(allActivities);
                //For Testing
                res.send(allActivities);

                // // ==== PREPARED FOR HANDLEBARS=====
                // res.render('result', {allActivities});
            });
        });
    });
});

// Export routes for server.js to use.
module.exports = router;