# GN Care

Plataforma de fisioterapia da **GN Fisioterapia** (Acupe · Salvador · BA). O produto cobre teleatendimento, programa de exercícios e acompanhamento entre as consultas.

Este repositório é o **protótipo front-end navegável**. Ainda não há backend real: sessões, pacientes, agenda e evoluções ficam no navegador (`localStorage`). Nenhum dado clínico verdadeiro é usado aqui.

## Estado até agora

O que está pronto para revisão antes de seguir com o backend:

- Landing pública com identidade visual azul, densidade compacta e CTAs para o app
- Aplicação SPA (paciente e fisioterapeuta) com rotas protegidas por perfil
- API mock, seed de demonstração e persistência local
- Fluxos principais de cuidado, agenda, teleatendimento simulado e prontuário
- Pronto para publicar como site estático (Vercel)

O que **não** está neste recorte: autenticação real, banco, pagamentos, sala de vídeo verdadeira, envio de e-mail/SMS, prontuário em servidor e integração com agenda externa.

## Como ver localmente

Precisa só do Node.js.

```bash
npm run dev
```

Abre:

- Landing: [http://127.0.0.1:5500/](http://127.0.0.1:5500/)
- App: [http://127.0.0.1:5500/app/](http://127.0.0.1:5500/app/)

A raiz do servidor aponta para `preview.html`. O `index.html` da raiz é o protótipo HTML anterior (V23), mantido como referência — a navegação atual da landing não depende dele.

## Acessos de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Paciente | `paciente@gncare.test` | `gncare123` |
| Fisioterapeuta | `fisio@gncare.test` | `gncare123` |

Os atalhos **Entrar como paciente** e **Entrar como fisioterapeuta** na tela de login preenchem esses dados.

## O que o protótipo já cobre

### Landing (`preview.html`)

- Hero compacto, seções de cuidado, consultório digital e planos
- Planos: **Premium R$ 96,99** · **Ouro R$ 196,99** · **Platinum R$ 296,99**
- Teleatendimento em todos os planos; presencial na GN Fisioterapia a partir do Ouro
- Rodapé da clínica: 5,0 / 60 avaliações no Google, Acupe · Av. Dom João VI, Salvador
- Vitrine de registros da clínica (CREFITO-7, COFFITO, alvará, CNES e especialidades)
- Popup de carregamento ao abrir o app

### Autenticação e onboarding

- Login, cadastro (paciente ou fisioterapeuta), recuperação de senha
- Onboarding do paciente
- Perfil público do fisioterapeuta (`#/p/:slug`)

### Área do paciente

- Início, meu tratamento, programa de exercícios e detalhe do exercício
- Consultas, agendamento e sala de teleatendimento simulada
- Evolução, fisioterapeuta responsável, documentos e perfil

### Área do profissional

- Visão geral, lista de pacientes e prontuário (avaliação, tratamento, evolução)
- Agenda, lista de teleatendimentos e sala
- Biblioteca de exercícios, evoluções, perfil e editor do perfil público

### Camada de dados (mock)

- `app/js/data.js` — seed fictício
- `app/js/api.js` — regras de sessão, pacientes, agenda, exercícios, evoluções e documentos
- Persistência em `localStorage` (`gncare.app.v1` / `gncare.session.v1`)

## Estrutura

```text
preview.html          Landing atual
index.html            Protótipo HTML anterior (referência)
server.js             Servidor estático local (porta 5500)
app/                  SPA vanilla (ES modules)
  index.html
  css/app.css
  js/main.js          Boot
  js/router.js        Hash router + proteção de rotas
  js/layout.js        Casca (sidebar / mobile)
  js/ui.js            Componentes e popup de carregamento
  js/api.js           API mock
  js/data.js          Seed
  js/pages/auth.js
  js/pages/patient.js
  js/pages/pro.js
  js/pages/tele.js
assets/               Imagens da landing e da demonstração
```

## Publicação

O site é estático. A raiz `/` reescreve para `preview.html` (`vercel.json`). Rotas do app usam hash (`/app/#/login`), então não precisam de rewrite extra.

Repositório: [github.com/peuavelar/gncare](https://github.com/peuavelar/gncare)

Para conectar o GitHub ao Vercel (deploy a cada push em `main`):

1. Abra [vercel.com/new/import](https://vercel.com/new/import?s=https://github.com/peuavelar/gncare)
2. Entre com a conta GitHub `peuavelar`
3. Importe o repositório **gncare** sem alterar o diretório raiz

O `server.js` é só para desenvolvimento local e não entra no deploy.

## Próximo passo: backend

Quando a revisão deste front fechar, o backend deve substituir o mock sem redesenhar as telas. Pontos naturais:

1. Autenticação e sessão reais (paciente / fisioterapeuta)
2. Cadastro, planos e cobrança
3. Prontuário, agenda, exercícios e evoluções no servidor
4. Teleatendimento com sala verdadeira
5. Documentos e perfil público persistidos
6. Controle de acesso e dados clínicos (LGPD)

Enquanto isso, trate o conteúdo da demo como **ficção de produto**, não como base clínica.
