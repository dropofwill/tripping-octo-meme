var path = d3.geo.path();
 
//d3.json("data/us_county_geo_data.json", function(json) {
d3.json("data/us_geo_data.json", function(json) {
	
	var svg = d3.select("body")
		.append("svg");

	svg.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path);
});
