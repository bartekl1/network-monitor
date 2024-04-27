function editUser() {
    var username = document.querySelector("#username").value;
    var email = document.querySelector("#email").value;

    document.querySelector("#username-taken").classList.add("d-none");
    document.querySelector("#edit-user-error-occurred").classList.add("d-none");
    
    username === "" ? document.querySelector("#username").classList.add("is-invalid") : document.querySelector("#username").classList.remove("is-invalid");
    email === "" ? document.querySelector("#email").classList.add("is-invalid") : document.querySelector("#email").classList.remove("is-invalid");
    
    if (username === "" || email === "") return;
    
    document.querySelector("#save-user").classList.add("d-none");
    document.querySelector("#save-user-loading").classList.remove("d-none");

    fetch("/api/user",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "PUT",
            body: JSON.stringify({username: username, email: email})
        })
    .then((res) => { return res.json() })
    .then((json) => {
        if (json.status == "ok") {
            window.location.reload();
        } else if (json.status == "error" && json.error == "username_taken") {
            document.querySelector("#username-taken").classList.remove("d-none");
        } else if (json.status == "error") {
            document.querySelector("#edit-user-error-occurred").classList.remove("d-none");
        }

        document.querySelector("#save-user").classList.remove("d-none");
        document.querySelector("#save-user-loading").classList.add("d-none");
    })
    .catch((res) => {
        document.querySelector("#edit-user-error-occurred").classList.remove("d-none");
        document.querySelector("#save-user").classList.remove("d-none");
        document.querySelector("#save-user-loading").classList.add("d-none");
    })
}

function changePassword() {
    var password = document.querySelector("#password").value;
    var retypePassword = document.querySelector("#retype-password").value;

    password == "" ? document.querySelector("#password").classList.add("is-invalid") : document.querySelector("#password").classList.remove("is-invalid");
    retypePassword == "" ? document.querySelector("#retype-password").classList.add("is-invalid") : document.querySelector("#retype-password").classList.remove("is-invalid");
    
    if (password === "" || retypePassword === "") return;
    
    password === retypePassword ? document.querySelector("#passwords-not-same").classList.add("d-none") : document.querySelector("#passwords-not-same").classList.remove("d-none");
    
    if (password !== retypePassword) return;

    document.querySelector("#change-password-error-occurred").classList.add("d-none");
    
    document.querySelector("#change-password").classList.add("d-none");
    document.querySelector("#change-password-loading").classList.remove("d-none");

    fetch("/api/user/password",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "PUT",
            body: JSON.stringify({password: password})
        })
    .then((res) => { return res.json() })
    .then((json) => {
        if (json.status == "ok") {
            window.location.reload();
        } else if (json.status == "error") {
            document.querySelector("#change-password-error-occurred").classList.remove("d-none");
        }

        document.querySelector("#change-password").classList.remove("d-none");
        document.querySelector("#change-password-loading").classList.add("d-none");
    })
    .catch((res) => {
        document.querySelector("#change-password-error-occurred").classList.remove("d-none");
        document.querySelector("#change-password").classList.remove("d-none");
        document.querySelector("#change-password-loading").classList.add("d-none");
    })
}

document.querySelector("#save-user").addEventListener("click", editUser);
document.querySelector("#change-password").addEventListener("click", changePassword);
