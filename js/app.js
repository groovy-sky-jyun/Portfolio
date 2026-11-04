// 해시 라우팅 3단계: #/ (프로젝트 카드) → #/eclipse (프로젝트) → #/eclipse/refactor (개발 내용 상세)
const { owner, projects } = window.PORTFOLIO;
const app = document.getElementById("app");
const zoom = document.getElementById("zoom");
const scrollMemory = new Map();
let currentRoute = null;

const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function highlight(code) {
  const token = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?f?)\b|\b([A-Za-z_]\w*)\b/gm;
  const keywords = /^(const|float|bool|if|this|true|false|uint8)$/;
  let out = "";
  let last = 0;
  for (const m of code.matchAll(token)) {
    out += esc(code.slice(last, m.index));
    const text = esc(m[0]);
    if (m[1]) out += `<span class="c">${text}</span>`;
    else if (m[2]) out += `<span class="s">${text}</span>`;
    else if (m[3]) out += `<span class="n">${text}</span>`;
    else if (keywords.test(m[4])) out += `<span class="k">${text}</span>`;
    else if (/^[UAFTEI][A-Z]/.test(m[4])) out += `<span class="y">${text}</span>`;
    else out += text;
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

const chips = (items, cls = "tag") => items.map((item) => `<span class="${cls}">${esc(item)}</span>`).join("");
const statBlocks = (items) => `<div class="stats">${items.map(([b, s]) => `<div class="stat"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>`;

const isWide = (ar = "16/9") => {
  const [w, h] = ar.split("/").map(Number);
  return w / h > 2;
};

function renderSection(s) {
  switch (s.t) {
    case "text":
      return `<div class="sec-text"><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>`;
    case "list":
      return `<div class="sec-list"><h3>${esc(s.h)}</h3><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`;
    case "stats":
      return statBlocks(s.items);
    case "callout":
      return `<p class="callout">${esc(s.p)}</p>`;
    case "grid":
      return `<div class="sec-grid cols-${s.cols || 2}">${s.items.map(renderSection).join("")}</div>`;
    case "clip":
      return `<figure class="clip${isWide(s.ar) ? " wide" : ""}"><button class="media" type="button" aria-label="크게 보기: ${esc(s.cap)}" style="aspect-ratio:${s.ar || "16/9"}"><video src="${s.src}" poster="${s.poster}" data-autoplay muted loop playsinline preload="none" style="object-position:50% ${s.oy || "50%"}"></video></button><figcaption>${esc(s.cap)}</figcaption></figure>`;
    case "img":
      return `<figure class="shot"><button class="media" type="button" aria-label="크게 보기: ${esc(s.cap)}"><img src="${s.src}" alt="${esc(s.cap)}" loading="lazy"></button><figcaption>${esc(s.cap)}</figcaption></figure>`;
    case "code":
      return `<div class="sec-code"><h3>${esc(s.h)}</h3><pre><code>${highlight(s.code)}</code></pre></div>`;
    case "table": {
      const cell = (value, i) => {
        if (i === 0) return `<th scope="row">${esc(value)}</th>`;
        const dim = value === "—" ? ' class="dim"' : "";
        return `<td${dim}>${esc(value)}</td>`;
      };
      return `<div class="table-wrap ${s.cls || ""}"><table><thead><tr>${s.head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${s.rows.map((r) => `<tr>${r.map(cell).join("")}</tr>`).join("")}</tbody></table></div>`;
    }
    case "flow":
      return `<div class="flow"><h3>${esc(s.h)}</h3><ol>${s.steps.map(([l, p], i) => `<li class="${i === s.steps.length - 1 ? "cause" : ""}"><span>${esc(l)}</span><p>${esc(p)}</p></li>`).join("")}</ol></div>`;
    case "life":
      return `<ol class="life">${s.items.map(([c, d, lock]) => `<li class="${lock ? "lock" : ""}"><code>${esc(c)}</code><span>${esc(d)}</span></li>`).join("")}</ol>`;
    case "card":
      return `<div class="compare ${s.strong ? "strong" : ""}"><span class="compare-badge">${esc(s.badge)}</span><h3>${esc(s.h)}</h3><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`;
    default:
      return "";
  }
}

function renderNav() {
  const links = projects.map((p) => `<a href="#/${p.id}">${esc(p.title)}</a>`).join("");
  return `<header class="site-nav"><div class="wrap"><a class="brand" href="#/"><strong>${esc(owner.name)}</strong><small>${esc(owner.role)}</small></a><nav aria-label="프로젝트">${links}<a href="${owner.github}">GitHub</a></nav></div></header>`;
}

function renderHome() {
  const cards = projects
    .map(
      (p) => `<a class="card project-card tone-${p.tone}" href="#/${p.id}">
        <div class="thumb"><img src="${p.cover}" alt="${esc(p.title)} 화면"><span class="engine">${esc(p.engine)}</span></div>
        <div class="card-body">
          <div class="meta"><span class="status">${esc(p.team)}</span><span class="period">${esc(p.period)}</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.genre)}</p>
          <div class="card-foot"><div class="tags">${chips(p.stack)}</div><span class="cta">프로젝트 보기</span></div>
        </div>
      </a>`
    )
    .join("");
  return `${renderNav()}<main class="wrap home">
    <section class="intro"><p class="role">${esc(owner.role)}</p><h1>${esc(owner.tagline)}</h1><p class="sub">${esc(owner.sub)}</p></section>
    <section class="projects"><h2>Projects</h2><div class="project-list">${cards}</div></section>
  </main>`;
}

function renderHero(p) {
  const media =
    p.hero.type === "video"
      ? `<video src="${p.hero.src}" poster="${p.hero.poster}" controls data-autoplay muted loop playsinline preload="metadata"></video>`
      : `<img src="${p.hero.src}" alt="${esc(p.title)} 화면">`;
  const note = p.hero.note ? `<span class="hero-note">${esc(p.hero.note)}</span>` : "";
  return `<div class="hero-media">${media}${note}</div>`;
}

function renderProject(p) {
  const groups = p.groups
    .map(
      (g) => `<section class="group"><div class="group-head"><h2>${esc(g.title)}</h2><p>${esc(g.lead)}</p></div><div class="hl-grid">${g.items
        .map((item) => {
          const thumb = item.thumbStat
            ? `<div class="thumb stat-thumb"><b>${esc(item.thumbStat)}</b></div>`
            : `<div class="thumb"${item.hoverClip ? ` data-hover="${item.hoverClip}"` : ""}><img src="${item.thumb}" alt="" loading="lazy"></div>`;
          return `<a class="card hl-card" href="#/${p.id}/${item.id}">${thumb}<div class="card-body"><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p><div class="card-foot"><div class="tags">${chips(item.tags)}</div><span class="cta">자세히 보기</span></div></div></a>`;
        })
        .join("")}</div></section>`
    )
    .join("");
  const github = p.github ? `<a class="repo" href="${p.github}">GitHub 저장소</a>` : "";
  return `${renderNav()}<main class="wrap project tone-${p.tone}">
    <nav class="crumb" aria-label="현재 위치"><a href="#/">Projects</a><span>/</span><span>${esc(p.title)}</span></nav>
    <section class="project-hero">
      ${renderHero(p)}
      <div class="hero-info">
        <div class="meta"><span class="status">${esc(p.team)}</span><span class="period">${esc(p.period)}</span></div>
        <h1>${esc(p.title)}</h1>
        <p class="genre">${esc(p.genre)}</p>
        <p class="summary">${esc(p.summary)}</p>
        <div class="tags">${chips(p.stack)}</div>
        ${github}
      </div>
    </section>
    ${statBlocks(p.stats)}
    <section class="overview">
      <div class="arch"><h2>아키텍처</h2><p>${esc(p.archLead)}</p><dl>${p.arch.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>
      <div class="features"><h2>주요 기능</h2><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>
    </section>
    ${groups}
  </main>`;
}

function renderDetail(p, item) {
  const all = p.groups.flatMap((g) => g.items);
  const i = all.indexOf(item);
  const prev = all[i - 1];
  const next = all[i + 1];
  const pager = `<nav class="pager" aria-label="다른 개발 내용">${prev ? `<a href="#/${p.id}/${prev.id}"><small>이전</small>${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a class="next" href="#/${p.id}/${next.id}"><small>다음</small>${esc(next.title)}</a>` : "<span></span>"}</nav>`;
  return `${renderNav()}<main class="wrap"><article class="detail tone-${p.tone}">
    <nav class="crumb" aria-label="현재 위치"><a href="#/">Projects</a><span>/</span><a href="#/${p.id}">${esc(p.title)}</a><span>/</span><span>${esc(item.title)}</span></nav>
    <header class="detail-head"><h1>${esc(item.title)}</h1><p>${esc(item.summary)}</p><div class="tags">${chips(item.tags)}</div></header>
    <div class="sections">${item.sections.map(renderSection).join("")}</div>
    ${pager}
  </article></main>`;
}

// 보이는 영상만 재생
const videoObserver = new IntersectionObserver(
  (entries) => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    }
  },
  { threshold: 0.35 }
);

function route() {
  const [, projectId, itemId] = location.hash.replace(/^#\/?/, "/").split("/");
  const project = projects.find((p) => p.id === projectId);
  const item = project?.groups.flatMap((g) => g.items).find((i) => i.id === itemId);
  const routeKey = location.hash || "#/";

  if (currentRoute) scrollMemory.set(currentRoute, scrollY);
  if (item) app.innerHTML = renderDetail(project, item);
  else if (project) app.innerHTML = renderProject(project);
  else app.innerHTML = renderHome();
  app.querySelectorAll("video[data-autoplay]").forEach((video) => videoObserver.observe(video));
  scrollTo(0, scrollMemory.get(routeKey) || 0);
  currentRoute = routeKey;

  const label = item ? item.title : project ? project.title : "포트폴리오";
  document.title = `${label} · ${owner.name}`;
}

// 카드에 마우스를 올리면 영상 미리보기
document.addEventListener("pointerover", (event) => {
  if (event.pointerType !== "mouse") return;
  const card = event.target.closest(".card");
  const box = card?.querySelector("[data-hover]");
  if (!box || box.querySelector("video")) return;
  const video = document.createElement("video");
  video.src = box.dataset.hover;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("aria-hidden", "true");
  box.append(video);
  video.play().catch(() => {});
  card.addEventListener("pointerleave", () => video.remove(), { once: true });
});

// 클릭하면 크게 보기
document.addEventListener("click", (event) => {
  const trigger = event.target.closest(".media");
  if (!trigger) return;
  const video = trigger.querySelector("video");
  const img = trigger.querySelector("img");
  const body = zoom.querySelector(".zoom-body");
  body.replaceChildren();
  if (video) {
    const large = document.createElement("video");
    large.src = video.getAttribute("src");
    Object.assign(large, { muted: true, loop: true, controls: true, playsInline: true, autoplay: true });
    body.append(large);
  } else if (img) {
    const large = document.createElement("img");
    large.src = img.getAttribute("src");
    large.alt = img.alt;
    body.append(large);
  }
  zoom.showModal();
});
zoom.querySelector(".zoom-close").addEventListener("click", () => zoom.close());
zoom.addEventListener("click", (event) => event.target === zoom && zoom.close());
zoom.addEventListener("close", () => zoom.querySelector(".zoom-body").replaceChildren());

addEventListener("hashchange", route);
route();
