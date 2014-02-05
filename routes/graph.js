var makeGraph = function(data) {

  links = data;
  var nodes = {};

  links.forEach(function (link) {
    link.source = nodes[link.source] || (nodes[link.source] = {ID: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {Child: link.target});
  });

  var width = 960,
      height = 500;

  var force = d3.layout.force()
	.nodes(this.ownerDocument.values(nodes))
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
}