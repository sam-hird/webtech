"use strict"
var todayChecklist = {
  title: 'Today',
  goals: [
    {index: 1, 
     name: "big goal",
     tasks: [
        {index : 6, task: "do part 1", complete: false},
        {index : 7, task: "do part 2", complete: true},
        {index : 8, task: "do part 3", complete: false}
      ]
    }
  ],
  tasks: [
    {index: 1, task: "do washing", complete: false},
    {index: 2, task: "do laundry", complete: true},
    {index: 3, task: "do shopping", complete: false},
    {index: 4, task: "do other thing", complete: false},
    {index: 5, task: "do something else", complete: false},
    {index: 9, task: "do my hair", complete: false},
    {index: 10, task: "wash fish", complete: false},
    {index: 11, task: "eat something ", complete: false},
    {index: 12, task: "do other thing", complete: false},
    {index: 13, task: "do something else", complete: false},
    {index: 14, task: "do my hair", complete: false},
    {index: 15, task: "wash fish", complete: false},
    {index: 16, task: "eat something ", complete: false}
  ]
};

function circleCalc(){
  var totalTasks = 0; 
  var totalComplete = 0;

  //compute totals for all goal tasks
  todayChecklist.goals.forEach(function(goal){
    goal.tasks.forEach(function(task){
      totalTasks++;
      if(task.complete) { totalComplete++; }
    })
  });

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
      if(task.index == taskID) { task.complete = !task.complete }
    })
  });

  //compute totals for all plain tasks
  todayChecklist.tasks.forEach(function(task){
      if(task.index == taskID) { task.complete = !task.complete }
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
render();