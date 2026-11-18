(() => {
  const config = window.BIRTHDAY_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const pages = $$('.spread');
  let pageIndex = 0;
  let audio = null;

  // Apply personalization.
  $('#ageNumber').innerHTML = `${config.age || '20'}<span>th</span>`;
  $('#recipientLeft').textContent = config.name || 'my favourite person';
  $('#recipientFinal').textContent = config.name || 'Beautiful soul';
  $('#letterText').textContent = config.letter || '';
  $('#introCopy').textContent = config.intro || '';
  $('#finalWish').textContent = config.finalWish || '';

  const dots = $('#pageDots');
  pages.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to scrapbook page ${i + 1}`);
    dot.addEventListener('click', () => showPage(i));
    dots.appendChild(dot);
  });

  function showPage(index) {
    pageIndex = Math.max(0, Math.min(pages.length - 1, index));
    pages.forEach((page, i) => page.classList.toggle('active', i === pageIndex));
    [...dots.children].forEach((dot, i) => dot.classList.toggle('selected', i === pageIndex));
    $('#pageCounter').textContent = `${String(pageIndex + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`;
    $('#prevPage').disabled = pageIndex === 0;
    $('#prevPage').style.opacity = pageIndex === 0 ? '.4' : '1';
    $('#nextPage').textContent = pageIndex === pages.length - 1 ? 'Start again ↺' : 'Next page →';
    $('#book').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  $('#openBook').addEventListener('click', () => {
    const cover = $('#coverScreen');
    cover.classList.add('opening-away');
    cover.style.transition = 'opacity .8s, transform .8s';
    cover.style.opacity = '0';
    cover.style.transform = 'scale(1.04)';
    setTimeout(() => {
      cover.style.display = 'none';
      $('#bookStage').classList.add('visible');
      showPage(0);
    }, 750);
  });

  $('#prevPage').addEventListener('click', () => showPage(pageIndex - 1));
  $('#nextPage').addEventListener('click', () => showPage(pageIndex === pages.length - 1 ? 0 : pageIndex + 1));
  document.addEventListener('keydown', (event) => {
    if (!$('#bookStage').classList.contains('visible')) return;
    if (event.key === 'ArrowRight') showPage(pageIndex + 1);
    if (event.key === 'ArrowLeft') showPage(pageIndex - 1);
    if (event.key === 'Escape') $('#lightbox').classList.remove('open');
  });

  // Upload up to 13 local images, mapped in order to the scrapbook photo slots.
  $('#photoUpload').addEventListener('change', (event) => {
    const files = [...event.target.files].filter(file => file.type.startsWith('image/')).slice(0, 13);
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        $$(`[data-photo="${index}"]`).forEach(img => img.src = reader.result);
      };
      reader.readAsDataURL(file);
    });
    if (files.length) $('#photoUpload').parentElement.childNodes[0].textContent = `✓ ${files.length} photos loaded · `;
  });

  // Click any scrapbook image to open it in a lightbox.
  $$('.spread img').forEach(img => {
    img.addEventListener('click', () => {
      $('#lightboxImage').src = img.src;
      $('#lightbox').classList.add('open');
    });
  });
  $('#closeLightbox').addEventListener('click', () => $('#lightbox').classList.remove('open'));
  $('#lightbox').addEventListener('click', e => {
    if (e.target.id === 'lightbox') $('#lightbox').classList.remove('open');
  });

  // Music is optional; use a supplied MP3 URL, otherwise explain how to add one.
  $('#musicToggle').addEventListener('click', async () => {
    const button = $('#musicToggle');
    if (!config.musicUrl) {
      button.textContent = 'Add MP3 in js/config.js';
      return;
    }
    if (!audio) audio = new Audio(config.musicUrl);
    if (audio.paused) {
      try { await audio.play(); button.textContent = '♫ Music on'; }
      catch { button.textContent = 'Tap to enable music'; }
    } else {
      audio.pause(); button.textContent = '♫ Music off';
    }
  });

  function burstHearts(amount = 16) {
    for (let i = 0; i < amount; i++) {
      setTimeout(() => {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = ['♥', '♡', '✿', '✦'][Math.floor(Math.random() * 4)];
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.fontSize = `${14 + Math.random() * 20}px`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 4700);
      }, i * 75);
    }
  }
  $('#wishButton').addEventListener('click', () => burstHearts(28));

  // Simple touch swipe navigation for phones.
  let touchStartX = 0;
  $('#book').addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
  $('#book').addEventListener('touchend', e => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > 55) showPage(pageIndex + (delta < 0 ? 1 : -1));
  }, { passive: true });

  showPage(0);
})();
