/* Área do fisioterapeuta: pacientes, prontuário, avaliação, plano, prescrição,
   evolução, agenda, teleatendimento e perfil público. */

import { proApi, catalog, dayISO, addDays, startOfWeek } from "../api.js";
import { pageHead, crumb } from "../layout.js";
import { navigate } from "../router.js";
import {
  age,
  avatar,
  badge,
  barChart,
  closeModal,
  confirmDialog,
  dateFull,
  dateShort,
  emptyState,
  esc,
  field,
  lineChart,
  meter,
  modal,
  modeLabel,
  patientRow,
  progress,
  readForm,
  relativeDay,
  stat,
  statusBadge,
  tabs,
  tile,
  timeline,
  toast,
  validate,
  weekdayShort
} from "../ui.js";

const TODAY = dayISO(0);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/* ---------------- visão geral ---------------- */

export async function home(ctx) {
  const data = await proApi.dashboard(ctx.session.refId);
  const { professional, agenda, pending, attention, kpis, activity, notifications } = data;

  return {
    title: "Visão geral",
    unread: notifications.filter((n) => !n.read).length,
    html: `
      ${pageHead({
        title: `${greeting()}, ${esc(professional.name.split(" ")[0])}`,
        lead: "Seu consultório digital: o que acontece hoje e o que precisa de atenção.",
        actions: `
          <button class="btn line" data-action="novo-paciente">Adicionar paciente</button>
          <button class="btn solid" data-route="#/profissional/agenda">Abrir agenda</button>`
      })}

      <div class="grid g-4" style="margin-bottom:22px">
        ${stat({ icon: "👥", value: String(kpis.active), label: "Pacientes ativos na sua carteira" })}
        ${stat({ icon: "📅", value: String(kpis.today), label: "Atendimentos hoje" })}
        ${stat({ icon: "🎯", value: `${kpis.adherence}%`, label: "Adesão média dos pacientes" })}
        ${stat({ icon: "⭐", value: String(kpis.rating || "—"), label: "Avaliação do seu perfil público" })}
      </div>

      <div class="grid g-main">
        <div class="stack-lg">
          <section class="card pad-lg">
            <div class="card-head">
              <div>
                <h2 class="h-section">Agenda de hoje</h2>
                <p class="muted small">${agenda.length ? `${agenda.length} atendimento(s)` : "Nenhum atendimento para hoje"}</p>
              </div>
              <button class="btn ghost sm" data-route="#/profissional/agenda">Ver semana</button>
            </div>
            <div class="stack" style="margin-top:6px">
              ${
                agenda.length
                  ? agenda
                      .map(
                        (ap) => `
                  <div class="item">
                    <div class="item-left">
                      ${avatar(ap.patientInitials)}
                      <div>
                        <b>${esc(ap.time)} · ${esc(ap.patientName)}</b>
                        <small>${esc(modeLabel(ap.mode))} · ${esc(ap.type)} · ${esc(ap.duration)}</small>
                      </div>
                    </div>
                    <div class="item-actions">
                      ${statusBadge(ap.status)}
                      <button class="btn ghost xs" data-route="#/profissional/pacientes/${esc(ap.patientId)}">Prontuário</button>
                      ${ap.mode === "tele" ? `<button class="btn solid xs" data-route="#/profissional/teleatendimento/${esc(ap.id)}">Abrir sala</button>` : ""}
                    </div>
                  </div>`
                      )
                      .join("")
                  : emptyState({
                      icon: "📅",
                      title: "Agenda livre hoje",
                      text: "Você pode abrir um horário ou agendar um paciente da sua carteira.",
                      actionLabel: "Ir para a agenda",
                      route: "#/profissional/agenda"
                    })
              }
            </div>
          </section>

          <section class="card pad-lg">
            <div class="card-head">
              <div>
                <h2 class="h-section">Solicitações de pacientes</h2>
                <p class="muted small">Pedidos de atendimento aguardando confirmação.</p>
              </div>
            </div>
            <div class="stack">
              ${
                pending.length
                  ? pending
                      .map(
                        (ap) => `
                  <div class="item">
                    <div class="item-left">
                      ${avatar(ap.patientInitials)}
                      <div>
                        <b>${esc(ap.patientName)}</b>
                        <small>${esc(relativeDay(ap.date, TODAY))} · ${esc(ap.time)} · ${esc(modeLabel(ap.mode))}</small>
                      </div>
                    </div>
                    <div class="item-actions">
                      <button class="btn ghost xs" data-action="recusar" data-id="${esc(ap.id)}">Recusar</button>
                      <button class="btn solid xs" data-action="confirmar" data-id="${esc(ap.id)}">Confirmar</button>
                    </div>
                  </div>`
                      )
                      .join("")
                  : `<p class="muted small">Nenhuma solicitação pendente.</p>`
              }
            </div>
          </section>

          <section class="card pad-lg">
            <h2 class="h-section">Atividade recente</h2>
            <div style="margin-top:18px">
              ${timeline(activity.map((a) => ({ title: a.text, text: dateFull(a.date), icon: "✓", state: "done" })))}
            </div>
          </section>
        </div>

        <div class="stack-lg">
          <section class="card ${attention.length ? "mint" : ""}">
            <h3 class="h-card">Precisa de atenção</h3>
            <div class="stack" style="margin-top:14px">
              ${
                attention.length
                  ? attention
                      .map(
                        (p) => `
                  <div class="item">
                    <div class="item-left">
                      ${avatar(p.initials)}
                      <div><b>${esc(p.name)}</b><small>Adesão ${p.adherence}% · ${esc(p.condition)}</small></div>
                    </div>
                    <button class="btn line xs" data-route="#/profissional/pacientes/${esc(p.id)}">Abrir</button>
                  </div>`
                      )
                      .join("")
                  : `<p class="muted small">Todos os pacientes estão dentro do esperado.</p>`
              }
            </div>
          </section>

          <section class="card">
            <h3 class="h-card">Seu desempenho</h3>
            <div class="stack" style="margin-top:16px">
              ${meter("Adesão média", kpis.adherence)}
              ${meter("Consultas realizadas", 92)}
            </div>
            <p class="tiny muted" style="margin-top:12px">Indicadores de demonstração do protótipo.</p>
          </section>

          <section>
            <h3 class="h-card" style="margin-bottom:12px">Atalhos</h3>
            <div class="grid g-2">
              ${tile({ icon: "👥", title: "Pacientes", text: "Carteira completa", route: "#/profissional/pacientes" })}
              ${tile({ icon: "🎥", title: "Teleatendimento", text: "Salas de hoje", route: "#/profissional/teleatendimento" })}
              ${tile({ icon: "🏃", title: "Exercícios", text: "Prescrever programa", route: "#/profissional/exercicios" })}
              ${tile({ icon: "📈", title: "Evoluções", text: "Registrar evolução", route: "#/profissional/evolucao" })}
            </div>
          </section>
        </div>
      </div>`,
    mount(root, context) {
      bindProNotifications(notifications);
      root.querySelector('[data-action="novo-paciente"]').addEventListener("click", () => openNewPatient(context));
      root.addEventListener("click", async (e) => {
        const confirmBtn = e.target.closest('[data-action="confirmar"]');
        const refuse = e.target.closest('[data-action="recusar"]');
        if (confirmBtn) {
          await proApi.setAppointmentStatus(confirmBtn.dataset.id, "confirmado");
          toast("Atendimento confirmado.");
          context.refresh();
        }
        if (refuse) {
          const ok = await confirmDialog({
            title: "Recusar solicitação",
            text: "O paciente será avisado de que o horário não está disponível.",
            confirmLabel: "Recusar",
            danger: true
          });
          if (!ok) return;
          await proApi.setAppointmentStatus(refuse.dataset.id, "cancelado");
          toast("Solicitação recusada.");
          context.refresh();
        }
      });
    }
  };
}

function bindProNotifications(list) {
  const btn = document.querySelector('[data-action="notificacoes"]');
  if (!btn) return;
  btn.onclick = () =>
    modal({
      title: "Notificações",
      description: "Avisos do seu consultório digital.",
      body: list.length
        ? `<div class="stack">${list
            .map(
              (n) => `<div class="item"><div class="item-left"><div class="avatar sm">${n.read ? "○" : "●"}</div>
              <div><b>${esc(n.text)}</b><small>${esc(dateFull(n.date))}</small></div></div></div>`
            )
            .join("")}</div>`
        : emptyState({ icon: "🔔", title: "Sem novidades", text: "Solicitações e alertas aparecem aqui." }),
      footer: `<button class="btn ghost" data-close>Fechar</button>`
    });
}

/* ---------------- pacientes ---------------- */

export async function patients(ctx) {
  const search = ctx.query.q || "";
  const filter = ctx.query.filtro || "todos";
  const list = await proApi.patients(ctx.session.refId, { search, filter });

  return {
    title: "Pacientes",
    html: `
      ${pageHead({
        title: "Meus pacientes",
        lead: "Carteira completa, com status, adesão e próximos atendimentos.",
        actions: `<button class="btn solid" data-action="novo-paciente">Adicionar paciente</button>`
      })}

      <div class="card pad-lg">
        <div class="field">
          <label for="f-busca" class="sr-only">Buscar paciente</label>
          <input id="f-busca" type="search" placeholder="Buscar por nome, telefone ou condição clínica" value="${esc(search)}">
        </div>
        <div class="chip-row" style="margin-top:14px">
          ${[
            ["todos", "Todos"],
            ["ativos", "Ativos"],
            ["atencao", "Atenção"],
            ["reavaliacao", "Reavaliação"]
          ]
            .map(([id, label]) => `<button class="chip ${filter === id ? "on" : ""}" data-filtro="${id}">${label}</button>`)
            .join("")}
        </div>

        <div class="divider"></div>

        <div class="stack">
          ${
            list.length
              ? list.map(patientRow).join("")
              : emptyState({
                  icon: "👥",
                  title: search || filter !== "todos" ? "Nenhum paciente nesse filtro" : "Sua carteira está vazia",
                  text:
                    search || filter !== "todos"
                      ? "Ajuste a busca ou volte para a lista completa."
                      : "Adicione o primeiro paciente para começar o acompanhamento.",
                  actionLabel: search || filter !== "todos" ? "Limpar filtros" : "Adicionar paciente",
                  action: search || filter !== "todos" ? "limpar" : "novo-paciente"
                })
          }
        </div>
      </div>`,
    mount(root, context) {
      const input = root.querySelector("#f-busca");
      let timer;
      input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          navigate(`#/profissional/pacientes?q=${encodeURIComponent(input.value)}&filtro=${filter}`);
        }, 350);
      });
      root.querySelectorAll("[data-filtro]").forEach((chip) =>
        chip.addEventListener("click", () =>
          navigate(`#/profissional/pacientes?q=${encodeURIComponent(search)}&filtro=${chip.dataset.filtro}`)
        )
      );
      root.addEventListener("click", (e) => {
        if (e.target.closest('[data-action="limpar"]')) navigate("#/profissional/pacientes");
        if (e.target.closest('[data-action="novo-paciente"]')) openNewPatient(context);
      });
    }
  };
}

function openNewPatient(ctx) {
  modal({
    title: "Adicionar paciente",
    description: "Telefone é usado para evitar cadastro duplicado.",
    wide: true,
    body: `
      <form id="new-patient" class="stack">
        <div class="field-row">
          ${field({ label: "Nome completo", name: "name", required: true })}
          ${field({ label: "Telefone", name: "phone", required: true, placeholder: "(71) 90000-0000" })}
        </div>
        <div class="field-row three">
          ${field({ label: "Data de nascimento", name: "birth", type: "date" })}
          ${field({ label: "CPF", name: "cpf", placeholder: "000.000.000-00" })}
          ${field({ label: "Profissão", name: "job" })}
        </div>
        <div class="field-row">
          ${field({ label: "E-mail", name: "email", type: "email" })}
          ${field({
            label: "Plano",
            name: "planId",
            options: [
              { value: "", label: "Sem plano" },
              { value: "premium", label: "Premium" },
              { value: "ouro", label: "Ouro" },
              { value: "platinum", label: "Platinum" }
            ]
          })}
        </div>
        ${field({
          label: "Frequência pretendida",
          name: "frequency",
          options: ["Conforme avaliação", "1x por semana", "2x por semana", "3x por semana"]
        })}
        ${field({ label: "Queixa principal", name: "complaint", type: "textarea", rows: 3 })}
        ${field({ label: "Observações iniciais", name: "notes", type: "textarea", rows: 2 })}
      </form>`,
    footer: `
      <button class="btn ghost" data-close>Cancelar</button>
      <button class="btn solid" id="save-patient">Cadastrar paciente</button>`,
    onMount(back) {
      back.querySelector("#save-patient").addEventListener("click", async (e) => {
        const form = back.querySelector("#new-patient");
        if (!validate(form, { name: "Informe o nome do paciente", phone: "Informe o telefone" })) return;
        e.currentTarget.disabled = true;
        e.currentTarget.textContent = "Salvando...";
        const result = await proApi.addPatient(ctx.session.refId, readForm(form));
        closeModal();
        if (result.duplicate) {
          toast(`${result.patient.name} já está cadastrado com esse telefone. Abrindo o prontuário.`, "warn");
        } else {
          toast("Paciente cadastrado e adicionado à sua carteira.");
        }
        navigate(`#/profissional/pacientes/${result.patient.id}`);
      });
    }
  });
}

/* ---------------- prontuário ---------------- */

const RECORD_TABS = [
  { id: "resumo", label: "Resumo" },
  { id: "dados", label: "Dados" },
  { id: "avaliacao", label: "Avaliação" },
  { id: "tratamento", label: "Tratamento" },
  { id: "exercicios", label: "Exercícios" },
  { id: "evolucao", label: "Evolução" },
  { id: "consultas", label: "Consultas" },
  { id: "documentos", label: "Documentos" },
  { id: "observacoes", label: "Observações" },
  { id: "historico", label: "Histórico" }
];

export async function patientRecord(ctx) {
  const data = await proApi.patient(ctx.params.id);
  const library = await catalog.exercises();
  const tab = ctx.params.tab || ctx.query.aba || "resumo";
  const { patient, plan, treatment, evaluations, evolutions, exercises, documents, appointments, next } = data;
  const lastEval = evaluations[0] || null;
  const lastEvo = evolutions[0] || null;
  const painPoints = [...evolutions].reverse().map((e) => ({ label: dateShort(e.date), value: e.pain }));

  const views = {
    resumo: () => `
      <div class="grid g-4" style="margin-bottom:20px">
        ${stat({ icon: "🎯", value: `${patient.adherence}%`, label: "Adesão ao programa" })}
        ${stat({ icon: "🩹", value: lastEvo ? `${lastEvo.pain}/10` : "—", label: "Dor no último registro" })}
        ${stat({ icon: "📅", value: String(appointments.filter((a) => a.status === "realizado").length), label: "Atendimentos realizados" })}
        ${stat({ icon: "🏃", value: `${exercises.filter((e) => e.status === "done").length}/${exercises.length}`, label: "Exercícios concluídos" })}
      </div>
      <div class="grid g-main">
        <div class="stack-lg">
          <section class="card pad-lg">
            <h3 class="h-card">Resumo clínico</h3>
            <p class="muted" style="margin-top:10px;line-height:1.6">${esc(treatment && treatment.objective ? treatment.objective : "Plano de tratamento ainda não definido.")}</p>
            ${lastEvo ? `<div class="divider"></div><b>Última evolução</b><p class="muted small" style="margin-top:8px;line-height:1.55">${esc(lastEvo.text)}</p><p class="tiny muted" style="margin-top:6px">${esc(dateFull(lastEvo.date))} · ${esc(lastEvo.author)}</p>` : ""}
          </section>
          <section class="card pad-lg">
            <h3 class="h-card">Evolução da dor</h3>
            <div style="margin-top:16px">${painPoints.length > 1 ? lineChart(painPoints, { invert: true }) : `<p class="muted small">Ainda sem registros suficientes.</p>`}</div>
          </section>
        </div>
        <div class="stack-lg">
          <section class="card">
            <h3 class="h-card">Próximo atendimento</h3>
            ${
              next
                ? `<p class="muted small" style="margin-top:10px">${esc(relativeDay(next.date, TODAY))} · ${esc(next.time)}</p>
                   <p class="tiny muted">${esc(modeLabel(next.mode))} · ${esc(next.type)}</p>
                   ${next.mode === "tele" ? `<button class="btn solid block" style="margin-top:14px" data-route="#/profissional/teleatendimento/${esc(next.id)}">Abrir sala</button>` : ""}`
                : `<p class="muted small" style="margin-top:10px">Nenhum atendimento agendado.</p>
                   <button class="btn line block" style="margin-top:14px" data-action="agendar">Agendar atendimento</button>`
            }
          </section>
          <section class="card ${patient.adherence < 60 ? "mint" : ""}">
            <h3 class="h-card">Alertas</h3>
            <div class="stack" style="margin-top:12px">
              ${patient.adherence < 60 ? `<div>${badge("Adesão abaixo do esperado", "gold")}<p class="tiny muted" style="margin-top:6px">Considere simplificar o programa.</p></div>` : `<p class="muted small">Sem alertas no momento.</p>`}
              ${patient.status === "reavaliacao" ? `<div>${badge("Reavaliação programada", "outline")}</div>` : ""}
            </div>
          </section>
        </div>
      </div>`,

    dados: () => `
      <section class="card pad-lg">
        <form id="patient-data" class="stack">
          <div class="field-row">
            ${field({ label: "Nome completo", name: "name", value: patient.name, required: true })}
            ${field({ label: "Telefone", name: "phone", value: patient.phone, required: true })}
          </div>
          <div class="field-row three">
            ${field({ label: "Data de nascimento", name: "birth", type: "date", value: patient.birth })}
            ${field({ label: "CPF", name: "cpf", value: patient.cpf })}
            ${field({ label: "Profissão", name: "job", value: patient.job })}
          </div>
          <div class="field-row">
            ${field({ label: "E-mail", name: "email", type: "email", value: patient.email })}
            ${field({ label: "Contato de emergência", name: "emergency", value: patient.emergency })}
          </div>
          <div class="field-row">
            ${field({
              label: "Plano",
              name: "planId",
              value: patient.planId,
              options: [
                { value: "", label: "Sem plano" },
                { value: "premium", label: "Premium" },
                { value: "ouro", label: "Ouro" },
                { value: "platinum", label: "Platinum" }
              ]
            })}
            ${field({
              label: "Status",
              name: "status",
              value: patient.status,
              options: [
                { value: "ativo", label: "Ativo" },
                { value: "atencao", label: "Atenção" },
                { value: "reavaliacao", label: "Reavaliação" }
              ]
            })}
          </div>
          ${field({ label: "Condição clínica", name: "condition", value: patient.condition })}
          <div class="btn-row"><button class="btn solid" type="submit">Salvar dados</button></div>
        </form>
      </section>`,

    avaliacao: () => `
      <div class="grid g-main">
        <section class="card pad-lg">
          <div class="card-head">
            <div><h3 class="h-card">Avaliações registradas</h3><p class="muted small">Histórico completo do paciente.</p></div>
            <button class="btn solid sm" data-action="nova-avaliacao">Nova avaliação</button>
          </div>
          <div class="stack">
            ${
              evaluations.length
                ? evaluations
                    .map(
                      (e) => `
                <article class="timeline-body">
                  <div class="row-between"><b>${esc(e.kind)} · ${esc(dateFull(e.date))}</b>${badge(`Dor ${e.pain}/10`, e.pain > 5 ? "gold" : "")}</div>
                  <dl class="kv" style="margin-top:14px">
                    <div><dt>Queixa principal</dt><dd>${esc(e.complaint)}</dd></div>
                    <div><dt>Hipótese funcional</dt><dd>${esc(e.hypothesis)}</dd></div>
                    <div><dt>Amplitude de movimento</dt><dd>${esc(e.rom)}</dd></div>
                    <div><dt>Força muscular</dt><dd>${esc(e.strength)}</dd></div>
                    <div><dt>Testes funcionais</dt><dd>${esc(e.tests)}</dd></div>
                    <div><dt>Limitações</dt><dd>${esc(e.limitations)}</dd></div>
                  </dl>
                  <p class="muted small" style="margin-top:12px"><b>Conduta:</b> ${esc(e.plan)}</p>
                </article>`
                    )
                    .join("")
                : emptyState({
                    icon: "📝",
                    title: "Nenhuma avaliação registrada",
                    text: "Registre a avaliação inicial para montar o plano de tratamento.",
                    actionLabel: "Nova avaliação",
                    action: "nova-avaliacao"
                  })
            }
          </div>
        </section>
        <aside class="card">
          <h3 class="h-card">Resumo</h3>
          <dl class="kv" style="grid-template-columns:1fr;margin-top:14px">
            <div><dt>Primeira avaliação</dt><dd>${esc(lastEval ? dateFull(evaluations[evaluations.length - 1].date) : "—")}</dd></div>
            <div><dt>Última avaliação</dt><dd>${esc(lastEval ? dateFull(lastEval.date) : "—")}</dd></div>
            <div><dt>Dor inicial</dt><dd>${lastEval ? `${evaluations[evaluations.length - 1].pain}/10` : "—"}</dd></div>
            <div><dt>Dor atual</dt><dd>${lastEvo ? `${lastEvo.pain}/10` : "—"}</dd></div>
          </dl>
        </aside>
      </div>`,

    tratamento: () => `
      <div class="grid g-main">
        <section class="card pad-lg">
          <h3 class="h-card">Plano de tratamento</h3>
          <form id="treatment-form" class="stack" style="margin-top:16px">
            ${field({ label: "Objetivo do tratamento", name: "objective", type: "textarea", rows: 2, value: treatment ? treatment.objective : "" })}
            <div class="field-row three">
              ${field({ label: "Frequência", name: "frequency", value: treatment ? treatment.frequency : "", placeholder: "3x por semana" })}
              ${field({ label: "Duração prevista", name: "duration", value: treatment ? treatment.duration : "", placeholder: "12 semanas" })}
              ${field({ label: "Fase atual", name: "phase", value: treatment ? treatment.phase : "" })}
            </div>
            ${field({ label: "Observações do plano", name: "notes", type: "textarea", rows: 3, value: treatment ? treatment.notes : "" })}
            <div class="btn-row"><button class="btn solid" type="submit">Salvar plano</button></div>
          </form>
        </section>

        <aside class="card">
          <div class="card-head">
            <h3 class="h-card">Metas</h3>
            <button class="btn line xs" data-action="nova-meta">Adicionar</button>
          </div>
          <div class="stack">
            ${
              treatment && treatment.goals.length
                ? treatment.goals
                    .map(
                      (g) => `
                <div>
                  ${meter(g.title, g.progress)}
                  <div class="row-between" style="margin-top:6px">
                    <span class="tiny muted">${esc(g.horizon)}</span>
                    <input type="range" min="0" max="100" value="${g.progress}" data-goal="${esc(g.id)}" aria-label="Progresso de ${esc(g.title)}">
                  </div>
                </div>`
                    )
                    .join("")
                : `<p class="muted small">Nenhuma meta definida.</p>`
            }
          </div>
        </aside>
      </div>`,

    exercicios: () => `
      <div class="grid g-main">
        <section class="card pad-lg">
          <div class="card-head">
            <div><h3 class="h-card">Programa atual</h3><p class="muted small">${exercises.length} exercício(s) prescrito(s)</p></div>
            <button class="btn solid sm" data-action="prescrever">Prescrever exercício</button>
          </div>
          <div class="stack">
            ${
              exercises.length
                ? exercises
                    .map(
                      (ex) => `
                <div class="item">
                  <div class="item-left">
                    <div class="avatar" aria-hidden="true">${esc(ex.category[0])}</div>
                    <div>
                      <b>${esc(ex.name)}</b>
                      <small>${ex.sets} séries · ${esc(ex.reps)} · ${esc(ex.frequency)} · descanso ${esc(ex.rest)}</small>
                      ${ex.notes ? `<small>${esc(ex.notes)}</small>` : ""}
                    </div>
                  </div>
                  <div class="item-actions">
                    ${badge(`Adesão ${ex.adherence}%`, ex.adherence < 60 ? "gold" : "quiet")}
                    ${statusBadge(ex.status)}
                    <button class="btn ghost xs" data-action="remover-exercicio" data-id="${esc(ex.id)}">Remover</button>
                  </div>
                </div>`
                    )
                    .join("")
                : emptyState({
                    icon: "🏃",
                    title: "Nenhum exercício prescrito",
                    text: "Monte o programa a partir da biblioteca de exercícios.",
                    actionLabel: "Prescrever exercício",
                    action: "prescrever"
                  })
            }
          </div>
        </section>

        <aside class="card">
          <h3 class="h-card">Adesão por exercício</h3>
          <div class="stack" style="margin-top:16px">
            ${exercises.length ? exercises.map((ex) => meter(ex.name, ex.adherence)).join("") : `<p class="muted small">Sem dados ainda.</p>`}
          </div>
        </aside>
      </div>`,

    evolucao: () => `
      <div class="grid g-main">
        <section class="card pad-lg">
          <div class="card-head">
            <div><h3 class="h-card">Evolução clínica</h3><p class="muted small">Registros por atendimento.</p></div>
            <button class="btn solid sm" data-action="nova-evolucao">Registrar evolução</button>
          </div>
          <div class="stack">
            ${
              evolutions.length
                ? evolutions
                    .map(
                      (e) => `
                <article class="timeline-body">
                  <div class="row-between">
                    <b>${esc(dateFull(e.date))}</b>
                    <span>${badge(`Dor ${e.pain}/10`, e.pain > 5 ? "gold" : "")} ${badge(`Adesão ${e.adherence}%`, "quiet")}</span>
                  </div>
                  <p class="muted small" style="margin-top:10px;line-height:1.55">${esc(e.text)}</p>
                  ${e.conduct ? `<p class="tiny muted" style="margin-top:6px"><b>Conduta:</b> ${esc(e.conduct)}</p>` : ""}
                  ${e.next ? `<p class="tiny muted"><b>Próxima etapa:</b> ${esc(e.next)}</p>` : ""}
                </article>`
                    )
                    .join("")
                : emptyState({
                    icon: "📈",
                    title: "Nenhuma evolução registrada",
                    text: "Registre a evolução ao final de cada atendimento.",
                    actionLabel: "Registrar evolução",
                    action: "nova-evolucao"
                  })
            }
          </div>
        </section>
        <aside class="card">
          <h3 class="h-card">Indicadores</h3>
          <div style="margin-top:16px">${painPoints.length > 1 ? lineChart(painPoints, { invert: true }) : `<p class="muted small">Sem série suficiente.</p>`}</div>
          <div class="divider"></div>
          ${meter("Adesão atual", patient.adherence)}
        </aside>
      </div>`,

    consultas: () => `
      <section class="card pad-lg">
        <div class="card-head">
          <div><h3 class="h-card">Atendimentos</h3><p class="muted small">Agendados e realizados.</p></div>
          <button class="btn solid sm" data-action="agendar">Agendar atendimento</button>
        </div>
        <div class="stack">
          ${
            appointments.length
              ? appointments
                  .map(
                    (ap) => `
              <div class="item">
                <div class="item-left">
                  <div class="avatar sm" aria-hidden="true">${ap.mode === "tele" ? "🎥" : "🏥"}</div>
                  <div><b>${esc(dateFull(ap.date))} · ${esc(ap.time)}</b><small>${esc(modeLabel(ap.mode))} · ${esc(ap.type)} · ${esc(ap.duration)}</small></div>
                </div>
                <div class="item-actions">
                  ${statusBadge(ap.status)}
                  ${ap.status === "confirmado" ? `<button class="btn ghost xs" data-action="marcar-realizado" data-id="${esc(ap.id)}">Marcar realizado</button>` : ""}
                  ${ap.mode === "tele" && ap.status !== "realizado" && ap.status !== "cancelado" ? `<button class="btn solid xs" data-route="#/profissional/teleatendimento/${esc(ap.id)}">Abrir sala</button>` : ""}
                </div>
              </div>`
                  )
                  .join("")
              : emptyState({ icon: "📅", title: "Sem atendimentos", text: "Agende o primeiro atendimento do paciente.", actionLabel: "Agendar", action: "agendar" })
          }
        </div>
      </section>`,

    documentos: () => `
      <section class="card pad-lg">
        <div class="card-head">
          <div><h3 class="h-card">Documentos do paciente</h3><p class="muted small">Avaliações, programas e orientações.</p></div>
          <button class="btn solid sm" data-action="novo-documento">Adicionar documento</button>
        </div>
        <div class="stack">
          ${
            documents.length
              ? documents
                  .map(
                    (d) => `
              <div class="item">
                <div class="item-left">
                  <div class="avatar sm" aria-hidden="true">📄</div>
                  <div><b>${esc(d.title)}</b><small>${esc(d.kind)} · ${esc(dateFull(d.date))} · ${esc(d.owner)}</small></div>
                </div>
                ${badge(d.kind, "quiet")}
              </div>`
                  )
                  .join("")
              : emptyState({ icon: "📄", title: "Nenhum documento", text: "Publique a avaliação ou o programa para o paciente.", actionLabel: "Adicionar documento", action: "novo-documento" })
          }
        </div>
      </section>`,

    observacoes: () => `
      <section class="card pad-lg">
        <h3 class="h-card">Observações administrativas</h3>
        <p class="muted small" style="margin-top:6px">Visíveis apenas para você. Não aparecem para o paciente.</p>
        <form id="notes-form" class="stack" style="margin-top:16px">
          ${field({ label: "Anotações", name: "notes", type: "textarea", rows: 6, value: patient.notes })}
          <div class="btn-row"><button class="btn solid" type="submit">Salvar observações</button></div>
        </form>
      </section>`,

    historico: () => {
      const items = [
        ...appointments.map((a) => ({ date: a.date, title: `Atendimento ${a.status}`, text: `${a.time} · ${modeLabel(a.mode)} · ${a.type}` })),
        ...evolutions.map((e) => ({ date: e.date, title: "Evolução registrada", text: e.text.slice(0, 90) })),
        ...evaluations.map((e) => ({ date: e.date, title: e.kind, text: e.complaint.slice(0, 90) })),
        ...documents.map((d) => ({ date: d.date, title: "Documento publicado", text: d.title })),
        { date: patient.since, title: "Paciente cadastrado", text: `Início do acompanhamento no GN Care` }
      ].sort((a, b) => b.date.localeCompare(a.date));
      return `
        <section class="card pad-lg">
          <h3 class="h-card">Histórico completo</h3>
          <div style="margin-top:20px">
            ${timeline(items.map((i) => ({ title: `${dateFull(i.date)} · ${i.title}`, text: i.text, icon: "•", state: "done" })))}
          </div>
        </section>`;
    }
  };

  return {
    title: patient.name,
    html: `
      ${crumb([{ label: "Pacientes", route: "#/profissional/pacientes" }, { label: patient.name }])}

      <section class="card pad-lg" style="margin-bottom:22px">
        <div class="row-between">
          <div class="item-left">
            ${avatar(patient.initials, { solid: true, size: "lg" })}
            <div>
              <h1 class="h-section">${esc(patient.name)}</h1>
              <p class="muted small" style="margin-top:4px">${esc(patient.condition)} · ${esc(age(patient.birth))} · ${esc(plan ? `Plano ${plan.name}` : "Sem plano")}</p>
              <p class="tiny muted" style="margin-top:4px">${esc(patient.phone)} · ${esc(patient.email || "sem e-mail")}</p>
            </div>
          </div>
          <div class="btn-row">
            ${statusBadge(patient.status)}
            <button class="btn line sm" data-action="agendar">Agendar</button>
            <button class="btn solid sm" data-action="nova-evolucao">Registrar evolução</button>
          </div>
        </div>
      </section>

      ${tabs(RECORD_TABS, tab, { action: "record-tab" })}
      <div id="record-body">${(views[tab] || views.resumo)()}</div>`,
    mount(root, context) {
      root.querySelectorAll('[data-action="record-tab"]').forEach((btn) =>
        btn.addEventListener("click", () => navigate(`#/profissional/pacientes/${patient.id}/prontuario/${btn.dataset.id}`))
      );

      const dataForm = root.querySelector("#patient-data");
      if (dataForm) {
        dataForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          if (!validate(dataForm, { name: "Informe o nome", phone: "Informe o telefone" })) return;
          await proApi.updatePatient(patient.id, readForm(dataForm));
          toast("Dados do paciente atualizados.");
          context.refresh();
        });
      }

      const treatmentForm = root.querySelector("#treatment-form");
      if (treatmentForm) {
        treatmentForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          await proApi.saveTreatment(patient.id, readForm(treatmentForm));
          toast("Plano de tratamento salvo.");
          context.refresh();
        });
      }

      const notesForm = root.querySelector("#notes-form");
      if (notesForm) {
        notesForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          await proApi.updatePatient(patient.id, { notes: readForm(notesForm).notes });
          toast("Observações salvas.");
        });
      }

      root.querySelectorAll("[data-goal]").forEach((range) =>
        range.addEventListener("change", async () => {
          await proApi.updateGoal(patient.id, range.dataset.goal, Number(range.value));
          toast("Meta atualizada.");
          context.refresh();
        })
      );

      root.addEventListener("click", async (e) => {
        const action = e.target.closest("[data-action]");
        if (!action) return;
        const kind = action.dataset.action;

        if (kind === "nova-avaliacao") openEvaluation(patient, context);
        if (kind === "nova-evolucao") openEvolution(patient, context);
        if (kind === "prescrever") openPrescription(patient, library, context);
        if (kind === "agendar") openSchedule(patient, context);
        if (kind === "nova-meta") openGoal(patient, context);
        if (kind === "novo-documento") openDocument(patient, context);

        if (kind === "remover-exercicio") {
          const ok = await confirmDialog({
            title: "Remover exercício",
            text: "O exercício sai do programa do paciente.",
            confirmLabel: "Remover",
            danger: true
          });
          if (!ok) return;
          await proApi.removePrescription(action.dataset.id);
          toast("Exercício removido do programa.");
          context.refresh();
        }

        if (kind === "marcar-realizado") {
          await proApi.setAppointmentStatus(action.dataset.id, "realizado");
          toast("Atendimento marcado como realizado.");
          context.refresh();
        }
      });
    }
  };
}

/* ---------------- formulários do prontuário ---------------- */

function openEvaluation(patient, ctx) {
  modal({
    title: `Avaliação · ${patient.name}`,
    description: "Registro clínico da avaliação fisioterapêutica.",
    wide: true,
    body: `
      <form id="eval-form" class="stack">
        <div class="field-row three">
          ${field({ label: "Data", name: "date", type: "date", value: TODAY })}
          ${field({ label: "Tipo", name: "kind", options: ["Avaliação inicial", "Reavaliação"] })}
          ${field({ label: "Dor (0 a 10)", name: "pain", type: "number", value: "5" })}
        </div>
        ${field({ label: "Queixa principal", name: "complaint", type: "textarea", rows: 2, required: true })}
        ${field({ label: "Histórico / anamnese", name: "history", type: "textarea", rows: 2 })}
        ${field({ label: "Hipótese funcional", name: "hypothesis", type: "textarea", rows: 2 })}
        <div class="field-row">
          ${field({ label: "Amplitude de movimento", name: "rom" })}
          ${field({ label: "Força muscular", name: "strength" })}
        </div>
        ${field({ label: "Testes funcionais", name: "tests" })}
        ${field({ label: "Limitações relatadas", name: "limitations", type: "textarea", rows: 2 })}
        ${field({ label: "Objetivos do paciente", name: "objectives", type: "textarea", rows: 2 })}
        ${field({ label: "Conduta e plano inicial", name: "plan", type: "textarea", rows: 2, required: true })}
      </form>`,
    footer: `
      <button class="btn ghost" data-close>Cancelar</button>
      <button class="btn solid" id="save-eval">Salvar avaliação</button>`,
    onMount(back) {
      back.querySelector("#save-eval").addEventListener("click", async (e) => {
        const form = back.querySelector("#eval-form");
        if (!validate(form, { complaint: "Descreva a queixa principal", plan: "Descreva a conduta" })) return;
        e.currentTarget.disabled = true;
        const data = readForm(form);
        await proApi.saveEvaluation(patient.id, { ...data, pain: Number(data.pain) });
        closeModal();
        toast("Avaliação registrada e publicada nos documentos.");
        ctx.refresh();
      });
    }
  });
}

function openEvolution(patient, ctx) {
  modal({
    title: `Registrar evolução · ${patient.name}`,
    description: "O registro aparece para o paciente na área de evolução.",
    body: `
      <form id="evo-form" class="stack">
        <div class="field-row three">
          ${field({ label: "Data", name: "date", type: "date", value: TODAY })}
          ${field({ label: "Dor (0 a 10)", name: "pain", type: "number", value: "3", required: true })}
          ${field({ label: "Adesão (%)", name: "adherence", type: "number", value: String(patient.adherence || 80), required: true })}
        </div>
        ${field({ label: "Evolução clínica", name: "text", type: "textarea", rows: 3, required: true })}
        ${field({ label: "Conduta", name: "conduct", type: "textarea", rows: 2 })}
        ${field({ label: "Próxima etapa", name: "next" })}
      </form>`,
    footer: `
      <button class="btn ghost" data-close>Cancelar</button>
      <button class="btn solid" id="save-evo">Salvar evolução</button>`,
    onMount(back) {
      back.querySelector("#save-evo").addEventListener("click", async (e) => {
        const form = back.querySelector("#evo-form");
        if (!validate(form, { pain: "Informe a dor", adherence: "Informe a adesão", text: "Descreva a evolução" })) return;
        e.currentTarget.disabled = true;
        await proApi.saveEvolution(patient.id, readForm(form));
        closeModal();
        toast("Evolução registrada.");
        ctx.refresh();
      });
    }
  });
}

function openPrescription(patient, library, ctx) {
  const state = { exerciseId: "" };
  modal({
    title: `Prescrever exercício · ${patient.name}`,
    description: "Busque na biblioteca, configure e adicione ao programa.",
    wide: true,
    body: `
      <div class="stack">
        <div class="field">
          <label for="f-search-ex">1. Buscar exercício</label>
          <input id="f-search-ex" type="search" placeholder="Nome, categoria ou região do corpo">
        </div>
        <div id="ex-results" class="pick-list" style="max-height:230px;overflow:auto"></div>
        <div class="divider"></div>
        <form id="presc-form" class="stack">
          <div class="field-row three">
            ${field({ label: "Séries", name: "sets", type: "number", value: "3" })}
            ${field({ label: "Repetições / tempo", name: "reps", value: "12 repetições" })}
            ${field({ label: "Descanso", name: "rest", value: "60 segundos" })}
          </div>
          ${field({
            label: "Frequência",
            name: "frequency",
            options: ["Diariamente", "1x por semana", "2x por semana", "3x por semana", "4x por semana"],
            value: "3x por semana"
          })}
          ${field({ label: "Orientações", name: "notes", type: "textarea", rows: 2, placeholder: "Ex.: manter o movimento lento na descida" })}
        </form>
      </div>`,
    footer: `
      <button class="btn ghost" data-close>Cancelar</button>
      <button class="btn solid" id="save-presc" disabled>Adicionar ao programa</button>`,
    onMount(back) {
      const results = back.querySelector("#ex-results");
      const search = back.querySelector("#f-search-ex");
      const save = back.querySelector("#save-presc");

      const paint = (term = "") => {
        const list = library.filter((ex) =>
          `${ex.name} ${ex.category} ${ex.area}`.toLowerCase().includes(term.trim().toLowerCase())
        );
        results.innerHTML = list.length
          ? list
              .map(
                (ex) => `
          <button type="button" class="pick ${state.exerciseId === ex.id ? "on" : ""}" data-ex="${esc(ex.id)}">
            <span class="mark" aria-hidden="true">✓</span>
            <span><b>${esc(ex.name)}</b><span>${esc(ex.category)} · ${esc(ex.area)} · ${ex.minutes} min</span></span>
            <span></span>
          </button>`
              )
              .join("")
          : `<p class="muted small">Nenhum exercício encontrado na biblioteca.</p>`;
        results.querySelectorAll("[data-ex]").forEach((btn) =>
          btn.addEventListener("click", () => {
            state.exerciseId = btn.dataset.ex;
            results.querySelectorAll("[data-ex]").forEach((b) => b.classList.toggle("on", b === btn));
            const chosen = library.find((x) => x.id === state.exerciseId);
            back.querySelector("#f-sets").value = chosen.sets;
            back.querySelector("#f-reps").value = chosen.reps;
            save.disabled = false;
          })
        );
      };

      search.addEventListener("input", () => paint(search.value));
      paint();

      save.addEventListener("click", async (e) => {
        if (!state.exerciseId) return;
        e.currentTarget.disabled = true;
        await proApi.prescribe(patient.id, { ...readForm(back.querySelector("#presc-form")), exerciseId: state.exerciseId });
        closeModal();
        toast("Exercício adicionado ao programa do paciente.");
        ctx.refresh();
      });
    }
  });
}

function openSchedule(patient, ctx) {
  modal({
    title: `Agendar · ${patient.name}`,
    body: `
      <form id="sched-form" class="stack">
        <div class="field-row">
          ${field({ label: "Data", name: "date", type: "date", value: addDays(TODAY, 1), required: true })}
          ${field({ label: "Horário", name: "time", type: "time", value: "19:00", required: true })}
        </div>
        <div class="field-row">
          ${field({
            label: "Modalidade",
            name: "mode",
            options: [
              { value: "tele", label: "Teleatendimento" },
              { value: "presencial", label: "Presencial · GN Fisioterapia" }
            ]
          })}
          ${field({ label: "Tipo de atendimento", name: "type", options: ["Acompanhamento", "Avaliação inicial", "Reavaliação", "Retorno"] })}
        </div>
        ${field({ label: "Duração", name: "duration", options: ["30 minutos", "45 minutos", "60 minutos"], value: "45 minutos" })}
        ${field({ label: "Observação", name: "note", type: "textarea", rows: 2 })}
      </form>`,
    footer: `
      <button class="btn ghost" data-close>Cancelar</button>
      <button class="btn solid" id="save-sched">Agendar atendimento</button>`,
    onMount(back) {
      back.querySelector("#save-sched").addEventListener("click", async (e) => {
        const form = back.querySelector("#sched-form");
        if (!validate(form, { date: "Informe a data", time: "Informe o horário" })) return;
        e.currentTarget.disabled = true;
        try {
          await proApi.createAppointment(ctx.session.refId, { ...readForm(form), patientId: patient.id });
          closeModal();
          toast("Atendimento agendado.");
          ctx.refresh();
        } catch (err) {
          toast(err.message, "err");
          e.currentTarget.disabled = false;
        }
      });
    }
  });
}

function openGoal(patient, ctx) {
  modal({
    title: "Nova meta terapêutica",
    body: `
      <form id="goal-form" class="stack">
        ${field({ label: "Meta", name: "title", required: true, placeholder: "Ex.: subir escadas sem apoio" })}
        ${field({ label: "Prazo", name: "horizon", placeholder: "Ex.: 6 semanas" })}
      </form>`,
    footer: `
      <button class="btn ghost" data-close>Cancelar</button>
      <button class="btn solid" id="save-goal">Adicionar meta</button>`,
    onMount(back) {
      back.querySelector("#save-goal").addEventListener("click", async () => {
        const form = back.querySelector("#goal-form");
        if (!validate(form, { title: "Descreva a meta" })) return;
        const data = readForm(form);
        await proApi.addGoal(patient.id, data.title, data.horizon);
        closeModal();
        toast("Meta adicionada ao plano.");
        ctx.refresh();
      });
    }
  });
}

function openDocument(patient, ctx) {
  modal({
    title: "Adicionar documento",
    description: "O documento fica disponível para o paciente.",
    body: `
      <form id="doc-form" class="stack">
        ${field({ label: "Título", name: "title", required: true, placeholder: "Ex.: Programa de exercícios · fase 3" })}
        ${field({ label: "Tipo", name: "kind", options: ["Programa", "Avaliação", "Orientação", "Relatório"] })}
      </form>`,
    footer: `
      <button class="btn ghost" data-close>Cancelar</button>
      <button class="btn solid" id="save-doc">Publicar documento</button>`,
    onMount(back) {
      back.querySelector("#save-doc").addEventListener("click", async () => {
        const form = back.querySelector("#doc-form");
        if (!validate(form, { title: "Informe o título" })) return;
        const data = readForm(form);
        await proApi.addDocument(patient.id, data.title, data.kind);
        closeModal();
        toast("Documento publicado para o paciente.");
        ctx.refresh();
      });
    }
  });
}

/* ---------------- agenda ---------------- */

export async function agenda(ctx) {
  const offset = Number(ctx.query.semana || 0);
  const data = await proApi.agenda(ctx.session.refId, offset);
  const list = await proApi.patients(ctx.session.refId, {});
  const first = data.days[0].date;
  const last = data.days[6].date;

  return {
    title: "Agenda",
    html: `
      ${pageHead({
        title: "Agenda",
        lead: `Semana de ${dateShort(first)} a ${dateShort(last)}.`,
        actions: `
          <button class="btn ghost sm" data-week="${offset - 1}">← Semana anterior</button>
          <button class="btn ghost sm" data-week="0">Hoje</button>
          <button class="btn ghost sm" data-week="${offset + 1}">Próxima semana →</button>
          <button class="btn solid sm" data-action="novo-agendamento">Novo atendimento</button>`
      })}

      ${
        data.pending.length
          ? `<section class="card mint pad-lg" style="margin-bottom:20px">
              <h3 class="h-card">Solicitações aguardando confirmação</h3>
              <div class="stack" style="margin-top:12px">
                ${data.pending
                  .map(
                    (ap) => `
                  <div class="item">
                    <div class="item-left">
                      ${avatar(ap.patientInitials)}
                      <div><b>${esc(ap.patientName)}</b><small>${esc(relativeDay(ap.date, TODAY))} · ${esc(ap.time)} · ${esc(modeLabel(ap.mode))}</small></div>
                    </div>
                    <div class="item-actions">
                      <button class="btn ghost xs" data-action="recusar" data-id="${esc(ap.id)}">Recusar</button>
                      <button class="btn solid xs" data-action="confirmar" data-id="${esc(ap.id)}">Confirmar</button>
                    </div>
                  </div>`
                  )
                  .join("")}
              </div>
            </section>`
          : ""
      }

      <section class="card pad-lg">
        <div class="week">
          ${data.days
            .map(
              (d) => `
            <div class="week-day">
              <b>${weekdayShort(d.date)} · ${dateShort(d.date)}${d.date === TODAY ? " · hoje" : ""}</b>
              ${d.events
                .map(
                  (ap) => `
                <button class="ev ${ap.mode === "presencial" ? "presencial" : ""}" data-route="#/profissional/pacientes/${esc(ap.patientId)}">
                  <b>${esc(ap.time)} · ${esc(ap.patientName)}</b>
                  ${esc(ap.type)}
                </button>`
                )
                .join("")}
              ${d.blocks
                .map(
                  (b) => `
                <button class="ev block" data-action="remover-bloqueio" data-id="${esc(b.id)}">
                  <b>${esc(b.time)} · bloqueado</b>
                  ${esc(b.reason)}
                </button>`
                )
                .join("")}
              ${!d.events.length && !d.blocks.length ? `<span class="tiny muted">Livre</span>` : ""}
            </div>`
            )
            .join("")}
        </div>
      </section>

      <section class="card pad-lg" style="margin-top:20px">
        <div class="card-head">
          <div>
            <h3 class="h-card">Disponibilidade</h3>
            <p class="muted small">Horários oferecidos aos pacientes no agendamento.</p>
          </div>
          <button class="btn line sm" data-action="bloquear">Bloquear horário</button>
        </div>
        <div class="chip-row">
          ${data.availability.slots
            .map((s) => `<span class="chip static">${esc(s)}${data.availability.presencialSlots.includes(s) ? " · presencial" : ""}</span>`)
            .join("")}
        </div>
      </section>`,
    mount(root, context) {
      root.querySelectorAll("[data-week]").forEach((btn) =>
        btn.addEventListener("click", () => navigate(`#/profissional/agenda?semana=${btn.dataset.week}`))
      );

      root.addEventListener("click", async (e) => {
        const action = e.target.closest("[data-action]");
        if (!action) return;
        const kind = action.dataset.action;

        if (kind === "confirmar") {
          await proApi.setAppointmentStatus(action.dataset.id, "confirmado");
          toast("Atendimento confirmado.");
          context.refresh();
        }
        if (kind === "recusar") {
          await proApi.setAppointmentStatus(action.dataset.id, "cancelado");
          toast("Solicitação recusada.");
          context.refresh();
        }
        if (kind === "remover-bloqueio") {
          const ok = await confirmDialog({ title: "Liberar horário", text: "O horário volta a ficar disponível para agendamento.", confirmLabel: "Liberar" });
          if (!ok) return;
          await proApi.removeBlock(context.session.refId, action.dataset.id);
          toast("Horário liberado.");
          context.refresh();
        }
        if (kind === "bloquear") {
          modal({
            title: "Bloquear horário",
            body: `
              <form id="block-form" class="stack">
                <div class="field-row">
                  ${field({ label: "Data", name: "date", type: "date", value: TODAY, required: true })}
                  ${field({ label: "Horário", name: "time", type: "time", value: "14:00", required: true })}
                </div>
                ${field({ label: "Motivo", name: "reason", placeholder: "Ex.: agenda da clínica" })}
              </form>`,
            footer: `<button class="btn ghost" data-close>Cancelar</button><button class="btn solid" id="save-block">Bloquear</button>`,
            onMount(back) {
              back.querySelector("#save-block").addEventListener("click", async () => {
                const form = back.querySelector("#block-form");
                if (!validate(form, { date: "Informe a data", time: "Informe o horário" })) return;
                const d = readForm(form);
                await proApi.blockSlot(context.session.refId, d.date, d.time, d.reason);
                closeModal();
                toast("Horário bloqueado.");
                context.refresh();
              });
            }
          });
        }
        if (kind === "novo-agendamento") {
          modal({
            title: "Novo atendimento",
            body: `
              <form id="new-ap" class="stack">
                ${field({
                  label: "Paciente",
                  name: "patientId",
                  required: true,
                  options: [{ value: "", label: "Selecione" }, ...list.map((p) => ({ value: p.id, label: p.name }))]
                })}
                <div class="field-row">
                  ${field({ label: "Data", name: "date", type: "date", value: addDays(TODAY, 1), required: true })}
                  ${field({ label: "Horário", name: "time", type: "time", value: "19:00", required: true })}
                </div>
                <div class="field-row">
                  ${field({
                    label: "Modalidade",
                    name: "mode",
                    options: [
                      { value: "tele", label: "Teleatendimento" },
                      { value: "presencial", label: "Presencial · GN Fisioterapia" }
                    ]
                  })}
                  ${field({ label: "Tipo", name: "type", options: ["Acompanhamento", "Avaliação inicial", "Reavaliação", "Retorno"] })}
                </div>
                ${field({ label: "Duração", name: "duration", options: ["30 minutos", "45 minutos", "60 minutos"], value: "45 minutos" })}
              </form>`,
            footer: `<button class="btn ghost" data-close>Cancelar</button><button class="btn solid" id="save-ap">Agendar</button>`,
            onMount(back) {
              back.querySelector("#save-ap").addEventListener("click", async (ev) => {
                const form = back.querySelector("#new-ap");
                if (!validate(form, { patientId: "Escolha o paciente", date: "Informe a data", time: "Informe o horário" })) return;
                ev.currentTarget.disabled = true;
                try {
                  await proApi.createAppointment(context.session.refId, readForm(form));
                  closeModal();
                  toast("Atendimento agendado.");
                  context.refresh();
                } catch (err) {
                  toast(err.message, "err");
                  ev.currentTarget.disabled = false;
                }
              });
            }
          });
        }
      });
    }
  };
}

/* ---------------- teleatendimentos do dia ---------------- */

export async function teleList(ctx) {
  const data = await proApi.agenda(ctx.session.refId, 0);
  const today = data.days.find((d) => d.date === TODAY);
  const teleToday = today ? today.events.filter((e) => e.mode === "tele") : [];
  const week = data.days.flatMap((d) => d.events.filter((e) => e.mode === "tele" && d.date !== TODAY));

  return {
    title: "Teleatendimento",
    html: `
      ${pageHead({ title: "Teleatendimento", lead: "Salas virtuais dos seus atendimentos online." })}

      <section class="card pad-lg">
        <h2 class="h-section">Hoje</h2>
        <div class="stack" style="margin-top:16px">
          ${
            teleToday.length
              ? teleToday
                  .map(
                    (ap) => `
              <div class="item">
                <div class="item-left">
                  ${avatar(ap.patientInitials)}
                  <div><b>${esc(ap.time)} · ${esc(ap.patientName)}</b><small>${esc(ap.type)} · ${esc(ap.duration)}</small></div>
                </div>
                <div class="item-actions">
                  ${statusBadge(ap.status)}
                  <button class="btn ghost xs" data-route="#/profissional/pacientes/${esc(ap.patientId)}">Prontuário</button>
                  <button class="btn solid xs" data-route="#/profissional/teleatendimento/${esc(ap.id)}">Abrir sala</button>
                </div>
              </div>`
                  )
                  .join("")
              : emptyState({
                  icon: "🎥",
                  title: "Nenhum teleatendimento hoje",
                  text: "Os atendimentos online da semana aparecem abaixo.",
                  actionLabel: "Ver agenda",
                  route: "#/profissional/agenda"
                })
          }
        </div>
      </section>

      ${
        week.length
          ? `<section class="card pad-lg" style="margin-top:20px">
              <h2 class="h-section">Próximos da semana</h2>
              <div class="stack" style="margin-top:16px">
                ${week
                  .map(
                    (ap) => `
                  <div class="item">
                    <div class="item-left">
                      ${avatar(ap.patientInitials)}
                      <div><b>${esc(ap.patientName)}</b><small>${esc(relativeDay(ap.date, TODAY))} · ${esc(ap.time)}</small></div>
                    </div>
                    <button class="btn line xs" data-route="#/profissional/teleatendimento/${esc(ap.id)}">Abrir sala</button>
                  </div>`
                  )
                  .join("")}
              </div>
            </section>`
          : ""
      }`
  };
}

/* ---------------- biblioteca de exercícios ---------------- */

export async function exerciseLibrary(ctx) {
  const [library, list] = await Promise.all([catalog.exercises(), proApi.patients(ctx.session.refId, {})]);
  const category = ctx.query.cat || "todas";
  const categories = ["todas", ...new Set(library.map((e) => e.category))];
  const filtered = category === "todas" ? library : library.filter((e) => e.category === category);

  return {
    title: "Exercícios",
    html: `
      ${pageHead({ title: "Biblioteca de exercícios", lead: "Base para montar o programa de cada paciente." })}

      <div class="chip-row" style="margin-bottom:20px">
        ${categories.map((c) => `<button class="chip ${c === category ? "on" : ""}" data-cat="${esc(c)}">${esc(c === "todas" ? "Todas" : c)}</button>`).join("")}
      </div>

      <div class="ex-grid">
        ${filtered
          .map(
            (ex) => `
          <article class="ex-card">
            <div class="ex-thumb"><img src="${esc(ex.image)}" alt="Exercício ${esc(ex.name)}" loading="lazy"></div>
            <div class="ex-body">
              <h3 class="h-card">${esc(ex.name)}</h3>
              <div class="ex-meta">
                <span>${esc(ex.category)}</span><span>${esc(ex.area)}</span><span>${ex.minutes} min</span>
              </div>
              <p class="muted small" style="line-height:1.5">${esc(ex.steps[0])}</p>
              <div class="btn-row" style="margin-top:auto">
                <button class="btn line sm" data-detail="${esc(ex.id)}">Detalhes</button>
                <button class="btn solid sm" data-prescribe="${esc(ex.id)}">Prescrever</button>
              </div>
            </div>
          </article>`
          )
          .join("")}
      </div>`,
    mount(root, context) {
      root.querySelectorAll("[data-cat]").forEach((chip) =>
        chip.addEventListener("click", () => navigate(`#/profissional/exercicios?cat=${encodeURIComponent(chip.dataset.cat)}`))
      );

      root.querySelectorAll("[data-detail]").forEach((btn) =>
        btn.addEventListener("click", () => {
          const ex = library.find((x) => x.id === btn.dataset.detail);
          modal({
            title: ex.name,
            description: `${ex.category} · ${ex.area} · ${ex.minutes} minutos`,
            body: `
              <div class="ex-media" style="aspect-ratio:16/9"><img src="${esc(ex.image)}" alt="Exercício ${esc(ex.name)}"></div>
              <ol class="ol" style="margin-top:18px">${ex.steps.map((s) => `<li><span>${esc(s)}</span></li>`).join("")}</ol>
              <div class="card mint flat" style="margin-top:16px"><b>Atenção</b><p class="muted small" style="margin-top:6px">${esc(ex.cautions)}</p></div>`,
            footer: `<button class="btn ghost" data-close>Fechar</button>`
          });
        })
      );

      root.querySelectorAll("[data-prescribe]").forEach((btn) =>
        btn.addEventListener("click", () => {
          const ex = library.find((x) => x.id === btn.dataset.prescribe);
          modal({
            title: `Prescrever ${ex.name}`,
            description: "Escolha o paciente e configure a prescrição.",
            body: `
              <form id="quick-presc" class="stack">
                ${field({
                  label: "Paciente",
                  name: "patientId",
                  required: true,
                  options: [{ value: "", label: "Selecione" }, ...list.map((p) => ({ value: p.id, label: p.name }))]
                })}
                <div class="field-row three">
                  ${field({ label: "Séries", name: "sets", type: "number", value: String(ex.sets) })}
                  ${field({ label: "Repetições / tempo", name: "reps", value: ex.reps })}
                  ${field({ label: "Descanso", name: "rest", value: "60 segundos" })}
                </div>
                ${field({
                  label: "Frequência",
                  name: "frequency",
                  options: ["Diariamente", "1x por semana", "2x por semana", "3x por semana", "4x por semana"],
                  value: "3x por semana"
                })}
                ${field({ label: "Orientações", name: "notes", type: "textarea", rows: 2 })}
              </form>`,
            footer: `<button class="btn ghost" data-close>Cancelar</button><button class="btn solid" id="save-quick">Adicionar ao programa</button>`,
            onMount(back) {
              back.querySelector("#save-quick").addEventListener("click", async (e) => {
                const form = back.querySelector("#quick-presc");
                if (!validate(form, { patientId: "Escolha o paciente" })) return;
                e.currentTarget.disabled = true;
                const data = readForm(form);
                await proApi.prescribe(data.patientId, { ...data, exerciseId: ex.id });
                closeModal();
                toast("Exercício adicionado ao programa do paciente.");
              });
            }
          });
        })
      );
    }
  };
}

/* ---------------- evoluções ---------------- */

export async function evolutions(ctx) {
  const list = await proApi.patients(ctx.session.refId, {});
  const selected = ctx.query.paciente || (list[0] && list[0].id) || "";
  const data = selected ? await proApi.patient(selected) : null;

  if (!list.length) {
    return {
      title: "Evoluções",
      html: `
        ${pageHead({ title: "Evoluções", lead: "Registros clínicos dos seus pacientes." })}
        ${emptyState({ icon: "📈", title: "Sem pacientes na carteira", text: "Adicione um paciente para registrar evoluções.", actionLabel: "Ir para pacientes", route: "#/profissional/pacientes" })}`
    };
  }

  const painPoints = data ? [...data.evolutions].reverse().map((e) => ({ label: dateShort(e.date), value: e.pain })) : [];

  return {
    title: "Evoluções",
    html: `
      ${pageHead({
        title: "Evoluções",
        lead: "Acompanhe os registros clínicos por paciente.",
        actions: `<button class="btn solid" data-action="nova-evolucao">Registrar evolução</button>`
      })}

      <div class="card pad-lg" style="margin-bottom:20px">
        <div class="field" style="max-width:360px">
          <label for="f-paciente">Paciente</label>
          <select id="f-paciente">
            ${list.map((p) => `<option value="${esc(p.id)}" ${p.id === selected ? "selected" : ""}>${esc(p.name)}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="grid g-main">
        <section class="card pad-lg">
          <h2 class="h-section">Registros de ${esc(data.patient.name)}</h2>
          <div class="stack" style="margin-top:16px">
            ${
              data.evolutions.length
                ? data.evolutions
                    .map(
                      (e) => `
                <article class="timeline-body">
                  <div class="row-between">
                    <b>${esc(dateFull(e.date))}</b>
                    <span>${badge(`Dor ${e.pain}/10`, e.pain > 5 ? "gold" : "")} ${badge(`Adesão ${e.adherence}%`, "quiet")}</span>
                  </div>
                  <p class="muted small" style="margin-top:10px;line-height:1.55">${esc(e.text)}</p>
                </article>`
                    )
                    .join("")
                : emptyState({ icon: "📈", title: "Nenhuma evolução", text: "Registre a primeira evolução deste paciente.", actionLabel: "Registrar evolução", action: "nova-evolucao" })
            }
          </div>
        </section>

        <aside class="stack-lg">
          <section class="card">
            <h3 class="h-card">Dor</h3>
            <div style="margin-top:14px">${painPoints.length > 1 ? lineChart(painPoints, { invert: true }) : `<p class="muted small">Sem série suficiente.</p>`}</div>
          </section>
          <section class="card">
            <h3 class="h-card">Adesão por exercício</h3>
            <div class="stack" style="margin-top:14px">
              ${data.exercises.length ? data.exercises.map((ex) => meter(ex.name, ex.adherence)).join("") : `<p class="muted small">Sem programa ativo.</p>`}
            </div>
          </section>
          <button class="btn line block" data-route="#/profissional/pacientes/${esc(data.patient.id)}">Abrir prontuário</button>
        </aside>
      </div>`,
    mount(root, context) {
      root.querySelector("#f-paciente").addEventListener("change", (e) =>
        navigate(`#/profissional/evolucao?paciente=${e.target.value}`)
      );
      root.addEventListener("click", (e) => {
        if (e.target.closest('[data-action="nova-evolucao"]')) openEvolution(data.patient, context);
      });
    }
  };
}

/* ---------------- perfil e configurações ---------------- */

export async function profile(ctx) {
  const data = await proApi.dashboard(ctx.session.refId);
  const pro = data.professional;
  const conf = (await proApi.agenda(ctx.session.refId, 0)).availability;

  return {
    title: "Meu perfil",
    html: `
      ${pageHead({ title: "Meu perfil", lead: "Dados profissionais, disponibilidade e preferências." })}

      <div class="grid g-main">
        <section class="card pad-lg">
          <h2 class="h-section">Dados profissionais</h2>
          <form id="pro-form" class="stack" style="margin-top:18px">
            <div class="field-row">
              ${field({ label: "Nome profissional", name: "name", value: pro.name, required: true })}
              ${field({ label: "CREFITO", name: "crefito", value: pro.crefito, required: true })}
            </div>
            ${field({ label: "Especialidades", name: "specialties", value: pro.specialties.join(", "), hint: "Separe por vírgula" })}
            <div class="field-row">
              ${field({ label: "Modalidade", name: "modality", value: pro.modality, options: ["Teleatendimento", "Teleatendimento + Presencial", "Presencial"] })}
              ${field({ label: "Cidade", name: "city", value: pro.city })}
            </div>
            ${field({ label: "Experiência", name: "experience", type: "textarea", rows: 2, value: pro.experience })}
            ${field({ label: "Apresentação", name: "bio", type: "textarea", rows: 3, value: pro.bio })}
            ${field({ label: "Disponibilidade (texto do perfil)", name: "availabilityNote", value: pro.availabilityNote })}
            <div class="btn-row"><button class="btn solid" type="submit">Salvar perfil</button></div>
          </form>
        </section>

        <div class="stack-lg">
          <section class="card">
            <h3 class="h-card">Horários oferecidos</h3>
            <p class="muted small" style="margin-top:6px">Clique para ativar ou desativar um horário.</p>
            <div class="chip-row" style="margin-top:14px">
              ${["08:00", "09:00", "10:30", "14:00", "15:30", "17:00", "19:00", "20:00", "21:00"]
                .map((s) => `<button class="chip ${conf.slots.includes(s) ? "on" : ""}" data-slot="${s}">${s}</button>`)
                .join("")}
            </div>
            <div class="divider"></div>
            <h3 class="h-card">Dias de atendimento</h3>
            <div class="chip-row" style="margin-top:14px">
              ${["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
                .map((d, i) => `<button class="chip ${conf.weekdays.includes(i) ? "on" : ""}" data-weekday="${i}">${d}</button>`)
                .join("")}
            </div>
          </section>

          <section class="card">
            <h3 class="h-card">Seu perfil público</h3>
            <p class="muted small" style="margin-top:8px">É a página que o paciente vê antes de agendar.</p>
            <button class="btn line block" style="margin-top:14px" data-route="#/profissional/perfil-publico">Editar perfil público</button>
          </section>
        </div>
      </div>`,
    mount(root, context) {
      const form = root.querySelector("#pro-form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validate(form, { name: "Informe seu nome", crefito: "Informe o CREFITO" })) return;
        const data2 = readForm(form);
        await proApi.updateProfessional(pro.id, {
          ...data2,
          specialties: data2.specialties.split(",").map((s) => s.trim()).filter(Boolean)
        });
        toast("Perfil atualizado.");
        context.refresh();
      });

      const slots = () => [...root.querySelectorAll("[data-slot].on")].map((b) => b.dataset.slot);
      const weekdays = () => [...root.querySelectorAll("[data-weekday].on")].map((b) => Number(b.dataset.weekday));

      root.querySelectorAll("[data-slot],[data-weekday]").forEach((chip) =>
        chip.addEventListener("click", async () => {
          chip.classList.toggle("on");
          await proApi.setAvailability(pro.id, slots(), conf.presencialSlots, weekdays());
          toast("Disponibilidade atualizada.");
        })
      );
    }
  };
}

export async function publicProfileEditor(ctx) {
  const data = await proApi.dashboard(ctx.session.refId);
  const pro = data.professional;
  const shareUrl = `${window.location.origin}/app/#/p/${pro.slug}`;

  return {
    title: "Perfil público",
    html: `
      ${pageHead({
        title: "Meu perfil público",
        lead: "A página que seus pacientes veem e que você pode divulgar.",
        actions: `
          <button class="btn ghost" data-route="#/p/${esc(pro.slug)}">Ver como paciente</button>
          <button class="btn solid" data-action="compartilhar">Compartilhar</button>`
      })}

      <div class="grid g-main">
        <section class="card pad-lg">
          <h2 class="h-section">Conteúdo do perfil</h2>
          <form id="public-form" class="stack" style="margin-top:18px">
            ${field({ label: "Apresentação", name: "bio", type: "textarea", rows: 4, value: pro.bio })}
            ${field({ label: "Experiência", name: "experience", type: "textarea", rows: 3, value: pro.experience })}
            ${field({ label: "Especialidades", name: "specialties", value: pro.specialties.join(", "), hint: "Separe por vírgula" })}
            ${field({ label: "Disponibilidade", name: "availabilityNote", value: pro.availabilityNote })}
            <div class="btn-row"><button class="btn solid" type="submit">Publicar alterações</button></div>
          </form>
        </section>

        <div class="stack-lg">
          <section class="card">
            <h3 class="h-card">Prévia</h3>
            <div class="pubhero" style="padding:24px;margin-top:14px">
              <b style="font-size:18px">${esc(pro.name)}</b>
              <p style="margin-top:6px">${esc(pro.crefito)} · ${esc(pro.city)}</p>
              <p style="margin-top:10px;font-size:14px">${esc(pro.bio)}</p>
            </div>
          </section>

          <section class="card">
            <h3 class="h-card">Link para divulgar</h3>
            <p class="muted small" style="margin-top:8px;word-break:break-all">${esc(shareUrl)}</p>
            <div class="btn-row" style="margin-top:14px">
              <button class="btn line sm" data-action="copiar">Copiar link</button>
              <button class="btn soft sm" data-action="whatsapp">Enviar no WhatsApp</button>
            </div>
          </section>

          <section class="card">
            <h3 class="h-card">Indicadores do perfil</h3>
            <div class="stack" style="margin-top:14px">
              ${meter("Avaliação", (pro.rating / 5) * 100)}
              <p class="tiny muted">⭐ ${pro.rating} · ${pro.activePatients} pacientes ativos (dados de demonstração)</p>
            </div>
          </section>
        </div>
      </div>`,
    mount(root, context) {
      const form = root.querySelector("#public-form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const d = readForm(form);
        await proApi.updateProfessional(pro.id, {
          ...d,
          specialties: d.specialties.split(",").map((s) => s.trim()).filter(Boolean)
        });
        toast("Perfil público atualizado.");
        context.refresh();
      });

      root.addEventListener("click", (e) => {
        const action = e.target.closest("[data-action]");
        if (!action) return;
        if (action.dataset.action === "copiar" || action.dataset.action === "compartilhar") {
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => toast("Link copiado. Cole no Instagram ou no WhatsApp."))
            .catch(() => toast(shareUrl, "warn"));
        }
        if (action.dataset.action === "whatsapp") {
          window.open(`https://wa.me/?text=${encodeURIComponent(`Conheça meu perfil no GN Care: ${shareUrl}`)}`, "_blank", "noopener");
        }
      });
    }
  };
}
