// CONFIRMAR QUAL NÚMERO RECEBE OS PEDIDOS DA PARCERIA
const WHATSAPP = "5577988424244";

(function () {
  "use strict";

  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- origem da campanha (utm) ---------- */
  function lerOrigem() {
    const params = new URLSearchParams(window.location.search);
    const partes = [params.get("utm_source"), params.get("utm_campaign")].filter(Boolean);
    let origem = partes.join(" / ");
    try {
      if (origem) sessionStorage.setItem("jcb-origem", origem);
      else origem = sessionStorage.getItem("jcb-origem") || "";
    } catch (e) { /* armazenamento bloqueado: segue sem ele */ }
    return origem;
  }
  const ORIGEM = lerOrigem();

  function linkWhatsApp(texto) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
  }

  function abrirWhatsApp(url) {
    const janela = window.open(url, "_blank", "noopener");
    if (!janela) window.location.href = url;
  }

  /* ---------- links diretos de WhatsApp (flutuante, chamada final, rodapé) ---------- */
  let textoDireto = "Olá! Vim pelo site da parceria JC + Benigno e quero um orçamento.";
  if (ORIGEM) textoDireto += "\nOrigem: " + ORIGEM;
  $$("[data-wa-direto]").forEach((a) => {
    a.href = linkWhatsApp(textoDireto);
    a.addEventListener("click", () => { if (window.fbq) window.fbq("track", "Contact"); });
  });

  /* ---------- ano automático ---------- */
  $$("[data-ano]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- topo: fundo sólido ao rolar e menu do celular ---------- */
  const topo = $("#topo");
  const menuBtn = $(".menu-btn");
  const menu = $("#menu");
  function atualizaTopo() { topo.classList.toggle("is-solido", window.scrollY > 24); }
  atualizaTopo();
  window.addEventListener("scroll", atualizaTopo, { passive: true });

  function fechaMenu() {
    menu.classList.remove("is-aberto");
    topo.classList.remove("is-aberto");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menu");
  }
  menuBtn.addEventListener("click", () => {
    const abrir = menuBtn.getAttribute("aria-expanded") !== "true";
    menu.classList.toggle("is-aberto", abrir);
    topo.classList.toggle("is-aberto", abrir);
    menuBtn.setAttribute("aria-expanded", String(abrir));
    menuBtn.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  });
  $$("a", menu).forEach((a) => a.addEventListener("click", fechaMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fechaMenu(); });

  /* ---------- vídeo do hero: começa depois que a página carrega (o poster aparece antes) ---------- */
  const video = $(".hero-video");
  if (video && !reduzMovimento) {
    const conexao = navigator.connection || {};
    const iniciaVideo = () => {
      if (conexao.saveData) return;
      video.preload = "auto";
      video.addEventListener("playing", () => video.classList.add("is-tocando"), { once: true });
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    };
    if (document.readyState === "complete") setTimeout(iniciaVideo, 600);
    else window.addEventListener("load", () => setTimeout(iniciaVideo, 600), { once: true });
  }

  /* ---------- revelação ao rolar (com escalonamento nos grupos) ---------- */
  $$("[data-stagger]").forEach((grupo) => {
    $$("[data-reveal]", grupo).forEach((el, i) => el.style.setProperty("--d", Math.min(i, 6) * 80 + "ms"));
  });
  const reveals = $$("[data-reveal]");
  if (reduzMovimento || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- contadores ---------- */
  const fmtMilhar = new Intl.NumberFormat("pt-BR");
  function formata(el, valor) {
    const casas = Number(el.dataset.decimals || 0);
    let txt;
    if (casas) txt = valor.toFixed(casas).replace(".", ",");
    else if (el.hasAttribute("data-plain")) txt = String(Math.round(valor));
    else txt = fmtMilhar.format(Math.round(valor));
    return (el.dataset.prefix || "") + txt;
  }
  const contadores = $$("[data-count]");
  if (!reduzMovimento && "IntersectionObserver" in window) {
    contadores.forEach((el) => { el.textContent = formata(el, Number(el.dataset.from || 0)); });
    const ioNum = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        ioNum.unobserve(en.target);
        const el = en.target;
        const alvo = Number(el.dataset.count);
        const inicio = Number(el.dataset.from || 0);
        const dur = 1600;
        const t0 = performance.now();
        (function passo(t) {
          const k = Math.min((t - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - k, 3);
          el.textContent = formata(el, inicio + (alvo - inicio) * ease);
          if (k < 1) requestAnimationFrame(passo);
          else el.textContent = formata(el, alvo);
        })(t0);
      });
    }, { threshold: 0.6 });
    contadores.forEach((el) => ioNum.observe(el));
  }

  /* ---------- linha do tempo desenhada pela rolagem ---------- */
  const linha = $("[data-timeline]");
  if (linha) {
    const etapas = $$(".etapa", linha);
    const definir = (p) => {
      linha.style.setProperty("--p", p.toFixed(3));
      etapas.forEach((et, i) => et.classList.toggle("is-on", p >= i / (etapas.length - 1) - 0.02 || p >= 0.999));
    };
    if (reduzMovimento) {
      definir(1);
    } else {
      let pendente = false;
      const calcula = () => {
        pendente = false;
        const r = linha.getBoundingClientRect();
        const vh = window.innerHeight;
        const horizontal = window.matchMedia("(min-width: 900px)").matches;
        let p;
        if (horizontal) p = (vh * 0.85 - r.top) / (vh * 0.5);
        else p = (vh * 0.75 - r.top) / r.height;
        definir(Math.max(0, Math.min(1, p)));
      };
      const pede = () => { if (!pendente) { pendente = true; requestAnimationFrame(calcula); } };
      window.addEventListener("scroll", pede, { passive: true });
      window.addEventListener("resize", pede);
      calcula();
    }
  }

  /* ---------- filtro de obras ---------- */
  const filtros = $$(".filtro-btn");
  const obras = $$(".obra");
  filtros.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filtro;
      filtros.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      obras.forEach((o) => {
        const mostra = f === "todos" || o.dataset.autor === f;
        o.hidden = !mostra;
        if (mostra) o.classList.add("is-in");
      });
    });
  });

  /* ---------- botão flutuante: aparece depois do hero, some no quiz ---------- */
  const flutuante = $(".wa-flutuante");
  const hero = $(".hero");
  const quizSecao = $("#orcamento");
  if (flutuante && "IntersectionObserver" in window) {
    let heroVisivel = true;
    let quizVisivel = false;
    const atualiza = () => {
      const mostra = !heroVisivel && !quizVisivel;
      flutuante.classList.toggle("is-visivel", mostra);
      if (mostra) flutuante.removeAttribute("tabindex");
      else flutuante.setAttribute("tabindex", "-1");
    };
    new IntersectionObserver(([en]) => { heroVisivel = en.isIntersecting; atualiza(); }, { threshold: 0.15 }).observe(hero);
    new IntersectionObserver(([en]) => { quizVisivel = en.isIntersecting; atualiza(); }, { threshold: 0 }).observe(quizSecao);
    atualiza();
  } else if (flutuante) {
    flutuante.classList.add("is-visivel");
  }

  /* =========================================================
     QUIZ DE ORÇAMENTO
     ========================================================= */
  const form = $("#quiz");
  if (!form) return;

  const passos = $$(".q", form);
  const TOTAL_PERGUNTAS = 5;
  const btnVoltar = $("#q-voltar");
  const btnContinuar = $("#q-continuar");
  const textoPasso = $("#quiz-passo");
  const barra = $(".quiz-progresso", form);
  const barraFill = $("span", barra);
  const aviso = $("#quiz-aviso");
  const inNome = $("#q-nome");
  const inCidade = $("#q-cidade");
  const resumo = $("#q-resumo");

  const respostas = { perfil: "", servicos: [], imovel: "", fase: "", prazo: "" };
  let atual = 0;
  let travado = false;

  function mostraPasso(novo, direcao) {
    const antigo = passos[atual];
    antigo.hidden = true;
    antigo.classList.remove("is-entrando", "is-voltando");
    atual = novo;
    const el = passos[atual];
    el.hidden = false;
    if (!reduzMovimento) {
      void el.offsetWidth;
      el.classList.add(direcao === "volta" ? "is-voltando" : "is-entrando");
    }
    atualizaBarra();
    if (el.classList.contains("q-final")) montaResumo();
    const titulo = $(".q-titulo", el);
    if (titulo) titulo.focus({ preventScroll: true });
    // mantém o topo do quiz visível no celular ao trocar de pergunta
    const r = form.getBoundingClientRect();
    if (r.top < 70) form.scrollIntoView({ behavior: reduzMovimento ? "auto" : "smooth", block: "start" });
  }

  function atualizaBarra() {
    const final = atual >= TOTAL_PERGUNTAS;
    textoPasso.textContent = final ? "Último passo" : "Pergunta " + (atual + 1) + " de " + TOTAL_PERGUNTAS;
    barraFill.style.width = (atual / TOTAL_PERGUNTAS) * 100 + "%";
    barra.setAttribute("aria-valuenow", String(atual));
    btnVoltar.hidden = atual === 0;
    const multi = passos[atual].hasAttribute("data-multi");
    btnContinuar.hidden = !multi;
    if (multi) btnContinuar.disabled = respostas.servicos.length === 0;
  }

  // serviços na ordem em que aparecem na pergunta 2
  function servicosOrdenados() {
    const ordem = $$('[data-campo="servicos"] .opc', form).map((b) => b.textContent.trim());
    return respostas.servicos.slice().sort((a, b) => ordem.indexOf(a) - ordem.indexOf(b));
  }

  function montaResumo() {
    const linhas = [
      ["Sou", respostas.perfil],
      ["Preciso de", servicosOrdenados().join(", ")],
      ["Imóvel", respostas.imovel],
      ["Fase", respostas.fase],
      ["Prazo", respostas.prazo]
    ];
    resumo.innerHTML = "";
    linhas.forEach(([k, v]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = k;
      dd.textContent = v;
      resumo.append(dt, dd);
    });
  }

  function marcaServicos() {
    const passoServ = passos.find((p) => p.dataset.campo === "servicos");
    $$(".opc", passoServ).forEach((b) => {
      b.setAttribute("aria-pressed", String(respostas.servicos.includes(b.textContent.trim())));
    });
    if (passoServ === passos[atual]) btnContinuar.disabled = respostas.servicos.length === 0;
  }

  passos.forEach((passo) => {
    const campo = passo.dataset.campo;
    if (!campo) return;
    const multi = passo.hasAttribute("data-multi");
    $$(".opc", passo).forEach((btn) => {
      btn.addEventListener("click", () => {
        const valor = btn.textContent.trim();
        if (multi) {
          const i = respostas.servicos.indexOf(valor);
          if (i >= 0) respostas.servicos.splice(i, 1);
          else respostas.servicos.push(valor);
          marcaServicos();
          return;
        }
        if (travado) return;
        respostas[campo] = valor;
        $$(".opc", passo).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        travado = true;
        setTimeout(() => {
          travado = false;
          mostraPasso(atual + 1, "vai");
        }, reduzMovimento ? 0 : 260);
      });
    });
  });

  btnContinuar.addEventListener("click", () => {
    if (respostas.servicos.length) mostraPasso(atual + 1, "vai");
  });
  btnVoltar.addEventListener("click", () => {
    if (atual > 0) mostraPasso(atual - 1, "volta");
  });

  // "Pedir orçamento deste serviço": já deixa o serviço marcado na pergunta 2
  $$("[data-servico]").forEach((link) => {
    link.addEventListener("click", () => {
      const servico = link.dataset.servico;
      if (!respostas.servicos.includes(servico)) respostas.servicos.push(servico);
      marcaServicos();
      aviso.textContent = "Já deixamos marcado: " + servico + ". Você pode mudar na pergunta 2.";
      aviso.hidden = false;
    });
  });

  function validaCampo(input, erroId) {
    const ok = input.value.trim().length > 1;
    input.setAttribute("aria-invalid", String(!ok));
    $("#" + erroId).hidden = ok;
    return ok;
  }
  inNome.addEventListener("input", () => { if (inNome.getAttribute("aria-invalid") === "true") validaCampo(inNome, "erro-nome"); });
  inCidade.addEventListener("input", () => { if (inCidade.getAttribute("aria-invalid") === "true") validaCampo(inCidade, "erro-cidade"); });

  function montaMensagem() {
    const linhas = [
      "Olá! Vim pelo site da parceria JC + Benigno.",
      "Nome: " + inNome.value.trim(),
      "Sou: " + respostas.perfil,
      "Preciso de: " + servicosOrdenados().join(", "),
      "Imóvel: " + respostas.imovel,
      "Fase: " + respostas.fase,
      "Prazo: " + respostas.prazo,
      "Cidade: " + inCidade.value.trim()
    ];
    if (ORIGEM) linhas.push("Origem: " + ORIGEM);
    return linhas.join("\n");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (atual < TOTAL_PERGUNTAS) return;
    const okNome = validaCampo(inNome, "erro-nome");
    const okCidade = validaCampo(inCidade, "erro-cidade");
    if (!okNome) { inNome.focus(); return; }
    if (!okCidade) { inCidade.focus(); return; }
    if (window.fbq) window.fbq("track", "Lead");
    abrirWhatsApp(linkWhatsApp(montaMensagem()));
  });

  // Enter nos campos de texto envia; Enter nas perguntas não submete o formulário
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && atual < TOTAL_PERGUNTAS) e.preventDefault();
  });

  atualizaBarra();
})();
