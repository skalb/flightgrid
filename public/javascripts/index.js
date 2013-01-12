(function () {
  var one_day = 1000*60*60*24;

  $(document).ready(function() {
    $( "#beginDate" ).datepicker();
    $( "#endDate" ).datepicker();

    $('#submitItinerary').click(function() {
      var startDate = getDateFromString($('#beginDate').val()),
          endDate = getDateFromString($('#endDate').val()),
          days = getDays(startDate, endDate);

      $("#pricesGrid").empty();

      var thead = "<thead><th>Departure/Arrival</th>";
      var rows = "";

      for (var i = 1; i < days + 1; i++) {
        var departureDate = addDays(startDate, i - 1);

        thead += "<th>" + formatDate(departureDate) + "</th>";

        var row = "<tr>";
        for (var j = 0; j < days; j++) {
          var returnDate = addDays(startDate, i);
          if (j === 0) {
            row += "<td>" + formatDate(returnDate) + "</td>";
          }
          id = "r" + i + "c" + j;
          row += "<td id=" + id + ">";
          if (i > j) {
            row += "...";
            callApi(id, departureDate, returnDate);
          }
          row += "</td>";
        }
        row += "</tr>";
        rows += row;
      }

      $("#pricesGrid").append(thead);
      $("#pricesGrid").append(rows);
    });
  });

  function callApi(id, departureDate, returnDate) {
    $.ajax({
      type: "POST",
      url: "http://www.hipmunk.com/api/results",
      data: getApiFormData(departureDate, returnDate),
      success: function(data) {
        var jsonData = JSON.parse(data);

        var prices = _.map(jsonData["itins"], function(e) { return e["price"]; });

        $("#" + id).text(_.min(prices));
      },
      error: function(error, message) {
        $("#" + id).text("X");
        window.console.log(error);
      }
    });
  }

  function formatDate(date) {
    return $.datepicker.formatDate('yy-mm-dd', date);
  }

  function formatApiDate(date) {
    return $.datepicker.formatDate('Mdd', date);
  }

  function getDateFromString(date) {
    return new Date(Date.parse(date.replace(/-/g, " ")));
  }

  function getDays(startDate, endDate) {
    return Math.ceil((endDate.getTime() - startDate.getTime())/(one_day));
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * one_day);
  }

  function getApiFormData(departureDate, returnDate) {
    var origin = $('#origin').val(),
        destination = $('#destination').val(),
        airports = origin + '.' + destination,
        dates = formatApiDate(departureDate) + "." + formatApiDate(returnDate);

    return 'i=' + airports + '%2c' + dates + "&revision=1.25";
  }
})();