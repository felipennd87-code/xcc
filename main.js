/* Benigno Engenharia | interações e animações
   GSAP + ScrollTrigger + SplitText + Lenis. Tudo desligado com prefers-reduced-motion. */
(() => {
  'use strict';

  const WA = 'https://wa.me/5577988424244';
  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motion = hasGsap && !reduce;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Preloader (até 1 s) ---------- */
  const preloader = $('.preloader');
  const count = $('[data-count]');
  const t0 = performance.now();
  const PRE_MS = reduce ? 0 : 780;
  if (count && !reduce) {
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / PRE_MS);
      count.textContent = String(Math.round(100 * (1 - Math.pow(1 - p, 3)))).padStart(3, '0');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  let heroStarted = false;
  const endPreloader = () => {
    if (preloader) preloader.classList.add('is-done');
    if (!heroStarted) { heroStarted = true; heroIntro(); }
  };
  const fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
  const minWait = new Promise((r) => setTimeout(r, PRE_MS + 60));
  Promise.all([fontsReady, minWait]).then(endPreloader);
  setTimeout(endPreloader, 1000); // nunca passa de 1 s

  /* ---------- Ano no rodapé ---------- */
  const y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Vídeos: pausa fora da tela e com movimento reduzido ---------- */
  const heroVideo = $('.hero__video');
  if (heroVideo) {
    if (reduce) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
    else {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) heroVideo.play().catch(() => {}); else heroVideo.pause();
      }).observe(heroVideo);
    }
  }
  $$('[data-lazy-video]').forEach((v) => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const src = v.querySelector('source[data-src]');
        if (src) { src.src = src.dataset.src; src.removeAttribute('data-src'); v.load(); }
        if (!reduce) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }, { rootMargin: '200px 0px' });
    io.observe(v);
  });

  /* ---------- Header sólido ao rolar + link ativo ---------- */
  const header = $('[data-header]');
  const onScrollHeader = () => header && header.classList.toggle('is-solid', window.scrollY > 40);
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const navLinks = $$('.header__nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => navIO.observe(s));
  }

  /* ---------- Barra fixa no celular (depois do hero) ---------- */
  const dock = $('[data-dock]');
  const hero = $('.hero');
  const cta = $('#contato');
  if (dock && hero) {
    let pastHero = false, atEnd = false;
    const sync = () => {
      const show = pastHero && !atEnd;
      dock.classList.toggle('is-visible', show);
      dock.setAttribute('aria-hidden', String(!show));
      $$('a', dock).forEach((a) => a.tabIndex = show ? 0 : -1);
      document.body.classList.toggle('has-dock', show);
    };
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }, { threshold: 0 }).observe(hero);
    if (cta) new IntersectionObserver(([e]) => { atEnd = e.isIntersecting; sync(); }, { threshold: .25 }).observe(cta);
  }

  /* ---------- Acordeões (serviços e FAQ) ---------- */
  $$('.acc__btn').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', btn.id || (btn.id = 'b-' + panel.id));
    panel.inert = true;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
      panel.inert = !open;
    });
  });

  /* ---------- Comparação com divisor arrastável ---------- */
  const compare = $('[data-compare]');
  let compareTouched = false;
  if (compare) {
    const input = $('.compare__input', compare);
    const set = (v) => {
      compare.style.setProperty('--pos', v + '%');
      input.setAttribute('aria-valuetext', Math.round(100 - v) + '% com vistoria');
    };
    input.addEventListener('input', () => { compareTouched = true; set(+input.value); });
    set(+input.value);
    compare._set = (v) => { input.value = v; set(v); };
  }

  /* ---------- Quiz ---------- */
  const form = $('[data-quiz]');
  if (form) initQuiz(form);

  function initQuiz(form) {
    const steps = $$('.qz__step', form);
    const back = $('[data-back]', form);
    const bar = $('[data-bar]', form);
    const barWrap = $('.qz__bar', form);
    const label = $('[data-step-label]', form);
    const send = $('[data-send]', form);
    const total = 5;
    const answers = { servico: '', imovel: '', quando: '', local: '', nome: '' };
    let i = 0;

    const focusHead = (step) => {
      const h = step.querySelector('legend, h3');
      const input = step.querySelector('input');
      if (input) input.focus({ preventScroll: true });
      else if (h) h.focus({ preventScroll: true });
    };

    const show = (n, moveFocus = true) => {
      steps[i].hidden = true;
      steps[i].classList.remove('is-current', 'is-entering');
      i = n;
      const s = steps[i];
      s.hidden = false;
      s.classList.add('is-current');
      if (!reduce) { s.classList.remove('is-entering'); void s.offsetWidth; s.classList.add('is-entering'); }
      const done = i >= total;
      back.disabled = i === 0;
      bar.style.width = (done ? 100 : ((i + 1) / total) * 100) + '%';
      barWrap.setAttribute('aria-valuenow', String(Math.min(i + 1, total)));
      label.textContent = done ? 'Resumo' : `Pergunta ${i + 1} de ${total}`;
      if (done) fillSummary();
      if (moveFocus) focusHead(s);
    };

    const fillSummary = () => {
      Object.keys(answers).forEach((k) => { const dd = $(`[data-sum="${k}"]`, form); if (dd) dd.textContent = answers[k]; });
      const msg = `Olá, Karina! Me chamo ${answers.nome}. Fiz o quiz no seu site.\n` +
        `Preciso de: ${answers.servico}\n` +
        `Imóvel: ${answers.imovel}\n` +
        `Quando: ${answers.quando}\n` +
        `Local: ${answers.local}\n` +
        `Pode me orientar?`;
      send.href = `${WA}?text=${encodeURIComponent(msg)}`;
    };

    // Opções de clique
    steps.forEach((step, idx) => {
      const key = step.dataset.q;
      $$('.qz__opt', step).forEach((opt) => {
        opt.setAttribute('aria-pressed', 'false');
        opt.addEventListener('click', () => {
          $$('.qz__opt', step).forEach((o) => { o.classList.remove('is-selected'); o.setAttribute('aria-pressed', 'false'); });
          opt.classList.add('is-selected');
          opt.setAttribute('aria-pressed', 'true');
          answers[key] = opt.dataset.value;
          setTimeout(() => show(idx + 1), reduce ? 0 : 180);
        });
      });
    });

    // Campos de texto
    const rules = {
      local: { min: 2, msg: 'Escreva o bairro ou a cidade do imóvel.' },
      nome: { min: 2, msg: 'Escreva seu nome para a Karina saber com quem fala.' }
    };
    const validate = (step) => {
      const key = step.dataset.q;
      const input = $('input', step);
      const err = $('.qz__err', step);
      const val = input.value.replace(/\s+/g, ' ').trim();
      const ok = val.length >= rules[key].min && /[\p{L}]/u.test(val);
      input.setAttribute('aria-invalid', String(!ok));
      err.textContent = ok ? '' : rules[key].msg;
      if (ok) answers[key] = val;
      return ok;
    };
    steps.forEach((step, idx) => {
      const input = $('input', step);
      const next = $('[data-next]', step);
      if (!input || !next) return;
      const go = () => { if (validate(step)) show(idx + 1); else input.focus(); };
      next.addEventListener('click', go);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validate(step); });
    });

    back.addEventListener('click', () => { if (i > 0) show(i - 1); });
    $('[data-restart]', form).addEventListener('click', () => {
      Object.keys(answers).forEach((k) => answers[k] = '');
      $$('.qz__opt', form).forEach((o) => { o.classList.remove('is-selected'); o.setAttribute('aria-pressed', 'false'); });
      $$('input', form).forEach((inp) => { inp.value = ''; inp.removeAttribute('aria-invalid'); });
      $$('.qz__err', form).forEach((e) => e.textContent = '');
      show(0);
    });
    form.addEventListener('submit', (e) => e.preventDefault());
    show(0, false);
  }

  /* ---------- Check-list sem GSAP (fallback) ---------- */
  if (!motion) {
    const checks = $$('[data-check]');
    if (reduce) checks.forEach((c) => c.classList.add('is-checked'));
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-checked'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -30% 0px' });
      checks.forEach((c) => io.observe(c));
    }
    // Passo ativo do "Como funciona" sem GSAP
    const stepsEls = $$('[data-step]');
    const idx = $$('.process__index li');
    const sio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const n = stepsEls.indexOf(e.target);
      stepsEls.forEach((s, k) => s.classList.toggle('is-active', k === n));
      idx.forEach((s, k) => s.classList.toggle('is-active', k === n));
    }), { rootMargin: '-45% 0px -45% 0px' });
    stepsEls.forEach((s) => sio.observe(s));
  }

  /* ---------- Animações GSAP ---------- */
  function heroIntro() {
    if (!motion) return;
    const { gsap } = window;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    const title = $('[data-hero-title]');
    if (title && window.SplitText) {
      const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'line' });
      tl.from(split.lines, { yPercent: 105, duration: 1.1, stagger: .09 }, 0);
    }
    tl.from('.hero__logo', { autoAlpha: 0, y: 12, duration: .8 }, 0)
      .from('[data-hero-item]', { autoAlpha: 0, y: 18, duration: .9, stagger: .08 }, .15)
      .from('[data-hero-card]', { autoAlpha: 0, y: 28, duration: 1, stagger: .1 }, .3)
      .from('.hero__word', { autoAlpha: 0, yPercent: 8, duration: 1.6 }, 0);
  }

  if (!motion) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);

  /* Lenis: rolagem suave ligada ao ScrollTrigger */
  let lenis = null;
  if (typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // Âncoras internas
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: id === '#topo' ? 0 : -72, duration: 1.2 });
      else target.scrollIntoView();
      history.replaceState(null, '', id);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* Títulos revelados por linha */
  document.fonts.ready.then(() => {
    $$('[data-lines]').forEach((el) => {
      if (!window.SplitText) return;
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 105, duration: 1, ease: 'expo.out', stagger: .08,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          });
        }
      });
    });

    /* Frase do "Sobre": palavras do cinza para o branco no scroll */
    const st = $('[data-words]');
    if (st && window.SplitText) {
      const split = SplitText.create(st, { type: 'words', wordsClass: 'w' });
      gsap.fromTo(split.words, { color: 'rgba(243,241,236,0.22)' }, {
        color: '#F3F1EC', stagger: .1, ease: 'none',
        scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true }
      });
    }
    ScrollTrigger.refresh();
  });

  /* Linhas de medição se desenhando */
  $$('[data-ruler]').forEach((r) => {
    gsap.fromTo(r, { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power3.inOut',
      scrollTrigger: { trigger: r, start: 'top 90%', once: true }
    });
  });
  $$('[data-draw]').forEach((p, k) => {
    gsap.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 1.6, delay: k * .2, ease: 'power3.inOut',
      scrollTrigger: { trigger: '.cta', start: 'top 75%', once: true }
    });
  });
  const dim = $('.about__dim path');
  if (dim) {
    gsap.fromTo('.about__dim', { clipPath: 'inset(0 0 100% 0)' }, {
      clipPath: 'inset(0 0 0% 0)', ease: 'none',
      scrollTrigger: { trigger: '.about__photo', start: 'top 80%', end: 'bottom 60%', scrub: true }
    });
  }

  /* Check-list marcando itens no scroll */
  $$('[data-check]').forEach((c) => {
    ScrollTrigger.create({
      trigger: c, start: 'top 72%',
      onEnter: () => c.classList.add('is-checked'),
      onLeaveBack: () => c.classList.remove('is-checked')
    });
  });

  /* Marcações de trinca na comparação + dica de arraste */
  if (compare) {
    const cracks = $$('.room .crack, .room .dim:not(.dim--dash)', compare);
    cracks.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    const hint = { v: 50 };
    gsap.timeline({ scrollTrigger: { trigger: compare, start: 'top 70%', once: true } })
      .to(cracks, { strokeDashoffset: 0, duration: 1.1, stagger: .12, ease: 'power2.inOut' }, 0)
      .from($$('.room .dim--dash, .room .damp', compare), { autoAlpha: 0, duration: .6 }, .5)
      .from($$('.room .pin', compare), { scale: 0.6, autoAlpha: 0, transformOrigin: 'center', duration: .5, stagger: .08, ease: 'back.out(2)' }, .4)
      .to(hint, { v: 30, duration: .7, ease: 'power2.inOut', onUpdate: () => !compareTouched && compare._set(hint.v) }, .6)
      .to(hint, { v: 62, duration: .9, ease: 'power2.inOut', onUpdate: () => !compareTouched && compare._set(hint.v) })
      .to(hint, { v: 50, duration: .6, ease: 'power2.out', onUpdate: () => !compareTouched && compare._set(hint.v) });
  }

  /* Como funciona: card ativo em branco conforme o scroll */
  const stepEls = $$('[data-step]');
  const indexEls = $$('.process__index li');
  const activate = (n) => {
    stepEls.forEach((s, k) => s.classList.toggle('is-active', k === n));
    indexEls.forEach((s, k) => s.classList.toggle('is-active', k === n));
  };
  stepEls.forEach((s, k) => {
    ScrollTrigger.create({
      trigger: s, start: 'top 60%', end: 'bottom 60%',
      onEnter: () => activate(k), onEnterBack: () => activate(k)
    });
  });

  /* Hero: palavra gigante se desloca devagar */
  gsap.to('.hero__word', {
    yPercent: -18, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* Fotos com revelação por máscara */
  $$('.shot img, .about__photo img, .block__media img').forEach((img) => {
    gsap.fromTo(img, { clipPath: 'inset(12% 0 0 0 round 16px)', scale: 1.06 }, {
      clipPath: 'inset(0% 0 0 0 round 0px)', scale: 1, duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: img, start: 'top 88%', once: true },
      clearProps: 'clipPath'
    });
  });

  /* Botões magnéticos (só desktop com mouse) */
  if (finePointer) {
    $$('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * .22);
        yTo((e.clientY - (r.top + r.height / 2)) * .3);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
