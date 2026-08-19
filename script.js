/* =========================================================
   CAUSA — script.js
   Cursor personalizado, revelação no scroll, menu mobile,
   marquee que pausa no hover e formulário de newsletter.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initCursor();
  initReveal();
  initMobileMenu();
  initSmoothAnchors();
  initForm();
});

/* ---------- Ano no rodapé ---------- */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Cursor personalizado ---------- */
function initCursor() {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return;

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const label = document.getElementById('cursorLabel');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
  });

  // ring follows with a bit of lag for a springy feel
  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = document.querySelectorAll('[data-cursor], a, button, input');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-active');
      const text = el.getAttribute('data-cursor');
      label.textContent = text || '';
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-active');
      label.textContent = '';
    });
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

/* ---------- Revelar elementos ao rolar a página ---------- */
function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || targets.length === 0) {
    targets.forEach((t) => t.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach((t) => observer.observe(t));
}

/* ---------- Menu mobile ---------- */
function initMobileMenu() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Scroll suave para âncoras internas ---------- */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ---------- Formulário de newsletter ----------
   Não guardamos e-mails aqui. Cada inscrição dispara uma
   notificação pro e-mail particular da Julia via FormSubmit —
   ela cadastra manualmente na plataforma de envios em lote. */
function initForm() {
  const form = document.getElementById('joinForm');
  const note = document.getElementById('formNote');
  if (!form || !note) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input ? input.value.trim() : '';

    if (!email) {
      note.textContent = 'Escreve um e-mail aí pra gente conseguir te achar.';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    note.textContent = 'Enviando...';

    fetch('https://formsubmit.co/ajax/julia.orodrigues9@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: 'Nova inscrição na causa.',
        email: email,
        origem: 'formulário causa. (seção assine)'
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Falha no envio');
        note.textContent = `Prontinho — a gente te avisou que ${email} quer fazer parte. Em breve você recebe o primeiro e-mail.`;
        form.reset();
      })
      .catch(() => {
        note.textContent = `Deu ruim no envio automático. Manda direto pra julia.orodrigues9@gmail.com que eu cadastro na mão.`;
      })
      .finally(() => {
        if (btn) btn.disabled = false;
      });
  });
}
