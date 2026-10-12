document.addEventListener("click", (event) => {
    const button = event.target.closest(".btnOptions");

    if (!button) return;

    const dropdownBox = button.parentElement.querySelector(".dropdown-box");

    if (dropdownBox) {
        dropdownBox.classList.toggle("show");
    }
});