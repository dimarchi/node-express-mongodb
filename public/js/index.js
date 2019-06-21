document.addEventListener("DOMContentLoaded", () => {

    console.log("DOM loaded.");

    const loginForm = document.querySelector("#login");
    const loginResult = document.querySelector("#loginresult");

    const registrationForm = document.querySelector("#registration");
    const registrationResult = document.querySelector("#registrationresult");

    const logoutLink = document.querySelector("#logout");

    loginResult.classList.remove("errormsg");
    loginResult.textContent = " ";
    registrationResult.classList.remove("errormsg");
    registrationResult.textContent = " ";

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        let data = new FormData(loginForm);
        let jsonData = {
            name: data.get("loginname"),
            password: data.get("loginpass")
        }

        processFormData("/login", jsonData);

        return false;
    });

    registrationForm.addEventListener("submit", (event) => {
        event.preventDefault();

        let data = new FormData(registrationForm);
        let jsonData = {
            name: data.get("registrationname"),
            password: data.get("registrationpass"),
            email: data.get("registrationemail")
        }
        
        processFormData("/register", jsonData);

        return false;
    });

    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();

        fetch("/logout")
        .then(response => {
            response.json().then(data => {
                if (data.result == false) {
                    alert("you have been logged out");
                    location.reload(true);
                } else {
                    alert("Error!");
                }
            })
        })
        .catch(error => {
            console.log(error);
        })
    });

    const processFormData = (sendToThisPage, formData) => {
        return new Promise((resolve, reject) => {
            fetch(sendToThisPage, {
                method: "POST",
                body: JSON.stringify(formData),
             headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
             }
            })
            .then(response => {
                response.json().then(data => {
                    resolve(data);

                    loginMessages(data);
                    regitrationMessages(data);
                })
            })
            .catch(error => {
                reject(error);
            }) 
        })
    }

    const loginMessages = (data) => {
        if (data.login == true || data.login == false) {
            loginResult.textContent = " ";
            loginResult.classList.remove("errormsg");

            if (data.login == true) {
                loginResult.textContent = data.body;
                
                let secondTimer = "";
                clearTimeout(secondTimer);
                secondTimer = setTimeout(() => {
                    location.reload(true);
                }, 5000) // reloading after 5 seconds
            } else {
                loginResult.classList.add("errormsg");
                loginResult.textContent = data.body;
            }

            let timer = "";
            clearTimeout(timer);
            timer = setTimeout(() => {
                loginResult.textContent = " ";
                loginResult.classList.remove("errormsg");
            }, 5000); // message is visible for 5 seconds
        }
    }

    const regitrationMessages = (data) => {
        if (data.registered == true || data.registered == false) {
            registrationResult.textContent = " ";
            registrationResult.classList.remove("errormsg");

            if (data.login == true) {
                registrationResult.textContent = data.body;
            } else {
                registrationResult.classList.add("errormsg");
                registrationResult.textContent = data.body;
            }

            let timer = "";
            clearTimeout(timer);
            timer = setTimeout(() => {
                registrationResult.textContent = " ";
                registrationResult.classList.remove("errormsg");
            }, 5000); // message is visible for 5 seconds
        }
    }
});