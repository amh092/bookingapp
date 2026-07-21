/* ==========================================================================
   Shared UI behaviour: theme, language/direction, nav, toasts, dialogs.
   Loaded on every page.
   ========================================================================== */

(function (global) {
  "use strict";

  const THEME_KEY = "tavola.theme";
  const LANG_KEY = "tavola.lang";

  /* -------------------------------------------------------------- i18n -- */
  /* Public site chrome only — the admin panel stays English in the prototype. */

  const AR = {
    "nav.home": "الرئيسية",
    "nav.menu": "القائمة",
    "nav.hours": "أوقات العمل",
    "nav.location": "الموقع",
    "nav.contact": "تواصل معنا",
    "nav.reserve": "احجز طاولة",
    "nav.admin": "لوحة التحكم",
    "nav.toggle": "القائمة",

    "hero.eyebrow": "مطبخ متوسطي · الخبر",
    "hero.title": "طاولتك بانتظارك",
    "hero.lede":
      "احجز طاولتك خلال أقل من دقيقة. اختر عدد الضيوف والتاريخ، وسنعرض لك الأوقات المتاحة فعلياً فقط.",
    "hero.cta": "احجز طاولة",
    "hero.menu": "تصفح القائمة",
    "hero.badge": "٧ طاولات متاحة الليلة",
    "hero.fact1": "دقيقة لإتمام الحجز",
    "hero.fact2": "طاولة في الصالة",
    "hero.fact3": "تقييم الضيوف",

    "featured.title": "أطباق مختارة",
    "featured.lede": "أكثر ما يطلبه ضيوفنا هذا الأسبوع.",
    "featured.all": "كل الأطباق",

    "about.title": "عن المطعم",
    "about.body":
      "مطبخ مفتوح على الحطب، ومكونات موسمية من المزارع المحلية، وأطباق تُقدّم للمشاركة. نستقبلكم يومياً عدا الثلاثاء.",
    "about.point1": "فرن حطب تقليدي",
    "about.point2": "مكونات موسمية محلية",
    "about.point3": "قاعة خاصة للمناسبات",

    "cta.title": "جاهز للحجز؟",
    "cta.lede": "اختر الوقت المناسب وسنرسل لك رمز تأكيد فوراً.",
    "cta.button": "احجز الآن",

    "hours.title": "أوقات العمل",
    "hours.closed": "مغلق",
    "location.title": "الموقع",
    "location.directions": "الاتجاهات",

    "reviews.title": "آراء الضيوف",
    "reviews.lede": "متوسط التقييم ٤٫٨ من ٥ من ٦٢٠ ضيفاً.",

    "menu.title": "القائمة",
    "menu.lede": "أسعارنا شاملة الضريبة. الأطباق غير المتوفرة اليوم تظهر باهتة.",
    "menu.search": "ابحث في القائمة",
    "menu.all": "الكل",
    "menu.empty": "لا توجد أطباق مطابقة",
    "menu.emptyHint": "جرّب كلمة أخرى أو اختر قسماً مختلفاً.",
    "menu.unavailable": "غير متوفر اليوم",

    "book.title": "احجز طاولة",
    "book.lede": "اختر عدد الضيوف والتاريخ، ثم اختر من الأوقات المتاحة.",
    "book.step1": "الضيوف",
    "book.step2": "التاريخ",
    "book.step3": "الوقت",
    "book.step4": "بياناتك",
    "book.guests": "كم عدد الضيوف؟",
    "book.guestsMore": "أكثر من ذلك؟ اتصل بنا على ٤٥٦٧ ١٢٣ ٥٥ ٩٦٦+",
    "book.date": "اختر التاريخ",
    "book.time": "الأوقات المتاحة",
    "book.timeHint": "مدة الحجز ٩٠ دقيقة.",
    "book.details": "بيانات الحجز",
    "book.name": "الاسم الكامل",
    "book.phone": "رقم الجوال",
    "book.email": "البريد الإلكتروني",
    "book.notes": "طلبات خاصة (اختياري)",
    "book.notesHint": "كرسي أطفال، مناسبة خاصة، حساسية طعام…",
    "book.summary": "ملخص الحجز",
    "book.confirm": "تأكيد الحجز",
    "book.dateOther": "أو اختر تاريخاً آخر",
    "book.duration": "المدة",
    "book.free": "الإلغاء مجاني حتى ساعتين قبل موعد الحجز.",
    "book.empty": "لا توجد أوقات متاحة في هذا اليوم.",
    "book.closed": "المطعم مغلق في هذا اليوم.",
    "book.pick": "اختر",
    "book.left": "متبقٍ",

    "footer.tagline": "مطبخ متوسطي على الحطب في الخبر.",
    "footer.explore": "استكشف",
    "footer.visit": "زورونا",
    "footer.manage": "إدارة حجز",
    "footer.address": "طريق الأمير تركي ١٢٠٤، الخبر",
    "footer.rights": "جميع الحقوق محفوظة.",
    "footer.proto": "نموذج أولي للتصميم",
  };

  const dict = { ar: AR };

  function applyLang(lang) {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      if (lang === "en") {
        if (node.dataset.en != null) node.textContent = node.dataset.en;
        return;
      }
      const value = dict[lang] && dict[lang][key];
      if (!value) return;
      if (node.dataset.en == null) node.dataset.en = node.textContent;
      node.textContent = value;
    });

    document.querySelectorAll("[data-i18n-ph]").forEach((node) => {
      const key = node.dataset.i18nPh;
      if (lang === "en") {
        if (node.dataset.enPh != null) node.placeholder = node.dataset.enPh;
        return;
      }
      const value = dict[lang] && dict[lang][key];
      if (!value) return;
      if (node.dataset.enPh == null) node.dataset.enPh = node.placeholder;
      node.placeholder = value;
    });

    document.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
      btn.textContent = lang === "ar" ? "EN" : "ع";
      btn.setAttribute(
        "aria-label",
        lang === "ar" ? "Switch to English" : "التبديل إلى العربية"
      );
    });

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  function currentLang() {
    return localStorage.getItem(LANG_KEY) || "en";
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    applyLang(lang);
  }

  /* ------------------------------------------------------------- theme -- */

  function currentTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    });
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  }

  /* ------------------------------------------------------------ toasts -- */

  function toast(message, kind) {
    let host = document.querySelector(".toasts");
    if (!host) {
      host = document.createElement("div");
      host.className = "toasts";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }

    const el = document.createElement("div");
    el.className = "toast toast--" + (kind || "ok");
    el.innerHTML =
      '<span aria-hidden="true">' +
      (kind === "danger" ? "⚠️" : kind === "info" ? "ℹ️" : "✅") +
      "</span><span></span>";
    el.lastElementChild.textContent = message;
    host.appendChild(el);

    setTimeout(() => {
      el.classList.add("is-leaving");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3200);
  }

  /* ----------------------------------------------------------- helpers -- */

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function money(value) {
    return value.toLocaleString(currentLang() === "ar" ? "ar-SA" : "en-US") + " SAR";
  }

  function initials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function formatTime(date) {
    return date.toLocaleTimeString(currentLang() === "ar" ? "ar-SA" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatDate(date, opts) {
    return date.toLocaleDateString(
      currentLang() === "ar" ? "ar-SA" : "en-US",
      opts || { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    );
  }

  const STATUS_LABEL = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
    no_show: "No-show",
    preparing: "Preparing",
    ready: "Ready",
  };

  function statusPill(status) {
    const node = el("span", "pill pill--" + status, STATUS_LABEL[status] || status);
    return node;
  }

  /* -------------------------------------------------------------- boot -- */

  function boot() {
    applyTheme(currentTheme());
    applyLang(currentLang());

    document.addEventListener("click", (event) => {
      const themeBtn = event.target.closest("[data-theme-toggle]");
      if (themeBtn) {
        setTheme(currentTheme() === "dark" ? "light" : "dark");
        return;
      }

      const langBtn = event.target.closest("[data-lang-toggle]");
      if (langBtn) {
        setLang(currentLang() === "ar" ? "en" : "ar");
        return;
      }

      const navBtn = event.target.closest("[data-nav-toggle]");
      if (navBtn) {
        const nav = document.querySelector(".site-nav");
        const open = nav.classList.toggle("is-open");
        navBtn.setAttribute("aria-expanded", String(open));
        return;
      }

      // close the mobile nav when a link inside it is used
      if (event.target.closest(".site-nav a")) {
        const nav = document.querySelector(".site-nav");
        if (nav) nav.classList.remove("is-open");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.UI = {
    toast,
    el,
    money,
    initials,
    formatTime,
    formatDate,
    statusPill,
    STATUS_LABEL,
    currentLang,
    setLang,
    setTheme,
    currentTheme,
    t(key, fallback) {
      const lang = currentLang();
      if (lang === "en") return fallback;
      return (dict[lang] && dict[lang][key]) || fallback;
    },
  };
})(window);
