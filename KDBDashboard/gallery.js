const dialog = document.querySelector(".image-dialog");
const dialogImage = dialog.querySelector("img");
let trigger;
document.querySelectorAll(".preview").forEach((preview) => {
  preview.addEventListener("click", () => {
    trigger = preview;
    dialogImage.src = preview.dataset.preview;
    dialogImage.alt = preview.dataset.alt;
    dialog.showModal();
    dialog.querySelector(".close").focus();
  });
});
dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener("close", () => trigger?.focus());
