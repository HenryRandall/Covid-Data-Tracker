// Function to initialize page using initial data
function init() {
  // Grab the dropdown menu and add choices from the dataset
  var dropdown = d3.select("#States");
  // Create list of datasets for the dropdown
  for (var state in orders) {
    dropdown.append("option").text(orders[state].state);
  }
  var stateName = d3.select("#States").property('value');
  countySelect(stateName);
  var stateName = d3.select("#States").property('value');
  var totalsState = d3.select("#TotalS").property('value');
  var resultState = d3.select("#ResultS").property('value');
  StateGraph(stateName,totalsState,resultState)
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
};

function countySelect(stateName) {
  var dropdown = d3.select("#Counties");
  dropdown.html("");
  for (var county in county_cases) {
    if ((county_cases[county].State.toUpperCase()) == stateName.toUpperCase()) {
      dropdown.append("option").text(county_cases[county].County);
    }
  }
};

d3.select('#States').on('change', function() {
  var stateName = d3.select("#States").property('value');
  var totalsState = d3.select("#TotalS").property('value');
  var resultState = d3.select("#ResultS").property('value');
  StateGraph(stateName,totalsState,resultState)
  countySelect(stateName);
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
});

d3.select('#Counties').on('change', function() {
  var stateName = d3.select("#States").property('value');
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
});

d3.select('#TotalS').on('change', function() {
  var stateName = d3.select("#States").property('value');
  var totalsState = d3.select("#TotalS").property('value');
  var resultState = d3.select("#ResultS").property('value');
  StateGraph(stateName,totalsState,resultState)
});

d3.select('#TotalC').on('change', function() {
  var stateName = d3.select("#States").property('value');
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
});

d3.select('#ResultS').on('change', function() {
  var stateName = d3.select("#States").property('value');
  var totalsState = d3.select("#TotalS").property('value');
  var resultState = d3.select("#ResultS").property('value');
  StateGraph(stateName,totalsState,resultState)
});

d3.select('#ResultC').on('change', function() {
  var stateName = d3.select("#States").property('value');
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
});


function StateGraph(stateName,type,variable) {
  if ((type) == 'Total') {
    if ((variable) == 'Cases') {
      var df=state_cases;
      var label = 'Total Cases';
    }
    else {
      var df=state_deaths;
      var label = 'Total Deaths';
    }
  }
  else {
    if ((variable) == 'Cases') {
      var df=state_cases_daily;
      var label = 'Reported Cases';
    }
    else {
      var df=state_deaths_daily;
      var label = 'Reported Deaths';
    }
  }
  
  for (var state in df) {
    if ((df[state].State.toUpperCase()) == stateName.toUpperCase()) {
        index = state;
    }
  }

  data=JSON.parse(JSON.stringify(df[index]));
  delete data["State"];
  dates=Object.keys(data);
  var values=[];
  for (var date in dates) {
    values.push(data[dates[date]]);
  }

  orderData=JSON.parse(JSON.stringify(orders[index]));
  stateOrders=Object.keys(orderData);
  var orderDates=[];
  for (var orderDate in stateOrders) {
    orderDates.push(orderData[stateOrders[orderDate]]);
  };
  
  var orderImplementationtest= (new Date(orderDates[1])).toLocaleDateString('en-US');
  var orderExpirationtest= (new Date(orderDates[2])).toLocaleDateString('en-US');


  window.orderImplementation = undefined;
  window.orderExpiration = undefined;
  for (var date in dates) {
    today=(new Date(dates[date])).toLocaleDateString('en-US');
    if (today == orderImplementationtest) {
      window.orderImplementation = date;
    }
    if (today == orderExpirationtest) {
      window.orderExpiration = date;
      break;
    }
  }

  $('#Splot').remove();
  $('#Sgraph-container').html('<canvas id="Splot"></canvas>');

  var myLineExtend = Chart.controllers.line.prototype.draw;
  var ctx = document.getElementById("Splot").getContext("2d");
  var config = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: label,
        fill: false,
        borderColor: "#000000",
        pointBackgroundColor: "#82CAFA",
        pointBorderColor: "#000000",
        pointHoverBackgroundColor: "#0000FF",
        data: values
      }],
      datasetFill: false,
      lineAtIndex1: orderImplementation,
      lineAtIndex2: orderExpiration
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      },
      legend: {
        display: false
      }
    }
  };

  Chart.helpers.extend(Chart.controllers.line.prototype, {
    draw: function () {
    
      myLineExtend.apply(this, arguments);   

      var chart = this.chart;
      var ctx = chart.chart.ctx;

      var index1 = chart.config.data.lineAtIndex1;
      var index2 = chart.config.data.lineAtIndex2;
      var xaxis = chart.scales['x-axis-0'];
      var yaxis = chart.scales['y-axis-0'];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xaxis.getPixelForValue(undefined, index1), yaxis.top + 24);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth= 3;
      ctx.lineTo(xaxis.getPixelForValue(undefined, index1), yaxis.bottom);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xaxis.getPixelForValue(undefined, index2), yaxis.top + 24);
      ctx.strokeStyle = '#008000';
      ctx.lineWidth= 3;
      ctx.lineTo(xaxis.getPixelForValue(undefined, index2), yaxis.bottom);
      ctx.stroke();
      ctx.restore();

      ctx.textAlign = 'end';
      ctx.font="20px sans-serif";
      ctx.fillStyle='#000000';
      ctx.fillText("Quarantine Begin", xaxis.getPixelForValue(undefined, index1), yaxis.top + 16);
      ctx.textAlign = 'start';
      ctx.fillText("Quarantine End", xaxis.getPixelForValue(undefined, index2), yaxis.top + 16);
    }
  });

  new Chart(ctx, config);
};

function CountyGraph(stateName,countyName,type,variable) {
  if ((type) == 'Total') {
    if ((variable) == 'Cases') {
      var df=county_cases;
      var label = 'Total Cases';
    }
    else {
      var df=county_deaths;
      var label = 'Total Deaths';
    }
  }
  else {
    if ((variable) == 'Cases') {
      var df=county_cases_daily;
      var label = 'Reported Cases';
    }
    else {
      var df=county_deaths_daily;
      var label = 'Reported Deaths';
    }
  }

  for (var county in df) {
    if ((df[county].State.toUpperCase()) == stateName.toUpperCase() && (df[county].County.toUpperCase()) == countyName.toUpperCase()){
        index = county;
    }
  }

  data=JSON.parse(JSON.stringify(df[index]));
  delete data["State"];
  delete data["County"];
  delete data["FIPS"];
  dates=Object.keys(data);
  var values=[];
  for (var date in dates) {
    values.push(data[dates[date]]);
  }

  $('#Cplot').remove();
  $('#Cgraph-container').html('<canvas id="Cplot"></canvas>');

  var myLineExtend = Chart.controllers.line.prototype.draw;
  var ctx = document.getElementById("Cplot").getContext("2d");
  var config = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: label,
        fill: false,
        borderColor: "#000000",
        pointBackgroundColor: "#82CAFA",
        pointBorderColor: "#000000",
        pointHoverBackgroundColor: "#0000FF",
        data: values
      }],
      datasetFill: false,
      lineAtIndex1: orderImplementation,
      lineAtIndex2: orderExpiration
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      },
      legend: {
        display: false
      }
    }
  };

  new Chart(ctx, config);
};


init();