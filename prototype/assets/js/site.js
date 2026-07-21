/* ==========================================================================
   Landing page + menu page rendering
   ========================================================================== */

(function () {
  "use strict";

  const isAr = () => UI.currentLang() === "ar";

  function dishCard(item) {
    const card = UI.el("article", "dish" + (item.isAvailable ? "" : " dish--out"));

    const art = UI.el("div", "dish__art");
    art.textContent = item.emoji;
    art.setAttribute("aria-hidden", "true");
    if (item.isFeatured) {
      art.appendChild(UI.el("span", "dish__flag", isAr() ? "مميز" : "Featured"));
    }
    card.appendChild(art);

    const body = UI.el("div", "dish__body");
    const title = UI.el("div", "dish__title");
    title.appendChild(UI.el("h3", null, isAr() ? item.nameAr : item.name));
    title.appendChild(UI.el("span", "dish__price", UI.money(item.price)));
    body.appendChild(title);
    body.appendChild(UI.el("p", "dish__desc", item.description));

    const meta = UI.el("div", "dish__meta");
    meta.appendChild(
      UI.el("span", "tag", (isAr() ? "التحضير " : "") + item.preparationMinutes + (isAr() ? " دقيقة" : " min"))
    );
    item.tags.forEach((tag) => meta.appendChild(UI.el("span", "tag", tag)));
    if (!item.isAvailable) {
      meta.appendChild(
        UI.el("span", "pill pill--cancelled", UI.t("menu.unavailable", "Unavailable today"))
      );
    }
    body.appendChild(meta);

    card.appendChild(body);
    return card;
  }

  /* ------------------------------------------------------------ landing -- */

  function renderFeatured() {
    const host = document.getElementById("featured-grid");
    if (!host) return;
    host.innerHTML = "";
    DB.MENU_ITEMS.filter((i) => i.isFeatured).forEach((i) =>
      host.appendChild(dishCard(i))
    );
  }

  function renderHours() {
    const host = document.getElementById("hours-list");
    if (!host) return;
    host.innerHTML = "";

    const today = new Date().getDay();
    const names = isAr()
      ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    DB.BUSINESS_HOURS.forEach((h) => {
      const row = UI.el("div", "hours__row");
      row.dataset.today = String(h.dayOfWeek === today);
      row.dataset.closed = String(h.isClosed);
      row.appendChild(UI.el("span", null, names[h.dayOfWeek]));
      row.appendChild(
        UI.el(
          "span",
          h.isClosed ? "muted" : null,
          h.isClosed
            ? UI.t("hours.closed", "Closed")
            : DB.minutesToLabel(h.opensAtMinutes, isAr() ? "ar-SA" : "en-US") +
                " – " +
                DB.minutesToLabel(h.closesAtMinutes, isAr() ? "ar-SA" : "en-US")
        )
      );
      host.appendChild(row);
    });
  }

  function renderHeroFacts() {
    const tablesFact = document.getElementById("fact-tables");
    if (tablesFact) {
      tablesFact.textContent = DB.TABLES.filter((t) => t.isActive).length;
    }

    const badge = document.getElementById("hero-availability");
    if (!badge) return;

    // "tonight" = evening slots still bookable for a party of two
    const result = DB.getAvailability(DB.todayKey, 2);
    const open = result.closed
      ? 0
      : result.slots.filter((s) => s.available && s.minutes >= 17 * 60).length;

    if (open > 0) {
      badge.textContent = isAr()
        ? `${open} أوقات متاحة الليلة`
        : `${open} time${open === 1 ? "" : "s"} open tonight`;
    } else {
      const next = DB.getAvailability(DB.dateKey(DB.addDays(new Date(), 1)), 2);
      const count = next.closed ? 0 : next.slots.filter((s) => s.available).length;
      badge.textContent = isAr()
        ? `الليلة مكتملة — ${count} أوقات متاحة غداً`
        : `Fully booked tonight — ${count} open tomorrow`;
    }
  }

  /* --------------------------------------------------------- menu page -- */

  function initMenuPage() {
    const grid = document.getElementById("menu-grid");
    if (!grid) return;

    const chipHost = document.getElementById("menu-chips");
    const searchInput = document.getElementById("menu-search");
    const emptyState = document.getElementById("menu-empty");
    let activeCategory = "all";

    function renderChips() {
      chipHost.innerHTML = "";
      const all = UI.el("button", "chip", UI.t("menu.all", "All"));
      all.type = "button";
      all.dataset.category = "all";
      chipHost.appendChild(all);

      DB.MENU_CATEGORIES.forEach((cat) => {
        const chip = UI.el("button", "chip", isAr() ? cat.nameAr : cat.name);
        chip.type = "button";
        chip.dataset.category = cat.id;
        chipHost.appendChild(chip);
      });

      chipHost.querySelectorAll(".chip").forEach((chip) => {
        chip.setAttribute(
          "aria-pressed",
          String(chip.dataset.category === activeCategory)
        );
      });
    }

    function render() {
      const query = (searchInput.value || "").trim().toLowerCase();
      grid.innerHTML = "";

      const categories = DB.MENU_CATEGORIES.filter(
        (c) => activeCategory === "all" || c.id === activeCategory
      );

      let shown = 0;
      categories.forEach((cat) => {
        const items = DB.MENU_ITEMS.filter(
          (i) =>
            i.categoryId === cat.id &&
            (!query ||
              i.name.toLowerCase().includes(query) ||
              i.nameAr.includes(query) ||
              i.description.toLowerCase().includes(query))
        );
        if (!items.length) return;

        const section = UI.el("section", "stack");
        section.style.setProperty("--stack-gap", "1.25rem");
        section.appendChild(
          UI.el("h2", null, isAr() ? cat.nameAr : cat.name)
        );
        const inner = UI.el("div", "dish-grid");
        items.forEach((i) => inner.appendChild(dishCard(i)));
        section.appendChild(inner);
        grid.appendChild(section);
        shown += items.length;
      });

      emptyState.hidden = shown > 0;
    }

    chipHost.addEventListener("click", (event) => {
      const chip = event.target.closest(".chip");
      if (!chip) return;
      activeCategory = chip.dataset.category;
      chipHost.querySelectorAll(".chip").forEach((c) => {
        c.setAttribute("aria-pressed", String(c === chip));
      });
      render();
    });

    searchInput.addEventListener("input", render);

    document.addEventListener("langchange", () => {
      renderChips();
      render();
    });

    renderChips();
    render();
  }

  /* ------------------------------------------------------------- boot -- */

  function renderAll() {
    renderFeatured();
    renderHours();
    renderHeroFacts();
  }

  document.addEventListener("langchange", renderAll);
  renderAll();
  initMenuPage();
})();
