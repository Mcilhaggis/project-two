// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const zomato = require("../api/zomato");
const amadeus = require("../api/amadeus");


module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the search page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
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
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
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

  // Get Activities from Amadeus API
  app.get("/api/activity", (req, res) => {

    //Get geo-location
    amadeus.getActivity(req.query.city).then(function(geocode) {
      // Get amadeus token
      amadeus.getTokenActivities().then(function(token) {
        // Get amadeus Activities 
        amadeus.getActivityResult(token, geocode).then(function(activities) {
          
          res.send(activities.data.slice(0, 3));
          // slice to get top 3
          // res = activities.data.slice(0, 3);
        });
      });
    });
  });




// Call Api function from Class 'zomato'
app.get("/api/restaurants", (req, res) => {
  zomato.getZomatoRestaurant(req.query.city).then(function(result) {
    // a = result.restaurants.map((o) => o.restaurant.name)
    // url = result.restaurants.map((o) => o.restaurant.url)
    // add = result.restaurants.map((o) => o.restaurant.location)
    // menu = result.restaurants.map((o) => o.restaurant.menu_url)

    
    // res.send(a + url  + menu);
    res.send(result.restaurants);
    
 });
});

};
