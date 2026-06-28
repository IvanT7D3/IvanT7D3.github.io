(() => {

  const navItems = [
    { name: "Home", href: "index.html", title: "Back to main page", home: true },
    { name: "Offensive", href: "#offensive", title: "Posts about offensive security", section: "Offensive" },
    { name: "Defensive", href: "#defensive", title: "Posts about defensive security", section: "Defensive" },
    { name: "Writeups", href: "#writeups", title: "CTF writeups", section: "Writeups" },
    { name: "Certs", href: "certs.html", title: "Certifications obtained and planned" }
  ];

  const sectionContent = {
    Offensive: [
      { href: "bypassav.html", text: "Bypassing AVs" }
    ],
    Defensive: [
      { href: "rules.html", text: "YARA ATM Rules" }
    ],
    Writeups: [
      { href: "cap_htb.html", text: "HTB - Linux/Cap" }
    ]
  };

  function createNavBar() {
    const host = document.getElementById("nav-container");
    if (!host) return;

    const nav = document.createElement("nav");
    nav.className = "nav-bar";
    nav.setAttribute("aria-label", "Primary");

    const ul = document.createElement("ul");

    for (const item of navItems) {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.href = item.href;
      a.textContent = item.name;
      a.title = item.title;

      if (item.home) {
        a.classList.add("home-link");
      } else if (item.section) {
        a.classList.add("section-link");
        a.dataset.section = item.section;
      }

      li.appendChild(a);
      ul.appendChild(li);
    }

    nav.appendChild(ul);
    host.appendChild(nav);
  }

  function createSectionFragment(title, pages) {
    const fragment = document.createDocumentFragment();

    const h2 = document.createElement("h2");
    h2.textContent = title;
    fragment.appendChild(h2);

    const ul = document.createElement("ul");
    for (const { href, text } of pages) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = text;
      li.appendChild(a);
      ul.appendChild(li);
    }

    fragment.appendChild(ul);
    return fragment;
  }

  function clearActiveNav() {
    document.querySelectorAll(".nav-bar a.section-link.active")
      .forEach(a => a.classList.remove("active"));
  }

  function setActiveNavBySection(sectionNameOrNull) {
    clearActiveNav();
    if (!sectionNameOrNull) return;

    const link = document.querySelector(`.nav-bar a.section-link[data-section="${sectionNameOrNull}"]`);
    if (link) link.classList.add("active");
  }

  function renderSectionFromHash() {
    const container = document.getElementById("section-content");
    if (!container) return;

    const hash = (location.hash || "").toLowerCase();
    const map = {
      "#offensive": "Offensive",
      "#defensive": "Defensive",
      "#writeups": "Writeups"
    };

    const section = map[hash] || null;

    container.replaceChildren();
    if (!section) {
      setActiveNavBySection(null);
      return;
    }

    const pages = sectionContent[section] ?? [];
    container.appendChild(createSectionFragment(section, pages));
    setActiveNavBySection(section);
  }

  function installNavHandler() {
    const navHost = document.getElementById("nav-container");
    if (!navHost) return;

    navHost.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;

      if (link.classList.contains("section-link")) {

        if (link.getAttribute("href") === location.hash) {
          event.preventDefault();
          history.pushState("", document.title, window.location.pathname + window.location.search);
          renderSectionFromHash();
        }
      }
    });
  }

  function setupLightbox() {
    const imgs = document.querySelectorAll(".content img");
    if (!imgs.length) return;

    let overlay = null;
    let lastFocus = null;
    let closeButton = null;

    function close() {
      if (!overlay) return;
      overlay.remove();
      overlay = null;
      closeButton = null;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function onKey(e) {
      if (!overlay) return;
      if (e.key === "Escape") {
        close();
      } else if (e.key === "Tab") {

        e.preventDefault();
        if (closeButton) closeButton.focus();
      }
    }

    function open(src, alt) {
      if (overlay) return;
      lastFocus = document.activeElement;

      overlay = document.createElement("div");
      overlay.className = "lightbox-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", alt || "Image preview");

      const big = document.createElement("img");
      big.src = src;
      big.alt = alt || "";

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "lightbox-close";
      closeBtn.textContent = "✕";
      closeBtn.setAttribute("aria-label", "Close image preview");
      closeBtn.addEventListener("click", close);

      overlay.appendChild(big);
      overlay.appendChild(closeBtn);

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
      });

      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
      closeButton = closeBtn;
      closeBtn.focus();
    }

    imgs.forEach((img) => {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", (img.alt ? img.alt + " - " : "") + "enlarge image");
      img.addEventListener("click", () => open(img.src, img.alt));
      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(img.src, img.alt); }
      });
    });
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {  }

    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (e) {
      return false;
    }
  }

  function setupCopyButtons() {
    const blocks = document.querySelectorAll(".container, .container-wrap");

    blocks.forEach((block) => {
      const text = block.textContent.trim();
      if (!text) return;

      block.classList.add("has-copy");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy command to clipboard");

      btn.addEventListener("click", async () => {
        const ok = await copyText(text);
        btn.textContent = ok ? "Copied!" : "Press Ctrl+C";
        btn.classList.toggle("copied", ok);
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 1500);
      });

      block.appendChild(btn);
    });
  }

  function setupBackToTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = "&#8593;";
    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const onScroll = () => btn.classList.toggle("visible", window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function init() {
    createNavBar();
    installNavHandler();
    renderSectionFromHash();
    window.addEventListener("hashchange", renderSectionFromHash);

    setupLightbox();
    setupCopyButtons();
    setupBackToTop();
  }

  init();
})();
