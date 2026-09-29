/* Área do paciente: tratamento, exercícios, consultas, evolução, documentos e perfil. */

import { patientApi, catalog, demo, dayISO, addDays } from "../api.js";
import { pageHead, crumb } from "../layout.js";
import { navigate } from "../router.js";
import {
  appointmentCard,
  avatar,
  badge,
  barChart,
  confirmDialog,
  dateFull,
  dateShort,
  emptyState,
  esc,
  exerciseCard,
  field,
  lineChart,
  meter,
  modeLabel,
  modal,
  money,
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

/* ---------------- início ---------------- */

export async function home(ctx) {
  const data = await patientApi.overview(ctx.session.refId);
  const { patient, plan, professional, treatment, nextAppointment, exercises, lastEvolution } = data;
  const pending = exercises.filter((e) => e.status !== "done");
  const done = exercises.length - pending.length;
  const painSeries = [...data.evolution].reverse().map((e) => ({ label: dateShort(e.date), value: e.pain }));

  return {
    title: "Início",
    unread: data.notifications.filter((n) => !n.read).length,
    html: `
      ${pageHead({
        title: `${greeting()}, ${esc(patient.name.split(" ")[0])}`,
        lead: "Seu cuidado hoje: o que já está agendado e o que falta fazer.",
        actions: `<button class="btn line" data-route="#/paciente/consultas/agendar">Agendar atendimento</button>`
      })}

      <div class="grid g-4" style="margin-bottom:22px">
        ${stat({
          icon: "📅",
          value: nextAppointment ? relativeDay(nextAppointment.date, TODAY) : "Sem data",
          label: nextAppointment ? `Próximo atendimento às ${nextAppointment.time}` : "Nenhum atendimento agendado"
        })}
        ${stat({ icon: "🏃", value: `${done}/${exercises.length}`, label: "Exercícios concluídos do programa" })}
        ${stat({ icon: "📈", value: lastEvolution ? `${lastEvolution.pain}/10` : "—", label: "Nível de dor no último registro" })}
        ${stat({
          icon: "🏥",
          value: plan ? `${Math.max(0, plan.tele - patient.teleUsed)}` : "—",
          label: plan ? `Teleconsultas restantes no plano ${plan.name}` : "Plano a definir"
        })}
      </div>

      <div class="grid g-main">
        <div class="stack-lg">
          <section class="card pad-lg">
            <div class="card-head">
              <div>
                <h2 class="h-section">Próxima consulta</h2>
                <p class="muted small">Entre na sala alguns minutos antes do horário.</p>
              </div>
              <button class="btn ghost sm" data-route="#/paciente/consultas">Ver todas</button>
            </div>
            ${
              nextAppointment
                ? `
              <div class="item">
                <div class="item-left">
                  ${avatar(nextAppointment.professionalInitials, { solid: true })}
                  <div>
                    <b>${esc(nextAppointment.professionalName)}</b>
                    <small>${esc(relativeDay(nextAppointment.date, TODAY))} · ${esc(nextAppointment.time)} · ${esc(modeLabel(nextAppointment.mode))}</small>
                    <small>${esc(nextAppointment.type)} · ${esc(nextAppointment.duration)}</small>
                  </div>
                </div>
                <div class="item-actions">
                  ${statusBadge(nextAppointment.status)}
                  ${
                    nextAppointment.mode === "tele"
                      ? `<button class="btn solid sm" data-route="#/paciente/teleatendimento/${esc(nextAppointment.id)}">Entrar na sala</button>`
                      : `<span class="badge quiet">GN Fisioterapia</span>`
                  }
                </div>
              </div>`
                : emptyState({
                    icon: "📅",
                    title: "Você ainda não tem atendimento marcado",
                    text: "Escolha um dia e um horário com seu fisioterapeuta para começar.",
                    actionLabel: "Agendar atendimento",
                    route: "#/paciente/consultas/agendar"
                  })
            }
          </section>

          <section class="card pad-lg">
            <div class="card-head">
              <div>
                <h2 class="h-section">Exercícios de hoje</h2>
                <p class="muted small">${pending.length ? `${pending.length} exercício(s) para fazer` : "Tudo concluído por hoje"}</p>
              </div>
              <button class="btn ghost sm" data-route="#/paciente/exercicios">Ver programa</button>
            </div>
            ${
              exercises.length === 0
                ? emptyState({
                    icon: "🏃",
                    title: "Seu programa ainda não foi montado",
                    text: "Depois da avaliação inicial, seu fisioterapeuta publica os exercícios aqui.",
                    actionLabel: "Falar com meu fisioterapeuta",
                    route: "#/paciente/fisioterapeuta"
                  })
                : pending.length === 0
                ? `<div class="card mint flat"><b>Programa do dia concluído.</b><p class="muted" style="margin-top:6px">Sua adesão está sendo registrada para o acompanhamento.</p></div>`
                : pending
                    .slice(0, 3)
                    .map(
                      (ex) => `
                <div class="item">
                  <div class="item-left">
                    <div class="avatar" aria-hidden="true">${ex.category[0]}</div>
                    <div>
                      <b>${esc(ex.name)}</b>
                      <small>${ex.sets} séries · ${esc(ex.reps)} · ${esc(ex.frequency)}</small>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button class="btn ghost xs" data-route="#/paciente/exercicios/${esc(ex.id)}">Ver</button>
                    <button class="btn solid xs" data-action="concluir" data-id="${esc(ex.id)}">Concluir</button>
                  </div>
                </div>`
                    )
                    .join("")
            }
          </section>

          <section class="card pad-lg">
            <div class="card-head">
              <div>
                <h2 class="h-section">Seu progresso</h2>
                <p class="muted small">Dor registrada pelo fisioterapeuta nas últimas consultas.</p>
              </div>
              <button class="btn ghost sm" data-route="#/paciente/evolucao">Ver evolução</button>
            </div>
            ${painSeries.length > 1 ? lineChart(painSeries, { invert: true, label: "Evolução da dor" }) : `<p class="muted small">Ainda não há registros suficientes.</p>`}
            <div class="divider"></div>
            ${meter("Adesão ao programa", patient.adherence)}
          </section>
        </div>

        <div class="stack-lg">
          <section class="card">
            <h3 class="h-card">Seu plano</h3>
            ${
              plan
                ? `
              <p class="muted small" style="margin-top:6px">${esc(plan.name)}</p>
              <div class="strong-num" style="margin:8px 0 14px">${money(plan.price)}<span class="small muted">/mês</span></div>
              ${progress((patient.teleUsed / plan.tele) * 100)}
              <p class="small muted" style="margin-top:8px">${patient.teleUsed} de ${plan.tele} teleconsultas utilizadas</p>
              ${plan.presencial ? `<div style="margin-top:12px">${badge(`${plan.presencial} presenciais na GN`, "gold")}</div>` : ""}
              <div class="divider"></div>
              <div class="stack" style="gap:8px">
                ${plan.features.map((f) => `<span class="small muted">✓ ${esc(f)}</span>`).join("")}
              </div>`
                : `<p class="muted small" style="margin-top:8px">Plano ainda não definido.</p>`
            }
          </section>

          ${
            professional
              ? `
            <section class="card">
              <h3 class="h-card">Seu fisioterapeuta</h3>
              <div class="item-left" style="margin-top:14px">
                ${avatar(professional.initials, { solid: true, size: "lg" })}
                <div>
                  <b>${esc(professional.name)}</b>
                  <small>${esc(professional.crefito)}</small>
                  <small>${esc(professional.specialties.join(" · "))}</small>
                </div>
              </div>
              <button class="btn line block" data-route="#/paciente/fisioterapeuta" style="margin-top:16px">Ver perfil</button>
            </section>`
              : ""
          }

          <section class="card">
            <h3 class="h-card">Sua jornada</h3>
            <div style="margin-top:16px">
              ${timeline([
                { title: "Avaliação inicial", text: `Concluída · ${dateShort(patient.since)}`, icon: "✓", state: "done" },
                {
                  title: "Programa de exercícios",
                  text: treatment && treatment.phase ? treatment.phase : "Em montagem",
                  icon: "✓",
                  state: "done"
                },
                {
                  title: "Próximo atendimento",
                  text: nextAppointment ? `${relativeDay(nextAppointment.date, TODAY)} · ${nextAppointment.time}` : "A agendar",
                  icon: "●",
                  state: "next"
                },
                { title: "Próxima reavaliação", text: treatment ? treatment.duration || "A definir" : "A definir", icon: "→" }
              ])}
            </div>
          </section>

          <section>
            <h3 class="h-card" style="margin-bottom:12px">Atalhos</h3>
            <div class="grid g-2">
              ${tile({ icon: "🎯", title: "Tratamento", text: "Objetivo e metas", route: "#/paciente/tratamento" })}
              ${tile({ icon: "🏃", title: "Exercícios", text: "Seu programa", route: "#/paciente/exercicios" })}
              ${tile({ icon: "📅", title: "Consultas", text: "Agenda e histórico", route: "#/paciente/consultas" })}
              ${tile({ icon: "📄", title: "Documentos", text: "Orientações", route: "#/paciente/documentos" })}
            </div>
          </section>
        </div>
      </div>`,
    mount(root, context) {
      bindNotifications(root, data.notifications);
      root.addEventListener("click", async (e) => {
        const btn = e.target.closest('[data-action="concluir"]');
        if (!btn) return;
        btn.disabled = true;
        await patientApi.setExerciseStatus(btn.dataset.id, "done");
        toast("Exercício concluído. Sua adesão foi atualizada.");
        context.refresh();
      });
    }
  };
}

function bindNotifications(root, list) {
  const btn = document.querySelector('[data-action="notificacoes"]');
  if (!btn) return;
  btn.onclick = () => {
    modal({
      title: "Notificações",
      description: "Avisos do seu acompanhamento no GN Care.",
      body: list.length
        ? `<div class="stack">${list
            .map(
              (n) => `
          <div class="item">
            <div class="item-left">
              <div class="avatar sm" aria-hidden="true">${n.read ? "○" : "●"}</div>
              <div><b>${esc(n.text)}</b><small>${esc(dateFull(n.date))}</small></div>
            </div>
          </div>`
            )
            .join("")}</div>`
        : emptyState({ icon: "🔔", title: "Sem novidades", text: "Você será avisado por aqui sobre consultas e mudanças no programa." }),
      footer: `<button class="btn ghost" data-close>Fechar</button>`
    });
  };
}

/* ---------------- tratamento ---------------- */

export async function treatment(ctx) {
  const data = await patientApi.treatment(ctx.session.refId);
  const { treatment: plan, professional, exercises, evolutions, evaluations } = data;

  if (!plan || !plan.objective) {
    return {
      title: "Meu tratamento",
      html: `
        ${pageHead({ title: "Meu tratamento", lead: "Objetivo, metas e programa definidos com seu fisioterapeuta." })}
        ${emptyState({
          icon: "🎯",
          title: "Seu plano de tratamento ainda não foi definido",
          text: "Ele é criado pelo fisioterapeuta logo após a avaliação inicial.",
          actionLabel: "Agendar avaliação",
          route: "#/paciente/consultas/agendar"
        })}`
    };
  }

  return {
    title: "Meu tratamento",
    html: `
      ${pageHead({
        title: "Meu tratamento",
        lead: plan.objective,
        actions: `<button class="btn line" data-route="#/paciente/exercicios">Ir para os exercícios</button>`
      })}

      <div class="grid g-main">
        <div class="stack-lg">
          <section class="card pad-lg">
            <h2 class="h-section">Metas</h2>
            <p class="muted small" style="margin-top:6px">Acompanhadas pelo seu fisioterapeuta a cada reavaliação.</p>
            <div class="stack" style="margin-top:18px">
              ${
                plan.goals.length
                  ? plan.goals
                      .map(
                        (g) => `
                  <div>
                    ${meter(g.title, g.progress)}
                    <p class="tiny muted" style="margin-top:6px">${esc(g.horizon)}</p>
                  </div>`
                      )
                      .join("")
                  : `<p class="muted small">Nenhuma meta registrada ainda.</p>`
              }
            </div>
          </section>

          <section class="card pad-lg">
            <h2 class="h-section">Atividades do programa</h2>
            <div class="stack" style="margin-top:16px">
              ${exercises
                .map(
                  (ex) => `
                <div class="item">
                  <div class="item-left">
                    <div class="avatar" aria-hidden="true">${esc(ex.category[0])}</div>
                    <div><b>${esc(ex.name)}</b><small>${ex.sets} séries · ${esc(ex.reps)} · ${esc(ex.frequency)}</small></div>
                  </div>
                  <div class="item-actions">
                    ${statusBadge(ex.status)}
                    <button class="btn ghost xs" data-route="#/paciente/exercicios/${esc(ex.id)}">Abrir</button>
                  </div>
                </div>`
                )
                .join("")}
            </div>
          </section>

          <section class="card pad-lg">
            <h2 class="h-section">Histórico do tratamento</h2>
            <div style="margin-top:18px">
              ${timeline(
                [
                  ...evaluations.map((e) => ({ title: e.kind, text: `${dateFull(e.date)} · dor ${e.pain}/10`, icon: "📝", state: "done" })),
                  ...evolutions.slice(0, 4).map((e) => ({ title: "Evolução registrada", text: `${dateFull(e.date)} · dor ${e.pain}/10`, icon: "✓", state: "done" }))
                ].slice(0, 6)
              )}
            </div>
          </section>
        </div>

        <div class="stack-lg">
          <section class="card">
            <h3 class="h-card">Resumo</h3>
            <dl class="kv" style="grid-template-columns:1fr;margin-top:14px">
              <div><dt>Fase atual</dt><dd>${esc(plan.phase)}</dd></div>
              <div><dt>Frequência</dt><dd>${esc(plan.frequency || "A definir")}</dd></div>
              <div><dt>Duração prevista</dt><dd>${esc(plan.duration || "A definir")}</dd></div>
              <div><dt>Início</dt><dd>${esc(dateFull(plan.startedAt))}</dd></div>
            </dl>
          </section>

          ${
            professional
              ? `<section class="card">
                  <h3 class="h-card">Responsável</h3>
                  <div class="item-left" style="margin-top:14px">
                    ${avatar(professional.initials, { solid: true })}
                    <div><b>${esc(professional.name)}</b><small>${esc(professional.crefito)}</small></div>
                  </div>
                  <button class="btn line block" style="margin-top:16px" data-route="#/paciente/fisioterapeuta">Ver fisioterapeuta</button>
                </section>`
              : ""
          }

          ${plan.notes ? `<section class="card mint"><h3 class="h-card">Observações</h3><p class="muted" style="margin-top:8px;line-height:1.55">${esc(plan.notes)}</p></section>` : ""}
        </div>
      </div>`
  };
}

/* ---------------- exercícios ---------------- */

export async function exercises(ctx) {
  const list = await patientApi.exercises(ctx.session.refId);
  const filter = ctx.query.status || "todos";
  const filtered = filter === "todos" ? list : list.filter((e) => e.status === filter);
  const done = list.filter((e) => e.status === "done").length;

  return {
    title: "Exercícios",
    html: `
      ${pageHead({
        title: "Meus exercícios",
        lead: "Programa prescrito pelo seu fisioterapeuta.",
        actions: badge(`${done} de ${list.length} concluídos`, "gold")
      })}

      <div class="chip-row" style="margin-bottom:20px">
        ${[
          ["todos", "Todos"],
          ["pending", "Pendentes"],
          ["doing", "Em andamento"],
          ["done", "Concluídos"]
        ]
          .map(([id, label]) => `<button class="chip ${filter === id ? "on" : ""}" data-filter="${id}">${label}</button>`)
          .join("")}
      </div>

      ${
        list.length === 0
          ? emptyState({
              icon: "🏃",
              title: "Nenhum exercício prescrito",
              text: "Assim que o programa for publicado, ele aparece aqui com séries, repetições e orientações.",
              actionLabel: "Ver meu tratamento",
              route: "#/paciente/tratamento"
            })
          : filtered.length === 0
          ? emptyState({
              icon: "🔎",
              title: "Nada neste filtro",
              text: "Troque o filtro para ver os outros exercícios do seu programa.",
              actionLabel: "Ver todos",
              action: "limpar-filtro"
            })
          : `<div class="ex-grid">${filtered.map((ex) => exerciseCard(ex)).join("")}</div>`
      }`,
    mount(root, context) {
      root.querySelectorAll("[data-filter]").forEach((chip) => {
        chip.addEventListener("click", () => navigate(`#/paciente/exercicios?status=${chip.dataset.filter}`));
      });
      root.addEventListener("click", async (e) => {
        const limpar = e.target.closest('[data-action="limpar-filtro"]');
        if (limpar) {
          navigate("#/paciente/exercicios");
          return;
        }
        const btn = e.target.closest('[data-action="concluir"],[data-action="refazer"]');
        if (!btn) return;
        btn.disabled = true;
        const status = btn.dataset.action === "concluir" ? "done" : "pending";
        await patientApi.setExerciseStatus(btn.dataset.id, status);
        toast(status === "done" ? "Exercício concluído." : "Exercício reaberto.");
        context.refresh();
      });
    }
  };
}

export async function exerciseDetail(ctx) {
  const ex = await patientApi.exercise(ctx.params.id);

  return {
    title: ex.name,
    html: `
      ${crumb([{ label: "Exercícios", route: "#/paciente/exercicios" }, { label: ex.name }])}
      ${pageHead({ title: ex.name, lead: `${ex.category} · ${ex.area}`, actions: statusBadge(ex.status) })}

      <div class="ex-hero">
        <div class="stack-lg">
          <div class="ex-media">
            <img src="${esc(ex.image)}" alt="Demonstração do exercício ${esc(ex.name)}">
            <button class="play" data-action="play" aria-label="Reproduzir demonstração">▶</button>
          </div>

          <section class="card pad-lg">
            <h2 class="h-section">Como fazer</h2>
            <ol class="ol" style="margin-top:16px">
              ${ex.steps.map((s) => `<li><span>${esc(s)}</span></li>`).join("")}
            </ol>
          </section>

          ${ex.cautions ? `<div class="card mint"><b>Atenção</b><p class="muted" style="margin-top:6px;line-height:1.55">${esc(ex.cautions)}</p></div>` : ""}
        </div>

        <div class="stack-lg">
          <section class="card">
            <h3 class="h-card">Prescrição</h3>
            <dl class="kv" style="grid-template-columns:1fr 1fr;margin-top:14px">
              <div><dt>Séries</dt><dd>${ex.sets}</dd></div>
              <div><dt>Repetições</dt><dd>${esc(ex.reps)}</dd></div>
              <div><dt>Frequência</dt><dd>${esc(ex.frequency)}</dd></div>
              <div><dt>Descanso</dt><dd>${esc(ex.rest)}</dd></div>
            </dl>
            ${ex.notes ? `<p class="muted small" style="margin-top:14px;line-height:1.5"><b>Orientações:</b> ${esc(ex.notes)}</p>` : ""}
            <div class="divider"></div>
            ${meter("Adesão", ex.adherence)}
            <p class="tiny muted" style="margin-top:8px">Última execução: ${ex.lastDone ? dateFull(ex.lastDone) : "ainda não registrada"}</p>
          </section>

          <section class="card">
            <h3 class="h-card">Registrar execução</h3>
            <p class="muted small" style="margin-top:6px">Marque quando terminar as séries de hoje.</p>
            <div class="btn-row" style="margin-top:16px">
              ${
                ex.status === "done"
                  ? `<button class="btn ghost block" data-action="status" data-status="pending">Reabrir exercício</button>`
                  : `
                  ${ex.status !== "doing" ? `<button class="btn line block" data-action="status" data-status="doing">Iniciar</button>` : ""}
                  <button class="btn solid block" data-action="status" data-status="done">Concluir exercício</button>`
              }
            </div>
          </section>

          <button class="btn ghost block" data-route="#/paciente/exercicios">Voltar ao programa</button>
        </div>
      </div>`,
    mount(root, context) {
      const play = root.querySelector('[data-action="play"]');
      if (play) play.addEventListener("click", () => toast("Vídeo de demonstração indisponível no protótipo.", "warn"));

      root.querySelectorAll('[data-action="status"]').forEach((btn) => {
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          const status = btn.dataset.status;
          await patientApi.setExerciseStatus(ex.id, status);
          toast(
            status === "done" ? "Exercício concluído. Progresso atualizado." : status === "doing" ? "Exercício iniciado." : "Exercício reaberto."
          );
          context.refresh();
        });
      });
    }
  };
}

/* ---------------- consultas ---------------- */

export async function appointments(ctx) {
  const data = await patientApi.appointments(ctx.session.refId);

  return {
    title: "Consultas",
    html: `
      ${pageHead({
        title: "Consultas",
        lead: "Próximos atendimentos, histórico e agendamento.",
        actions: `<button class="btn solid" data-route="#/paciente/consultas/agendar">Agendar atendimento</button>`
      })}

      <div class="grid g-main">
        <section class="card pad-lg">
          <h2 class="h-section">Próximos atendimentos</h2>
          <div class="stack" style="margin-top:16px">
            ${
              data.next.length
                ? data.next.map((ap) => appointmentCard(ap, TODAY, { role: "paciente" })).join("")
                : emptyState({
                    icon: "📅",
                    title: "Nenhum atendimento agendado",
                    text: "Escolha um dia e um horário disponível do seu fisioterapeuta.",
                    actionLabel: "Agendar agora",
                    route: "#/paciente/consultas/agendar"
                  })
            }
          </div>
        </section>

        <section class="card pad-lg">
          <h2 class="h-section">Histórico</h2>
          <div class="stack" style="margin-top:16px">
            ${
              data.past.length
                ? data.past
                    .map(
                      (ap) => `
                <div class="item">
                  <div class="item-left">
                    ${avatar(ap.professionalInitials)}
                    <div>
                      <b>${esc(dateFull(ap.date))} · ${esc(ap.time)}</b>
                      <small>${esc(modeLabel(ap.mode))} · ${esc(ap.type)}</small>
                    </div>
                  </div>
                  ${statusBadge(ap.status)}
                </div>`
                    )
                    .join("")
                : `<p class="muted small">Nenhum atendimento realizado ainda.</p>`
            }
          </div>
        </section>
      </div>`,
    mount(root, context) {
      root.addEventListener("click", async (e) => {
        const cancel = e.target.closest('[data-action="cancelar"]');
        const reschedule = e.target.closest('[data-action="remarcar"]');

        if (cancel) {
          const ok = await confirmDialog({
            title: "Cancelar atendimento",
            text: "O horário volta para a agenda do fisioterapeuta. Você pode agendar outro depois.",
            confirmLabel: "Cancelar atendimento",
            danger: true
          });
          if (!ok) return;
          await patientApi.cancel(cancel.dataset.id);
          toast("Atendimento cancelado.");
          context.refresh();
        }

        if (reschedule) {
          navigate(`#/paciente/consultas/agendar?remarcar=${reschedule.dataset.id}`);
        }
      });
    }
  };
}

export async function booking(ctx) {
  const [{ professional }, pros] = await Promise.all([
    patientApi.professional(ctx.session.refId),
    catalog.professionals()
  ]);
  const rescheduleId = ctx.query.remarcar || "";
  const state = {
    professionalId: professional ? professional.id : pros[0].id,
    mode: "tele",
    date: "",
    time: ""
  };

  const days = Array.from({ length: 21 }, (_, i) => addDays(TODAY, i));

  return {
    title: rescheduleId ? "Remarcar atendimento" : "Agendar atendimento",
    html: `
      ${crumb([{ label: "Consultas", route: "#/paciente/consultas" }, { label: rescheduleId ? "Remarcar" : "Agendar" }])}
      ${pageHead({
        title: rescheduleId ? "Remarcar atendimento" : "Agende seu atendimento",
        lead: "Profissional, modalidade, data e horário. A confirmação é feita pelo fisioterapeuta."
      })}

      <div class="grid g-main">
        <div class="stack-lg">
          <section class="card pad-lg">
            <h2 class="h-section">1. Profissional</h2>
            <div class="pick-list" style="margin-top:16px">
              ${pros
                .map(
                  (p) => `
                <button type="button" class="pick ${state.professionalId === p.id ? "on" : ""}" data-pro="${esc(p.id)}">
                  ${avatar(p.initials, { solid: true })}
                  <span><b>${esc(p.name)}</b><span>${esc(p.specialties.join(" · "))} · ${esc(p.modality)}</span></span>
                  <span class="mark" aria-hidden="true">✓</span>
                </button>`
                )
                .join("")}
            </div>
          </section>

          <section class="card pad-lg">
            <h2 class="h-section">2. Modalidade</h2>
            <div class="grid g-2" style="margin-top:16px">
              <button type="button" class="pick on" data-mode="tele">
                <span class="mark" aria-hidden="true">✓</span>
                <span><b>Teleatendimento</b><span>Na sala virtual do GN Care.</span></span><span></span>
              </button>
              <button type="button" class="pick" data-mode="presencial">
                <span class="mark" aria-hidden="true">✓</span>
                <span><b>Presencial</b><span>Na GN Fisioterapia, conforme o plano.</span></span><span></span>
              </button>
            </div>
          </section>

          <section class="card pad-lg">
            <h2 class="h-section">3. Data</h2>
            <div class="cal" style="margin-top:16px">
              ${["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => `<span class="lbl">${d}</span>`).join("")}
              ${Array.from({ length: new Date(`${days[0]}T12:00:00`).getDay() })
                .map(() => `<span></span>`)
                .join("")}
              ${days
                .map(
                  (d) => `
                <button class="day" data-day="${d}">
                  <b>${Number(d.slice(8))}</b>
                  <small>${weekdayShort(d)}</small>
                </button>`
                )
                .join("")}
            </div>
          </section>

          <section class="card pad-lg">
            <h2 class="h-section">4. Horário</h2>
            <div id="slots" style="margin-top:16px">
              <p class="muted small">Escolha uma data para ver os horários livres.</p>
            </div>
          </section>
        </div>

        <aside class="card pad-lg" style="position:sticky;top:96px">
          <h3 class="h-card">Resumo</h3>
          <dl class="kv" style="grid-template-columns:1fr;margin-top:14px">
            <div><dt>Profissional</dt><dd id="s-pro">—</dd></div>
            <div><dt>Modalidade</dt><dd id="s-mode">Teleatendimento</dd></div>
            <div><dt>Data</dt><dd id="s-date">Selecione</dd></div>
            <div><dt>Horário</dt><dd id="s-time">Selecione</dd></div>
          </dl>
          <button class="btn solid block" id="confirm" style="margin-top:20px" disabled>
            ${rescheduleId ? "Confirmar novo horário" : "Confirmar agendamento"}
          </button>
          <p class="tiny muted" style="margin-top:12px">A solicitação fica com status “Solicitado” até o fisioterapeuta confirmar.</p>
        </aside>
      </div>`,
    mount(root, context) {
      const slotsBox = root.querySelector("#slots");
      const confirm = root.querySelector("#confirm");
      const sPro = root.querySelector("#s-pro");
      const sMode = root.querySelector("#s-mode");
      const sDate = root.querySelector("#s-date");
      const sTime = root.querySelector("#s-time");

      const proName = (id) => (pros.find((p) => p.id === id) || {}).name || "—";
      sPro.textContent = proName(state.professionalId);

      const sync = () => {
        sPro.textContent = proName(state.professionalId);
        sMode.textContent = modeLabel(state.mode);
        sDate.textContent = state.date ? dateFull(state.date) : "Selecione";
        sTime.textContent = state.time || "Selecione";
        confirm.disabled = !(state.date && state.time);
      };

      root.querySelectorAll("[data-pro]").forEach((btn) =>
        btn.addEventListener("click", () => {
          state.professionalId = btn.dataset.pro;
          state.time = "";
          root.querySelectorAll("[data-pro]").forEach((b) => b.classList.toggle("on", b === btn));
          if (state.date) loadSlots();
          sync();
        })
      );

      root.querySelectorAll("[data-mode]").forEach((btn) =>
        btn.addEventListener("click", () => {
          state.mode = btn.dataset.mode;
          root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("on", b === btn));
          if (state.date) loadSlots();
          sync();
        })
      );

      root.querySelectorAll("[data-day]").forEach((btn) =>
        btn.addEventListener("click", () => {
          state.date = btn.dataset.day;
          state.time = "";
          root.querySelectorAll("[data-day]").forEach((b) => b.classList.toggle("on", b === btn));
          loadSlots();
          sync();
        })
      );

      async function loadSlots() {
        slotsBox.innerHTML = `<div class="skeleton sk-card" style="height:90px"></div>`;
        const slots = await patientApi.slots(state.professionalId, state.date);
        const usable = slots.filter((s) => s.mode === state.mode || state.mode === "tele");
        if (!usable.length) {
          slotsBox.innerHTML = emptyState({
            icon: "🕐",
            title: "Sem horários nesse dia",
            text: "Esse profissional não atende na data escolhida. Selecione outro dia."
          });
          return;
        }
        slotsBox.innerHTML = `<div class="slots">${usable
          .map(
            (s) => `
          <button class="slot" data-time="${s.time}" ${s.free ? "" : "disabled"}>
            <b>${s.time}</b>
            <small>${s.free ? modeLabel(s.mode) : "Indisponível"}</small>
          </button>`
          )
          .join("")}</div>`;
        slotsBox.querySelectorAll("[data-time]").forEach((btn) =>
          btn.addEventListener("click", () => {
            state.time = btn.dataset.time;
            slotsBox.querySelectorAll("[data-time]").forEach((b) => b.classList.toggle("on", b === btn));
            sync();
          })
        );
      }

      confirm.addEventListener("click", async () => {
        confirm.disabled = true;
        confirm.textContent = "Enviando...";
        try {
          if (rescheduleId) {
            await patientApi.reschedule(rescheduleId, state.date, state.time, state.mode);
            toast("Novo horário solicitado.");
          } else {
            await patientApi.book({
              patientId: context.session.refId,
              professionalId: state.professionalId,
              date: state.date,
              time: state.time,
              mode: state.mode
            });
            toast("Solicitação enviada ao seu fisioterapeuta.");
          }
          navigate("#/paciente/consultas");
        } catch (err) {
          toast(err.message, "err");
          confirm.disabled = false;
          confirm.textContent = "Confirmar agendamento";
          loadSlots();
        }
      });

      sync();
    }
  };
}

/* ---------------- evolução ---------------- */

export async function evolution(ctx) {
  const data = await patientApi.evolution(ctx.session.refId);
  const { series, first, last, exercises, appointmentsDone, treatment: plan } = data;
  const painPoints = series.map((e) => ({ label: dateShort(e.date), value: e.pain }));
  const adherencePoints = series.map((e) => ({ label: dateShort(e.date), value: e.adherence }));

  if (!series.length) {
    return {
      title: "Minha evolução",
      html: `
        ${pageHead({ title: "Minha evolução", lead: "Acompanhe o que mudou ao longo do tratamento." })}
        ${emptyState({
          icon: "📈",
          title: "Nenhum registro de evolução ainda",
          text: "Os registros são feitos pelo fisioterapeuta ao final de cada atendimento.",
          actionLabel: "Ver consultas",
          route: "#/paciente/consultas"
        })}`
    };
  }

  return {
    title: "Minha evolução",
    html: `
      ${pageHead({ title: "Minha evolução", lead: "O que mudou desde o início do tratamento." })}

      <div class="grid g-4" style="margin-bottom:22px">
        ${stat({ icon: "🩹", value: `${first.pain} → ${last.pain}`, label: "Nível de dor (0 a 10)" })}
        ${stat({ icon: "🎯", value: `${last.adherence}%`, label: "Adesão no último registro" })}
        ${stat({ icon: "🏃", value: `${exercises.filter((e) => e.status === "done").length}/${exercises.length}`, label: "Exercícios concluídos" })}
        ${stat({ icon: "📅", value: String(appointmentsDone), label: "Atendimentos realizados" })}
      </div>

      <div class="grid g-main">
        <div class="stack-lg">
          <section class="card pad-lg">
            <h2 class="h-section">Dor ao longo do tratamento</h2>
            <p class="muted small" style="margin-top:6px">Quanto menor, melhor.</p>
            <div style="margin-top:16px">${lineChart(painPoints, { invert: true, label: "Evolução da dor" })}</div>
          </section>

          <section class="card pad-lg">
            <h2 class="h-section">Adesão ao programa</h2>
            <div style="margin-top:16px">${barChart(adherencePoints.map((p) => ({ label: p.label, value: p.value })), { max: 100, suffix: "%" })}</div>
          </section>

          <section class="card pad-lg">
            <h2 class="h-section">Registros do fisioterapeuta</h2>
            <div class="stack" style="margin-top:16px">
              ${[...series]
                .reverse()
                .map(
                  (e) => `
                <div class="timeline-body">
                  <div class="row-between">
                    <b>${esc(dateFull(e.date))}</b>
                    ${badge(`Dor ${e.pain}/10`, e.pain <= 3 ? "" : "gold")}
                  </div>
                  <p class="muted small" style="margin-top:8px;line-height:1.55">${esc(e.text)}</p>
                  ${e.conduct ? `<p class="tiny muted" style="margin-top:6px"><b>Conduta:</b> ${esc(e.conduct)}</p>` : ""}
                </div>`
                )
                .join("")}
            </div>
          </section>
        </div>

        <div class="stack-lg">
          ${
            plan && plan.goals.length
              ? `<section class="card">
                  <h3 class="h-card">Metas</h3>
                  <div class="stack" style="margin-top:14px">
                    ${plan.goals.map((g) => meter(g.title, g.progress)).join("")}
                  </div>
                </section>`
              : ""
          }
          <section class="card mint">
            <h3 class="h-card">Última observação</h3>
            <p class="muted" style="margin-top:8px;line-height:1.55">${esc(last.text)}</p>
            <p class="tiny muted" style="margin-top:10px">${esc(last.author)} · ${esc(dateFull(last.date))}</p>
          </section>
        </div>
      </div>`
  };
}

/* ---------------- meu fisioterapeuta ---------------- */

export async function professional(ctx) {
  const { professional: pro, history } = await patientApi.professional(ctx.session.refId);

  if (!pro) {
    return {
      title: "Meu fisioterapeuta",
      html: `
        ${pageHead({ title: "Meu fisioterapeuta", lead: "Profissional responsável pelo seu acompanhamento." })}
        ${emptyState({
          icon: "🩺",
          title: "Nenhum profissional vinculado",
          text: "Escolha um fisioterapeuta para iniciar o acompanhamento.",
          actionLabel: "Escolher fisioterapeuta",
          route: "#/onboarding"
        })}`
    };
  }

  return {
    title: "Meu fisioterapeuta",
    html: `
      ${pageHead({
        title: "Meu fisioterapeuta",
        lead: "Profissional responsável pelo seu acompanhamento no GN Care.",
        actions: `<button class="btn solid" data-route="#/paciente/consultas/agendar">Agendar atendimento</button>`
      })}

      <div class="grid g-main">
        <div class="stack-lg">
          <section class="card pad-lg">
            <div class="item-left" style="align-items:flex-start">
              ${avatar(pro.initials, { solid: true, size: "xl" })}
              <div>
                <h2 class="h-section">${esc(pro.name)}</h2>
                <p class="muted small" style="margin-top:4px">${esc(pro.role)} · ${esc(pro.crefito)}</p>
                <div class="chip-row" style="margin-top:12px">
                  ${pro.specialties.map((s) => `<span class="chip static">${esc(s)}</span>`).join("")}
                </div>
                <p class="muted" style="margin-top:16px;line-height:1.6">${esc(pro.bio)}</p>
              </div>
            </div>
            <div class="divider"></div>
            <div class="btn-row">
              <button class="btn line" data-action="mensagem">Enviar mensagem</button>
              <button class="btn ghost" data-route="#/p/${esc(pro.slug)}">Ver perfil público</button>
            </div>
          </section>

          <section class="card pad-lg">
            <h2 class="h-section">Atendimentos realizados</h2>
            <div class="stack" style="margin-top:16px">
              ${
                history.length
                  ? history
                      .map(
                        (ap) => `
                  <div class="item">
                    <div class="item-left">
                      <div class="avatar sm" aria-hidden="true">${ap.mode === "tele" ? "🎥" : "🏥"}</div>
                      <div><b>${esc(dateFull(ap.date))} · ${esc(ap.time)}</b><small>${esc(modeLabel(ap.mode))} · ${esc(ap.type)}</small></div>
                    </div>
                    ${statusBadge(ap.status)}
                  </div>`
                      )
                      .join("")
                  : `<p class="muted small">Nenhum atendimento realizado ainda.</p>`
              }
            </div>
          </section>
        </div>

        <div class="stack-lg">
          <section class="card">
            <h3 class="h-card">Atendimento</h3>
            <dl class="kv" style="grid-template-columns:1fr;margin-top:14px">
              <div><dt>Modalidade</dt><dd>${esc(pro.modality)}</dd></div>
              <div><dt>Local</dt><dd>${esc(pro.city)}</dd></div>
              <div><dt>Disponibilidade</dt><dd>${esc(pro.availabilityNote)}</dd></div>
              <div><dt>Avaliação</dt><dd>⭐ ${pro.rating}</dd></div>
            </dl>
          </section>
        </div>
      </div>`,
    mount(root) {
      root.querySelector('[data-action="mensagem"]').addEventListener("click", () => {
        modal({
          title: `Mensagem para ${pro.name}`,
          description: "As mensagens ficam registradas no seu acompanhamento.",
          body: `<form id="msg-form">${field({
            label: "Sua mensagem",
            name: "text",
            type: "textarea",
            rows: 4,
            required: true,
            placeholder: "Ex.: senti desconforto no exercício de agachamento"
          })}</form>`,
          footer: `
            <button class="btn ghost" data-close>Cancelar</button>
            <button class="btn solid" id="msg-send">Enviar mensagem</button>`,
          onMount(back) {
            back.querySelector("#msg-send").addEventListener("click", () => {
              const form = back.querySelector("#msg-form");
              if (!validate(form, { text: "Escreva sua mensagem" })) return;
              toast("Mensagem enviada ao seu fisioterapeuta.");
              document.querySelector(".modal-back").remove();
              document.body.style.overflow = "";
            });
          }
        });
      });
    }
  };
}

/* ---------------- documentos ---------------- */

export async function documents(ctx) {
  const list = await patientApi.documents(ctx.session.refId);

  return {
    title: "Documentos",
    html: `
      ${pageHead({ title: "Documentos e orientações", lead: "Materiais disponibilizados pelo seu fisioterapeuta." })}
      ${
        list.length
          ? `<div class="grid g-3">${list
              .map(
                (d) => `
          <article class="card">
            <div class="avatar" aria-hidden="true">📄</div>
            <h3 class="h-card" style="margin-top:14px">${esc(d.title)}</h3>
            <p class="muted small" style="margin-top:6px">${esc(d.kind)} · ${esc(dateFull(d.date))}</p>
            <p class="tiny muted" style="margin-top:4px">Publicado por ${esc(d.owner)}</p>
            <button class="btn line block" style="margin-top:16px" data-doc="${esc(d.id)}">Abrir documento</button>
          </article>`
              )
              .join("")}</div>`
          : emptyState({
              icon: "📄",
              title: "Nenhum documento publicado",
              text: "Avaliações, programas e orientações aparecem aqui quando forem liberados.",
              actionLabel: "Ver meu tratamento",
              route: "#/paciente/tratamento"
            })
      }`,
    mount(root) {
      root.querySelectorAll("[data-doc]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const doc = list.find((d) => d.id === btn.dataset.doc);
          modal({
            title: doc.title,
            description: `${doc.kind} · ${dateFull(doc.date)}`,
            body: `
              <p class="muted" style="line-height:1.6">Este documento é uma demonstração do protótipo. Em produção, aqui apareceria o arquivo publicado pelo fisioterapeuta.</p>
              <div class="card cream flat" style="margin-top:16px">
                <b>${esc(doc.title)}</b>
                <p class="muted small" style="margin-top:8px">Responsável: ${esc(doc.owner)}</p>
              </div>`,
            footer: `<button class="btn ghost" data-close>Fechar</button>`
          });
        });
      });
    }
  };
}

/* ---------------- perfil ---------------- */

export async function profile(ctx) {
  const { patient, plan } = await patientApi.profile(ctx.session.refId);
  const tab = ctx.query.aba || "dados";

  const body = {
    dados: () => `
      <form id="profile-form" class="stack">
        ${field({ label: "Nome completo", name: "name", value: patient.name, required: true })}
        <div class="field-row">
          ${field({ label: "Telefone", name: "phone", value: patient.phone, required: true })}
          ${field({ label: "E-mail", name: "email", type: "email", value: patient.email, required: true })}
        </div>
        <div class="field-row">
          ${field({ label: "Data de nascimento", name: "birth", type: "date", value: patient.birth })}
          ${field({ label: "Profissão", name: "job", value: patient.job })}
        </div>
        ${field({ label: "Contato de emergência", name: "emergency", value: patient.emergency })}
        <div class="btn-row"><button class="btn solid" type="submit">Salvar alterações</button></div>
      </form>`,
    seguranca: () => `
      <form id="pass-form" class="stack">
        ${field({ label: "Senha atual", name: "current", type: "password", required: true })}
        <div class="field-row">
          ${field({ label: "Nova senha", name: "password", type: "password", required: true, hint: "Mínimo de 6 caracteres" })}
          ${field({ label: "Confirmar nova senha", name: "confirm", type: "password", required: true })}
        </div>
        <div class="btn-row"><button class="btn solid" type="submit">Atualizar senha</button></div>
      </form>`,
    notificacoes: () => `
      <div class="stack">
        <label class="check-line"><input type="checkbox" checked data-pref="consulta"> Lembretes de consulta</label>
        <label class="check-line"><input type="checkbox" checked data-pref="exercicio"> Lembretes de exercícios</label>
        <label class="check-line"><input type="checkbox" data-pref="novidades"> Novidades do GN Care</label>
        <p class="tiny muted">As preferências valem para esta demonstração.</p>
      </div>`,
    demo: () => `
      <div class="stack">
        <label class="check-line"><input type="checkbox" id="offline" ${demo.isOffline() ? "checked" : ""}> Simular falha de conexão</label>
        <p class="tiny muted">Use para ver como a interface se comporta nos estados de erro.</p>
        <div class="divider"></div>
        <button class="btn ghost" id="reset-demo">Restaurar dados de demonstração</button>
        <p class="tiny muted">Apaga o que foi criado nesta sessão e recarrega os dados fictícios originais.</p>
      </div>`
  };

  return {
    title: "Meu perfil",
    html: `
      ${pageHead({ title: "Meu perfil", lead: "Seus dados, segurança e preferências." })}

      <div class="grid g-side">
        <aside class="card">
          <div class="item-left">
            ${avatar(patient.initials, { solid: true, size: "lg" })}
            <div>
              <b>${esc(patient.name)}</b>
              <small>${esc(plan ? `Plano ${plan.name}` : "Plano a definir")}</small>
            </div>
          </div>
          <div class="divider"></div>
          <dl class="kv" style="grid-template-columns:1fr">
            <div><dt>Paciente desde</dt><dd>${esc(dateFull(patient.since))}</dd></div>
            <div><dt>Condição</dt><dd>${esc(patient.condition)}</dd></div>
          </dl>
        </aside>

        <section class="card pad-lg">
          ${tabs(
            [
              { id: "dados", label: "Dados" },
              { id: "seguranca", label: "Segurança" },
              { id: "notificacoes", label: "Notificações" },
              { id: "demo", label: "Demonstração" }
            ],
            tab,
            { action: "perfil-tab" }
          )}
          <div id="profile-body">${body[tab]()}</div>
        </section>
      </div>`,
    mount(root, context) {
      root.querySelectorAll('[data-action="perfil-tab"]').forEach((btn) =>
        btn.addEventListener("click", () => navigate(`#/paciente/perfil?aba=${btn.dataset.id}`))
      );

      const profileForm = root.querySelector("#profile-form");
      if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          if (!validate(profileForm, { name: "Informe seu nome", phone: "Informe seu telefone", email: "Informe seu e-mail" })) return;
          const btn = profileForm.querySelector("button");
          btn.disabled = true;
          await patientApi.updateProfile(patient.id, readForm(profileForm));
          toast("Dados atualizados.");
          context.refresh();
        });
      }

      const passForm = root.querySelector("#pass-form");
      if (passForm) {
        passForm.addEventListener("submit", (e) => {
          e.preventDefault();
          if (!validate(passForm, { current: "Informe a senha atual", password: "Crie a nova senha", confirm: "Repita a nova senha" })) return;
          const data = readForm(passForm);
          if (data.password.length < 6 || data.password !== data.confirm) {
            toast("Verifique a nova senha: mínimo de 6 caracteres e confirmação igual.", "warn");
            return;
          }
          toast("Senha atualizada.");
          passForm.reset();
        });
      }

      root.querySelectorAll("[data-pref]").forEach((el) =>
        el.addEventListener("change", () => toast("Preferência de notificação salva."))
      );

      const offline = root.querySelector("#offline");
      if (offline) {
        offline.addEventListener("change", () => {
          demo.setOffline(offline.checked);
          toast(offline.checked ? "Modo de falha ativado." : "Conexão normalizada.", offline.checked ? "warn" : "ok");
        });
      }

      const reset = root.querySelector("#reset-demo");
      if (reset) {
        reset.addEventListener("click", async () => {
          const ok = await confirmDialog({
            title: "Restaurar demonstração",
            text: "Os dados criados nesta sessão serão apagados e a base fictícia original volta.",
            confirmLabel: "Restaurar",
            danger: true
          });
          if (!ok) return;
          demo.reset();
          window.location.reload();
        });
      }
    }
  };
}
