(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['today'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<h2>Today's tasks:</h2>\r\n<div class=\"circle-list-container\">\r\n\r\n  <div class=\"circle\" id=\"today-circle\">\r\n"
    + ((stack1 = container.invokePartial(partials.circle,(depth0 != null ? depth0.todayCircle : depth0),{"name":"circle","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "  </div>\r\n  <div class=\"checklist\" id=\"today-checklist\">\r\n"
    + ((stack1 = container.invokePartial(partials.form,(depth0 != null ? depth0.todayChecklist : depth0),{"name":"form","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "  </div>\r\n\r\n</div>";
},"usePartial":true,"useData":true});
})();