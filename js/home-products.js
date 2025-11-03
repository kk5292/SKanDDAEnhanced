// js/home-products.js
// Fixed, robust continuous-scrolling home subcategory carousel.
// - Ensures functions are defined before use (fixes "renderContinuousCarousel is not defined")
// - Tries data/products-future.json then data/products.json
// - Falls back to in-page product data (if products.js populated it) or safe placeholders
// - Continuous motion (requestAnimationFrame), dots, "View products" overlay
// - visualViewport-aware sizing for iPhone fixes
// Version: 2025-11-02 - robust/fallback fixed

(function () {
  "use strict";

  const JSON_CANDIDATES = ["data/products-future.json", "data/products.json"];
  const CONTAINER_ID = "home-products-carousel";
  const GAP = 12;
  const SPEED_PX_PER_SEC = 120; // px/sec - adjust for tempo
  const REPLICATION = 3; // how many times to replicate set for smoothness

  /* -------------------------
     Inject minimal runtime CSS (idempotent)
     ------------------------- */
  (function injectStyles() {
    if (document.querySelector("style[data-home-products]")) return;
    const css = `
[data-home-products] { display:none; }
.hp-carousel-root{width:100%;box-sizing:border-box}
.hp-track{display:flex;gap:${GAP}px;overflow-x:auto;padding:6px 4px;align-items:stretch;-webkit-overflow-scrolling:touch}
.hp-item{border-radius:8px;overflow:hidden;position:relative;box-sizing:border-box;background:linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.06));display:flex;flex-direction:column}
.hp-item img{width:100%;height:150px;object-fit:cover;display:block}
.hp-item .hp-item-label{padding:10px;text-align:center;color:#fff;font-weight:700;background:linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.08));flex:0 0 auto}
.hp-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;background:linear-gradient(0deg,rgba(0,0,0,0.55),rgba(0,0,0,0.35));opacity:0;transition:opacity 160ms ease;pointer-events:none}
.hp-overlay.visible{opacity:1}
.hp-item::before{content:"";position:absolute;inset:8px 8px 46px 8px;border-radius:6px;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.02)}
.hp-dots{display:flex;gap:8px;justify-content:center;margin-top:12px}
.hp-dot{width:10px;height:10px;border-radius:50%;border:none;background:rgba(255,255,255,0.15);cursor:pointer;transition:transform 220ms ease,background 160ms}
.hp-dot.active{background:var(--primary-color,#ff5b00);transform:scale(1.18);box-shadow:0 6px 12px rgba(0,0,0,0.28)}
.hp-track::-webkit-scrollbar{display:none}
@media (max-width:420px){.hp-item img{height:120px}}`;
    const st = document.createElement("style");
    st.setAttribute("data-home-products", "1");
    st.textContent = css;
    document.head.appendChild(st);
  })();

  /* -------------------------
     Image resolution helpers (mirror products.js)
     ------------------------- */
  function normalizeBannerPath(path) {
    if (!path) return null;
    if (/^(https?:\/\/|data:|assets\/)/i.test(path)) return path;
    return `assets/${path}`;
  }

  function getRawImageFromProduct(p) {
    if (!p) return null;
    if (p.banner && String(p.banner).trim()) return String(p.banner).trim();
    if (p.image && String(p.image).trim()) return String(p.image).trim();
    if (p.imagePath && String(p.imagePath).trim()) return String(p.imagePath).trim();
    if (Array.isArray(p.images) && p.images.length && String(p.images[0]).trim()) return String(p.images[0]).trim();
    if (p.imageFolder && Array.isArray(p.images) && p.images.length) {
      const f = String(p.imageFolder).trim().replace(/\/$/, "");
      if (f && String(p.images[0]).trim()) return f + "/" + String(p.images[0]).trim();
    }
    return null;
  }

  function resolveBannerFromProduct(p) {
    const raw = getRawImageFromProduct(p);
    if (!raw) return null;
    if (/^(https?:\/\/|\/|data:)/i.test(raw)) return raw;
    return normalizeBannerPath(raw);
  }

  function isBannerFlagged(p) {
    if (!p) return false;
    const v = p.isBanner ?? p.is_banner ?? p.isbanner;
    if (v === undefined || v === null) return false;
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      return s === "yes" || s === "true" || s === "1";
    }
    return false;
  }

  function collectSubcategoryItems(products) {
    const map = Object.create(null);
    (products || []).forEach(p => {
      const cat = p.category || "Misc";
      const sub = p.subcategory || "General";
      const key = `${cat}||${sub}`;
      (map[key] = map[key] || { category: cat, subcategory: sub, products: [] }).products.push(p);
    });

    const out = [];
    Object.keys(map).forEach(k => {
      const entry = map[k];
      const flagged = entry.products.filter(isBannerFlagged);
      if (!flagged.length) return;
      // prefer flagged product image
      let img = null;
      for (const p of flagged) { img = resolveBannerFromProduct(p); if (img) break; }
      if (!img) {
        for (const p of entry.products) { img = resolveBannerFromProduct(p); if (img) break; }
      }
      if (!img) return;
      out.push({ category: entry.category, subcategory: entry.subcategory, image: img });
    });
    return out;
  }

  /* -------------------------
     Fetch chain
     ------------------------- */
  function tryFetchChain(urls) {
    return urls.reduce((prev, u) =>
      prev.catch(() => fetch(u + "?cache=" + Date.now()).then(r => { if (!r.ok) throw new Error(r.status + " " + r.statusText); return r.json(); })),
      Promise.reject()
    );
  }

  /* -------------------------
     read products already on page (products.js) as fallback
     ------------------------- */
  function readProductsFromPage() {
    try {
      if (window.__pe_debug && typeof window.__pe_debug.flatProducts === "function") {
        const arr = window.__pe_debug.flatProducts();
        if (Array.isArray(arr) && arr.length) return arr;
      }
      if (Array.isArray(window.flatProducts) && window.flatProducts.length) return window.flatProducts;
    } catch (e) {
      console.warn("readProductsFromPage error", e);
    }
    return null;
  }

  /* -------------------------
     compute item width using visualViewport when available (fixes iPhone)
     ------------------------- */
  function computeItemWidth(trackEl) {
    const v = (window.visualViewport && typeof window.visualViewport.width === "number")
      ? window.visualViewport.width
      : (trackEl && trackEl.clientWidth) || window.innerWidth || document.documentElement.clientWidth;

    if (v <= 420) return 160;
    if (v <= 600) return 160;
    if (v <= 900) return 200;
    return 240;
  }

  /* -------------------------
     Rendering functions (defined before usage)
     ------------------------- */

  function renderContinuousCarousel(containerEl, items) {
    // items: array of {category, subcategory, image}
    containerEl.innerHTML = "";
    if (!items || !items.length) return;

    const root = document.createElement("div");
    root.className = "hp-carousel-root";
    const track = document.createElement("div");
    track.className = "hp-track";
    root.appendChild(track);
    containerEl.appendChild(root);

    // initial sizing
    let itemWidth = computeItemWidth(track);
    const imgHeight = window.visualViewport && window.visualViewport.width <= 420 ? 120 : 150;

    // Build replicated tiles
    const replication = items.length === 1 ? 6 : REPLICATION;
    for (let r = 0; r < replication; r++) {
      for (const entry of items) {
        const tile = document.createElement("div");
        tile.className = "hp-item";
        tile.style.minWidth = itemWidth + "px";

        const img = document.createElement("img");
        img.src = entry.image;
        img.alt = entry.subcategory || entry.category || "";
        img.style.height = imgHeight + "px";
        img.onerror = function () { this.onerror = null; this.src = "assets/default-banner.png"; };

        const overlay = document.createElement("div");
        overlay.className = "hp-overlay";
        overlay.textContent = "View products";

        const label = document.createElement("div");
        label.className = "hp-item-label";
        label.textContent = entry.subcategory || entry.category || "";

        tile.appendChild(img);
        tile.appendChild(overlay);
        tile.appendChild(label);

        tile.addEventListener("pointerenter", () => overlay.classList.add("visible"));
        tile.addEventListener("pointerleave", () => overlay.classList.remove("visible"));
        tile.addEventListener("focusin", () => overlay.classList.add("visible"));
        tile.addEventListener("focusout", () => overlay.classList.remove("visible"));
        tile.addEventListener("pointerdown", () => overlay.classList.add("visible"));

        tile.addEventListener("click", () => {
          const catParam = encodeURIComponent(entry.category || "");
          const subParam = encodeURIComponent(entry.subcategory || "");
          window.location.href = `products.html?category=${catParam}&subcategory=${subParam}`;
        });

        track.appendChild(tile);
      }
    }

    // Dots
    const dotsWrap = document.createElement("div");
    dotsWrap.className = "hp-dots";
    const dots = [];
    for (let i = 0; i < items.length; i++) {
      const b = document.createElement("button");
      b.className = "hp-dot";
      b.type = "button";
      b.setAttribute("aria-label", `Slide ${i+1}`);
      (function (idx) {
        b.addEventListener("click", () => {
          const advance = itemWidth + GAP;
          track.scrollTo({ left: idx * advance, behavior: "smooth" });
        });
      })(i);
      dots.push(b);
      dotsWrap.appendChild(b);
    }
    containerEl.appendChild(dotsWrap);

    // compute single set width
    function computeSingleSetWidth() {
      const children = Array.from(track.children);
      if (!children.length) return 0;
      const count = items.length;
      let total = 0;
      for (let i = 0; i < Math.min(count, children.length); i++) {
        const rect = children[i].getBoundingClientRect();
        total += rect.width;
      }
      total += GAP * Math.max(0, count - 1);
      return total;
    }

    let singleSetWidth = 0;
    function recalc() {
      itemWidth = computeItemWidth(track);
      track.querySelectorAll(".hp-item").forEach(it => it.style.minWidth = itemWidth + "px");
      setTimeout(() => { singleSetWidth = computeSingleSetWidth(); updateDots(); }, 80);
    }
    recalc();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', recalc, { passive: true });
      window.visualViewport.addEventListener('scroll', recalc, { passive: true });
    }
    window.addEventListener('resize', recalc);

    // Continuous RAF
    let rafId = null;
    let lastTs = null;
    let paused = false;
    function step(ts) {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      if (!paused) {
        track.scrollLeft += SPEED_PX_PER_SEC * dt;
        if (singleSetWidth && track.scrollLeft >= singleSetWidth) {
          track.scrollLeft = track.scrollLeft - singleSetWidth;
        }
      }
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);

    // Pause/resume handlers
    function pause() { paused = true; }
    function resume() { paused = false; lastTs = null; }

    track.addEventListener('pointerenter', pause);
    track.addEventListener('pointerleave', resume);
    track.addEventListener('pointerdown', pause, { passive: true });
    document.addEventListener('pointerup', resume);
    track.addEventListener('touchstart', pause, { passive: true });
    track.addEventListener('touchend', resume);
    track.addEventListener('focusin', pause);
    track.addEventListener('focusout', resume);

    // Dots update (throttled)
    let tmr = null;
    function updateDots() {
      const advance = (itemWidth + GAP) || 1;
      const logicalFloat = ((track.scrollLeft % (singleSetWidth || (advance * items.length))) / advance);
      let idx = Math.round(logicalFloat) % items.length;
      if (idx < 0) idx += items.length;
      for (let i = 0; i < dots.length; i++) {
        if (i === idx) dots[i].classList.add('active'); else dots[i].classList.remove('active');
      }
    }
    track.addEventListener('scroll', () => {
      if (tmr) return;
      tmr = setTimeout(() => { updateDots(); tmr = null; }, 80);
      if (singleSetWidth) {
        if (track.scrollLeft >= singleSetWidth) track.scrollLeft = track.scrollLeft - singleSetWidth;
        if (track.scrollLeft <= 0) track.scrollLeft = track.scrollLeft + singleSetWidth;
      }
    });
    setTimeout(updateDots, 150);

    // expose urls for debugging
    try { window.__home_banner_urls = items.map(x => ({ category: x.category, subcategory: x.subcategory, image: x.image })); } catch (e) {}
  }

  /* -------------------------
     Render placeholders (safe content)
     ------------------------- */
  function renderPlaceholders(container) {
    const placeholders = [
      { category: 'Essentials', subcategory: 'Snacks', image: 'assets/default-banner.png' },
      { category: 'Grocery', subcategory: 'Rice & Grains', image: 'assets/default-banner.png' },
      { category: 'Sweets', subcategory: 'Mithai', image: 'assets/default-banner.png' }
    ];
    renderContinuousCarousel(container, placeholders);
  }

  /* -------------------------
     Init: fetch -> fallback -> render
     ------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
      console.warn("home-products: container not found (#" + CONTAINER_ID + ")");
      return;
    }

    tryFetchChain(JSON_CANDIDATES)
      .then(data => {
        const flat = Array.isArray(data) ? data : (data.products || []);
        const items = collectSubcategoryItems(flat);
        if (items && items.length) {
          renderContinuousCarousel(container, items);
          console.info("home-products: rendered from fetched JSON; items:", items.length);
        } else {
          console.warn("home-products: fetched JSON but produced no banner items; attempting in-page fallback");
          const fallback = readProductsFromPage();
          if (fallback && fallback.length) {
            const fbItems = collectSubcategoryItems(fallback);
            if (fbItems && fbItems.length) {
              renderContinuousCarousel(container, fbItems);
              console.info("home-products: rendered from in-page products fallback; items:", fbItems.length);
              return;
            }
          }
          console.warn("home-products: no items from fetch or in-page; rendering placeholders");
          renderPlaceholders(container);
        }
      })
      .catch(fetchErr => {
        console.warn("home-products: fetch failed, attempting fallback:", fetchErr);
        const fallback = readProductsFromPage();
        if (fallback && fallback.length) {
          const fbItems = collectSubcategoryItems(fallback);
          if (fbItems && fbItems.length) {
            renderContinuousCarousel(container, fbItems);
            console.info("home-products: rendered from in-page products fallback; items:", fbItems.length);
            return;
          }
        }
        console.warn("home-products: no product data available, rendering placeholders");
        renderPlaceholders(container);
      });
  });

})();