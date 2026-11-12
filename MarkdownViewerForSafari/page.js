function bindPanelControls(group) {
  const buttons = [...group.querySelectorAll("button")];

  function select(activeButton) {
    for (const button of buttons) {
      const selected = button === activeButton;
      button.setAttribute("aria-pressed", String(selected));
      document.getElementById(button.getAttribute("aria-controls")).hidden = !selected;
    }
  }

  for (const button of buttons) {
    button.addEventListener("click", () => select(button));
  }

  select(group.querySelector('[aria-pressed="true"]'));
  group.hidden = false;
}

document.querySelectorAll(".segmented").forEach(bindPanelControls);
