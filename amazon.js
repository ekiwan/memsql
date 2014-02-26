#!/usr/bin/env node

// Dependencies
var request = require('request');
var cheerio = require('cheerio');
var query = require('array-query');
var program = require('commander');
// Initialize variables
var $;
var target = 'http://www.amazon.com/s/?field-keywords=';
var queryStr = '';
// Set app options
program
  .option('-s, --sort <field>', 'Sort results by <field> (name, price, or rating)')
  .option('-d, --desc', 'Descending order')
  .option('-a, --asc', 'Ascending order')
  .option('-l, --limit [number]', 'Limit results to [number] (Default/Max: 10)')

// Listen for commands
program
  .command('*')
  .description('Your search query')
  .action(function(query) {
    if (program.sort && program.sort !== 'name' && program.sort !== 'price' && program.sort !== 'rating') {
      return console.error("Invalid sort field provided!");
    }
    fetchSearchResults(target + query.trim());
  })

// Invoke commands with set options
program.parse(process.argv);


function fetchSearchResults(url){
  var results = [];
  // Catch invalid limit or set default if none passed
  if (!program.limit || program.limit > 10) {
    program.limit = 10;
  }
  // Make request
  request(url, function (err, res, body) {
    // Initialize return variables
    var item = {}
    var info = '';
    var i = 1;

    if (!err && res.statusCode === 200) {
      // Build 'jQuery' from body html
      $ = cheerio.load(body);
      while (results.length < program.limit) {
        // Get desired fields
        if(!$('#result_' + i + ' .newaps').text()) {
          i++;
          continue
        } else {
          item.name = $('#result_' + i + ' .newaps').text().trim();
          item.price = $('#result_' + i + ' .bld.lrg.red').first().text().trim().substring(1);
          item.rating = $('#result_' + i + ' .rvw a').attr('alt') || "No Rating";
          if (item.rating != "No Rating" && typeof item.rating !== "undefined") {
            item.numReviews = '(' + ( $('#result_' + i + '  .rvwCnt a').text() ) + ' Reviews)';
          } else { item.numReviews = "No Reviews";}
          item.url = $('#result_' + i + ' .newaps a').attr('href');
          results.push(item);
          item = {};
          i++;
        }
      }
    printSearchResults(results)
    }
  })
}

function printSearchResults(list){
  var retList = list;
  // Sort all fields except price
  if (program.sort && program.sort !== 'price'){
    retList = query().sort(program.sort).on(list);
    if (program.desc) retList = query().sort(program.sort).desc().on(list)
    if (program.asc) retList = query().sort(program.sort).asc().on(list)
  }
  // Price requires numeric sort, so do it separately
  if (program.sort && program.sort === 'price') {
    retList = query().sort(program.sort).numeric().on(list);
    if (program.desc) retList = query().sort(program.sort).numeric().desc().on(list)
  }
  // Print output
  for (var i = 0; i < retList.length; i++) {
    console.log(retList[i].name);
    console.log('$' + retList[i].price);
    console.log(retList[i].rating + ' ' + retList[i].numReviews);
    console.log(retList[i].url + '\n');
  }
}
