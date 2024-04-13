function loadTheme() {
    var theme;
    if (localStorage.getItem("theme") !== null) {
        theme = localStorage.getItem("theme");
    } else {
        theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    document.querySelector("html").setAttribute("data-bs-theme", theme);
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { loadTheme(); });

loadTheme();
