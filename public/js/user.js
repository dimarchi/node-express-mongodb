document.addEventListener("DOMContentLoaded", () => {

    console.log("DOM loaded.");

    const updateForm = document.querySelector("#update");
    const updateResult = document.querySelector("#updateresult");
    const logoutLink = document.querySelector("#logout");

    updateResult.textContent = " ";

    updateForm.addEventListener("submit", (event) => {
        event.preventDefault();

        let data = new FormData(updateForm);

        let jsonData = {
            name: data.get("updatename"),
            password: data.get("updatepass"),
            email: data.get("updateemail")
        }

        processFormData("/update", jsonData);

        return false;
    });

    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();

        fetch("/logout")
        .then(response => {
            response.json().then(data => {
                if (data.result == false) {
                    alert("You have been logged out");
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
                    updateMessages(data);
                })
            })
            .catch(error => {
                reject(error);
            }) 
        })
    }

    const updateMessages = (data) => {
        updateResult.textContent = " ";
        updateResult.classList.remove("errormsg");

        if (data.update == true) {
            updateResult.textContent = data.body;
        } else {
            updateResult.classList.add("errormsg");
            updateResult.textContent = data.body;
        }

        let timer = "";
        clearTimeout(timer);
        timer = setTimeout(() => {
            updateResult.textContent = " ";
            updateResult.classList.remove("errormsg");
        }, 5000); // message is visible for 5 seconds
    }
})