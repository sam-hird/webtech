var taskCounter = 0;


function checkFull(element){
  if (element.value.trim() == ""){
    element.parentElement.removeChild(element);
  } else {
    element.value = element.value.charAt(0).toUpperCase() + element.value.slice(1);
  }
}

function taskAdder(element){
  var newNode = document.createElement('input');
  newNode.setAttribute('type','text');
  newNode.setAttribute('onblur','checkFull(this)');
  newNode.setAttribute('name', 'task[' + taskCounter++ + ']');
  newNode.classList.add('goal-task');
  newNode.classList.add('filled');
  newNode.addEventListener("keypress", function(event) {
    if (event.key === "Enter" ) {
        element.focus();
        event.preventDefault();
    }
  });
  element.parentElement.insertBefore(newNode,element);
  newNode.focus();
}

function goalAdder(element){
  if (element.parentElement.querySelector('#create-goal-form') == null){
    var formClone = document.getElementById('create-goal-form').cloneNode(true);
    formClone.style.display = 'flex';
    formClone.style.fontSize = '0.8em'
    formClone.style.width = '90%'
    formClone.style.border = '1px solid black'
    element.parentElement.insertBefore(formClone,element);
    formClone.querySelector('#goal-name').focus();
  } else {
    element.parentElement.querySelector('#create-goal-form>#goal-name').focus()
  }
}

function showTaskForm(){
  document.getElementById("create-task-form").style.display = "flex";
  document.getElementById("create-goal-form").style.display = "none";
  document.getElementById("create-project-form").style.display = "none";
  document.getElementById('error-box').querySelector("p").innerHTML = "";
}
function showGoalForm(){
  document.getElementById("create-task-form").style.display = "none";
  document.getElementById("create-goal-form").style.display = "flex";
  document.getElementById("create-project-form").style.display = "none";
  document.getElementById('error-box').querySelector("p").innerHTML = "";
}
function showProjectForm(){
  document.getElementById("create-task-form").style.display = "none";
  document.getElementById("create-goal-form").style.display = "none";
  document.getElementById("create-project-form").style.display = "flex";
  document.getElementById('error-box').querySelector("p").innerHTML = "Projects are not yet implemented";
}


function doCreateTask(name, due, errorBoxID){
  if (name.value.length > 0 && name.value.length <= 100){
    if (Date.parse(due.value) != undefined){
        
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/do/create/task', true);

        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function() { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
              //tell user task crerated successfully
              var error = "Task created successfully";
              document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
              //reset form
              name.value = "";
              date.value = "";

            } else if (this.readyState === XMLHttpRequest.DONE && this.status === 401){
              //set error box to display bad login error

              var error = "invalid name/date combination";
              document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
            }
        };
        xhr.send("due=" + due.value + "&name=" + name.value);
      
    } else {
      var error = "invalid date";
      document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
      
    }
  } else {
    //set error message in error box
    var error = "name must be between 1 and 100 characters";
    document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
  }
}

function doCreateGoal(name, notes, due, tasks, errorBoxID){
  if (name.value.length > 0 && name.value.length <= 100){
    if (Date.parse(due.value) != undefined){
      if (notes.value.length <= 1000){
        if (tasks.length > 0){

          var xhr = new XMLHttpRequest();
          xhr.open("POST", '/do/create/goal', true);

          //Send the proper header information along with the request
          xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

          xhr.onreadystatechange = function() { // Call a function when the state changes.
              if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                //tell user task crerated successfully
                var error = "Goal created successfully";
                document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
                //reset form
                name.value = "";
                notes.value = "";
                due.value = "";
                tasks.forEach(function(child){ child.parentElement.removeChild(child); });

              } else if (this.readyState === XMLHttpRequest.DONE && this.status === 401){
                //set error box to display server error

                var error = "unable to add goal";
                document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
              }
          };
          var postBody = "due=" + due.value + "&name=" + name.value + "&notes=" + notes.value;
          tasks.forEach(function(task){
            //of the form &task[n]=taskname
            postBody = postBody + '&' + task.name + '=' + task.value;
          });
          xhr.send(postBody);
          
        } else {
          
          var error = "please add some tasks";
          document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
        }
      } else {
        
        var error = "notes must be under 1000 characters";
        document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
      }
    } else {
      var error = "invalid date";
      document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
      
    }
  } else {
    //set error message in error box
    var error = "name must be between 1 and 100 characters";
    document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
  }
}


var errorBoxID = "error-box";

//var taskButton = document.querySelector("input#task-submit.task.submit");
//document.getElementById("task-submit").onclick = 
function doCreateTaskClick(button){
  console.log("task go clicked");
  console.log(button);
  var name = button.parentElement.name;
  var due = button.parentElement.due;
  doCreateTask(name, due, errorBoxID);
}

//var goalButton = document.getElementById("goal-submit");
//goalButton.onclick = 
function doCreateGoalClick(button){
  var name = button.parentElement.name;
  var notes = button.parentElement.notes;
  var due = button.parentElement.due;
  var tasks = button.parentElement.querySelectorAll('.filled');
  doCreateGoal(name, notes, due, tasks, errorBoxID);
}




