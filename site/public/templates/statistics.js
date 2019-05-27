(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['statistics'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<h2>Statistics</h2>\r\n<h3>total tasks completed"
    + container.escapeExpression(((helper = (helper = helpers.tasksDone || (depth0 != null ? depth0.tasksDone : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"tasksDone","hash":{},"data":data}) : helper)))
    + "</h3>\r\n<div class=\"circle\">\r\n"
    + ((stack1 = container.invokePartial(partials.circle,(depth0 != null ? depth0.totalCircle : depth0),{"name":"circle","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "</div>\r\n<div class=\"circle\">\r\n"
    + ((stack1 = container.invokePartial(partials.circle,(depth0 != null ? depth0.monthCircle : depth0),{"name":"circle","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "</div>";
},"usePartial":true,"useData":true});
})();