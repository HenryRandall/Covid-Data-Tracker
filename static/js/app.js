// Function to initialize page using initial data
function init() {

  // Grab the dropdown menu and add choices from the dataset
  var dropdown = d3.select("#selDataset");

  // Create list of datasets for the dropdown
  d3.json("static/state_data.json").then((data) => {

      // Loop through options using forEach
      data.values.forEach((stateName) => {

          // Append the new option
          dropdown.append("option").text(stateName[0]).property("value");
      });

  // // Populate the graphs and table with first test subject data
  countySelect(data.values[0]);
  
  });

};

function countySelect() {

  var dropdown = d3.select("#selDataset");

  dropdown.html("");

  d3.json("static/county_data.json").then((data) => {

    data.values.forEach((countyName) => {

      dropdown.append("option").text(countyName[1]).property("value");

    });
  });
};

// Run
init();