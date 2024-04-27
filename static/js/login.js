function login() {
    var username = document.querySelector("#username").value;
    var password = document.querySelector("#password").value;

    document.querySelector("#error-occurred").classList.add("d-none");
    document.querySelector("#wrong-username-or-password").classList.add("d-none");
    
    username == "" ? document.querySelector("#username").classList.add("is-invalid") : document.querySelector("#username").classList.remove("is-invalid");
    password == "" ? document.querySelector("#password").classList.add("is-invalid") : document.querySelector("#password").classList.remove("is-invalid");
    
    if (username == "" || password == "") return;
    
    document.querySelector("#login").classList.add("d-none");
    document.querySelector("#login-loading").classList.remove("d-none");

    fetch("/api/login",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({username: username, password: password})
        })
    .then((res) => { return res.json() })
    .then((json) => {
        if (json.status == "ok") {
            window.location.href = "/";
        } else if (json.status == "error" && json.error == "wrong_username_or_password") {
            document.querySelector("#wrong-username-or-password").classList.remove("d-none");
        } else if (json.status == "error") {
            document.querySelector("#error-occurred").classList.remove("d-none");
        }

        document.querySelector("#login").classList.remove("d-none");
        document.querySelector("#login-loading").classList.add("d-none");
    })
    .catch((res) => {
        document.querySelector("#error-occurred").classList.remove("d-none");
        document.querySelector("#login").classList.remove("d-none");
        document.querySelector("#login-loading").classList.add("d-none");
    })
}

document.querySelector("#login").addEventListener("click", login);
document.querySelector("#username").addEventListener("keyup", (evt) => { if (evt.key === 'Enter' || evt.keyCode === 13) { login(); }});
document.querySelector("#password").addEventListener("keyup", (evt) => { if (evt.key === 'Enter' || evt.keyCode === 13) { login(); }});
