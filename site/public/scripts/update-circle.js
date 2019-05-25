function getSyncScriptParams() {
   var scripts = document.getElementsByTagName('script');
   var lastScript = scripts[scripts.length-1];
   var scriptName = lastScript;
   return {
     formID: scriptName.getAttribute('data-form-id'),
     circleID: scriptName.getAttribute('data-circle-id'),
     link: scriptName.getAttribute('data-link')
     
   };
 }


function updateCircle(){
  var params = getSyncScriptParams();
  
  var circleInfo = document.getElementById("circle-template").innerHTML;

  var template = Handlebars.compile(circleInfo);

  var checkForm = document.getElementById(params.formID);

  var formTitle = checkForm.querySelector("h1").textContent;
  var numBoxes = checkForm.querySelectorAll("input").length;
  var numTicks = checkForm.querySelectorAll("input:checked").length;
  var percentage = 100 * numTicks / numBoxes;
  var arcX = 50-50*Math.sin(0.0174533*3.6*percentage);
  var arcY = 50-50*Math.cos(0.0174533*3.6*percentage);
  var inverse = percentage > 50 ? 1 : 0 ;
  if (numBoxes != numTicks){
    var circleData = template({
      link: params.link,
      path: 'M50,0 A50,50 1 ' + inverse + ',0 ' + arcX +',' + arcY,
      percent: Math.round(percentage) + '%',
      title: formTitle,
    });
  } else {
    var circleData = template({
      link: params.link,
      path: 'M50,0 A50,50 1 ' + inverse + ',1 ' + arcX +',' + arcY,
      percent: '✓',
      title: formTitle,
    });
  }

  document.getElementById(params.circleID).innerHTML = circleData;
}
updateCircle();