const $ = (s) => document.querySelector(s);
let data,
  filter = "All",
  expanded = false;
const short = {
  SimNet: "Simulator Network Tools & More.",
  "Dev Status Check": "Cloud & API outage alerts.",
  eShow: "Mobile experiences for events and conferences.",
  "KDB Dashboard": "Calendar, Photos & Weather on your TV.",
  Zelle: "The number 1 way to instantly send and receive money.",
  Golfshot: "World’s most powerful and trusted golfing app.",
};
const esc = (s) =>
  String(s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
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
    `<img class="detail-icon" src="${esc(p.icon)}" alt=""><p class="eyebrow">${esc(p.platform)}</p><h2>${esc(p.name)}</h2><p>${esc(p.description || short[p.name] || "Explore this project on the original portfolio.")}</p>${galleryMarkup(p)}<div class="dialog-links">${(
      p.links || []
    )
      .filter((l) => /^https?:/.test(l.url))
      .map(
        (l) =>
          `<a class="button" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || "Visit project")} ↗</a>`,
      )
      .join("")}</div>`;
  bindGallery(p);
  $("#project-dialog").showModal();
}
fetch("content.json")
  .then((r) => {
    if (!r.ok) throw Error();
    return r.json();
  })
  .then((d) => {
    data = d;
    $("#count").textContent = d.projects.length;
    const picks = [
      "SimNet",
      "Dev Status Check",
	  "DesktopExtend",
      "eShow",
	  "Zelle",
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
$(".menu").onclick = () => {
  let open = $("nav").classList.toggle("open");
  $(".menu").setAttribute("aria-expanded", String(open));
};
document.querySelectorAll("nav a").forEach(
  (a) =>
    (a.onclick = () => {
      $("nav").classList.remove("open");
      $(".menu").setAttribute("aria-expanded", "false");
    }),
);
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
$("#year").textContent = new Date().getFullYear();
$("#print").onclick = () => {
  document.querySelectorAll(".role").forEach((e) => (e.open = true));
  window.print();
};

function screenshots(p) {
  return p.screenshots?.length
    ? p.screenshots
    : p.image
      ? [{ src: p.image, alt: p.name + " screenshot" }]
      : [];
}
function galleryMarkup(p) {
  const imgs = screenshots(p);
  if (!imgs.length) return "";
  return `<section class="screenshot-gallery" aria-label="${esc(p.name)} screenshots"><div class="gallery-heading"><h3>Screenshots</h3><span>${imgs.length} image${imgs.length === 1 ? "" : "s"} · Select to enlarge</span></div><div class="screenshot-strip">${imgs.map((im, i) => `<button class="screenshot-thumb" data-shot="${i}" aria-label="Enlarge ${esc(im.alt)}"><img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy"><span>${String(i + 1).padStart(2, "0")} <span aria-hidden="true">↗</span></span></button>`).join("")}</div></section><div class="image-viewer" hidden role="region" aria-label="Enlarged screenshots"><div class="viewer-bar"><span class="viewer-counter" aria-live="polite"></span><button class="viewer-close" aria-label="Back to project">✕</button></div><div class="viewer-stage"><img class="viewer-image" alt=""></div><div class="viewer-controls"><button class="viewer-prev" aria-label="Previous screenshot">← Previous</button><span class="viewer-caption"></span><button class="viewer-next" aria-label="Next screenshot">Next →</button></div></div>`;
}
function bindGallery(p) {
  const imgs = screenshots(p);
  if (!imgs.length) return;
  const viewer = $(".image-viewer");
  let index = 0,
    origin;
  function show(i) {
    index = (i + imgs.length) % imgs.length;
    $(".viewer-image").src = imgs[index].src;
    $(".viewer-image").alt = imgs[index].alt;
    $(".viewer-counter").textContent =
      p.name + " · " + (index + 1) + " / " + imgs.length;
    $(".viewer-caption").textContent = imgs[index].alt;
  }
  function close() {
    viewer.hidden = true;
    $("#dialog-content").classList.remove("viewing");
    $(".close").hidden = false;
    origin?.focus();
  }
  document.querySelectorAll("[data-shot]").forEach(
    (b) =>
      (b.onclick = () => {
        origin = b;
        show(+b.dataset.shot);
        viewer.hidden = false;
        $("#dialog-content").classList.add("viewing");
        $(".close").hidden = true;
        $(".viewer-close").focus();
      }),
  );
  $(".viewer-close").onclick = close;
  $(".viewer-prev").onclick = () => show(index - 1);
  $(".viewer-next").onclick = () => show(index + 1);
  $(".viewer-prev").hidden = imgs.length < 2;
  $(".viewer-next").hidden = imgs.length < 2;
  viewer.onkeydown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      show(index - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      show(index + 1);
    }
  };
  $("#project-dialog").oncancel = (e) => {
    if (!viewer.hidden) {
      e.preventDefault();
      close();
    }
  };
}
