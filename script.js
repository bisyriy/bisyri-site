/* Bisyri — adds mobile menu, scroll-reveal, scroll-spy, back-to-top. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile menu ---- */
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.mnav');
  function closeMenu() {
    if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }
    if (menu) menu.classList.remove('open');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      menu.classList.toggle('open', !open);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---- scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- scroll-spy ---- */
  var links = document.querySelectorAll('.bar nav a');
  var sections = document.querySelectorAll('section[id]');
  if (links.length && sections.length) {
    function spy() {
      var pos = window.scrollY + 140;
      var cur = '';
      sections.forEach(function (s) { if (s.offsetTop <= pos) cur = s.id; });
      links.forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
      });
    }
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  /* ---- close mobile menu on resize to desktop ---- */
  var mq = window.matchMedia ? matchMedia('(min-width: 641px)') : null;
  if (mq && burger && menu) {
    var onDesktop = function (e) { if (e.matches) closeMenu(); };
    if (mq.addEventListener) mq.addEventListener('change', onDesktop);
    else if (mq.addListener) mq.addListener(onDesktop); // Safari < 14
  }

  /* ---- contact form ---- */
  var cform = document.getElementById('contactForm');
  if (cform) {
    var cstatus = cform.querySelector('.cf-status');
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = cform.querySelector('button[type="submit"]');
      var data = {
        name: cform.name.value.trim(),
        email: cform.email.value.trim(),
        message: cform.message.value.trim(),
        company: cform.company.value
      };
      cstatus.textContent = 'Sending…';
      cstatus.className = 'cf-status';
      btn.disabled = true;
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        return r.json().then(function (body) { return { ok: r.ok, body: body }; });
      }).then(function (res) {
        if (!res.ok) throw new Error(res.body && res.body.error);
        cstatus.textContent = 'Thanks — I\'ll get back to you soon.';
        cstatus.classList.add('ok');
        cform.reset();
      }).catch(function (err) {
        cstatus.textContent = (err && err.message) || 'Something went wrong — please email me directly.';
        cstatus.classList.add('err');
      }).finally(function () {
        btn.disabled = false;
      });
    });
  }

  /* ---- reading progress bar ---- */
  var rpBar = document.querySelector('.read-progress');
  if (rpBar) {
    var artBody = document.getElementById('article');
    function updateProgress() {
      if (!artBody) return;
      var rect = artBody.getBoundingClientRect();
      var visible = -rect.top;
      var total = artBody.offsetHeight - window.innerHeight;
      var pct = total > 0 ? Math.min(100, Math.max(0, (visible / total) * 100)) : 0;
      rpBar.style.width = pct + '%';
      rpBar.setAttribute('aria-valuenow', Math.round(pct));
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---- back to top ---- */
  var totop = document.querySelector('.totop');
  if (totop) {
    function onScroll() { totop.classList.toggle('show', window.scrollY > 500); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
})();
