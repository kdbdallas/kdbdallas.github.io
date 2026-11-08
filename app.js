let data,
  filter = "All",
  expanded = false;
function category(p) {
  return /tv|TV/.test(p.platform)
    ? "TV"
    : /Mac/.test(p.platform)
      ? "Mac"
      : "iOS";
}
function render() {
  let list = data.projects.filter(
    (p) =>
      filter === "All" ||
      (filter === "iOS"
        ? /iOS|iPhone|iPad|Watch/i.test(p.platform)
        : filter === "Mac"
          ? /Mac/i.test(p.platform)
          : /tv/i.test(p.platform)),
  );
  $("#projects").innerHTML = (expanded ? list : list.slice(0, 6))
    .map(
      (p) =>
        `<button class="project-card" data-project="${data.projects.indexOf(p)}" aria-label="View ${esc(p.name)} details"><div class="project-visual"><img loading="lazy" src="${esc(p.icon)}" alt="${esc(p.name)} app icon"><span>${esc(p.platform)}</span></div><div class="card-title"><h3>${esc(p.name)}</h3><span>↗</span></div><p>${esc(short[p.name] || p.platform + " application")}</p></button>`,
    )
    .join("");
  $("#empty").hidden = list.length > 0;
  $("#more").hidden = list.length <= 6;
  $("#more").innerHTML = expanded
    ? "Show selected projects ↑"
    : `View all ${list.length} projects ↓`;
  document
    .querySelectorAll("[data-project]")
    .forEach(
      (b) => (b.onclick = () => openProject(data.projects[+b.dataset.project])),
    );
}
function openProject(p) {
  $("#dialog-content").classList.remove("viewing");
  $(".close").hidden = false;
  $("#project-dialog").oncancel = null;
  $("#dialog-content").innerHTML =
    `<img class="detail-icon" src="${esc(p.icon)}" alt=""><p class="eyebrow">${esc(p.platform)}</p><h2>${esc(p.name)}</h2>${paragraphs(p.description || short[p.name] || "Explore this project on the original portfolio.")}${galleryMarkup(p)}<div class="dialog-links">${linkButtons(p)}<a class="text-link" href="${esc(projectURL(p))}">Open project page →</a></div>`;
  bindGallery(p, $("#dialog-content"));
  $("#project-dialog").showModal();
}
loadContent()
  .then((d) => {
    data = d;
    $("#count").textContent = d.projects.length;
    const picks = [
      "SimNet",
      "Dev Status Check",
      "DesktopExtend",
      "Switcher",
      "SwiftlyGit",
    ];
    $("#icon-composition").innerHTML = picks
      .map((n) => d.projects.find((p) => p.name === n))
      .filter(Boolean)
      .map(
        (p) =>
          `<img class="app-tile" src="${esc(p.icon)}" alt="${esc(p.name)}">`,
      )
      .join("");
    $("#timeline").innerHTML = d.experience
      .map(
        (e, i) =>
          `<details class="role" ${i === 0 ? "open" : ""}><summary><div><span class="dates">${esc(e.dates)}</span><h3>${esc(e.role)}</h3><span class="company">${esc(e.company)}</span></div></summary><ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></details>`,
      )
      .join("");
    render();
  })
  .catch(() => {
    $("#projects").textContent =
      "Projects could not load. Please refresh to try again.";
  });
document.querySelectorAll("[data-filter]").forEach(
  (b) =>
    (b.onclick = () => {
      filter = b.dataset.filter;
      expanded = false;
      document.querySelectorAll("[data-filter]").forEach((x) => {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      render();
    }),
);
$("#more").onclick = () => {
  expanded = !expanded;
  render();
  if (!expanded) $("#work").scrollIntoView();
};
$(".close").onclick = () => $("#project-dialog").close();
$("#project-dialog").onclick = (e) => {
  if (e.target === $("#project-dialog")) {
    let r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
};
$("#print").onclick = () => {
  document.querySelectorAll(".role").forEach((e) => (e.open = true));
  window.print();
};
