var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
const cheerio = require("cheerio"),
      request = require("request");
var PORT = 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database    
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// When the server starts, create and save a new Library document to the db
// The "unique" rule in the Library model's schema will prevent duplicate libraries from being added to the server
/*db.Library
  .create({ name: "Campus Library" })
  .then(function(dbLibrary) {
    // If saved successfully, print the new Library document to the console
    console.log(dbLibrary);
  })
  .catch(function(err) {
    // If an error occurs, print it to the console
    console.log(err.message);
  });*/

// Routes

// GET route for homepage
app.get("/", function(req, res){
  res.render("index");
});

// Route for getting all books from the db
app.get("/scraped", function(req, res) {
  // Make a request call to grab the HTML body from the site
  request.get("https://www.reuters.com/news/world", function(error, response, html) {
    // Load the HTML into cheerio and save it to a const
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    const $ = cheerio.load(html);
    // An empty array to save the data that we'll scrape
    const results = [];
    // Select each element in the HTML body from which you want information.
    $(".feature", "#moreSectionNews").each(function(i, elem) {
      const link = $(elem).children("h2").children().attr("href"),
            title = $(elem).children("h2").text().trim(),
            summary = $(elem).children("p").text().trim();
      // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        title: title,
        link: link,
        summary: summary
      });
      db.articles
        .find({title: title})
        .then(function(exists){
          if(exists.length==0){
            // Using our articles model, we create an article document
            db.articles
              .create({
                title: title,
                summary: summary,
                link: link
              })
          }
        })
    });
    db.articles
      .find({})
      .then(function(articles){
        res.render("scraped", {articles});
      })
    // Log the results you've found with cheerio
    console.log(results);
  });
});

// POST route for saving a new comment to the db and associating it with an article
app.post("/submitComment", function(req, res) {
  // Create a new comment in the database
  db.comments
    .create(req.body)
    .then(function(comment) {
      // If a Book was created successfully, find one library (there's only one) and push the new Book's _id to the Library's `books` array
      // { new: true } tells the query that we want it to return the updated Library -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.articles.findAndUpdate({/*comment.articleId*/}, { $push: { comments: comment._id } }, { new: true });
    })
    .then(function(articleComments) {
      // If the Library was updated successfully, send it back to the client
      res.json(articleComments);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route for getting all libraries from the db
app.get("/library", function(req, res) {
  // Using our Library model, "find" every library in our db
  db.Library
    .find({})
    .then(function(dbLibrary) {
      // If any Libraries are found, send them to the client
      res.json(dbLibrary);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route to see what library looks like WITH populating
app.get("/populated", function(req, res) {
  // Using our Library model, "find" every library in our db and populate them with any associated books
  db.Library
    .find({})
    // Specify that we want to populate the retrieved libraries with any associated books
    .populate("books")
    .then(function(dbLibrary) {
      // If any Libraries are found, send them to the client with any associated Books
      res.json(dbLibrary);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
