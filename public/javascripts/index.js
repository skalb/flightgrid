(function () {
  var oneDay = 1000*60*60*24,
      minPrice = 10000000,
      maxPrice = 0,
      termTemplate = "<span class='ui-autocomplete-term'>$1</span>";

  $(document).ready(function() {
    var $departStartDate = $( "#departStartDate" ),
        $departEndDate = $( "#departEndDate" ),
        $returnStartDate = $( "#returnStartDate" ),
        $returnEndDate = $( "#returnEndDate" );

    _.each([$departStartDate, $departEndDate, $returnStartDate, $returnEndDate], function(e) {
      e.datepicker();
    });

    $('#submitItinerary').click(function() {
      var departureDates = getDates($departStartDate, $departEndDate),
          returnDates = getDates($returnStartDate, $returnEndDate);

      minPrice = 10000000;
      maxPrice = 0;
      $("#pricesGrid").empty();
      $("#pricesGrid").append(getTableHeader(returnDates));
      $("#pricesGrid").append(getRows(departureDates, returnDates));
    });

    $("#origin, #destination").autocomplete({
      source: "/airports",
      minLength: 2,
      open: function(e,ui) {
            var acData = $(this).data('autocomplete');
            acData
                .menu
                .element
                .find('a')
                .each(function() {
                    var me = $(this);
                    var regex = new RegExp( '(' + acData.term + ')', 'gi' );
                    me.html( me.text().replace(regex, termTemplate) );
                });
        }
    });
  });

  function getRows(departureDates, returnDates) {
    var rows = "";

    for (var r = 0; r < departureDates.length; r++) {
      var departureDate = departureDates[r],
          row = "<tr><td class='date'>" + formatDate(departureDate) + "</td>";

      for (var c = 0; c < returnDates.length; c++) {
        var returnDate = returnDates[c],
            id = "r" + r + "c" + c;

        row += "<td id=" + id + ">";
        if (returnDate.getTime() > departureDate.getTime()) {
          row += "...";
          callApi(id, departureDate, returnDate);
        }
        row += "</td>";
      }
     row += "</tr>";
     rows += row;
    }

    return rows;
  }

  function getTableHeader(returnDates) {
    var thead = "<thead><th>Departure/Return</th>";

    _.each(returnDates, function(d) {
      thead += "<th>" + formatDate(d) + "</th>";
    });
    
    return thead + "</thead>";
  }

  function getDates(startDateSelector, endDateSelector) {
    var dates = [],
        startDate = getDateFromString(startDateSelector.val()),
        endDate = getDateFromString(endDateSelector.val()),
        days = getDays(startDate, endDate),
        currentDate = startDate;

    for (var i = 0; i <= days; i++) {
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  }

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

  function applyHeatMap() {
    var counts = [],
        sum = 0;

    $('#pricesGrid tbody td').not('.date').each(function() {
        var value = parseInt($(this).text(), 10);
        if (!isNaN(value)) {
          counts.push(value);
          sum += value;
        }
    }).get();
   
    // return max value
    var max = _.max(counts),
        average = sum / counts.length;
     
    // add classes to cells based on nearest 10 value
    $('#pricesGrid tbody td').not('.date').each(function(){
      var value = parseInt($(this).text(), 10);
      if (!isNaN(value)) {
        if (value < average) {
          var pos = parseInt(Math.round((value/average)*100), 10).toFixed(0);
          var relative = parseInt(pos / 100.0 * 225, 10).toFixed(0);
          clr = 'rgb('+relative+','+255+','+relative+')';
          $(this).css({backgroundColor:clr});
        }
        else {
          var pos2 = parseInt(100 - Math.round(((value-average)/(max-average))*100), 10).toFixed(0);
          var relative2 = parseInt(pos2 / 100.0 * 225, 10).toFixed(0);
          clr = 'rgb('+255+','+relative2+','+relative2+')';
          $(this).css({backgroundColor:clr});
        }
      }
    });
  }

  function updatePrice(id, price) {
    $(id).text(price);
    applyHeatMap();
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
    return Math.ceil((endDate.getTime() - startDate.getTime())/(oneDay));
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * oneDay);
  }

  function getAirportCode(id) {
    return $("#" + id).val().split(" - ")[0];
  }

  function getApiFormData(departureDate, returnDate) {
    var origin = getAirportCode("origin"),
        destination = getAirportCode("destination"),
        airports = origin + '.' + destination,
        dates = formatApiDate(departureDate) + "." + formatApiDate(returnDate);

    return "data=" + airports + '%2c' + dates;
  }
})();