/* Casca da aplicação: navegação lateral no desktop, gaveta + barra inferior no mobile. */

import { esc, avatar, BRAND_SVG } from "./ui.js";

export const NAV = {
  paciente: [
    { group: "Meu cuidado" },
    { id: "inicio", label: "Início", icon: "🏠", route: "#/paciente", bottom: true },
    { id: "tratamento", label: "Meu tratamento", icon: "🎯", route: "#/paciente/tratamento" },
    { id: "exercicios", label: "Exercícios", icon: "🏃", route: "#/paciente/exercicios", bottom: true },
    { id: "consultas", label: "Consultas", icon: "📅", route: "#/paciente/consultas", bottom: true },
    { id: "evolucao", label: "Minha evolução", icon: "📈", route: "#/paciente/evolucao", bottom: true },
    { group: "Apoio" },
    { id: "fisioterapeuta", label: "Meu fisioterapeuta", icon: "🩺", route: "#/paciente/fisioterapeuta" },
    { id: "documentos", label: "Documentos", icon: "📄", route: "#/paciente/documentos" },
    { id: "perfil", label: "Meu perfil", icon: "👤", route: "#/paciente/perfil", bottom: true }
  ],
  fisioterapeuta: [
    { group: "Consultório" },
    { id: "inicio", label: "Visão geral", icon: "🏠", route: "#/profissional", bottom: true },
    { id: "pacientes", label: "Pacientes", icon: "👥", route: "#/profissional/pacientes", bottom: true },
    { id: "agenda", label: "Agenda", icon: "📅", route: "#/profissional/agenda", bottom: true },
    { id: "teleatendimento", label: "Teleatendimento", icon: "🎥", route: "#/profissional/teleatendimento", bottom: true },
    { group: "Programa" },
    { id: "exercicios", label: "Biblioteca de exercícios", icon: "🏃", route: "#/profissional/exercicios" },
    { id: "evolucao", label: "Evoluções", icon: "📈", route: "#/profissional/evolucao" },
    { group: "Conta" },
    { id: "perfil-publico", label: "Perfil público", icon: "⭐", route: "#/profissional/perfil-publico" },
    { id: "perfil", label: "Meu perfil", icon: "👤", route: "#/profissional/perfil", bottom: true }
  ]
};

export function shell({ session, active, content, unread = 0 }) {
  const items = NAV[session.role] || [];
  const home = session.role === "paciente" ? "#/paciente" : "#/profissional";
  return `
    <div class="shell">
      <aside class="side" id="side" aria-label="Navegação principal">
        <a class="brand" href="${home}">${BRAND_SVG} GN Care</a>
        ${items
          .map((item) =>
            item.group
              ? `<div class="side-label">${esc(item.group)}</div>`
              : `<button class="side-link ${item.id === active ? "on" : ""}" data-route="${esc(item.route)}" ${
                  item.id === active ? 'aria-current="page"' : ""
                }><i aria-hidden="true">${item.icon}</i>${esc(item.label)}</button>`
          )
          .join("")}
        <div class="side-foot">
          <div class="side-card">
            <b>Protótipo GN Care</b>
            Dados de demonstração. Nenhuma informação real de paciente é usada aqui.
          </div>
          <button class="side-link" data-action="sair" style="margin-top:10px"><i aria-hidden="true">↩</i>Sair</button>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <div style="display:flex;align-items:center;gap:12px;min-width:0">
            <button class="burger" data-action="menu" aria-label="Abrir menu">☰</button>
            <a class="brand" href="${home}" style="font-size:19px">${BRAND_SVG} GN Care</a>
          </div>
          <div class="topbar-user">
            <button class="icon-btn" data-action="notificacoes" aria-label="Notificações">
              🔔${unread ? '<span class="pip"></span>' : ""}
            </button>
            <span class="who">
              <b>${esc(session.name)}</b>
              <span>${esc(session.subtitle || "")}</span>
            </span>
            ${avatar(session.initials, { solid: true })}
          </div>
        </header>

        <main class="view" id="view">${content}</main>
      </div>

      <nav class="bottom-nav" aria-label="Navegação rápida">
        ${items
          .filter((i) => i.bottom)
          .map(
            (i) =>
              `<button class="${i.id === active ? "on" : ""}" data-route="${esc(i.route)}"><i aria-hidden="true">${i.icon}</i>${esc(
                i.label.split(" ")[0]
              )}</button>`
          )
          .join("")}
      </nav>
    </div>`;
}

export function pageHead({ title, lead = "", actions = "", crumb = "" }) {
  return `
    ${crumb}
    <div class="page-head">
      <div>
        <h1 class="h-page">${esc(title)}</h1>
        ${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
      </div>
      ${actions ? `<div class="btn-row">${actions}</div>` : ""}
    </div>`;
}

export function crumb(items) {
  return `
    <nav class="crumb" aria-label="Você está em">
      ${items
        .map((i, idx) =>
          i.route
            ? `<button data-route="${esc(i.route)}">${esc(i.label)}</button>${idx < items.length - 1 ? "<span>›</span>" : ""}`
            : `<span>${esc(i.label)}</span>`
        )
        .join("")}
    </nav>`;
}

export function toggleSide(force) {
  const side = document.getElementById("side");
  if (!side) return;
  const open = force !== undefined ? force : !side.classList.contains("open");
  side.classList.toggle("open", open);
  let scrim = document.querySelector(".scrim");
  if (open && !scrim) {
    scrim = document.createElement("div");
    scrim.className = "scrim";
    scrim.addEventListener("click", () => toggleSide(false));
    document.body.appendChild(scrim);
  }
  if (!open && scrim) scrim.remove();
}
