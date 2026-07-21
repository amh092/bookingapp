/* ==========================================================================
   Admin shell: sidebar, topbar, mobile drawer + the shared reservation drawer.
   Each admin page declares data-admin-page / data-admin-title on <body>.
   ========================================================================== */

(function (global) {
  "use strict";

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "▤", href: "dashboard.html" },
    { id: "reservations", label: "Reservations", icon: "🗒️", href: "reservations.html", badge: "pending" },
    { id: "calendar", label: "Calendar", icon: "📆", href: "calendar.html" },
    { id: "tables", label: "Tables", icon: "🪑", href: "tables.html" },
    { id: "menu", label: "Menu", icon: "🍽️", href: "menu.html" },
    { id: "orders", label: "Orders", icon: "🛵", href: "orders.html" },
    { id: "customers", label: "Customers", icon: "👥", href: "customers.html" },
    { id: "staff", label: "Staff", icon: "🧑‍🍳", href: "staff.html" },
    { id: "settings", label: "Settings", icon: "⚙️", href: "settings.html" },
  ];

  const page = document.body.dataset.adminPage;

  /* -------------------------------------------------------- chrome ------ */

  function pendingCount() {
    return DB.allReservations().filter((r) => r.status === "pending").length;
  }

  function buildSidebar() {
    const aside = UI.el("aside", "sidebar");
    aside.id = "sidebar";

    const brand = UI.el("div", "sidebar__brand");
    brand.innerHTML =
      '<span class="brand__mark" aria-hidden="true">🍽️</span><span>Tavola<small>Manager</small></span>';
    aside.appendChild(brand);

    aside.appendChild(UI.el("div", "sidebar__label", "Operations"));

    const nav = UI.el("nav", "sidebar__nav");
    nav.setAttribute("aria-label", "Admin");
    NAV.forEach((entry) => {
      const link = UI.el("a");
      link.href = entry.href;
      if (entry.id === page) link.setAttribute("aria-current", "page");
      link.appendChild(UI.el("span", null, entry.icon));
      link.appendChild(UI.el("span", null, entry.label));
      if (entry.badge === "pending") {
        const count = pendingCount();
        if (count) link.appendChild(UI.el("span", "count", String(count)));
      }
      nav.appendChild(link);
    });
    aside.appendChild(nav);

    const foot = UI.el("div", "sidebar__foot");
    const chip = UI.el("button", "user-chip");
    chip.type = "button";
    chip.innerHTML =
      '<span class="avatar" aria-hidden="true">AM</span>' +
      '<span><span class="user-chip__name">Ahmed Mohammed</span>' +
      '<span class="user-chip__role">Owner</span></span>';
    chip.addEventListener("click", () => {
      window.location.href = "login.html";
    });
    foot.appendChild(chip);

    const links = UI.el("div");
    links.style.cssText = "display:flex;gap:0.4rem;margin-block-start:0.5rem";
    const site = UI.el("a", "btn btn--ghost btn--sm", "View site");
    site.href = "../index.html";
    site.style.flex = "1";
    links.appendChild(site);
    foot.appendChild(links);

    aside.appendChild(foot);
    return aside;
  }

  function buildTopbar() {
    const bar = UI.el("header", "topbar");

    const toggle = UI.el("button", "icon-btn sidebar-toggle", "☰");
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.addEventListener("click", () => setSidebar(true));
    bar.appendChild(toggle);

    const title = UI.el("h1", null, document.body.dataset.adminTitle || "");
    const sub = document.body.dataset.adminSub;
    if (sub) title.appendChild(UI.el("span", "topbar__sub", sub));
    bar.appendChild(title);

    const actions = UI.el("div");
    actions.id = "topbar-actions";
    actions.style.cssText = "display:flex;align-items:center;gap:0.5rem";

    const tpl = document.getElementById("tpl-topbar-actions");
    if (tpl) actions.appendChild(tpl.content.cloneNode(true));

    const theme = UI.el("button", "icon-btn", "☀️");
    theme.type = "button";
    theme.setAttribute("data-theme-toggle", "");
    actions.appendChild(theme);

    bar.appendChild(actions);
    return bar;
  }

  function setSidebar(open) {
    document.getElementById("sidebar").classList.toggle("is-open", open);
    document.getElementById("scrim").classList.toggle("is-open", open);
  }

  function mountChrome() {
    const shell = document.querySelector(".admin");
    if (!shell) return;

    shell.insertBefore(buildSidebar(), shell.firstChild);

    const main = shell.querySelector(".admin__main");
    main.insertBefore(buildTopbar(), main.firstChild);

    const scrim = UI.el("div", "scrim");
    scrim.id = "scrim";
    scrim.addEventListener("click", () => setSidebar(false));
    document.body.appendChild(scrim);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setSidebar(false);
    });
  }

  /* ----------------------------------------------- reservation drawer --- */

  let drawer;
  let drawerBody;
  let drawerFoot;
  let drawerTitle;
  let drawerSub;
  let onChange = () => {};

  function buildDrawer() {
    drawer = UI.el("aside", "drawer");
    drawer.setAttribute("aria-label", "Reservation details");
    drawer.hidden = false;

    const head = UI.el("div", "drawer__head");
    const titles = UI.el("div");
    drawerTitle = UI.el("h2", null, "");
    drawerTitle.style.fontSize = "1.15rem";
    drawerSub = UI.el("div", "text-sm muted", "");
    titles.appendChild(drawerTitle);
    titles.appendChild(drawerSub);
    head.appendChild(titles);

    const close = UI.el("button", "icon-btn", "✕");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", closeDrawer);
    head.appendChild(close);
    drawer.appendChild(head);

    drawerBody = UI.el("div", "drawer__body");
    drawer.appendChild(drawerBody);

    drawerFoot = UI.el("div", "drawer__foot");
    drawer.appendChild(drawerFoot);

    document.body.appendChild(drawer);
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove("is-open");
  }

  function detailRow(label, value) {
    const row = UI.el("div");
    row.appendChild(UI.el("dt", null, label));
    const dd = UI.el("dd");
    if (typeof value === "string" || typeof value === "number") {
      dd.textContent = String(value);
    } else {
      dd.appendChild(value);
    }
    row.appendChild(dd);
    return row;
  }

  function openReservation(reservation, handler) {
    if (!drawer) buildDrawer();
    onChange = handler || (() => {});

    const table = DB.tableById(reservation.tableId);

    drawerTitle.textContent = reservation.customer.name;
    drawerSub.textContent =
      UI.formatDate(reservation.startAt, { weekday: "long", day: "numeric", month: "long" }) +
      " · " +
      UI.formatTime(reservation.startAt);

    drawerBody.innerHTML = "";

    const statusRow = UI.el("div");
    statusRow.style.cssText = "display:flex;gap:0.5rem;align-items:center";
    statusRow.appendChild(UI.statusPill(reservation.status));
    statusRow.appendChild(
      UI.el("span", "text-xs muted", "Code " + reservation.confirmationCode)
    );
    drawerBody.appendChild(statusRow);

    const list = UI.el("dl", "detail-list");
    list.appendChild(detailRow("Guests", reservation.guests));
    list.appendChild(
      detailRow(
        "Time",
        UI.formatTime(reservation.startAt) + " – " + UI.formatTime(reservation.endAt)
      )
    );
    list.appendChild(detailRow("Phone", reservation.customer.phone));
    list.appendChild(detailRow("Email", reservation.customer.email));
    drawerBody.appendChild(list);

    // table assignment — only tables that fit and are free at this time
    const tableField = UI.el("div", "field");
    tableField.appendChild(UI.el("label", null, "Assigned table"));
    const select = UI.el("select", "select");
    const free = DB.freeTablesAt(
      reservation.startAt,
      reservation.endAt,
      reservation.guests,
      reservation.id
    );
    const options = table && !free.some((t) => t.id === table.id) ? [table].concat(free) : free;
    const none = UI.el("option", null, "Unassigned");
    none.value = "";
    select.appendChild(none);
    options.forEach((t) => {
      const opt = UI.el("option", null, `${t.name} · seats ${t.capacity} · ${t.section}`);
      opt.value = t.id;
      if (t.id === reservation.tableId) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => {
      DB.updateReservation(reservation.id, { tableId: select.value || null });
      UI.toast("Table updated", "info");
      onChange();
    });
    tableField.appendChild(select);
    drawerBody.appendChild(tableField);

    if (reservation.customerNotes) {
      const note = UI.el("div", "field");
      note.appendChild(UI.el("label", null, "Guest request"));
      note.appendChild(UI.el("p", "text-sm", reservation.customerNotes));
      drawerBody.appendChild(note);
    }

    const internal = UI.el("div", "field");
    internal.appendChild(UI.el("label", null, "Internal note"));
    const textarea = UI.el("textarea", "textarea");
    textarea.value = reservation.internalNotes || "";
    textarea.placeholder = "Visible to staff only";
    textarea.addEventListener("change", () => {
      DB.updateReservation(reservation.id, { internalNotes: textarea.value });
      UI.toast("Note saved", "info");
    });
    internal.appendChild(textarea);
    drawerBody.appendChild(internal);

    /* actions */
    drawerFoot.innerHTML = "";

    const transitions = {
      pending: [
        ["confirmed", "Confirm booking", "btn--primary"],
        ["cancelled", "Cancel", "btn--danger"],
      ],
      confirmed: [
        ["completed", "Mark completed", "btn--primary"],
        ["no_show", "No-show", ""],
        ["cancelled", "Cancel", "btn--danger"],
      ],
      completed: [["confirmed", "Reopen", ""]],
      cancelled: [["pending", "Restore", ""]],
      no_show: [["completed", "Mark completed", ""]],
    };

    const row = UI.el("div", "row");
    (transitions[reservation.status] || []).forEach(([status, label, variant]) => {
      const btn = UI.el("button", "btn " + variant, label);
      btn.type = "button";
      btn.addEventListener("click", () => {
        DB.updateReservation(reservation.id, { status });
        UI.toast(`${reservation.customer.name} → ${UI.STATUS_LABEL[status]}`);
        onChange();
        openReservation(DB.allReservations().find((r) => r.id === reservation.id), handler);
      });
      row.appendChild(btn);
    });
    if (row.children.length === 1) row.style.gridTemplateColumns = "1fr";
    drawerFoot.appendChild(row);

    requestAnimationFrame(() => drawer.classList.add("is-open"));
  }

  /* --------------------------------------------------------- helpers --- */

  function reservationRow(reservation, options) {
    const opts = options || {};
    const table = DB.tableById(reservation.tableId);
    const tr = UI.el("tr");
    tr.tabIndex = 0;

    const time = UI.el("td");
    time.dataset.label = "Time";
    time.innerHTML =
      '<span class="cell-strong"></span><span class="cell-sub"></span>';
    time.firstChild.textContent = UI.formatTime(reservation.startAt);
    time.lastChild.textContent = opts.showDate
      ? UI.formatDate(reservation.startAt, { day: "numeric", month: "short" })
      : "→ " + UI.formatTime(reservation.endAt);
    tr.appendChild(time);

    const guest = UI.el("td");
    guest.dataset.label = "Guest";
    guest.innerHTML = '<span class="cell-strong"></span><span class="cell-sub"></span>';
    guest.firstChild.textContent = reservation.customer.name;
    guest.lastChild.textContent = reservation.customer.phone;
    tr.appendChild(guest);

    const guests = UI.el("td", null, String(reservation.guests));
    guests.dataset.label = "Guests";
    tr.appendChild(guests);

    const tableCell = UI.el("td", null, table ? table.name : "Unassigned");
    tableCell.dataset.label = "Table";
    if (!table) tableCell.classList.add("muted");
    tr.appendChild(tableCell);

    const status = UI.el("td");
    status.dataset.label = "Status";
    status.appendChild(UI.statusPill(reservation.status));
    tr.appendChild(status);

    const actions = UI.el("td");
    actions.dataset.label = "";
    const wrap = UI.el("div", "row-actions");
    const view = UI.el("button", "btn btn--ghost btn--sm", "Open");
    view.type = "button";
    wrap.appendChild(view);
    actions.appendChild(wrap);
    tr.appendChild(actions);

    const open = () => openReservation(reservation, opts.onChange);
    tr.addEventListener("click", open);
    tr.addEventListener("keydown", (event) => {
      if (event.key === "Enter") open();
    });

    return tr;
  }

  mountChrome();

  global.Admin = {
    openReservation,
    closeDrawer,
    reservationRow,
    detailRow,
    setSidebar,
  };
})(window);
