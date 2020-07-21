// Width and height of svg
var w = 1100;
var h = 700;

//projecting the map using Mercator projection 
var projection = d3.geoMercator();
      
//Define path generator
var path = d3.geoPath()
        .projection(projection);

//Create SVG element
var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

var color = d3.scaleThreshold() //maps the domain to the range of colors specified
                .domain([10, 25, 50, 100, 300, 450]) // define the domain (population density)
                .range(["rgb(227, 238, 210)", "rgb(188, 214, 189)", "rgb(90, 150, 134)", "rgb(68, 113, 130)", "rgb(55, 88, 129)", "rgb(40, 57, 129)"]); //define the range of 6 colors


//insert the data for brazil
d3.csv("brazil_covid_cases.csv").then(function(data){  
   console.log(data);
   console.log(data[0].Population_Density);
   console.log(data.length); 
    
   d3.json("brazil.json").then(function(json) { // insert brazil geojson
       projection.fitSize([w, h], json);// scale the json map dimension to fit the screen properly
       for (var i = 0; i < data.length; i++){ //loop through the data to collect the state name and corresponded population density
           var dataState = data[i].State;
           var dataPopulation = +data[i].Population_Density;
           for (var j = 0; j < json.features.length; j++) { // loop through the json file to find the right state and assign the population density
               var jsonState = json.features[j].properties.NAME_1;
               if (dataState == jsonState){ //if the name of the data and json match
                   json.features[j].properties.CC_1 = dataPopulation;
                   break;
               }
           }
       }
       console.log(json.features[0].properties.NAME_1);
       console.log(json.features.length); 
       console.log(json.features);
       svg.selectAll("path") //load in the data
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr('stroke-width', function(d){ return 0.5;}) //define the thickness of the lines that separates the states
          .attr('stroke', function(d){ return 'black';}) // color of the lines
          .attr("fill", function(d) {
            console.log(d.properties.CC_1);
            console.log(d.properties.NAME_1);
            console.log(color(d.properties.CC_1));
            return color(d.properties.CC_1); // fill in the color of the states using color based on their respective population data
       })
   });  
});



//Legend source : https://bl.ocks.org/mbostock/5562380
var color_legend = d3.scaleThreshold() //define the colors scale for the legend, similiar to color for the map 
                .domain([10, 25, 50, 100, 300, 450])
                .range(["rgb(227, 238, 210)", "rgb(188, 214, 189)", "rgb(90, 150, 134)", "rgb(68, 113, 130)", "rgb(55, 88, 129)", "rgb(40, 57, 129)"]);

var x = d3.scaleLinear() //define the scale for the legend's axes
        .domain([0, 3400])
        .rangeRound([360,3900]);

var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(400,25)"); //dictate the position of the legend on canvas

g.selectAll("rect")
      .data(color_legend.range().map(function(d) {
          d = color_legend.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect") //insert new rectangle
        .attr("height", 8)
        .attr("x", function(d) {
        return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); }) //width based on return values
        .attr("fill", function(d) { return color_legend(d[0]); });//color of the rect based on the return values
      //insert the text for legend
       g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Confirmed cases in thousands");
       
       //assign ticks (domains)
       g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(color_legend.domain()))
        .select(".domain")
        .remove();
       
