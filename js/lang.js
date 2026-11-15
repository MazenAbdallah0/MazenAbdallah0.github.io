/* ==========================================================================
   lang.js — English / Arabic switching with RTL support.
   English is the default and is already in the HTML (good for SEO); Arabic
   strings come from js/i18n-data.js and are swapped in via data-* attributes.
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "portfolio-lang";
  var data = window.PORTFOLIO_I18N || {};
  var current = "en";

  function readStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) { /* storage unavailable */ }
  }
  function pickInitial() {
    var q = new URLSearchParams(window.location.search).get("lang");
    if (q === "ar" || q === "en") return q;
    var s = readStored();
    return s === "ar" || s === "en" ? s : "en";
  }

  function t(key) {
    var d = data[current] || {};
    return d[key] != null ? d[key] : (data.en || {})[key] || key;
  }

  function apply(lang) {
    var d = data[lang];
    if (!d) return;
    current = lang;
    var root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = d[el.getAttribute("data-i18n")];
      if (v != null) el.textContent = v;
    });
    // Strings in data-i18n-html are written by me (no user input), so innerHTML is safe here.
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = d[el.getAttribute("data-i18n-html")];
      if (v != null) el.innerHTML = v;
    });
    // data-i18n-attr="attr:key;attr2:key2"
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var i = pair.indexOf(":");
        if (i < 1) return;
        var v = d[pair.slice(i + 1).trim()];
        if (v != null) el.setAttribute(pair.slice(0, i).trim(), v);
      });
    });

    store(lang);
    document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang: lang } }));
  }

  function bindToggle() {
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(current === "ar" ? "en" : "ar");
      });
    });
  }

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.t = t;
  window.Portfolio.lang = function () { return current; };

  document.addEventListener("DOMContentLoaded", function () {
    bindToggle();
    var initial = pickInitial();
    if (initial !== "en") apply(initial);
    else current = "en";
  });
})();
