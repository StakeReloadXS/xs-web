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
  function updateBadge() {
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = cartCount(); });
  }
  function getProducts() {
    return fetch("/data/products.json").then(function (r) { return r.json(); }).then(function (d) { return d.products; });
  }
  function makeRef() {
    return "XS-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function renderProducts(el) {
    getProducts().then(function (products) {
      el.innerHTML = products.map(function (p) {
        var ok = p.availability === "in-stock";
        return '<div class="hover:outline outline-red-600 rounded p-6 transition-all text-left">' +
          '<img src="' + esc(p.image) + '" alt="" class="w-12 h-12 mb-4">' +
          '<h4 class="text-xl mb-4">' + esc(p.name) + '</h4>' +
          '<h3 class="text-4xl">' + money(p.price) + '</h3>' +
          '<p class="mt-4 text-gray-400">' + esc(p.description) + '</p>' +
          '<button type="button" data-add="' + esc(p.id) + '"' + (ok ? "" : " disabled") +
          ' class="w-full px-6 py-3.5 rounded-md text-gray-100 bg-red-700 hover:bg-red-800 disabled:opacity-40 transition-all mt-8">' +
          (ok ? "Add to order" : "Unavailable") + '</button></div>';
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
    }).catch(function () { el.innerHTML = '<p class="text-gray-400">Could not load products.</p>'; });
  }

  function renderOrder(root) {
    var list = root.querySelector("[data-lines]");
    var totalEl = root.querySelector("[data-total]");
    var form = root.querySelector("form");
    var status = root.querySelector("[data-status]");
    var byId = {};

    function draw() {
      var cart = loadCart(), total = 0, ids = Object.keys(cart).filter(function (id) { return byId[id]; });
      if (!ids.length) {
        list.innerHTML = '<p class="text-gray-400">Your order is empty. <a class="text-red-600 hover:underline" href="/products.html">Browse products</a>.</p>';
        totalEl.textContent = money(0);
        form.querySelector("[type=submit]").disabled = true;
        return;
      }
      form.querySelector("[type=submit]").disabled = false;
      list.innerHTML = ids.map(function (id) {
        var p = byId[id], q = cart[id]; total += p.price * q;
        return '<div class="flex items-center justify-between py-3 border-b border-gray-800"><div><div>' + esc(p.name) +
          '</div><div class="text-gray-400 text-sm">' + money(p.price) + ' each</div></div>' +
          '<div class="flex items-center gap-2"><button type="button" data-dec="' + id + '" class="w-8 h-8 rounded bg-[#222]">−</button>' +
          '<span class="w-6 text-center">' + q + '</span><button type="button" data-inc="' + id + '" class="w-8 h-8 rounded bg-[#222]">+</button></div></div>';
      }).join("");
      totalEl.textContent = money(total);
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
        "\nTotal: " + money(total) + "\nName: " + order.name + "\n" + order.contactMethod + ": " + order.contact + (order.notes ? "\nNotes: " + order.notes : "");
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

    getProducts().then(function (products) { products.forEach(function (p) { byId[p.id] = p; }); draw(); });
  }

  function renderSuccess(root) {
    var last = null;
    try { last = JSON.parse(sessionStorage.getItem("xs-last-order")); } catch (e) {}
    var ref = new URLSearchParams(location.search).get("ref") || (last && last.reference) || "";
    root.querySelector("[data-ref]").textContent = ref || "—";
    if (last && !cfg.orderEndpoint) {
      var a = root.querySelector("[data-telegram]");
      a.href = "https://t.me/" + cfg.telegram;
      a.classList.remove("hidden");
      root.querySelector("[data-summary]").textContent = last.summary;
      root.querySelector("[data-summary-wrap]").classList.remove("hidden");
    }
    if (cfg.paymentLink) {
      var p = root.querySelector("[data-pay]");
      p.href = cfg.paymentLink;
      p.classList.remove("hidden");
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
