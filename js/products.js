/* products-explorer.js (Full replaceable JavaScript)
   This is your full file with the two final requested fixes integrated:
   1) Carousel prev/next appearance handled in CSS (dark rounded buttons). (CSS file already provided separately)
   2) Carousel selection logic updated so when a product has multiple variants, the carousel prefers to display a variant marked NEW (isNew/is_new). If none are NEW it prefers an available variant, then the first variant. Badges on carousel items reflect aggregate state across variants (any variant NEW/trending/discount/availability).
   3) Auto-apply URL filters: products page will now read category and subcategory query parameters on load and display filtered results automatically.
   No other behavior changes were made; all existing functionality is preserved.
*/

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    // DOM references
    const catList = document.getElementById("category-list");
    const productPanel = document.getElementById("product-panel");
    const categoryPanel = document.getElementById("category-panel");
    const productContainer = document.getElementById("product-container");
    const breadcrumb = document.getElementById("breadcrumb");

    const filterTagInput = document.getElementById("filter-tag");
    const filterPriceInput = document.getElementById("filter-price");
    const applyFiltersBtn = document.getElementById("apply-filters");
    const resetFiltersBtn = document.getElementById("reset-filters");
    const sortSelect = document.getElementById("sort-select");
    const filtersContent = document.getElementById("filters-content");

    // State
    let grouped = {};
    let flatProducts = [];
    let currentState = null;
    let activeFilters = { tag: "", priceMax: null, sort: "" };
    let subcategorySelections = new Set();
    let groupedByNameCache = {};

    /* --------------------
       Utilities
    -------------------- */
    function cssEscape(str) {
      return String(str).replace(/([ #;?%&,.+*~\':"<>^${}()|[\]\/\\])/g, "\\$1");
    }
    function calculateDiscountedPrice(price, discount) {
      const p = Number(price || 0), d = Number(discount || 0);
      return d > 0 ? p - (p * d) / 100 : p;
    }
    function calculateOriginalPrice(price) { return Number(price || 0); }
    function bannerFileName(name) {
      if (!name) return "default-banner.png";
      const s = String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `${s}-banner.png`;
    }
    function normalizeBannerPath(path) {
      if (!path) return null;
      if (/^(https?:\/\/|data:|assets\/)/i.test(path)) return path;
      return `assets/${path}`;
    }
    function findBannerImage(category, subcategory, subsubcategory) {
      if (!Array.isArray(flatProducts) || !flatProducts.length) return null;
      if (subsubcategory) {
        const b = flatProducts.find(p => (p.isBanner||p.is_banner) && p.subsubcategory === subsubcategory && p.subcategory === subcategory && p.category === category && (p.image||p.imagePath||p.banner));
        if (b) return normalizeBannerPath(b.image||b.imagePath||b.banner);
      }
      if (subcategory) {
        const b = flatProducts.find(p => (p.isBanner||p.is_banner) && p.subcategory === subcategory && p.category === category && (p.image||p.imagePath||p.banner));
        if (b) return normalizeBannerPath(b.image||b.imagePath||b.banner);
      }
      if (category) {
        const b = flatProducts.find(p => (p.isBanner||p.is_banner) && p.category === category && (p.image||p.imagePath||p.banner));
        if (b) return normalizeBannerPath(b.image||b.imagePath||b.banner);
      }
      return null;
    }

    /* --------------------
       Cart helpers
    -------------------- */
    function updateCartCountDisplay() {
      try {
        const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalQty = cartItems.reduce((a,b) => a + (b.quantity || 0), 0);
        document.querySelectorAll("#cart-count-desktop,#cart-count-mobile,#cart-count-mobile-menu").forEach(el => { try{ el.textContent = totalQty; }catch(e){} });
      } catch(e){}
    }
    function addToCart(product, qty) {
      try {
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const key = product.productCode || JSON.stringify({name:product.name,weight:product.weight,price:product.price});
        let existing = cart.find(p => (p.productCode && p.productCode === key) || JSON.stringify({name:p.name,weight:p.weight,price:p.price}) === key);
        if (!existing) existing = cart.find(p => p.name === product.name && p.weight === product.weight);
        if (existing) existing.quantity = (existing.quantity || 0) + (qty || 1);
        else cart.push({ ...product, quantity: qty || 1 });
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCountDisplay();
      } catch (err) { console.error("addToCart error", err); }
    }
    function createAddButton(product, qtyDisplay) {
      const btn = document.createElement("button");
      btn.className = "add-cart"; btn.type = "button"; btn.textContent = "Add to Cart";
      btn.addEventListener("click", e => { e.stopPropagation(); addToCart(product, Number(qtyDisplay.textContent)||1); });
      return btn;
    }
    function createComingSpan() {
      const s = document.createElement("span"); s.className = "coming-soon-btn"; s.textContent = "Coming Soon"; return s;
    }

    /* --------------------
       Subcategory filter helpers
    -------------------- */
    function rebuildSubcategorySelectionsFromUI() {
      subcategorySelections.clear();
      const container = document.getElementById("filter-subcategories");
      if (!container) return;
      container.querySelectorAll('input[data-sub]:not([data-subsub])').forEach(b => { const key = `${b.dataset.cat}||${b.dataset.sub}`; if (b.checked) subcategorySelections.add(key); });
      container.querySelectorAll('input[data-subsub]').forEach(b => { const key = `${b.dataset.cat}||${b.dataset.sub}||${b.dataset.subsub}`; if (b.checked) subcategorySelections.add(key); });
    }
    function selectAllSubcategories() { const container = document.getElementById("filter-subcategories"); if (!container) return; container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true); rebuildSubcategorySelectionsFromUI(); }
    function preselectSubcategoriesForCategory(categoryName) {
      const container = document.getElementById("filter-subcategories");
      if (!container) return;
      container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      container.querySelectorAll(`input[data-cat="${cssEscape(categoryName)}"]`).forEach(cb => cb.checked = true);
      rebuildSubcategorySelectionsFromUI();
      syncDropdownFromUI();
    }
    function matchesSubcategoryFilter(p) {
      if (!subcategorySelections || subcategorySelections.size === 0) return true;
      const keySub = `${p.category}||${p.subcategory}`;
      const keySubSub = `${p.category}||${p.subcategory}||${p.subsubcategory || ""}`;
      return subcategorySelections.has(keySubSub) || subcategorySelections.has(keySub);
    }
    function syncDropdownFromUI() {
      const subcategoryDropdown = document.getElementById("subcategory-dropdown");
      if (!subcategoryDropdown) return;
      const container = document.getElementById("filter-subcategories");
      if (!container) { subcategoryDropdown.value = "all"; return; }
      const parentBoxes = container.querySelectorAll('input[data-sub]:not([data-subsub])');
      const checkedParents = Array.from(parentBoxes).filter(b => b.checked);
      if (checkedParents.length !== 1) { subcategoryDropdown.value = "all"; return; }
      const only = checkedParents[0];
      subcategoryDropdown.value = `${only.dataset.cat}||${only.dataset.sub}`;
    }
    function determineProductsSource(productsParam, categoryParam) {
      const selectedCats = new Set(Array.from(subcategorySelections || []).map(k => k.split('||')[0]));
      if (selectedCats.size === 0) return productsParam && productsParam.length ? productsParam : flatProducts;
      if (categoryParam && selectedCats.size === 1 && selectedCats.has(categoryParam)) return productsParam;
      return flatProducts;
    }

    /* --------------------
       Grouped-by-name cache
    -------------------- */
    function buildGroupedByName(products) {
      groupedByNameCache = {};
      (products || []).forEach(p => { const key = (p.name || "").trim().toLowerCase(); if (!groupedByNameCache[key]) groupedByNameCache[key] = []; groupedByNameCache[key].push(p); });
    }

    /* --------------------
       Fetch data
    -------------------- */
    const tryFetch = (url) => fetch(url + "?cache=" + Date.now()).then(res => { if (!res.ok) throw new Error("no file"); return res.json(); });

    Promise.resolve()
      .then(() => tryFetch("data/products-future.json"))
      .catch(() => tryFetch("data/products.json"))
      .then(data => {
        flatProducts = Array.isArray(data) ? data : data.products || [];
        grouped = groupProducts(flatProducts);
        buildGroupedByName(flatProducts);
        renderCategories(grouped);
        buildSubcategoryFilterUI();
        renderHeroOverlayCarousels(); // prepare overlay
        showInitialHero();
        updateCartCountDisplay();

        // --- AUTO-APPLY URL FILTERS (category & subcategory) ---
        // If the products page is loaded with ?category=... or &subcategory=..., apply the filters automatically.
        (function applyUrlFiltersOnLoad() {
          try {
            const params = new URLSearchParams(window.location.search);
            const cat = params.get("category");
            const sub = params.get("subcategory");
            if (!cat && !sub) return;
            const category = cat ? decodeURIComponent(cat) : null;
            const subcategory = sub ? decodeURIComponent(sub) : null;

            let productsToRender = [];
            if (category && subcategory) {
              productsToRender = flatProducts.filter(p => p.category === category && p.subcategory === subcategory);
            } else if (category) {
              productsToRender = flatProducts.filter(p => p.category === category);
            }

            if (productsToRender && productsToRender.length) {
              // preselect subcategory filters for UI
              if (category) preselectSubcategoriesForCategory(category);
              // set current state and render with existing filters logic
              currentState = { category, subcategory, products: productsToRender };
              renderProductsWithFilters(productsToRender, category, subcategory, null);
              // bring product panel into view for better UX
              const productPanelEl = document.getElementById("product-panel");
              if (productPanelEl && typeof productPanelEl.scrollIntoView === "function") {
                productPanelEl.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }
          } catch (e) {
            console.warn("applyUrlFiltersOnLoad error", e);
          }
        })();
        // --- end auto-apply snippet ---

      })
      .catch(err => {
        console.error("Products fetch failed:", err);
        if (productContainer) productContainer.innerHTML = "<p style='color:#fff'>Error loading products</p>";
      });

    function groupProducts(products) {
      const g = {};
      (products || []).forEach(p => {
        const cat = p.category || "Misc";
        const sub = p.subcategory || "General";
        const subsub = p.subsubcategory || "__root__";
        if (!g[cat]) g[cat] = {};
        if (!g[cat][sub]) g[cat][sub] = {};
        if (!g[cat][sub][subsub]) g[cat][sub][subsub] = [];
        g[cat][sub][subsub].push(p);
      });
      return g;
    }

    /* --------------------
       Carousel helpers & creation
       - key visual changes here:
         * carousel controls row forced to no-wrap and centered
         * item is position:relative so badges can be absolute
         * smaller product title font
         * badges added to carousel items (discount/new/trend/avail)
       - selection logic updated to prefer NEW variant, then available, then first
    -------------------- */
    function scrollToIndex(track, itemIndex, itemWidth) {
      const left = itemIndex * (itemWidth + 10);
      try { track.scrollTo({ left, behavior: "smooth" }); } catch(e) { track.scrollLeft = left; }
    }

    function createCarouselBlock(title, items, config = {}) {
      const autoplayMs = config.autoplayMs || 3000;
      const itemWidth = config.itemWidth || 180;
      const wrap = document.createElement("div");
      wrap.className = "hero-carousel-block";
      wrap.setAttribute("data-title", title);

      const heading = document.createElement("div");
      heading.className = "carousel-heading";
      heading.innerHTML = `<strong>${title}</strong> <span class="motion-icon" aria-hidden="true">›</span>`;
      wrap.appendChild(heading);

      // controls row (center aligned, no-wrap)
      const controlsRow = document.createElement("div");
      controlsRow.className = "carousel-controls-row";
      // ensure non-wrapping and centered via inline fallback for older CSS situations
      controlsRow.style.display = "flex";
      controlsRow.style.alignItems = "center";
      controlsRow.style.justifyContent = "center";
      controlsRow.style.gap = "8px";
      controlsRow.style.flexWrap = "nowrap";

      const prevBtn = document.createElement("button");
      prevBtn.className = "carousel-prev";
      prevBtn.type = "button";
      prevBtn.setAttribute("aria-label", `${title} previous`);
      prevBtn.innerHTML = "‹";
      prevBtn.style.flex = "0 0 auto";

      const nextBtn = document.createElement("button");
      nextBtn.className = "carousel-next";
      nextBtn.type = "button";
      nextBtn.setAttribute("aria-label", `${title} next`);
      nextBtn.innerHTML = "›";
      nextBtn.style.flex = "0 0 auto";

      const dots = document.createElement("div");
      dots.className = "carousel-dots";
      dots.style.display = "flex";
      dots.style.gap = "6px";
      dots.style.justifyContent = "center";
      dots.style.flex = "1 1 auto";
      dots.style.minWidth = "80px";

      const track = document.createElement("div");
      track.className = "carousel-track";
      track.role = "list";
      track.dataset.autoplayMs = String(autoplayMs);
      track.style.overflowX = "auto";
      track.style.whiteSpace = "nowrap";
      track.style.scrollBehavior = "smooth";

      // Build items
      items.forEach((p) => {
        const key = (p.name || "").trim().toLowerCase();
        const variants = groupedByNameCache[key] || [p];

        // Choose displayVariant: prefer NEW variant, then available, then first
        let displayVariant = variants.find(v => (v.isNew || v.is_new));
        if (!displayVariant) displayVariant = variants.find(v => Number(v.available) > 0);
        if (!displayVariant) displayVariant = variants[0];

        // aggregate badge state across variants
        const anyNew = variants.some(v => v.isNew || v.is_new);
        const anyTrend = variants.some(v => v.isTrending || v.is_trending);
        const anyDiscount = variants.some(v => Number(v.discount || v.dis_count || 0) > 0);
        const anyAvail = variants.some(v => Number(v.available) > 0);

        const item = document.createElement("div");
        item.className = "carousel-item";
        item.role = "listitem";
        item.style.display = "inline-block";
        item.style.verticalAlign = "top";
        item.style.width = `${itemWidth}px`;
        item.style.marginRight = "10px";
        item.style.boxSizing = "border-box";
        item.style.cursor = "pointer";
        item.style.position = "relative";

        // Badges (aggregate)
        const discVal = Number(displayVariant.discount || displayVariant.dis_count || 0);
        const discountBadge = document.createElement("div");
        discountBadge.className = "discount-label price-badge";
        discountBadge.style.display = anyDiscount ? "block" : "none";
        if (anyDiscount) {
          const maxDisc = Math.max(...variants.map(v => Number(v.discount || v.dis_count || 0)));
          discountBadge.textContent = maxDisc > 1 ? maxDisc + "% OFF" : "Offer";
        }

        const newBadge = document.createElement("div");
        newBadge.className = "discount-label new-badge";
        newBadge.style.display = anyNew ? "block" : "none";
        newBadge.textContent = "NEW";

        const trendBadge = document.createElement("div");
        trendBadge.className = "discount-label trending-badge";
        trendBadge.style.display = anyTrend ? "block" : "none";
        trendBadge.textContent = "TREND";

        const availBadge = document.createElement("div");
        availBadge.className = "avail-badge " + (anyAvail ? "in" : "out");
        availBadge.textContent = anyAvail ? "In Stock" : "Coming Soon";

        // image
        const img = document.createElement("img");
        img.src = (displayVariant.images && displayVariant.images.length) ? ((displayVariant.imageFolder ? displayVariant.imageFolder + "/" : "assets/") + displayVariant.images[0]) : ("assets/" + (displayVariant.image || "default-banner.png"));
        img.alt = displayVariant.name || "";
        img.style.width = "100%";
        img.style.height = "120px";
        img.style.objectFit = "contain";
        img.onerror = function(){ this.onerror=null; this.src="assets/default-banner.png"; };

        // title (reduced font)
        const nameEl = document.createElement("div");
        nameEl.className = "carousel-item-name";
        nameEl.textContent = displayVariant.name || "";
        nameEl.style.fontSize = "0.88em";
        nameEl.style.margin = "6px 0";
        nameEl.style.color = "#fff";
        nameEl.style.overflow = "hidden";
        nameEl.style.textOverflow = "ellipsis";
        nameEl.style.whiteSpace = "nowrap";

        // price with strike-through orig
        const priceEl = document.createElement("div");
        priceEl.className = "carousel-item-price";
        const orig = calculateOriginalPrice(displayVariant.price);
        const d = Number(displayVariant.discount || displayVariant.dis_count || 0);
        if (d > 0) {
          const discounted = calculateDiscountedPrice(orig, d);
          priceEl.innerHTML = `<span class="orig">AED ${orig.toFixed(1)}</span> <strong style="margin-left:6px;color:var(--primary-color)">AED ${discounted.toFixed(1)}</strong>`;
        } else {
          priceEl.textContent = `AED ${Number(displayVariant.price || 0).toFixed(1)}`;
        }
        priceEl.style.color = "#fff";

        item.appendChild(discountBadge);
        item.appendChild(newBadge);
        item.appendChild(trendBadge);
        item.appendChild(availBadge);
        item.appendChild(img);
        item.appendChild(nameEl);
        item.appendChild(priceEl);

        item.addEventListener("click", (e) => {
          e.stopPropagation();
          renderProductDetail(variants, displayVariant, { category: displayVariant.category || null, subcategory: displayVariant.subcategory || null, subsubcategory: displayVariant.subsubcategory || null, products: variants });
          if (window.innerWidth <= 768 && categoryPanel) categoryPanel.classList.remove("panel-active");
        });

        track.appendChild(item);
      });

      // create dots for track length
      const itemCount = items.length;
      const dotButtons = [];
      for (let i = 0; i < itemCount; i++) {
        const db = document.createElement("button");
        db.className = "carousel-dot";
        db.type = "button";
        db.dataset.index = String(i);
        db.setAttribute("aria-label", `${title} slide ${i+1}`);
        db.style.width = "10px";
        db.style.height = "10px";
        db.style.borderRadius = "50%";
        db.style.border = "none";
        db.style.background = "rgba(255,255,255,0.15)";
        db.style.cursor = "pointer";
        db.addEventListener("click", (e) => {
          e.stopPropagation();
          const idx = Number(db.dataset.index);
          scrollToIndex(track, idx, itemWidth);
          highlightDot(idx);
          stopAutoplay();
          startAutoplayWithDelay(autoplayMs);
        });
        dotButtons.push(db);
        dots.appendChild(db);
      }
      function highlightDot(idx) {
        dotButtons.forEach((b,i) => { b.style.background = (i===idx) ? "var(--primary-color)" : "rgba(255,255,255,0.15)"; });
      }
      highlightDot(0);

      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const curIndex = Math.round(track.scrollLeft / (itemWidth + 10));
        const target = Math.max(0, curIndex - 1);
        scrollToIndex(track, target, itemWidth);
        highlightDot(target);
        stopAutoplay();
        startAutoplayWithDelay(autoplayMs);
      });
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const curIndex = Math.round(track.scrollLeft / (itemWidth + 10));
        const target = Math.min(itemCount - 1, curIndex + 1);
        scrollToIndex(track, target, itemWidth);
        highlightDot(target);
        stopAutoplay();
        startAutoplayWithDelay(autoplayMs);
      });

      // update dots while scrolling (throttled)
      let scrollThrottleTimer = null;
      track.addEventListener("scroll", () => {
        if (scrollThrottleTimer) return;
        scrollThrottleTimer = setTimeout(() => {
          const idx = Math.round(track.scrollLeft / (itemWidth + 10));
          highlightDot(Math.min(itemCount - 1, Math.max(0, idx)));
          scrollThrottleTimer = null;
        }, 80);
      });

      // keyboard support
      track.tabIndex = 0;
      track.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { prevBtn.click(); e.preventDefault(); }
        else if (e.key === "ArrowRight") { nextBtn.click(); e.preventDefault(); }
      });

      // autoplay
      let autoplayInterval = null;
      function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        if (!autoplayMs || autoplayMs <= 0) return;
        autoplayInterval = setInterval(() => {
          const curIndex = Math.round(track.scrollLeft / (itemWidth + 10));
          let next = curIndex + 1;
          if (next >= itemCount) next = 0;
          scrollToIndex(track, next, itemWidth);
          highlightDot(next);
        }, autoplayMs);
        track._autoplay = autoplayInterval;
      }
      function stopAutoplay() { if (autoplayInterval) { clearInterval(autoplayInterval); autoplayInterval = null; track._autoplay = null; } }
      function startAutoplayWithDelay(delayMs) { stopAutoplay(); if (!delayMs || delayMs <= 0) { startAutoplay(); return; } setTimeout(()=>startAutoplay(), delayMs); }

      track.addEventListener("mouseenter", () => stopAutoplay());
      track.addEventListener("mouseleave", () => startAutoplay());
      track.addEventListener("focusin", () => stopAutoplay());
      track.addEventListener("focusout", () => startAutoplay());

      // assemble controls row: prev - dots - next (centered, no-wrap)
      controlsRow.appendChild(prevBtn);
      controlsRow.appendChild(dots);
      controlsRow.appendChild(nextBtn);

      wrap.appendChild(controlsRow);
      wrap.appendChild(track);

      // start autoplay
      startAutoplay();

      // expose helpers on wrap if needed
      wrap._track = track;
      wrap._start = startAutoplay;
      wrap._stop = stopAutoplay;
      wrap._dots = dotButtons;

      return wrap;
    }

    /* --------------------
       Render hero overlay carousels and add separator between blocks
    -------------------- */
    function renderHeroOverlayCarousels() {
      const existing = document.getElementById("hero-carousel-overlay");
      if (existing) existing.remove();

      const newMap = {};
      flatProducts.forEach(p => { if (p.isNew || p.is_new) { const k=(p.name||"").trim().toLowerCase(); if(!newMap[k]) newMap[k] = p; }});
      const newList = Object.values(newMap);

      const trendMap = {};
      flatProducts.forEach(p => { if (p.isTrending || p.is_trending) { const k=(p.name||"").trim().toLowerCase(); if(!trendMap[k]) trendMap[k] = p; }});
      const trendList = Object.values(trendMap);

      if (!newList.length && !trendList.length) return null;

      const overlay = document.createElement("div");
      overlay.id = "hero-carousel-overlay";
      overlay.className = "hero-carousel-overlay";

      if (newList.length) {
        const newBlock = createCarouselBlock("New Products", newList, { autoplayMs: 2800, itemWidth: 180 });
        overlay.appendChild(newBlock);
      }
      if (newList.length && trendList.length) {
        // separator
        const sep = document.createElement("div");
        sep.className = "carousel-separator";
        sep.style.height = "1px";
        sep.style.background = "rgba(255,255,255,0.06)";
        sep.style.margin = "6px 0";
        overlay.appendChild(sep);
      }
      if (trendList.length) {
        const trendBlock = createCarouselBlock("Trending Products", trendList, { autoplayMs: 3600, itemWidth: 180 });
        overlay.appendChild(trendBlock);
      }

      return overlay;
    }

    /* --------------------
       showInitialHero (neutral hero, removed center title)
    -------------------- */
    function showInitialHero() {
      if (!productContainer) return;
      productContainer.innerHTML = "";

      const heroWrapper = document.createElement("div");
      heroWrapper.className = "hero-wrapper";
      heroWrapper.style.position = "relative";
      heroWrapper.style.width = "100%";
      heroWrapper.style.minHeight = "360px";
      heroWrapper.style.background = "linear-gradient(180deg, rgba(0,0,0,0.75), rgba(0,0,0,0.6))";
      heroWrapper.style.display = "flex";
      heroWrapper.style.alignItems = "center";
      heroWrapper.style.justifyContent = "center";
      heroWrapper.style.boxSizing = "border-box";
      heroWrapper.style.borderRadius = "10px";

      const overlay = renderHeroOverlayCarousels();
      if (overlay) {
        overlay.style.position = "absolute";
        overlay.style.left = "50%";
        overlay.style.transform = "translateX(-50%)";
        overlay.style.top = "8%";
        overlay.style.zIndex = "40";
        overlay.style.width = "88%";
        overlay.style.maxWidth = "1100px";
        overlay.style.pointerEvents = "auto";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.gap = "12px";
        heroWrapper.appendChild(overlay);
      }

      if (breadcrumb) productContainer.appendChild(breadcrumb);
      productContainer.appendChild(heroWrapper);

      selectAllSubcategories();
      if (breadcrumb) { breadcrumb.innerHTML = ""; breadcrumb.appendChild(document.createTextNode("Home")); }
    }

    /* --------------------
       Category panel - revert to text listing with subsubcategories
    -------------------- */
    function renderCategories(g) {
      if (!catList) return;
      catList.innerHTML = "";

      Object.keys(g).forEach(cat => {
        const li = document.createElement("li");
        li.className = "category-item";

        const header = document.createElement("div");
        header.className = "category-header";
        header.innerHTML = `<span class="toggle">+</span><span class="name">${cat}</span>`;

        const subList = document.createElement("ul");
        subList.className = "subcategory-list";
        subList.style.display = "none";

        Object.keys(g[cat]).forEach(sub => {
          const subData = g[cat][sub];
          const hasSubsubs = Object.keys(subData).some(k => k !== "__root__");
          const subRoot = subData["__root__"] || [];
          if (sub === "General" && subRoot.length === 0 && !hasSubsubs) return;

          const subItem = document.createElement("li");
          subItem.className = "subcategory-item";

          const toggleSub = document.createElement("span");
          toggleSub.className = "toggle-sub";
          toggleSub.textContent = hasSubsubs ? "+" : "";

          const nameSpan = document.createElement("span");
          nameSpan.className = "subcategory-name";
          nameSpan.textContent = sub;

          const subSubList = document.createElement("ul");
          subSubList.className = "subsubcategory-list";
          subSubList.style.display = "none";

          Object.keys(subData).forEach(subsub => {
            if (subsub === "__root__") return;
            const subsubItem = document.createElement("li");
            subsubItem.className = "subsubcategory-item";
            subsubItem.textContent = subsub;
            subsubItem.addEventListener("click", (e) => {
              e.stopPropagation();
              const products = g[cat][sub][subsub] || [];
              currentState = { category: cat, subcategory: sub, subsubcategory: subsub, products };
              preselectSubcategoriesForCategory(cat);
              renderProductsWithFilters(products, cat, sub, subsub);
              if (window.innerWidth <= 768 && categoryPanel) categoryPanel.classList.remove("panel-active");
            });
            subSubList.appendChild(subsubItem);
          });

          nameSpan.addEventListener("click", (e) => {
            e.stopPropagation();
            if (hasSubsubs) {
              const open = subSubList.style.display === "block";
              subSubList.style.display = open ? "none" : "block";
              toggleSub.textContent = open ? "+" : "–";
            } else {
              const products = g[cat][sub]["__root__"] || [];
              currentState = { category: cat, subcategory: sub, subsubcategory: null, products };
              preselectSubcategoriesForCategory(cat);
              renderProductsWithFilters(products, cat, sub, null);
              if (window.innerWidth <= 768 && categoryPanel) categoryPanel.classList.remove("panel-active");
            }
          });

          subItem.appendChild(toggleSub);
          subItem.appendChild(nameSpan);
          subItem.appendChild(subSubList);
          subList.appendChild(subItem);
        });

        header.addEventListener("click", (e) => {
          e.stopPropagation();
          const open = subList.style.display === "block";
          subList.style.display = open ? "none" : "block";
          header.querySelector(".toggle").textContent = open ? "+" : "–";
        });

        li.appendChild(header);
        li.appendChild(subList);
        catList.appendChild(li);
      });
    }

    /* --------------------
       Filters UI builder (More filters)
    -------------------- */
    function buildSubcategoryFilterUI() {
      if (!filtersContent) return;
      const existing = document.getElementById("filter-subcategories");
      if (existing) existing.remove();
      const existingBtn = document.getElementById("more-filters-toggle");
      if (existingBtn) existingBtn.remove();

      const moreBtn = document.createElement("button");
      moreBtn.id = "more-filters-toggle";
      moreBtn.className = "small-btn outline";
      moreBtn.type = "button";
      moreBtn.textContent = "More filters";
      moreBtn.style.marginTop = "6px";

      const container = document.createElement("div");
      container.id = "filter-subcategories";
      container.style.margin = "8px 0";
      container.style.display = "none";

      Object.keys(grouped).forEach(cat => {
        const catWrap = document.createElement("div");
        catWrap.style.marginBottom = "6px";
        const catTitle = document.createElement("div");
        catTitle.textContent = cat;
        catTitle.style.fontSize = "0.95em";
        catTitle.style.fontWeight = "600";
        catTitle.style.color = "var(--dark-text-color)";
        catWrap.appendChild(catTitle);

        Object.keys(grouped[cat]).forEach(sub => {
          const subRow = document.createElement("div");
          subRow.style.display = "flex";
          subRow.style.flexDirection = "column";
          subRow.style.marginLeft = "8px";
          subRow.style.marginTop = "4px";

          const label = document.createElement("label");
          label.style.fontWeight = "500";
          label.style.cursor = "pointer";
          label.style.color = "var(--dark-text-color)";
          label.style.display = "flex";
          label.style.alignItems = "center";
          label.style.gap = "8px";

          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.dataset.cat = cat;
          cb.dataset.sub = sub;
          cb.id = `chk|${cat}|${sub}`;
          cb.checked = true;
          cb.addEventListener("change", () => {
            const subsubboxes = container.querySelectorAll(`input[data-cat="${cssEscape(cat)}"][data-sub="${cssEscape(sub)}"][data-subsub]`);
            subsubboxes.forEach(ss => ss.checked = cb.checked);
            rebuildSubcategorySelectionsFromUI();
            syncDropdownFromUI();
            applyFiltersImmediate();
          });
          const span = document.createElement("span");
          span.textContent = sub;

          label.appendChild(cb);
          label.appendChild(span);
          subRow.appendChild(label);

          const subsubs = Object.keys(grouped[cat][sub]).filter(s => s !== "__root__");
          if (subsubs.length) {
            const subsubList = document.createElement("div");
            subsubList.style.marginLeft = "18px";
            subsubList.style.marginTop = "4px";
            subsubs.forEach(ss => {
              const lab = document.createElement("label");
              lab.style.cursor = "pointer";
              lab.style.display = "flex";
              lab.style.alignItems = "center";
              lab.style.gap = "8px";
              lab.style.color = "var(--dark-text-color)";

              const cb2 = document.createElement("input");
              cb2.type = "checkbox";
              cb2.dataset.cat = cat;
              cb2.dataset.sub = sub;
              cb2.dataset.subsub = ss;
              cb2.id = `chk|${cat}|${sub}|${ss}`;
              cb2.checked = true;
              cb2.addEventListener("change", () => {
                const parent = container.querySelector(`input#chk\\|${cssEscape(cat)}\\|${cssEscape(sub)}`);
                const siblings = container.querySelectorAll(`input[data-cat="${cssEscape(cat)}"][data-sub="${cssEscape(sub)}"][data-subsub]`);
                const allChecked = Array.from(siblings).every(s => s.checked);
                if (parent) parent.checked = allChecked;
                rebuildSubcategorySelectionsFromUI();
                syncDropdownFromUI();
                applyFiltersImmediate();
              });

              const sp = document.createElement("span");
              sp.textContent = ss;
              lab.appendChild(cb2);
              lab.appendChild(sp);
              subsubList.appendChild(lab);
            });
            subRow.appendChild(subsubList);
          }

          catWrap.appendChild(subRow);
        });

        container.appendChild(catWrap);
      });

      const applyBlock = filtersContent.querySelector('.filter-block:last-child');
      if (applyBlock) {
        filtersContent.insertBefore(moreBtn, applyBlock);
        filtersContent.insertBefore(container, applyBlock);
      } else {
        filtersContent.appendChild(moreBtn);
        filtersContent.appendChild(container);
      }

      moreBtn.addEventListener("click", e => {
        e.stopPropagation();
        const open = container.style.display === "block";
        container.style.display = open ? "none" : "block";
        moreBtn.textContent = open ? "More filters" : "Hide filters";
      });

      selectAllSubcategories();
      rebuildSubcategorySelectionsFromUI();
      syncDropdownFromUI();
    }

    /* --------------------
       Apply/Reset wiring
    -------------------- */
    function applyFiltersImmediate() {
      activeFilters.tag = (filterTagInput && filterTagInput.value || "").trim().toLowerCase();
      activeFilters.priceMax = (filterPriceInput && filterPriceInput.value) ? Number(filterPriceInput.value) : null;
      activeFilters.sort = (sortSelect && sortSelect.value) ? sortSelect.value : "";
      rebuildSubcategorySelectionsFromUI();
      if (currentState && currentState.products) {
        const src = determineProductsSource(currentState.products, currentState.category);
        renderProductsWithFilters(src, currentState.category, currentState.subcategory, currentState.subsubcategory);
      } else {
        renderProductsWithFilters(flatProducts, null, null, null);
      }
    }
    filterTagInput && filterTagInput.addEventListener("input", applyFiltersImmediate);
    filterTagInput && filterTagInput.addEventListener("blur", applyFiltersImmediate);
    filterPriceInput && filterPriceInput.addEventListener("input", applyFiltersImmediate);
    filterPriceInput && filterPriceInput.addEventListener("blur", applyFiltersImmediate);
    sortSelect && sortSelect.addEventListener("change", applyFiltersImmediate);

    applyFiltersBtn && applyFiltersBtn.addEventListener("click", () => {
      applyFiltersImmediate();
      if (window.innerWidth <= 768 && categoryPanel) categoryPanel.classList.remove("panel-active");
    });
    resetFiltersBtn && resetFiltersBtn.addEventListener("click", () => {
      if (filterTagInput) filterTagInput.value = "";
      if (filterPriceInput) filterPriceInput.value = "";
      if (sortSelect) sortSelect.value = "";
      activeFilters = { tag:"", priceMax:null, sort:"" };
      selectAllSubcategories();
      rebuildSubcategorySelectionsFromUI();
      syncDropdownFromUI();
      if (currentState && currentState.products) {
        const src = determineProductsSource(currentState.products, currentState.category);
        renderProductsWithFilters(src, currentState.category, currentState.subcategory, currentState.subsubcategory);
      } else {
        showInitialHero();
      }
      if (window.innerWidth <= 768 && categoryPanel) categoryPanel.classList.remove("panel-active");
    });

    /* --------------------
       Filtering & rendering pipeline
    -------------------- */
    function renderProductsWithFilters(products, category, subcategory, subsubcategory) {
      const src = determineProductsSource(products, category);
      let list = Array.isArray(src) ? src.slice() : [];
      list = list.filter(p => matchesSubcategoryFilter(p));
      const tag = activeFilters.tag || "";
      const priceMax = activeFilters.priceMax;
      if (tag) list = list.filter(p => { if (p.isBanner || p.is_banner) return false; const name=(p.name||"").toLowerCase(); return name.indexOf(tag)!==-1; });
      if (priceMax != null && !isNaN(priceMax)) list = list.filter(p => Number(p.price||0) <= priceMax);

      if (activeFilters.sort === "price-asc") list.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
      else if (activeFilters.sort === "price-desc") list.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
      else if (activeFilters.sort === "new") list.sort((a,b)=> (b.isNew||b.is_new?1:0)-(a.isNew||a.is_new?1:0));
      else if (activeFilters.sort === "trending") list.sort((a,b)=> (b.isTrending||b.is_trending?1:0)-(a.isTrending||a.is_trending?1:0));

      // remove overlay on non-home
      const overlay = document.getElementById("hero-carousel-overlay");
      if (overlay && productContainer.contains(overlay)) overlay.remove();

      renderProducts(list, category, subcategory, subsubcategory);
    }

    function buildBreadcrumbDOM(cat, sub, subsub) {
      if (!breadcrumb) return;
      breadcrumb.innerHTML = "";
      const parts = [];
      parts.push({ label: "Home", type: "home" });
      if (cat) parts.push({ label: cat, type: "category", cat });
      if (sub) parts.push({ label: sub, type: "subcategory", cat, sub });
      if (subsub) parts.push({ label: subsub, type: "subsubcategory", cat, sub, subsub });

      parts.forEach((p, idx) => {
        const span = document.createElement("span");
        span.textContent = p.label;
        span.className = "breadcrumb-link";
        span.style.cursor = "pointer";
        if (p.type === "category") { span.dataset.type = "category"; span.dataset.cat = p.cat; }
        else if (p.type === "subcategory") { span.dataset.type = "subcategory"; span.dataset.cat = p.cat; span.dataset.sub = p.sub; }
        else if (p.type === "subsubcategory") { span.dataset.type = "subsubcategory"; span.dataset.cat = p.cat; span.dataset.sub = p.sub; span.dataset.subsub = p.subsub; }
        else { span.dataset.type = "home"; }

        span.addEventListener("click", () => {
          const type = span.dataset.type;
          if (type === "home") { showInitialHero(); return; }
          const c = span.dataset.cat || null;
          const s = span.dataset.sub || null;
          const ss = span.dataset.subsub || null;
          let productsToRender = [];
          if (c && s && ss) productsToRender = grouped[c]?.[s]?.[ss] || [];
          else if (c && s) productsToRender = flatProducts.filter(p => p.category === c && p.subcategory === s);
          else if (c) productsToRender = flatProducts.filter(p => p.category === c);
          currentState = { category: c, subcategory: s, subsubcategory: ss, products: productsToRender };
          if (c) preselectSubcategoriesForCategory(c);
          renderProductsWithFilters(productsToRender, c, s, ss);
        });

        breadcrumb.appendChild(span);
        if (idx < parts.length - 1) breadcrumb.appendChild(document.createTextNode(" › "));
      });
    }

    /* --------------------
       Product grid renderer
    -------------------- */
    function renderProducts(products, category, subcategory, subsubcategory) {
      if (!productContainer) return;
      productContainer.innerHTML = "";
      buildBreadcrumbDOM(category, subcategory, subsubcategory);
      if (breadcrumb) productContainer.appendChild(breadcrumb);

      products = Array.isArray(products) ? products : [];
      const visible = products.filter(p => !p.isBanner && !p.is_banner);

      if (!visible.length) {
        const bannerImage = findBannerImage(category, subcategory, subsubcategory);
        const nameForBanner = (subsubcategory && subsubcategory !== "__root__") ? subsubcategory : subcategory || category || "default";
        const grid = document.createElement("div");
        grid.className = "product-grid";
        const card = document.createElement("div"); card.className = "product-card coming-card"; card.style.maxWidth = "240px";
        const imgWrapper = document.createElement("div"); imgWrapper.className = "img-wrapper"; imgWrapper.style.position = "relative"; imgWrapper.style.width = "100%";
        const img = document.createElement("img"); img.src = bannerImage || `assets/${bannerFileName(nameForBanner)}`; img.alt = nameForBanner; img.style.width = "100%"; img.style.height = "180px"; img.style.objectFit = "contain";
        img.onerror = function(){ this.onerror=null; this.src="assets/default-banner.png"; };
        imgWrapper.appendChild(img);
        const availBadge = document.createElement("div"); availBadge.className = "avail-badge out"; availBadge.textContent = "Coming Soon"; imgWrapper.appendChild(availBadge);
        card.appendChild(imgWrapper);
        const title = document.createElement("h4"); title.textContent = nameForBanner; card.appendChild(title);
        const ben = document.createElement("p"); ben.className = "product-benefit"; ben.textContent = "Products arriving soon"; card.appendChild(ben);
        const btnArea = document.createElement("div"); btnArea.className = "btn-area"; btnArea.appendChild(createComingSpan()); card.appendChild(btnArea);
        grid.appendChild(card);
        productContainer.appendChild(grid);
        return;
      }

      const groupedByName = {};
      visible.forEach(p => { const key = (p.name||"").trim().toLowerCase(); if (!groupedByName[key]) groupedByName[key] = []; groupedByName[key].push(p); });

      const grid = document.createElement("div"); grid.className = "product-grid";

      Object.values(groupedByName).forEach(variants => {
        const defaultVariant = variants.find(v => Number(v.available) > 0) || variants[0];
        let current = { ...defaultVariant };

        const card = document.createElement("div"); card.className = "product-card";
        const avail = Number(current.available) > 0;
        if (!avail) card.classList.add("coming-card");

        const imgWrapper = document.createElement("div"); imgWrapper.className = "img-wrapper"; imgWrapper.style.position = "relative"; imgWrapper.style.width = "100%";

        const discount = Number(current.discount || current.dis_count || 0);
        const discountBadge = document.createElement("div"); discountBadge.className = "discount-label price-badge"; discountBadge.style.display = discount > 0 ? 'block' : 'none'; if (discount > 0) discountBadge.textContent = (discount > 1 ? discount + "% OFF" : "Offer");
        imgWrapper.appendChild(discountBadge);

        const newBadge = document.createElement("div"); newBadge.className = "discount-label new-badge"; newBadge.style.display = (current.isNew||current.is_new)?'block':'none'; newBadge.textContent = "NEW"; imgWrapper.appendChild(newBadge);
        const trendingBadge = document.createElement("div"); trendingBadge.className = "discount-label trending-badge"; trendingBadge.style.display = (current.isTrending||current.is_trending)?'block':'none'; trendingBadge.textContent = "TREND"; imgWrapper.appendChild(trendingBadge);

        const availBadge = document.createElement("div"); availBadge.className = "avail-badge " + (avail ? "in" : "out"); availBadge.textContent = avail ? "In Stock" : "Coming Soon"; imgWrapper.appendChild(availBadge);

        let cardImages = [];
        if (current.images && current.images.length) cardImages = current.images.map(i => (current.imageFolder ? current.imageFolder + "/" : "assets/") + i);
        else cardImages = ["assets/" + (current.image || "default-banner.png")];
        cardImages = cardImages.filter(Boolean);
        if (!cardImages.length) cardImages = ["assets/default-banner.png"];

        const img = document.createElement("img"); img.style.width = "100%"; img.style.height = "180px"; img.style.objectFit = "contain"; let imgIdx = 0;
        img.src = cardImages[imgIdx]; img.alt = current.name; img.onerror = function(){ this.onerror=null; this.src="assets/default-banner.png"; };
        imgWrapper.appendChild(img);

        if (cardImages.length > 1) {
          const leftBtn = document.createElement("button"); leftBtn.className = "carousel-arrow left"; leftBtn.innerHTML = "‹";
          leftBtn.addEventListener("click", (e) => { e.stopPropagation(); imgIdx = (imgIdx - 1 + cardImages.length) % cardImages.length; img.src = cardImages[imgIdx]; });
          const rightBtn = document.createElement("button"); rightBtn.className = "carousel-arrow right"; rightBtn.innerHTML = "›";
          rightBtn.addEventListener("click", (e) => { e.stopPropagation(); imgIdx = (imgIdx + 1) % cardImages.length; img.src = cardImages[imgIdx]; });
          imgWrapper.appendChild(leftBtn); imgWrapper.appendChild(rightBtn);
        }

        card.appendChild(imgWrapper);

        const title = document.createElement("h4"); title.textContent = current.name; card.appendChild(title);
        if (current.benefit) { const ben = document.createElement("p"); ben.className = "product-benefit"; ben.textContent = current.benefit; card.appendChild(ben); }

        // price display ensures orig class present for strike-through in mobile too
        const wpEl = document.createElement("div"); wpEl.className = "weight-price";
        function updateCardPriceDisplay(productArg) {
          const origP = calculateOriginalPrice(productArg.price);
          const dd = Number(productArg.discount || productArg.dis_count || 0);
          wpEl.innerHTML = "";
          if (dd > 0) {
            const discounted = calculateDiscountedPrice(origP, dd);
            wpEl.innerHTML = `${productArg.weight || "-"} | <span class="orig">AED ${origP.toFixed(1)}</span> <strong>AED ${discounted.toFixed(1)}</strong>`;
          } else {
            wpEl.textContent = `${productArg.weight || "-"} | AED ${Number(productArg.price || 0).toFixed(1)}`;
          }
        }
        updateCardPriceDisplay(current);
        card.appendChild(wpEl);

        if (variants.length > 1) {
          const sel = document.createElement("select"); sel.className = "variant-select"; sel.style.margin = "8px 0";
          variants.forEach(v => {
            const opt = document.createElement("option"); opt.value = v.productCode || JSON.stringify({name:v.name,weight:v.weight,price:v.price});
            opt.textContent = `${v.weight || "-"} - AED ${Number(v.price||0).toFixed(1)}`;
            if ((v.productCode && v.productCode === current.productCode) || (!v.productCode && JSON.stringify({name:v.name,weight:v.weight,price:v.price}) === (current.productCode || JSON.stringify({name:current.name,weight:current.weight,price:current.price})))) opt.selected = true;
            sel.appendChild(opt);
          });
          sel.addEventListener("click", e => e.stopPropagation());
          sel.addEventListener("change", e => {
            const chosenKey = e.target.value;
            const chosen = variants.find(v => (v.productCode && v.productCode === chosenKey) || (JSON.stringify({name:v.name,weight:v.weight,price:v.price}) === chosenKey));
            if (chosen) {
              current = { ...chosen };
              updateCardPriceDisplay(current);
              const newIsAvail = Number(current.available) > 0;
              const newDiscount = Number(current.discount || current.dis_count || 0);
              if (availBadge) { availBadge.textContent = newIsAvail ? "In Stock" : "Coming Soon"; availBadge.className = "avail-badge " + (newIsAvail ? "in":"out"); }
              if (discountBadge) { discountBadge.style.display = newDiscount > 0 ? "block":"none"; if (newDiscount>0) discountBadge.textContent = (newDiscount>1?newDiscount+"% OFF":"Offer"); }
              const btnArea = card.querySelector(".btn-area");
              if (btnArea) {
                btnArea.innerHTML = "";
                const qtyWrap = document.createElement("div"); qtyWrap.className = "qty-selector";
                const minus = document.createElement("button"); minus.textContent = "-";
                const qdisplay = document.createElement("div"); qdisplay.className = "qty-display"; qdisplay.textContent = "1";
                const plus = document.createElement("button"); plus.textContent = "+";
                qtyWrap.appendChild(minus); qtyWrap.appendChild(qdisplay); qtyWrap.appendChild(plus);
                btnArea.appendChild(qtyWrap);
                if (Number(current.available) > 0) btnArea.appendChild(createAddButton(current, qdisplay)); else btnArea.appendChild(createComingSpan());
              }
            }
          });
          card.appendChild(sel);
        }

        (function initBtnAreaForCard(initialProduct) {
          const btnArea = document.createElement("div"); btnArea.className = "btn-area"; btnArea.style.width = "100%";
          const qtyWrap = document.createElement("div"); qtyWrap.className = "qty-selector";
          const minus = document.createElement("button"); minus.textContent = "-";
          const qdisplay = document.createElement("div"); qdisplay.className = "qty-display"; qdisplay.textContent = "1";
          const plus = document.createElement("button"); plus.textContent = "+";
          qtyWrap.appendChild(minus); qtyWrap.appendChild(qdisplay); qtyWrap.appendChild(plus);
          btnArea.appendChild(qtyWrap);
          if (Number(initialProduct.available) > 0) btnArea.appendChild(createAddButton(initialProduct, qdisplay)); else btnArea.appendChild(createComingSpan());
          card.appendChild(btnArea);
        })(current);

        card.addEventListener("click", (e) => {
          if (e.target.closest(".variant-select") || e.target.closest(".add-cart") || e.target.closest(".qty-selector") || e.target.closest(".carousel-arrow")) return;
          renderProductDetail(variants, current, { category, subcategory, subsubcategory, products });
          if (window.innerWidth <= 768 && categoryPanel) categoryPanel.classList.remove("panel-active");
        });

        grid.appendChild(card);
      });

      productContainer.appendChild(grid);
    }

    /* --------------------
       Product detail renderer
       - fix: set image/info column flex so info doesn't overlay images
    -------------------- */
    function renderProductDetail(variants, selected, locationState) {
      const product = selected || variants[0];
      productContainer.innerHTML = "";
      buildBreadcrumbDOM(locationState?.category, locationState?.subcategory, locationState?.subsubcategory);
      if (breadcrumb) productContainer.appendChild(breadcrumb);

      // remove hero overlay for focused detail
      const heroOverlay = document.getElementById("hero-carousel-overlay");
      if (heroOverlay && heroOverlay.parentNode) heroOverlay.remove();

      breadcrumb.appendChild(document.createTextNode(" › " + (product.name || "")));

      const detailRoot = document.createElement("div");
      detailRoot.className = "product-detail product-detail-flex";
      detailRoot.style.display = "flex";
      detailRoot.style.flexDirection = window.innerWidth <= 768 ? "column" : "row";
      detailRoot.style.gap = "20px";
      detailRoot.style.alignItems = "flex-start";

      const closeBtn = document.createElement("button");
      closeBtn.className = "close-x";
      closeBtn.innerHTML = "✕";
      closeBtn.type = "button";
      closeBtn.addEventListener("click", () => {
        if (locationState && locationState.products) {
          const src = determineProductsSource(locationState.products, locationState.category);
          renderProductsWithFilters(src, locationState.category, locationState.subcategory, locationState.subsubcategory);
          buildBreadcrumbDOM(locationState.category, locationState.subcategory, locationState.subsubcategory);
        } else {
          showInitialHero();
        }
      });

      const imgCol = document.createElement("div");
      imgCol.className = "product-image-col product-img-col";
      // ensure image column takes reasonable width on desktop to prevent overlap
      imgCol.style.position = "relative";
      imgCol.style.flex = "0 0 45%";
      imgCol.style.maxWidth = "480px";
      imgCol.style.boxSizing = "border-box";

      let imageList = [];
      if (product.images && product.images.length) imageList = product.images.map(i => (product.imageFolder ? product.imageFolder + "/" : "assets/") + i);
      else imageList = ["assets/" + (product.image || "default-banner.png")];
      imageList = imageList.filter(Boolean);
      if (!imageList.length) imageList = ["assets/default-banner.png"];

      let mainIdx = 0;
      const mainImg = document.createElement("img");
      mainImg.src = imageList[mainIdx];
      mainImg.alt = product.name;
      mainImg.style.width = "100%";
      mainImg.style.maxHeight = "420px";
      mainImg.style.objectFit = "contain";
      mainImg.onerror = function(){ this.onerror=null; this.src="assets/default-banner.png"; };
      imgCol.appendChild(mainImg);

      const disc = Number(product.discount || product.dis_count || 0);
      if (disc > 0) { const d = document.createElement("div"); d.className = "discount-label price-badge"; d.textContent = disc > 1 ? disc + "% OFF" : "Offer"; imgCol.appendChild(d); }
      if (product.isNew || product.is_new) { const nb = document.createElement("div"); nb.className = "discount-label new-badge"; nb.textContent = "NEW"; imgCol.appendChild(nb); }
      if (product.isTrending || product.is_trending) { const tb = document.createElement("div"); tb.className = "discount-label trending-badge"; tb.textContent = "TREND"; imgCol.appendChild(tb); }

      const avail = Number(product.available) > 0;
      const availBadge = document.createElement("div"); availBadge.className = "avail-badge " + (avail ? "in" : "out"); availBadge.style.position = "absolute"; availBadge.style.right = "8px"; availBadge.style.top = "8px"; availBadge.textContent = avail ? "In Stock" : "Coming Soon"; imgCol.appendChild(availBadge);

      if (imageList.length > 1) {
        const left = document.createElement("button"); left.className = "carousel-arrow left"; left.type = "button"; left.textContent = "‹";
        left.addEventListener("click", (e) => { e.stopPropagation(); mainIdx = (mainIdx - 1 + imageList.length) % imageList.length; mainImg.src = imageList[mainIdx]; });
        const right = document.createElement("button"); right.className = "carousel-arrow right"; right.type = "button"; right.textContent = "›";
        right.addEventListener("click", (e) => { e.stopPropagation(); mainIdx = (mainIdx + 1) % imageList.length; mainImg.src = imageList[mainIdx]; });
        imgCol.appendChild(left); imgCol.appendChild(right);
      }

      if (imageList.length > 1) {
        const thumbs = document.createElement("div"); thumbs.className = "detail-thumbs"; thumbs.style.display = "flex"; thumbs.style.gap = "8px"; thumbs.style.marginTop = "10px";
        imageList.forEach((src, idx) => {
          const t = document.createElement("img"); t.src = src; t.style.width = "64px"; t.style.height = "64px"; t.style.objectFit = "cover"; t.style.borderRadius = "6px"; t.style.cursor = "pointer";
          t.onerror = function(){ this.onerror=null; this.src="assets/default-banner.png"; };
          t.addEventListener("click", () => { mainIdx = idx; mainImg.src = src; });
          thumbs.appendChild(t);
        });
        imgCol.appendChild(thumbs);
      }

      const infoCol = document.createElement("div");
      infoCol.className = "product-info-col product-info";
      // ensure info column takes remaining space and does not overlay images
      infoCol.style.flex = "1 1 50%";
      infoCol.style.boxSizing = "border-box";

      infoCol.appendChild(closeBtn);
      const h2 = document.createElement("h2"); h2.textContent = product.name; infoCol.appendChild(h2);
      if (product.benefit) { const ben = document.createElement("p"); ben.className = "product-benefit"; ben.textContent = product.benefit; infoCol.appendChild(ben); }

      if (variants && variants.length > 1) {
        const sel = document.createElement("select"); sel.className = "variant-select"; sel.style.margin = "8px auto"; sel.style.display = 'block'; sel.style.maxWidth = '250px';
        variants.forEach(v => { const o = document.createElement("option"); o.value = v.productCode || JSON.stringify({name:v.name,weight:v.weight,price:v.price}); o.textContent = `${v.weight || "-"} - AED ${Number(v.price||0).toFixed(1)}`; if (v.productCode === product.productCode) o.selected = true; sel.appendChild(o); });
        sel.addEventListener("change", (e) => { const chosenKey = e.target.value; const chosen = variants.find(v => (v.productCode && v.productCode === chosenKey) || (JSON.stringify({name:v.name,weight:v.weight,price:v.price}) === chosenKey)); if (chosen) renderProductDetail(variants, chosen, locationState); });
        infoCol.appendChild(sel);
      }

      const priceDisplay = document.createElement("div"); priceDisplay.id = "detail-price-display"; priceDisplay.className = "weight-price detail-price";
      (function updateDetailPrice(productArg) {
        const orig = calculateOriginalPrice(productArg.price);
        const d = Number(productArg.discount || productArg.dis_count || 0);
        priceDisplay.innerHTML = '';
        if (d > 0) {
          const discounted = calculateDiscountedPrice(orig, d);
          priceDisplay.innerHTML = `${productArg.weight || "-"} | <span class="orig">AED ${orig.toFixed(1)}</span> <strong>AED ${discounted.toFixed(1)}</strong>`;
        } else {
          priceDisplay.textContent = `${productArg.weight || "-"} | AED ${Number(productArg.price||0).toFixed(1)}`;
        }
      })(product);
      infoCol.appendChild(priceDisplay);

      const qtyWrap = document.createElement("div"); qtyWrap.className = "qty-selector";
      const minusD = document.createElement("button"); minusD.textContent = "-";
      const qtyDisplay = document.createElement("div"); qtyDisplay.className = "qty-display"; qtyDisplay.textContent = "1";
      const plusD = document.createElement("button"); plusD.textContent = "+";
      const disableQtyDetail = Number(product.available) <= 0;
      if (disableQtyDetail) { qtyDisplay.style.pointerEvents = "none"; minusD.disabled = true; plusD.disabled = true; minusD.style.opacity = "0.5"; plusD.style.opacity = "0.5"; }
      minusD.addEventListener("click", () => { if (disableQtyDetail) return; let q = Number(qtyDisplay.textContent)||1; if(q>1) qtyDisplay.textContent = q-1; });
      plusD.addEventListener("click", () => { if (disableQtyDetail) return; let q = Number(qtyDisplay.textContent)||1; qtyDisplay.textContent = q+1; });
      qtyWrap.appendChild(minusD); qtyWrap.appendChild(qtyDisplay); qtyWrap.appendChild(plusD);
      infoCol.appendChild(qtyWrap);

      const actionArea = document.createElement("div"); actionArea.style.marginTop = "10px"; actionArea.style.display = "flex"; actionArea.style.justifyContent = "center"; actionArea.style.width = "100%";
      if (Number(product.available) > 0) { const addBtn = document.createElement("button"); addBtn.className = "add-cart"; addBtn.textContent = "Add to Cart"; addBtn.addEventListener("click", () => addToCart(product, Number(qtyDisplay.textContent) || 1)); actionArea.appendChild(addBtn); } else actionArea.appendChild(createComingSpan());
      infoCol.appendChild(actionArea);

      const descCol = document.createElement("div"); descCol.className = "product-desc-col";
      if (product.description) { const d = document.createElement("div"); d.innerHTML = `<h4>Description:</h4><p>${product.description}</p>`; descCol.appendChild(d); }
      if (product.highlights && Array.isArray(product.highlights)) { const h = document.createElement("div"); h.innerHTML = "<h4>Highlights:</h4>"; const ul = document.createElement("ul"); ul.className = "highlights-list"; product.highlights.forEach(li => { const item = document.createElement("li"); item.textContent = li; ul.appendChild(item); }); h.appendChild(ul); descCol.appendChild(h); }
      if (product.material) { const m = document.createElement("div"); m.innerHTML = `<h4>Material:</h4><p>${product.material}</p>`; descCol.appendChild(m); }

      detailRoot.appendChild(imgCol);
      detailRoot.appendChild(infoCol);
      detailRoot.appendChild(descCol);
      productContainer.appendChild(detailRoot);
    }

    /* --------------------
       Mobile toggle & click outside
    -------------------- */
    let mobileToggle = document.getElementById("mobile-category-toggle");
    if (!mobileToggle && productPanel) {
      mobileToggle = document.createElement("button");
      mobileToggle.id = "mobile-category-toggle";
      mobileToggle.className = "mobile-category-toggle";
      mobileToggle.textContent = "Product Catalogue";
      productPanel.prepend(mobileToggle);
    }
    if (mobileToggle) {
      mobileToggle.addEventListener("click", e => { e.stopPropagation(); categoryPanel && categoryPanel.classList.toggle("panel-active"); });
      function showMobileToggle() { if (!mobileToggle) return; mobileToggle.style.display = window.innerWidth <= 768 ? "block" : "none"; }
      showMobileToggle(); window.addEventListener("resize", showMobileToggle);
    }
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (categoryPanel && !categoryPanel.contains(target) && target !== mobileToggle) categoryPanel.classList.remove("panel-active");
      const mobileNav = document.getElementById("mobile-nav");
      const menuToggle = document.getElementById("menu-toggle");
      if (mobileNav && !mobileNav.contains(target) && target !== menuToggle) mobileNav.classList.remove("active");
    });

    // Debug exposure
    try { window.__pe_debug = { grouped: () => grouped, flatProducts: () => flatProducts, groupedByName: () => groupedByNameCache }; } catch(e){}
  });
})();