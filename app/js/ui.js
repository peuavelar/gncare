/* Componentes compartilhados do GN Care.
   Cada componente aparece uma única vez aqui e é reaproveitado pelas telas. */

export function esc(value) {
  return String(value === undefined || value === null ? "" : value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* ---------- formatação ---------- */

const WEEK = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const WEEK_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export function toDate(iso) {
  return new Date(`${iso}T12:00:00`);
}

export function dateShort(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function dateFull(iso) {
  if (!iso) return "—";
  const d = toDate(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

export function weekdayShort(iso) {
  return WEEK_SHORT[toDate(iso).getDay()];
}

export function weekdayLong(iso) {
  return WEEK[toDate(iso).getDay()];
}

export function relativeDay(iso, todayISO) {
  if (iso === todayISO) return "Hoje";
  const diff = Math.round((toDate(iso) - toDate(todayISO)) / 86400000);
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  return `${weekdayShort(iso)} · ${dateShort(iso)}`;
}

export function money(value) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function age(birthISO) {
  if (!birthISO) return "—";
  const b = toDate(birthISO);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a -= 1;
  return `${a} anos`;
}

export function modeLabel(mode) {
  return mode === "presencial" ? "Presencial · GN Fisioterapia" : "Teleatendimento";
}

/* ---------- blocos simples ---------- */

export function avatar(initials, { size = "", solid = false } = {}) {
  return `<div class="avatar ${solid ? "solid" : ""} ${size}" aria-hidden="true">${esc(initials)}</div>`;
}

export function badge(text, kind = "") {
  return `<span class="badge ${kind}">${esc(text)}</span>`;
}

export function statusBadge(status) {
  const map = {
    confirmado: ["Confirmado", ""],
    solicitado: ["Solicitado", "gold"],
    realizado: ["Realizado", "quiet"],
    cancelado: ["Cancelado", "alert"],
    ativo: ["Ativo", ""],
    atencao: ["Atenção", "gold"],
    reavaliacao: ["Reavaliação", "outline"],
    pending: ["Pendente", "quiet"],
    doing: ["Em andamento", "gold"],
    done: ["Concluído", "solid"]
  };
  const [label, kind] = map[status] || [status, "quiet"];
  return badge(label, kind);
}

export function progress(value, kind = "") {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return `<div class="progress ${kind}" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100"><i style="width:${v}%"></i></div>`;
}

export function meter(label, value, kind = "") {
  return `
    <div class="meter">
      <div class="row-between"><span>${esc(label)}</span><span>${Math.round(value)}%</span></div>
      ${progress(value, kind)}
    </div>`;
}

export function stat({ icon, value, label }) {
  return `
    <div class="stat">
      <div class="ico" aria-hidden="true">${icon}</div>
      <strong>${esc(value)}</strong>
      <small>${esc(label)}</small>
    </div>`;
}

export function tile({ icon, title, text, route, action }) {
  const attr = route ? `data-route="${esc(route)}"` : `data-action="${esc(action)}"`;
  return `
    <button class="tile-btn" ${attr}>
      <span class="ico" aria-hidden="true">${icon}</span>
      <b>${esc(title)}</b>
      <span>${esc(text)}</span>
    </button>`;
}

export function tabs(items, current, { action = "tab" } = {}) {
  return `
    <div class="tabs" role="tablist">
      ${items
        .map(
          (t) =>
            `<button class="tab ${t.id === current ? "on" : ""}" role="tab" aria-selected="${t.id === current}" data-action="${action}" data-id="${esc(t.id)}">${esc(t.label)}</button>`
        )
        .join("")}
    </div>`;
}

export function kv(pairs) {
  return `<dl class="kv">${pairs
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || "—")}</dd></div>`)
    .join("")}</dl>`;
}

export function timeline(items) {
  return `<div class="timeline">${items
    .map(
      (i) => `
      <div class="timeline-item">
        <div class="timeline-dot ${i.state || ""}">${i.icon || "•"}</div>
        <div class="timeline-body">
          <b>${esc(i.title)}</b>
          <small>${esc(i.text)}</small>
        </div>
      </div>`
    )
    .join("")}</div>`;
}

/* ---------- estados ---------- */

export function skeleton(kind = "page") {
  if (kind === "list") {
    return `<div class="stack">${Array.from({ length: 3 })
      .map(() => `<div class="skeleton sk-card"></div>`)
      .join("")}</div>`;
  }
  return `
    <div aria-busy="true" aria-live="polite">
      <div class="skeleton sk-line" style="width:180px;height:18px"></div>
      <div class="skeleton sk-line" style="width:320px"></div>
      <div class="grid g-4" style="margin:24px 0">
        ${Array.from({ length: 4 }).map(() => `<div class="skeleton sk-card" style="height:112px"></div>`).join("")}
      </div>
      <div class="grid g-main">
        <div class="skeleton sk-card" style="height:260px"></div>
        <div class="skeleton sk-card" style="height:260px"></div>
      </div>
      <span class="sr-only">Carregando conteúdo</span>
    </div>`;
}

export function emptyState({ icon = "🗂️", title, text, actionLabel, action, route }) {
  const btn = actionLabel
    ? `<button class="btn solid" ${route ? `data-route="${esc(route)}"` : `data-action="${esc(action)}"`}>${esc(actionLabel)}</button>`
    : "";
  return `
    <div class="state">
      <div class="ico" aria-hidden="true">${icon}</div>
      <h3>${esc(title)}</h3>
      <p>${esc(text)}</p>
      ${btn}
    </div>`;
}

export function errorState(message, { action = "retry", label = "Tentar novamente" } = {}) {
  return `
    <div class="state error" role="alert">
      <div class="ico" aria-hidden="true">⚠️</div>
      <h3>Não foi possível carregar</h3>
      <p>${esc(message)}</p>
      <div class="btn-row">
        <button class="btn solid" data-action="${esc(action)}">${esc(label)}</button>
        <button class="btn ghost" data-action="go-home">Voltar ao início</button>
      </div>
    </div>`;
}

/* ---------- gráficos ---------- */

export function barChart(items, { max, suffix = "" } = {}) {
  const top = max || Math.max(...items.map((i) => i.value), 1);
  return `
    <div class="bars" role="img" aria-label="${esc(items.map((i) => `${i.label}: ${i.value}${suffix}`).join(", "))}">
      ${items
        .map(
          (i) => `<div><i style="height:${Math.max(6, (i.value / top) * 100)}%"></i><span>${esc(i.label)}</span></div>`
        )
        .join("")}
    </div>`;
}

export function lineChart(points, { invert = false, label = "" } = {}) {
  if (points.length < 2) {
    return `<p class="muted small">Ainda não há registros suficientes para um gráfico.</p>`;
  }
  const w = 320;
  const h = 120;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (w - 20) + 10;
    const norm = (p.value - min) / span;
    const y = h - 14 - (invert ? 1 - norm : norm) * (h - 34);
    return [x, y];
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)} ${h} L${coords[0][0].toFixed(1)} ${h} Z`;
  return `
    <svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img"
         aria-label="${esc(label || points.map((p) => `${p.label}: ${p.value}`).join(", "))}">
      <path class="area" d="${area}"></path>
      <path class="line" d="${line}"></path>
      ${coords.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"></circle>`).join("")}
    </svg>
    <div class="legend">
      <span>${esc(points[0].label)}: ${points[0].value}</span>
      <span>${esc(points[points.length - 1].label)}: ${points[points.length - 1].value}</span>
    </div>`;
}

/* ---------- cards de domínio ---------- */

export function appointmentCard(ap, todayISO, { role = "paciente" } = {}) {
  const who = role === "paciente" ? ap.professionalName : ap.patientName;
  const who2 = role === "paciente" ? ap.professionalInitials : ap.patientInitials;
  const canEnter = ap.mode === "tele" && ap.status !== "realizado" && ap.status !== "cancelado";
  return `
    <div class="item">
      <div class="item-left">
        ${avatar(who2)}
        <div>
          <b>${esc(who)}</b>
          <small>${esc(relativeDay(ap.date, todayISO))} · ${esc(ap.time)} · ${esc(modeLabel(ap.mode))}</small>
          <small>${esc(ap.type)} · ${esc(ap.duration)}</small>
        </div>
      </div>
      <div class="item-actions">
        ${statusBadge(ap.status)}
        ${canEnter ? `<button class="btn solid xs" data-route="#/${role === "paciente" ? "paciente" : "profissional"}/teleatendimento/${esc(ap.id)}">Entrar na sala</button>` : ""}
        ${
          ap.status !== "cancelado" && ap.status !== "realizado"
            ? `<button class="btn ghost xs" data-action="remarcar" data-id="${esc(ap.id)}">Remarcar</button>
               <button class="btn ghost xs" data-action="cancelar" data-id="${esc(ap.id)}">Cancelar</button>`
            : ""
        }
      </div>
    </div>`;
}

export function exerciseCard(ex, { route = "#/paciente/exercicios" } = {}) {
  return `
    <article class="ex-card">
      <div class="ex-thumb">
        <img src="${esc(ex.image)}" alt="Demonstração do exercício ${esc(ex.name)}" loading="lazy">
        ${statusBadge(ex.status)}
      </div>
      <div class="ex-body">
        <h3 class="h-card">${esc(ex.name)}</h3>
        <div class="ex-meta">
          <span>${esc(ex.category)}</span>
          <span>${ex.sets} séries · ${esc(ex.reps)}</span>
          <span>${esc(ex.frequency)}</span>
          <span>${ex.minutes} min</span>
        </div>
        ${meter("Adesão", ex.adherence)}
        <div class="btn-row" style="margin-top:auto">
          <button class="btn line sm" data-route="${esc(route)}/${esc(ex.id)}">Ver exercício</button>
          ${
            ex.status === "done"
              ? `<button class="btn ghost sm" data-action="refazer" data-id="${esc(ex.id)}">Refazer</button>`
              : `<button class="btn solid sm" data-action="concluir" data-id="${esc(ex.id)}">Concluir</button>`
          }
        </div>
      </div>
    </article>`;
}

export function patientRow(p) {
  return `
    <div class="item">
      <div class="item-left">
        ${avatar(p.initials)}
        <div>
          <b>${esc(p.name)}</b>
          <small>${esc(p.condition)} · Plano ${esc(p.planName)}</small>
          <small>${p.next ? `Próximo: ${esc(dateShort(p.next.date))} às ${esc(p.next.time)}` : "Sem atendimento agendado"}</small>
        </div>
      </div>
      <div class="item-actions">
        ${statusBadge(p.status)}
        ${badge(`Adesão ${p.adherence}%`, p.adherence < 60 ? "gold" : "quiet")}
        <button class="btn line xs" data-route="#/profissional/pacientes/${esc(p.id)}">Abrir paciente</button>
      </div>
    </div>`;
}

export function professionalCard(pro, { compact = false } = {}) {
  return `
    <div class="card">
      <div class="item-left" style="align-items:flex-start">
        ${avatar(pro.initials, { size: "lg", solid: true })}
        <div>
          <h3 class="h-card">${esc(pro.name)}</h3>
          <p class="muted small">${esc(pro.role)} · ${esc(pro.crefito)}</p>
          <div class="chip-row" style="margin-top:10px">
            ${pro.specialties.map((s) => `<span class="chip static">${esc(s)}</span>`).join("")}
          </div>
          ${compact ? "" : `<p class="muted" style="margin-top:12px;line-height:1.5">${esc(pro.bio)}</p>`}
        </div>
      </div>
    </div>`;
}

/* ---------- toast ---------- */

let toastWrap;

export function toast(message, kind = "ok") {
  if (!toastWrap) {
    toastWrap = document.createElement("div");
    toastWrap.className = "toast-wrap";
    toastWrap.setAttribute("role", "status");
    toastWrap.setAttribute("aria-live", "polite");
    document.body.appendChild(toastWrap);
  }
  const node = document.createElement("div");
  node.className = `toast ${kind}`;
  node.textContent = message;
  toastWrap.appendChild(node);
  setTimeout(() => {
    node.style.opacity = "0";
    setTimeout(() => node.remove(), 250);
  }, 3200);
}

/* ---------- modal ---------- */

let openModalEl = null;

let loaderShownAt = 0;
let loaderTimer = 0;

export function showScreenLoader() {
  const el = document.getElementById("screen-loader");
  if (!el) return;
  clearTimeout(loaderTimer);
  el.classList.add("on");
  el.setAttribute("aria-busy", "true");
  loaderShownAt = Date.now();
}

export function hideScreenLoader() {
  const el = document.getElementById("screen-loader");
  if (!el || !el.classList.contains("on")) return;
  const wait = Math.max(0, 520 - (Date.now() - loaderShownAt));
  clearTimeout(loaderTimer);
  loaderTimer = setTimeout(() => {
    el.classList.remove("on");
    el.setAttribute("aria-busy", "false");
  }, wait);
}

export function closeModal() {
  if (openModalEl) {
    openModalEl.remove();
    openModalEl = null;
    document.body.style.overflow = "";
  }
}

export function modal({ title, description = "", body, footer = "", wide = false, onMount }) {
  closeModal();
  const back = document.createElement("div");
  back.className = "modal-back";
  back.innerHTML = `
    <div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-head">
        <div>
          <h2>${esc(title)}</h2>
          ${description ? `<p class="muted small">${esc(description)}</p>` : ""}
        </div>
        <button class="modal-close" data-close aria-label="Fechar">×</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ""}
    </div>`;
  back.addEventListener("mousedown", (e) => {
    if (e.target === back) closeModal();
  });
  back.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.body.appendChild(back);
  document.body.style.overflow = "hidden";
  openModalEl = back;
  const first = back.querySelector("input,select,textarea,button:not(.modal-close)");
  if (first) first.focus();
  if (onMount) onMount(back);
  return back;
}

export function confirmDialog({ title, text, confirmLabel = "Confirmar", danger = false }) {
  return new Promise((resolve) => {
    const back = modal({
      title,
      body: `<p class="muted" style="line-height:1.55">${esc(text)}</p>`,
      footer: `
        <button class="btn ghost" data-close>Cancelar</button>
        <button class="btn ${danger ? "danger" : "solid"}" data-confirm>${esc(confirmLabel)}</button>`
    });
    back.addEventListener("click", (e) => {
      if (e.target.closest("[data-confirm]")) {
        closeModal();
        resolve(true);
      } else if (e.target.closest("[data-close]") || e.target === back) {
        resolve(false);
      }
    });
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ---------- formulários ---------- */

export function field({ label, name, type = "text", value = "", placeholder = "", required = false, hint = "", options, rows }) {
  const base = `id="f-${esc(name)}" name="${esc(name)}" ${required ? "required aria-required='true'" : ""}`;
  let control;
  if (options) {
    control = `<select ${base}>${options
      .map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const lab = typeof o === "string" ? o : o.label;
        return `<option value="${esc(val)}" ${String(value) === String(val) ? "selected" : ""}>${esc(lab)}</option>`;
      })
      .join("")}</select>`;
  } else if (type === "textarea") {
    control = `<textarea ${base} rows="${rows || 4}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`;
  } else {
    control = `<input ${base} type="${esc(type)}" value="${esc(value)}" placeholder="${esc(placeholder)}">`;
  }
  return `
    <div class="field" data-field="${esc(name)}">
      <label for="f-${esc(name)}">${esc(label)}${required ? " *" : ""}</label>
      ${control}
      ${hint ? `<span class="hint">${esc(hint)}</span>` : ""}
      <span class="err" hidden></span>
    </div>`;
}

export function readForm(scope) {
  const data = {};
  scope.querySelectorAll("input,select,textarea").forEach((el) => {
    if (!el.name) return;
    data[el.name] = el.type === "checkbox" ? el.checked : el.value.trim();
  });
  return data;
}

export function validate(scope, rules) {
  let ok = true;
  let firstInvalid = null;
  Object.entries(rules).forEach(([name, message]) => {
    const wrap = scope.querySelector(`[data-field="${name}"]`);
    if (!wrap) return;
    const input = wrap.querySelector("input,select,textarea");
    const err = wrap.querySelector(".err");
    const empty = !input.value.trim();
    wrap.classList.toggle("invalid", empty);
    err.hidden = !empty;
    err.textContent = empty ? message : "";
    if (input) input.setAttribute("aria-invalid", empty ? "true" : "false");
    if (empty) {
      ok = false;
      if (!firstInvalid) firstInvalid = input;
    }
  });
  if (firstInvalid) firstInvalid.focus();
  return ok;
}

export const BRAND_SVG = `
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 3c2 5 2 8 0 12 4-2 8-2 12 0-4 2-6 6-6 11-2-5-6-8-12-8 4-3 6-8 6-15Z" fill="#1568b8"/>
  </svg>`;
