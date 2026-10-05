(function () {
  'use strict';
  var dialog = document.querySelector('.gallery-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var links = Array.from(document.querySelectorAll('[data-gallery-image]'));
  var image = dialog.querySelector('.gallery-dialog-image');
  var error = dialog.querySelector('.gallery-image-error');
  var title = dialog.querySelector('.gallery-dialog-title');
  var caption = dialog.querySelector('.gallery-dialog-caption');
  var position = dialog.querySelector('.gallery-position');
  var original = dialog.querySelector('.gallery-original');
  var previous = dialog.querySelector('.gallery-previous');
  var next = dialog.querySelector('.gallery-next');
  var current = 0;
  var opener;

  function show(index) {
    current = (index + links.length) % links.length;
    var link = links[current];
    error.hidden = true;
    image.hidden = false;
    image.alt = link.querySelector('img').alt;
    image.src = link.href;
    title.textContent = link.dataset.title;
    caption.textContent = link.dataset.caption || '';
    caption.hidden = !caption.textContent;
    position.textContent = (current + 1) + ' / ' + links.length;
    original.href = link.href;
    previous.hidden = next.hidden = links.length < 2;
  }

  image.addEventListener('load', function () { image.hidden = false; error.hidden = true; });
  image.addEventListener('error', function () { image.hidden = true; error.hidden = false; });
  links.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      // Preserve opening in a new tab and the plain image link as a fallback.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      show(index);
      dialog.showModal();
      document.body.classList.add('gallery-open');
    });
  });
  dialog.querySelector('.gallery-close').addEventListener('click', function () { dialog.close(); });
  previous.addEventListener('click', function () { show(current - 1); });
  next.addEventListener('click', function () { show(current + 1); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) {
      var rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', function () {
    document.body.classList.remove('gallery-open');
    if (opener) opener.focus();
  });
}());
