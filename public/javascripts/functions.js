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
  links = data;
  var nodes = {};

  for(i=0;i<links.length;++i) {
    links[i].source = nodes[links[i].source] || (nodes[links[i].source] = {name: links[i].source});
    links[i].target = nodes[links[i].target] || (nodes[links[i].target] = {name: links[i].target});
  };

  console.log(nodes);
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

  var path = svg.append("g").selectAll("path")
    .data(force.links())
  .enter().append("path")
    .attr("class", function(d) { return "link"});

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
    .text(function(d) { return d.source; });

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


