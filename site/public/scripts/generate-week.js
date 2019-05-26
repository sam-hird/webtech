"use strict"
var todayChecklist={
  title: 'Today',
  goals: [],
  tasks : []
};

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); 
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

fetchData();



function fetchData(){
  var request = new XMLHttpRequest(),
      method = "GET",
      url = "../get/tasks?startDate=" + today + "&nDays=" + 7;

  request.open(method, url, true);
  request.onreadystatechange = function () {
    if(request.readyState === 4 && request.status === 200) {
      //add tasks to checklist
      todayChecklist.tasks = JSON.parse(request.response);

      var goalReq = new XMLHttpRequest(),
          url = "../get/goals?startDate=" + today + "&nDays=" + 7;
      goalReq.open(method,url,true);
      goalReq.onreadystatechange = function(){
        if(goalReq.readyState === 4 && goalReq.status === 200) {
          //add goals to checklist
          todayChecklist.goals = JSON.parse(goalReq.response);
          console.log(goalReq.response);
          render();
        }
      };
      goalReq.send();
    }
  };
  request.send();
}


function circleCalc(){
  var totalTasks = 0; 
  var totalComplete = 0;

  if (todayChecklist.goals != []){
    //compute totals for all goal tasks
    todayChecklist.goals.forEach(function(goal){
      goal.tasks.forEach(function(task){
        totalTasks++;
        if(task.complete) { totalComplete++; }
      })
    });
  }
  //compute totals for all plain tasks
  todayChecklist.tasks.forEach(function(task){
    totalTasks++;
    if(task.complete) { totalComplete++; }
  });

  var percentage = 100 * (totalComplete / totalTasks);
  var arcX = 50-50*Math.sin(0.0174533*3.6*percentage);
  var arcY = 50-50*Math.cos(0.0174533*3.6*percentage);
  var inverse = percentage > 50 ? 1 : 0 ;
  var todayCircle;
  if (totalTasks != totalComplete) {
    todayCircle = {
      link: '#',
      path: 'M50,0 A50,50 1 ' + inverse + ',0 ' + arcX +',' + arcY,
      percent: Math.round(percentage) + '%',
      title: 'today',
    };
  } else {
    todayCircle = {
      link: '#',
      path: 'M50,0 A50,50 1 ' + inverse + ',1 ' + arcX +',' + arcY,
      percent: '✓',
      title: 'Today',
    };
  }
  return todayCircle;
}

function toggleTask(taskID){
  //compute totals for all goal tasks
  todayChecklist.goals.forEach(function(goal){
    goal.tasks.forEach(function(task){
      if(task.id == taskID) { 
        //toggle task in memory
        task.complete = (task.complete == 0 ? 1:0); 
        //request server to update db entry for this task
        var request = new XMLHttpRequest(),
          method = "GET",
          url = "../do/update/task?taskID=" + taskID + "&completed=" + task.complete;

        request.open(method, url, true);
        request.send();
        }
      });
    });

  //compute totals for all plain tasks
  todayChecklist.tasks.forEach(function(task){
      if(task.id == taskID) { 
        //toggle task in memory
        task.complete = (task.complete == 0 ? 1:0); 
        //request server to update db entry for this task
        var request = new XMLHttpRequest(),
            method = "GET",
            url = "../do/update/task?taskID=" + taskID + "&completed=" + task.complete;

        request.open(method, url, true);
        request.send();
      }
  });
}

function render(){
  var todayCircle = circleCalc();
  var context = {todayChecklist, todayCircle};

  Handlebars.registerPartial('circle',Handlebars.templates.circle);
  Handlebars.registerPartial('form',Handlebars.templates.form);

  var template = Handlebars.templates['today'];

  var data = template(context);

  document.getElementById('today-section').innerHTML = data;
}