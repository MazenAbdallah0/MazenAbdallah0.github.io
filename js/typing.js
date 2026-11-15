/* ==========================================================================
   typing.js — animated typing effect for the skills line in the hero.
   Words come from the translation dictionary, so it works in English and Arabic.
   With "reduce motion" it shows the full list statically instead of animating.
   ========================================================================== */
(function () {
  "use strict";

  var P = (window.Portfolio = window.Portfolio || {});
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COUNT = 6;
  var timer = null;

  function start() {
    var el = document.querySelector("[data-typed]");
    if (!el) return;
    clearTimeout(timer);

    var caret = el.parentNode.querySelector(".caret");
    if (reduceMotion) {
      el.textContent = P.t("typed.static");
      if (caret) caret.hidden = true;
      return;
    }

    var list = [];
    for (var i = 1; i <= COUNT; i++) list.push(P.t("typed." + i));
    var w = 0, c = 0, deleting = false;
    el.textContent = "";

    function tick() {
      var word = list[w];
      if (!deleting) {
        c++;
        el.textContent = word.slice(0, c);
        if (c === word.length) { deleting = true; timer = setTimeout(tick, 1500); return; }
        timer = setTimeout(tick, 75 + Math.random() * 45);
      } else {
        c--;
        el.textContent = word.slice(0, c);
        if (c === 0) { deleting = false; w = (w + 1) % list.length; timer = setTimeout(tick, 320); return; }
        timer = setTimeout(tick, 35);
      }
    }
    timer = setTimeout(tick, 700);
  }

  document.addEventListener("languagechange", start);
  document.addEventListener("DOMContentLoaded", start);
})();
