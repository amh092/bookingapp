/* ==========================================================================
   Mock data + the availability engine.
   Mirrors the Prisma models in context/project-spec.md closely enough that the
   screens can be ported to real API responses with minimal reshaping.
   Reservations are persisted to localStorage so a booking made on the public
   site shows up in the admin panel.
   ========================================================================== */

(function (global) {
  "use strict";

  const STORE_KEY = "tavola.reservations.v1";

  /* ------------------------------------------------------------ config -- */

  const RESTAURANT = {
    id: "rst_1",
    name: "Tavola",
    nameAr: "تافولا",
    slug: "tavola",
    tagline: "Wood-fired Mediterranean, served family style",
    taglineAr: "مطبخ متوسطي على الحطب، يُقدّم على الطريقة العائلية",
    phone: "+966 55 123 4567",
    email: "hello@tavola.example",
    address: "1204 Prince Turki Rd, Al Khobar",
    addressAr: "طريق الأمير تركي ١٢٠٤، الخبر",
    timezone: "Asia/Riyadh",
    slotDurationMinutes: 30,
    bookingDurationMinutes: 90,
    maxGuestsOnline: 10,
    bookingWindowDays: 30,
  };

  const TABLES = [
    { id: "tbl_1", name: "Table 1", capacity: 2, section: "Window", isActive: true },
    { id: "tbl_2", name: "Table 2", capacity: 2, section: "Window", isActive: true },
    { id: "tbl_3", name: "Table 3", capacity: 4, section: "Main hall", isActive: true },
    { id: "tbl_4", name: "Table 4", capacity: 4, section: "Main hall", isActive: true },
    { id: "tbl_5", name: "Table 5", capacity: 4, section: "Terrace", isActive: true },
    { id: "tbl_6", name: "Family Table", capacity: 6, section: "Main hall", isActive: true },
    { id: "tbl_7", name: "Terrace 2", capacity: 6, section: "Terrace", isActive: false },
    { id: "tbl_8", name: "VIP Table", capacity: 8, section: "Private room", isActive: true },
    { id: "tbl_9", name: "Chef's Counter", capacity: 10, section: "Kitchen", isActive: true },
  ];

  /* -------------------------------------------------------- date utils -- */

  const pad = (n) => String(n).padStart(2, "0");

  /** Local-date ISO key (yyyy-mm-dd) — avoids the UTC shift of toISOString(). */
  function dateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function parseKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  /** Combine a date key and a minutes-from-midnight offset into a Date. */
  function at(key, minutes) {
    const base = parseKey(key);
    base.setMinutes(minutes);
    return base;
  }

  function minutesToLabel(minutes, locale) {
    const h24 = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    const date = new Date(2000, 0, 1, h24, m);
    return date.toLocaleTimeString(locale || "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);
  const todayKey = dateKey(TODAY);

  /* ------------------------------------------------------ opening hours -- */

  // The weekly closing day is anchored two days from today so the demo always
  // opens on a live service day and still shows a closed day in the date strip.
  const CLOSED_DAY = (TODAY.getDay() + 2) % 7;

  // dayOfWeek: 0 = Sunday
  const BUSINESS_HOURS = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
    const lateNight = dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6;
    return {
      dayOfWeek,
      opensAtMinutes: dayOfWeek === 5 ? 13 * 60 : 12 * 60,
      closesAtMinutes: lateNight ? 24 * 60 : 23 * 60,
      isClosed: dayOfWeek === CLOSED_DAY,
    };
  });

  /** Key of the nth open day counting from today (0 = today, or the next open day). */
  function openDayKey(n) {
    let found = -1;
    for (let offset = 0; offset < 21; offset += 1) {
      const date = addDays(TODAY, offset);
      if (date.getDay() === CLOSED_DAY) continue;
      found += 1;
      if (found === n) return dateKey(date);
    }
    return todayKey;
  }

  const dayKey = openDayKey;

  /* ----------------------------------------------------- blocked times -- */

  const BLOCKED_PERIODS = [
    {
      id: "blk_1",
      startAt: at(dayKey(3), 12 * 60),
      endAt: at(dayKey(3), 16 * 60),
      reason: "Private event — Al Saeed engagement",
    },
    {
      id: "blk_2",
      startAt: at(dayKey(9), 0),
      endAt: at(dayKey(9), 24 * 60),
      reason: "Annual maintenance",
    },
  ];

  /* -------------------------------------------------------- seed data --- */

  const SEED_RESERVATIONS = [
    seed("R7K2QX", "Layla Al-Harbi", "+966 55 402 1188", 2, todayKey, 12 * 60, "tbl_1", "confirmed", "Window seat if possible"),
    seed("M4P8ZT", "Omar Nasser", "+966 50 771 3390", 4, todayKey, 13 * 60, "tbl_3", "completed", ""),
    seed("B9WQ2L", "Sara Bakr", "+966 53 118 9042", 6, todayKey, 14 * 60 + 30, "tbl_6", "confirmed", "Birthday — bringing a cake"),
    seed("H3XN7V", "Faisal Al-Otaibi", "+966 56 220 4471", 2, todayKey, 18 * 60, "tbl_2", "pending", ""),
    seed("K8LM5R", "Nora Zahid", "+966 54 909 2210", 4, todayKey, 19 * 60, "tbl_4", "confirmed", "Nut allergy"),
    seed("D2VC9J", "Hassan Kamal", "+966 55 660 7712", 8, todayKey, 20 * 60, "tbl_8", "pending", "Anniversary dinner"),
    seed("T6YB4N", "Maya Fadel", "+966 58 331 5580", 2, todayKey, 20 * 60 + 30, "tbl_1", "confirmed", ""),
    seed("Q1ZP8D", "Ziad Murad", "+966 59 447 0021", 4, todayKey, 21 * 60, "tbl_5", "no_show", ""),
    seed("F5RT3W", "Huda Salem", "+966 55 210 8834", 2, dayKey(1), 13 * 60, "tbl_2", "confirmed", ""),
    seed("N7KD1S", "Tariq Aziz", "+966 50 118 4472", 6, dayKey(1), 19 * 60 + 30, "tbl_6", "confirmed", "Prefers terrace"),
    seed("V4JH6M", "Amal Rashed", "+966 53 774 9903", 4, dayKey(1), 20 * 60, "tbl_3", "pending", ""),
    seed("C9GX2P", "Bilal Yousef", "+966 56 880 3319", 2, dayKey(2), 18 * 60 + 30, "tbl_1", "confirmed", ""),
    seed("L3MW8K", "Rania Haddad", "+966 55 331 6674", 10, dayKey(2), 20 * 60, "tbl_9", "confirmed", "Corporate dinner, one invoice"),
    seed("Z8QF5T", "Khalid Amin", "+966 54 229 7781", 4, dayKey(2), 21 * 60, "tbl_4", "cancelled", ""),
    seed("W2NR7H", "Dina Fouad", "+966 58 906 1123", 6, dayKey(4), 19 * 60, "tbl_6", "confirmed", ""),
    seed("P6BV3L", "Yara Sami", "+966 55 447 2098", 2, dayKey(5), 20 * 60 + 30, "tbl_2", "pending", ""),
    seed("G1TC9X", "Adel Mansour", "+966 50 663 4417", 8, dayKey(6), 20 * 60, "tbl_8", "confirmed", "Set menu requested"),
  ];

  function seed(code, name, phone, guests, key, minutes, tableId, status, notes) {
    return {
      id: "res_" + code.toLowerCase(),
      confirmationCode: code,
      guests,
      startAt: at(key, minutes),
      endAt: at(key, minutes + RESTAURANT.bookingDurationMinutes),
      status,
      customerNotes: notes,
      internalNotes: "",
      tableId,
      customer: { name, phone, email: name.split(" ")[0].toLowerCase() + "@example.com" },
      createdAt: new Date(),
    };
  }

  /* ------------------------------------------------------------- menu --- */

  const MENU_CATEGORIES = [
    { id: "cat_1", name: "Appetizers", nameAr: "المقبلات", position: 1, isActive: true },
    { id: "cat_2", name: "Main Courses", nameAr: "الأطباق الرئيسية", position: 2, isActive: true },
    { id: "cat_3", name: "From the Grill", nameAr: "من الشواية", position: 3, isActive: true },
    { id: "cat_4", name: "Desserts", nameAr: "الحلويات", position: 4, isActive: true },
    { id: "cat_5", name: "Drinks", nameAr: "المشروبات", position: 5, isActive: true },
  ];

  const MENU_ITEMS = [
    item("mi_1", "cat_1", "Charred Hummus", "حمص مشوي", "Chickpea purée, smoked olive oil, warm saj bread", 28, "🫓", { featured: true, prep: 10, tags: ["Vegetarian"] }),
    item("mi_2", "cat_1", "Muhammara", "محمرة", "Roasted red pepper, walnut, pomegranate molasses", 32, "🌶️", { prep: 10, tags: ["Vegan", "Nuts"] }),
    item("mi_3", "cat_1", "Burrata & Tomato", "بوراتا وطماطم", "Heirloom tomato, basil oil, aged balsamic", 46, "🍅", { featured: true, prep: 8, tags: ["Vegetarian"] }),
    item("mi_4", "cat_1", "Fried Calamari", "كاليماري مقلي", "Lemon aioli, crisp herbs", 42, "🦑", { prep: 14 }),
    item("mi_5", "cat_2", "Truffle Mushroom Risotto", "ريزوتو الفطر بالكمأة", "Arborio rice, wild mushroom, parmesan", 68, "🍄", { featured: true, prep: 22, tags: ["Vegetarian"] }),
    item("mi_6", "cat_2", "Seafood Linguine", "لينغويني بحري", "Prawns, clams, chilli, white wine reduction", 84, "🍝", { prep: 20, tags: ["Shellfish"] }),
    item("mi_7", "cat_2", "Wood-fired Margherita", "مارغريتا على الحطب", "San Marzano, fior di latte, basil", 52, "🍕", { prep: 12, tags: ["Vegetarian"] }),
    item("mi_8", "cat_2", "Lamb Ouzi Rice", "أرز بالعوزي", "Slow-cooked lamb shoulder, spiced rice, almonds", 96, "🍛", { prep: 25, tags: ["Nuts"] }),
    item("mi_9", "cat_3", "Mixed Grill Platter", "مشاوي مشكلة", "Kofta, shish tawook, lamb chop, grilled vegetables", 145, "🍢", { featured: true, prep: 28 }),
    item("mi_10", "cat_3", "Ribeye 400g", "ريب آي ٤٠٠ غرام", "Dry-aged, rosemary butter, triple-cooked chips", 189, "🥩", { prep: 30 }),
    item("mi_11", "cat_3", "Grilled Sea Bass", "سمك القاروص المشوي", "Whole fish, lemon, charred fennel", 128, "🐟", { prep: 26 }),
    item("mi_12", "cat_3", "Chicken Shish", "شيش طاووق", "Garlic marinade, sumac onion, flatbread", 74, "🍗", { prep: 20 }),
    item("mi_13", "cat_4", "Pistachio Basbousa", "بسبوسة بالفستق", "Semolina cake, orange blossom syrup, clotted cream", 34, "🍰", { featured: true, prep: 8, tags: ["Nuts"] }),
    item("mi_14", "cat_4", "Dark Chocolate Fondant", "فوندان الشوكولاتة", "Salted caramel, vanilla gelato", 38, "🍫", { prep: 15 }),
    item("mi_15", "cat_4", "Seasonal Sorbet", "سوربيه موسمي", "Three scoops, seasonal fruit", 26, "🍧", { prep: 5, tags: ["Vegan"] }),
    item("mi_16", "cat_5", "Mint Lemonade", "ليمون بالنعناع", "Fresh mint, house lemonade", 22, "🍹", { prep: 5, tags: ["Vegan"] }),
    item("mi_17", "cat_5", "Arabic Coffee", "قهوة عربية", "Cardamom, served with dates", 18, "☕", { prep: 5 }),
    item("mi_18", "cat_5", "Hibiscus Iced Tea", "شاي الكركديه المثلج", "Cold brewed, light honey", 20, "🧋", { available: false, prep: 5 }),
  ];

  function item(id, categoryId, name, nameAr, description, price, emoji, opts) {
    const o = opts || {};
    return {
      id,
      categoryId,
      name,
      nameAr,
      description,
      price,
      emoji,
      isFeatured: !!o.featured,
      isAvailable: o.available !== false,
      preparationMinutes: o.prep || 15,
      tags: o.tags || [],
    };
  }

  /* ------------------------------------------------------------ orders -- */

  const ORDERS = [
    { orderNumber: "TV-1042", customer: "Omar Nasser", type: "delivery", status: "preparing", total: 214, items: 4, placedAt: "18:42" },
    { orderNumber: "TV-1041", customer: "Layla Al-Harbi", type: "pickup", status: "ready", total: 96, items: 2, placedAt: "18:20" },
    { orderNumber: "TV-1040", customer: "Sara Bakr", type: "delivery", status: "completed", total: 328, items: 7, placedAt: "17:55" },
    { orderNumber: "TV-1039", customer: "Faisal Al-Otaibi", type: "pickup", status: "pending", total: 74, items: 1, placedAt: "17:31" },
    { orderNumber: "TV-1038", customer: "Nora Zahid", type: "delivery", status: "cancelled", total: 152, items: 3, placedAt: "17:02" },
  ];

  const STAFF = [
    { name: "Ahmed Mohammed", email: "owner@tavola.example", role: "OWNER" },
    { name: "Reem Al-Qassim", email: "reem@tavola.example", role: "MANAGER" },
    { name: "Youssef Adel", email: "youssef@tavola.example", role: "STAFF" },
    { name: "Mariam Saeed", email: "mariam@tavola.example", role: "STAFF" },
  ];

  /* ------------------------------------------------------------- store -- */

  function reviveDates(list) {
    return list.map((r) => ({
      ...r,
      startAt: new Date(r.startAt),
      endAt: new Date(r.endAt),
      createdAt: new Date(r.createdAt),
    }));
  }

  function loadReservations() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return SEED_RESERVATIONS.slice();
      const parsed = JSON.parse(raw);
      // seeds are anchored to "today", so drop the cache once the day rolls over
      if (parsed.day !== todayKey) return SEED_RESERVATIONS.slice();
      return reviveDates(parsed.items);
    } catch {
      return SEED_RESERVATIONS.slice();
    }
  }

  let reservations = loadReservations();

  function persist() {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ day: todayKey, items: reservations })
      );
    } catch {
      /* private mode — the prototype still works, it just won't remember */
    }
  }

  /* ------------------------------------------------------ availability -- */

  const ACTIVE_STATUSES = ["pending", "confirmed", "completed"];

  function hoursFor(key) {
    return BUSINESS_HOURS.find((h) => h.dayOfWeek === parseKey(key).getDay());
  }

  function overlaps(aStart, aEnd, bStart, bEnd) {
    // spec rule: existingStart < requestedEnd AND existingEnd > requestedStart
    return aStart < bEnd && aEnd > bStart;
  }

  function isBlocked(start, end) {
    return BLOCKED_PERIODS.some((b) => overlaps(b.startAt, b.endAt, start, end));
  }

  function suitableTables(guests) {
    return TABLES.filter((t) => t.isActive && t.capacity >= guests)
      // smallest table that fits first, so large parties keep their options
      .sort((a, b) => a.capacity - b.capacity);
  }

  function freeTablesAt(start, end, guests, ignoreId) {
    const booked = reservations.filter(
      (r) =>
        r.id !== ignoreId &&
        ACTIVE_STATUSES.includes(r.status) &&
        overlaps(r.startAt, r.endAt, start, end)
    );
    const takenIds = new Set(booked.map((r) => r.tableId).filter(Boolean));
    return suitableTables(guests).filter((t) => !takenIds.has(t.id));
  }

  /**
   * Returns every slot the restaurant generates for the date, each marked
   * available or not, so the UI can decide what to render (customers only
   * see available ones; the admin can see why a slot is gone).
   */
  function getAvailability(key, guests, options) {
    const opts = options || {};
    const hours = hoursFor(key);
    if (!hours || hours.isClosed) return { closed: true, slots: [] };

    const duration = RESTAURANT.bookingDurationMinutes;
    const step = RESTAURANT.slotDurationMinutes;
    const now = new Date();
    const lastStart = hours.closesAtMinutes - duration;
    const slots = [];

    for (let m = hours.opensAtMinutes; m <= lastStart; m += step) {
      const start = at(key, m);
      const end = at(key, m + duration);
      let reason = null;

      if (start <= now) reason = "past";
      else if (isBlocked(start, end)) reason = "blocked";

      const free = reason ? [] : freeTablesAt(start, end, guests, opts.ignoreId);
      if (!reason && free.length === 0) reason = "full";

      slots.push({
        minutes: m,
        label: minutesToLabel(m),
        start,
        end,
        available: !reason,
        reason,
        tablesLeft: free.length,
        tableId: free.length ? free[0].id : null,
      });
    }

    return { closed: false, slots };
  }

  /* --------------------------------------------------------- mutations -- */

  function makeCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 6; i += 1) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
  }

  function createReservation(input) {
    // the spec requires a second availability check at write time
    const fresh = getAvailability(input.dateKey, input.guests);
    const slot = fresh.slots.find((s) => s.minutes === input.minutes);
    if (!slot || !slot.available) {
      return { success: false, error: "That time was just taken. Pick another slot." };
    }

    const reservation = {
      id: "res_" + Date.now(),
      confirmationCode: makeCode(),
      guests: input.guests,
      startAt: slot.start,
      endAt: slot.end,
      status: "pending",
      customerNotes: input.notes || "",
      internalNotes: "",
      tableId: slot.tableId,
      customer: { name: input.name, phone: input.phone, email: input.email },
      createdAt: new Date(),
    };

    reservations.push(reservation);
    persist();
    return { success: true, data: reservation };
  }

  function findByCode(code) {
    const wanted = String(code || "").trim().toUpperCase();
    return reservations.find((r) => r.confirmationCode === wanted) || null;
  }

  function updateReservation(id, patch) {
    const found = reservations.find((r) => r.id === id);
    if (!found) return { success: false, error: "Reservation not found." };
    Object.assign(found, patch);
    persist();
    return { success: true, data: found };
  }

  function resetReservations() {
    reservations = SEED_RESERVATIONS.slice();
    persist();
  }

  /* --------------------------------------------------------- selectors -- */

  const byStart = (a, b) => a.startAt - b.startAt;

  function allReservations() {
    return reservations.slice().sort(byStart);
  }

  function reservationsOn(key) {
    return reservations.filter((r) => dateKey(r.startAt) === key).sort(byStart);
  }

  function tableById(id) {
    return TABLES.find((t) => t.id === id) || null;
  }

  function categoryById(id) {
    return MENU_CATEGORIES.find((c) => c.id === id) || null;
  }

  global.DB = {
    RESTAURANT,
    BUSINESS_HOURS,
    BLOCKED_PERIODS,
    TABLES,
    MENU_CATEGORIES,
    MENU_ITEMS,
    ORDERS,
    STAFF,
    TODAY,
    todayKey,
    dateKey,
    parseKey,
    addDays,
    at,
    minutesToLabel,
    hoursFor,
    getAvailability,
    freeTablesAt,
    suitableTables,
    createReservation,
    updateReservation,
    findByCode,
    resetReservations,
    allReservations,
    reservationsOn,
    tableById,
    categoryById,
  };
})(window);
