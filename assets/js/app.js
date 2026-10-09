// Static storefront: catalog from /data/products.json, cart in localStorage, order handoff to an external endpoint.
(function () {
  var CART_KEY = "xs-cart";
  var cfg = window.XS_CONFIG || {};
  var money = function (n) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    updateBadge();
  }
  function cartCount() {
    var c = loadCart();
    return Object.keys(c).reduce(function (a, k) { return a + c[k]; }, 0);
  }
  window.XS_REFRESH_CART = function () { updateBadge(); };
  function updateBadge() {
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = cartCount(); });
  }
  function getCatalog() {
    return fetch("/data/products.json").then(function (r) { return r.json(); });
  }
  function getProducts() {
    return getCatalog().then(function (d) { return d.products; });
  }
  // Highest boost tier the order total reaches; 0 when none applies. Mirrors boostPercent in functions/api/order.js.
  function boostFor(total, tiers) {
    var pct = 0;
    (tiers || []).forEach(function (t) { if (total >= t.minTotal && t.percent > pct) pct = t.percent; });
    return pct;
  }
  function makeRef() {
    return "XS-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function renderProducts(el) {
    getCatalog().then(function (catalog) {
      var products = catalog.products;
      var tierEl = document.querySelector("[data-boost-tiers]");
      if (tierEl) {
        tierEl.innerHTML = (catalog.boostTiers || []).map(function (t) {
          return "<li>" + t.percent + "% at " + money(t.minTotal) + " or more</li>";
        }).join("");
      }
      el.innerHTML = products.map(function (p) {
        var ok = p.availability === "in-stock";
        return '<article class="card">' +
          '<img class="icon" src="' + esc(p.image) + '" alt="" width="48" height="48">' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<div class="price">' + money(p.price) + '</div>' +
          '<p class="muted">' + esc(p.description) + '</p>' +
          '<button type="button" class="btn btn-block" data-add="' + esc(p.id) + '"' + (ok ? "" : " disabled") + '>' +
          (ok ? "Add to order" : "Unavailable") + '</button></article>';
      }).join("");
      el.addEventListener("click", function (e) {
        var id = e.target.getAttribute && e.target.getAttribute("data-add");
        if (!id) return;
        var cart = loadCart();
        cart[id] = (cart[id] || 0) + 1;
        saveCart(cart);
        e.target.textContent = "Added ✓";
        setTimeout(function () { e.target.textContent = "Add to order"; }, 1200);
      });
    }).catch(function () { el.innerHTML = '<p class="muted">Could not load products.</p>'; });
  }

  function renderOrder(root) {
    var list = root.querySelector("[data-lines]");
    var totalEl = root.querySelector("[data-total]");
    var form = root.querySelector("form");
    var status = root.querySelector("[data-status]");
    var boostEl = root.querySelector("[data-boost]");
    var byId = {};
    var tiers = [];

    function draw() {
      var cart = loadCart(), total = 0, ids = Object.keys(cart).filter(function (id) { return byId[id]; });
      if (!ids.length) {
        list.innerHTML = '<p class="muted">Your order is empty. <a class="accent" href="/products.html">Browse products</a>.</p>';
        totalEl.textContent = money(0);
        if (boostEl) boostEl.textContent = "";
        form.querySelector("[type=submit]").disabled = true;
        return;
      }
      form.querySelector("[type=submit]").disabled = false;
      list.innerHTML = ids.map(function (id) {
        var p = byId[id], q = cart[id]; total += p.price * q;
        return '<div class="line"><div><div>' + esc(p.name) + '</div><div class="muted">' + money(p.price) + ' each</div></div>' +
          '<div class="qty"><button type="button" data-dec="' + id + '" aria-label="Remove one ' + esc(p.name) + '">\u2212</button>' +
          '<span aria-live="polite">' + q + '</span><button type="button" data-inc="' + id + '" aria-label="Add one ' + esc(p.name) + '">+</button></div></div>';
      }).join("");
      totalEl.textContent = money(total);
      if (boostEl) {
        var pct = boostFor(total, tiers);
        boostEl.textContent = pct ? "Boost on this order: " + pct + "%" : "No boost yet. Orders of $100 or more get a boost.";
      }
    }

    list.addEventListener("click", function (e) {
      var inc = e.target.getAttribute("data-inc"), dec = e.target.getAttribute("data-dec");
      var cart = loadCart();
      if (inc) cart[inc] = (cart[inc] || 0) + 1;
      if (dec) { cart[dec] = (cart[dec] || 0) - 1; if (cart[dec] <= 0) delete cart[dec]; }
      if (inc || dec) { saveCart(cart); draw(); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var cart = loadCart(), total = 0;
      var items = Object.keys(cart).filter(function (id) { return byId[id]; }).map(function (id) {
        total += byId[id].price * cart[id];
        return { id: id, name: byId[id].name, quantity: cart[id], unitPrice: byId[id].price };
      });
      var fd = new FormData(form);
      var order = {
        reference: makeRef(),
        name: fd.get("name"), contactMethod: fd.get("contactMethod"), contact: fd.get("contact"), notes: fd.get("notes") || "",
        items: items, total: total, createdAt: new Date().toISOString()
      };
      var summary = "Order " + order.reference + "\n" + items.map(function (i) { return i.quantity + " x " + i.name + " (" + money(i.unitPrice) + ")"; }).join("\n") +
        "\nTotal: " + money(total) + (boostFor(total, tiers) ? "\nBoost: " + boostFor(total, tiers) + "%" : "") + "\nName: " + order.name + "\n" + order.contactMethod + ": " + order.contact + (order.notes ? "\nNotes: " + order.notes : "");
      try { sessionStorage.setItem("xs-last-order", JSON.stringify({ reference: order.reference, summary: summary, total: total })); } catch (err) {}

      var done = function () { saveCart({}); window.location.href = "/success.html?ref=" + encodeURIComponent(order.reference); };
      if (cfg.orderEndpoint) {
        status.textContent = "Submitting…";
        fetch(cfg.orderEndpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(order) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
          .catch(function () { status.textContent = "Could not submit your order. Please try again or contact us on Telegram."; });
      } else {
        done(); // no endpoint configured: success page offers the Telegram handoff
      }
    });

    getCatalog().then(function (catalog) { catalog.products.forEach(function (p) { byId[p.id] = p; }); tiers = catalog.boostTiers || []; draw(); });
  }

  function renderSuccess(root) {
    var last = null;
    try { last = JSON.parse(sessionStorage.getItem("xs-last-order")); } catch (e) {}
    var ref = new URLSearchParams(location.search).get("ref") || (last && last.reference) || "";
    root.querySelector("[data-ref]").textContent = ref || "—";
    if (last && !cfg.orderEndpoint) {
      var a = root.querySelector("[data-telegram]");
      a.href = "https://t.me/" + cfg.telegram;
      a.removeAttribute("hidden");
      root.querySelector("[data-summary]").textContent = last.summary;
      root.querySelector("[data-summary-wrap]").removeAttribute("hidden");
    }
    if (cfg.paymentLink) {
      var p = root.querySelector("[data-pay]");
      p.href = cfg.paymentLink;
      p.removeAttribute("hidden");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateBadge();
    var el;
    if ((el = document.getElementById("product-grid"))) renderProducts(el);
    if ((el = document.getElementById("order-root"))) renderOrder(el);
    if ((el = document.getElementById("success-root"))) renderSuccess(el);
  });
})();
