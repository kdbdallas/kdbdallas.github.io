const dialog = document.querySelector(".image-dialog");
const dialogImage = dialog.querySelector("img");
const closeDialog = dialog.querySelector(".image-dialog-close");
let trigger;

function closePreview() {
  dialog.close();
  trigger?.focus();
}

document.querySelectorAll(".screenshot-preview").forEach((preview) => {
  preview.addEventListener("click", () => {
    trigger = preview;
    dialogImage.src = preview.dataset.previewSrc;
    dialogImage.alt = preview.dataset.previewAlt;
    dialog.showModal();
    closeDialog.focus();
  });
});

closeDialog.addEventListener("click", closePreview);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closePreview();
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePreview();
});
