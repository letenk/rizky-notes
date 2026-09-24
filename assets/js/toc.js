// TOC scroll-spy: highlight link untuk section yang sedang dibaca
(function () {
  var tocNav = document.getElementById('toc-nav');
  if (!tocNav) return;

  var tocLinks = tocNav.querySelectorAll('a[href^="#"]');
  if (!tocLinks.length) return;

  var linkById = {};
  var headings = [];

  tocLinks.forEach(function (link) {
    var id = decodeURIComponent(link.getAttribute('href').slice(1));
    var heading = document.getElementById(id);
    if (heading) {
      linkById[id] = link;
      headings.push(heading);
    }
  });

  if (!headings.length) return;

  var activeId = null;

  function setActive(id) {
    if (id === activeId) return;
    if (activeId && linkById[activeId]) {
      linkById[activeId].classList.remove('toc-active');
    }
    if (id && linkById[id]) {
      linkById[id].classList.add('toc-active');
    }
    activeId = id;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      // Anggap heading "aktif" begitu lewat header sticky (~96px),
      // dan hanya pantau pita 30% teratas viewport.
      rootMargin: '-96px 0px -70% 0px',
      threshold: 0,
    }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });
})();
