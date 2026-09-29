/* Dados fictícios do GN Care. Nada aqui representa paciente, profissional ou
   pagamento real: é a base de demonstração do protótipo. */

const DAY = 86400000;
const base = new Date();
base.setHours(0, 0, 0, 0);

export function dayISO(offset = 0) {
  return new Date(base.getTime() + offset * DAY).toISOString().slice(0, 10);
}

export const plans = [
  {
    id: "premium",
    name: "Premium",
    tag: "Essencial",
    price: 96.99,
    tele: 4,
    presencial: 0,
    features: ["4 teleconsultas por mês", "Programa de exercícios", "Histórico do tratamento", "Entrada na sala virtual"]
  },
  {
    id: "ouro",
    name: "Ouro",
    tag: "Mais escolhido",
    price: 196.99,
    tele: 6,
    presencial: 2,
    featured: true,
    features: ["6 teleconsultas por mês", "2 atendimentos presenciais", "Prioridade de agenda", "Acompanhamento de evolução"]
  },
  {
    id: "platinum",
    name: "Platinum",
    tag: "Completo",
    price: 296.99,
    tele: 8,
    presencial: 3,
    features: ["8 teleconsultas por mês", "3 atendimentos presenciais", "Reavaliação do programa", "Acompanhamento completo"]
  }
];

export const professionals = [
  {
    id: "pro-1",
    slug: "joao-silva",
    name: "João Silva",
    initials: "JS",
    crefito: "CREFITO 000000-F",
    role: "Fisioterapeuta",
    specialties: ["Ortopedia", "Fisioterapia Esportiva", "Osteopatia"],
    modality: "Teleatendimento + Presencial",
    city: "Salvador · BA",
    rating: 4.9,
    activePatients: 28,
    experience: "12 anos de atuação em reabilitação ortopédica e esportiva.",
    bio: "Atendimento humanizado, acompanhamento contínuo e foco em retorno à função. Trabalho com programas curtos, revisados a cada reavaliação.",
    availabilityNote: "Atende de segunda a sexta, das 08h às 21h.",
    photo: "../assets/gn-session.png"
  },
  {
    id: "pro-2",
    slug: "ana-marques",
    name: "Ana Marques",
    initials: "AM",
    crefito: "CREFITO 000001-F",
    role: "Fisioterapeuta",
    specialties: ["Gerontologia", "Equilíbrio e quedas", "Neurofuncional"],
    modality: "Teleatendimento",
    city: "Salvador · BA",
    rating: 4.8,
    activePatients: 21,
    experience: "9 anos com foco em pessoas idosas e reabilitação funcional.",
    bio: "Programas leves e progressivos, com exercícios possíveis de fazer em casa com apoio de cadeira.",
    availabilityNote: "Atende de segunda a quinta, das 09h às 18h.",
    photo: "../assets/idoso-equilibrio.png"
  },
  {
    id: "pro-3",
    slug: "rafaela-dias",
    name: "Rafaela Dias",
    initials: "RD",
    crefito: "CREFITO 000002-F",
    role: "Fisioterapeuta",
    specialties: ["Coluna", "Dor crônica", "Pilates clínico"],
    modality: "Teleatendimento + Presencial",
    city: "Salvador · BA",
    rating: 4.7,
    activePatients: 17,
    experience: "7 anos em reabilitação de coluna e educação em dor.",
    bio: "Acompanhamento de dor lombar e cervical com foco em rotina e consistência.",
    availabilityNote: "Atende de terça a sábado, das 07h às 16h.",
    photo: "../assets/gn-exercise.png"
  }
];

export const exerciseLibrary = [
  {
    id: "ex-quadriceps",
    name: "Fortalecimento de quadríceps",
    category: "Força",
    area: "Joelho",
    minutes: 8,
    sets: 3,
    reps: "12 repetições",
    image: "../assets/idoso-exercicio.png",
    steps: [
      "Sente-se com a coluna apoiada no encosto e os pés no chão.",
      "Estenda um joelho até a perna ficar na linha do quadril.",
      "Segure 2 segundos no topo e desça devagar.",
      "Troque de perna e mantenha a respiração solta."
    ],
    cautions: "Interrompa se a dor passar de 4 na escala combinada com seu fisioterapeuta."
  },
  {
    id: "ex-mobilidade-quadril",
    name: "Mobilidade de quadril",
    category: "Mobilidade",
    area: "Quadril",
    minutes: 6,
    sets: 3,
    reps: "30 segundos",
    image: "../assets/gn-exercise.png",
    steps: [
      "Em pé, apoie uma das mãos no encosto da cadeira.",
      "Leve o joelho à frente até a altura do quadril.",
      "Abra o quadril levando o joelho para fora sem girar o tronco.",
      "Retorne devagar e repita do outro lado."
    ],
    cautions: "Movimento lento: a amplitude importa mais que a velocidade."
  },
  {
    id: "ex-agachamento",
    name: "Agachamento com apoio",
    category: "Força",
    area: "Membros inferiores",
    minutes: 10,
    sets: 3,
    reps: "12 repetições",
    image: "../assets/gn-session.png",
    steps: [
      "Fique em pé de frente para a cadeira, pés na largura do quadril.",
      "Desça o quadril para trás como se fosse sentar.",
      "Toque o assento levemente e volte a subir.",
      "Mantenha os joelhos alinhados com os pés."
    ],
    cautions: "Use a cadeira como referência de profundidade, não como descanso."
  },
  {
    id: "ex-ponte",
    name: "Ponte de quadril",
    category: "Controle",
    area: "Quadril",
    minutes: 7,
    sets: 3,
    reps: "15 repetições",
    image: "../assets/idoso-exercicio.png",
    steps: [
      "Deite-se de barriga para cima com os joelhos dobrados.",
      "Contraia o abdômen e eleve o quadril até alinhar tronco e coxa.",
      "Segure 2 segundos e desça vértebra por vértebra."
    ],
    cautions: "Evite arquear a lombar no topo do movimento."
  },
  {
    id: "ex-tornozelo",
    name: "Mobilidade de tornozelo",
    category: "Mobilidade",
    area: "Tornozelo",
    minutes: 5,
    sets: 3,
    reps: "30 segundos",
    image: "../assets/idoso-equilibrio.png",
    steps: [
      "Sentado, apoie o pé no chão e mantenha o calcanhar fixo.",
      "Leve o joelho à frente sem tirar o calcanhar do chão.",
      "Volte devagar e repita de forma contínua."
    ],
    cautions: "Sem dor aguda na frente do tornozelo."
  },
  {
    id: "ex-equilibrio",
    name: "Equilíbrio unipodal",
    category: "Equilíbrio",
    area: "Global",
    minutes: 6,
    sets: 3,
    reps: "30 segundos",
    image: "../assets/idoso-equilibrio.png",
    steps: [
      "Fique ao lado da cadeira com uma das mãos apoiada.",
      "Tire um pé do chão e mantenha o equilíbrio.",
      "Solte a mão do apoio somente se estiver seguro."
    ],
    cautions: "Faça sempre perto de um apoio firme."
  },
  {
    id: "ex-afundo",
    name: "Afundo lateral",
    category: "Força",
    area: "Membros inferiores",
    minutes: 9,
    sets: 3,
    reps: "10 repetições",
    image: "../assets/gn-exercise.png",
    steps: [
      "Em pé, dê um passo lateral amplo.",
      "Desloque o peso para a perna que se afastou, dobrando o joelho.",
      "Empurre o chão para voltar ao centro."
    ],
    cautions: "Tronco levemente à frente, joelho na direção do pé."
  },
  {
    id: "ex-cervical",
    name: "Mobilidade cervical",
    category: "Mobilidade",
    area: "Coluna",
    minutes: 5,
    sets: 2,
    reps: "10 repetições",
    image: "../assets/idoso-tele.png",
    steps: [
      "Sentado, olhe para frente com os ombros relaxados.",
      "Gire a cabeça devagar para um lado até sentir leve alongamento.",
      "Retorne ao centro e repita para o outro lado."
    ],
    cautions: "Sem tontura: se aparecer, pare e avise seu fisioterapeuta."
  }
];

export const patients = [
  {
    id: "pac-1",
    name: "Gabriel Santos",
    initials: "GS",
    birth: "1990-05-12",
    cpf: "000.000.000-00",
    phone: "(71) 99999-0000",
    email: "gabriel@email.com",
    job: "Administrador",
    emergency: "Informado no cadastro",
    city: "Salvador · BA",
    planId: "ouro",
    professionalId: "pro-1",
    condition: "Ortopedia · joelho direito",
    status: "ativo",
    since: dayISO(-55),
    adherence: 80,
    frequency: 90,
    teleUsed: 4,
    presencialUsed: 0,
    notes: "Prefere atendimentos à noite. Plano Ouro com presenciais disponíveis.",
    onboarded: true
  },
  {
    id: "pac-2",
    name: "Mariana Costa",
    initials: "MC",
    birth: "1985-11-03",
    cpf: "000.000.000-00",
    phone: "(71) 98888-0000",
    email: "mariana@email.com",
    job: "Professora",
    emergency: "Informado no cadastro",
    city: "Salvador · BA",
    planId: "ouro",
    professionalId: "pro-1",
    condition: "Joelho · pós-operatório",
    status: "reavaliacao",
    since: dayISO(-120),
    adherence: 71,
    frequency: 84,
    teleUsed: 3,
    presencialUsed: 1,
    notes: "Reavaliação programada para o próximo ciclo.",
    onboarded: true
  },
  {
    id: "pac-3",
    name: "Lucas Almeida",
    initials: "LA",
    birth: "1978-02-20",
    cpf: "000.000.000-00",
    phone: "(71) 97777-0000",
    email: "lucas@email.com",
    job: "Motorista",
    emergency: "Informado no cadastro",
    city: "Lauro de Freitas · BA",
    planId: "platinum",
    professionalId: "pro-1",
    condition: "Coluna · dor lombar",
    status: "atencao",
    since: dayISO(-40),
    adherence: 46,
    frequency: 58,
    teleUsed: 2,
    presencialUsed: 1,
    notes: "Faltou ao último atendimento. Acompanhar frequência.",
    onboarded: true
  },
  {
    id: "pac-4",
    name: "Rafael Souza",
    initials: "RS",
    birth: "1996-07-09",
    cpf: "000.000.000-00",
    phone: "(71) 96666-0000",
    email: "rafael@email.com",
    job: "Vendedor",
    emergency: "Informado no cadastro",
    city: "Salvador · BA",
    planId: "premium",
    professionalId: "pro-1",
    condition: "Esporte · tornozelo",
    status: "ativo",
    since: dayISO(-18),
    adherence: 88,
    frequency: 92,
    teleUsed: 1,
    presencialUsed: 0,
    notes: "Retorno ao futebol recreativo como objetivo.",
    onboarded: true
  }
];

export const treatments = [
  {
    patientId: "pac-1",
    objective: "Voltar a subir escadas e caminhar 40 minutos sem dor no joelho.",
    startedAt: dayISO(-55),
    frequency: "3x por semana",
    duration: "12 semanas",
    phase: "Fase 2 · fortalecimento",
    notes: "Programa revisado após a última reavaliação. Manter carga atual por mais duas semanas.",
    goals: [
      { id: "g1", title: "Reduzir o desconforto no joelho", progress: 80, horizon: "Até a próxima reavaliação" },
      { id: "g2", title: "Aumentar força funcional de membros inferiores", progress: 65, horizon: "12 semanas" },
      { id: "g3", title: "Retornar à corrida leve", progress: 40, horizon: "Ciclo seguinte" }
    ]
  },
  {
    patientId: "pac-2",
    objective: "Recuperar amplitude do joelho operado e retomar a rotina de trabalho em pé.",
    startedAt: dayISO(-120),
    frequency: "2x por semana",
    duration: "16 semanas",
    phase: "Fase 3 · controle motor",
    notes: "Evoluir para exercícios em apoio unipodal conforme tolerância.",
    goals: [
      { id: "g1", title: "Amplitude de flexão acima de 120°", progress: 72, horizon: "8 semanas" },
      { id: "g2", title: "Permanecer 4h em pé sem dor", progress: 55, horizon: "Ciclo seguinte" }
    ]
  },
  {
    patientId: "pac-3",
    objective: "Controlar a dor lombar durante a jornada de trabalho sentado.",
    startedAt: dayISO(-40),
    frequency: "3x por semana",
    duration: "10 semanas",
    phase: "Fase 1 · educação em dor",
    notes: "Reforçar adesão: paciente tem faltado às sessões.",
    goals: [{ id: "g1", title: "Fazer as pausas ativas no trabalho", progress: 35, horizon: "4 semanas" }]
  },
  {
    patientId: "pac-4",
    objective: "Retomar o futebol recreativo sem instabilidade no tornozelo.",
    startedAt: dayISO(-18),
    frequency: "3x por semana",
    duration: "8 semanas",
    phase: "Fase 2 · propriocepção",
    notes: "Boa adesão. Evoluir equilíbrio para superfície instável.",
    goals: [{ id: "g1", title: "Equilíbrio unipodal por 45 segundos", progress: 60, horizon: "6 semanas" }]
  }
];

export const prescriptions = [
  {
    id: "pr-1",
    patientId: "pac-1",
    exerciseId: "ex-quadriceps",
    sets: 3,
    reps: "12 repetições",
    frequency: "3x por semana",
    rest: "60 segundos",
    notes: "Manter o movimento lento na descida.",
    status: "done",
    adherence: 92,
    lastDone: dayISO(-1)
  },
  {
    id: "pr-2",
    patientId: "pac-1",
    exerciseId: "ex-mobilidade-quadril",
    sets: 3,
    reps: "30 segundos",
    frequency: "Diariamente",
    rest: "30 segundos",
    notes: "Fazer antes do fortalecimento.",
    status: "pending",
    adherence: 71,
    lastDone: dayISO(-2)
  },
  {
    id: "pr-3",
    patientId: "pac-1",
    exerciseId: "ex-agachamento",
    sets: 3,
    reps: "12 repetições",
    frequency: "3x por semana",
    rest: "60 segundos",
    notes: "Usar a cadeira como referência de profundidade.",
    status: "pending",
    adherence: 84,
    lastDone: dayISO(-3)
  },
  {
    id: "pr-4",
    patientId: "pac-1",
    exerciseId: "ex-equilibrio",
    sets: 3,
    reps: "30 segundos",
    frequency: "4x por semana",
    rest: "45 segundos",
    notes: "Sempre próximo a um apoio firme.",
    status: "pending",
    adherence: 78,
    lastDone: dayISO(-4)
  },
  {
    id: "pr-5",
    patientId: "pac-2",
    exerciseId: "ex-ponte",
    sets: 3,
    reps: "15 repetições",
    frequency: "3x por semana",
    rest: "45 segundos",
    notes: "Subir até alinhar tronco e coxa.",
    status: "pending",
    adherence: 68,
    lastDone: dayISO(-2)
  },
  {
    id: "pr-6",
    patientId: "pac-3",
    exerciseId: "ex-cervical",
    sets: 2,
    reps: "10 repetições",
    frequency: "Diariamente",
    rest: "30 segundos",
    notes: "Pausa ativa a cada duas horas de trabalho.",
    status: "pending",
    adherence: 40,
    lastDone: dayISO(-6)
  },
  {
    id: "pr-7",
    patientId: "pac-4",
    exerciseId: "ex-tornozelo",
    sets: 3,
    reps: "30 segundos",
    frequency: "3x por semana",
    rest: "30 segundos",
    notes: "Calcanhar sempre apoiado.",
    status: "done",
    adherence: 90,
    lastDone: dayISO(-1)
  }
];

export const appointments = [
  {
    id: "ap-1",
    patientId: "pac-1",
    professionalId: "pro-1",
    date: dayISO(0),
    time: "19:00",
    mode: "tele",
    type: "Acompanhamento",
    duration: "45 minutos",
    status: "confirmado",
    note: "Revisar carga do programa."
  },
  {
    id: "ap-2",
    patientId: "pac-1",
    professionalId: "pro-1",
    date: dayISO(9),
    time: "15:00",
    mode: "presencial",
    type: "Reavaliação",
    duration: "60 minutos",
    status: "confirmado",
    note: "Reavaliação na GN Fisioterapia."
  },
  {
    id: "ap-3",
    patientId: "pac-1",
    professionalId: "pro-1",
    date: dayISO(-6),
    time: "19:00",
    mode: "tele",
    type: "Acompanhamento",
    duration: "45 minutos",
    status: "realizado",
    note: ""
  },
  {
    id: "ap-4",
    patientId: "pac-1",
    professionalId: "pro-1",
    date: dayISO(-55),
    time: "09:00",
    mode: "presencial",
    type: "Avaliação inicial",
    duration: "60 minutos",
    status: "realizado",
    note: "Avaliação inicial presencial."
  },
  {
    id: "ap-5",
    patientId: "pac-2",
    professionalId: "pro-1",
    date: dayISO(0),
    time: "20:00",
    mode: "presencial",
    type: "Acompanhamento",
    duration: "45 minutos",
    status: "confirmado",
    note: "GN Fisioterapia."
  },
  {
    id: "ap-6",
    patientId: "pac-3",
    professionalId: "pro-1",
    date: dayISO(0),
    time: "21:00",
    mode: "tele",
    type: "Retorno",
    duration: "30 minutos",
    status: "confirmado",
    note: "Confirmar presença: histórico de falta."
  },
  {
    id: "ap-7",
    patientId: "pac-4",
    professionalId: "pro-1",
    date: dayISO(1),
    time: "08:00",
    mode: "presencial",
    type: "Acompanhamento",
    duration: "45 minutos",
    status: "confirmado",
    note: ""
  },
  {
    id: "ap-8",
    patientId: "pac-2",
    professionalId: "pro-1",
    date: dayISO(2),
    time: "10:00",
    mode: "tele",
    type: "Reavaliação",
    duration: "60 minutos",
    status: "solicitado",
    note: "Solicitado pela paciente."
  },
  {
    id: "ap-9",
    patientId: "pac-4",
    professionalId: "pro-1",
    date: dayISO(3),
    time: "17:00",
    mode: "tele",
    type: "Acompanhamento",
    duration: "45 minutos",
    status: "confirmado",
    note: ""
  }
];

export const evaluations = [
  {
    id: "av-1",
    patientId: "pac-1",
    date: dayISO(-55),
    kind: "Avaliação inicial",
    complaint: "Dor no joelho direito ao subir escadas e após caminhadas longas.",
    history: "Início há cerca de seis meses, sem trauma agudo. Piora ao fim do dia.",
    hypothesis: "Sobrecarga femoropatelar com déficit de força de quadríceps.",
    rom: "Flexão de joelho 118°, extensão completa.",
    strength: "Quadríceps grau 4, glúteo médio grau 3+.",
    tests: "Agachamento unipodal com valgo dinâmico à direita.",
    pain: 7.2,
    limitations: "Escadas, caminhada acima de 20 minutos e agachar para pegar objetos.",
    objectives: "Reduzir dor, recuperar força e retomar caminhadas de 40 minutos.",
    plan: "Programa domiciliar 3x por semana com progressão de carga e reavaliação em 6 semanas."
  },
  {
    id: "av-2",
    patientId: "pac-2",
    date: dayISO(-120),
    kind: "Avaliação inicial",
    complaint: "Rigidez e dor no joelho operado, dificuldade para permanecer em pé.",
    history: "Pós-operatório de menisco há quatro meses.",
    hypothesis: "Déficit de amplitude e controle motor pós-cirúrgico.",
    rom: "Flexão 104°, extensão -3°.",
    strength: "Quadríceps grau 3+.",
    tests: "Marcha com apoio reduzido do lado operado.",
    pain: 5.5,
    limitations: "Permanecer em pé por mais de duas horas.",
    objectives: "Recuperar amplitude e retomar a rotina de trabalho.",
    plan: "Mobilidade diária e fortalecimento progressivo 2x por semana."
  }
];

export const evolutions = [
  {
    id: "ev-1",
    patientId: "pac-1",
    date: dayISO(-1),
    pain: 1.8,
    adherence: 92,
    rom: 138,
    text: "Paciente relata melhora funcional e menor desconforto nas atividades. Mantém boa participação no programa domiciliar.",
    conduct: "Manter o programa atual e reavaliar na próxima sessão.",
    next: "Progredir carga do agachamento se a dor seguir abaixo de 2.",
    author: "João Silva"
  },
  {
    id: "ev-2",
    patientId: "pac-1",
    date: dayISO(-6),
    pain: 3.2,
    adherence: 86,
    rom: 131,
    text: "Boa evolução no controle do movimento durante o agachamento.",
    conduct: "Aumentar repetições do fortalecimento.",
    next: "Reavaliar amplitude na próxima consulta.",
    author: "João Silva"
  },
  {
    id: "ev-3",
    patientId: "pac-1",
    date: dayISO(-13),
    pain: 4.8,
    adherence: 80,
    rom: 126,
    text: "Reduziu a dor ao subir escadas. Ainda relata desconforto no fim do dia.",
    conduct: "Incluir mobilidade de quadril antes do fortalecimento.",
    next: "Observar resposta em uma semana.",
    author: "João Silva"
  },
  {
    id: "ev-4",
    patientId: "pac-1",
    date: dayISO(-27),
    pain: 6.1,
    adherence: 68,
    rom: 120,
    text: "Início do fortalecimento com boa tolerância.",
    conduct: "Manter três séries e observar dor pós-exercício.",
    next: "Seguir programa.",
    author: "João Silva"
  },
  {
    id: "ev-5",
    patientId: "pac-2",
    date: dayISO(-4),
    pain: 3.4,
    adherence: 71,
    rom: 118,
    text: "Ganho de amplitude após a série de mobilidade.",
    conduct: "Manter mobilidade diária.",
    next: "Reavaliar em duas semanas.",
    author: "João Silva"
  },
  {
    id: "ev-6",
    patientId: "pac-3",
    date: dayISO(-9),
    pain: 6.8,
    adherence: 46,
    rom: null,
    text: "Refere dor ao fim da jornada. Não realizou as pausas ativas combinadas.",
    conduct: "Reforçar orientação e simplificar o programa.",
    next: "Contato de acompanhamento em três dias.",
    author: "João Silva"
  }
];

export const documents = [
  { id: "doc-1", patientId: "pac-1", title: "Avaliação fisioterapêutica inicial", kind: "Avaliação", date: dayISO(-55), owner: "João Silva" },
  { id: "doc-2", patientId: "pac-1", title: "Programa de exercícios · fase 2", kind: "Programa", date: dayISO(-13), owner: "João Silva" },
  { id: "doc-3", patientId: "pac-1", title: "Orientações para o dia a dia", kind: "Orientação", date: dayISO(-6), owner: "João Silva" },
  { id: "doc-4", patientId: "pac-2", title: "Relatório pós-operatório", kind: "Relatório", date: dayISO(-100), owner: "João Silva" }
];

export const notifications = [
  { id: "n-1", role: "paciente", patientId: "pac-1", text: "Seu teleatendimento é hoje às 19:00.", date: dayISO(0), read: false },
  { id: "n-2", role: "paciente", patientId: "pac-1", text: "João Silva atualizou seu programa de exercícios.", date: dayISO(-1), read: false },
  { id: "n-3", role: "paciente", patientId: "pac-1", text: "Reavaliação marcada para a próxima semana.", date: dayISO(-2), read: true },
  { id: "n-4", role: "fisioterapeuta", text: "Lucas Almeida está com adesão abaixo de 50%.", date: dayISO(0), read: false },
  { id: "n-5", role: "fisioterapeuta", text: "Mariana Costa solicitou um novo atendimento.", date: dayISO(0), read: false },
  { id: "n-6", role: "fisioterapeuta", text: "Gabriel Santos concluiu o programa da semana.", date: dayISO(-1), read: true }
];

export const activity = [
  { id: "at-1", text: "Gabriel Santos concluiu o programa da semana", date: dayISO(-1), kind: "exercicio" },
  { id: "at-2", text: "Mariana Costa foi vinculada à sua carteira", date: dayISO(-3), kind: "paciente" },
  { id: "at-3", text: "Nova avaliação registrada para Rafael Souza", date: dayISO(-5), kind: "avaliacao" }
];

/* Disponibilidade semanal do profissional (0 = domingo). */
export const availability = {
  "pro-1": {
    weekdays: [1, 2, 3, 4, 5],
    slots: ["08:00", "09:00", "10:30", "14:00", "15:30", "17:00", "19:00", "20:00", "21:00"],
    presencialSlots: ["14:00", "15:30", "20:00"],
    blocks: [{ id: "bl-1", date: dayISO(4), time: "14:00", reason: "Bloqueio · agenda da clínica" }]
  },
  "pro-2": {
    weekdays: [1, 2, 3, 4],
    slots: ["09:00", "10:30", "14:00", "15:30", "17:00"],
    presencialSlots: [],
    blocks: []
  },
  "pro-3": {
    weekdays: [2, 3, 4, 5, 6],
    slots: ["07:00", "08:00", "09:00", "10:30", "14:00", "15:30"],
    presencialSlots: ["14:00", "15:30"],
    blocks: []
  }
};

export const users = [
  { id: "u-1", email: "paciente@gncare.test", password: "gncare123", role: "paciente", refId: "pac-1" },
  { id: "u-2", email: "fisio@gncare.test", password: "gncare123", role: "fisioterapeuta", refId: "pro-1" }
];

export const messages = [
  { id: "m-1", appointmentId: "ap-1", author: "João Silva", text: "Estou na sala. Pode ligar o áudio quando quiser.", at: new Date().toISOString() },
  { id: "m-2", appointmentId: "ap-1", author: "Gabriel Santos", text: "Pronto. Consigo te ouvir bem.", at: new Date().toISOString() }
];

export function seed() {
  return {
    version: 2,
    users: clone(users),
    patients: clone(patients),
    professionals: clone(professionals),
    plans: clone(plans),
    exerciseLibrary: clone(exerciseLibrary),
    prescriptions: clone(prescriptions),
    appointments: clone(appointments),
    treatments: clone(treatments),
    evaluations: clone(evaluations),
    evolutions: clone(evolutions),
    documents: clone(documents),
    notifications: clone(notifications),
    activity: clone(activity),
    availability: clone(availability),
    messages: clone(messages)
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
