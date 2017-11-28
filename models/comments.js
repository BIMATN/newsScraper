var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new LibrarySchema object
// This is similar to a Sequelize model
var commentsSchema = new Schema({
  // `name` must be of type String
  // `name` must be unique, the default mongoose error message is thrown if a duplicate value is given
  comment: {
    type: String
  },
  // `users` is an array that stores ObjectIds
  // The ref property links these ObjectIds to the users model
  // This allows us to populate the comments with any associated users
  user:    {
      type: Schema.Types.ObjectId,
      ref: "users"
  }
});

// This creates our model from the above schema, using mongoose's model method
var comments = mongoose.model("comments", commentsSchema);

// Export the Library model
module.exports = comments;
