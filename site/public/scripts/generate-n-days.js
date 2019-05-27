"use strict"


var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); 
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

//fetchData(0);

var checklists = [];
var ids = [];


function fetchData(nDays, title, elementID){
  var checklist={
    id: elementID,
    title: title,
    goals: [],
    tasks : []
  };
  var request = new XMLHttpRequest(),
      method = "GET",
      url = "../get/tasks?startDate=" + today + "&nDays=" + nDays;

  request.open(method, url, true);
  request.onreadystatechange = function () {
    if(request.readyState === 4 && request.status === 200) {
      //add tasks to checklist
      checklist.tasks = JSON.parse(request.response);

      var goalReq = new XMLHttpRequest(),
          url = "../get/goals?startDate=" + today + "&nDays=" + nDays;
      goalReq.open(method,url,true);
      goalReq.onreadystatechange = function(){
        if(goalReq.readyState === 4 && goalReq.status === 200) {
          //add goals to checklist
          checklist.goals = JSON.parse(goalReq.response);
          checklists[elementID] = checklist;
          ids.push(elementID);
          console.log(goalReq.response);
          render(checklist);
        }
      };
      goalReq.send();
    }
  };
  request.send();
}


function circleCalc(checklist){
  var totalTasks = 0; 
  var totalComplete = 0;

  if (checklist.goals != []){
    //compute totals for all goal tasks
    checklist.goals.forEach(function(goal){
      goal.tasks.forEach(function(task){
        totalTasks++;
        if(task.complete) { totalComplete++; }
      })
    });
  }
  //compute totals for all plain tasks
  checklist.tasks.forEach(function(task){
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
      title: checklist.title,
    };
  } else {
    circle = {
      link: '#',
      path: 'M50,0 A50,50 1 ' + inverse + ',1 ' + arcX +',' + arcY,
      percent: '✓',
      title: checklist.title,
    };
  }
  return circle;
}

function toggleTask(taskID, checkbox){
  
  //request server to update db entry for this task
  var request = new XMLHttpRequest(),
      method = "GET",
      url = "../do/update/task?taskID=" + taskID + "&completed=" + (checkbox.checked?1:0);

  request.open(method, url, true);
  request.send();
  
  //change data in memory
  //check all checklists
  console.log(checklists);
  ids.forEach(function(id){
    var checklist = checklists[id];
    //search each goal of current checklist
    checklist.goals.forEach(function(goal){
      //search each task of current goal
      goal.tasks.forEach(function(task){
        if(task.id == taskID) { 
          //toggle task in memory
          task.complete = (task.complete == 0 ? 1:0); 
          //update form
          render(checklist);
        }
      });
    });
    //search all tasks of current checklist
    checklist.tasks.forEach(function(task){
      if(task.id == taskID) { 
        //toggle task in memory
        task.complete = (task.complete == 0 ? 1:0); 
        //update form
        render(checklist);
      }
    });
  });

  
}

function render(checklist){
  var elementID = checklist.id;
  var circle = circleCalc(checklist);
  var context = {checklist, circle};

  Handlebars.registerPartial('circle',Handlebars.templates.circle);
  Handlebars.registerPartial('form',Handlebars.templates.form);

  var template = Handlebars.templates['taskview'];

  var data = template(context);

  document.getElementById(elementID).innerHTML = data;
}