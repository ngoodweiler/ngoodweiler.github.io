// from data.js
var tableData = data;

// use D3 to select the tbody div in the html file
var tbody = d3.select('tbody');

// add table rows and fill rows with data going through the dataset using forEach
tableData.forEach((ufoSightings) => {
    var row = tbody.append("tr");
    Object.entries(ufoSightings).forEach(([key, value]) => {
      var cell = row.append("td");
      cell.text(value);
    });
});

// use D3 to select the date input
var button = d3.select('#filter-btn');
// when the button is clicked, the table is replaced with fitlered data
// Changes were made - html button type added 'submit' and in js the d3.event.preventDefault
// This allows the site to not refresh and form can be submitted using enter or clicking
button.on('click',function() {
    d3.event.preventDefault();
    var inputElement = d3.select('#datetime');
    var inputValue = inputElement.property('value');
    var filteredData = tableData.filter(entry => entry.datetime === inputValue);

    // clear the table of existing data
    tbody.html('');

    // Replace table with filtered table
    filteredData.forEach((ufoSightings) => {
        var row = tbody.append("tr");
        Object.entries(ufoSightings).forEach(([key, value]) => {
        var cell = row.append("td");
        cell.text(value);
        });
    });   
});