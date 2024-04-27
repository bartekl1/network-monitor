const textTranslations = [
    "Zaloguj się",
    "Nazwa użytkownika",
    "Hasło",
    "Błędna nazwa użytkownika lub hasło",
    "Wystąpił błąd",
    "Edytuj użytkownika",
    "Zmień hasło",
    "Wyloguj się",
    "Zapisz",
    "E-mail jest wykorzystywany, aby pobrać twoje zdjęcie profilowe z",
    "Nazwa użytkownika jest zajęta",
    "Hasła nie są takie same",
    "Wprowadź ponownie hasło"
];

const titleTranslations = {
    "Network Monitor": "Network Monitor",
    "Log in": "Zaloguj się",
};

const placeholdersTranslations = {
    "Username": "Nazwa użytkownika",
    "Password": "Hasło",
    "E-mail": "E-mail",
    "Retype password": "Wprowadź ponownie hasło",
};

const alternativeTextTranslations = {};

const elementsTitlesTranslations = {};

const dataBSTranslations = {};

if (window.navigator.language.split("-")[0] == "pl") {
    document.querySelector("html").lang = "pl";
    // document.querySelector("link[rel=manifest]").href = "/manifest_pl.json";
    document.querySelector("title").innerHTML = titleTranslations[document.querySelector("title").innerHTML];
    document.querySelectorAll("[text-id]").forEach((e) => { e.innerHTML = textTranslations[e.getAttribute("text-id")]; });
    document.querySelectorAll("[placeholder]").forEach((e) => { e.placeholder = placeholdersTranslations[e.placeholder]; });
    document.querySelectorAll("[alt]").forEach((e) => { e.alt = alternativeTextTranslations[e.alt]; });
    document.querySelectorAll("[title]").forEach((e) => { e.title = elementsTitlesTranslations[e.title]; });
    document.querySelectorAll("[data-bs-original-title]").forEach((e) => { e.setAttribute("data-bs-original-title", dataBSTranslations[e.getAttribute("data-bs-original-title")] ); });
}
