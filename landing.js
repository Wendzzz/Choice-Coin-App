/* =============================================================
   Choice Coin — landing page motion
   Everything here animates transform/opacity and is gated on
   prefers-reduced-motion. Viewport reveals use IntersectionObserver.
   ============================================================= */
(function () {
  "use strict";

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var SMALL = 720;

  function reduced() { return reduceQuery.matches; }
  function isSmall() { return window.innerWidth <= SMALL; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function msOf(el) { return parseFloat(el.style.getPropertyValue("--delay")) || 0; }

  /* -----------------------------------------------------------
     1. Stagger groups
     ----------------------------------------------------------- */

  $$("[data-stagger]").forEach(function (group) {
    var step = parseFloat(group.getAttribute("data-stagger")) || 100;
    if (isSmall()) step *= 0.6;
    $$(":scope > [data-reveal]", group).forEach(function (child, i) {
      child.style.setProperty("--delay", Math.round(i * step) + "ms");
    });
  });

  /* -----------------------------------------------------------
     2. Character splitting
     The animated copy is aria-hidden; an unsplit copy stays in the
     accessibility tree. On small screens and under reduced motion
     we never split, so the text simply fades in as one line.
     ----------------------------------------------------------- */

  function splitChars(el) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;

    var sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = text;

    var visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");

    var owner = el.closest("[data-reveal]");
    var base = msOf(el) + (owner && owner !== el ? msOf(owner) : 0);
    var index = 0;

    text.split(" ").forEach(function (word, w) {
      if (w > 0) {
        var gap = document.createElement("span");
        gap.className = "char char--space";
        gap.style.transitionDelay = base + index * 18 + "ms";
        gap.innerHTML = "&nbsp;";
        visual.appendChild(gap);
        index++;
      }
      var wordEl = document.createElement("span");
      wordEl.className = "word";
      word.split("").forEach(function (ch) {
        var c = document.createElement("span");
        c.className = "char";
        c.textContent = ch;
        c.style.transitionDelay = base + index * 18 + "ms";
        wordEl.appendChild(c);
        index++;
      });
      visual.appendChild(wordEl);
    });

    el.textContent = "";
    el.appendChild(sr);
    el.appendChild(visual);
    /* the characters carry the movement, so the box itself stays put */
    el.style.setProperty("--rise", "0px");
  }

  if (!reduced() && !isSmall()) {
    $$("[data-split], [data-split-sm]").forEach(splitChars);
  }

  /* -----------------------------------------------------------
     3. Viewport reveals — fire once at ~20% visibility
     ----------------------------------------------------------- */

  function revealGroup(el) {
    el.classList.add("is-in");
    if (!el.hasAttribute("data-step")) return;
    /* a step column reveals its own children in order, offset by
       the column's place in the left-to-right stagger */
    var base = msOf(el);
    $$("[data-reveal]", el).forEach(function (child) {
      child.style.setProperty("--delay", base + msOf(child) + "ms");
      child.classList.add("is-in");
    });
  }

  var revealTargets = $$("[data-reveal]").filter(function (el) {
    if (el.hasAttribute("data-stage")) return false;          // hero runs its own sequence
    var step = el.closest("[data-step]");
    return !step || step === el;                               // step children ride the column
  });

  if (reduced() || !("IntersectionObserver" in window)) {
    revealTargets.forEach(revealGroup);
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var tallerThanViewport = entry.boundingClientRect.height > window.innerHeight * 0.8;
        if (entry.intersectionRatio < 0.2 && !tallerThanViewport) return;
        revealGroup(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: [0, 0.2], rootMargin: "0px 0px -5% 0px" });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* -----------------------------------------------------------
     4. Hero entrance — eyebrow, headline, paragraph, CTA, visual
     Per-stage offsets live on the markup as --delay (0 → 540ms).
     ----------------------------------------------------------- */

  var heroStages = $$("[data-stage]");
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      heroStages.forEach(function (el) { el.classList.add("is-in"); });
    });
  });

  /* -----------------------------------------------------------
     5. Hero parallax + dashboard recede
     ----------------------------------------------------------- */

  var hero = $("#hero");
  var heroVisual = $("#heroParallax");
  var parallaxLayers = $$("[data-parallax]");

  if (hero && !reduced()) {
    var ticking = false;
    var heroHeight = hero.offsetHeight;

    var measure = function () { heroHeight = hero.offsetHeight; };

    var paint = function () {
      ticking = false;
      var y = window.pageYOffset;
      if (y > heroHeight + 240) return;              // nothing to do once the hero is gone

      parallaxLayers.forEach(function (layer) {
        var speed = parseFloat(layer.getAttribute("data-parallax")) || 0.15;
        layer.style.transform = "translate3d(0," + (y * speed).toFixed(2) + "px,0)";
      });

      if (heroVisual) {
        var p = Math.min(1, Math.max(0, y / (heroHeight * 0.9)));
        heroVisual.style.transform =
          "translate3d(0," + (-20 * p).toFixed(2) + "px,0) scale(" + (1 - 0.08 * p).toFixed(4) + ")";
        heroVisual.style.opacity = (1 - 0.45 * p).toFixed(3);
      }
    };

    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { measure(); onScroll(); }, { passive: true });
    paint();
  }

  /* -----------------------------------------------------------
     6. Navigation — smooth anchors, mobile panel, active link
     ----------------------------------------------------------- */

  var toggle = $("#navToggle");
  var panel = $("#navPanel");

  function closePanel() {
    if (!panel || !toggle) return;
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        closePanel();
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!panel.classList.contains("is-open")) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      closePanel();
    });
  }

  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closePanel();
      target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  });

  var navLinks = $$(".nav__link");
  if (navLinks.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var on = link.getAttribute("href") === "#" + entry.target.id;
          if (on) { link.setAttribute("aria-current", "true"); }
          else { link.removeAttribute("aria-current"); }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute("href"));
      if (section) sectionObserver.observe(section);
    });
  }

  /* -----------------------------------------------------------
     7. Cursor glow — desktop pointers only
     ----------------------------------------------------------- */

  var cursor = $("#cursor");
  if (cursor && finePointer.matches && !reduced()) {
    var halo = $(".cursor__halo", cursor);
    var dot = $(".cursor__dot", cursor);
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var hx = tx, hy = ty, dx = tx, dy = ty;
    var running = false;

    var frame = function () {
      hx += (tx - hx) * 0.13;                     // slow, trailing halo
      hy += (ty - hy) * 0.13;
      dx += (tx - dx) * 0.34;                     // tighter core
      dy += (ty - dy) * 0.34;
      halo.style.transform = "translate3d(" + hx + "px," + hy + "px,0)";
      dot.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
      if (running) requestAnimationFrame(frame);
    };

    var HOT = 'a, button, [role="button"], input, select, textarea, summary, .faq__row';

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!running) {
        running = true;
        hx = dx = tx; hy = dy = ty;
        cursor.classList.add("is-live");
        requestAnimationFrame(frame);
      }
      var hot = e.target && e.target.closest ? e.target.closest(HOT) : null;
      cursor.classList.toggle("is-hot", !!hot);
    }, { passive: true });

    document.addEventListener("pointerleave", function () { cursor.classList.remove("is-live"); });
    document.addEventListener("pointerenter", function () { if (running) cursor.classList.add("is-live"); });
  }

  /* -----------------------------------------------------------
     8. Ecosystem marquee — duplicated group, constant px/s
     ----------------------------------------------------------- */

  var track = $("#marqueeTrack");
  if (track) {
    var group = $("[data-marquee-group]", track);
    if (group && !reduced()) {
      var clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.removeAttribute("data-marquee-group");
      track.appendChild(clone);

      var SPEED = 100;                            // px per second
      var setDuration = function () {
        var width = group.getBoundingClientRect().width;
        if (width > 0) track.style.setProperty("--marquee-dur", (width / SPEED).toFixed(2) + "s");
      };
      setDuration();
      window.addEventListener("resize", setDuration, { passive: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(setDuration);
    }
  }

  /* -----------------------------------------------------------
     9. Testimonial carousel — manual only, never autoplays
     ----------------------------------------------------------- */

  var carousel = $("#carousel");
  if (carousel) {
    var slides = $$("[data-slide]", carousel);
    var stage = $(".carousel__stage", carousel);
    var dotsBox = $("#tDots");
    var status = $("#tStatus");
    var current = 0;
    var busy = false;

    slides.forEach(function (_, i) {
      var d = document.createElement("span");
      if (i === 0) d.className = "is-on";
      dotsBox.appendChild(d);
    });
    var dots = $$("span", dotsBox);

    function announce() {
      if (status) status.textContent = "Quote " + (current + 1) + " of " + slides.length;
    }
    announce();

    function go(next, dir) {
      if (busy || next === current || slides.length < 2) return;
      busy = true;
      carousel.style.setProperty("--dir", dir);

      var leaving = slides[current];
      var entering = slides[next];

      leaving.classList.remove("is-active");
      leaving.classList.add("is-leaving");
      entering.classList.add("is-active");

      window.setTimeout(function () {
        leaving.classList.remove("is-leaving");
        busy = false;
      }, reduced() ? 20 : 420);

      current = next;
      dots.forEach(function (d, i) { d.classList.toggle("is-on", i === current); });
      announce();
    }

    function next() { go((current + 1) % slides.length, 1); }
    function prev() { go((current - 1 + slides.length) % slides.length, -1); }

    $("#tNext").addEventListener("click", next);
    $("#tPrev").addEventListener("click", prev);

    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    });

    /* horizontal swipe on touch */
    var startX = null, startY = null;
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      startX = e.clientX; startY = e.clientY;
    }, { passive: true });

    stage.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var moveX = e.clientX - startX;
      var moveY = e.clientY - startY;
      startX = startY = null;
      if (Math.abs(moveX) < 45 || Math.abs(moveX) < Math.abs(moveY)) return;
      if (moveX < 0) next(); else prev();
    }, { passive: true });

    stage.addEventListener("pointercancel", function () { startX = startY = null; }, { passive: true });
  }

  /* -----------------------------------------------------------
     10. Pricing period toggle
     ----------------------------------------------------------- */

  var seg = $("#seg");
  if (seg) {
    var segButtons = $$(".seg__btn", seg);
    var prices = $$(".price");
    var periods = $$(".plan__per");
    var period = seg.getAttribute("data-period") || "monthly";

    function setPeriod(next) {
      if (next === period) return;
      period = next;
      seg.setAttribute("data-period", period);
      segButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-period") === period));
      });

      var priceKey = period;                                   // data-monthly / data-annual
      var perKey = period === "monthly" ? "perMonthly" : "perAnnual";

      /* every price changes in the same tick, then rolls back in */
      prices.forEach(function (el) { swap(el, el.dataset[priceKey]); });
      periods.forEach(function (el) { swap(el, el.dataset[perKey]); });
    }

    function swap(el, value) {
      if (value == null) return;
      if (reduced()) { el.textContent = value; return; }
      el.classList.add("is-rolling");
      window.setTimeout(function () {
        el.textContent = value;
        el.classList.remove("is-rolling");
      }, 160);
    }

    segButtons.forEach(function (btn) {
      btn.addEventListener("click", function () { setPeriod(btn.getAttribute("data-period")); });
    });
  }

  /* -----------------------------------------------------------
     11. FAQ accordion — one open at a time, scroll position kept
     ----------------------------------------------------------- */

  var faqList = $("#faqList");
  if (faqList) {
    var items = $$(".faq__item", faqList);
    var DURATION = 340;

    function panelOf(item) { return $(".faq__panel", item); }
    function rowOf(item) { return $(".faq__row", item); }

    function openItem(item) {
      var p = panelOf(item);
      item.classList.add("is-open");
      rowOf(item).setAttribute("aria-expanded", "true");
      if (reduced()) { p.style.height = "auto"; return; }
      p.style.height = p.scrollHeight + "px";
      p.addEventListener("transitionend", function done(e) {
        if (e.propertyName !== "height") return;
        p.removeEventListener("transitionend", done);
        if (item.classList.contains("is-open")) p.style.height = "auto";
      });
    }

    function closeItem(item) {
      var p = panelOf(item);
      item.classList.remove("is-open");
      rowOf(item).setAttribute("aria-expanded", "false");
      if (reduced()) { p.style.height = "0px"; return; }
      p.style.height = p.scrollHeight + "px";
      void p.offsetHeight;                                     // commit the fixed height
      p.style.height = "0px";
    }

    /* Hold the clicked row still while the panels above it resize. */
    function pinRow(row) {
      if (reduced()) return;
      var target = row.getBoundingClientRect().top;
      var start = performance.now();
      var cancelled = false;
      var stop = function () { cancelled = true; };

      ["wheel", "touchstart", "keydown"].forEach(function (evt) {
        window.addEventListener(evt, stop, { passive: true, once: true });
      });

      (function keep(now) {
        if (cancelled) return;
        var drift = row.getBoundingClientRect().top - target;
        if (Math.abs(drift) > 0.5) window.scrollBy(0, drift);
        if ((now || start) - start < DURATION + 40) requestAnimationFrame(keep);
      })(start);
    }

    items.forEach(function (item) {
      rowOf(item).addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        var openSibling = items.filter(function (other) {
          return other !== item && other.classList.contains("is-open");
        })[0];

        pinRow(rowOf(item));
        if (openSibling) closeItem(openSibling);
        if (isOpen) closeItem(item); else openItem(item);
      });
    });

    /* keep an open answer measured correctly when the layout reflows */
    window.addEventListener("resize", function () {
      items.forEach(function (item) {
        if (!item.classList.contains("is-open")) return;
        var p = panelOf(item);
        p.style.height = "auto";
      });
    }, { passive: true });
  }
})();
