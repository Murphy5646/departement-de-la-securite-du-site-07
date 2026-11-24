"use strict";

const $ = id => document.getElementById(id);
const USERS_KEY = "site07_users_v1";
const SESSION_KEY = "site07_session_v1";
const services = [
  "Direction de la sécurité",
  "Commandement Marshal",
  "Opérations Marshal",
  "Administration Marshal",
  "Formation Marshal",
  "Personnel du Site-07"
];
const titles = {
  home: "Poste de travail",
  protocols: "Protocoles Marshal",
  directory: "Annuaire des services",
  archives: "Archives & directives"
};

function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function clean(value) {
  return String(value ?? "").trim().replace(/[<>]/g, "");
}
async function hashPassword(password, salt) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("La fonction de chiffrement du navigateur est indisponible. Ouvrez le site en HTTPS.");
  }
  const data = new TextEncoder().encode(salt + password);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
function setMessage(message) {
  const target = $("loginmsg");
  if (target) target.textContent = message;
}
function switchAuth(mode) {
  const registering = mode === "register";
  $("login-form").classList.toggle("hidden", registering);
  $("register-form").classList.toggle("hidden", !registering);
  $("tab-login").classList.toggle("active", !registering);
  $("tab-register").classList.toggle("active", registering);
  setMessage(registering
    ? "Créez votre profil personnel pour le terminal."
    : "Saisissez les identifiants de votre compte.");
}
$("tab-login").addEventListener("click", () => switchAuth("login"));
$("tab-register").addEventListener("click", () => switchAuth("register"));

function showLogin() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
  $("desktop").classList.add("hidden");
  $("login").classList.remove("hidden");
  $("login-pass").value = "";
  switchAuth("login");
  $("login-user").focus();
}
function showDesktop(user) {
  $("login").classList.add("hidden");
  $("desktop").classList.remove("hidden");
  $("displayname").textContent = user.name || "Personnel";
  $("displayrole").textContent = user.service || "Personnel du Site-07";
  $("avatar").textContent = (user.name || "S").charAt(0).toUpperCase();
  $("welcome").textContent = "Bienvenue, " + (user.name || "Personnel") + ".";
  $("statrole").textContent = user.service || "—";
  openWindow("home");
}
async function login() {
  const username = clean($("login-user").value).toLowerCase();
  const password = $("login-pass").value;
  if (!username || !password) {
    setMessage("Veuillez saisir votre identifiant et votre mot de passe.");
    return;
  }
  const user = readUsers().find(item => item.username === username);
  if (!user || !user.salt || !user.passwordHash) {
    setMessage("Identifiant ou mot de passe incorrect.");
    return;
  }
  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    setMessage("Identifiant ou mot de passe incorrect.");
    return;
  }
  localStorage.setItem(SESSION_KEY, user.username);
  showDesktop(user);
}
async function register() {
  const name = clean($("new-name").value);
  const username = clean($("new-user").value).toLowerCase();
  const service = $("new-service").value;
  const password = $("new-pass").value;
  const confirmation = $("new-pass-confirm").value;

  if (name.length < 2 || !/^[a-z0-9._-]{3,24}$/.test(username)) {
    setMessage("Vérifiez le nom et l'identifiant (3 à 24 caractères : lettres, chiffres, . _ -).");
    return;
  }
  if (password.length < 8) {
    setMessage("Le mot de passe doit contenir au moins 8 caractères.");
    return;
  }
  if (password !== confirmation) {
    setMessage("Les deux mots de passe ne correspondent pas.");
    return;
  }

  const users = readUsers();
  if (users.some(user => user.username === username)) {
    setMessage("Cet identifiant est déjà utilisé sur ce navigateur.");
    return;
  }

  const salt = Array.from(window.crypto.getRandomValues(new Uint8Array(16)),
    byte => byte.toString(16).padStart(2, "0")).join("");
  const user = { name, username, service, salt, passwordHash: await hashPassword(password, salt) };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, username);
  showDesktop(user);
}
$("loginbtn").addEventListener("click", () => login().catch(error => setMessage(error.message || "Connexion impossible.")));
$("registerbtn").addEventListener("click", () => register().catch(error => setMessage(error.message || "Création du compte impossible.")));
$("login-pass").addEventListener("keydown", event => {
  if (event.key === "Enter") login().catch(error => setMessage(error.message || "Connexion impossible."));
});
$("new-pass-confirm").addEventListener("keydown", event => {
  if (event.key === "Enter") register().catch(error => setMessage(error.message || "Création du compte impossible."));
});
$("logout").addEventListener("click", showLogin);

const directory = $("directory");
if (directory) {
  services.forEach(service => {
    const article = document.createElement("article");
    const heading = document.createElement("b");
    const description = document.createElement("small");
    heading.textContent = service;
    description.textContent = "Service du Département de la sécurité";
    article.append(heading, description);
    directory.appendChild(article);
  });
}

let zIndex = 10;
function focusWindow(key) {
  const target = $("window-" + key);
  if (!target) return;
  document.querySelectorAll(".app-window.open").forEach(win => {
    win.style.zIndex = String(++zIndex);
  });
  target.style.zIndex = String(++zIndex);
  document.querySelectorAll(".task-app").forEach(button => {
    button.classList.toggle("active", button.dataset.task === key);
  });
}
function openWindow(key) {
  const win = $("window-" + key);
  if (!win) return;
  win.classList.add("open");
  focusWindow(key);
  $("start-menu").classList.add("hidden");
  $("start-button").classList.remove("active");

  let task = $("task-" + key);
  if (!task) {
    task = document.createElement("button");
    task.id = "task-" + key;
    task.className = "task-app";
    task.dataset.task = key;
    task.type = "button";
    task.textContent = titles[key] || key;
    task.addEventListener("click", () => {
      if (win.classList.contains("open")) {
        win.classList.remove("open");
        task.classList.remove("active");
      } else {
        win.classList.add("open");
        focusWindow(key);
      }
    });
    $("task-apps").appendChild(task);
  }
  task.classList.add("active");
}
function closeWindow(key) {
  const win = $("window-" + key);
  if (win) win.classList.remove("open");
  const task = $("task-" + key);
  if (task) task.remove();
}
document.querySelectorAll("[data-open]").forEach(button => {
  button.addEventListener("click", () => openWindow(button.dataset.open));
});
document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeWindow(button.dataset.close));
});
document.querySelectorAll("[data-min]").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.min;
    const win = $("window-" + key);
    if (win) win.classList.remove("open");
    const task = $("task-" + key);
    if (task) task.classList.remove("active");
  });
});

$("start-button").addEventListener("click", () => {
  const menu = $("start-menu");
  menu.classList.toggle("hidden");
  $("start-button").classList.toggle("active", !menu.classList.contains("hidden"));
});
document.addEventListener("click", event => {
  if (!event.target.closest("#start-menu") && !event.target.closest("#start-button")) {
    $("start-menu").classList.add("hidden");
    $("start-button").classList.remove("active");
  }
});

/* Déplacement borné à la zone de bureau, y compris sur écran tactile. */
document.querySelectorAll(".window-titlebar").forEach(bar => {
  let drag = null;
  bar.addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;
    const key = bar.dataset.drag;
    const win = $("window-" + key);
    if (!win || win.classList.contains("maximized")) return;
    focusWindow(key);
    const bounds = win.getBoundingClientRect();
    const parent = win.parentElement.getBoundingClientRect();
    drag = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      parentLeft: parent.left,
      parentTop: parent.top,
      parentWidth: parent.width,
      parentHeight: parent.height
    };
    bar.setPointerCapture(event.pointerId);
  });
  bar.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const win = $("window-" + bar.dataset.drag);
    if (!win) return;
    win.style.transform = "none";
    const maxLeft = Math.max(0, drag.parentWidth - win.offsetWidth);
    const maxTop = Math.max(0, drag.parentHeight - win.offsetHeight);
    const left = event.clientX - drag.parentLeft - drag.offsetX;
    const top = event.clientY - drag.parentTop - drag.offsetY;
    win.style.left = Math.max(0, Math.min(maxLeft, left)) + "px";
    win.style.top = Math.max(0, Math.min(maxTop, top)) + "px";
  });
  const stopDrag = event => {
    if (drag && event.pointerId === drag.pointerId) drag = null;
  };
  bar.addEventListener("pointerup", stopDrag);
  bar.addEventListener("pointercancel", stopDrag);
});

function updateClock() {
  const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  $("clock").textContent = time;
  $("topclock").textContent = time;
  $("taskclock").textContent = time;
}
updateClock();
window.setInterval(updateClock, 1000);

/* Recherche dans les 165 articles et masquage des titres sans résultat. */
const marshalSearch = $("marshal-search");
if (marshalSearch) {
  const articles = Array.from(document.querySelectorAll(".marshal-article"));
  const headings = Array.from(document.querySelectorAll(".marshal-heading"));
  const total = articles.length;
  const count = $("marshal-count");

  marshalSearch.addEventListener("input", () => {
    const query = marshalSearch.value.trim().toLocaleLowerCase("fr");
    let visible = 0;

    articles.forEach(article => {
      const match = !query || article.textContent.toLocaleLowerCase("fr").includes(query);
      article.hidden = !match;
      if (match) visible++;
    });

    headings.forEach(heading => {
      let next = heading.nextElementSibling;
      let hasResult = false;
      while (next && !next.classList.contains("marshal-heading")) {
        if (next.classList.contains("marshal-article") && !next.hidden) hasResult = true;
        next = next.nextElementSibling;
      }
      heading.hidden = Boolean(query) && !hasResult;
    });

    if (count) {
      count.textContent = query
        ? visible + " ARTICLE(S) TROUVÉ(S)"
        : total + " ARTICLES";
    }
  });

  if (count) count.textContent = total + " ARTICLES";
}

window.addEventListener("load", () => {
  window.setTimeout(() => {
    $("boot").classList.add("hidden");
    let username = null;
    try { username = localStorage.getItem(SESSION_KEY); } catch {}
    const user = readUsers().find(item => item.username === username);
    if (user) showDesktop(user);
    else {
      $("login").classList.remove("hidden");
      switchAuth("login");
    }
  }, 800);
});


/* Applications complémentaires — données conservées sur cet appareil. */
const APP_KEYS = {
  notes: "site07_notes_v1",
  tasks: "site07_tasks_v1",
  reports: "site07_reports_v1",
  events: "site07_events_v1",
  mail: "site07_mail_v1",
  comfort: "site07_comfort_v1"
};
function readAppData(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch { return fallback; }
}
function writeAppData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
function makeAppItem(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

/* Bloc-notes : sauvegarde automatique. */
const notesInput = $("notes-content");
if (notesInput) {
  notesInput.value = localStorage.getItem(APP_KEYS.notes) || "";
  notesInput.addEventListener("input", () => {
    const ok = writeAppData(APP_KEYS.notes, notesInput.value);
    $("notes-status").textContent = ok ? "Sauvegardé localement." : "Stockage indisponible ou saturé.";
  });
}

/* Calculatrice : analyse arithmétique limitée, sans eval() ni exécution de code. */
function calculateExpression(source) {
  const normalized = source.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, ".");
  const tokens = normalized.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+*/-]/g) || [];
  if (tokens.join("") !== normalized.replace(/\s+/g, "")) throw new Error("Expression invalide");
  let position = 0;
  function factor() {
    const token = tokens[position++];
    if (token === "+") return factor();
    if (token === "-") return -factor();
    if (token === "(") {
      const value = expression();
      if (tokens[position++] !== ")") throw new Error("Parenthèse manquante");
      return value;
    }
    if (token === undefined || !/^\d*\.?\d+$/.test(token)) throw new Error("Nombre attendu");
    return Number(token);
  }
  function term() {
    let value = factor();
    while (tokens[position] === "*" || tokens[position] === "/") {
      const operator = tokens[position++];
      const right = factor();
      if (operator === "/" && right === 0) throw new Error("Division par zéro");
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }
  function expression() {
    let value = term();
    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position++];
      const right = term();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }
  if (!tokens.length) throw new Error("Saisissez un calcul");
  const result = expression();
  if (position !== tokens.length || !Number.isFinite(result)) throw new Error("Calcul impossible");
  return String(Number(result.toPrecision(12)));
}
const calcDisplay = $("calc-display");
if (calcDisplay) {
  document.querySelectorAll("[data-calc]").forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.calc;
      if (key === "C") calcDisplay.value = "";
      else if (key === "⌫") calcDisplay.value = calcDisplay.value.slice(0, -1);
      else if (key === "=") {
        try { calcDisplay.value = calculateExpression(calcDisplay.value); }
        catch (error) { calcDisplay.value = error.message; }
      } else if (calcDisplay.value.length < 80) calcDisplay.value += key;
    });
  });
  calcDisplay.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      try { calcDisplay.value = calculateExpression(calcDisplay.value); }
      catch (error) { calcDisplay.value = error.message; }
    }
  });
}

/* Calendrier et échéances. */
const calendarDate = $("calendar-date");
function renderEvents() {
  const list = $("calendar-events");
  if (!list) return;
  list.replaceChildren();
  const events = readAppData(APP_KEYS.events, []);
  events.forEach((item, index) => {
    const row = makeAppItem("div", "app-list-item", "");
    const label = makeAppItem("span", "", item.date + " — " + item.title);
    const remove = makeAppItem("button", "secondary", "Supprimer");
    remove.type = "button";
    remove.addEventListener("click", () => {
      const next = readAppData(APP_KEYS.events, []);
      next.splice(index, 1); writeAppData(APP_KEYS.events, next); renderEvents();
    });
    row.append(label, remove); list.appendChild(row);
  });
}
if (calendarDate) {
  calendarDate.value = new Date().toISOString().slice(0, 10);
  calendarDate.addEventListener("change", () => {
    $("calendar-detail").textContent = calendarDate.value
      ? "Date sélectionnée : " + new Date(calendarDate.value + "T12:00:00").toLocaleDateString("fr-FR", {dateStyle:"full"})
      : "Sélectionnez une date.";
  });
  $("calendar-save").addEventListener("click", () => {
    const title = clean($("calendar-event").value);
    if (!calendarDate.value || !title) { $("calendar-detail").textContent = "Indiquez une date et un intitulé."; return; }
    const events = readAppData(APP_KEYS.events, []);
    events.push({date:calendarDate.value,title});
    if (!writeAppData(APP_KEYS.events, events)) { $("calendar-detail").textContent = "Impossible d'enregistrer."; return; }
    $("calendar-event").value = ""; $("calendar-detail").textContent = "Échéance enregistrée localement."; renderEvents();
  });
  renderEvents();
}

/* Gestionnaire de tâches. */
function renderTasks() {
  const list = $("task-list"); if (!list) return;
  list.replaceChildren();
  readAppData(APP_KEYS.tasks, []).forEach(item => {
    const row = makeAppItem("div", "app-list-item", "");
    const label = makeAppItem("span", item.done ? "task-done" : "", item.title);
    const done = makeAppItem("button", "secondary", item.done ? "Rouvrir" : "Terminer");
    const remove = makeAppItem("button", "secondary", "×");
    done.type = remove.type = "button";
    done.addEventListener("click", () => {
      const tasks = readAppData(APP_KEYS.tasks, []);
      const found = tasks.find(task => task.id === item.id);
      if (found) found.done = !found.done;
      writeAppData(APP_KEYS.tasks, tasks); renderTasks();
    });
    remove.addEventListener("click", () => {
      writeAppData(APP_KEYS.tasks, readAppData(APP_KEYS.tasks, []).filter(task => task.id !== item.id));
      renderTasks();
    });
    row.append(label, done, remove); list.appendChild(row);
  });
}
$("task-add").addEventListener("click", () => {
  const input = $("task-input"), title = clean(input.value);
  if (!title) return;
  const tasks = readAppData(APP_KEYS.tasks, []);
  tasks.push({id:Date.now()+Math.random(),title,done:false});
  writeAppData(APP_KEYS.tasks, tasks); input.value = ""; renderTasks();
});
$("task-input").addEventListener("keydown", event => { if (event.key === "Enter") $("task-add").click(); });
renderTasks();

/* Rapports RP. */
function renderReports() {
  const list = $("report-list"); if (!list) return;
  list.replaceChildren();
  readAppData(APP_KEYS.reports, []).slice().reverse().forEach(report => {
    const card = makeAppItem("article", "app-list-item app-report", "");
    card.append(makeAppItem("b", "", report.title));
    card.append(makeAppItem("small", "", report.type + " · " + report.date));
    card.append(makeAppItem("p", "", report.body));
    list.appendChild(card);
  });
}
$("report-save").addEventListener("click", () => {
  const title = clean($("report-title").value), body = clean($("report-body").value);
  if (!title || !body) { $("report-list").textContent = "Complétez l'objet et la description avant d'enregistrer."; return; }
  const reports = readAppData(APP_KEYS.reports, []);
  reports.push({title,body,type:$("report-type").value,date:new Date().toLocaleString("fr-FR")});
  if (!writeAppData(APP_KEYS.reports, reports)) { $("report-list").textContent = "Stockage indisponible."; return; }
  $("report-title").value = ""; $("report-body").value = ""; renderReports();
});
renderReports();

/* Inventaire fictif et recherche. */
const inventory = [
  ["KIT-001","Kit de premiers secours (fictif)","Infirmerie","Disponible"],
  ["COM-014","Terminal de communication RP","Administration","En service"],
  ["DOC-022","Dossiers vierges","Archives","Disponible"],
  ["TEC-008","Outil de diagnostic informatique","Maintenance","Disponible"],
  ["LOG-003","Fournitures de bureau","Administration","Disponible"],
  ["FOR-011","Manuel de formation","Formation","Disponible"],
  ["SEC-005","Badge d'accès fictif","Accueil","À attribuer"],
  ["MOB-002","Tablette de service RP","Commandement","En service"]
];
function renderInventory(query = "") {
  const list = $("inventory-list"); if (!list) return;
  list.replaceChildren();
  inventory.filter(item => item.join(" ").toLocaleLowerCase("fr").includes(query)).forEach(item => {
    const row = makeAppItem("div", "app-list-item", "");
    row.append(makeAppItem("b", "", item[0] + " — " + item[1]));
    row.append(makeAppItem("small", "", item[2] + " · " + item[3]));
    list.appendChild(row);
  });
}
$("inventory-search").addEventListener("input", () => renderInventory($("inventory-search").value.trim().toLocaleLowerCase("fr")));
renderInventory();

/* Messagerie locale de démonstration. */
function renderMail() {
  const list = $("mail-list"); if (!list) return;
  list.replaceChildren();
  readAppData(APP_KEYS.mail, []).slice().reverse().forEach(message => {
    const card = makeAppItem("article", "app-list-item", "");
    card.append(makeAppItem("b", "", message.subject));
    card.append(makeAppItem("small", "", "À : " + message.to + " · " + message.date));
    card.append(makeAppItem("p", "", message.body));
    list.appendChild(card);
  });
}
$("mail-send").addEventListener("click", () => {
  const to = clean($("mail-to").value), subject = clean($("mail-subject").value), body = clean($("mail-body").value);
  if (!to || !subject || !body) { $("mail-list").textContent = "Complétez le destinataire, l'objet et le message."; return; }
  const messages = readAppData(APP_KEYS.mail, []);
  messages.push({to,subject,body,date:new Date().toLocaleString("fr-FR")});
  if (!writeAppData(APP_KEYS.mail, messages)) { $("mail-list").textContent = "Stockage indisponible."; return; }
  $("mail-to").value = ""; $("mail-subject").value = ""; $("mail-body").value = ""; renderMail();
});
renderMail();

/* Paramètres de confort et réinitialisation ciblée. */
const comfortButton = $("comfort-toggle");
function setComfort(enabled) {
  document.body.classList.toggle("comfort-mode", enabled);
  comfortButton.textContent = enabled ? "DÉSACTIVER" : "ACTIVER";
  writeAppData(APP_KEYS.comfort, enabled);
}
setComfort(readAppData(APP_KEYS.comfort, false) === true);
comfortButton.addEventListener("click", () => setComfort(!document.body.classList.contains("comfort-mode")));
$("apps-reset").addEventListener("click", () => {
  if (!window.confirm("Effacer les notes, tâches, rapports, échéances et messages enregistrés sur cet appareil ?")) return;
  [APP_KEYS.notes,APP_KEYS.tasks,APP_KEYS.reports,APP_KEYS.events,APP_KEYS.mail].forEach(key => localStorage.removeItem(key));
  notesInput.value = ""; $("notes-status").textContent = "Notes effacées.";
  renderTasks(); renderReports(); renderEvents(); renderMail();
  $("settings-status").textContent = "Les données des applications ont été réinitialisées. Les comptes sont conservés.";
});
