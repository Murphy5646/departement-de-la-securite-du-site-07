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
  archives: "Archives & directives",
  notes: "Bloc-notes", calculator: "Calculatrice", calendar: "Calendrier",
  tasks: "Gestionnaire de tâches", reports: "Rapports RP", inventory: "Inventaire",
  mail: "Messagerie interne", settings: "Paramètres",
  converter: "Convertisseur", stopwatch: "Chronomètre", timer: "Minuteur", datecalc: "Calcul de dates", contacts: "Contacts", shifts: "Planning des équipes", maintenance: "Maintenance", checklists: "Check-lists", training: "Formation", glossary: "Glossaire SCP", map: "Plan du Site-07", requests: "Demandes internes", meetings: "Réunions", journal: "Journal de service", templates: "Modèles de documents", wordcount: "Compteur de texte", bulletin: "Panneau d’annonces", favorites: "Favoris", focus: "Mode concentration", stats: "Statistiques"
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
    task.addEventListener("contextmenu", event => {
      event.preventDefault();
      showContextMenu(event.clientX,event.clientY,[
        {label:"Afficher",action:()=>openWindow(key)},
        {label:"Fermer",action:()=>closeWindow(key)}
      ]);
    });
    task.addEventListener("click", () => {
      if (win.classList.contains("open") && task.classList.contains("active")) {
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
/* Ouverture des applications : clic simple = sélection, double-clic = ouverture sur le bureau. */
document.querySelectorAll("[data-open]").forEach(button => {
  if (button.classList.contains("desktop-icon")) {
    button.addEventListener("click", event => {
      document.querySelectorAll(".desktop-icon.selected").forEach(icon => icon.classList.remove("selected"));
      button.classList.add("selected");
      
    });
    button.addEventListener("dblclick", () => openWindow(button.dataset.open));
  } else {
    button.addEventListener("click", () => openWindow(button.dataset.open));
  }
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
    if (!drag || event.pointerId !== drag.pointerId) return;
    const key=bar.dataset.drag, win=$("window-"+key), parent=win?.parentElement.getBoundingClientRect();
    if(parent && event.clientY-parent.top<18) toggleMaximize(key);
    else if(parent && event.clientX-parent.left<12) snapWindow(key,"left");
    else if(parent && parent.right-event.clientX<12) snapWindow(key,"right");
    drag = null;
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
  [...Object.values(APP_KEYS),...Object.values(EXTRA_KEYS)].forEach(key => localStorage.removeItem(key));
  notesInput.value = ""; $("notes-status").textContent = "Notes effacées.";
  renderTasks(); renderReports(); renderEvents(); renderMail();
  $("settings-status").textContent = "Les données des applications ont été réinitialisées. Les comptes sont conservés.";
});


/* Vingt applications additionnelles SEC-OS. Stockage local à ce navigateur. */
const EXTRA_KEYS = {
 contacts:"site07_contacts_v1", shifts:"site07_shifts_v1", maintenance:"site07_maintenance_v1",
 requests:"site07_requests_v1", meetings:"site07_meetings_v1", journal:"site07_journal_v1",
 bulletin:"site07_bulletin_v1", favorites:"site07_favorites_v1", checklist:"site07_checklist_v1"
};
function extraData(name){return readAppData(EXTRA_KEYS[name],[]);}
function extraSave(name,data){return writeAppData(EXTRA_KEYS[name],data);}
function extraList(id,items,format,onRemove){
 const root=$(id); if(!root)return; root.replaceChildren();
 if(!items.length){root.appendChild(makeAppItem("p","muted","Aucun élément enregistré."));return;}
 items.forEach((item,index)=>{
  const row=makeAppItem("article","app-list-item","");
  const main=makeAppItem("span","",format(item));
  row.appendChild(main);
  if(onRemove){const btn=makeAppItem("button","secondary","Supprimer");btn.type="button";btn.addEventListener("click",()=>onRemove(index));row.appendChild(btn);}
  root.appendChild(row);
 });
}
function extraAdd(name,item,render){
 const data=extraData(name);data.push(item);
 if(!extraSave(name,data)){alert("Stockage local indisponible ou saturé.");return;}
 render();
}

/* Convertisseur d'unités : longueurs, masses et températures. */
$("cv-run").addEventListener("click",()=>{
 const value=Number($("cv-value").value),from=$("cv-from").value,to=$("cv-to").value;
 const groups={m:["m",1],km:["m",1000],cm:["m",.01],kg:["kg",1],g:["kg",.001]};
 let result;
 if(!Number.isFinite(value))result="Valeur invalide";
 else if(from===to)result=value;
 else if(from==="c"&&to==="f")result=value*9/5+32;
 else if(from==="f"&&to==="c")result=(value-32)*5/9;
 else if(groups[from]&&groups[to]&&groups[from][0]===groups[to][0])result=value*groups[from][1]/groups[to][1];
 else result="Unités incompatibles";
 $("cv-result").textContent="Résultat : "+(typeof result==="number"?Number(result.toFixed(6))+" "+to:result);
});

/* Chronomètre. */
let swElapsed=0,swStarted=0,swInterval=null;
function swRender(){
 const total=swElapsed+(swInterval?Date.now()-swStarted:0);
 const sec=Math.floor(total/1000),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;
 $("sw-display").textContent=[h,m,s].map(v=>String(v).padStart(2,"0")).join(":");
}
$("sw-start").addEventListener("click",()=>{if(swInterval)return;swStarted=Date.now();swInterval=window.setInterval(swRender,250);});
$("sw-pause").addEventListener("click",()=>{if(swInterval){swElapsed+=Date.now()-swStarted;clearInterval(swInterval);swInterval=null;swRender();}});
$("sw-reset").addEventListener("click",()=>{if(swInterval)clearInterval(swInterval);swInterval=null;swElapsed=0;swRender();});

/* Minuteur et concentration. */
let tmInterval=null,tmRemaining=300;
function tmRender(){ $("tm-display").textContent=String(Math.floor(tmRemaining/60)).padStart(2,"0")+":"+String(tmRemaining%60).padStart(2,"0");}
$("tm-start").addEventListener("click",()=>{
 if(tmInterval)return;
 const chosen=Number($("tm-min").value);
 if(!Number.isInteger(chosen)||chosen<1||chosen>180){$("tm-status").textContent="Choisissez entre 1 et 180 minutes.";return;}
 tmRemaining=chosen*60;tmRender();$("tm-status").textContent="Compte à rebours en cours.";
 tmInterval=window.setInterval(()=>{tmRemaining--;tmRender();if(tmRemaining<=0){clearInterval(tmInterval);tmInterval=null;$("tm-status").textContent="Temps écoulé.";alert("Minuteur terminé.");}},1000);
});
$("tm-stop").addEventListener("click",()=>{if(tmInterval)clearInterval(tmInterval);tmInterval=null;$("tm-status").textContent="Minuteur arrêté.";});
$("tm-min").addEventListener("change",()=>{if(!tmInterval){const n=Math.max(1,Math.min(180,Number($("tm-min").value)||5));tmRemaining=n*60;tmRender();}});
let focusRemaining=1500,focusInterval=null;
function focusRender(){$("fc-display").textContent=String(Math.floor(focusRemaining/60)).padStart(2,"0")+":"+String(focusRemaining%60).padStart(2,"0");}
$("fc-start").addEventListener("click",()=>{if(focusInterval)return;focusInterval=window.setInterval(()=>{focusRemaining--;focusRender();if(focusRemaining<=0){clearInterval(focusInterval);focusInterval=null;$("fc-status").textContent="Session terminée. Faites une pause.";alert("Session de concentration terminée.");}},1000);$("fc-status").textContent="Session en cours.";});
$("fc-pause").addEventListener("click",()=>{if(focusInterval)clearInterval(focusInterval);focusInterval=null;$("fc-status").textContent="Session en pause.";});
$("fc-reset").addEventListener("click",()=>{if(focusInterval)clearInterval(focusInterval);focusInterval=null;focusRemaining=1500;focusRender();$("fc-status").textContent="Prêt pour une nouvelle session.";});

/* Calcul d'intervalle entre deux dates. */
$("dc-run").addEventListener("click",()=>{
 const a=$("dc-a").value,b=$("dc-b").value;
 if(!a||!b){$("dc-result").textContent="Sélectionnez les deux dates.";return;}
 const days=Math.round(Math.abs(Date.parse(b+"T12:00:00")-Date.parse(a+"T12:00:00"))/86400000);
 $("dc-result").textContent=days+" jour(s) d'écart.";
});

/* Carnet de contacts local. */
function renderContacts(){extraList("co-list",extraData("contacts"),x=>x.name+" — "+x.role+" · "+x.info,i=>{const d=extraData("contacts");d.splice(i,1);extraSave("contacts",d);renderContacts();});}
$("co-add").addEventListener("click",()=>{
 const name=clean($("co-name").value),role=clean($("co-role").value),info=clean($("co-info").value);
 if(!name||!role){$("co-list").textContent="Indiquez au moins un nom et un service.";return;}
 extraAdd("contacts",{name,role,info},renderContacts);$("co-name").value="";$("co-role").value="";$("co-info").value="";
});renderContacts();

/* Planning d'équipe fictif. */
function renderShifts(){extraList("sh-list",extraData("shifts"),x=>x.date+" · "+x.slot+" · "+x.name,i=>{const d=extraData("shifts");d.splice(i,1);extraSave("shifts",d);renderShifts();});}
$("sh-add").addEventListener("click",()=>{
 const name=clean($("sh-name").value),date=$("sh-date").value;
 if(!name||!date){$("sh-list").textContent="Indiquez une équipe et une date.";return;}
 extraAdd("shifts",{name,date,slot:$("sh-slot").value},renderShifts);$("sh-name").value="";
});renderShifts();

/* Tickets de maintenance de démonstration. */
function renderMaintenance(){extraList("ma-list",extraData("maintenance"),x=>x.title+" · "+x.priority+" — "+x.detail,i=>{const d=extraData("maintenance");d.splice(i,1);extraSave("maintenance",d);renderMaintenance();});}
$("ma-add").addEventListener("click",()=>{
 const title=clean($("ma-title").value),detail=clean($("ma-detail").value);
 if(!title){$("ma-list").textContent="Indiquez l'objet de la demande.";return;}
 extraAdd("maintenance",{title,detail,priority:$("ma-priority").value},renderMaintenance);$("ma-title").value="";$("ma-detail").value="";
});renderMaintenance();

/* Check-list interactive et persistante. */
const checklistItems=["Vérifier les informations du dossier RP","Consulter les annonces du service","Mettre à jour le journal de service","Préparer les documents nécessaires","Transmettre les notes à l'équipe"];
function renderChecklist(){
 const root=$("cl-list"),done=readAppData(EXTRA_KEYS.checklist,[]);root.replaceChildren();
 checklistItems.forEach((label,index)=>{
  const line=makeAppItem("label","app-list-item","");
  const box=document.createElement("input");box.type="checkbox";box.checked=done.includes(index);
  box.addEventListener("change",()=>{let next=readAppData(EXTRA_KEYS.checklist,[]);next=box.checked?[...next,index]:next.filter(v=>v!==index);writeAppData(EXTRA_KEYS.checklist,next);renderChecklist();});
  line.append(box,makeAppItem("span","",label));root.appendChild(line);
 });
 $("cl-progress").textContent=done.length+" / "+checklistItems.length+" étapes terminées.";
}
$("cl-reset").addEventListener("click",()=>{writeAppData(EXTRA_KEYS.checklist,[]);renderChecklist();});renderChecklist();

/* Quiz pédagogique à choix multiples. */
const quiz=[
 {q:"Quel est le rôle principal d'un registre documentaire ?",o:["Décorer le bureau","Classer et retrouver les documents","Remplacer les communications"],a:1},
 {q:"Que doit contenir un compte rendu utile ?",o:["Une date et des faits clairs","Uniquement des suppositions","Des informations sans rapport"],a:0},
 {q:"Où conserver les notes personnelles dans SEC-OS ?",o:["Dans un message public","Dans le bloc-notes local","Nulle part"],a:1},
 {q:"À quoi sert une check-list ?",o:["Oublier des étapes","Suivre une suite de vérifications","Remplacer une formation"],a:1}
];
let quizIndex=0,quizScore=0,quizAnswered=0;
function renderQuiz(){
 const q=quiz[quizIndex];$("tr-question").textContent=q.q;$("tr-options").replaceChildren();
 q.o.forEach((label,index)=>{const btn=makeAppItem("button","secondary",label);btn.type="button";btn.addEventListener("click",()=>{
  if(btn.disabled)return;Array.from($("tr-options").children).forEach(b=>b.disabled=true);
  const good=index===q.a;if(good)quizScore++;quizAnswered++;
  $("tr-feedback").textContent=good?"Bonne réponse !":"Pas tout à fait. Réponse attendue : "+q.o[q.a];
  $("tr-score").textContent="Score : "+quizScore+" / "+quizAnswered;
 });$("tr-options").appendChild(btn);});
 $("tr-feedback").textContent="Choisissez une réponse.";
}
$("tr-next").addEventListener("click",()=>{quizIndex=(quizIndex+1)%quiz.length;renderQuiz();});renderQuiz();

/* Glossaire fictif et général. */
const glossary=[
 ["Anomalie","Élément fictif présentant des propriétés inhabituelles dans l'univers SCP."],
 ["Classement","Catégorie fictive décrivant les modalités de confinement d'un objet."],
 ["Confinement","Mesures fictives visant à maintenir une anomalie dans un cadre défini."],
 ["Dossier","Ensemble organisé de documents relatifs à un sujet."],
 ["Incident RP","Événement narratif consigné dans le cadre du jeu de rôle."],
 ["Site","Installation fictive de la Fondation dans l'univers SCP."],
 ["Unité Marshal","Service fictif de sécurité du Site-07 dans ce projet."]
];
function renderGlossary(query=""){
 const root=$("gl-list");root.replaceChildren();
 glossary.filter(x=>(x[0]+" "+x[1]).toLocaleLowerCase("fr").includes(query)).forEach(x=>{const card=makeAppItem("article","app-list-item","");card.append(makeAppItem("b","",x[0]),makeAppItem("p","",x[1]));root.appendChild(card);});
}
$("gl-search").addEventListener("input",()=>renderGlossary($("gl-search").value.toLocaleLowerCase("fr")));renderGlossary();

/* Plan schématique non opérationnel. */
document.querySelectorAll("[data-zone]").forEach(btn=>btn.addEventListener("click",()=>{$("mp-detail").textContent="Zone sélectionnée : "+btn.dataset.zone+". Description fictive du Site-07."; }));

/* Demandes internes. */
function renderRequests(){extraList("rq-list",extraData("requests"),x=>x.title+" · "+x.type+" — "+x.detail,i=>{const d=extraData("requests");d.splice(i,1);extraSave("requests",d);renderRequests();});}
$("rq-add").addEventListener("click",()=>{const title=clean($("rq-title").value),detail=clean($("rq-detail").value);if(!title){$("rq-list").textContent="Indiquez un objet.";return;}extraAdd("requests",{title,detail,type:$("rq-type").value},renderRequests);$("rq-title").value="";$("rq-detail").value="";});renderRequests();

/* Réunions. */
function renderMeetings(){extraList("mt-list",extraData("meetings"),x=>x.date+" · "+x.title+" — "+x.notes,i=>{const d=extraData("meetings");d.splice(i,1);extraSave("meetings",d);renderMeetings();});}
$("mt-add").addEventListener("click",()=>{const title=clean($("mt-title").value);if(!title){$("mt-list").textContent="Indiquez un sujet.";return;}extraAdd("meetings",{title,date:$("mt-date").value||"Date à définir",notes:clean($("mt-notes").value)},renderMeetings);$("mt-title").value="";$("mt-notes").value="";});renderMeetings();

/* Journal de service. */
function renderJournal(){extraList("jn-list",extraData("journal"),x=>x.date+" — "+x.text,i=>{const d=extraData("journal");d.splice(i,1);extraSave("journal",d);renderJournal();});}
$("jn-add").addEventListener("click",()=>{const textValue=clean($("jn-text").value);if(!textValue)return;extraAdd("journal",{date:new Date().toLocaleString("fr-FR"),text:textValue},renderJournal);$("jn-text").value="";});renderJournal();

/* Modèles de documents et copie. */
$("tp-generate").addEventListener("click",()=>{
 const kind=$("tp-kind").value,subject=clean($("tp-subject").value)||"À compléter";
 $("tp-output").value=kind+"\nSITE-07 — DOCUMENT DE JEU DE RÔLE\nObjet : "+subject+"\nDate : "+new Date().toLocaleDateString("fr-FR")+"\n\nContexte :\n[À compléter]\n\nFaits / éléments :\n[À compléter]\n\nActions / décisions :\n[À compléter]\n\nRédigé par : [Pseudonyme]\nValidation : [À compléter]";
});
$("tp-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("tp-output").value);$("tp-status").textContent="Texte copié."; }catch{$("tp-output").select();$("tp-status").textContent="Sélectionnez le texte pour le copier.";}});

/* Compteur de texte. */
$("wc-text").addEventListener("input",()=>{
 const value=$("wc-text").value;
 $("wc-words").textContent=(value.trim().match(/\S+/g)||[]).length;
 $("wc-chars").textContent=value.length;
 $("wc-lines").textContent=value?value.split(/\r\n|\r|\n/).length:0;
});

/* Panneau d'annonces local. */
function renderBulletin(){extraList("bu-list",extraData("bulletin"),x=>x.date+" · "+x.title+" — "+x.body,i=>{const d=extraData("bulletin");d.splice(i,1);extraSave("bulletin",d);renderBulletin();});}
$("bu-add").addEventListener("click",()=>{const title=clean($("bu-title").value),body=clean($("bu-body").value);if(!title||!body){$("bu-list").textContent="Ajoutez un titre et un texte.";return;}extraAdd("bulletin",{title,body,date:new Date().toLocaleString("fr-FR")},renderBulletin);$("bu-title").value="";$("bu-body").value="";});renderBulletin();

/* Favoris textuels. */
function renderFavorites(){extraList("fv-list",extraData("favorites"),x=>x.name+" — "+x.note,i=>{const d=extraData("favorites");d.splice(i,1);extraSave("favorites",d);renderFavorites();});}
$("fv-add").addEventListener("click",()=>{const name=clean($("fv-name").value);if(!name)return;extraAdd("favorites",{name,note:clean($("fv-note").value)},renderFavorites);$("fv-name").value="";$("fv-note").value="";});renderFavorites();

/* Statistiques locales agrégées. */
function renderExtraStats(){
 const root=$("st-list");root.replaceChildren();
 const counts=[
 ["Contacts",extraData("contacts").length],["Équipes planifiées",extraData("shifts").length],
 ["Tickets maintenance",extraData("maintenance").length],["Demandes",extraData("requests").length],
 ["Réunions",extraData("meetings").length],["Entrées du journal",extraData("journal").length],
 ["Annonces",extraData("bulletin").length],["Favoris",extraData("favorites").length],
 ["Tâches",readAppData(APP_KEYS.tasks,[]).length],["Rapports RP",readAppData(APP_KEYS.reports,[]).length]
 ];
 counts.forEach(([label,count])=>{const card=makeAppItem("div","notice","");card.append(makeAppItem("small","",label),makeAppItem("b","",String(count)));root.appendChild(card);});
}
$("st-refresh").addEventListener("click",renderExtraStats);renderExtraStats();


/* Fonctions de bureau : menu contextuel, sélection, renommage, tri et fenêtres maximisables. */
const desktopRoot=$("desktop");
const desktopIcons=$("desktop-icons")||document.querySelector(".desktop-icons");
const DESK_LABELS_KEY="site07_desktop_labels_v1";
function loadDesktopLabels(){try{return JSON.parse(localStorage.getItem(DESK_LABELS_KEY)||"{}")||{};}catch{return {};}}
function saveDesktopLabels(labels){try{localStorage.setItem(DESK_LABELS_KEY,JSON.stringify(labels));}catch{}}
function applyDesktopLabels(){
 const labels=loadDesktopLabels();
 document.querySelectorAll(".desktop-icon[data-open]").forEach(icon=>{
  const key=icon.dataset.open,base=titles[key]||key;
  const label=icon.querySelector("b");
  if(label)label.textContent=labels[key]||base;
  icon.title=labels[key]||base;
 });
}
applyDesktopLabels();

/* Menu contextuel personnalisé, compatible souris et écran tactile. */
let activeContextMenu=null;
function closeContextMenu(){
 if(activeContextMenu){activeContextMenu.remove();activeContextMenu=null;}
}
function showContextMenu(x,y,items){
 closeContextMenu();
 const menu=document.createElement("div");
 menu.className="desktop-context-menu";
 menu.setAttribute("role","menu");
 items.forEach(item=>{
  if(item.separator){const sep=document.createElement("div");sep.className="context-separator";menu.appendChild(sep);return;}
  const button=document.createElement("button");
  button.type="button";button.textContent=item.label;button.setAttribute("role","menuitem");
  if(item.disabled)button.disabled=true;
  button.addEventListener("click",()=>{closeContextMenu();item.action&&item.action();});
  menu.appendChild(button);
 });
 desktopRoot.appendChild(menu);
 const rect=desktopRoot.getBoundingClientRect();
 menu.style.left=Math.max(4,Math.min(x-rect.left,rect.width-menu.offsetWidth-4))+"px";
 menu.style.top=Math.max(4,Math.min(y-rect.top,rect.height-menu.offsetHeight-60))+"px";
 activeContextMenu=menu;
}
document.addEventListener("pointerdown",event=>{
 if(activeContextMenu&&!event.target.closest(".desktop-context-menu"))closeContextMenu();
});
document.addEventListener("keydown",event=>{
 if(event.key==="Escape")closeContextMenu();
 if(event.altKey&&event.key==="F4"){
  const focused=document.querySelector(".app-window.open[style*='z-index']");
  if(focused){event.preventDefault();closeWindow(focused.dataset.window);}
 }
});
if(desktopRoot){
 desktopRoot.addEventListener("contextmenu",event=>{
  const icon=event.target.closest(".desktop-icon");
  const win=event.target.closest(".app-window");
  const task=event.target.closest(".task-app");
  if(!icon&&!win&&!task&&!event.target.closest(".taskbar")&&!event.target.closest(".start-menu")){
   event.preventDefault();
   showContextMenu(event.clientX,event.clientY,[
    {label:"Actualiser le bureau",action:()=>{document.querySelectorAll(".desktop-icon.selected").forEach(i=>i.classList.remove("selected"));applyDesktopLabels();}},
    {label:"Trier les icônes par nom",action:()=>{if(desktopIcons){[...desktopIcons.children].sort((a,b)=>(a.querySelector("b")?.textContent||"").localeCompare(b.querySelector("b")?.textContent||"","fr")).forEach(el=>desktopIcons.appendChild(el));}}},
    {label:"Afficher / masquer les icônes",action:()=>desktopIcons&&desktopIcons.classList.toggle("icons-hidden")},
    {separator:true},
    {label:"Ouvrir le menu Démarrer",action:()=>$("start-button").click()},
    {label:"Paramètres",action:()=>openWindow("settings")}
   ]);
  }
 });
}
document.querySelectorAll(".desktop-icon").forEach(icon=>{
 icon.addEventListener("contextmenu",event=>{
  event.preventDefault();event.stopPropagation();
  document.querySelectorAll(".desktop-icon.selected").forEach(i=>i.classList.remove("selected"));
  icon.classList.add("selected");
  const key=icon.dataset.open;
  showContextMenu(event.clientX,event.clientY,[
   {label:"Ouvrir",action:()=>openWindow(key)},
   {label:"Renommer",action:()=>{
    const label=icon.querySelector("b"),current=label?label.textContent:(titles[key]||key);
    const next=window.prompt("Nouveau nom du raccourci :",current);
    if(next&&next.trim()){const labels=loadDesktopLabels();labels[key]=next.trim().slice(0,32);saveDesktopLabels(labels);applyDesktopLabels();}
   }},
   {label:"Propriétés",action:()=>{openWindow(key);focusWindow(key);}},
   {separator:true},
   {label:"Annuler",action:()=>{}}
  ]);
 });
});
document.querySelectorAll(".app-window").forEach(win=>{
 win.addEventListener("pointerdown",()=>focusWindow(win.dataset.window));
});
/* Ajoute le bouton Agrandir/Rétablir à toutes les fenêtres. */
document.querySelectorAll(".window-titlebar").forEach(bar=>{
 const key=bar.dataset.drag,controls=bar.querySelector(".window-controls");
 if(!controls||controls.querySelector('[data-maximize="'+key+'"]'))return;
 const button=document.createElement("button");
 button.type="button";button.dataset.maximize=key;button.title="Agrandir / restaurer";button.textContent="□";
 controls.insertBefore(button,controls.firstChild);
 bar.addEventListener("dblclick",event=>{
  if(event.target.closest("button"))return;
  toggleMaximize(key);
 });
});
function toggleMaximize(key){
 const win=$("window-"+key);if(!win)return;
 if(!win.classList.contains("maximized")){
  const r=win.getBoundingClientRect(),p=win.parentElement.getBoundingClientRect();
  win.dataset.restoreRect=JSON.stringify({left:r.left-p.left,top:r.top-p.top,width:r.width,height:r.height});
  win.classList.add("maximized");win.classList.remove("snapped-left","snapped-right");
  win.style.left="8px";win.style.top="8px";win.style.width="calc(100% - 16px)";win.style.height="calc(100% - 16px)";win.style.transform="none";
 }else restoreWindow(key);
 focusWindow(key);
}
function restoreWindow(key){
 const win=$("window-"+key);if(!win)return;
 win.classList.remove("maximized","snapped-left","snapped-right");
 let rect={};try{rect=JSON.parse(win.dataset.restoreRect||"{}");}catch{}
 win.style.left=Number.isFinite(rect.left)?rect.left+"px":"";
 win.style.top=Number.isFinite(rect.top)?rect.top+"px":"";
 win.style.width=Number.isFinite(rect.width)?rect.width+"px":"";
 win.style.height=Number.isFinite(rect.height)?rect.height+"px":"";
 win.style.transform="none";
}
function snapWindow(key,side){
 const win=$("window-"+key);if(!win)return;
 if(!win.dataset.restoreRect){
  const r=win.getBoundingClientRect(),p=win.parentElement.getBoundingClientRect();
  win.dataset.restoreRect=JSON.stringify({left:r.left-p.left,top:r.top-p.top,width:r.width,height:r.height});
 }
 win.classList.remove("maximized","snapped-left","snapped-right");
 win.classList.add(side==="left"?"snapped-left":"snapped-right");
 win.style.transform="none";win.style.top="8px";win.style.height="calc(100% - 16px)";
 win.style.width="calc(50% - 12px)";win.style.left=side==="left"?"8px":"calc(50% + 4px)";
 focusWindow(key);
}
document.querySelectorAll("[data-maximize]").forEach(button=>button.addEventListener("click",()=>toggleMaximize(button.dataset.maximize)));
/* Menu contextuel de fenêtre et de bouton de barre des tâches. */
document.querySelectorAll(".window-titlebar").forEach(bar=>bar.addEventListener("contextmenu",event=>{
 event.preventDefault();const key=bar.dataset.drag;
 showContextMenu(event.clientX,event.clientY,[
  {label:"Restaurer / agrandir",action:()=>toggleMaximize(key)},
  {label:"Réduire",action:()=>{$("window-"+key).classList.remove("open");const t=$("task-"+key);if(t)t.classList.remove("active");}},
  {label:"Fermer",action:()=>closeWindow(key)}
 ]);
}));
document.querySelectorAll(".task-app").forEach(button=>button.addEventListener("contextmenu",event=>{
 event.preventDefault();const key=button.dataset.task;
 showContextMenu(event.clientX,event.clientY,[
  {label:"Afficher",action:()=>openWindow(key)},
  {label:"Fermer",action:()=>closeWindow(key)}
 ]);
}));
/* Raccourcis clavier de confort. */
document.addEventListener("keydown",event=>{
 if(event.key==="F5"&&document.activeElement===document.body){event.preventDefault();applyDesktopLabels();}
 if(event.altKey&&event.key==="ArrowDown"){const win=document.querySelector(".app-window.open");if(win){event.preventDefault();win.classList.remove("open");}}
});
