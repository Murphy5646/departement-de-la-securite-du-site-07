const $=id=>document.getElementById(id);
const USERS_KEY="site07_users_v1",SESSION_KEY="site07_session_v1";
const services=["Direction de la sécurité","Commandement Marshal","Opérations Marshal","Administration Marshal","Formation Marshal","Personnel du Site-07"];
const titles={home:"Poste de travail",protocols:"Protocoles Marshal",directory:"Annuaire des services",archives:"Archives & directives"};
const readUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}catch{return[]}};
const saveUsers=u=>localStorage.setItem(USERS_KEY,JSON.stringify(u));
const clean=s=>s.trim().replace(/[<>]/g,"");
async function hashPassword(password,salt){const data=new TextEncoder().encode(salt+password);const digest=await crypto.subtle.digest("SHA-256",data);return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("")}
function switchAuth(mode){const registering=mode==="register";$("login-form").classList.toggle("hidden",registering);$("register-form").classList.toggle("hidden",!registering);$("tab-login").classList.toggle("active",!registering);$("tab-register").classList.toggle("active",registering);$("loginmsg").textContent=registering?"Créez votre profil personnel pour le terminal.":"Saisissez les identifiants de votre compte."}
$("tab-login").addEventListener("click",()=>switchAuth("login"));$("tab-register").addEventListener("click",()=>switchAuth("register"));
function showLogin(){localStorage.removeItem(SESSION_KEY);$("desktop").classList.add("hidden");$("login").classList.remove("hidden");$("login-pass").value="";$("login-user").focus();switchAuth("login")}
function showDesktop(user){$("login").classList.add("hidden");$("desktop").classList.remove("hidden");$("displayname").textContent=user.name;$("displayrole").textContent=user.service;$("avatar").textContent=(user.name[0]||"S").toUpperCase();$("welcome").textContent="Bienvenue, "+user.name+".";$("statrole").textContent=user.service;openWindow("home")}
async function login(){const username=clean($("login-user").value).toLowerCase(),password=$("login-pass").value;const user=readUsers().find(u=>u.username===username);if(!user||await hashPassword(password,user.salt)!==user.passwordHash){$("loginmsg").textContent="Identifiant ou mot de passe incorrect.";return}localStorage.setItem(SESSION_KEY,user.username);showDesktop(user)}
async function register(){const name=clean($("new-name").value),username=clean($("new-user").value).toLowerCase(),service=$("new-service").value,password=$("new-pass").value,confirm=$("new-pass-confirm").value;if(name.length<2||!/^[a-z0-9._-]{3,24}$/.test(username)){$("loginmsg").textContent="Vérifiez le nom et l'identifiant (3 à 24 caractères : lettres, chiffres, . _ -).";return}if(password.length<8){$("loginmsg").textContent="Le mot de passe doit contenir au moins 8 caractères.";return}if(password!==confirm){$("loginmsg").textContent="Les deux mots de passe ne correspondent pas.";return}const users=readUsers();if(users.some(u=>u.username===username)){$("loginmsg").textContent="Cet identifiant est déjà utilisé sur ce navigateur.";return}const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,"0")).join("");users.push({name,username,service,salt,passwordHash:await hashPassword(password,salt)});saveUsers(users);localStorage.setItem(SESSION_KEY,username);showDesktop(users[users.length-1])}
$("loginbtn").addEventListener("click",login);$("registerbtn").addEventListener("click",register);$("login-pass").addEventListener("keydown",e=>{if(e.key==="Enter")login()});$("new-pass-confirm").addEventListener("keydown",e=>{if(e.key==="Enter")register()});$("logout").addEventListener("click",showLogin);
const directory=$("directory");services.forEach(s=>{const a=document.createElement("article"),b=document.createElement("b"),small=document.createElement("small");b.textContent=s;small.textContent="Service du Département de la sécurité";a.append(b,small);directory.appendChild(a)});
let z=10;
function focusWindow(key){document.querySelectorAll(".app-window").forEach(w=>w.style.zIndex=String(++z));const win=$("window-"+key);win.style.zIndex=String(++z);document.querySelectorAll(".task-app").forEach(b=>b.classList.toggle("active",b.dataset.task===key))}
function openWindow(key){const win=$("window-"+key);if(!win)return;win.classList.add("open");focusWindow(key);$("start-menu").classList.add("hidden");$("start-button").classList.remove("active");if(!$("task-"+key)){const b=document.createElement("button");b.id="task-"+key;b.className="task-app active";b.dataset.task=key;b.textContent=titles[key];b.addEventListener("click",()=>{if(win.classList.contains("open")){win.classList.remove("open");b.classList.remove("active")}else{win.classList.add("open");focusWindow(key)}});$("task-apps").appendChild(b)}}
function closeWindow(key){$("window-"+key).classList.remove("open");const b=$("task-"+key);if(b)b.remove()}
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openWindow(b.dataset.open)));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeWindow(b.dataset.close)));
document.querySelectorAll("[data-min]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.min;$("window-"+k).classList.remove("open");const t=$("task-"+k);if(t)t.classList.remove("active")}));
$("start-button").addEventListener("click",()=>{$("start-menu").classList.toggle("hidden");$("start-button").classList.toggle("active",!$("start-menu").classList.contains("hidden"))});
document.addEventListener("click",e=>{if(!e.target.closest("#start-menu")&&!e.target.closest("#start-button")){$("start-menu").classList.add("hidden");$("start-button").classList.remove("active")}});
document.querySelectorAll(".window-titlebar").forEach(bar=>{let drag=null;bar.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;const win=$("window-"+bar.dataset.drag);if(win.classList.contains("maximized"))return;focusWindow(bar.dataset.drag);const r=win.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};bar.setPointerCapture(e.pointerId)});bar.addEventListener("pointermove",e=>{if(!drag)return;const win=$("window-"+bar.dataset.drag);win.style.transform="none";win.style.left=Math.max(0,Math.min(innerWidth-win.offsetWidth,e.clientX-drag.x))+"px";win.style.top=Math.max(54,Math.min(innerHeight-100,e.clientY-drag.y))+"px"});bar.addEventListener("pointerup",()=>drag=null);bar.addEventListener("pointercancel",()=>drag=null)});
function tick(){const time=new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});$("clock").textContent=time;$("topclock").textContent=time;$("taskclock").textContent=time}tick();setInterval(tick,1000);
window.addEventListener("load",()=>setTimeout(()=>{$("boot").classList.add("hidden");const username=localStorage.getItem(SESSION_KEY),user=readUsers().find(u=>u.username===username);if(user)showDesktop(user);else{$("login").classList.remove("hidden");switchAuth("login")}},800));

const marshalSearch=$("marshal-search");
if(marshalSearch){
 marshalSearch.addEventListener("input",()=>{
  const q=marshalSearch.value.trim().toLocaleLowerCase("fr");
  let visible=0;
  document.querySelectorAll(".marshal-chapter").forEach(chapter=>{
   let chapterVisible=0;
   chapter.querySelectorAll(".marshal-article").forEach(article=>{
    const match=!q||article.textContent.toLocaleLowerCase("fr").includes(q);
    article.hidden=!match;
    if(match){visible++;chapterVisible++;}
   });
   chapter.hidden=chapterVisible===0;
  });
  $("marshal-count").textContent=q?visible+" ARTICLE(S) TROUVÉ(S)":"50 ARTICLES · 5 CHAPITRES";
 });
}
