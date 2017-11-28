var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new LibrarySchema object
// This is similar to a Sequelize model
var articlesSchema = new Schema({
  // `name` must be of type String
  // `name` must be unique, the default mongoose error message is thrown if a duplicate value is given
  title: {
    type: String
  },
  summary: {
    type: String
  },
  link: {
    type: String
  }
  // `comments` is an array that stores ObjectIds
  // The ref property links these ObjectIds to the comments model
  // This allows us to populate the article with any associated comments
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "comments"
    }
  ]
});

// This creates our model from the above schema, using mongoose's model method
var articles = mongoose.model("articles", articlesSchema);

// Export the Library model
module.exports = articles;
