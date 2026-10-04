  const signupForm = document.getElementById("signupForm");
const profile = document.getElementById("profile");

const savedUsername = localStorage.getItem("username");
const savedPassword = localStorage.getItem("password")


if (savedUsername) {

    signupForm.style.display = "none";

    profile.style.display = "block";

    document.getElementById("profileUsername").textContent = savedUsername;
    document.getElementById("profilepassword").textContent = savedPassword

} else {

    signupForm.style.display = "block";

    profile.style.display = "none";

}


signupForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;


    localStorage.setItem("username", username);
    localStorage.setItem("password", password);


    location.reload();

});