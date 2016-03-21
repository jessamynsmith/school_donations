queue()
  .defer(d3.json, "/donorsUSA/projects")
  .await(makeGraphs);


function makeGraphs(error, projectsJson) {
  // load projectsJson


  // change string (from CSV) into number format
  projectsJson.forEach(function(d) {
    d.Year = +d.Year;
    d["TotalDonations (USD)"] = +d["TotalDonations (USD)"];
//    console.log(d);
  });


   //Clean projectsJson
    var donorsUSAProjects = projectsJson;
    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
    donorsUSAProjects.forEach(function (d) {
        d["date_posted"] = dateFormat.parse(d["date_posted"]);
        d["date_posted"].setDate(1);
        d["total_donations"] = +d["total_donations"];
    });


    //Create a Crossfilter instance
    var ndx = crossfilter(donorsUSAProjects);


    //Define Dimensions
    var dateDim = ndx.dimension(function (d) {
        return d["date_posted"];
    });
    var resourceTypeDim = ndx.dimension(function (d) {
        return d["resource_type"];
    });
    var povertyLevelDim = ndx.dimension(function (d) {
        return d["poverty_level"];
    });
    var stateDim = ndx.dimension(function (d) {
        return d["school_state"];
    });
    var totalDonationsDim = ndx.dimension(function (d) {
        return d["total_donations"];
    });


    var fundingStatus = ndx.dimension(function (d) {
        return d["funding_status"];
    });


    //Calculate metrics
    var numProjectsByDate = dateDim.group();
    var numProjectsByState = stateDim.group();
    var numProjectsByResourceType = resourceTypeDim.group();
    var numProjectsByPovertyLevel = povertyLevelDim.group();
    var numProjectsByFundingStatus = fundingStatus.group();
    var totalDonationsByState = stateDim.group().reduceSum(function (d) {
        return d["total_donations"];
    });
    var stateGroup = stateDim.group();


    var all = ndx.groupAll();
     var totalDonations;
     totalDonations = ndx.groupAll().reduceSum(function (d) {
         return d["total_donations"];
     });


    var max_state = totalDonationsByState.top(1)[0].value;


    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["date_posted"];
    var maxDate = dateDim.top(1)[0]["date_posted"];


    //Charts
    var timeChart = dc.barChart("#time-chart");
    var stateChart = dc.rowChart("#state-chart");
    var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalDonationsND = dc.numberDisplay("#total-donations-nd");
    var fundingStatusChart = dc.pieChart("#funding-chart");


    var selectField = dc.selectMenu('#menu-select')
        .dimension(stateDim)
        .group(stateGroup);


    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(all);


    totalDonationsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalDonations)
        .formatNumber(d3.format(".3s"));


   timeChart
        .width(800)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dateDim)
        .group(numProjectsByDate)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(4);


   resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .xAxis().ticks(4);


    povertyLevelChart
        .width(300)
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .xAxis().ticks(4);


    fundingStatusChart
        .height(220)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(fundingStatus)
        .group(numProjectsByFundingStatus);

    stateChart
        /*.width(800)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(stateDim)
        .group(numProjectsByState)
        .transitionDuration(500)
        /*.x(d3.state.scale())
        .elasticY(true)
        .xAxisLabel("State")
        .yAxisLabel("Number of Donations")
        .yAxis().ticks(4);*/
        .width(800)
        .height(1000)
        .dimension(stateDim)
        .group(numProjectsByState)
        .xAxis().ticks(4);



 /*   var w, h, margin, y, x;
    w = 400;
    h = 200;
    margin = 20;
    y = d3.scale.linear().domain([0, d3.max(projectsJson)]).range([0 + margin, h - margin]);
    x = d3.scale.linear().domain([0, projectsJson.length]).range([0 + margin, w - margin]);
        var vis = d3.select("body")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)


    var g = vis.append("svg:g")
        .attr("transform", "translate(0, 200)");


    var line = d3.svg.line()
        .x(function(d,i) { return x(i); })
        .y(function(d) { return -1 * y(d); });


    g.append("svg:path")
        .data(x.ticks(5))
        .attr("class","line")
        .attr("d", line);


    g.append("svg:line")
        .attr("xAxis", x(0))
        .attr("yAxis", -1 * y(0))
        .attr("xAxis", x(w))
        .attr("yAxis", -1 * y(0))


    g.append("svg:line")
        .attr("xAxis", x(0))
        .attr("yAxis", -1 * y(0))
        .attr("xAxis", x(0))
        .attr("yAxis", -1 * y(d3.max(projectsJson)));


    g.selectAll(".xLabel")
        .data(x.ticks(5))
        .enter().append("svg:text")
        .attr("class", "xLabel")
        .text(String)
        .attr("x", function(d) { return x(d) })
        .attr("y", 0)
        .attr("text-anchor", "middle");


    g.selectAll(".yLabel")
        .data(y.ticks(4))
        .enter().append("svg:text")
        .attr("class", "yLabel")
        .text(String)
        .attr("x", 0)
        .attr("y", function(d) { return -1 * y(d) })
        .attr("text-anchor", "right")
        .attr("dy", 4);


    g.selectAll(".xTicks")
        .data(x.ticks(5))
        .enter().append("svg:line")
        .attr("class", "xTicks")
        .attr("xAxis", function(d) { return x(d); })
        .attr("yAxis", -1 * y(0))
        .attr("xAxis", function(d) { return x(d); })
        .attr("yAxis", -1 * y(-0.3));


    g.selectAll(".yTicks")
        .data(y.ticks(4))
        .enter().append("svg:line")
        .attr("class", "yTicks")
        .attr("yAxis", function(d) { return -1 * y(d); })
        .attr("xAxis", x(-0.3))
        .attr("yAxis", function(d) { return -1 * y(d); })
        .attr("xAxis", x(0));


    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


 /*
+ * value accessor - returns the value to encode for a given projectsJson object.
  * scale - maps value to a visual display encoding, such as a pixel position.
+ * map function - maps from projectsJson value to display value
  * axis - sets up axis



    // setup x
    var xValue = function(d) { return d.Year;}, // projectsJson -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // projectsJson -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");


     // setup y
    var yValue = function(d) { return d["Total Donations (USD)"];}, // projectsJson -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // projectsJson -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");


     // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // don't want dots overlapping axis, so add in buffer to projectsJson domain
    xScale.domain([d3.min(projectsJson, xValue)-1, d3.max(projectsJson, xValue)+1]);
    yScale.domain([d3.min(projectsJson, yValue)-1, d3.max(projectsJson, yValue)+1]);


    // x-axis
   svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Year");


   // y-axis
  svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("TotalDonations (USD)");


     // setup fill color
    var cValue = function(d) { return d.stateDim;},
    color = d3.scale.category10();


   // draw dots
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot", true)
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));})
        .on("mouseover", function(d) {
           tooltip.transition()
                .duration(200)
                .style("opacity", .9);
           tooltip.html(d["Amount"] + "<br/> (" + xValue(d)
     	        + ", " + yValue(d) + ")")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
           tooltip.transition()
                .duration(500)
                .style("opacity", 0);
       });;


     // draw legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return i; });


    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);


    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;});


     // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);*/


    dc.renderAll();
 }