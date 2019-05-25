function getSyncScriptParams() {
   var scripts = document.getElementsByTagName('script');
   var lastScript = scripts[scripts.length-1];
   var scriptName = lastScript;
   return {
     title : scriptName.getAttribute('data-title'),
     formID: scriptName.getAttribute('data-form-id')
     
   };
 }

function updateChecklist(){
  var params = getSyncScriptParams();

//  var formInfo = document.getElementById("form-template").innerHTML;
//  var template = Handlebars.compile(formInfo);
  
  var template = Handlebars.templates['form'];

  var formData = template({
    title: params.title,
    goals: [
      {index: 1, 
       tasks: [
          {index : 6, task: "do part 1"},
          {index : 7, task: "do part 2"},
          {index : 8, task: "do part 3"}
        ]
      }
    ],
    tasks: [
      {index: 1, task: "do washing"},
      {index: 2, task: "do laundry"},
      {index: 3, task: "do shopping"},
      {index: 4, task: "do other thing"},
      {index: 5, task: "do something else"}
    ]
  });

  document.getElementById(params.formID).innerHTML = formData;
}

updateChecklist();