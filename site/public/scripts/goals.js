var goals = [];

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); 
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

function fetchAndRender(){
  var goalReq = new XMLHttpRequest(),
      method = "GET",
      url = "../get/goals?startDate=" + today + "&nDays=" + 365;
  goalReq.open(method,url,true);
  goalReq.onreadystatechange = function(){
    if(goalReq.readyState === 4 && goalReq.status === 200) {

      goals = JSON.parse(goalReq.response);
      console.log(goals);
      goals.forEach(function(goal){
        //calculate circle details for each goal
        goal.circle = circleCalc(goal);
      });
      //render the page using the data just fetched
      render(goals);    
    }
  };
  goalReq.send();
}

function toggleTask(taskID, checkbox){
  
  //request server to update db entry for this task
  var request = new XMLHttpRequest(),
      method = "GET",
      url = "../do/update/task?taskID=" + taskID + "&completed=" + (checkbox.checked?1:0);

  request.open(method, url, true);
  request.send();
  
  goals.forEach(function(goal){
    //search each task of current goal
    goal.tasks.forEach(function(task){
      if(task.id == taskID) { 
        //toggle task in memory
        task.complete = (task.complete == 0 ? 1:0); 
        //update form
        goals.forEach(function(goal){
          //calculate circle details for each goal
          goal.circle = circleCalc(goal);
        });
        render(goals);
      }
    });
  });
}

function circleCalc(goal){
  var totalTasks = 0, totalComplete = 0;
  goal.tasks.forEach(function(task){
    totalTasks++;
    if(task.complete) { totalComplete++; }
  });
  
  var percentage = 100 * (totalComplete / totalTasks);
  var arcX = 50-50*Math.sin(0.0174533*3.6*percentage);
  var arcY = 50-50*Math.cos(0.0174533*3.6*percentage);
  var inverse = percentage > 50 ? 1 : 0 ;
  var circle;
  if (totalTasks != totalComplete) {
    circle = {
      link: '#',
      path: 'M50,0 A50,50 1 ' + inverse + ',0 ' + arcX +',' + arcY,
      percent: Math.round(percentage) + '%',
      title: goal.name,
    };
  } else {
    circle = {
      link: '#',
      path: 'M50,0 A50,50 1 ' + inverse + ',1 ' + arcX +',' + arcY,
      percent: '✓',
      title: goal.name,
    };
  }
  return circle;
}

function render(goals){
  Handlebars.registerPartial('circle',Handlebars.templates.circle);

  var template = Handlebars.templates['goals'];

  var data = template({goals});

  document.getElementById("main-container").innerHTML = data;
}

fetchAndRender();