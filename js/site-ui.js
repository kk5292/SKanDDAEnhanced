// js/site-ui.js
// Robust mobile menu toggle + accessibility helpers
// - safe if elements are missing
// - toggles #mobile-nav .active
// - manages aria-expanded on the toggle button
// - closes menu on outside click or Escape
// - prevents body scroll while menu open
// - supports touch and keyboard

(function () {
  "use strict";

  function setBodyLock(lock) {
    if (lock) {
      document.documentElement.classList.add("menu-open");
      document.body.classList.add("menu-open");
    } else {
      document.documentElement.classList.remove("menu-open");
      document.body.classList.remove("menu-open");
    }
  }

  function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle") || document.getElementById("menu-toggle");
    const mobileNav = document.getElementById("mobile-nav");
    if (!toggle || !mobileNav) return;

    if (toggle.tagName.toLowerCase() !== "button") {
      try { toggle.setAttribute("role", "button"); toggle.tabIndex = 0; } catch (e) {}
    }

    toggle.setAttribute("aria-controls", "mobile-nav");
    toggle.setAttribute("aria-expanded", mobileNav.classList.contains("active") ? "true" : "false");

    function openMenu() {
      mobileNav.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      setBodyLock(true);
      const firstLink = mobileNav.querySelector("a[href], button");
      if (firstLink && typeof firstLink.focus === "function") firstLink.focus();
    }

    function closeMenu() {
      mobileNav.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      setBodyLock(false);
      if (typeof toggle.focus === "function") toggle.focus();
    }

    function toggleMenu(e) {
      e && e.stopPropagation();
      if (mobileNav.classList.contains("active")) closeMenu();
      else openMenu();
    }

    toggle.addEventListener("click", (e) => { toggleMenu(e); });
    toggle.addEventListener("touchstart", (e) => { toggleMenu(e); }, { passive: true });

    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); toggleMenu(e); }
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!mobileNav.contains(target) && target !== toggle && mobileNav.classList.contains("active")) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Esc") { if (mobileNav.classList.contains("active")) closeMenu(); }
    });

    mobileNav.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link) setTimeout(() => closeMenu(), 60);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMobileMenu);
  else initMobileMenu();
})();