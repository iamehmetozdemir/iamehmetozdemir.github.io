(function () {
  'use strict';

  var DEFAULT_LANG = 'en';
  var LANGS = ['en', 'tr'];
  var root = document.documentElement;
  var cache = {};
  var projects = [];
  var currentLang = DEFAULT_LANG;

  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  /* ---------- i18n ---------- */
  function loadLang(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    return fetch('i18n/' + lang + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { cache[lang] = d; return d; });
  }

  function applyTranslations(dict) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v != null) el.innerHTML = v; // strings are authored by the site owner (may contain &amp;)
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        if (p.length === 2 && dict[p[1].trim()] != null) el.setAttribute(p[0].trim(), dict[p[1].trim()]);
      });
    });
    if (dict['meta.title']) document.title = dict['meta.title'];
    var md = document.querySelector('meta[name="description"]');
    if (md && dict['meta.description']) md.setAttribute('content', dict['meta.description']);
  }

  function setLang(lang, persist) {
    if (LANGS.indexOf(lang) < 0) lang = DEFAULT_LANG;
    return loadLang(lang).then(function (dict) {
      currentLang = lang;
      root.setAttribute('lang', lang);
      applyTranslations(dict);
      renderProjects();
      document.querySelectorAll('.lang [data-lang]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
      });
      if (persist) store('lang', lang);
    }).catch(function () { /* keep the built-in English text */ });
  }

  /* ---------- Projects ---------- */
  function pick(obj, lang) {
    if (typeof obj === 'string') return obj;
    return (obj && (obj[lang] || obj[DEFAULT_LANG])) || '';
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderProjects() {
    var list = document.getElementById('project-list');
    if (!list) return;
    var labels = cache[currentLang] || {};
    list.textContent = '';
    projects.forEach(function (p, i) {
      var li = el('li', 'card reveal in');
      li.appendChild(el('span', 'idx', String(i + 1).padStart(2, '0')));
      li.appendChild(el('h3', null, pick(p.title, currentLang)));
      li.appendChild(el('p', null, pick(p.description, currentLang)));
      if (p.tech && p.tech.length) {
        var tags = el('ul', 'tags');
        tags.setAttribute('aria-label', labels['projects.tech'] || 'Technologies');
        p.tech.forEach(function (t) { tags.appendChild(el('li', null, t)); });
        li.appendChild(tags);
      }
      var links = el('div', 'links');
      [['github', 'projects.code', 'Code'], ['demo', 'projects.demo', 'Live demo']].forEach(function (d) {
        if (!p[d[0]]) return;
        var a = el('a', null, (labels[d[1]] || d[2]) + ' ↗');
        a.href = p[d[0]];
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('aria-label', (labels[d[1]] || d[2]) + ': ' + pick(p.title, currentLang));
        links.appendChild(a);
      });
      if (links.children.length) li.appendChild(links);
      list.appendChild(li);
    });
  }

  function loadProjects() {
    return fetch('projects.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { projects = Array.isArray(data) ? data : (data.projects || []); renderProjects(); })
      .catch(function () { document.getElementById('project-error').hidden = false; });
  }

  /* ---------- Theme ---------- */
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : null;
  function applyTheme(t) { root.setAttribute('data-theme', t); }
  document.getElementById('theme-toggle').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store('theme', next);
  });
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) { // follow the system until the user picks a theme
      if (!read('theme')) applyTheme(e.matches ? 'light' : 'dark');
    });
  }

  /* ---------- Language buttons ---------- */
  document.querySelectorAll('.lang [data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menu-toggle');
  var nav = document.getElementById('nav');
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuBtn.focus(); }
  });

  /* ---------- Scroll reveal + active nav link ---------- */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (n) { n.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach(function (n, i) {
      if (n.closest('.hero')) n.style.setProperty('--d', (i * 0.08) + 's'); // stagger hero
      io.observe(n);
    });
  }

  if ('IntersectionObserver' in window) {
    var links = {};
    document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === en.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Init ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
  var saved = read('lang');
  var initial = LANGS.indexOf(saved) >= 0 ? saved : DEFAULT_LANG;
  loadLang(DEFAULT_LANG).catch(function () {}).then(function () {
    return Promise.all([setLang(initial, false), loadProjects()]);
  });
})();
