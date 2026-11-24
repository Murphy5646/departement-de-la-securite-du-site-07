const staff=[
{id:"DIRECTEUR-SECURITE",code:"SEC-07-DIR-9264",name:"Direction de la sécurité",role:"Directeur de la sécurité",short:"DIRECTION",initial:"D"},
{id:"MAR-CMD-07",code:"MAR-07-CMD-4821",name:"Commandement Marshal",role:"Commandement Marshal",short:"MARSHAL · CMD",initial:"C"},
{id:"MAR-OPS-07",code:"MAR-07-OPS-5738",name:"Opérations Marshal",role:"Opérations Marshal",short:"MARSHAL · OPS",initial:"O"},
{id:"MAR-ADM-07",code:"MAR-07-ADM-1649",name:"Administration Marshal",role:"Administration Marshal",short:"MARSHAL · ADM",initial:"A"},
{id:"MAR-FRM-07",code:"MAR-07-FRM-8352",name:"Formation Marshal",role:"Formation Marshal",short:"MARSHAL · FRM",initial:"F"}
];
const $=id=>document.getElementById(id);
const accounts=$("accounts");
staff.forEach(s=>{const el=document.createElement("div");el.className="account";el.textContent=s.id+"  /  "+s.code;accounts.appendChild(el)});
function showLogin(){ $("desktop").classList.add("hidden");$("login").classList.remove("hidden");$("username").value="";$("accesscode").value="";$("loginmsg").textContent="Environnement de démonstration — aucune donnée réelle requise."; }
function enter(){const id=$("username").value.trim().toUpperCase(),code=$("accesscode").value.trim();const user=staff.find(s=>s.id===id&&s.code===code);if(!user){$("loginmsg").textContent="Accès refusé : identifiant ou code non reconnu.";return} $("login").classList.add("hidden");$("desktop").classList.remove("hidden");$("displayname").textContent=user.name;$("displayrole").textContent=user.role;$("avatar").textContent=user.initial;$("welcome").textContent="Bienvenue, "+user.role+".";$("statrole").textContent=user.short;openPage("home");}
$("loginbtn").addEventListener("click",enter);$("accesscode").addEventListener("keydown",e=>{if(e.key==="Enter")enter()});$("username").addEventListener("keydown",e=>{if(e.key==="Enter")$("accesscode").focus()});$("logout").addEventListener("click",showLogin);
function openPage(name){document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));$("page-"+name).classList.remove("hidden");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===name))}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>openPage(b.dataset.page)));
const directory=$("directory");staff.forEach(s=>{const a=document.createElement("article"),b=document.createElement("b"),small=document.createElement("small");b.textContent=s.name;small.textContent=s.role;a.append(b,small);directory.appendChild(a)});
function tick(){const d=new Date();const time=d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});$("clock").textContent=time;$("topclock").textContent=time}
tick();setInterval(tick,1000);
window.addEventListener("load",()=>setTimeout(()=>{$("boot").classList.add("hidden");$("login").classList.remove("hidden")},2300));