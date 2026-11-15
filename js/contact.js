/* ==========================================================================
   contact.js — client-side validation; on success the form opens the visitor's
   email app with a pre-filled message (mailto:). No data is sent to any server.
   ========================================================================== */
(function () {
  "use strict";

  var P = (window.Portfolio = window.Portfolio || {});
  var TO = "mazenabdallah674@gmail.com";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var status = document.getElementById("form-status");
    var fields = {
      name: form.elements.name,
      email: form.elements.email,
      message: form.elements.message
    };
    var rules = {
      name: function (v) { return v.trim().length > 1; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      message: function (v) { return v.trim().length > 4; }
    };

    function setError(key, bad) {
      var wrap = fields[key].closest(".field");
      wrap.classList.toggle("invalid", bad);
      fields[key].setAttribute("aria-invalid", bad ? "true" : "false");
      var errKey = key === "message" ? "msg" : key; // dictionary key is contact.err.msg
      wrap.querySelector(".error").textContent = bad ? P.t("contact.err." + errKey) : "";
    }
    function validate(key) {
      var ok = rules[key](fields[key].value);
      setError(key, !ok);
      return ok;
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].addEventListener("blur", function () { validate(key); });
      fields[key].addEventListener("input", function () {
        if (fields[key].closest(".field").classList.contains("invalid")) validate(key);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true, firstBad = null;
      Object.keys(fields).forEach(function (key) {
        if (!validate(key)) { valid = false; firstBad = firstBad || fields[key]; }
      });
      if (!valid) { status.textContent = ""; firstBad.focus(); return; }

      var name = fields.name.value.trim();
      var subject = P.t("contact.mail.subject") + " " + name;
      var body = fields.message.value.trim() +
        "\n\n— " + name + " (" + fields.email.value.trim() + ")";
      status.textContent = P.t("contact.status.ok");
      window.location.href = "mailto:" + TO +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });

    // Clear stale messages when the language changes
    document.addEventListener("languagechange", function () {
      status.textContent = "";
      Object.keys(fields).forEach(function (key) {
        var wrap = fields[key].closest(".field");
        if (wrap.classList.contains("invalid")) setError(key, true);
      });
    });
  });
})();
