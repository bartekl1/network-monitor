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

function knownHost(mac, yes, e) {
    e.disabled = true;
    e.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    fetch(`/api/host/${mac}/known`,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "PUT",
            body: JSON.stringify({yes: yes})
        })
    .then(() => { window.location.reload(); })
}

function prepareEditHost(mac, icon, description) {
    document.querySelector("#host-icon").value = icon;
    document.querySelector("#host-description").value = description;
    document.querySelector("#save-host").onclick = () => { editHost(mac); };
}

function editHost(mac) {
    document.querySelector("#save-host").classList.add("d-none");
    document.querySelector("#save-host-loading").classList.remove("d-none");

    var icon = document.querySelector("#host-icon").value;
    var description = document.querySelector("#host-description").value;

    fetch(`/api/host/${mac}`,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "PUT",
            body: JSON.stringify({icon: icon, description: description})
        })
    .then(() => { window.location.reload(); })
}

function prepareDeleteHost(mac) {
    document.querySelector("#delete-host").onclick = () => { deleteHost(mac); };
}

function deleteHost(mac) {
    console.log(mac)
    document.querySelector("#delete-host").classList.add("d-none");
    document.querySelector("#delete-host-loading").classList.remove("d-none");

    fetch(`/api/host/${mac}`,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "DELETE"
        })
    .then(() => { window.location.reload(); })
}

document.querySelector("#save-user").addEventListener("click", editUser);
document.querySelector("#change-password").addEventListener("click", changePassword);
