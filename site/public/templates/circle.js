(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['circle'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<!--cirlce partial for use in other templates-->\r\n<a href="
    + alias4(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"link","hash":{},"data":data}) : helper)))
    + ">\r\n  <svg class=\"pie\" viewbox=\"-10 -10 120 120\">\r\n    <circle cx=\"50\" cy=\"50\" r=\"50\"></circle>\r\n    <path d=\""
    + alias4(((helper = (helper = helpers.path || (depth0 != null ? depth0.path : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"path","hash":{},"data":data}) : helper)))
    + "\"></path>\r\n    <text id=\"percentage\" x=\"50\" y=\"50\" text-anchor=\"middle\" alignment-baseline=\"middle\">"
    + alias4(((helper = (helper = helpers.percent || (depth0 != null ? depth0.percent : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"percent","hash":{},"data":data}) : helper)))
    + "</text>\r\n    <text id=\"label\" x=\"50\" y=\"65\" text-anchor=\"middle\" alignment-baseline=\"middle\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</text>\r\n  </svg>\r\n</a>";
},"useData":true});
})();