(function () {
  var one_day = 1000*60*60*24,
      minPrice = 10000000;

  $(document).ready(function() {
    $( "#beginDate" ).datepicker();
    $( "#endDate" ).datepicker();

    $('#submitItinerary').click(function() {
      var startDate = getDateFromString($('#beginDate').val()),
          endDate = getDateFromString($('#endDate').val()),
          days = getDays(startDate, endDate),
          departureDates = [],
          returnDates = [];

      minPrice = 10000000;
      $("#pricesGrid").empty();

      departureDates.push(startDate);
      var currentDate = addDays(startDate, 1),
          thead = "<thead><th>Departure/Return</th>";

      for (var i = 0; i < days - 1; i++) {
        departureDates.push(currentDate);
        returnDates.push(currentDate);
        thead += "<th>" + formatDate(currentDate) + "</th>";
        currentDate = addDays(currentDate, 1);
      }
      returnDates.push(currentDate);
      thead += "<th>" + formatDate(currentDate) + "</th></thead>";

      var rows = "";

      for (var r = 0; r < departureDates.length; r++) {
        var row = "<tr>",
            departureDate = departureDates[r];
        
        row += "<td>" + formatDate(departureDate) + "</td>";

        for (var c = 0; c < returnDates.length; c++) {
          var returnDate = returnDates[c],
              id = "r" + r + "c" + c;

          row += "<td id=" + id + ">";
          if (c >= r) {
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
      type: "GET",
      url: "/flights",
      data: getApiFormData(departureDate, returnDate),
      success: function(data) {
        var prices = _.map(data.itins, function(e) { return e.price; });
        updatePrice("#" + id, _.min(prices));
      },
      error: function(error, message) {
        $("#" + id).text("X");
        window.console.log(error);
      }
    });
  }

  function updatePrice(id, price) {
    if (price < minPrice) {
      minPrice = price;
      $('.best').removeClass('best');
    }
    if (price <= minPrice) {
      $(id).addClass('best');
    }
    $(id).text(price);
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

    return "data=" + airports + '%2c' + dates;
  }
})();