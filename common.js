// Shared by index.html (app.js) and project.html (project.js).
const $ = (s) => document.querySelector(s);
const short = {
  SimNet: "Simulator Network Tools & More.",
  "Dev Status Check": "Cloud & API outage alerts.",
  Switcher: "Turn your photo and video folders into a slideshow for your Mac.",
  "KDB Dashboard": "Calendar, Photos & Weather on your TV.",
  DesktopExtend: "Gives your Mac a second desktop.",
};
const esc = (s) =>
  String(s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// URL key for a project: an explicit "slug" in content.json, or the name with
// spaces and punctuation removed ("KDB Dashboard" -> "KDBDashboard").
function slug(p) {
  return p.slug || p.name.replace(/[^a-z0-9]/gi, "");
}
function projectURL(p) {
  return "project.html?app=" + encodeURIComponent(slug(p));
}
function findProject(projects, key) {
  key = String(key || "").toLowerCase();
  return projects.find(
    (p) =>
      slug(p).toLowerCase() === key ||
      p.name.replace(/[^a-z0-9]/gi, "").toLowerCase() === key,
  );
}
function loadContent() {
  return fetch("content.json").then((r) => {
    if (!r.ok) throw Error();
    return r.json();
  });
}
function linkButtons(p) {
  return (p.links || [])
    .filter((l) => l.disabled || l.comingSoon || /^https?:/.test(l.url))
    .map((l) => {
      const label = `${esc(l.label || "Visit project")} ↗`;
      if (l.comingSoon)
        return `<span class="button is-disabled is-coming-soon" aria-disabled="true"><span class="button-label">${label}</span><span class="coming-soon-overlay">Coming Soon</span></span>`;
      if (l.disabled)
        return `<span class="button is-disabled" aria-disabled="true">${label}</span>`;
      return `<a class="button" href="${esc(l.url)}" target="_blank" rel="noopener">${label}</a>`;
    })
    .join("");
}

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
// root: the element holding the gallery markup (#dialog-content or #project-page).
function bindGallery(p, root) {
  const imgs = screenshots(p);
  if (!imgs.length) return;
  const viewer = root.querySelector(".image-viewer");
  const dialogClose = root.closest("dialog")?.querySelector(".close");
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
    root.classList.remove("viewing");
    if (dialogClose) dialogClose.hidden = false;
    origin?.focus();
  }
  root.querySelectorAll("[data-shot]").forEach(
    (b) =>
      (b.onclick = () => {
        origin = b;
        show(+b.dataset.shot);
        viewer.hidden = false;
        root.classList.add("viewing");
        if (dialogClose) dialogClose.hidden = true;
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
    // Inside a dialog, Escape is handled by the dialog's cancel event below.
    if (e.key === "Escape" && !root.closest("dialog")) {
      e.preventDefault();
      close();
    }
  };
  const dialog = root.closest("dialog");
  if (dialog)
    dialog.oncancel = (e) => {
      if (!viewer.hidden) {
        e.preventDefault();
        close();
      }
    };
}

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
$("#year").textContent = new Date().getFullYear();
