/* Camada de serviços do GN Care.
   A UI nunca fala com o localStorage direto: tudo passa por aqui, para que este
   arquivo possa ser trocado por uma API real sem mexer nas telas. */

import { seed, dayISO } from "./data.js";

const DB_KEY = "gncare.app.v1";
const SESSION_KEY = "gncare.session.v1";
const ERROR_KEY = "gncare.demo.error";
const LATENCY = 240;

let db = load();

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 2) return parsed;
    }
  } catch (e) {
    /* base corrompida: recria a partir do seed */
  }
  const fresh = seed();
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

function persist() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function wait(ms = LATENCY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* Falha controlada para demonstrar os estados de erro da interface. */
function guardConnection() {
  if (localStorage.getItem(ERROR_KEY) === "1") {
    throw new Error("Não foi possível falar com o servidor do GN Care.");
  }
}

async function read(fn, ms) {
  await wait(ms);
  guardConnection();
  return clone(fn());
}

async function write(fn, ms = 320) {
  await wait(ms);
  guardConnection();
  const result = fn();
  persist();
  return clone(result);
}

function clone(v) {
  return v === undefined ? v : JSON.parse(JSON.stringify(v));
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e3).toString(36)}`;
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function onlyDigits(v) {
  return String(v || "").replace(/\D/g, "");
}

/* ---------------- sessão ---------------- */

export const auth = {
  current() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  },

  async login(email, password, remember = true) {
    await wait();
    const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
    if (!user || user.password !== password) {
      const err = new Error("E-mail ou senha não conferem. Use os acessos de demonstração abaixo.");
      err.code = "credenciais";
      throw err;
    }
    const session = buildSession(user);
    store(session, remember);
    return clone(session);
  },

  async register(payload) {
    await wait(420);
    const email = String(payload.email || "").trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      const err = new Error("Já existe uma conta com esse e-mail.");
      err.code = "duplicado";
      throw err;
    }

    let refId;
    if (payload.role === "paciente") {
      const patient = {
        id: id("pac"),
        name: payload.name,
        initials: initials(payload.name),
        birth: payload.birth || "",
        cpf: "",
        phone: payload.phone || "",
        email,
        job: "",
        emergency: "",
        city: payload.city || "Salvador · BA",
        planId: "",
        professionalId: "",
        condition: payload.complaint || "A definir na avaliação",
        status: "ativo",
        since: dayISO(0),
        adherence: 0,
        frequency: 0,
        teleUsed: 0,
        presencialUsed: 0,
        notes: "",
        onboarded: false
      };
      db.patients.push(patient);
      db.treatments.push({
        patientId: patient.id,
        objective: "",
        startedAt: dayISO(0),
        frequency: "",
        duration: "",
        phase: "Aguardando avaliação",
        notes: "",
        goals: []
      });
      refId = patient.id;
    } else {
      const pro = {
        id: id("pro"),
        slug: String(payload.name).toLowerCase().replace(/[^a-z\s]/g, "").trim().replace(/\s+/g, "-"),
        name: payload.name,
        initials: initials(payload.name),
        crefito: payload.crefito || "CREFITO a confirmar",
        role: "Fisioterapeuta",
        specialties: (payload.specialties || "").split(",").map((s) => s.trim()).filter(Boolean),
        modality: payload.modality || "Teleatendimento",
        city: payload.city || "Salvador · BA",
        rating: 0,
        activePatients: 0,
        experience: "",
        bio: "",
        availabilityNote: "",
        photo: "../assets/gn-session.png"
      };
      db.professionals.push(pro);
      db.availability[pro.id] = {
        weekdays: [1, 2, 3, 4, 5],
        slots: ["09:00", "10:30", "14:00", "15:30", "17:00", "19:00"],
        presencialSlots: ["14:00", "15:30"],
        blocks: []
      };
      refId = pro.id;
    }

    const user = { id: id("u"), email, password: payload.password, role: payload.role, refId };
    db.users.push(user);
    persist();
    const session = buildSession(user);
    store(session, true);
    return clone(session);
  },

  async recover(email) {
    await wait(380);
    const exists = db.users.some((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
    return { sent: true, known: exists };
  },

  async resetPassword(email, password) {
    await wait(380);
    const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
    if (user) {
      user.password = password;
      persist();
    }
    return { ok: true };
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  refresh() {
    const session = this.current();
    if (!session) return null;
    const next = buildSession(db.users.find((u) => u.id === session.userId) || {});
    store(next, !!localStorage.getItem(SESSION_KEY));
    return next;
  }
};

function buildSession(user) {
  const person =
    user.role === "paciente"
      ? db.patients.find((p) => p.id === user.refId)
      : db.professionals.find((p) => p.id === user.refId);
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    refId: user.refId,
    name: person ? person.name : user.email,
    initials: person ? person.initials : "GN",
    subtitle: user.role === "paciente" ? planName(person && person.planId) : person && person.role,
    onboarded: user.role === "paciente" ? !!(person && person.onboarded) : true
  };
}

function store(session, remember) {
  const raw = JSON.stringify(session);
  if (remember) localStorage.setItem(SESSION_KEY, raw);
  else sessionStorage.setItem(SESSION_KEY, raw);
}

function planName(planId) {
  const plan = db.plans.find((p) => p.id === planId);
  return plan ? `Plano ${plan.name}` : "Plano a definir";
}

/* ---------------- consultas auxiliares ---------------- */

function patientById(patientId) {
  const patient = db.patients.find((p) => p.id === patientId);
  if (!patient) {
    const err = new Error("Paciente não encontrado.");
    err.code = "nao-encontrado";
    throw err;
  }
  return patient;
}

function exerciseById(exerciseId) {
  return db.exerciseLibrary.find((e) => e.id === exerciseId);
}

function hydratePrescription(pr) {
  const exercise = exerciseById(pr.exerciseId) || {};
  return {
    ...pr,
    name: exercise.name,
    category: exercise.category,
    area: exercise.area,
    minutes: exercise.minutes,
    image: exercise.image,
    steps: exercise.steps || [],
    cautions: exercise.cautions || ""
  };
}

function hydrateAppointment(ap) {
  const patient = db.patients.find((p) => p.id === ap.patientId);
  const pro = db.professionals.find((p) => p.id === ap.professionalId);
  return {
    ...ap,
    patientName: patient ? patient.name : "Paciente",
    patientInitials: patient ? patient.initials : "PT",
    professionalName: pro ? pro.name : "Fisioterapeuta",
    professionalInitials: pro ? pro.initials : "GN"
  };
}

function sortByDateTime(a, b) {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}

/* ---------------- catálogo ---------------- */

export const catalog = {
  plans: () => read(() => db.plans),
  professionals: () => read(() => db.professionals),
  exercises: () => read(() => db.exerciseLibrary),
  publicProfile: (slug) =>
    read(() => {
      const pro = db.professionals.find((p) => p.slug === slug) || db.professionals[0];
      return pro;
    })
};

/* ---------------- área do paciente ---------------- */

export const patientApi = {
  overview: (patientId) =>
    read(() => {
      const patient = patientById(patientId);
      const plan = db.plans.find((p) => p.id === patient.planId) || null;
      const pro = db.professionals.find((p) => p.id === patient.professionalId) || null;
      const treatment = db.treatments.find((t) => t.patientId === patientId) || null;
      const today = dayISO(0);
      const list = db.appointments.filter((a) => a.patientId === patientId).sort(sortByDateTime);
      const next = list.find((a) => a.date >= today && a.status !== "cancelado") || null;
      const items = db.prescriptions.filter((p) => p.patientId === patientId).map(hydratePrescription);
      const evolution = db.evolutions
        .filter((e) => e.patientId === patientId)
        .sort((a, b) => b.date.localeCompare(a.date));
      return {
        patient,
        plan,
        professional: pro,
        treatment,
        nextAppointment: next ? hydrateAppointment(next) : null,
        exercises: items,
        doneToday: items.filter((i) => i.status === "done").length,
        totalToday: items.length,
        evolution: evolution.slice(0, 4),
        lastEvolution: evolution[0] || null,
        notifications: db.notifications.filter((n) => n.role === "paciente" && n.patientId === patientId)
      };
    }),

  treatment: (patientId) =>
    read(() => {
      const patient = patientById(patientId);
      return {
        patient,
        treatment: db.treatments.find((t) => t.patientId === patientId) || null,
        professional: db.professionals.find((p) => p.id === patient.professionalId) || null,
        plan: db.plans.find((p) => p.id === patient.planId) || null,
        exercises: db.prescriptions.filter((p) => p.patientId === patientId).map(hydratePrescription),
        evaluations: db.evaluations.filter((e) => e.patientId === patientId),
        evolutions: db.evolutions.filter((e) => e.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date))
      };
    }),

  exercises: (patientId) =>
    read(() => db.prescriptions.filter((p) => p.patientId === patientId).map(hydratePrescription)),

  exercise: (prescriptionId) =>
    read(() => {
      const pr = db.prescriptions.find((p) => p.id === prescriptionId);
      if (!pr) {
        const err = new Error("Exercício não encontrado no seu programa.");
        err.code = "nao-encontrado";
        throw err;
      }
      return hydratePrescription(pr);
    }),

  setExerciseStatus: (prescriptionId, status) =>
    write(() => {
      const pr = db.prescriptions.find((p) => p.id === prescriptionId);
      if (!pr) throw new Error("Exercício não encontrado.");
      pr.status = status;
      if (status === "done") {
        pr.lastDone = dayISO(0);
        pr.adherence = Math.min(100, (pr.adherence || 0) + 4);
        const patient = db.patients.find((p) => p.id === pr.patientId);
        if (patient) patient.adherence = adherenceOf(patient.id);
      }
      return hydratePrescription(pr);
    }, 260),

  appointments: (patientId) =>
    read(() => {
      const today = dayISO(0);
      const all = db.appointments.filter((a) => a.patientId === patientId).map(hydrateAppointment).sort(sortByDateTime);
      return {
        next: all.filter((a) => a.date >= today && a.status !== "cancelado" && a.status !== "realizado"),
        past: all.filter((a) => a.date < today || a.status === "realizado" || a.status === "cancelado").reverse()
      };
    }),

  slots: (professionalId, date) =>
    read(() => {
      const conf = db.availability[professionalId] || db.availability["pro-1"];
      const weekday = new Date(`${date}T12:00:00`).getDay();
      if (!conf.weekdays.includes(weekday)) return [];
      const taken = db.appointments
        .filter((a) => a.professionalId === professionalId && a.date === date && a.status !== "cancelado")
        .map((a) => a.time);
      const blocked = (conf.blocks || []).filter((b) => b.date === date).map((b) => b.time);
      return conf.slots.map((time) => ({
        time,
        mode: conf.presencialSlots.includes(time) ? "presencial" : "tele",
        free: !taken.includes(time) && !blocked.includes(time)
      }));
    }, 200),

  book: (data) =>
    write(() => {
      const conflict = db.appointments.find(
        (a) =>
          a.professionalId === data.professionalId &&
          a.date === data.date &&
          a.time === data.time &&
          a.status !== "cancelado"
      );
      if (conflict) {
        const err = new Error("Esse horário acabou de ser ocupado. Escolha outro.");
        err.code = "conflito";
        throw err;
      }
      const appointment = {
        id: id("ap"),
        patientId: data.patientId,
        professionalId: data.professionalId,
        date: data.date,
        time: data.time,
        mode: data.mode,
        type: data.type || "Acompanhamento",
        duration: data.duration || "45 minutos",
        status: "solicitado",
        note: data.note || ""
      };
      db.appointments.push(appointment);
      db.notifications.unshift({
        id: id("n"),
        role: "fisioterapeuta",
        text: `Nova solicitação de atendimento para ${data.date} às ${data.time}.`,
        date: dayISO(0),
        read: false
      });
      return hydrateAppointment(appointment);
    }),

  cancel: (appointmentId) =>
    write(() => {
      const ap = db.appointments.find((a) => a.id === appointmentId);
      if (!ap) throw new Error("Atendimento não encontrado.");
      ap.status = "cancelado";
      return hydrateAppointment(ap);
    }, 260),

  reschedule: (appointmentId, date, time, mode) =>
    write(() => {
      const ap = db.appointments.find((a) => a.id === appointmentId);
      if (!ap) throw new Error("Atendimento não encontrado.");
      ap.date = date;
      ap.time = time;
      if (mode) ap.mode = mode;
      ap.status = "solicitado";
      return hydrateAppointment(ap);
    }, 260),

  evolution: (patientId) =>
    read(() => {
      const patient = patientById(patientId);
      const list = db.evolutions.filter((e) => e.patientId === patientId).sort((a, b) => a.date.localeCompare(b.date));
      const items = db.prescriptions.filter((p) => p.patientId === patientId).map(hydratePrescription);
      const done = db.appointments.filter((a) => a.patientId === patientId && a.status === "realizado").length;
      return {
        patient,
        series: list,
        last: list[list.length - 1] || null,
        first: list[0] || null,
        exercises: items,
        appointmentsDone: done,
        treatment: db.treatments.find((t) => t.patientId === patientId) || null
      };
    }),

  documents: (patientId) => read(() => db.documents.filter((d) => d.patientId === patientId)),

  professional: (patientId) =>
    read(() => {
      const patient = patientById(patientId);
      const pro = db.professionals.find((p) => p.id === patient.professionalId) || null;
      const history = db.appointments
        .filter((a) => a.patientId === patientId && a.status === "realizado")
        .sort((a, b) => b.date.localeCompare(a.date));
      return { professional: pro, history };
    }),

  profile: (patientId) =>
    read(() => {
      const patient = patientById(patientId);
      return { patient, plan: db.plans.find((p) => p.id === patient.planId) || null };
    }),

  updateProfile: (patientId, data) =>
    write(() => {
      const patient = patientById(patientId);
      Object.assign(patient, data);
      patient.initials = initials(patient.name);
      return patient;
    }, 260),

  completeOnboarding: (patientId, answers) =>
    write(() => {
      const patient = patientById(patientId);
      patient.professionalId = answers.professionalId;
      patient.planId = answers.planId;
      patient.condition = answers.objective || patient.condition;
      patient.onboarded = true;
      const treatment = db.treatments.find((t) => t.patientId === patientId);
      if (treatment) {
        treatment.objective = answers.objective || treatment.objective;
        treatment.frequency = answers.frequency || "A definir na avaliação";
        treatment.phase = "Aguardando avaliação inicial";
      }
      db.notifications.unshift({
        id: id("n"),
        role: "paciente",
        patientId,
        text: "Cadastro concluído. Agende sua avaliação inicial.",
        date: dayISO(0),
        read: false
      });
      return patient;
    })
};

function adherenceOf(patientId) {
  const list = db.prescriptions.filter((p) => p.patientId === patientId);
  if (!list.length) return 0;
  return Math.round(list.reduce((acc, p) => acc + (p.adherence || 0), 0) / list.length);
}

/* ---------------- área do profissional ---------------- */

export const proApi = {
  dashboard: (professionalId) =>
    read(() => {
      const pro = db.professionals.find((p) => p.id === professionalId) || db.professionals[0];
      const mine = db.patients.filter((p) => p.professionalId === pro.id);
      const today = dayISO(0);
      const agenda = db.appointments
        .filter((a) => a.professionalId === pro.id && a.date === today && a.status !== "cancelado")
        .map(hydrateAppointment)
        .sort(sortByDateTime);
      const pending = db.appointments.filter((a) => a.professionalId === pro.id && a.status === "solicitado");
      const attention = mine.filter((p) => p.status === "atencao" || p.adherence < 60);
      const adherence = mine.length ? Math.round(mine.reduce((a, p) => a + p.adherence, 0) / mine.length) : 0;
      return {
        professional: pro,
        patients: mine,
        agenda,
        pending: pending.map(hydrateAppointment),
        attention,
        activity: db.activity,
        notifications: db.notifications.filter((n) => n.role === "fisioterapeuta"),
        kpis: {
          active: mine.length,
          today: agenda.length,
          rating: pro.rating,
          adherence,
          revaluations: db.evaluations.length
        }
      };
    }),

  patients: (professionalId, { search = "", filter = "todos" } = {}) =>
    read(() => {
      const today = dayISO(0);
      let list = db.patients.filter((p) => p.professionalId === professionalId);
      if (filter === "ativos") list = list.filter((p) => p.status === "ativo");
      if (filter === "atencao") list = list.filter((p) => p.status === "atencao" || p.adherence < 60);
      if (filter === "reavaliacao") list = list.filter((p) => p.status === "reavaliacao");
      const term = search.trim().toLowerCase();
      if (term) {
        list = list.filter((p) =>
          [p.name, p.phone, p.condition, p.email].join(" ").toLowerCase().includes(term)
        );
      }
      return list.map((p) => {
        const appts = db.appointments.filter((a) => a.patientId === p.id && a.status !== "cancelado").sort(sortByDateTime);
        const next = appts.find((a) => a.date >= today && a.status !== "realizado");
        const last = [...appts].reverse().find((a) => a.date < today || a.status === "realizado");
        return {
          ...p,
          planName: (db.plans.find((pl) => pl.id === p.planId) || {}).name || "Sem plano",
          next: next ? hydrateAppointment(next) : null,
          last: last ? hydrateAppointment(last) : null
        };
      });
    }),

  addPatient: (professionalId, data) =>
    write(() => {
      const phone = onlyDigits(data.phone);
      const existing = db.patients.find((p) => onlyDigits(p.phone) === phone && phone.length > 0);
      if (existing) return { duplicate: true, patient: existing };
      const patient = {
        id: id("pac"),
        name: data.name,
        initials: initials(data.name),
        birth: data.birth || "",
        cpf: data.cpf || "",
        phone: data.phone || "",
        email: data.email || "",
        job: data.job || "",
        emergency: data.emergency || "",
        city: "Salvador · BA",
        planId: data.planId || "",
        professionalId,
        condition: data.complaint || "A definir na avaliação",
        status: "ativo",
        since: dayISO(0),
        adherence: 0,
        frequency: 0,
        teleUsed: 0,
        presencialUsed: 0,
        notes: data.notes || "",
        onboarded: true
      };
      db.patients.push(patient);
      db.treatments.push({
        patientId: patient.id,
        objective: "",
        startedAt: dayISO(0),
        frequency: data.frequency || "",
        duration: "",
        phase: "Aguardando avaliação",
        notes: "",
        goals: []
      });
      db.activity.unshift({ id: id("at"), text: `${patient.name} foi adicionado à sua carteira`, date: dayISO(0), kind: "paciente" });
      return { duplicate: false, patient };
    }),

  patient: (patientId) =>
    read(() => {
      const patient = patientById(patientId);
      const today = dayISO(0);
      const appts = db.appointments.filter((a) => a.patientId === patientId).map(hydrateAppointment).sort(sortByDateTime);
      return {
        patient,
        plan: db.plans.find((p) => p.id === patient.planId) || null,
        treatment: db.treatments.find((t) => t.patientId === patientId) || null,
        evaluations: db.evaluations.filter((e) => e.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date)),
        evolutions: db.evolutions.filter((e) => e.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date)),
        exercises: db.prescriptions.filter((p) => p.patientId === patientId).map(hydratePrescription),
        documents: db.documents.filter((d) => d.patientId === patientId),
        appointments: appts,
        next: appts.find((a) => a.date >= today && a.status !== "realizado" && a.status !== "cancelado") || null
      };
    }),

  updatePatient: (patientId, data) =>
    write(() => {
      const patient = patientById(patientId);
      Object.assign(patient, data);
      patient.initials = initials(patient.name);
      return patient;
    }, 260),

  saveEvaluation: (patientId, data) =>
    write(() => {
      const evaluation = { id: id("av"), patientId, date: data.date || dayISO(0), kind: data.kind || "Reavaliação", ...data };
      db.evaluations.push(evaluation);
      db.documents.push({
        id: id("doc"),
        patientId,
        title: `${evaluation.kind} · ${formatBR(evaluation.date)}`,
        kind: "Avaliação",
        date: evaluation.date,
        owner: "João Silva"
      });
      return evaluation;
    }),

  saveTreatment: (patientId, data) =>
    write(() => {
      let treatment = db.treatments.find((t) => t.patientId === patientId);
      if (!treatment) {
        treatment = { patientId, goals: [] };
        db.treatments.push(treatment);
      }
      Object.assign(treatment, data);
      return treatment;
    }),

  addGoal: (patientId, title, horizon) =>
    write(() => {
      const treatment = db.treatments.find((t) => t.patientId === patientId);
      treatment.goals.push({ id: id("g"), title, horizon: horizon || "Ciclo atual", progress: 0 });
      return treatment;
    }, 220),

  updateGoal: (patientId, goalId, progress) =>
    write(() => {
      const treatment = db.treatments.find((t) => t.patientId === patientId);
      const goal = treatment.goals.find((g) => g.id === goalId);
      if (goal) goal.progress = progress;
      return treatment;
    }, 180),

  prescribe: (patientId, data) =>
    write(() => {
      const prescription = {
        id: id("pr"),
        patientId,
        exerciseId: data.exerciseId,
        sets: Number(data.sets) || 3,
        reps: data.reps || "12 repetições",
        frequency: data.frequency || "3x por semana",
        rest: data.rest || "60 segundos",
        notes: data.notes || "",
        status: "pending",
        adherence: 0,
        lastDone: null
      };
      db.prescriptions.push(prescription);
      db.notifications.unshift({
        id: id("n"),
        role: "paciente",
        patientId,
        text: "Seu fisioterapeuta atualizou o programa de exercícios.",
        date: dayISO(0),
        read: false
      });
      return hydratePrescription(prescription);
    }),

  removePrescription: (prescriptionId) =>
    write(() => {
      db.prescriptions = db.prescriptions.filter((p) => p.id !== prescriptionId);
      return { ok: true };
    }, 220),

  saveEvolution: (patientId, data) =>
    write(() => {
      const evolution = {
        id: id("ev"),
        patientId,
        date: data.date || dayISO(0),
        pain: Number(data.pain),
        adherence: Number(data.adherence),
        rom: data.rom ? Number(data.rom) : null,
        text: data.text,
        conduct: data.conduct || "",
        next: data.next || "",
        author: data.author || "João Silva"
      };
      db.evolutions.push(evolution);
      const patient = db.patients.find((p) => p.id === patientId);
      if (patient) patient.adherence = evolution.adherence;
      db.activity.unshift({ id: id("at"), text: `Nova evolução registrada para ${patient ? patient.name : "paciente"}`, date: dayISO(0), kind: "avaliacao" });
      return evolution;
    }),

  addDocument: (patientId, title, kind) =>
    write(() => {
      const doc = { id: id("doc"), patientId, title, kind: kind || "Orientação", date: dayISO(0), owner: "João Silva" };
      db.documents.push(doc);
      return doc;
    }, 240),

  agenda: (professionalId, offsetWeeks = 0) =>
    read(() => {
      const start = startOfWeek(offsetWeeks);
      const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
      const conf = db.availability[professionalId] || db.availability["pro-1"];
      return {
        days: days.map((date) => ({
          date,
          weekday: new Date(`${date}T12:00:00`).getDay(),
          events: db.appointments
            .filter((a) => a.professionalId === professionalId && a.date === date && a.status !== "cancelado")
            .map(hydrateAppointment)
            .sort(sortByDateTime),
          blocks: (conf.blocks || []).filter((b) => b.date === date)
        })),
        availability: conf,
        pending: db.appointments.filter((a) => a.professionalId === professionalId && a.status === "solicitado").map(hydrateAppointment)
      };
    }),

  createAppointment: (professionalId, data) =>
    write(() => {
      const conflict = db.appointments.find(
        (a) => a.professionalId === professionalId && a.date === data.date && a.time === data.time && a.status !== "cancelado"
      );
      if (conflict) {
        const err = new Error("Já existe atendimento nesse horário.");
        err.code = "conflito";
        throw err;
      }
      const appointment = {
        id: id("ap"),
        patientId: data.patientId,
        professionalId,
        date: data.date,
        time: data.time,
        mode: data.mode || "tele",
        type: data.type || "Acompanhamento",
        duration: data.duration || "45 minutos",
        status: "confirmado",
        note: data.note || ""
      };
      db.appointments.push(appointment);
      return hydrateAppointment(appointment);
    }),

  setAppointmentStatus: (appointmentId, status) =>
    write(() => {
      const ap = db.appointments.find((a) => a.id === appointmentId);
      if (!ap) throw new Error("Atendimento não encontrado.");
      ap.status = status;
      return hydrateAppointment(ap);
    }, 220),

  blockSlot: (professionalId, date, time, reason) =>
    write(() => {
      const conf = db.availability[professionalId] || db.availability["pro-1"];
      conf.blocks = conf.blocks || [];
      conf.blocks.push({ id: id("bl"), date, time, reason: reason || "Bloqueio de agenda" });
      return conf;
    }, 240),

  removeBlock: (professionalId, blockId) =>
    write(() => {
      const conf = db.availability[professionalId];
      conf.blocks = (conf.blocks || []).filter((b) => b.id !== blockId);
      return conf;
    }, 200),

  setAvailability: (professionalId, slots, presencialSlots, weekdays) =>
    write(() => {
      const conf = db.availability[professionalId] || (db.availability[professionalId] = { blocks: [] });
      conf.slots = slots;
      conf.presencialSlots = presencialSlots;
      conf.weekdays = weekdays;
      return conf;
    }),

  updateProfessional: (professionalId, data) =>
    write(() => {
      const pro = db.professionals.find((p) => p.id === professionalId);
      Object.assign(pro, data);
      pro.initials = initials(pro.name);
      return pro;
    }, 260)
};

/* ---------------- teleatendimento ---------------- */

export const teleApi = {
  room: (appointmentId) =>
    read(() => {
      const ap = db.appointments.find((a) => a.id === appointmentId);
      if (!ap) {
        const err = new Error("Atendimento não encontrado ou já encerrado.");
        err.code = "nao-encontrado";
        throw err;
      }
      const patient = db.patients.find((p) => p.id === ap.patientId);
      return {
        appointment: hydrateAppointment(ap),
        patient,
        treatment: db.treatments.find((t) => t.patientId === ap.patientId) || null,
        exercises: db.prescriptions.filter((p) => p.patientId === ap.patientId).map(hydratePrescription),
        lastEvolution: db.evolutions.filter((e) => e.patientId === ap.patientId).sort((a, b) => b.date.localeCompare(a.date))[0] || null,
        messages: db.messages.filter((m) => m.appointmentId === appointmentId)
      };
    }, 200),

  send: (appointmentId, author, text) =>
    write(() => {
      const message = { id: id("m"), appointmentId, author, text, at: new Date().toISOString() };
      db.messages.push(message);
      return message;
    }, 120),

  finish: (appointmentId) =>
    write(() => {
      const ap = db.appointments.find((a) => a.id === appointmentId);
      if (ap) ap.status = "realizado";
      return ap ? hydrateAppointment(ap) : null;
    }, 220)
};

/* ---------------- utilidades compartilhadas ---------------- */

export const demo = {
  isOffline: () => localStorage.getItem(ERROR_KEY) === "1",
  setOffline: (value) => {
    if (value) localStorage.setItem(ERROR_KEY, "1");
    else localStorage.removeItem(ERROR_KEY);
  },
  reset: () => {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(ERROR_KEY);
    db = load();
  }
};

export function formatBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export function startOfWeek(offsetWeeks = 0) {
  const now = new Date(`${dayISO(0)}T12:00:00`);
  const diff = now.getDay();
  now.setDate(now.getDate() - diff + offsetWeeks * 7);
  return now.toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export { dayISO };
