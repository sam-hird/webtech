
function fetchAndRender(){
  var monthReq = new XMLHttpRequest(),
      method = "GET",
      url = "../get/tasks?startDate=" + today + "&nDays=" + -30;
  monthReq.open(method,url,true);
  monthReq.onreadystatechange = function(){
    if(monthReq.readyState === 4 && monthReq.status === 200) {

      var monthTasks = JSON.parse(monthReq.response);
      //calculate circle values for last month
      monthTasks.circle = circleCalc(monthTasks, "Past Month");
      //request all tasks from last 10 years
      var allReq = new XMLHttpRequest(),
          method = "GET",
          url = "../get/tasks?startDate=" + today + "&nDays=" + -3652;
      allReq.open(method,url,true);
      allReq.onreadystatechange = function(){
        if(allReq.readyState === 4 && allReq.status === 200) {

          var allTasks = JSON.parse(allReq.response);
          //calculate circle values for last month
          allTasks.circle = circleCalc(allTasks, "Avg Completion");
          //render the page using the data just fetched
          render(monthTasks, allTasks);    
        }
      };
      allReq.send();   
    }
  };
  monthReq.send();
}


function circleCalc(tasks, name){
  var totalTasks = 0, totalComplete = 0;
  tasks.forEach(function(task){
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
      title: name,
      done: totalComplete
    };
  } else {
    circle = {
      link: '#',
      path: 'M50,0 A50,50 1 ' + inverse + ',1 ' + arcX +',' + arcY,
      percent: '✓',
      title: name,
      done: totalComplete
    };
  }
  return circle;
}

function render(monthTasks, allTasks){
  Handlebars.registerPartial('circle',Handlebars.templates.circle);

  var template = Handlebars.templates['statistics'];
  Handlebars.registerPartial('circle',Handlebars.templates.circle);

  var context = { tasksDone: allTasks.circle.done,
                  totalCircle: allTasks.circle,
                  monthCircle: monthTasks.circle};
  var data = template(context);

  document.getElementById("statistics").innerHTML = data;
}

fetchAndRender();