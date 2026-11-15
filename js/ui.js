/* ==========================================================================
   ui.js — navigation (sticky header, active-section indicator, mobile menu),
   scroll reveal, pointer effects (spotlight, tilt, glow), counters, filters,
   copy-to-clipboard and toast.
   ========================================================================== */
(function () {
  "use strict";

  var P = (window.Portfolio = window.Portfolio || {});
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Toast ---------- */
  var toastEl, toastTimer;
  P.toast = function (message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  };

  /* ---------- Header: transparent -> glass, scroll progress ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    var bar = document.querySelector(".scroll-progress");
    var ticking = false;
    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (header) header.classList.toggle("scrolled", y > 24);
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.getElementById("nav-links");
    if (!toggle || !links) return;
    function setOpen(open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    toggle.addEventListener("click", function () { setOpen(!document.body.classList.contains("nav-open")); });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) setOpen(false); });
  }

  /* ---------- Active-section indicator ---------- */
  function initActiveNav() {
    var nav = document.getElementById("nav-links");
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var ind = nav.querySelector(".nav-ind");
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var current = null;

    function place() {
      var a = links.filter(function (l) { return l.getAttribute("aria-current") === "location"; })[0];
      if (!a || !ind) return;
      ind.style.setProperty("--x", a.offsetLeft + "px");
      ind.style.setProperty("--w", a.offsetWidth + "px");
      ind.classList.add("ready");
    }
    function setActive(id) {
      if (id === current) return;
      current = id;
      links.forEach(function (l) {
        if (l.getAttribute("href") === "#" + id) l.setAttribute("aria-current", "location");
        else l.removeAttribute("aria-current");
      });
      place();
    }

    // The section whose top has most recently crossed the upper third of the viewport is active.
    var ticking = false;
    function compute() {
      ticking = false;
      var line = window.innerHeight * 0.35, best = sections[0] && sections[0].id;
      sections.forEach(function (s) { if (s && s.getBoundingClientRect().top <= line) best = s.id; });
      var atBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4;
      if (atBottom && sections.length) best = sections[sections.length - 1].id;
      if (best) setActive(best);
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(compute); } }, { passive: true });
    window.addEventListener("resize", function () { compute(); place(); });
    document.addEventListener("languagechange", function () { requestAnimationFrame(place); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener("load", function () { compute(); place(); });
    compute();
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Pointer effects (desktop only) ---------- */
  function initPointer() {
    // Spotlight inside glass surfaces
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest(".glass");
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });

    if (reduceMotion || !finePointer) return;

    // Ambient light that follows the cursor
    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);
    var gx = 0, gy = 0, raf = null;
    document.addEventListener("pointermove", function (e) {
      gx = e.clientX; gy = e.clientY;
      glow.classList.add("on");
      if (!raf) raf = requestAnimationFrame(function () {
        glow.style.transform = "translate(" + gx + "px," + gy + "px)";
        raf = null;
      });
    }, { passive: true });
    document.addEventListener("pointerleave", function () { glow.classList.remove("on"); });

    // 3D tilt: [data-tilt="deg"] zone drives the [data-tilt-target] child
    document.querySelectorAll("[data-tilt]").forEach(function (zone) {
      var target = zone.querySelector("[data-tilt-target]") || zone;
      var max = parseFloat(zone.getAttribute("data-tilt")) || 6;
      zone.addEventListener("pointermove", function (e) {
        var r = zone.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        target.style.setProperty("--ry", (px * max * 2).toFixed(2) + "deg");
        target.style.setProperty("--rx", (-py * max * 2).toFixed(2) + "deg");
      });
      zone.addEventListener("pointerleave", function () {
        target.style.setProperty("--ry", "0deg");
        target.style.setProperty("--rx", "0deg");
      });
    });

    // Subtle magnetic pull on primary buttons
    document.querySelectorAll("[data-magnetic]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + "px," +
          ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;
      if (reduceMotion) { el.textContent = target; return; }
      var start = null, dur = 1300;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) {
      if (!reduceMotion) el.textContent = "0";
      io.observe(el);
    });
  }

  /* ---------- Filters (projects + certificates) ---------- */
  function initFilters() {
    document.querySelectorAll("[data-filter-group]").forEach(function (group) {
      var scope = document.querySelector(group.getAttribute("data-filter-group"));
      if (!scope) return;
      var buttons = group.querySelectorAll("[data-filter]");
      var items = scope.querySelectorAll("[data-filter-item]");
      var alternate = scope.hasAttribute("data-alternate");

      function apply(tag) {
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === tag ? "true" : "false"); });
        var n = 0;
        items.forEach(function (it) {
          var tags = (it.getAttribute("data-tags") || "").split(" ");
          var show = tag === "all" || tags.indexOf(tag) !== -1;
          it.hidden = !show;
          if (show && alternate) it.classList.toggle("alt", n++ % 2 === 1); // keep the zig-zag rhythm
        });
      }
      buttons.forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-filter")); }); });
      apply("all");
    });
  }

  /* ---------- Copy to clipboard ---------- */
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  function initCopy() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-copy]");
      if (!btn) return;
      e.preventDefault();
      var text = btn.getAttribute("data-copy");
      function done(ok) { P.toast(P.t(ok ? "toast.copied" : "toast.copyfail")); }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else { done(fallbackCopy(text)); }
    });
  }

  /* ---------- Deep links: reveal a project hidden by a filter ---------- */
  function initHash() {
    function reveal() {
      var id = window.location.hash.slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (el && el.hidden) {
        var all = document.querySelector('[data-filter="all"]');
        if (all) all.click();
        el.scrollIntoView();
      }
    }
    window.addEventListener("hashchange", reveal);
    reveal();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMenu();
    initActiveNav();
    initReveal();
    initPointer();
    initCounters();
    initFilters();
    initCopy();
    initHash();
  });
})();
