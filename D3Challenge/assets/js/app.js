function init(){
// @TODO: YOUR CODE HERE!
var svgWidth = 1000;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper and append SVG group to hold chart; shift latter by left and top margins
var svg = d3
    .select("#scatter")
    .append('svg')
    .attr('width',svgWidth)
    .attr('height',svgHeight);

// Append SVG group
var chartGroup = svg.append('g')
    .attr('transform',`translate(${margin.left},${margin.top})`);

// Initial Params
var chosenXAxis = 'smokes';

// Function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
        d3.max(censusData, d=> d[chosenXAxis]) * 1
    ])
    .range([0,width]);

return xLinearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d=>newXScale(d[chosenXAxis]));

    return circlesGroup;
}
function renderText(circleText,newXScale,chosenXAxis) {
    circleText.transition()
    .duration(1000)
    .attr('dx',d=>newXScale(d[chosenXAxis]))
    // .attr('dy',d=>yLinearScale(d.obesity)*0.99) --Unnecessary if not changing y scale
    .text(d=>(d.abbr))
    .attr('class','stateText')
    .attr('font-size','7px');
    return circleText;
}
// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    var label;
    if (chosenXAxis === 'smokes') {
        label = '% of Population Smokes:';
    }
    else {
        label = '% of Population without Health Insurance:';
    }

    var toolTip = d3.tip()
        .attr('class','d3-tip')
        .offset([80,-60])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on('mouseover',function(data) {
        toolTip.show(data);
    })

        .on('mouseout',function(data, index) {
            toolTip.hide(data);
        });
    
    return circlesGroup;
}

// Retrieve data from the CSV file and execute below
d3.csv('./assets/data/data.csv').then(function(censusData, err) {
    if (err) throw err;

    //parse data
    censusData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d=>d.obesity)-0.5, d3.max(censusData, d=>d.obesity)])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append('g')
        .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(censusData)
        .enter()
        .append('circle')
        .attr('cx', d=>xLinearScale(d[chosenXAxis]))
        .attr('cy', d=>yLinearScale(d.obesity)*.99)
        .attr('r',15)
        .attr('fill','green')
        .attr('opacity','0.5');

    var circleText = chartGroup.selectAll(null)
        .data(censusData)
        .enter()
        .append('text')
        .attr('dx',d=>xLinearScale(d[chosenXAxis]))
        .attr('dy',d=>yLinearScale(d.obesity)*0.99)
        .text(d=>(d.abbr))
        .attr('class','stateText')
        .attr('font-size','7px');
        

    // Create group for 2 x-axis labels
    var labelsGroup = chartGroup.append('g')
        .attr('transform',`translate(${width / 2}, ${height + 20})`);

    var smokesLabel = labelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'smokes') //value to grab for event listener
        .classed('active',true)
        .text('Percent of population that smokes');

    var healthcareLabel = labelsGroup.append('text')
        .attr('x',0)
        .attr('y',40)
        .attr('value','healthcare')
        .classed('inactive',true)
        .text('Percent of population without Health Insurance');

    // Append y axis
    chartGroup.append('text')
        .attr('transform','rotate(-90)')
        .attr('y',0-margin.left)
        .attr('x',0-(height / 2))
        .attr('dy', '1em')
        .classed('aText',true)
        .text('Percent of population that are obese');

    // update ToolTip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, circleText);
    // x axis labels event listener
    labelsGroup.selectAll('text')
        .on('click',function() {
            var value = d3.select(this).attr('value');
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;
                // updates x scale
                xLinearScale = xScale(censusData, chosenXAxis);
                //updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
                circleText = renderText(circleText,xLinearScale,chosenXAxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                
                // changes classes to change bold text
                if (chosenXAxis === 'smokes') {
                    smokesLabel
                        .classed('active',true)
                        .classed('inactive',false);
                    healthcareLabel
                        .classed('active',false)
                        .classed('inactive',true);
                }
                else {
                    smokesLabel
                        .classed('active',false)
                        .classed('inactive',true);
                    healthcareLabel
                        .classed('active',true)
                        .classed('inactive',false);
                }
            }
        });
        
}).catch(function(error) {
    console.log(error);
})};
init ();