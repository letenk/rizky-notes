// Tombol copy pada code block (lihat layouts/_default/_markup/render-codeblock.html)
(function () {
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try { fallbackCopy(text); resolve(); } catch (e) { reject(e); }
    });
  }

  document.querySelectorAll('.code-copy-btn').forEach(function (btn) {
    var timer = null;
    btn.addEventListener('click', function () {
      var code = btn.parentElement.querySelector('pre code');
      if (!code) return;
      copy(code.innerText.replace(/\n$/, '')).then(function () {
        btn.textContent = btn.dataset.copied;
        btn.classList.add('is-copied');
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.textContent = btn.dataset.label;
          btn.classList.remove('is-copied');
        }, 2000);
      });
    });
  });
})();
