(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Navbar gets a solid background once the page scrolls
  var nav = document.querySelector('.navbar');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal elements as they enter the viewport
  function observeReveals(root) {
    var els = (root || document).querySelectorAll('.reveal, .entries > p, .chips > p, .section-block');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) {
      el.style.setProperty('--i', i % 6);
      io.observe(el);
    });
  }
  observeReveals();

  // Assemble the email link at runtime to keep it away from scrapers
  document.querySelectorAll('a.email').forEach(function (a) {
    var addr = a.dataset.user + '@' + a.dataset.domain;
    a.href = 'mailto:' + addr;
    a.textContent = addr;
  });

  // Gentle tilt on book covers following the pointer
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.book-cover').forEach(function (el) {
      el.addEventListener('mousemove', function (ev) {
        var r = el.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(800px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  // Substack feed as cards
  var feed = document.getElementById('rss-feed');
  if (feed) {
    var api = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.dataset.rss);
    var esc = function (s) {
      var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML;
    };
    fetch(api)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.items || !data.items.length) throw new Error('empty');
        feed.innerHTML = data.items.slice(0, 6).map(function (item) {
          var date = new Date(item.pubDate.replace(' ', 'T'));
          var dateStr = isNaN(date) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          var text = (item.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (text.length > 150) text = text.slice(0, 150).replace(/\s\S*$/, '') + '…';
          return '<a class="post reveal" href="' + esc(item.link) + '" target="_blank" rel="noopener">' +
            '<span class="post-date">' + esc(dateStr) + '</span>' +
            '<span class="post-title">' + esc(item.title) + '</span>' +
            (text ? '<span class="post-excerpt">' + esc(text) + '</span>' : '') +
            '<span class="post-arrow" aria-hidden="true">→</span></a>';
        }).join('');
        observeReveals(feed);
      })
      .catch(function () {
        feed.innerHTML = '<p class="feed-loading">Unable to load the feed — <a href="https://paulheideman.substack.com" target="_blank" rel="noopener">read on Substack</a>.</p>';
      });
  }
})();
