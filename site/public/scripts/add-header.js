var template = Handlebars.templates['headernav'];
var headernavData = template();

document.body.innerHTML = headernavData + document.body.innerHTML + "<div></div></div>";
