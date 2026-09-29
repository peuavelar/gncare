/* Acesso, cadastro, recuperação, onboarding do paciente e perfil público. */

import { auth, catalog, patientApi } from "../api.js";
import { navigate, homeFor } from "../router.js";
import {
  BRAND_SVG,
  avatar,
  badge,
  esc,
  field,
  money,
  readForm,
  toast,
  validate
} from "../ui.js";

function authFrame({ title, lead, body, foot = "", side = sidePanel() }) {
  return `
    <div class="auth">
      ${side}
      <section class="auth-main">
        <div class="auth-box">
          <a class="brand" href="../preview.html">${BRAND_SVG} GN Care</a>
          <div>
            <h1>${esc(title)}</h1>
            <p class="lead" style="margin-top:8px">${esc(lead)}</p>
          </div>
          ${body}
          ${foot ? `<p class="auth-foot">${foot}</p>` : ""}
        </div>
      </section>
    </div>`;
}

function sidePanel() {
  return `
    <aside class="auth-side">
      <a class="brand on-dark" href="../preview.html">${BRAND_SVG} GN Care</a>
      <div>
        <h2>Fisioterapia que continua com você</h2>
        <p>Teleatendimento, programa de exercícios e acompanhamento do tratamento no mesmo lugar.</p>
        <div class="auth-points">
          <div><i>✓</i><span>Consulta na sala virtual do GN Care, sem deslocamento.</span></div>
          <div><i>✓</i><span>Exercícios prescritos pelo seu fisioterapeuta, com orientação.</span></div>
          <div><i>✓</i><span>Evolução registrada a cada atendimento.</span></div>
        </div>
      </div>
      <p class="small" style="color:#b8cfe3">Protótipo com dados fictícios · Salvador · BA</p>
    </aside>`;
}

/* ---------------- login ---------------- */

export async function login(ctx) {
  const next = ctx.query.next || "";
  const html = authFrame({
    title: "Entrar no GN Care",
    lead: "Acesse sua área para acompanhar o tratamento.",
    body: `
      <form id="login-form" novalidate>
        <div class="role-pick" style="margin-bottom:18px">
          <button type="button" class="role-card on" data-role="paciente">
            <span aria-hidden="true">👤</span>
            <b>Sou paciente</b>
            <span>Consultas, exercícios e evolução.</span>
          </button>
          <button type="button" class="role-card" data-role="fisioterapeuta">
            <span aria-hidden="true">🩺</span>
            <b>Sou fisioterapeuta</b>
            <span>Pacientes, agenda e prontuário.</span>
          </button>
        </div>

        <div class="stack">
          ${field({ label: "E-mail", name: "email", type: "email", value: "paciente@gncare.test", required: true, placeholder: "voce@email.com" })}
          <div class="field" data-field="password">
            <label for="f-password">Senha *</label>
            <div class="with-action">
              <input id="f-password" name="password" type="password" value="gncare123" required>
              <button type="button" class="btn ghost xs" data-action="mostrar-senha" aria-pressed="false">Mostrar</button>
            </div>
            <span class="err" hidden></span>
          </div>
          <div class="row-between">
            <label class="check-line"><input type="checkbox" name="remember" checked> Lembrar acesso</label>
            <button type="button" class="link" data-route="#/recuperar-senha">Esqueci minha senha</button>
          </div>
          <div id="login-error" hidden></div>
          <button class="btn solid block" type="submit">Entrar</button>
        </div>
      </form>

      <div class="demo-users">
        <b>Acessos de demonstração</b>
        <span>Paciente: paciente@gncare.test · Fisioterapeuta: fisio@gncare.test · Senha: gncare123</span>
        <div class="btn-row">
          <button class="btn soft sm" data-fill="paciente">Entrar como paciente</button>
          <button class="btn soft sm" data-fill="fisioterapeuta">Entrar como fisioterapeuta</button>
        </div>
      </div>`,
    foot: `Ainda não tem conta? <button class="link" data-route="#/cadastro">Criar conta no GN Care</button>`
  });

  return {
    title: "Entrar",
    html,
    mount(root) {
      const form = root.querySelector("#login-form");
      const errorBox = root.querySelector("#login-error");
      const emailInput = form.querySelector("#f-email");
      const passInput = form.querySelector("#f-password");

      root.querySelectorAll("[data-role]").forEach((btn) => {
        btn.addEventListener("click", () => {
          root.querySelectorAll("[data-role]").forEach((b) => b.classList.remove("on"));
          btn.classList.add("on");
          emailInput.value = btn.dataset.role === "paciente" ? "paciente@gncare.test" : "fisio@gncare.test";
        });
      });

      root.querySelector('[data-action="mostrar-senha"]').addEventListener("click", (e) => {
        const shown = passInput.type === "text";
        passInput.type = shown ? "password" : "text";
        e.currentTarget.textContent = shown ? "Mostrar" : "Ocultar";
        e.currentTarget.setAttribute("aria-pressed", String(!shown));
      });

      root.querySelectorAll("[data-fill]").forEach((btn) => {
        btn.addEventListener("click", () => {
          emailInput.value = btn.dataset.fill === "paciente" ? "paciente@gncare.test" : "fisio@gncare.test";
          passInput.value = "gncare123";
          form.requestSubmit();
        });
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.hidden = true;
        if (!validate(form, { email: "Informe seu e-mail", password: "Informe sua senha" })) return;
        const data = readForm(form);
        const submit = form.querySelector('button[type="submit"]');
        submit.disabled = true;
        submit.textContent = "Entrando...";
        try {
          const session = await auth.login(data.email, data.password, data.remember);
          toast(`Bem-vindo(a), ${session.name.split(" ")[0]}.`);
          navigate(next || homeFor(session), { replace: true });
        } catch (err) {
          errorBox.hidden = false;
          errorBox.className = "form-error";
          errorBox.textContent = err.message;
          submit.disabled = false;
          submit.textContent = "Entrar";
        }
      });
    }
  };
}

/* ---------------- cadastro ---------------- */

export async function register(ctx) {
  const role = ctx.query.perfil === "fisioterapeuta" ? "fisioterapeuta" : "paciente";

  const html = authFrame({
    title: "Criar conta no GN Care",
    lead: "O formulário muda conforme o seu perfil.",
    body: `
      <div class="role-pick" style="margin-bottom:4px">
        <button type="button" class="role-card ${role === "paciente" ? "on" : ""}" data-role="paciente">
          <span aria-hidden="true">👤</span>
          <b>Paciente</b>
          <span>Quero tratar e acompanhar minha evolução.</span>
        </button>
        <button type="button" class="role-card ${role === "fisioterapeuta" ? "on" : ""}" data-role="fisioterapeuta">
          <span aria-hidden="true">🩺</span>
          <b>Fisioterapeuta</b>
          <span>Quero atender pelo consultório digital.</span>
        </button>
      </div>

      <form id="register-form" novalidate>
        <div class="stack" id="register-fields"></div>
        <div id="register-error" hidden style="margin-top:14px"></div>
        <button class="btn solid block" type="submit" style="margin-top:18px">Criar conta</button>
      </form>`,
    foot: `Já tem conta? <button class="link" data-route="#/login">Entrar</button>`
  });

  const patientFields = () => `
    ${field({ label: "Nome completo", name: "name", required: true, placeholder: "Como quer ser chamado(a)" })}
    <div class="field-row">
      ${field({ label: "E-mail", name: "email", type: "email", required: true, placeholder: "voce@email.com" })}
      ${field({ label: "Telefone", name: "phone", required: true, placeholder: "(71) 90000-0000" })}
    </div>
    ${field({ label: "Data de nascimento", name: "birth", type: "date" })}
    ${field({ label: "O que te trouxe ao GN Care?", name: "complaint", type: "textarea", rows: 3, placeholder: "Ex.: dor no joelho ao subir escadas" })}
    <div class="field-row">
      ${field({ label: "Senha", name: "password", type: "password", required: true, hint: "Use ao menos 6 caracteres" })}
      ${field({ label: "Confirmar senha", name: "confirm", type: "password", required: true })}
    </div>
    <label class="check-line"><input type="checkbox" name="terms"> Concordo com o uso dos meus dados no protótipo do GN Care.</label>`;

  const proFields = () => `
    ${field({ label: "Nome profissional", name: "name", required: true, placeholder: "Nome que aparece no seu perfil" })}
    <div class="field-row">
      ${field({ label: "E-mail", name: "email", type: "email", required: true, placeholder: "voce@email.com" })}
      ${field({ label: "CREFITO", name: "crefito", required: true, placeholder: "000000-F" })}
    </div>
    ${field({ label: "Especialidades", name: "specialties", placeholder: "Ortopedia, Esporte, Coluna", hint: "Separe por vírgula" })}
    <div class="field-row">
      ${field({ label: "Modalidade", name: "modality", options: ["Teleatendimento", "Teleatendimento + Presencial", "Presencial"] })}
      ${field({ label: "Cidade", name: "city", value: "Salvador · BA" })}
    </div>
    <div class="field-row">
      ${field({ label: "Senha", name: "password", type: "password", required: true, hint: "Use ao menos 6 caracteres" })}
      ${field({ label: "Confirmar senha", name: "confirm", type: "password", required: true })}
    </div>
    <div class="form-note">Sem mensalidade para usar a estrutura digital do GN Care. As regras de repasse são definidas em contrato.</div>`;

  return {
    title: "Criar conta",
    html,
    mount(root) {
      let current = role;
      const fields = root.querySelector("#register-fields");
      const form = root.querySelector("#register-form");
      const errorBox = root.querySelector("#register-error");

      const paint = () => {
        fields.innerHTML = current === "paciente" ? patientFields() : proFields();
      };
      paint();

      root.querySelectorAll("[data-role]").forEach((btn) => {
        btn.addEventListener("click", () => {
          current = btn.dataset.role;
          root.querySelectorAll("[data-role]").forEach((b) => b.classList.toggle("on", b === btn));
          paint();
        });
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.hidden = true;
        const rules =
          current === "paciente"
            ? { name: "Informe seu nome", email: "Informe seu e-mail", phone: "Informe seu telefone", password: "Crie uma senha", confirm: "Repita a senha" }
            : { name: "Informe seu nome", email: "Informe seu e-mail", crefito: "Informe o CREFITO", password: "Crie uma senha", confirm: "Repita a senha" };
        if (!validate(form, rules)) return;

        const data = readForm(form);
        if (data.password.length < 6) {
          showError(errorBox, "A senha precisa de ao menos 6 caracteres.");
          return;
        }
        if (data.password !== data.confirm) {
          showError(errorBox, "As senhas não conferem.");
          return;
        }
        if (current === "paciente" && !data.terms) {
          showError(errorBox, "É preciso aceitar o uso de dados do protótipo.");
          return;
        }

        const submit = form.querySelector('button[type="submit"]');
        submit.disabled = true;
        submit.textContent = "Criando conta...";
        try {
          const session = await auth.register({ ...data, role: current });
          toast("Conta criada. Vamos configurar seu acesso.");
          navigate(homeFor(session), { replace: true });
        } catch (err) {
          showError(errorBox, err.message);
          submit.disabled = false;
          submit.textContent = "Criar conta";
        }
      });

      function showError(box, message) {
        box.hidden = false;
        box.className = "form-error";
        box.textContent = message;
      }
    }
  };
}

/* ---------------- recuperação de senha ---------------- */

export async function recover() {
  const html = authFrame({
    title: "Recuperar acesso",
    lead: "Vamos confirmar seu e-mail e criar uma nova senha.",
    body: `
      <div class="steps" id="recover-steps">
        <i class="on"></i><i></i><i></i>
      </div>
      <div id="recover-body"></div>`,
    foot: `Lembrou a senha? <button class="link" data-route="#/login">Voltar para o login</button>`
  });

  return {
    title: "Recuperar senha",
    html,
    mount(root) {
      const body = root.querySelector("#recover-body");
      const steps = root.querySelectorAll("#recover-steps i");
      let email = "";

      const setStep = (n) => steps.forEach((s, i) => s.classList.toggle("on", i <= n));

      const stepEmail = () => {
        setStep(0);
        body.innerHTML = `
          <form id="rec-form" novalidate class="stack">
            ${field({ label: "E-mail da conta", name: "email", type: "email", required: true, placeholder: "voce@email.com" })}
            <button class="btn solid block" type="submit">Enviar confirmação</button>
          </form>`;
        body.querySelector("#rec-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          if (!validate(form, { email: "Informe o e-mail da conta" })) return;
          email = readForm(form).email;
          const btn = form.querySelector("button");
          btn.disabled = true;
          btn.textContent = "Enviando...";
          await auth.recover(email);
          stepConfirm();
        });
      };

      const stepConfirm = () => {
        setStep(1);
        body.innerHTML = `
          <div class="stack">
            <div class="form-note">Enviamos um código de confirmação para <b>${esc(email)}</b>. No protótipo, use <b>123456</b>.</div>
            <form id="code-form" novalidate class="stack">
              ${field({ label: "Código de confirmação", name: "code", required: true, placeholder: "123456" })}
              <button class="btn solid block" type="submit">Confirmar código</button>
            </form>
            <button class="link" id="resend">Reenviar código</button>
          </div>`;
        body.querySelector("#resend").addEventListener("click", () => toast("Código reenviado (demonstração)."));
        body.querySelector("#code-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          if (!validate(form, { code: "Informe o código recebido" })) return;
          if (readForm(form).code !== "123456") {
            const wrap = form.querySelector('[data-field="code"]');
            wrap.classList.add("invalid");
            const err = wrap.querySelector(".err");
            err.hidden = false;
            err.textContent = "Código inválido. No protótipo, use 123456.";
            return;
          }
          stepPassword();
        });
      };

      const stepPassword = () => {
        setStep(2);
        body.innerHTML = `
          <form id="pass-form" novalidate class="stack">
            ${field({ label: "Nova senha", name: "password", type: "password", required: true, hint: "Use ao menos 6 caracteres" })}
            ${field({ label: "Confirmar nova senha", name: "confirm", type: "password", required: true })}
            <div id="pass-error" hidden></div>
            <button class="btn solid block" type="submit">Salvar nova senha</button>
          </form>`;
        body.querySelector("#pass-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const box = form.querySelector("#pass-error");
          box.hidden = true;
          if (!validate(form, { password: "Crie uma senha", confirm: "Repita a senha" })) return;
          const data = readForm(form);
          if (data.password.length < 6 || data.password !== data.confirm) {
            box.hidden = false;
            box.className = "form-error";
            box.textContent = data.password.length < 6 ? "A senha precisa de ao menos 6 caracteres." : "As senhas não conferem.";
            return;
          }
          await auth.resetPassword(email, data.password);
          stepDone();
        });
      };

      const stepDone = () => {
        body.innerHTML = `
          <div class="state">
            <div class="ico" aria-hidden="true">✅</div>
            <h3>Senha atualizada</h3>
            <p>Você já pode entrar no GN Care com a nova senha.</p>
            <button class="btn solid" data-route="#/login">Ir para o login</button>
          </div>`;
      };

      stepEmail();
    }
  };
}

/* ---------------- onboarding do paciente ---------------- */

const STEPS = [
  { id: 0, title: "Boas-vindas" },
  { id: 1, title: "Objetivo" },
  { id: 2, title: "Preferências" },
  { id: 3, title: "Fisioterapeuta" },
  { id: 4, title: "Plano" },
  { id: 5, title: "Confirmação" }
];

export async function onboarding(ctx) {
  const [pros, plans] = await Promise.all([catalog.professionals(), catalog.plans()]);
  const answers = { objective: "", frequency: "", mode: "tele", professionalId: pros[0].id, planId: "ouro" };

  return {
    title: "Boas-vindas",
    html: `
      <div class="onboard">
        <div class="onboard-box">
          <div class="row-between" style="margin-bottom:18px">
            <a class="brand" href="#/onboarding">${BRAND_SVG} GN Care</a>
            <button class="link" data-action="sair">Sair</button>
          </div>
          <div class="steps" id="ob-steps">${STEPS.map((s, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</div>
          <div id="ob-body"></div>
        </div>
      </div>`,
    mount(root) {
      const body = root.querySelector("#ob-body");
      const steps = root.querySelectorAll("#ob-steps i");
      let step = 0;

      const paint = () => {
        steps.forEach((s, i) => s.classList.toggle("on", i <= step));
        body.innerHTML = views[step]();
        wire();
      };

      const nav = (backLabel, nextLabel, nextAttr = 'id="ob-next"') => `
        <div class="modal-foot" style="justify-content:space-between">
          ${step > 0 ? `<button class="btn ghost" id="ob-back">${esc(backLabel)}</button>` : "<span></span>"}
          <button class="btn solid" ${nextAttr}>${esc(nextLabel)}</button>
        </div>`;

      const pick = (name, value, title, text, on) => `
        <button type="button" class="pick ${on ? "on" : ""}" data-pick="${esc(name)}" data-value="${esc(value)}">
          <span class="mark" aria-hidden="true">✓</span>
          <span><b>${esc(title)}</b><span>${esc(text)}</span></span>
          <span></span>
        </button>`;

      const views = [
        () => `
          <span class="step-count">Etapa 1 de 6</span>
          <h1 class="h-page" style="margin:10px 0 12px">Fisioterapia que continua com você</h1>
          <p class="lead">Em poucos passos, montamos seu acesso: objetivo do tratamento, preferência de atendimento, fisioterapeuta e plano. Você pode mudar tudo depois.</p>
          <div class="grid g-3" style="margin:26px 0">
            ${["Programa de exercícios feito para você", "Teleatendimento na sala do GN Care", "Evolução registrada a cada consulta"]
              .map((t) => `<div class="card mint flat"><p style="line-height:1.5">${esc(t)}</p></div>`)
              .join("")}
          </div>
          ${nav("", "Começar")}`,

        () => `
          <span class="step-count">Etapa 2 de 6</span>
          <h2 class="h-page" style="margin:10px 0 12px">Qual é o seu objetivo?</h2>
          <p class="lead">Isso ajuda seu fisioterapeuta a preparar a primeira avaliação.</p>
          <div class="stack" style="margin:24px 0">
            ${field({ label: "Objetivo do tratamento", name: "objective", type: "textarea", rows: 3, value: answers.objective, placeholder: "Ex.: voltar a caminhar 40 minutos sem dor no joelho" })}
            <div class="pick-list">
              ${pick("frequency", "1x por semana", "1x por semana", "Acompanhamento mais espaçado", answers.frequency === "1x por semana")}
              ${pick("frequency", "2x por semana", "2x por semana", "Ritmo intermediário", answers.frequency === "2x por semana")}
              ${pick("frequency", "3x por semana", "3x por semana", "Programa mais intensivo", answers.frequency === "3x por semana")}
            </div>
          </div>
          ${nav("Voltar", "Continuar")}`,

        () => `
          <span class="step-count">Etapa 3 de 6</span>
          <h2 class="h-page" style="margin:10px 0 12px">Como prefere ser atendido?</h2>
          <p class="lead">Os planos Ouro e Platinum também incluem atendimentos presenciais na GN Fisioterapia.</p>
          <div class="pick-list" style="margin:24px 0">
            ${pick("mode", "tele", "Teleatendimento", "Consulta na sala virtual, de onde você estiver.", answers.mode === "tele")}
            ${pick("mode", "misto", "Tele + presencial", "Alterna consultas online com sessões na clínica.", answers.mode === "misto")}
            ${pick("mode", "presencial", "Presencial", "Prefiro ser atendido na GN Fisioterapia.", answers.mode === "presencial")}
          </div>
          ${nav("Voltar", "Continuar")}`,

        () => `
          <span class="step-count">Etapa 4 de 6</span>
          <h2 class="h-page" style="margin:10px 0 12px">Escolha seu fisioterapeuta</h2>
          <p class="lead">Você pode trocar de profissional depois, dentro da plataforma.</p>
          <div class="pick-list" style="margin:24px 0">
            ${pros
              .map(
                (p) => `
              <button type="button" class="pick ${answers.professionalId === p.id ? "on" : ""}" data-pick="professionalId" data-value="${esc(p.id)}">
                ${avatar(p.initials, { solid: true })}
                <span><b>${esc(p.name)}</b><span>${esc(p.specialties.join(" · "))} · ⭐ ${p.rating}</span></span>
                <span class="mark" aria-hidden="true">✓</span>
              </button>`
              )
              .join("")}
          </div>
          ${nav("Voltar", "Continuar")}`,

        () => `
          <span class="step-count">Etapa 5 de 6</span>
          <h2 class="h-page" style="margin:10px 0 12px">Escolha seu plano</h2>
          <p class="lead">Valores do protótipo atual do GN Care.</p>
          <div class="pick-list" style="margin:24px 0">
            ${plans
              .map(
                (p) => `
              <button type="button" class="pick ${answers.planId === p.id ? "on" : ""}" data-pick="planId" data-value="${esc(p.id)}">
                <span class="mark" aria-hidden="true">✓</span>
                <span>
                  <b>${esc(p.name)} · ${money(p.price)}/mês</b>
                  <span>${esc(p.features.join(" · "))}</span>
                </span>
                ${p.featured ? badge("Mais escolhido") : ""}
              </button>`
              )
              .join("")}
          </div>
          ${nav("Voltar", "Continuar")}`,

        () => {
          const pro = pros.find((p) => p.id === answers.professionalId);
          const plan = plans.find((p) => p.id === answers.planId);
          return `
            <span class="step-count">Etapa 6 de 6</span>
            <h2 class="h-page" style="margin:10px 0 12px">Tudo certo para começar</h2>
            <p class="lead">Confira o resumo. Depois de confirmar, você já pode agendar a avaliação inicial.</p>
            <div class="card cream flat" style="margin:24px 0">
              <dl class="kv">
                <div><dt>Objetivo</dt><dd>${esc(answers.objective || "A definir na avaliação")}</dd></div>
                <div><dt>Frequência</dt><dd>${esc(answers.frequency || "A definir")}</dd></div>
                <div><dt>Atendimento</dt><dd>${esc({ tele: "Teleatendimento", misto: "Tele + presencial", presencial: "Presencial" }[answers.mode])}</dd></div>
                <div><dt>Fisioterapeuta</dt><dd>${esc(pro.name)}</dd></div>
                <div><dt>Plano</dt><dd>${esc(plan.name)} · ${money(plan.price)}/mês</dd></div>
              </dl>
            </div>
            ${nav("Voltar", "Confirmar e entrar", 'id="ob-next" data-finish')}`;
        }
      ];

      function wire() {
        body.querySelectorAll("[data-pick]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const { pick: name, value } = btn.dataset;
            answers[name] = value;
            body.querySelectorAll(`[data-pick="${name}"]`).forEach((b) => b.classList.toggle("on", b === btn));
          });
        });

        const back = body.querySelector("#ob-back");
        if (back) back.addEventListener("click", () => { step -= 1; paint(); });

        const next = body.querySelector("#ob-next");
        next.addEventListener("click", async () => {
          const objective = body.querySelector("#f-objective");
          if (objective) answers.objective = objective.value.trim();

          if (step === 1 && !answers.frequency) {
            toast("Escolha uma frequência para continuar.", "warn");
            return;
          }
          if (next.hasAttribute("data-finish")) {
            next.disabled = true;
            next.textContent = "Confirmando...";
            await patientApi.completeOnboarding(ctx.session.refId, answers);
            auth.refresh();
            toast("Cadastro concluído. Bem-vindo(a) ao GN Care.");
            navigate("#/paciente", { replace: true });
            return;
          }
          step += 1;
          paint();
        });
      }

      paint();
    }
  };
}

/* ---------------- perfil público do fisioterapeuta ---------------- */

export async function publicProfile(ctx) {
  const pro = await catalog.publicProfile(ctx.params.slug);
  const plans = await catalog.plans();
  const shareUrl = `${window.location.origin}/app/#/p/${pro.slug}`;

  return {
    title: pro.name,
    html: `
      <div style="background:var(--bg);min-height:100vh;padding:26px 6% 60px">
        <div style="width:min(1000px,100%);margin:0 auto" class="stack-lg">
          <div class="row-between">
            <a class="brand" href="../preview.html">${BRAND_SVG} GN Care</a>
            <div class="btn-row">
              <button class="btn ghost sm" data-route="#/login">Entrar</button>
              <button class="btn solid sm" data-route="#/cadastro">Criar conta</button>
            </div>
          </div>

          <header class="pubhero">
            <div class="row-between" style="align-items:flex-end">
              <div>
                ${badge(`⭐ ${pro.rating} · ${pro.activePatients} pacientes ativos`, "solid")}
                <h1 style="margin-top:14px">${esc(pro.name)}</h1>
                <p>${esc(pro.role)} · ${esc(pro.crefito)} · ${esc(pro.city)}</p>
                <p>${esc(pro.bio)}</p>
                <div class="btn-row" style="margin-top:22px">
                  <button class="btn solid" data-route="#/cadastro">Agendar com ${esc(pro.name.split(" ")[0])}</button>
                  <button class="btn ghost" data-action="compartilhar">Compartilhar perfil</button>
                </div>
              </div>
            </div>
          </header>

          <div class="grid g-main">
            <div class="stack">
              <section class="card pad-lg">
                <h2 class="h-section">Como é o acompanhamento</h2>
                <ul class="ol" style="margin-top:16px">
                  <li>Avaliação inicial para entender sua queixa e seus objetivos.</li>
                  <li>Programa de exercícios com séries, repetições e orientações.</li>
                  <li>Teleatendimento na sala do GN Care e registro de evolução.</li>
                </ul>
              </section>

              <section class="card pad-lg">
                <h2 class="h-section">Experiência</h2>
                <p class="muted" style="margin-top:10px;line-height:1.6">${esc(pro.experience)}</p>
                <div class="chip-row" style="margin-top:16px">
                  ${pro.specialties.map((s) => `<span class="chip static">${esc(s)}</span>`).join("")}
                </div>
              </section>
            </div>

            <div class="stack">
              <section class="card">
                <h3 class="h-card">Atendimento</h3>
                <dl class="kv" style="grid-template-columns:1fr;margin-top:14px">
                  <div><dt>Modalidade</dt><dd>${esc(pro.modality)}</dd></div>
                  <div><dt>Local</dt><dd>${esc(pro.city)}</dd></div>
                  <div><dt>Disponibilidade</dt><dd>${esc(pro.availabilityNote)}</dd></div>
                </dl>
              </section>

              <section class="card">
                <h3 class="h-card">Planos GN Care</h3>
                <div class="stack" style="margin-top:12px">
                  ${plans
                    .map(
                      (p) => `<div class="row-between"><b>${esc(p.name)}</b><span class="muted">${money(p.price)}/mês</span></div>`
                    )
                    .join("")}
                </div>
                <button class="btn line block" data-route="#/cadastro" style="margin-top:16px">Ver planos e assinar</button>
              </section>
            </div>
          </div>

          <p class="small muted" style="text-align:center">Perfil de demonstração do GN Care. Profissional e avaliações são fictícios.</p>
        </div>
      </div>`,
    mount(root) {
      root.querySelector('[data-action="compartilhar"]').addEventListener("click", () => {
        const text = `Conheça o perfil de ${pro.name} no GN Care: ${shareUrl}`;
        if (navigator.share) {
          navigator.share({ title: `${pro.name} · GN Care`, text, url: shareUrl }).catch(() => {});
          return;
        }
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => toast("Link copiado. Cole no WhatsApp ou no Instagram."))
          .catch(() => toast(shareUrl, "warn"));
      });
    }
  };
}
