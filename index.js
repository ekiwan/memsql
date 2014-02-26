#!/usr/bin/env node

// Dependencies
var request = require('request');
var cheerio = require('cheerio');
var program = require('commander');
// Initialize variables
var $;
var target = 'http://www.amazon.com/s/?field-keywords=';
var query = 'hat';

// Build query
target += query;

program
  .option('-s, --sort<field>', 'Sort results by <field>')
  .option('-d, --desc', 'Descending order')
  .option('-a, --asc', 'Ascending order')

// Make request
request(target, function (err, res, body) {
  // Initialize return variables
  var name;
  var price;
  var rating;
  var numReviews;
  var url;
  var info = '';

  if (!err && res.statusCode === 200) {
    // Build 'jQuery' from body html
    $ = cheerio.load(body);

    for (var i = 1; i <= 10; i++) {
      // Get desired fields
      name = $('#result_' + i + ' .newaps').text().trim();
      price = $('#result_' + i + ' .bld.lrg.red').text().trim();
      rating = $('#result_' + i + ' .rvw a').attr('alt');
      numReviews = '(' + ( $('#result_' + i + '  .rvwCnt a').text() ) + ' Reviews)';
      url = $('#result_' + i + ' .newaps a').attr('href');
      //Build return string
      info += name + '\n' + price + '\n' + rating + numReviews + '\n' + url + '\n';
      console.log(info);
      info = '';
    }


  }
})
