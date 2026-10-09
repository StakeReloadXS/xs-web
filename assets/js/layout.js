// Canonical site chrome: one header/footer rendered into every page.
(function () {
  var LINKS = [
    ["/", "Home"],
    ["/products.html", "Shop"],
    ["/offers.html", "Offers"],
    ["/team.html", "Team"],
    ["/support.html", "Support"]
  ];
  var path = location.pathname.replace(/index\.html$/, "");
  if (path === "") path = "/";

  function header() {
    var items = LINKS.map(function (l) {
      var cur = l[0] === path ? ' aria-current="page"' : "";
      return '<li><a href="' + l[0] + '"' + cur + ">" + l[1] + "</a></li>";
    }).join("") + '<li><a href="/order.html"' + (path === "/order.html" ? ' aria-current="page"' : "") +
      '>Order (<span data-cart-count>0</span>)</a></li>';
    return '<div class="container header-inner">' +
      '<a class="brand" href="/" aria-label="StakeReloadXS home"><img src="/assets/img/og-image.png" width="48" height="48" alt=""></a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">' +
      '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg></button>' +
      '<nav class="site-nav" id="site-nav" aria-label="Main"><ul>' + items + "</ul></nav></div>";
  }

  function footer() {
    return '<div class="container"><div class="footer-grid">' +
      '<div><h4>StakeReloadXS</h4><p class="muted">A small team of web3 developers building simple, fast reload automation.</p></div>' +
      '<div><h4>Shop</h4><ul><li><a href="/products.html">Credits &amp; services</a></li><li><a href="/offers.html">Signup offers</a></li><li><a href="/order.html">Your order</a></li></ul></div>' +
      '<div><h4>Help</h4><ul><li><a href="/support.html">Support</a></li><li><a href="/team.html">Team</a></li></ul></div>' +
      '<div><h4>Socials</h4><ul><li><a href="https://x.com/ReloadedXS"><img class=\"social-icon\" src=\"/assets/img/social/x.svg\" alt=\"\" width=\"18\" height=\"18\">X (Twitter)</a></li><li><a href="https://github.com/StakeReloadXS"><img class=\"social-icon\" src=\"/assets/img/social/github.svg\" alt=\"\" width=\"18\" height=\"18\">GitHub</a></li><li><a href="https://t.me/StakeReloadXS"><img class=\"social-icon\" src=\"/assets/img/social/telegram.svg\" alt=\"\" width=\"18\" height=\"18\">Telegram Channel</a></li><li><a href="https://t.me/ReloadXS"><img class=\"social-icon\" src=\"/assets/img/social/telegram.svg\" alt=\"\" width=\"18\" height=\"18\">Telegram Group</a></li><li><a href="https://t.me/StakeAssistBot"><img class=\"social-icon\" src=\"/assets/img/social/telegram.svg\" alt=\"\" width=\"18\" height=\"18\">Telegram Bot</a></li><li><a href="https://dsc.gg/stakereloadxs"><img class=\"social-icon\" src=\"/assets/img/social/discord.svg\" alt=\"\" width=\"18\" height=\"18\">Discord</a></li><li><a href="https://www.linkedin.com/posts/stakereloadxs_stakereloadxs-xtremely-simple-reloads-activity-7317202258264240129-XMmY"><img class=\"social-icon\" src=\"/assets/img/social/linkedin.svg\" alt=\"\" width=\"18\" height=\"18\">LinkedIn</a></li></ul></div>' +
      '</div><p class="copyright">2025 &copy; All Rights Reserved | StakeReloadXS</p></div>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    var h = document.querySelector("[data-site-header]");
    var f = document.querySelector("[data-site-footer]");
    if (h) { h.className = "site-header"; h.innerHTML = header(); }
    if (f) { f.className = "site-footer"; f.innerHTML = footer(); }

    var btn = document.querySelector(".nav-toggle"), nav = document.getElementById("site-nav");
    if (btn && nav) {
      var set = function (open) { nav.classList.toggle("open", open); btn.setAttribute("aria-expanded", open ? "true" : "false"); };
      btn.addEventListener("click", function () { set(!nav.classList.contains("open")); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
      document.addEventListener("click", function (e) { if (!h.contains(e.target)) set(false); });
      window.matchMedia("(min-width: 56.25em)").addEventListener("change", function () { set(false); });
    }
    if (window.XS_REFRESH_CART) window.XS_REFRESH_CART();
  });

  // Live chat widget (unchanged from the previous site)
  var Tawk_API = window.Tawk_API = window.Tawk_API || {};
  var s = document.createElement("script");
  s.async = true; s.src = "https://embed.tawk.to/68013ff53e654c19146b2db9/1ip2e3m7d"; s.charset = "UTF-8"; s.setAttribute("crossorigin", "*");
  document.head.appendChild(s);
})();
