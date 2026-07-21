/* ==========================================================================
   Booking flow: guests → date → time → details
   Slots come from the same availability rules the backend will implement.
   ========================================================================== */

(function () {
  "use strict";

  const state = {
    guests: 2,
    dateKey: DB.todayKey,
    minutes: null,
    loading: false,
  };

  const isAr = () => UI.currentLang() === "ar";
  const locale = () => (isAr() ? "ar-SA" : "en-US");

  const guestRow = document.getElementById("guest-row");
  const dateStrip = document.getElementById("date-strip");
  const dateInput = document.getElementById("date-input");
  const slotGrid = document.getElementById("slot-grid");
  const form = document.getElementById("booking-form");
  const submitBtn = document.getElementById("submit-btn");

  /* ------------------------------------------------------------ guests -- */

  function renderGuests() {
    guestRow.innerHTML = "";
    for (let n = 1; n <= DB.RESTAURANT.maxGuestsOnline; n += 1) {
      const btn = UI.el("button", "guest-btn", n.toLocaleString(locale()));
      btn.type = "button";
      btn.dataset.guests = String(n);
      btn.setAttribute("aria-pressed", String(n === state.guests));
      btn.setAttribute(
        "aria-label",
        isAr() ? `${n} ضيوف` : `${n} guest${n === 1 ? "" : "s"}`
      );
      guestRow.appendChild(btn);
    }
  }

  guestRow.addEventListener("click", (event) => {
    const btn = event.target.closest(".guest-btn");
    if (!btn) return;
    state.guests = Number(btn.dataset.guests);
    state.minutes = null;
    renderGuests();
    renderDates();
    loadSlots();
    renderSummary();
  });

  /* -------------------------------------------------------------- date -- */

  const STRIP_DAYS = 14;

  function renderDates() {
    dateStrip.innerHTML = "";
    const today = new Date();

    for (let offset = 0; offset < STRIP_DAYS; offset += 1) {
      const date = DB.addDays(today, offset);
      const key = DB.dateKey(date);
      const hours = DB.hoursFor(key);

      const btn = UI.el("button", "date-btn");
      btn.type = "button";
      btn.dataset.date = key;
      btn.setAttribute("aria-pressed", String(key === state.dateKey));
      if (hours.isClosed) btn.disabled = true;

      btn.appendChild(
        UI.el(
          "span",
          "date-btn__dow",
          offset === 0
            ? isAr()
              ? "اليوم"
              : "Today"
            : date.toLocaleDateString(locale(), { weekday: "short" })
        )
      );
      btn.appendChild(
        UI.el("span", "date-btn__day", date.getDate().toLocaleString(locale()))
      );
      btn.appendChild(
        UI.el("span", "date-btn__mon", date.toLocaleDateString(locale(), { month: "short" }))
      );

      dateStrip.appendChild(btn);
    }

    dateInput.min = DB.todayKey;
    dateInput.max = DB.dateKey(DB.addDays(new Date(), DB.RESTAURANT.bookingWindowDays));
    dateInput.value = state.dateKey;
  }

  dateStrip.addEventListener("click", (event) => {
    const btn = event.target.closest(".date-btn");
    if (!btn) return;
    selectDate(btn.dataset.date);
  });

  dateInput.addEventListener("change", () => {
    if (!dateInput.value) return;
    selectDate(dateInput.value);
  });

  function selectDate(key) {
    state.dateKey = key;
    state.minutes = null;
    renderDates();
    loadSlots();
    renderSummary();
  }

  /* ------------------------------------------------------------- slots -- */

  let loadToken = 0;

  function loadSlots() {
    const token = ++loadToken;
    state.loading = true;
    renderSteps();

    slotGrid.innerHTML = "";
    for (let i = 0; i < 8; i += 1) {
      slotGrid.appendChild(UI.el("div", "skeleton"));
    }

    // fake the availability request so the loading state is visible
    setTimeout(() => {
      if (token !== loadToken) return;
      state.loading = false;
      renderSlots();
      renderSteps();
    }, 320);
  }

  function renderSlots() {
    const result = DB.getAvailability(state.dateKey, state.guests);
    slotGrid.innerHTML = "";

    if (result.closed) {
      slotGrid.appendChild(emptyState(UI.t("book.closed", "We're closed on this day."), "🌙"));
      return;
    }

    const open = result.slots.filter((s) => s.available);
    if (!open.length) {
      slotGrid.appendChild(
        emptyState(
          UI.t("book.empty", "No times left for this date — try another day."),
          "📅"
        )
      );
      return;
    }

    open.forEach((slot) => {
      const btn = UI.el("button", "slot");
      btn.type = "button";
      btn.dataset.minutes = String(slot.minutes);
      btn.setAttribute("aria-pressed", String(slot.minutes === state.minutes));
      btn.appendChild(
        document.createTextNode(DB.minutesToLabel(slot.minutes, locale()))
      );
      if (slot.tablesLeft <= 2) {
        btn.appendChild(
          UI.el(
            "span",
            "slot__note",
            isAr()
              ? `${slot.tablesLeft} متبقٍ`
              : `${slot.tablesLeft} left`
          )
        );
      }
      slotGrid.appendChild(btn);
    });
  }

  function emptyState(message, icon) {
    const box = UI.el("div", "empty");
    box.style.gridColumn = "1 / -1";
    box.appendChild(UI.el("span", "empty__icon", icon));
    box.appendChild(UI.el("strong", null, message));
    box.appendChild(
      UI.el(
        "span",
        "text-sm",
        isAr() ? "جرّب تاريخاً آخر أو عدداً أقل من الضيوف." : "Try another date or a smaller party."
      )
    );
    return box;
  }

  slotGrid.addEventListener("click", (event) => {
    const btn = event.target.closest(".slot");
    if (!btn) return;
    state.minutes = Number(btn.dataset.minutes);
    slotGrid.querySelectorAll(".slot").forEach((s) => {
      s.setAttribute("aria-pressed", String(s === btn));
    });
    renderSummary();
    renderSteps();
  });

  /* ----------------------------------------------------------- summary -- */

  function renderSummary() {
    document.getElementById("sum-guests").textContent =
      state.guests.toLocaleString(locale());

    document.getElementById("sum-date").textContent = UI.formatDate(
      DB.parseKey(state.dateKey),
      { weekday: "short", day: "numeric", month: "short" }
    );

    const time = document.getElementById("sum-time");
    if (state.minutes == null) {
      time.textContent = UI.t("book.pick", "Pick a time");
      time.dataset.empty = "true";
    } else {
      time.textContent = DB.minutesToLabel(state.minutes, locale());
      time.dataset.empty = "false";
    }

    submitBtn.disabled = state.minutes == null;
  }

  function renderSteps() {
    const done = {
      guests: true,
      date: true,
      time: state.minutes != null,
      details: false,
    };
    const current = state.minutes == null ? "time" : "details";

    document.querySelectorAll("#steps li").forEach((li) => {
      const step = li.dataset.step;
      li.dataset.state = step === current ? "current" : done[step] ? "done" : "todo";
    });
  }

  /* ---------------------------------------------------------- validate -- */

  function setError(name, message) {
    const input = form.elements[name];
    const slot = form.querySelector(`[data-error-for="${name}"]`);
    if (message) {
      input.setAttribute("aria-invalid", "true");
      slot.textContent = message;
      slot.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      slot.hidden = true;
    }
    return !message;
  }

  function validate() {
    const values = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
    };

    const okName = setError(
      "name",
      values.name.length < 2 ? (isAr() ? "أدخل اسمك الكامل" : "Enter your full name") : ""
    );
    const okPhone = setError(
      "phone",
      values.phone.replace(/\D/g, "").length < 9
        ? isAr()
          ? "أدخل رقم جوال صحيح"
          : "Enter a valid mobile number"
        : ""
    );
    const okEmail = setError(
      "email",
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
        ? ""
        : isAr()
          ? "أدخل بريداً إلكترونياً صحيحاً"
          : "Enter a valid email address"
    );

    return okName && okPhone && okEmail ? values : null;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (state.minutes == null) {
      UI.toast(isAr() ? "اختر وقتاً أولاً" : "Pick a time first", "danger");
      return;
    }

    const values = validate();
    if (!values) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = isAr() ? "جارٍ التأكيد…" : "Confirming…";

    setTimeout(() => {
      const result = DB.createReservation({
        dateKey: state.dateKey,
        minutes: state.minutes,
        guests: state.guests,
        name: values.name,
        phone: values.phone,
        email: values.email,
        notes: form.elements.notes.value.trim(),
      });

      if (!result.success) {
        UI.toast(result.error, "danger");
        submitBtn.disabled = false;
        submitBtn.textContent = UI.t("book.confirm", "Confirm reservation");
        state.minutes = null;
        loadSlots();
        renderSummary();
        return;
      }

      window.location.href =
        "confirmation.html?code=" + encodeURIComponent(result.data.confirmationCode);
    }, 500);
  });

  /* -------------------------------------------------------------- init -- */

  document.addEventListener("langchange", () => {
    renderGuests();
    renderDates();
    if (!state.loading) renderSlots();
    renderSummary();
  });

  renderGuests();
  renderDates();
  renderSummary();
  renderSteps();
  loadSlots();
})();
