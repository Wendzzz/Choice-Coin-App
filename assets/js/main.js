/* ==========================================================================
   Choice Coin — motion system
   Only transform and opacity are animated. Everything degrades to a static,
   fully readable page when JavaScript or motion is unavailable.
   ========================================================================== */
(function () {
  'use strict';

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileQuery = window.matchMedia('(max-width: 760px)');
  var fineQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  var reduced = function () { return reduceQuery.matches; };
  var isMobile = function () { return mobileQuery.matches; };

  var rafPending = false;
  function onFrame(fn) {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; fn(); });
  }

  /* ------------------------------ Cursor glow ---------------------------- */
  function initCursor() {
    var glow = document.querySelector('.cursor-glow');
    var dot = document.querySelector('.cursor-dot');
    if (!glow || !dot) return;
    if (reduced() || !fineQuery.matches) {
      glow.remove();
      dot.remove();
      return;
    }

    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var gx = tx, gy = ty, dx = tx, dy = ty;
    var running = false;

    var HOT = 'a, button, .card, .plan, .faq-q, .qbtn, input, select, textarea, [role="radio"]';

    function tick() {
      // Glow trails with noticeable lag; the dot tracks almost immediately.
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      dx += (tx - dx) * 0.42;
      dy += (ty - dy) * 0.42;
      glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
      dot.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      if (Math.abs(tx - gx) > 0.1 || Math.abs(ty - gy) > 0.1) {
        requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function start() {
      if (!running) { running = true; requestAnimationFrame(tick); }
    }

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      tx = e.clientX;
      ty = e.clientY;
      glow.classList.add('is-on');
      dot.classList.add('is-on');
      var hot = e.target && e.target.closest && e.target.closest(HOT);
      glow.classList.toggle('is-hot', !!hot);
      dot.classList.toggle('is-hot', !!hot);
      start();
    }, { passive: true });

    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') {
        glow.classList.remove('is-on', 'is-hot');
        dot.classList.remove('is-on', 'is-hot');
      }
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', function () {
      glow.classList.remove('is-on');
      dot.classList.remove('is-on');
    });
  }

  /* ------------------------------ Navigation ----------------------------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var panel = document.getElementById('navPanel');
    if (!toggle || !panel) return;

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      panel.classList.remove('is-open');
      panel.style.maxHeight = '0px';
    }

    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      panel.classList.add('is-open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }

    toggle.addEventListener('click', function () {
      toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        close();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      onFrame(function () {
        if (panel.classList.contains('is-open')) {
          if (!isMobile()) close();
          else panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });

    // Anchor scrolling: CSS handles the smoothing; JS moves focus for keyboards.
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: reduced() ? 'auto' : 'smooth',
          block: 'start'
        });
        if (history.replaceState) history.replaceState(null, '', id);
        window.setTimeout(function () {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }, reduced() ? 0 : 620);
      });
    });
  }

  /* ---------------------------- Hero entrance ---------------------------- */
  function initHeroEntrance() {
    var step = isMobile() ? 70 : 100;
    document.querySelectorAll('[data-stage]').forEach(function (el) {
      var i = parseInt(el.getAttribute('data-stage'), 10) || 1;
      el.style.transitionDelay = (i - 1) * step + 'ms';
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { document.body.classList.add('loaded'); });
    });
  }

  /* ---------------------------- Hero parallax ---------------------------- */
  function initHeroParallax() {
    var bg = document.getElementById('heroBg');
    var visual = document.getElementById('heroVisual');
    var hero = document.getElementById('home');
    if (!hero || reduced()) return;

    var heroHeight = hero.offsetHeight || 1;

    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (y > heroHeight * 1.3) return;
      var p = Math.min(Math.max(y / heroHeight, 0), 1);
      if (bg) bg.style.transform = 'translate3d(0,' + (p * 70).toFixed(2) + 'px,0)';
      if (visual) {
        var scale = 1 - p * 0.08;            // 1 -> 0.92
        visual.style.transform = 'translate3d(0,' + (p * -18).toFixed(2) + 'px,0) scale(' + scale.toFixed(4) + ')';
        visual.style.opacity = (1 - p * 0.45).toFixed(3);
      }
    }

    window.addEventListener('scroll', function () { onFrame(update); }, { passive: true });
    window.addEventListener('resize', function () {
      onFrame(function () { heroHeight = hero.offsetHeight || 1; update(); });
    }, { passive: true });
    update();
  }

  /* ------------------------------ Text split ----------------------------- */
  function splitChars(host) {
    var full = host.textContent.replace(/\s+/g, ' ').trim();
    host.setAttribute('aria-label', full);
    var index = 0;

    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (chunk) {
            if (!chunk) return;
            if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(' ')); return; }
            var word = document.createElement('span');
            word.className = 'split-word';
            word.setAttribute('aria-hidden', 'true');
            chunk.split('').forEach(function (ch) {
              var s = document.createElement('span');
              s.className = 'split-char';
              s.textContent = ch;
              s.style.transitionDelay = Math.min(index * 16, 640) + 'ms';
              index++;
              word.appendChild(s);
            });
            frag.appendChild(word);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          child.setAttribute('aria-hidden', 'true');
          if (child.tagName === 'EM') {
            // Gradient text is clipped to its own box, so it animates as one
            // unit rather than as separate characters.
            child.classList.add('split-char');
            child.style.transitionDelay = Math.min(index * 16, 640) + 'ms';
            index += child.textContent.length;
          } else {
            walk(child);
          }
        }
      });
    })(host);
  }

  function initSplits() {
    // On small screens the character reveal is replaced by a line-level fade.
    if (reduced() || isMobile()) return;
    document.querySelectorAll('[data-split], [data-split-sm]').forEach(function (el) {
      splitChars(el);
      if (el.hasAttribute('data-reveal')) el.style.setProperty('--reveal-y', '0px');
    });
  }

  /* ------------------------------- Reveals ------------------------------- */
  function initReveals() {
    var labels = document.querySelectorAll('[data-label]');
    var groups = document.querySelectorAll('[data-stagger]');
    var grouped = [];

    if (reduced() || !('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal], [data-label]').forEach(function (el) {
        el.classList.add('is-in');
      });
      return;
    }

    function makeObserver(ratio) {
      return new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);           // reveal once per page load
        });
      }, { threshold: ratio, rootMargin: '0px 0px -8% 0px' });
    }

    var standard = makeObserver(0.2);
    var tall = makeObserver(0.05);

    function observe(el) {
      (el.offsetHeight > window.innerHeight * 0.6 ? tall : standard).observe(el);
    }

    // Staggered groups reveal their children together, in DOM order.
    if (!isMobile()) {
      groups.forEach(function (group) {
        var step = parseInt(group.getAttribute('data-stagger'), 10) || 100;
        var kids = Array.prototype.slice.call(group.querySelectorAll('[data-reveal]'));
        kids.forEach(function (kid, i) {
          kid.style.setProperty('--reveal-d', i * step + 'ms');
          kid.style.setProperty('--reveal-s', '0.98');
          grouped.push(kid);
        });
        var groupObserver = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            kids.forEach(function (kid) { kid.classList.add('is-in'); });
            obs.unobserve(entry.target);
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        groupObserver.observe(group);
      });
    } else {
      // Stacked on mobile: each card arrives on its own as it scrolls in.
      groups.forEach(function (group) {
        group.querySelectorAll('[data-reveal]').forEach(function (kid) {
          kid.style.setProperty('--reveal-s', '0.99');
        });
      });
    }

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (grouped.indexOf(el) === -1) observe(el);
    });
    labels.forEach(function (el) { standard.observe(el); });
  }

  /* ------------------------------- Marquee ------------------------------- */
  function initMarquee() {
    var track = document.getElementById('marqueeTrack');
    if (!track) return;
    var group = track.querySelector('[data-marquee-group]');
    if (!group) return;

    if (reduced()) return; // CSS already stops the animation; keep it scrollable.

    var clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('data-marquee-group');
    track.appendChild(clone);

    function setSpeed() {
      var width = group.getBoundingClientRect().width;
      if (!width) return;
      var SPEED = 100; // px per second
      track.style.setProperty('--marquee-duration', (width / SPEED).toFixed(2) + 's');
    }

    setSpeed();
    window.addEventListener('resize', function () { onFrame(setSpeed); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setSpeed);
  }

  /* --------------------------- Testimonials ------------------------------ */
  var QUOTES = [
    {
      text: 'Migrating our treasury votes to Choice Coin cut a three-week approval cycle down to an afternoon. The council stopped arguing about the count and started arguing about the decision.',
      name: 'Kene Obi',
      role: 'Operations Lead, Helios DAO',
      color: '#8b7bff'
    },
    {
      text: 'The tally is the only thing our members ever trusted less than the agenda. Now every ballot has a transaction ID, and the argument is simply over.',
      name: 'Marcus Okafor',
      role: 'Co-founder, Quorum Fund',
      color: '#45d9e8'
    },
    {
      text: 'Outstanding developer experience. We wired our membership registry into the ballot contract in two afternoons, and we have not touched it since.',
      name: 'Amara Ibe',
      role: 'Protocol Engineer, Vertex Labs',
      color: '#6ee7a8'
    },
    {
      text: 'We run a cooperative across four time zones. Asynchronous, weighted, final in seconds — this is the first governance tool that respected how we actually work.',
      name: 'Tunde Ramos',
      role: 'Chair, Civic Ledger',
      color: '#f5a26b'
    }
  ];

  function initQuotes() {
    var body = document.getElementById('quoteBody');
    var textEl = document.getElementById('quoteText');
    var nameEl = document.getElementById('quoteName');
    var roleEl = document.getElementById('quoteRole');
    var avatarEl = document.getElementById('quoteAvatar');
    var prevBtn = document.getElementById('quotePrev');
    var nextBtn = document.getElementById('quoteNext');
    var dotsEl = document.getElementById('quoteDots');
    if (!body || !textEl) return;

    var index = 0;
    var busy = false;

    function initials(name) {
      return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    }

    function render(i) {
      var q = QUOTES[i];
      textEl.textContent = q.text;
      nameEl.textContent = q.name;
      roleEl.textContent = q.role;
      avatarEl.textContent = initials(q.name);
      avatarEl.style.background = q.color;
      Array.prototype.forEach.call(dotsEl.children, function (dot, di) {
        dot.setAttribute('aria-current', di === i ? 'true' : 'false');
      });
    }

    function go(next, dir) {
      if (busy || next === index) return;
      index = (next + QUOTES.length) % QUOTES.length;

      if (reduced()) { render(index); return; }

      busy = true;
      body.classList.add(dir > 0 ? 'out-left' : 'out-right');

      window.setTimeout(function () {
        render(index);
        body.classList.remove('out-left', 'out-right');
        // Snap to the incoming position without a transition, then release.
        body.style.transition = 'none';
        body.classList.add(dir > 0 ? 'in-right' : 'in-left');
        void body.offsetWidth;
        body.style.transition = '';
        body.classList.remove('in-right', 'in-left');
        busy = false;
      }, 400);
    }

    QUOTES.forEach(function (q, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Testimonial ' + (i + 1) + ' of ' + QUOTES.length);
      dot.addEventListener('click', function () { go(i, i > index ? 1 : -1); });
      dotsEl.appendChild(dot);
    });

    render(0);

    nextBtn.addEventListener('click', function () { go(index + 1, 1); });
    prevBtn.addEventListener('click', function () { go(index - 1, -1); });

    // Arrow keys, but only while the carousel is on screen.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      var box = body.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      e.preventDefault();
      e.key === 'ArrowRight' ? go(index + 1, 1) : go(index - 1, -1);
    });

    // Horizontal swipe on touch.
    var sx = 0, sy = 0, tracking = false;
    var stage = body.parentNode;
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var ddx = t.clientX - sx;
      var ddy = t.clientY - sy;
      if (Math.abs(ddx) < 45 || Math.abs(ddx) < Math.abs(ddy)) return;
      ddx < 0 ? go(index + 1, 1) : go(index - 1, -1);
    }, { passive: true });
  }

  /* ---------------------------- Pricing toggle --------------------------- */
  function initPricing() {
    var group = document.getElementById('billing');
    var pill = document.getElementById('billPill');
    if (!group || !pill) return;

    var buttons = Array.prototype.slice.call(group.querySelectorAll('.seg-btn'));
    var prices = Array.prototype.slice.call(document.querySelectorAll('.price-value'));
    var labels = Array.prototype.slice.call(document.querySelectorAll('[data-period-label]'));
    var period = 'monthly';

    function movePill() {
      var active = buttons.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0] || buttons[0];
      pill.style.width = active.offsetWidth + 'px';
      pill.style.transform = 'translate3d(' + (active.offsetLeft - buttons[0].offsetLeft) + 'px,0,0)';
    }

    function setPrices(next) {
      prices.forEach(function (el) {
        var value = el.getAttribute('data-' + next) || el.textContent;
        if (value === el.textContent) return;
        if (reduced()) { el.textContent = value; return; }
        el.classList.add('rolling');
        window.setTimeout(function () {
          el.textContent = value;
          el.classList.remove('rolling');
          el.style.transition = 'none';
          el.classList.add('rolling-in');
          void el.offsetWidth;
          el.style.transition = '';
          el.classList.remove('rolling-in');
        }, 300);
      });
      labels.forEach(function (el) {
        el.textContent = next === 'annual' ? '/ mo, billed yearly' : '/ month';
      });
    }

    function select(btn) {
      var next = btn.getAttribute('data-period');
      if (next === period) return;
      period = next;
      buttons.forEach(function (b) { b.setAttribute('aria-checked', String(b === btn)); });
      movePill();
      setPrices(period);
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { select(btn); });
      btn.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        var nextBtn = buttons[(i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
        nextBtn.focus();
        select(nextBtn);
      });
    });

    movePill();
    window.addEventListener('resize', function () { onFrame(movePill); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);
  }

  /* ------------------------------ FAQ rows ------------------------------- */
  function initFaq() {
    var list = document.getElementById('faqList');
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('.faq-item'));

    function collapse(item) {
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');
      if (btn.getAttribute('aria-expanded') !== 'true') return;
      panel.style.height = panel.scrollHeight + 'px';
      void panel.offsetHeight;
      item.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      panel.style.height = '0px';
    }

    function expand(item) {
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      panel.style.height = panel.scrollHeight + 'px';
    }

    items.forEach(function (item) {
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');

      // Once open, release the fixed height so the answer can reflow.
      panel.addEventListener('transitionend', function (e) {
        if (e.propertyName !== 'height') return;
        if (item.classList.contains('is-open')) panel.style.height = 'auto';
      });

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        items.forEach(function (other) { if (other !== item) collapse(other); });
        open ? collapse(item) : expand(item);
      });
    });

    window.addEventListener('resize', function () {
      onFrame(function () {
        items.forEach(function (item) {
          if (!item.classList.contains('is-open')) return;
          item.querySelector('.faq-a').style.height = 'auto';
        });
      });
    }, { passive: true });
  }

  /* --------------------------- Card pointer glow ------------------------- */
  function initCardGlow() {
    if (reduced() || !fineQuery.matches) return;
    document.querySelectorAll('[data-card]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }, { passive: true });
    });
  }

  /* -------------------------------- Boot --------------------------------- */
  function boot() {
    initNav();
    initSplits();
    initReveals();
    initHeroEntrance();
    initHeroParallax();
    initMarquee();
    initQuotes();
    initPricing();
    initFaq();
    initCursor();
    initCardGlow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // If the user switches motion preference mid-session, start clean.
  var onPrefChange = function () { window.location.reload(); };
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onPrefChange);
  else if (reduceQuery.addListener) reduceQuery.addListener(onPrefChange);
})();
