const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

var PORT = 3000;

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
//Handlbars connection
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// Main route (Show home page)
app.get("/", function(req, res) {
    db.Article.find({saved:false}, function(err, data) {

    res.render("./home", {data:data});
  });

});
// GET Route (Show saved page)
app.get("/saved", function(req, res) {
    db.Article.find({saved:true}, function(err, data) {

    res.render("./saved", {data:data});

  });
});

// A GET route for scraping bored panda website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.boredpanda.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      const $ = cheerio.load(response.data);
      // Now, we grab every h2 within an article tag, and do the following:
      $("article").each(function(i, element) {
        // Save an empty result object
        const results = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        results.title = $(element).find("h2 a").text();
        results.summary = $(element).find("p.visible-downto-xs").text();
        results.link = $(element).find("h2 a").attr("href");

        // Create a new Article using the `result` object built from scraping
        db.Article.create(results)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
      
      // Send a message to the client
      res.send("Scrape Complete");
    });
  });

//Route for clearing all articles from the db
app.put("/clear", function(req, res) {
    db.Article.deleteMany({})
        .then(function(dbArticle){
           res.render("home", {data: dbArticle})
        })
        .catch(function(err) {
            res.json(err);
        })
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
// Save an article
app.post("/articles/save/:id", function(req, res) {
    // Use the article id to find and update its saved boolean
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true})
    // Execute the above query
    .then(function(dbArticle) {

        res.json(dbArticle);
    }).catch(function(err) {

        res.json(err);
    })
});

// Remove an article
app.post("/articles/remove/:id", function(req, res) {
    // Use the article id to find and update its saved boolean
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false})
    // Execute the above query
    .then(function(dbArticle) {

        res.json(dbArticle);
    }).catch(function(err) {

        res.json(err);
    })
});

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  