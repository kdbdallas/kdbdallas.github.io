// project.html?app=KDBDashboard -> renders that project from content.json.
// Matching ignores case, spaces and punctuation, or uses the project's "slug".
//
// Optional fields shown only on this page (add them to a project in content.json):
//   "sections": [
//     { "title": "Features", "body": "Paragraph one.\n\nParagraph two." },
//     { "title": "Requirements", "items": ["macOS 15 or later", "Apple silicon"] },
//     { "title": "Support", "link": "KDBDashboard-SUPPORT.html", "linkLabel": "Get help" }
//   ]
// Body text: a blank line starts a new paragraph; a single newline is a line break.
// "link" (relative path or full URL) adds a small text link; "linkLabel" is optional
// and defaults to showing the link itself. body, items and link can be combined.
function sectionsMarkup(p) {
  return (p.sections || [])
    .map(
      (s) =>
        `<section class="project-section">${s.title ? `<h3>${esc(s.title)}</h3>` : ""}${paragraphs(s.body)}${s.items?.length ? `<ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}${sectionLink(s)}</section>`,
    )
    .join("");
}
// Full URLs (http/https) open in a new tab; relative paths stay in this tab.
function sectionLink(s) {
  if (!s.link || /^\s*(javascript|data|vbscript):/i.test(s.link)) return "";
  const external = /^https?:/i.test(s.link);
  return `<a class="text-link section-link" href="${esc(s.link)}"${external ? ' target="_blank" rel="noopener"' : ""}>${esc(s.linkLabel || s.link)} <span aria-hidden="true">↗</span></a>`;
}
function setMeta(title, description) {
  document.title = title;
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", description);
}
function renderProject(p) {
  const blurb = short[p.name] || p.platform + " application";
  setMeta(`${p.name} — Dallas Brown`, blurb);
  const links = linkButtons(p);
  $("#project-page").innerHTML =
    `<div class="project-hero"><img class="detail-icon" src="${esc(p.icon)}" alt="${esc(p.name)} app icon"><div><p class="eyebrow">${esc(p.platform)}</p><h1>${esc(p.name)}</h1><p class="lead">${esc(blurb)}</p></div></div>${links ? `<div class="dialog-links">${links}</div>` : ""}<div class="project-body">${paragraphs(p.description || "Explore this project on the original portfolio.")}</div>${galleryMarkup(p)}${sectionsMarkup(p)}`;
  bindGallery(p, $("#project-page"));
}
function renderMissing(key) {
  setMeta("Project not found — Dallas Brown", "Project not found.");
  $("#project-page").innerHTML =
    `<p class="eyebrow">PROJECT NOT FOUND</p><h1>Nothing here yet.</h1><p class="lead">${key ? `There’s no project called “${esc(key)}”.` : "No project was specified."} Take a look at the full list instead.</p><a class="button" href="index.html#work">Browse all projects <span>→</span></a>`;
}

const appKey = new URLSearchParams(location.search).get("app");
loadContent()
  .then((d) => {
    const p = appKey && findProject(d.projects, appKey);
    p ? renderProject(p) : renderMissing(appKey);
  })
  .catch(() => {
    $("#project-page").textContent =
      "This project could not load. Please refresh to try again.";
  });
