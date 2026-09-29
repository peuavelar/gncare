/* Roteador por hash com proteção de rotas, esqueleto de carregamento e
   tratamento de erro único para todas as telas. */

import { auth } from "./api.js";
import { shell, toggleSide } from "./layout.js";
import { skeleton, errorState, toast, closeModal, showScreenLoader, hideScreenLoader } from "./ui.js";
import * as authPages from "./pages/auth.js";
import * as patientPages from "./pages/patient.js";
import * as proPages from "./pages/pro.js";
import * as telePages from "./pages/tele.js";

const routes = [
  { path: "#/login", page: authPages.login, layout: "bare", open: true },
  { path: "#/cadastro", page: authPages.register, layout: "bare", open: true },
  { path: "#/recuperar-senha", page: authPages.recover, layout: "bare", open: true },
  { path: "#/p/:slug", page: authPages.publicProfile, layout: "bare", open: true },
  { path: "#/onboarding", page: authPages.onboarding, layout: "bare", role: "paciente" },

  { path: "#/paciente", page: patientPages.home, role: "paciente", active: "inicio" },
  { path: "#/paciente/tratamento", page: patientPages.treatment, role: "paciente", active: "tratamento" },
  { path: "#/paciente/exercicios", page: patientPages.exercises, role: "paciente", active: "exercicios" },
  { path: "#/paciente/exercicios/:id", page: patientPages.exerciseDetail, role: "paciente", active: "exercicios" },
  { path: "#/paciente/consultas", page: patientPages.appointments, role: "paciente", active: "consultas" },
  { path: "#/paciente/consultas/agendar", page: patientPages.booking, role: "paciente", active: "consultas" },
  { path: "#/paciente/evolucao", page: patientPages.evolution, role: "paciente", active: "evolucao" },
  { path: "#/paciente/fisioterapeuta", page: patientPages.professional, role: "paciente", active: "fisioterapeuta" },
  { path: "#/paciente/documentos", page: patientPages.documents, role: "paciente", active: "documentos" },
  { path: "#/paciente/perfil", page: patientPages.profile, role: "paciente", active: "perfil" },
  { path: "#/paciente/teleatendimento/:id", page: telePages.room, role: "paciente", active: "consultas" },

  { path: "#/profissional", page: proPages.home, role: "fisioterapeuta", active: "inicio" },
  { path: "#/profissional/pacientes", page: proPages.patients, role: "fisioterapeuta", active: "pacientes" },
  { path: "#/profissional/pacientes/:id", page: proPages.patientRecord, role: "fisioterapeuta", active: "pacientes" },
  { path: "#/profissional/pacientes/:id/prontuario", page: proPages.patientRecord, role: "fisioterapeuta", active: "pacientes" },
  { path: "#/profissional/pacientes/:id/prontuario/:tab", page: proPages.patientRecord, role: "fisioterapeuta", active: "pacientes" },
  { path: "#/profissional/pacientes/:id/avaliacao", page: proPages.patientRecord, role: "fisioterapeuta", active: "pacientes", tab: "avaliacao" },
  { path: "#/profissional/pacientes/:id/tratamento", page: proPages.patientRecord, role: "fisioterapeuta", active: "pacientes", tab: "tratamento" },
  { path: "#/profissional/pacientes/:id/evolucao", page: proPages.patientRecord, role: "fisioterapeuta", active: "pacientes", tab: "evolucao" },
  { path: "#/profissional/agenda", page: proPages.agenda, role: "fisioterapeuta", active: "agenda" },
  { path: "#/profissional/teleatendimento", page: proPages.teleList, role: "fisioterapeuta", active: "teleatendimento" },
  { path: "#/profissional/teleatendimento/:id", page: telePages.room, role: "fisioterapeuta", active: "teleatendimento" },
  { path: "#/profissional/exercicios", page: proPages.exerciseLibrary, role: "fisioterapeuta", active: "exercicios" },
  { path: "#/profissional/evolucao", page: proPages.evolutions, role: "fisioterapeuta", active: "evolucao" },
  { path: "#/profissional/perfil", page: proPages.profile, role: "fisioterapeuta", active: "perfil" },
  { path: "#/profissional/perfil-publico", page: proPages.publicProfileEditor, role: "fisioterapeuta", active: "perfil-publico" }
];

let currentCtx = null;
let renderToken = 0;
let booted = false;

function finishLoad(token) {
  if (token !== renderToken) return;
  booted = true;
  hideScreenLoader();
}

export function navigate(hash, { replace = false } = {}) {
  closeModal();
  if ((window.location.hash || "#/") !== hash) showScreenLoader();
  if (replace) window.location.replace(hash);
  else window.location.hash = hash;
  if (window.location.hash === hash) run();
}

export function refresh() {
  run();
}

export function homeFor(session) {
  if (!session) return "#/login";
  if (session.role === "paciente") return session.onboarded ? "#/paciente" : "#/onboarding";
  return "#/profissional";
}

function parseHash() {
  const raw = window.location.hash || "#/";
  const [pathPart, queryPart] = raw.split("?");
  const query = Object.fromEntries(new URLSearchParams(queryPart || ""));
  return { path: pathPart.replace(/\/$/, "") || "#/", query };
}

function match(path) {
  for (const route of routes) {
    const a = route.path.split("/");
    const b = path.split("/");
    if (a.length !== b.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i].startsWith(":")) params[a[i].slice(1)] = decodeURIComponent(b[i]);
      else if (a[i] !== b[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { route, params };
  }
  return null;
}

async function run() {
  const token = ++renderToken;
  const { path, query } = parseHash();
  const root = document.getElementById("app");
  const session = auth.current();
  if (booted) showScreenLoader();

  if (path === "#/" || path === "#") {
    navigate(homeFor(session), { replace: true });
    return;
  }

  const found = match(path);
  if (!found) {
    root.innerHTML = `<div class="onboard"><div class="onboard-box">${errorState(
      "Essa página não existe no protótipo.",
      { action: "go-home", label: "Ir para o início" }
    )}</div></div>`;
    finishLoad(token);
    return;
  }

  const { route, params } = found;

  if (!route.open && !session) {
    navigate(`#/login?next=${encodeURIComponent(path)}`, { replace: true });
    return;
  }
  if (route.role && session && session.role !== route.role) {
    toast("Essa área é de outro perfil de acesso.", "warn");
    navigate(homeFor(session), { replace: true });
    return;
  }
  if (session && session.role === "paciente" && !session.onboarded && route.path !== "#/onboarding" && !route.open) {
    navigate("#/onboarding", { replace: true });
    return;
  }

  const ctx = {
    params: { ...params, ...(route.tab ? { tab: route.tab } : {}) },
    query,
    session,
    path,
    navigate,
    refresh
  };
  currentCtx = ctx;
  closeModal();

  if (route.layout === "bare") {
    root.innerHTML = `<div class="onboard"><div class="onboard-box">${skeleton("list")}</div></div>`;
    try {
      const view = await route.page(ctx);
      if (token !== renderToken) return;
      root.innerHTML = view.html;
      document.title = `${view.title} · GN Care`;
      if (view.mount) view.mount(root, ctx);
    } catch (err) {
      if (token !== renderToken) return;
      root.innerHTML = `<div class="onboard"><div class="onboard-box">${errorState(err.message)}</div></div>`;
    }
    window.scrollTo(0, 0);
    finishLoad(token);
    return;
  }

  root.innerHTML = shell({ session, active: route.active, content: skeleton(), unread: 0 });

  try {
    const page = await route.page(ctx);
    if (token !== renderToken) return;
    root.innerHTML = shell({
      session,
      active: route.active,
      content: page.html,
      unread: page.unread || 0
    });
    document.title = `${page.title} · GN Care`;
    if (page.mount) page.mount(document.getElementById("view"), ctx);
  } catch (err) {
    if (token !== renderToken) return;
    const current = document.getElementById("view");
    if (current) current.innerHTML = errorState(err.message);
    else root.innerHTML = shell({ session, active: route.active, content: errorState(err.message), unread: 0 });
  }
  window.scrollTo(0, 0);
  finishLoad(token);
}

/* Eventos globais: links de rota, menu, sair e notificações. */
document.addEventListener("click", (e) => {
  const routeEl = e.target.closest("[data-route]");
  if (routeEl) {
    e.preventDefault();
    showScreenLoader();
    navigate(routeEl.dataset.route);
    toggleSide(false);
    return;
  }

  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;

  if (action === "menu") {
    toggleSide();
  } else if (action === "sair") {
    auth.logout();
    toast("Sessão encerrada.");
    navigate("#/login");
  } else if (action === "go-home") {
    navigate(homeFor(auth.current()));
  } else if (action === "retry") {
    refresh();
  }
});

window.addEventListener("hashchange", run);
window.addEventListener("resize", () => toggleSide(false));

export function start() {
  try {
    if (sessionStorage.getItem("gncare.screenLoader")) {
      showScreenLoader();
      sessionStorage.removeItem("gncare.screenLoader");
    }
  } catch (_) {}
  run();
}

export function getContext() {
  return currentCtx;
}
