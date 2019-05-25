
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
  newNode.classList.add('goal-task');
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
}
function showGoalForm(){
  document.getElementById("create-task-form").style.display = "none";
  document.getElementById("create-goal-form").style.display = "flex";
  document.getElementById("create-project-form").style.display = "none";
}
function showProjectForm(){
  document.getElementById("create-task-form").style.display = "none";
  document.getElementById("create-goal-form").style.display = "none";
  document.getElementById("create-project-form").style.display = "flex";
}