var $ = require('jquery'),
    _ = require('underscore'),
    fs = require('fs'),
    ac = require('autocomplete'),
    oneDay = 1000*60*60*24;

function addDays(date, days) {
    return new Date(date.getTime() + days * oneDay);
}

function formatDate(date) {
  var curr_date = date.getDate(),
      curr_month = date.getMonth() + 1,
      curr_year = date.getFullYear();
  
  return curr_month + "-" + curr_date + "-" + curr_year;
}

function getDates() {
  var dates = [],
      today = new Date();

  dates.push(formatDate(today));
  dates.push(formatDate(addDays(today, 3)));
  dates.push(formatDate(addDays(today, 7)));
  dates.push(formatDate(addDays(today, 10)));

  return dates;
}

exports.page = function(req, res) {
  res.render('index', { layout: 'layout', title: 'Flight Grid', dates: getDates() });
};

exports.flights = function(req, res) {
  var data = "i=" + req.query["data"] + "&revision=1.25";
  $.ajax({
    type: "POST",
    url: "http://www.hipmunk.com/api/results",
    data: data,
    success: function(data) {
      res.contentType('json');
      res.send(data);
    },
    error: function(error, message) {
      res.contentType('json');
      res.send("error:" + message);
    }
  });
};

var namesAC = ac.connectAutocomplete(),
    airportNames = {},
    airportCodes = {};

fs.readFile('data/airport-codes.csv', function(err, data) {
  var airports = [];

  _.each(data.toString().split('\n'), function(a) {
    var parts = a.trim().split("|"),
        airportName = parts[0],
        airportNameLower = airportName.toLowerCase(),
        airportCode = parts[1];
        airportCodeLower = airportCode.toLowerCase(),
        fullName = airportCode + " - " + airportName;

    airportNames[airportNameLower] = fullName;
    airportCodes[airportCodeLower] = fullName;

    airports.push(airportNameLower);
    airports.push(airportCodeLower);
  });

  namesAC.initialize(function(onReady) {
    onReady(airports);
  });
});

exports.airports = function(req, res) {
  var airport = req.query["term"].toLowerCase(),
      results = namesAC.search(airport);

  var airportResults = _.map(results, function(a) {
    return airportNames[a] || airportCodes[a];
  });

  res.send(airportResults);
}