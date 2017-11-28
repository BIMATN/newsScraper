// Students: Using this template, the cheerio documentation,
// and what you've learned in class so far, scrape a website
// of your choice, save information from the page in a result array, and log it to the console.

const cheerio = require("cheerio"),
      request = require("request");
      customHeaderRequest = request.defaults({
          headers: {'User-Agent': 'Chrome/62.0.3202.94'}
      });
// Make a request call to grab the HTML body from the site of your choice using our custom header to trick site into thinking we are a browser
customHeaderRequest.get("https://www.reuters.com/news/world", function(error, response, html) {

  // Load the HTML into cheerio and save it to a const
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  const $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  const results = [];

  // Select each element in the HTML body from which you want information.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors,
  // but be sure to visit the package's npm page to see how it works
  $(".feature", "#moreSectionNews").each(function(i, elem) {

    const link = $(elem).children("h2").children().attr("href"),
          title = $(elem).children("h2").text().trim(),
          synop = $(elem).children("p").text().trim();

    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      link: link,
      synop: synop
    });
  });

  // Log the results once you've looped through each of the elements found with cheerio
  console.log(results);
});
