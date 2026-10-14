// Adds the remaining Apex Phase 1 screens to the existing Site, Booking, and Admin pages.
// Safe to run twice: a frame is skipped if its name is already on the page.

const C = {
  ink: "#16241E",
  mute: "#5C675F",
  soft: "#3E4A44",
  cedar: "#1C4A3C",
  deep: "#102E26",
  copper: "#C4622D",
  sand: "#F4EFE7",
  paper: "#FBF8F3",
  line: "#E4DACA",
  sage: "#E3EEE8",
  heat: "#A32D1E",
  gold: "#A67C2D",
};

function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
function solid(h) {
  return [{ type: "SOLID", color: hex(h) }];
}
function T(chars, o) {
  const t = figma.createText();
  t.fontName = { family: (o && o.family) || "Instrument Sans", style: (o && o.style) || "Regular" };
  t.characters = chars;
  t.fontSize = (o && o.size) || 16;
  t.fills = solid((o && o.color) || C.ink);
  if (o && o.lh) t.lineHeight = { unit: "PIXELS", value: o.lh };
  if (o && o.ls != null) t.letterSpacing = { unit: "PIXELS", value: o.ls };
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  return t;
}
function wrap(t, w) {
  t.textAutoResize = "HEIGHT";
  t.resize(w, Math.max(t.height, 10));
  return t;
}
function V(name, gap) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = "VERTICAL";
  f.itemSpacing = gap || 0;
  f.fills = [];
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  return f;
}
function H(name, gap) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = "HORIZONTAL";
  f.itemSpacing = gap || 0;
  f.fills = [];
  f.counterAxisAlignItems = "CENTER";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  return f;
}
function add(parent, child) {
  parent.appendChild(child);
  if ("layoutMode" in child && child.layoutMode !== "NONE") child.layoutSizingHorizontal = "FILL";
  return child;
}
function shell(name) {
  const page = V(name, 0);
  page.fills = solid(C.sand);
  page.resize(1440, 80);
  page.primaryAxisSizingMode = "AUTO";
  page.counterAxisSizingMode = "FIXED";
  page.clipsContent = false;
  return page;
}
function button(label, kind) {
  const b = H(label, 0);
  b.cornerRadius = 999;
  b.paddingTop = 14;
  b.paddingBottom = 14;
  b.paddingLeft = 18;
  b.paddingRight = 18;
  b.primaryAxisAlignItems = "CENTER";
  b.counterAxisAlignItems = "CENTER";
  if (kind === "light") {
    b.fills = solid(C.paper);
    b.appendChild(T(label, { style: "SemiBold", size: 15, color: C.deep }));
  } else if (kind === "ghost") {
    b.fills = solid(C.paper);
    b.strokes = solid(C.cedar);
    b.strokeWeight = 1.5;
    b.appendChild(T(label, { style: "SemiBold", size: 15, color: C.cedar }));
  } else {
    b.fills = solid(C.cedar);
    b.appendChild(T(label, { style: "SemiBold", size: 15, color: C.paper }));
  }
  return b;
}
function field(label, value, hint) {
  const f = V(label, 6);
  f.appendChild(T(label, { style: "Medium", size: 13, color: C.ink }));
  const box = H(label + " box", 0);
  box.fills = solid(C.paper);
  box.strokes = solid(hint ? C.heat : C.line);
  box.strokeWeight = hint ? 1.5 : 1;
  box.cornerRadius = 12;
  box.paddingTop = 14;
  box.paddingBottom = 14;
  box.paddingLeft = 14;
  box.paddingRight = 14;
  box.appendChild(T(value || " ", { size: 16, color: value ? C.ink : C.mute }));
  f.appendChild(box);
  box.layoutSizingHorizontal = "FILL";
  if (hint) f.appendChild(wrap(T(hint, { size: 13, color: C.heat, lh: 18 }), 520));
  return f;
}
function chrome(page) {
  const demo = H("Demo bar", 0);
  demo.fills = solid(C.ink);
  demo.paddingTop = 8;
  demo.paddingBottom = 8;
  demo.paddingLeft = 80;
  demo.paddingRight = 80;
  demo.primaryAxisAlignItems = "CENTER";
  demo.appendChild(T("Sample site  ·  Apex is a fictional Dallas company. The license number is a placeholder.", { size: 13, color: "#F4EFE7" }));
  add(page, demo);

  const offer = H("Offer bar", 12);
  offer.fills = solid(C.cedar);
  offer.paddingTop = 10;
  offer.paddingBottom = 10;
  offer.paddingLeft = 80;
  offer.paddingRight = 80;
  offer.primaryAxisAlignItems = "SPACE_BETWEEN";
  offer.appendChild(T("Fall furnace checkup — $89, with a written price before any work.", { style: "Medium", size: 14, color: C.paper }));
  offer.appendChild(T("Ends October 31", { style: "SemiBold", size: 13, color: "#F6D3BE" }));
  add(page, offer);

  const header = H("Header", 20);
  header.fills = solid(C.paper);
  header.paddingTop = 14;
  header.paddingBottom = 14;
  header.paddingLeft = 80;
  header.paddingRight = 80;
  header.primaryAxisAlignItems = "SPACE_BETWEEN";
  header.strokes = solid(C.line);
  header.strokeWeight = 1;
  const logo = H("Logo", 8);
  const mark = figma.createNodeFromSvg('<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 22L16 7L27 22" stroke="#1C4A3C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.2 22L16 14L21.8 22" stroke="#C4622D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  mark.resize(28, 28);
  logo.appendChild(mark);
  logo.appendChild(T("Apex", { family: "Fraunces", style: "SemiBold", size: 22, color: C.cedar }));
  const nav = H("Nav", 22);
  ["Services", "Areas", "Membership", "Reviews"].forEach((n) => nav.appendChild(T(n, { style: "Medium", size: 15, color: C.ink })));
  const actions = H("Actions", 10);
  const phone = H("Phone", 0);
  phone.fills = solid(C.sage);
  phone.cornerRadius = 999;
  phone.paddingTop = 10;
  phone.paddingBottom = 10;
  phone.paddingLeft = 14;
  phone.paddingRight = 14;
  phone.appendChild(T("(214) 555-0148", { style: "SemiBold", size: 14, color: C.cedar }));
  actions.appendChild(phone);
  actions.appendChild(button("Book service", "primary"));
  header.appendChild(logo);
  header.appendChild(nav);
  header.appendChild(actions);
  add(page, header);
}
function footer(page) {
  const f = V("Footer", 8);
  f.fills = solid(C.ink);
  f.paddingTop = 28;
  f.paddingBottom = 28;
  f.paddingLeft = 80;
  f.paddingRight = 80;
  f.appendChild(T("Apex Climate Solutions", { family: "Fraunces", style: "SemiBold", size: 22, color: C.paper }));
  f.appendChild(wrap(T("Fictional demo company, not a licensed contractor. TDLR TACLB000000C is a placeholder, not a real license. Regulated by the Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas 78711, 1-800-803-9202. One office: 1200 Demo Street, Dallas, TX 75201. (214) 555-0148.", { size: 13, color: "#C9C2B6", lh: 18 }), 1200));
  f.appendChild(T("Privacy   ·   Terms   ·   SMS and email consent", { size: 13, color: "#E7E1D6" }));
  add(page, f);
}
function ctaBand(page, title, sub) {
  const f = V("Closing CTA", 12);
  f.fills = solid(C.deep);
  f.paddingTop = 40;
  f.paddingBottom = 40;
  f.paddingLeft = 80;
  f.paddingRight = 80;
  f.appendChild(wrap(T(title, { family: "Fraunces", style: "SemiBold", size: 36, color: C.paper, lh: 42 }), 980));
  f.appendChild(wrap(T(sub, { size: 16, color: "#D5E3DC", lh: 24 }), 720));
  const row = H("CTA actions", 10);
  row.appendChild(button("Call (214) 555-0148", "light"));
  const book = button("Book a visit", "ghost");
  book.fills = [];
  book.strokes = solid(C.paper);
  book.strokeWeight = 1.5;
  book.children[0].fills = solid(C.paper);
  row.appendChild(book);
  f.appendChild(row);
  add(page, f);
}
function twoCards(a, b) {
  const row = H("Cards", 16);
  row.counterAxisAlignItems = "MIN";
  [a, b].forEach((card) => {
    const c = V(card[0], 8);
    c.fills = solid(card[2] || C.paper);
    c.cornerRadius = 18;
    c.strokes = solid(C.line);
    c.strokeWeight = 1;
    c.paddingTop = 22;
    c.paddingBottom = 22;
    c.paddingLeft = 22;
    c.paddingRight = 22;
    c.appendChild(wrap(T(card[0], { family: "Fraunces", style: "SemiBold", size: 26, color: C.ink, lh: 32 }), 540));
    c.appendChild(wrap(T(card[1], { size: 15, color: C.soft, lh: 22 }), 540));
    row.appendChild(c);
    c.layoutSizingHorizontal = "FILL";
  });
  return row;
}
function faqBlock(items) {
  const box = V("FAQ", 14);
  box.fills = solid(C.paper);
  box.paddingTop = 36;
  box.paddingBottom = 40;
  box.paddingLeft = 80;
  box.paddingRight = 80;
  box.appendChild(T("QUESTIONS", { style: "SemiBold", size: 12, color: C.copper, ls: 1.1 }));
  items.forEach((q) => {
    const row = V(q[0], 6);
    row.appendChild(T(q[0], { style: "SemiBold", size: 18, color: C.ink }));
    row.appendChild(wrap(T(q[1], { size: 15, color: C.soft, lh: 22 }), 1100));
    box.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
  });
  return box;
}
function heroBlock(crumb, h1, lede) {
  const h = V("Hero", 12);
  h.paddingTop = 48;
  h.paddingBottom = 8;
  h.paddingLeft = 80;
  h.paddingRight = 80;
  h.appendChild(T(crumb, { style: "SemiBold", size: 12, color: C.copper, ls: 1.1 }));
  h.appendChild(wrap(T(h1, { family: "Fraunces", style: "SemiBold", size: 48, color: C.ink, lh: 54 }), 1040));
  h.appendChild(wrap(T(lede, { size: 17, color: C.soft, lh: 26 }), 820));
  return h;
}

function servicePage(d) {
  const page = shell(d.name);
  chrome(page);
  const hero = heroBlock(d.crumb, d.h1, d.lede);
  const ctas = H("Hero actions", 10);
  ctas.appendChild(button(d.primary || "Call (214) 555-0148", "primary"));
  ctas.appendChild(button(d.secondary || "Book a visit", "ghost"));
  hero.appendChild(ctas);
  add(page, hero);
  const pad = V("Body", 20);
  pad.paddingTop = 28;
  pad.paddingBottom = 36;
  pad.paddingLeft = 80;
  pad.paddingRight = 80;
  pad.appendChild(twoCards(d.cards[0], d.cards[1]));
  if (d.notes) {
    const notes = H("Notes", 12);
    notes.layoutWrap = "WRAP";
    notes.counterAxisSpacing = 12;
    d.notes.forEach((n) => {
      const chip = V(n, 0);
      chip.fills = solid(C.paper);
      chip.cornerRadius = 14;
      chip.paddingTop = 14;
      chip.paddingBottom = 14;
      chip.paddingLeft = 16;
      chip.paddingRight = 16;
      chip.resize(300, 20);
      chip.primaryAxisSizingMode = "AUTO";
      chip.counterAxisSizingMode = "FIXED";
      chip.appendChild(wrap(T(n, { style: "Medium", size: 15, color: C.ink, lh: 20 }), 268));
      notes.appendChild(chip);
    });
    pad.appendChild(notes);
    notes.layoutSizingHorizontal = "FILL";
  }
  add(page, pad);
  add(page, faqBlock(d.faqs));
  ctaBand(page, d.cta, d.ctaSub);
  footer(page);
  return page;
}

function areaPage(d) {
  const page = shell(d.name);
  chrome(page);
  add(page, heroBlock("SERVICE AREAS  /  " + d.city.toUpperCase(), d.h1, d.lede));
  const chips = H("Neighborhoods", 8);
  chips.paddingLeft = 80;
  chips.paddingRight = 80;
  chips.paddingTop = 8;
  chips.paddingBottom = 8;
  chips.layoutWrap = "WRAP";
  chips.counterAxisSpacing = 8;
  d.neighborhoods.forEach((n) => {
    const chip = H(n, 0);
    chip.fills = solid(C.paper);
    chip.strokes = solid(C.line);
    chip.strokeWeight = 1;
    chip.cornerRadius = 999;
    chip.paddingTop = 8;
    chip.paddingBottom = 8;
    chip.paddingLeft = 14;
    chip.paddingRight = 14;
    chip.appendChild(T(n, { style: "Medium", size: 14, color: C.ink }));
    chips.appendChild(chip);
  });
  add(page, chips);
  const pad = V("Local", 0);
  pad.paddingTop = 20;
  pad.paddingBottom = 36;
  pad.paddingLeft = 80;
  pad.paddingRight = 80;
  pad.appendChild(twoCards(d.cards[0], d.cards[1]));
  add(page, pad);
  add(page, faqBlock(d.faqs));
  ctaBand(page, "Need someone in " + d.city + "?", "Call, or leave a number. We drive from the Dallas office. We do not pretend to have a shop here.");
  footer(page);
  return page;
}

function articlePage(d) {
  const page = shell(d.name);
  chrome(page);
  add(page, heroBlock(d.crumb, d.h1, d.lede));
  const body = V("Article", 22);
  body.paddingTop = 12;
  body.paddingBottom = 48;
  body.paddingLeft = 80;
  body.paddingRight = 80;
  d.sections.forEach((s) => {
    const block = V(s[0], 8);
    block.appendChild(wrap(T(s[0], { family: "Fraunces", style: "SemiBold", size: 28, color: C.ink, lh: 34 }), 860));
    block.appendChild(wrap(T(s[1], { size: 17, color: C.soft, lh: 26 }), 860));
    body.appendChild(block);
    block.layoutSizingHorizontal = "FILL";
  });
  add(page, body);
  ctaBand(page, d.cta, "If the checks do not fix it, book a visit. The diagnostic is $89 and waived when you approve the repair.");
  footer(page);
  return page;
}

function prosePage(d) {
  const page = shell(d.name);
  chrome(page);
  add(page, heroBlock(d.crumb, d.h1, d.lede));
  const body = V("Sections", 18);
  body.paddingTop = 8;
  body.paddingBottom = 48;
  body.paddingLeft = 80;
  body.paddingRight = 80;
  d.sections.forEach((s) => {
    const block = V(s[0], 6);
    block.appendChild(T(s[0], { style: "SemiBold", size: 18, color: C.ink }));
    block.appendChild(wrap(T(s[1], { size: 16, color: C.soft, lh: 24 }), 980));
    body.appendChild(block);
    block.layoutSizingHorizontal = "FILL";
  });
  add(page, body);
  footer(page);
  return page;
}

function indexPage(d) {
  const page = shell(d.name);
  chrome(page);
  add(page, heroBlock(d.crumb, d.h1, d.lede));
  const gridWrap = V("Grid", 16);
  gridWrap.paddingTop = 12;
  gridWrap.paddingBottom = 48;
  gridWrap.paddingLeft = 80;
  gridWrap.paddingRight = 80;
  for (let i = 0; i < d.items.length; i += 3) {
    const row = H("Row", 16);
    row.counterAxisAlignItems = "MIN";
    d.items.slice(i, i + 3).forEach((item) => {
      const card = V(item[0], 8);
      card.fills = solid(C.paper);
      card.strokes = solid(C.line);
      card.strokeWeight = 1;
      card.cornerRadius = 18;
      card.paddingTop = 20;
      card.paddingBottom = 20;
      card.paddingLeft = 20;
      card.paddingRight = 20;
      card.appendChild(T(item[2], { style: "SemiBold", size: 11, color: C.copper, ls: 0.8 }));
      card.appendChild(wrap(T(item[0], { family: "Fraunces", style: "SemiBold", size: 26, color: C.ink, lh: 30 }), 340));
      card.appendChild(wrap(T(item[1], { size: 15, color: C.soft, lh: 22 }), 340));
      row.appendChild(card);
      card.layoutSizingHorizontal = "FILL";
    });
    gridWrap.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
  }
  add(page, gridWrap);
  footer(page);
  return page;
}

function membershipPage() {
  const page = shell("Membership");
  chrome(page);
  add(page, heroBlock("MEMBERSHIP", "Two tune-ups a year. Priority when it is 104.", "The Seasonal Club is a phone conversation, not a checkout. This site never charges a card and never starts a membership on its own. Leave a number and the owner calls to explain it."));
  const pad = V("Offer and form", 16);
  pad.paddingLeft = 80;
  pad.paddingRight = 80;
  pad.paddingBottom = 48;
  pad.paddingTop = 8;
  const row = H("Split", 20);
  row.counterAxisAlignItems = "MIN";
  const left = V("Included", 10);
  left.fills = solid(C.sage);
  left.cornerRadius = 18;
  left.paddingTop = 22;
  left.paddingBottom = 22;
  left.paddingLeft = 22;
  left.paddingRight = 22;
  ["Spring AC tune-up and fall furnace checkup.", "Priority scheduling on days over 100.", "Filters at our cost, not a catalog markup.", "You can leave whenever. No annual contract signed on this site."].forEach((line) => {
    left.appendChild(wrap(T(line, { size: 16, color: C.ink, lh: 22 }), 520));
  });
  const right = V("Enquiry", 12);
  right.fills = solid(C.paper);
  right.strokes = solid(C.line);
  right.strokeWeight = 1;
  right.cornerRadius = 18;
  right.paddingTop = 22;
  right.paddingBottom = 22;
  right.paddingLeft = 22;
  right.paddingRight = 22;
  right.appendChild(T("Ask about the club", { family: "Fraunces", style: "SemiBold", size: 26, color: C.ink }));
  const name = field("Name", "Maria G.");
  const phone = field("Phone", "(214) 555-0160");
  const zip = field("ZIP", "75023");
  [name, phone, zip].forEach((f) => {
    right.appendChild(f);
    f.layoutSizingHorizontal = "FILL";
  });
  right.appendChild(wrap(T("We will call. Consent v1 is stored with the time. No payment field, on purpose.", { size: 13, color: C.mute, lh: 18 }), 480));
  right.appendChild(button("Request a call", "primary"));
  row.appendChild(left);
  row.appendChild(right);
  left.layoutSizingHorizontal = "FILL";
  right.layoutSizingHorizontal = "FILL";
  pad.appendChild(row);
  row.layoutSizingHorizontal = "FILL";
  add(page, pad);
  footer(page);
  return page;
}

function reviewsPage() {
  const reviews = [
    ["The tech named the part before he opened the van. The bill matched the number from the phone.", "Maria G.", "Plano · Sep 12"],
    ["Furnace checkup took an hour. He showed me the filter and did not try to sell a system.", "James Okonkwo", "Richardson · Oct 2"],
    ["Called at 9 at night. Somebody picked up, and a truck was here before breakfast.", "Priya S.", "East Dallas · Aug 28"],
    ["Upstairs finally cools. He explained the duct, not a lease.", "Dana Cho", "Irving · Jul 19"],
    ["On time for the window he promised. Diagnostic was waived with the repair.", "Luis Alvarez", "Plano · Jun 3"],
    ["Straight answer that the furnace can wait a year. I will call him in the fall.", "Helen Park", "Frisco · May 22"],
  ];
  const page = shell("Reviews");
  chrome(page);
  add(page, heroBlock("SAMPLE REVIEWS", "What a full review page looks like.", "Every card is labeled sample. These are not live Google reviews and not a claim about a real shop. A real client version asks for the review after the job."));
  const grid = V("Review grid", 16);
  grid.paddingLeft = 80;
  grid.paddingRight = 80;
  grid.paddingBottom = 48;
  grid.paddingTop = 8;
  for (let i = 0; i < reviews.length; i += 3) {
    const row = H("Review row", 16);
    row.counterAxisAlignItems = "MIN";
    reviews.slice(i, i + 3).forEach((r) => {
      const card = V(r[1], 12);
      card.fills = solid(C.paper);
      card.cornerRadius = 18;
      card.strokes = solid(C.line);
      card.strokeWeight = 1;
      card.paddingTop = 18;
      card.paddingBottom = 18;
      card.paddingLeft = 18;
      card.paddingRight = 18;
      const top = H("Top", 8);
      top.primaryAxisAlignItems = "SPACE_BETWEEN";
      top.appendChild(T("★★★★★", { family: "Fraunces", style: "SemiBold", size: 14, color: C.gold, ls: 1 }));
      const pill = H("Sample", 0);
      pill.fills = solid("#F3E2D4");
      pill.cornerRadius = 999;
      pill.paddingTop = 4;
      pill.paddingBottom = 4;
      pill.paddingLeft = 8;
      pill.paddingRight = 8;
      pill.appendChild(T("SAMPLE", { style: "SemiBold", size: 10, color: C.copper, ls: 0.6 }));
      top.appendChild(pill);
      card.appendChild(top);
      top.layoutSizingHorizontal = "FILL";
      card.appendChild(wrap(T(r[0], { family: "Fraunces", style: "Italic", size: 18, color: C.ink, lh: 26 }), 340));
      card.appendChild(T(r[1], { style: "SemiBold", size: 14, color: C.ink }));
      card.appendChild(T(r[2], { size: 13, color: C.mute }));
      row.appendChild(card);
      card.layoutSizingHorizontal = "FILL";
    });
    grid.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
  }
  add(page, grid);
  footer(page);
  return page;
}

function componentsBoard() {
  const page = shell("Components");
  const head = V("Head", 8);
  head.paddingTop = 36;
  head.paddingBottom = 8;
  head.paddingLeft = 40;
  head.paddingRight = 40;
  head.appendChild(T("COMPONENTS", { style: "SemiBold", size: 12, color: C.copper, ls: 1.1 }));
  head.appendChild(T("Same pieces as the screens.", { family: "Fraunces", style: "SemiBold", size: 36, color: C.ink }));
  add(page, head);
  const row = H("Buttons", 12);
  row.paddingLeft = 40;
  row.paddingRight = 40;
  row.paddingTop = 16;
  row.appendChild(button("Book service", "primary"));
  row.appendChild(button("Call (214) 555-0148", "ghost"));
  row.appendChild(button("On a dark band", "light"));
  add(page, row);
  const pills = H("Pills", 8);
  pills.paddingLeft = 40;
  pills.paddingTop = 20;
  pills.paddingBottom = 12;
  const specs = [
    ["New", C.sage, C.cedar],
    ["Contacted", "#F3E2D4", C.copper],
    ["Scheduled", C.cedar, C.paper],
    ["Completed", "#E7E4DE", C.mute],
    ["URGENT", "#F8E6E1", C.heat],
    ["SAMPLE", "#F3E2D4", C.copper],
  ];
  specs.forEach((s) => {
    const p = H(s[0], 0);
    p.fills = solid(s[1]);
    p.cornerRadius = 999;
    p.paddingTop = 4;
    p.paddingBottom = 4;
    p.paddingLeft = 8;
    p.paddingRight = 8;
    p.appendChild(T(s[0], { style: "SemiBold", size: 11, color: s[2], ls: 0.4 }));
    pills.appendChild(p);
  });
  add(page, pills);
  const fields = V("Fields", 12);
  fields.paddingLeft = 40;
  fields.paddingRight = 40;
  fields.paddingTop = 12;
  fields.paddingBottom = 36;
  fields.resize(640, 40);
  fields.primaryAxisSizingMode = "AUTO";
  fields.counterAxisSizingMode = "FIXED";
  const ok = field("Phone", "(214) 555-0148");
  const bad = field("ZIP", "78701", "Outside Dallas–Fort Worth. You can still leave a number.");
  fields.appendChild(ok);
  ok.layoutSizingHorizontal = "FILL";
  fields.appendChild(bad);
  bad.layoutSizingHorizontal = "FILL";
  page.appendChild(fields);
  return page;
}

function desktopBooking(errored) {
  const page = shell(errored ? "Book / Desktop — errors" : "Book / Desktop");
  page.fills = solid(C.sand);
  const bar = H("Top", 0);
  bar.fills = solid(C.paper);
  bar.paddingTop = 16;
  bar.paddingBottom = 16;
  bar.paddingLeft = 40;
  bar.paddingRight = 40;
  bar.primaryAxisAlignItems = "SPACE_BETWEEN";
  bar.strokes = solid(C.line);
  bar.strokeWeight = 1;
  bar.appendChild(T("Apex", { family: "Fraunces", style: "SemiBold", size: 22, color: C.cedar }));
  bar.appendChild(T("(214) 555-0148", { style: "SemiBold", size: 16, color: C.cedar }));
  add(page, bar);
  const body = H("Booking layout", 28);
  body.paddingTop = 36;
  body.paddingBottom = 48;
  body.paddingLeft = 80;
  body.paddingRight = 80;
  body.counterAxisAlignItems = "MIN";
  const steps = V("Steps", 12);
  steps.resize(360, 40);
  steps.primaryAxisSizingMode = "AUTO";
  steps.counterAxisSizingMode = "FIXED";
  steps.appendChild(wrap(T(errored ? "Fix two fields, then send." : "Under a minute, on a desk too.", { family: "Fraunces", style: "SemiBold", size: 32, color: C.ink, lh: 38 }), 340));
  [
    ["1", "ZIP", errored ? "78701 is outside the drive" : "75024 · Plano · we serve this", !errored],
    ["2", "Free estimate", "Replacement, not a repair", true],
    ["3", "Details", errored ? "Phone is missing" : "Address and a window", !errored],
  ].forEach((s) => {
    const row = H("Step " + s[0], 10);
    row.counterAxisAlignItems = "MIN";
    const n = H("n", 0);
    n.resize(28, 28);
    n.primaryAxisSizingMode = "FIXED";
    n.counterAxisSizingMode = "FIXED";
    n.primaryAxisAlignItems = "CENTER";
    n.cornerRadius = 999;
    n.fills = solid(s[3] ? C.cedar : C.paper);
    n.strokes = solid(s[3] ? C.cedar : C.line);
    n.strokeWeight = 1;
    n.appendChild(T(s[0], { style: "SemiBold", size: 13, color: s[3] ? C.paper : C.ink }));
    const copy = V(s[1], 2);
    copy.appendChild(T(s[1], { style: "SemiBold", size: 15, color: C.ink }));
    copy.appendChild(wrap(T(s[2], { size: 13, color: errored && !s[3] ? C.heat : C.mute, lh: 18 }), 280));
    row.appendChild(n);
    row.appendChild(copy);
    steps.appendChild(row);
  });
  const form = V("Form", 12);
  form.fills = solid(C.paper);
  form.cornerRadius = 20;
  form.strokes = solid(C.line);
  form.strokeWeight = 1;
  form.paddingTop = 24;
  form.paddingBottom = 24;
  form.paddingLeft = 24;
  form.paddingRight = 24;
  form.appendChild(T("FREE ESTIMATE", { style: "SemiBold", size: 12, color: C.copper, ls: 1 }));
  form.appendChild(T("A visit to price the new system.", { family: "Fraunces", style: "SemiBold", size: 28, color: C.ink }));
  const f1 = field("Name", errored ? "" : "James Okonkwo", errored ? "Name is required." : "");
  const f2 = field("Phone", errored ? "" : "(469) 555-0172", errored ? "Add a phone number so the owner can call you back." : "");
  const f3 = field("ZIP", errored ? "78701" : "75024", errored ? "78701 is outside Dallas–Fort Worth. Leave the number anyway, or try another ZIP." : "");
  const f4 = field("Address", errored ? "" : "4180 West Spring Creek, Plano", errored ? "Address is needed for an in-home estimate." : "");
  [f1, f2, f3, f4].forEach((f) => {
    form.appendChild(f);
    f.layoutSizingHorizontal = "FILL";
  });
  form.appendChild(T("Window", { style: "Medium", size: 13, color: C.ink }));
  const wins = H("Windows", 8);
  ["ASAP", "Morning", "Afternoon", "Evening"].forEach((w, i) => {
    const chip = H(w, 0);
    chip.cornerRadius = 999;
    chip.paddingTop = 8;
    chip.paddingBottom = 8;
    chip.paddingLeft = 12;
    chip.paddingRight = 12;
    const on = !errored && i === 1;
    chip.fills = solid(on ? C.cedar : C.sand);
    chip.strokes = solid(on ? C.cedar : C.line);
    chip.strokeWeight = 1;
    chip.appendChild(T(w, { style: "Medium", size: 13, color: on ? C.paper : C.ink }));
    wins.appendChild(chip);
  });
  form.appendChild(wins);
  if (errored) form.appendChild(wrap(T("Pick a window. This is a request, not a confirmed appointment.", { size: 13, color: C.heat, lh: 18 }), 560));
  form.appendChild(button(errored ? "Fix and send" : "Request the estimate", "primary"));
  body.appendChild(steps);
  body.appendChild(form);
  form.layoutSizingHorizontal = "FILL";
  add(page, body);
  return page;
}

function loginScreen() {
  const page = shell("Admin / Login");
  page.primaryAxisAlignItems = "CENTER";
  page.paddingTop = 80;
  page.paddingBottom = 80;
  page.counterAxisAlignItems = "CENTER";
  const card = V("Login card", 12);
  card.fills = solid(C.paper);
  card.strokes = solid(C.line);
  card.strokeWeight = 1;
  card.cornerRadius = 20;
  card.paddingTop = 28;
  card.paddingBottom = 28;
  card.paddingLeft = 28;
  card.paddingRight = 28;
  card.resize(440, 40);
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.appendChild(T("Apex", { family: "Fraunces", style: "SemiBold", size: 28, color: C.cedar }));
  card.appendChild(T("OWNER DESK", { style: "SemiBold", size: 12, color: C.copper, ls: 1.1 }));
  card.appendChild(wrap(T("Sign in is allowlist only. There is no public sign-up, and the second step is a six-digit code.", { size: 14, color: C.soft, lh: 20 }), 380));
  [field("Email", "owner@apex.example"), field("Password", "••••••••••"), field("Authentication code", "000 000")].forEach((f) => {
    card.appendChild(f);
    f.layoutSizingHorizontal = "FILL";
  });
  const go = button("Sign in", "primary");
  card.appendChild(go);
  go.layoutSizingHorizontal = "FILL";
  card.appendChild(wrap(T("A prospect demo can be read-only. Editing leads stays behind this screen.", { size: 13, color: C.mute, lh: 18 }), 380));
  page.appendChild(card);
  return page;
}

function emptyInbox() {
  const page = shell("Admin / Empty inbox");
  page.layoutMode = "HORIZONTAL";
  page.itemSpacing = 0;
  page.primaryAxisSizingMode = "FIXED";
  page.counterAxisSizingMode = "FIXED";
  page.resize(1360, 720);
  const side = V("Sidebar", 8);
  side.fills = solid(C.deep);
  side.paddingTop = 22;
  side.paddingLeft = 16;
  side.paddingRight = 16;
  side.resize(232, 720);
  side.primaryAxisSizingMode = "FIXED";
  side.counterAxisSizingMode = "FIXED";
  side.appendChild(T("Apex", { family: "Fraunces", style: "SemiBold", size: 24, color: C.paper }));
  side.appendChild(T("OWNER DESK", { style: "Medium", size: 11, color: "#8FB3A4", ls: 1 }));
  const inbox = H("Inbox nav", 0);
  inbox.fills = solid("#1C4A3C");
  inbox.cornerRadius = 10;
  inbox.paddingTop = 10;
  inbox.paddingBottom = 10;
  inbox.paddingLeft = 12;
  inbox.paddingRight = 12;
  inbox.appendChild(T("Inbox", { style: "SemiBold", size: 14, color: C.paper }));
  side.appendChild(inbox);
  inbox.layoutSizingHorizontal = "FILL";
  const main = V("Empty", 12);
  main.fills = solid(C.sand);
  main.paddingTop = 28;
  main.paddingLeft = 28;
  main.paddingRight = 28;
  main.primaryAxisAlignItems = "CENTER";
  main.counterAxisAlignItems = "CENTER";
  main.appendChild(T("Nothing in Urgent", { family: "Fraunces", style: "SemiBold", size: 32, color: C.ink }));
  main.appendChild(wrap(T("No emergency leads are waiting. Clear the filter to see the full inbox, or leave it — an empty urgent list is the good version of this screen.", { size: 15, color: C.soft, lh: 22 }), 460));
  main.appendChild(button("Show all leads", "primary"));
  page.appendChild(side);
  page.appendChild(main);
  main.layoutSizingHorizontal = "FILL";
  main.layoutSizingVertical = "FILL";
  return page;
}

function place(page, node) {
  if (page.children.some((c) => c.name === node.name)) {
    node.remove();
    return false;
  }
  let maxRight = 0;
  for (const c of page.children) maxRight = Math.max(maxRight, c.x + c.width);
  const x = page.children.length ? maxRight + 160 : 80;
  page.appendChild(node);
  node.x = x;
  node.y = 96;
  return true;
}

const services = [
  {
    name: "Service / AC replacement",
    crumb: "SERVICES  /  REPLACEMENT",
    h1: "A new system, priced in the house.",
    lede: "Replacement is a planned job, not a midnight one. The estimate visit is free. Most full systems we write up in Dallas–Fort Worth land between $7,500 and $14,500 before any rebate. That is a range, not your quote.",
    primary: "Book a free estimate",
    secondary: "Call (214) 555-0148",
    cards: [
      ["What the visit includes", "We look at the equipment, the ducts, and the electrical. You get a written number before anyone orders a system. Financing is explained in dollars, not a teaser rate.", C.paper],
      ["What we will not do", "No lease program, no online shop, and no twelve-item service menu. If repair is the smarter buy, we say so and price the repair instead.", C.sage],
    ],
    notes: ["Written price before the order.", "Good, better, and best — three options, not thirty.", "Rebate paperwork explained, not promised.", "Old equipment hauled away."],
    faqs: [
      ["How long does a replacement take?", "Most changeouts are a full day. We confirm the day when the estimate is approved, not when the form is sent."],
      ["Do you finance on this website?", "No. Nothing is charged here. If you want a monthly number, we walk through it at the kitchen table and you apply with the lender, not with us."],
    ],
    cta: "Want the estimate, not a sales script?",
    ctaSub: "Leave a number. The owner sees it, then someone calls to set the visit.",
  },
  {
    name: "Service / Heating repair",
    crumb: "SERVICES  /  HEATING",
    h1: "Heat, before the first cold night.",
    lede: "Furnaces and heat pumps. In Dallas the season turns fast, so the $89 furnace checkup runs through October 31. Repairs are quoted before the work. Most heating repairs we see land between $180 and $750.",
    cards: [
      ["Call now if", "You smell gas, the furnace short-cycles and the house is cold, or a carbon-monoxide alarm is going off. Leave the house if the alarm is sounding, then call.", C.paper],
      ["It can wait for a window if", "The heat works but runs constantly, a room stays cold, or you are due for the fall checkup and nothing is actually broken.", C.sage],
    ],
    notes: ["$89 checkup through October 31.", "Heat exchanger inspected, not shrugged at.", "Filter shown to you, not just swapped.", "Quote before parts."],
    faqs: [
      ["Is a checkup the same as a repair?", "No. The checkup is the inspection and the cleaning. If we find a repair, you get a price and you decide. The $89 is waived when you approve that repair."],
      ["Do you service heat pumps?", "Yes. A lot of newer Frisco and Plano houses have them, and they need the fall check the same as a gas furnace."],
    ],
    cta: "Book the furnace checkup.",
    ctaSub: "Or call if the heat is already out. Emergency calls still use the short form.",
  },
  {
    name: "Service / Tune-ups",
    crumb: "SERVICES  /  TUNE-UPS",
    h1: "Two seasons. One checkup each.",
    lede: "Spring is the AC. Fall is the furnace. Book the fall checkup before the first cold week, not during it. Through October 31 the furnace visit is $89, with a written price if we find something to fix.",
    cards: [
      ["On the AC visit", "Filter, condensate drain, outdoor coil clearance, electrical draw, refrigerant temperatures, and a plain answer about whether the system is near the end.", C.paper],
      ["On the furnace visit", "Filter, burners, flame sensor, limit switch, the heat exchanger, and the flue. If the exchanger is unsafe we shut it down and say so.", C.sage],
    ],
    notes: ["You pick a morning, afternoon, or evening.", "Not a live calendar. We confirm by phone.", "Members get both visits and priority.", "No contract signed on this site."],
    faqs: [
      ["What if you find a repair?", "You get the number before we start. You can decline. The diagnostic fee is waived only when you approve the repair."],
      ["Can I put both tune-ups on one membership?", "Yes. That is the Seasonal Club. Ask on the membership page. We call. We do not bill you here."],
    ],
    cta: "Put the fall checkup on the books.",
    ctaSub: "The offer ends October 31. After that the visit is still available. The price changes.",
  },
  {
    name: "Service / Indoor air",
    crumb: "SERVICES  /  INDOOR AIR",
    h1: "Filters, ducts, and humidity. No gadget wall.",
    lede: "Most houses need a filter on schedule and a drain that actually drains. Some need a duct repair or a dehumidifier. We say which is which. We do not lead with a catalog of air purifiers.",
    cards: [
      ["Worth doing", "The right filter, changed on a schedule. A clogged condensate line. A return that was never cut large enough. A duct that has come apart in the attic.", C.paper],
      ["Often a later conversation", "Whole-home UV, a media cabinet, and a purifier. Sometimes yes, after the basics. We will not sell them on the first visit to make the ticket bigger.", C.sage],
    ],
    notes: ["Humidity is the Dallas problem in July.", "Leaks waste more money than a new filter brand.", "We show you the filter, not a brochure.", "Price before any add-on."],
    faqs: [
      ["Will a new filter fix a warm house?", "If the filter is packed solid, sometimes. If the system is tired or the ducts are open in the attic, no. We check the cheap cause first."],
      ["Do you clean ducts?", "When they are actually dirty or disconnected. Not as a default add-on for every tune-up."],
    ],
    cta: "Tell us what the air feels like.",
    ctaSub: "Hot, sticky, dusty, or just overdue. The form asks for that in one line.",
  },
  {
    name: "Service / 24-7 emergency",
    crumb: "SERVICES  /  EMERGENCY",
    h1: "The line is open. The form is four fields.",
    lede: "If the house is climbing and the system is dead, call (214) 555-0148. If you would rather not talk yet, the emergency form asks for your name, phone, ZIP, and what is wrong — so we still have a number if you stop halfway.",
    primary: "Call (214) 555-0148",
    secondary: "Send the short form",
    cards: [
      ["Call us now", "No cooling and the house is already hot. A burning smell at the unit. A carbon-monoxide alarm. Water pouring from the air handler. Gas smell: leave, then call the gas company and us.", C.paper],
      ["Book a window instead", "It still runs, a room is warm, or you want the fall checkup. Those are repair and tune-up requests. They are not pinned to the top of the inbox.", C.sage],
    ],
    notes: ["Answered 24/7, including the form.", "Urgent emails start with URGENT.", "The lead is pinned in the inbox.", "A second call within 10 minutes updates the same lead."],
    faqs: [
      ["How fast can you get here?", "Emergencies jump the list. We give you a window when we call back, not a fake countdown on the website."],
      ["What if my ZIP is outside the area?", "We say so. You can still leave a number, and we will tell you we do not drive there."],
    ],
    cta: "House hot? Call. Or leave the number.",
    ctaSub: "Either one reaches the owner. The email shows up in seconds.",
  },
];

const areas = [
  {
    name: "Area / Dallas",
    city: "Dallas",
    h1: "Dallas, where the office actually is.",
    lede: "This is the only office. 1200 Demo Street is a placeholder address for the demo, and the real point stands: one shop, in Dallas, and the truck leaves from here. Lakewood bungalows and Preston Hollow two-stories are not the same job.",
    neighborhoods: ["Lakewood", "East Dallas", "Lake Highlands", "Oak Cliff", "Kessler", "Preston Hollow", "Oak Lawn", "Lowest Greenville"],
    cards: [
      ["What we see here", "Attic air handlers in 1920s and 1950s houses, original electrical that cannot take a larger condenser, and a lot of systems that were 'fine last July' until they were not.", C.paper],
      ["Plain prices", "Diagnostic $89, waived with the repair. Most repairs $180–$650. A replacement estimate is free, in the house, and it is allowed to come back as 'repair it instead.'", C.paper],
    ],
    faqs: [
      ["Are you based in Dallas?", "Yes. This is the office. Every other city on the site is a place we drive to, not a second shop."],
      ["Do you cover the whole city?", "Dallas ZIP codes we serve are checked on the booking form. If yours is outside the drive, the form says so."],
    ],
  },
  {
    name: "Area / Irving",
    city: "Irving",
    h1: "Serving Irving from Dallas.",
    lede: "Las Colinas, Valley Ranch, and the ranch houses south of 183. A lot of these systems went in during the 1990s and the upstairs has been losing the afternoon for years. There is no Irving office.",
    neighborhoods: ["Las Colinas", "Valley Ranch", "Plymouth Park", "Hackberry Creek", "Heritage District"],
    cards: [
      ["What we see here", "Two-story houses where the upstairs is a different climate from the downstairs, and package units on older roofs that are one capacitor away from a silent Saturday.", C.paper],
      ["Plain prices", "Same ranges as Dallas, because it is the same truck. $89 to diagnose. Most repairs $180–$650. Free replacement estimate if the system is actually done.", C.paper],
    ],
    faqs: [
      ["How soon can you reach Las Colinas?", "Same-day windows most days. An emergency jumps ahead of a tune-up. We confirm the window by phone."],
      ["Do you have a showroom in Irving?", "No. We do not sell from a second address. The office is in Dallas."],
    ],
  },
  {
    name: "Area / Garland",
    city: "Garland",
    h1: "Serving Garland. The shop is still in Dallas.",
    lede: "Firewheel, Embree, and the houses closer to downtown Garland where the furnace is original and has been 'reliable' for thirty years. Reliable is not the same as safe. The fall checkup is the visit for that.",
    neighborhoods: ["Firewheel", "Embree", "Downtown Garland", "Carriagehouse", "Oaks of Garland"],
    cards: [
      ["What we see here", "Closet furnaces that have never had the heat exchanger looked at, and condensers boxed in by a new fence the installer did not plan for.", C.paper],
      ["Plain prices", "The October furnace checkup is $89 through the 31st. Repairs are quoted first. We will not talk you into a system if a sensor and a cleaning will do.", C.paper],
    ],
    faqs: [
      ["Is the $89 checkup only for Dallas?", "No. Garland is inside the drive. The offer date is the same."],
      ["What if the furnace should be replaced?", "You get a written estimate and a repair price, when repair is still honest. You pick."],
    ],
  },
  {
    name: "Area / Richardson",
    city: "Richardson",
    h1: "Serving Richardson from the Dallas office.",
    lede: "Canyon Creek, the Heights, and the neighborhoods off 75. A mix of 1970s ranches and later two-stories. Spring tune-ups here book out once the first hot week hits the forecast.",
    neighborhoods: ["Canyon Creek", "Richardson Heights", "Duck Creek", "Berkner", "Northrich"],
    cards: [
      ["What we see here", "Original equipment in otherwise cared-for houses, and a lot of thermostats that were replaced without anyone checking the drain line.", C.paper],
      ["Plain prices", "Diagnostic $89, waived with an approved repair. Most repairs $180–$650. Estimates for replacement are free and written.", C.paper],
    ],
    faqs: [
      ["Do you charge a trip fee on top of the diagnostic?", "The diagnostic is the trip. You are not paying a dispatch fee and then a diagnostic."],
      ["Can I book from a Richardson ZIP?", "Yes, if the ZIP check says we serve it. If it does not, you can still leave a number."],
    ],
  },
  {
    name: "Area / Frisco",
    city: "Frisco",
    h1: "Serving Frisco. Newer houses, same truck.",
    lede: "Starwood, Phillips Creek, and the villages off Main. The systems are younger here and a lot of them were the builder's grade. Eight to twelve years in, the upstairs gives up first. We drive up from Dallas. We do not have a Frisco storefront.",
    neighborhoods: ["Starwood", "Phillips Creek", "Newman Village", "Richwoods", "Grayhawk"],
    cards: [
      ["What we see here", "Heat pumps and high-efficiency furnaces that were never commissioned properly, and condensers with six inches of clearance because the builder planted a shrub on top of them.", C.paper],
      ["Plain prices", "Same diagnostic and the same repair range. A builder warranty is not our warranty — if it is still covered, we will tell you to call the builder first.", C.paper],
    ],
    faqs: [
      ["My house is only ten years old. Why is it failing?", "Builder-grade equipment on a tight install often does. We will say if it is a simple fix or a system that was tired early."],
      ["Is there an office in Frisco?", "No. Serving Frisco is not the same as an office in Frisco, and we do not write it that way."],
    ],
  },
];

const articles = [
  {
    name: "Article / Spring AC checklist",
    crumb: "SEASONAL  /  SPRING",
    h1: "The spring AC checkup, before the first 95-degree week.",
    lede: "Dallas does not warm up politely. The week the forecast crosses 95, every shop's phone melts. This is the list we wish people did in March.",
    sections: [
      ["Change the filter first", "A packed filter is the cheapest reason a house feels weak. If you cannot see light through it, replace it. Write the date on the frame. A tune-up on a suffocating filter wastes the visit."],
      ["Give the outdoor unit room", "Two feet of clearance, no shrub grown through the coil, no fence built against the fan. If you cannot walk around it, the tech cannot wash it, and the system cannot breathe."],
      ["Listen for the short cycle", "On, off, on, off, every few minutes, while the house never quite cools. That is not 'working hard.' That is a reason to book, not a reason to turn the thermostat down another two degrees."],
      ["Check the drain, not just the vent", "If the pan under the attic unit has standing water, or there is a stain on the ceiling, the line is clogged. Catch it before it becomes a ceiling repair that has nothing to do with tonnage."],
      ["Book the visit before you need it the same day", "The $89 diagnostic is the visit. In spring it is a tune-up. In July it is an emergency and you are behind a dozen houses that waited too."],
    ],
    cta: "Book the spring visit while the calendar is still calm.",
  },
  {
    name: "Article / AC not cooling",
    crumb: "SEASONAL  /  BEFORE YOU CALL",
    h1: "AC not cooling? Five checks before you call.",
    lede: "Some no-cool calls are a thermostat, a tripped breaker, or a filter. Do these first. If the house is already miserable, skip the list and call.",
    sections: [
      ["1. The thermostat is actually asking for cold", "Mode set to cool, fan on auto, setpoint a few degrees below the room. A schedule can put the system back to 78 while you stand there wondering. Check the hold."],
      ["2. The filter is not a brick", "Pull it. If it collapses or you cannot see through it, that can be the whole problem. Replace it and give the system twenty minutes before you decide it failed."],
      ["3. The breaker is not halfway", "At the panel and at the disconnect by the outdoor unit. A breaker that looks on but feels soft needs a person. Do not keep resetting a breaker that trips again."],
      ["4. The outdoor unit is doing something", "Fan turning, compressor humming, air leaving the top warmer than the air around it. Silence, or a fan with no compressor hum, is a call. A burning smell is a call now."],
      ["5. A vent is not closed in the room you care about", "Closed upstairs vents do not 'push more air' elsewhere. They usually make the imbalance worse. Open them, then judge the system."],
    ],
    cta: "If it is still warm after that, call.",
  },
  {
    name: "Article / Fall furnace check",
    crumb: "SEASONAL  /  FALL",
    h1: "The fall furnace check, while October is still warm.",
    lede: "Dallas skips autumn. One week the AC is on, the next morning the house is 61. The furnace checkup is how you find out in October instead of on that morning.",
    sections: [
      ["What the $89 visit actually is", "Through October 31 the furnace checkup is $89. We inspect, clean, and test. If something needs a repair you get a price before we start, and the $89 is waived when you approve it."],
      ["The heat exchanger is the point", "A furnace that still blows warm air can still be unsafe. We look at the exchanger. If it is cracked we shut the furnace down and tell you. That is not an upsell. That is the visit."],
      ["Filters and the flame", "A dirty filter and a lazy flame sensor cause a lot of no-heat calls the first cold night. Both are ordinary. Both should be handled before guests are standing in the hallway in coats."],
      ["Heat pumps get the same season", "If the house is all-electric, the fall visit is still worth it. Defrost, backup heat, and the outdoor coil matter more once the nights drop."],
      ["Book it before the offer date, or book it after", "October 31 is the end of the $89 price, not the end of the season. After that we still come. The number on the site will have changed, and the written quote still comes first."],
    ],
    cta: "Put the furnace checkup on the calendar.",
  },
];

const prose = [
  {
    name: "About",
    crumb: "ABOUT",
    h1: "One crew. The owner still picks up.",
    lede: "Apex is a fictional Dallas shop, built so a small HVAC owner can see what a fast site does with a lead. The voice below is the shop's voice. The company is not real, the license is a placeholder, and the reviews are samples.",
    sections: [
      ["What the crew actually sells", "Emergency repair when the system is down. A written estimate when someone is ready to replace. A tune-up in the spring and the fall. Not a lease, not a store, not a dozen branded plans."],
      ["Why the site is short", "The owner is often in an attic when the phone rings. The site's job is to catch the lead, tell the owner immediately, and make the next step obvious. Design that hides the phone number is a missed call."],
      ["One office", "Dallas. We serve Plano, Irving, Garland, Richardson, and Frisco from that office. We do not list a second address, because a second address is not a place this shop is allowed to sell work from."],
      ["What a real version changes", "The name, the real TDLR number, the real address, real reviews, and a Google Business Profile that matches them. The shape of the site stays."],
    ],
  },
  {
    name: "Guarantee",
    crumb: "GUARANTEE",
    h1: "Four promises. None of them are a slogan.",
    lede: "These are the rules on the truck. They are also the rules a small shop can actually keep. They are not a lifetime warranty printed in mouse type.",
    sections: [
      ["You see the price before the work", "Diagnosis is $89. It is waived when you approve the repair. Parts and labor are quoted before we start. If you say no, you owe the diagnostic and we leave."],
      ["Late to the window, the diagnostic is free", "Windows are ASAP, morning, afternoon, or evening. They are not a live clock. If we miss the window we agreed on the phone, you do not pay the diagnostic."],
      ["The tech is background-checked and insured", "One crew, not a subcontracted name on a magnet. Insurance and the background check are real requirements for a real client. In this demo they are part of the story, not a certificate you can verify."],
      ["The license number rides with the truck", "Texas requires the license number in the advertising. Ours, on this demo, is TACLB000000C and it is fake on purpose. A real shop puts the number it was actually issued."],
    ],
  },
  {
    name: "Financing",
    crumb: "FINANCING",
    h1: "A monthly number, explained. Not a lease.",
    lede: "This website does not take a payment, start an application, or enroll anyone in a lease. If you want to spread out a replacement, we do that conversation in the house, with the price of the system already written down.",
    sections: [
      ["What we will show you", "The cash price. The monthly payment at the term the lender is actually offering. The total you pay if you go the full term. What it costs to pay it off early."],
      ["What we will not show you", "A teaser rate with the real rate in a footnote. A lease that looks like a loan. A 'from $79 a month' banner with no system attached to it."],
      ["Questions worth asking any lender", "Is this a loan or a lease? What is the APR after the promo? Is there a penalty for paying it off? Who services the account in month thirteen?"],
      ["Repair versus replace", "Financing does not make a tired-but-sound system into a bad repair. If the honest job is a $400 part, we will not walk you into a $12,000 note to 'be safe.'"],
    ],
  },
  {
    name: "Privacy",
    crumb: "LEGAL  /  PRIVACY",
    h1: "What we ask for, and why.",
    lede: "The booking form asks for the minimum. This demo does not want real customer data. If you type a real number into the demo, treat it as a number you just handed a prototype.",
    sections: [
      ["Always", "Your name, your phone, and the ZIP. We need those to know whether we drive there and how to call you back."],
      ["Only when a visit is booked", "The street address, a preferred day, and a window. An emergency does not require the address to submit. We ask for it when we call."],
      ["With the lead", "A consent flag, the time, and the wording version (v1). The wording is the sentence next to the checkbox, also written on the SMS page."],
      ["What we do not do", "No sale of the list. No marketing blast in this version. No card number, because nothing is billed here. Leads exist so the owner can do the job and not lose the call."],
      ["This demo", "Sample leads in the admin are invented. Do not submit a number you cannot afford to have sitting in a prototype database."],
    ],
  },
  {
    name: "Terms",
    crumb: "LEGAL  /  TERMS",
    h1: "A request is not yet a job.",
    lede: "Sending the form tells the owner you want a call. It does not reserve a truck, lock a price, or create a contract. The job starts when we confirm it by phone.",
    sections: [
      ["Prices on the site", "Ranges are what most visits look like. The $89 diagnostic and the dated checkup offer are the exceptions, and the offer ends on the date printed next to it. Your price is the one written before the work."],
      ["Windows", "ASAP, morning, afternoon, evening. We confirm which one by phone. The site does not show a live calendar and does not promise a clock time."],
      ["The company", "Apex Climate Solutions is a fictional demo. It is not a licensed HVAC contractor. TACLB000000C is not a real license. Do not hire 'Apex' from this site, because there is no crew to send."],
      ["Service area", "We describe cities we serve from one Dallas office. A page for a suburb is not a claim that an office exists there."],
    ],
  },
  {
    name: "SMS and email consent",
    crumb: "LEGAL  /  CONSENT  V1",
    h1: "The sentence next to the checkbox.",
    lede: "Version 1. Stored with the lead, along with the time you checked it. The box is how you agree to hear back about this request. It is not a newsletter.",
    sections: [
      ["The wording", "Text and email me about this request. Message frequency varies. Reply STOP to opt out of texts, HELP for help. Message and data rates may apply."],
      ["What it covers", "The owner reaching you about the job you just asked for: a missed call, a window, a price. Not a monthly offer blast. This version of the site does not send marketing SMS at all."],
      ["If you do not check it", "You can still submit. We may not text. The email receipt and the owner notification are separate, so the lead is not lost either way."],
      ["Changing your mind", "STOP on a text, or say so when we call. The lead keeps the original consent version so the owner can see what you agreed to."],
    ],
  },
];

async function main() {
  const families = [
    ["Fraunces", "SemiBold"],
    ["Fraunces", "Italic"],
    ["Instrument Sans", "Regular"],
    ["Instrument Sans", "Medium"],
    ["Instrument Sans", "SemiBold"],
  ];
  try {
    for (const f of families) await figma.loadFontAsync({ family: f[0], style: f[1] });
  } catch (err) {
    figma.closePlugin("Could not load Fraunces or Instrument Sans. " + err);
    return;
  }

  const site = figma.root.children.find((p) => p.name === "Site");
  const booking = figma.root.children.find((p) => p.name === "Booking");
  const admin = figma.root.children.find((p) => p.name === "Admin");
  if (!site || !booking || !admin) {
    figma.closePlugin("Expected pages named Site, Booking, and Admin.");
    return;
  }

  let added = 0;
  const skipped = [];

  await figma.setCurrentPageAsync(site);
  const siteFrames = [
    componentsBoard(),
    indexPage({
      name: "Services index",
      crumb: "SERVICES",
      h1: "Repair, replace, or keep it running.",
      lede: "Six pages. No franchise menu. Emergency is a phone call and four fields. Everything else is a visit with a price before the work.",
      items: [
        ["24/7 emergency", "System down, house heating up. Name, phone, ZIP, what is wrong.", "EMERGENCY"],
        ["AC repair", "Not cooling, short cycling, warm air. Most visits $180–$650.", "REPAIR"],
        ["AC replacement", "A free in-home estimate. A written range, not a lease.", "INSTALL"],
        ["Heating repair", "Furnaces and heat pumps. $89 checkup through October 31.", "HEAT"],
        ["Tune-ups", "Spring AC and fall furnace. Book before the season turns.", "SEASON"],
        ["Indoor air", "Filters, drains, ducts, humidity. No gadget wall.", "AIR"],
      ],
    }),
  ];
  services.forEach((d) => siteFrames.push(servicePage(d)));
  siteFrames.push(indexPage({
    name: "Areas index",
    crumb: "SERVICE AREAS",
    h1: "One Dallas office. Six cities served from it.",
    lede: "We say serving, not office in. A suburb page is a drive from Dallas, with the neighborhoods and the problems we actually see there.",
    items: [
      ["Dallas", "The office. Lakewood, Oak Cliff, Preston Hollow, East Dallas.", "OFFICE"],
      ["Plano", "West Plano and Legacy. Spring tune-ups book out early.", "SERVING"],
      ["Irving", "Las Colinas and Valley Ranch. Mostly 1990s systems.", "SERVING"],
      ["Garland", "Firewheel and original closet furnaces.", "SERVING"],
      ["Richardson", "Canyon Creek and the neighborhoods off 75.", "SERVING"],
      ["Frisco", "Newer builds. Builder-grade equipment starting to tire.", "SERVING"],
    ],
  }));
  areas.forEach((d) => siteFrames.push(areaPage(d)));
  siteFrames.push(membershipPage(), reviewsPage());
  prose.forEach((d) => siteFrames.push(prosePage(d)));
  articles.forEach((d) => siteFrames.push(articlePage(d)));

  for (const frame of siteFrames) {
    if (place(site, frame)) added += 1;
    else skipped.push(frame.name);
  }

  await figma.setCurrentPageAsync(booking);
  for (const frame of [desktopBooking(false), desktopBooking(true)]) {
    if (place(booking, frame)) added += 1;
    else skipped.push(frame.name);
  }

  await figma.setCurrentPageAsync(admin);
  for (const frame of [loginScreen(), emptyInbox()]) {
    if (place(admin, frame)) added += 1;
    else skipped.push(frame.name);
  }

  figma.closePlugin("Added " + added + " screens" + (skipped.length ? ". Skipped existing: " + skipped.join(", ") : "."));
}

main().catch((err) => {
  figma.closePlugin("Stopped: " + (err && err.message ? err.message : String(err)));
});
