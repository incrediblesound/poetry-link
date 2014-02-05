$(document).ready(function(){
	$('.linkbud').hide();
	$('.linkinfo').hide();

	$('#linkInfo').on('click', function() {
		$('.linkbud').toggle(500);
	});

	$('.linkbud').on('click', function() {
		$(this).children().toggle(500);
	})

	$('#linksubmit').hide();
	$('.position').on('click', function() {
		$('#linksubmit').fadeIn(250);
	});

	$('.title').attr('href', '/index')

	$('#graph').on('click', function() {
		$.ajax({
			type:'get',
			url:'/data',
			datatype:'json'
		}).done (function (data) {
  var links = JSON.parse(data);
  var nodes = {};
  var names = {};

  links.forEach(function (link) {
    names[link.source] = link.host;
    names[link.target] = link.guest;
  });

  links.forEach(function (link) {
    link.source = nodes[link.source] || (nodes[link.source] = {ID: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {ID: link.target});
  });

  var width = 960,
      height = 500;

  var force = d3.layout.force()
	.nodes(d3.values(nodes))
	.links(links)
  .size([width, height])
  .linkDistance(60)
  .charge(-300)
  .on("tick", tick)
  .start();
  var svg = d3.select(".container").append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("svg:defs").selectAll("marker")
    .data(["end"])
  .enter().append("svg:marker")    
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
  .enter().append("svg:path")
    .attr("class", "link")
    .attr("marker-end", "url(#end)");

  var circle = svg.append("g").selectAll("circle")
    .data(force.nodes())
  .enter().append("circle")
    .attr("r", 6)
    .call(force.drag);

  var text = svg.append("g").selectAll("text")
    .data(force.nodes())
  .enter().append("text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return (names[d.ID]) });

  function tick() {
    path.attr("d", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }
		})
	})
});

var forEach = function(array, fn) {
  for(i=0;i<array.length;i++)
    fn(array[i]);
}
