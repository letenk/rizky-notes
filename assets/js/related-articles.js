// Related articles sidebar: pilih 2 artikel lain secara acak tiap kali halaman dibuka
(function () {
  var container = document.getElementById('related-articles-list');
  if (!container) return;

  var indexUrl = container.dataset.indexUrl || '/index.json';
  var locale = container.dataset.locale || 'en-US';
  var currentUrl = container.dataset.current || '';
  var readingTimeTemplate = container.dataset.readingTimeTemplate || '__COUNT__';

  function formatDate(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  function formatReadingTime(minutes) {
    return readingTimeTemplate.replace('__COUNT__', Math.max(1, Math.round(minutes || 1)));
  }

  function pickRandom(items, count) {
    var pool = items.slice();
    var picked = [];
    while (pool.length && picked.length < count) {
      var i = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(i, 1)[0]);
    }
    return picked;
  }

  function cardHTML(item) {
    var tag = item.tags && item.tags.length ? item.tags[0] : '';
    var meta = formatDate(item.date) + ' · ' + formatReadingTime(item.readingTime);

    var thumb = item.image
      ? '<img src="' + item.image + '" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">'
      : '<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>';

    return (
      '<a href="' + item.permalink + '" class="group block bg-white dark:bg-navy-800 rounded-xl overflow-hidden border border-gray-200 dark:border-navy-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg">' +
      '<div class="aspect-video w-full overflow-hidden">' + thumb + '</div>' +
      '<div class="p-3">' +
      (tag
        ? '<span class="inline-block mb-2 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded">#' + tag + '</span>'
        : '') +
      '<h3 class="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">' + item.title + '</h3>' +
      '<p class="mt-2 text-xs text-gray-500 dark:text-gray-500">' + meta + '</p>' +
      '</div>' +
      '</a>'
    );
  }

  fetch(indexUrl)
    .then(function (res) { return res.json(); })
    .then(function (posts) {
      var others = posts.filter(function (item) {
        return item.permalink !== currentUrl;
      });
      var picks = pickRandom(others, 2);
      container.innerHTML = picks.map(cardHTML).join('');
    })
    .catch(function (error) {
      console.error('Failed to load related articles:', error);
    });
})();
