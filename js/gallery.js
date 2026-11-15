/* ==========================================================================
   gallery.js — accessible screenshot lightbox (native <dialog>).
   Any <button data-lightbox data-group="x"> containing an <img> opens it;
   buttons sharing a data-group can be paged with the arrows or arrow keys.
   ========================================================================== */
(function () {
  "use strict";

  var P = (window.Portfolio = window.Portfolio || {});
  var dlg, imgEl, capEl, countEl, items = [], index = 0, lastFocus = null;

  var ICON = function (name) {
    return '<svg class="ico" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  };

  function build() {
    dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", "Screenshot viewer");
    dlg.innerHTML =
      '<div class="lb-inner">' +
        '<button type="button" class="lb-btn lb-close" data-lb-close>' + ICON("x") + "</button>" +
        '<button type="button" class="lb-btn lb-prev" data-lb-prev>' + ICON("chev-left") + "</button>" +
        '<button type="button" class="lb-btn lb-next" data-lb-next>' + ICON("chev-right") + "</button>" +
        "<figure><img alt=\"\"><figcaption></figcaption></figure>" +
        '<div class="lb-count" aria-live="polite"></div>' +
      "</div>";
    document.body.appendChild(dlg);
    imgEl = dlg.querySelector("img");
    capEl = dlg.querySelector("figcaption");
    countEl = dlg.querySelector(".lb-count");

    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.classList.contains("lb-inner")) dlg.close();
      else if (e.target.closest("[data-lb-close]")) dlg.close();
      else if (e.target.closest("[data-lb-prev]")) go(-1);
      else if (e.target.closest("[data-lb-next]")) go(1);
    });
    dlg.addEventListener("keydown", function (e) {
      var rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    });
    dlg.addEventListener("close", function () {
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
  }

  function labels() {
    dlg.querySelector("[data-lb-close]").setAttribute("aria-label", P.t("projects.lb.close"));
    dlg.querySelector("[data-lb-prev]").setAttribute("aria-label", P.t("projects.lb.prev"));
    dlg.querySelector("[data-lb-next]").setAttribute("aria-label", P.t("projects.lb.next"));
  }

  function show() {
    var src = items[index].querySelector("img");
    imgEl.src = src.currentSrc || src.src;
    imgEl.alt = src.alt;
    capEl.textContent = src.alt;
    var multi = items.length > 1;
    dlg.querySelector("[data-lb-prev]").hidden = !multi;
    dlg.querySelector("[data-lb-next]").hidden = !multi;
    countEl.textContent = multi ? (index + 1) + " / " + items.length : "";
  }

  function go(step) {
    if (items.length < 2) return;
    index = (index + step + items.length) % items.length;
    show();
  }

  function open(btn) {
    if (!dlg) build();
    if (typeof dlg.showModal !== "function") {
      // Very old browsers: fall back to opening the image itself
      window.open(btn.querySelector("img").src, "_blank", "noopener");
      return;
    }
    var group = btn.getAttribute("data-group");
    items = Array.prototype.slice.call(
      document.querySelectorAll('[data-lightbox][data-group="' + group + '"]')
    );
    // The hero button and the thumbnail can point to the same file; keep each file once.
    var seen = {};
    items = items.filter(function (b) {
      var s = b.querySelector("img").getAttribute("src");
      if (seen[s]) return false;
      seen[s] = true;
      return true;
    });
    var s0 = btn.querySelector("img").getAttribute("src");
    index = Math.max(0, items.findIndex(function (b) { return b.querySelector("img").getAttribute("src") === s0; }));
    lastFocus = btn;
    labels();
    show();
    document.body.style.overflow = "hidden";
    dlg.showModal();
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-lightbox]");
    if (btn) open(btn);
  });
  document.addEventListener("languagechange", function () {
    if (dlg) { labels(); if (dlg.open) show(); }
  });
})();
