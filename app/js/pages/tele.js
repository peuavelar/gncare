/* Sala de teleatendimento mockada, para paciente e fisioterapeuta. */

import { teleApi, proApi, dayISO } from "../api.js";
import { navigate } from "../router.js";
import {
  avatar,
  badge,
  confirmDialog,
  esc,
  field,
  kv,
  meter,
  modeLabel,
  readForm,
  relativeDay,
  statusBadge,
  toast
} from "../ui.js";

const TODAY = dayISO(0);

export async function room(ctx) {
  const data = await teleApi.room(ctx.params.id);
  const isPro = ctx.session.role === "fisioterapeuta";
  const { appointment: ap, patient, treatment, exercises, lastEvolution, messages } = data;
  const other = isPro
    ? { name: ap.patientName, initials: ap.patientInitials, role: "Paciente" }
    : { name: ap.professionalName, initials: ap.professionalInitials, role: "Fisioterapeuta" };
  const scene = isPro ? "../assets/idoso-tele.png" : "../assets/gn-session.png";
  const pending = exercises.filter((e) => e.status !== "done");

  return {
    title: `Sala · ${other.name}`,
    unread: 0,
    html: `
      <div class="page-head">
        <div>
          <p class="step-count">${esc(modeLabel(ap.mode))}</p>
          <h1 class="h-page" style="margin-top:6px">${esc(ap.type)} · ${esc(ap.time)}</h1>
          <p class="lead">${esc(relativeDay(ap.date, TODAY))} · ${esc(ap.duration)} · ${esc(ap.patientName)} e ${esc(ap.professionalName)}</p>
        </div>
        <div class="btn-row">
          ${statusBadge(ap.status)}
          ${isPro ? `<button class="btn line" data-route="#/profissional/pacientes/${esc(ap.patientId)}">Abrir prontuário</button>` : ""}
        </div>
      </div>

      <div class="tele">
        <div>
          <div class="stage" id="stage">
            <img src="${esc(scene)}" alt="Imagem de referência da consulta. O vídeo ao vivo entra nesta área na implementação real.">
            <div class="clock" id="tele-clock"><span class="dot" aria-hidden="true"></span> <span id="tele-time">00:00</span> · sala GN Care</div>
            <div class="overlay">
              <div class="avatar lg solid">${esc(other.initials)}</div>
              <b>${esc(other.name)}</b>
              <span>${esc(other.role)} · câmera de demonstração</span>
            </div>
            <div class="self" id="self-cam">
              <span>Você</span>
            </div>
          </div>

          <div class="tele-controls" role="toolbar" aria-label="Controles da chamada">
            <button class="ctrl" data-toggle="mic" aria-pressed="true" title="Microfone" aria-label="Microfone ligado">🎤</button>
            <button class="ctrl" data-toggle="cam" aria-pressed="true" title="Câmera" aria-label="Câmera ligada">📷</button>
            <button class="ctrl" data-toggle="chat" aria-pressed="true" title="Chat" aria-label="Chat visível">💬</button>
            <button class="ctrl end" data-action="encerrar">Encerrar</button>
          </div>

          ${
            !isPro
              ? `
            <section class="card" style="margin-top:18px">
              <h3 class="h-card">Exercício de hoje</h3>
              ${
                pending[0]
                  ? `<div class="item" style="margin-top:8px">
                      <div class="item-left">
                        <div class="avatar">${esc(pending[0].category[0])}</div>
                        <div>
                          <b>${esc(pending[0].name)}</b>
                          <small>${pending[0].sets} séries · ${esc(pending[0].reps)}</small>
                        </div>
                      </div>
                      <button class="btn line xs" data-route="#/paciente/exercicios/${esc(pending[0].id)}">Ver exercício</button>
                    </div>`
                  : `<p class="muted small" style="margin-top:10px">Nenhum exercício pendente no seu programa.</p>`
              }
            </section>`
              : ""
          }
        </div>

        <aside class="stack-lg" id="tele-side">
          <section class="card">
            <div class="card-head">
              <h3 class="h-card">Consulta</h3>
              ${badge(ap.mode === "tele" ? "Online" : "Presencial", "solid")}
            </div>
            ${kv([
              ["Paciente", ap.patientName],
              ["Fisioterapeuta", ap.professionalName],
              ["Tipo", ap.type],
              ["Duração", ap.duration]
            ])}
            ${ap.note ? `<p class="muted small" style="margin-top:12px">${esc(ap.note)}</p>` : ""}
          </section>

          ${
            isPro
              ? `
            <section class="card">
              <h3 class="h-card">Prontuário rápido</h3>
              <p class="muted small" style="margin-top:8px;line-height:1.5">${esc(
                treatment && treatment.objective ? treatment.objective : "Plano de tratamento ainda não definido."
              )}</p>
              ${lastEvolution ? `<div class="divider"></div><p class="tiny muted"><b>Última evolução:</b> ${esc(lastEvolution.text)}</p>` : ""}
              <div class="divider"></div>
              ${meter("Adesão", patient.adherence)}
              <button class="btn ghost sm" style="margin-top:12px" data-route="#/profissional/pacientes/${esc(patient.id)}/prontuario/avaliacao">Abrir avaliação</button>
            </section>

            <section class="card">
              <h3 class="h-card">Anotação da sessão</h3>
              <form id="session-note" class="stack" style="margin-top:12px">
                ${field({ label: "Nota clínica", name: "text", type: "textarea", rows: 3, placeholder: "O que observou nesta consulta" })}
                <button class="btn line sm" type="submit">Guardar na evolução</button>
              </form>
            </section>`
              : `
            <section class="card">
              <h3 class="h-card">Como se preparar</h3>
              <ul class="ol" style="margin-top:12px">
                <li><span>Fique em um local iluminado e silencioso.</span></li>
                <li><span>Deixe a cadeira de apoio perto, se o programa pedir.</span></li>
                <li><span>Avise no chat se a conexão cair.</span></li>
              </ul>
            </section>`
          }

          <section class="card chat" id="chat-card">
            <h3 class="h-card">Chat da consulta</h3>
            <div class="chat-log" id="chat-log" aria-live="polite">
              ${
                messages.length
                  ? messages.map((m) => msgHtml(m, ctx.session.name)).join("")
                  : `<p class="muted small">Nenhuma mensagem ainda. Use o chat se o áudio falhar.</p>`
              }
            </div>
            <form class="chat-form" id="chat-form">
              <label class="sr-only" for="chat-input">Mensagem</label>
              <input id="chat-input" name="text" maxlength="240" placeholder="Escrever mensagem" autocomplete="off">
              <button class="btn solid sm" type="submit">Enviar</button>
            </form>
          </section>
        </aside>
      </div>`,
    mount(root, context) {
      const clock = root.querySelector("#tele-time");
      const started = Date.now();
      const tick = setInterval(() => {
        if (!clock || !clock.isConnected) {
          clearInterval(tick);
          return;
        }
        const s = Math.floor((Date.now() - started) / 1000);
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        clock.textContent = `${mm}:${ss}`;
      }, 1000);

      root.querySelectorAll("[data-toggle]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const on = btn.getAttribute("aria-pressed") === "true";
          btn.setAttribute("aria-pressed", String(!on));
          btn.classList.toggle("off", on);
          if (btn.dataset.toggle === "mic") {
            btn.textContent = on ? "🔇" : "🎤";
            btn.setAttribute("aria-label", on ? "Microfone desligado" : "Microfone ligado");
            toast(on ? "Microfone desligado." : "Microfone ligado.");
          }
          if (btn.dataset.toggle === "cam") {
            btn.textContent = on ? "🚫" : "📷";
            btn.setAttribute("aria-label", on ? "Câmera desligada" : "Câmera ligada");
            root.querySelector("#self-cam").style.opacity = on ? ".45" : "1";
            toast(on ? "Câmera desligada." : "Câmera ligada.");
          }
          if (btn.dataset.toggle === "chat") {
            root.querySelector("#chat-card").hidden = on;
            toast(on ? "Chat oculto." : "Chat visível.");
          }
        });
      });

      const form = root.querySelector("#chat-form");
      const log = root.querySelector("#chat-log");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = form.querySelector("input").value.trim();
        if (!text) return;
        form.querySelector("input").value = "";
        const message = await teleApi.send(ap.id, ctx.session.name, text);
        if (log.querySelector(".muted")) log.innerHTML = "";
        log.insertAdjacentHTML("beforeend", msgHtml(message, ctx.session.name));
        log.scrollTop = log.scrollHeight;
      });

      const note = root.querySelector("#session-note");
      if (note) {
        note.addEventListener("submit", async (e) => {
          e.preventDefault();
          const text = readForm(note).text;
          if (!text) {
            toast("Escreva a observação da sessão.", "warn");
            return;
          }
          await proApi.saveEvolution(patient.id, {
            pain: lastEvolution ? lastEvolution.pain : 4,
            adherence: patient.adherence,
            text,
            conduct: "Registrado durante o teleatendimento.",
            author: ctx.session.name
          });
          toast("Anotação salva na evolução do paciente.");
          note.reset();
        });
      }

      root.querySelector('[data-action="encerrar"]').addEventListener("click", async () => {
        const ok = await confirmDialog({
          title: "Encerrar teleatendimento",
          text: "A sala será fechada e o atendimento marcado como realizado.",
          confirmLabel: "Encerrar agora",
          danger: true
        });
        if (!ok) return;
        await teleApi.finish(ap.id);
        toast("Atendimento encerrado.");
        navigate(isPro ? "#/profissional/teleatendimento" : "#/paciente/consultas");
      });
    }
  };
}

function msgHtml(message, me) {
  const mine = message.author === me;
  return `<div class="msg ${mine ? "me" : ""}"><b>${esc(message.author)}</b>${esc(message.text)}</div>`;
}
