// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;
var margin = {
    top: 20,
    right: 40,
    bottom: 120,
    left: 100
}

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svgWrapper = d3.select("#scatter")
.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chart = svgWrapper.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var xAxis = "income";
var yAxis = "smokes";

function xScale(getdata, xAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([0, d3.max(getdata, d=> d.income)])
        .range([0, width]);
    return xLinearScale;
}

function yScale(getdata, yAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(getdata, d => d.smokes)])
        .range([height, 0]);
    return yLinearScale;
}

function xUpdate(x_scaled, x_Axis) {
    var bottomAxis = d3.axisBottom(x_scaled);
    x_Axis.transition()
        .duration(500)
        .call(bottomAxis);
    return x_Axis;
}

function yUpdate(y_scaled, y_Axis) {
    var leftAxis = d3.axisLeft(y_scaled);
    y_Axis.transition()
        .duration(500)
        .call(leftAxis);
    return y_Axis;
}

function getCircles(markers, x_scaled, xAxis, y_scaled, yAxis) {
    markers.transition()
        .duration(500)
        .attr("cx", d => x_scaled(d[xAxis]))
        .attr("cy", d => y_scaled(d[yAxis]));
    return markers;
}

function getText(markerText, x_scaled, xAxis, y_scaled, yAxis) {
    markerText.transition()
        .duration(500)
        .attr("x", d => x_scaled(d[xAxis]))
        .attr("y", d => y_scaled(d[yAxis]))
        .attr("text-anchor", "middle");

        return markerText;
}

function TTUpdate(xAxis, yAxis, markers, markerText) {
    if (xAxis === "income") {
        var xLabel = "Income (Median)";
    }
    else {
        var xLabel = "Poverty (%)";
    }
    if (yAxis === "smokes") {
        var yLabel = "Smokes (%)";
    }
    else {
        var yLabel = "Obesity";
    }




    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([90, 90])
        .html(function(d) {
            return (`${d.state}<br>${xLabel}<br>${d[xAxis]}<br>${yLabel} ${d[yAxis]}`);
    });

    markers.call(toolTip);

    markers.on("mouseover", function(data) {
        toolTip.show(data);
    })

      .on("mouseout", function(data) {
          toolTip.hide(data);
      });

    
      
      markerText.call(toolTip);
      markerText.on("mouseover", function(data) {
          toolTip.show(data);
      })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return markers;
}




d3.csv("assets/data/data.csv").then(function(getdata) {
    getdata.forEach(function(data) {
        data.poverty = +data.poverty;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
            // console.log(data.poverty)
    });


    var xLinearScale = xScale(getdata, xAxis);
    var yLinearScale = yScale(getdata, yAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var x_Axis = chart.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
    
    var y_Axis = chart.append("g")
            .call(leftAxis);

    
    var markers = chart.selectAll(".stateCircle")
        .data(getdata)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.income))
        .attr("cy", d => yLinearScale(d.smokes))
        .attr("r", "10")
        .style("fill", "magenta")
        .style("stroke", "blue");
        
    var markerText = chart.selectAll(".stateText")
        .data(getdata)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[xAxis]))
        .attr("y", d => yLinearScale(d[yAxis]*.98))
        .text(d => (d.abbr))
        .attr("class", "stateText")
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");
    
    var xLabels = chart.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);


    // var povertyLabel = xLabels.append("text")
    //     .attr("x", 0)
    //     .attr("y", 20)
    //     .attr("value", "poverty")
    //     .classed("active", true)
    //     .text("Poverty (%)");

    var incomeLabel = xLabels.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("active", true)
        .text("Income (Median)");

    var povertyLabel = xLabels.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("inactive", true)
        .text("Poverty (%)");

    var yLabels = chart.append("g")
        .attr("transform", `translate(-25, ${height / 2})`);

    var smokesLabel = yLabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", 0)
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("active", true)
        .text("Smokes (%)");

    var obesityLabel = yLabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x", 0)
        .attr("value", "obesity")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Obesity (%)");

    var markers = TTUpdate(xAxis, yAxis, markers, markerText);


    xLabels.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== xAxis) {
                xAxis = value;

                xLinearScale = xScale(getdata, xAxis);

                x_Axis = xUpdate(xLinearScale, xAxis);

                markers = getCircles(markers, xLinearScale, xAxis, yLinearScale, yAxis);

                markerText = getText(markerText, xLinearScale, xAxis, yLinearScale, yAxis)
                markers = TTUpdate(xAxis, yAxis, markers, markerText);

                if (yAxis === "smokes") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }
                else if (yAxis === "obesity") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }
            }
        });
});
