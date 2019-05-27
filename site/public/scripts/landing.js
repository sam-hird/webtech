function validateEmail(email){
  //regex to match email adresses
  var re = 	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function showLogin(){
  document.getElementById('log-in-form').style.display = 'flex';
  document.getElementById('sign-up-form').style.display = 'none';
  document.getElementById('error-box').querySelector('p').innerHTML = "";
}
function showSignUp(){
  document.getElementById('log-in-form').style.display = 'none';
  document.getElementById('sign-up-form').style.display = 'flex';
  document.getElementById('error-box').querySelector('p').innerHTML = "";
}

function doLogin(email, password, errorBoxID){
  if (validateEmail(email)){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/do/login', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            window.location.href = "/dashboard.html";
          
        } else if (this.readyState === XMLHttpRequest.DONE && this.status === 401){
          //set error box to display bad login error
          
          var error = "invalid email/password combination";
          document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
        }
    };
    xhr.send("email=" + email + "&password=" + password);
  } else {
    
    //set error message in error box
    var error = "Please enter a valid email";
    document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
  }
}

function doSignup(email, password, password2, errorBoxID){
  if (validateEmail(email)){
    if (password == password2){
      if (password.length >= 8 && password.length <= 64){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/do/signup', true);

        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function() { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                window.location.href = "/dashboard.html";

            } else if (this.readyState === XMLHttpRequest.DONE && this.status === 401){
              //set error box to display bad login error

              var error = "invalid email/password combination";
              document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
            }
        };
        xhr.send("email=" + email + "&password=" + password);
      } else {
        var error = "password bust be between 8 and 64 characters";
        document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
      }
    } else {
      var error = "passwords do not match";
      document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
      
    }
  } else {
    //set error message in error box
    var error = "Please enter a valid email";
    document.getElementById(errorBoxID).querySelector("p").innerHTML = error;
  }
}

var errorBoxID = "error-box";

var loginButton = document.getElementById("log-in-button");
loginButton.onclick = function(){
  var loginEmail = loginButton.parentElement.email.value;
  var loginPass = loginButton.parentElement.password.value;
  doLogin(loginEmail, loginPass, errorBoxID);
}


var signupButton = document.getElementById("sign-up-button");
signupButton.onclick = function(){
  var signupEmail = signupButton.form.email.text; 
  var signupPass = signupButton.form.password.text;
  var signupPass2 = signupButton.form.password2.text;
  doSignup(signupEmail, signupPass, signupPass2, errorBoxID);
}