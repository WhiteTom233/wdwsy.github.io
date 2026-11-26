(() => {
  const entry = document.getElementById('blog-editor-entry');
  if (!entry || entry.dataset.ready) return;

  const editorOrigin = entry.dataset.origin;
  if (editorOrigin === location.origin || !entry.dataset.post) return;
  entry.dataset.ready = 'true';
  const button = entry.querySelector('button');
  const footer = document.querySelector('.footer-inner') || document.querySelector('footer');
  footer?.append(entry);
  entry.hidden = false;

  const panel = document.createElement('aside');
  panel.hidden = true;
  panel.id = 'blog-editor-panel';
  panel.setAttribute('aria-label', '文章编辑');
  const frame = document.createElement('iframe');
  frame.title = '博客作者编辑器';
  frame.referrerPolicy = 'strict-origin';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals');
  panel.append(frame);
  document.body.append(panel);

  function closePanel() {
    panel.hidden = true;
    document.body.classList.remove('blog-editor-open');
    button.setAttribute('aria-expanded', 'false');
    button.focus({ preventScroll: true });
  }

  function requestClose() {
    frame.contentWindow?.postMessage('blog-editor:request-close', editorOrigin);
  }

  button.addEventListener('click', () => {
    if (!panel.hidden) {
      requestClose();
      return;
    }
    if (!frame.hasAttribute('src')) {
      const current = new URL(location.pathname, location.origin);
      const frameUrl = new URL('/editor.html', editorOrigin);
      frameUrl.searchParams.set('post', entry.dataset.post);
      frameUrl.searchParams.set('article', current.href);
      frame.src = frameUrl.href;
    }
    panel.hidden = false;
    document.body.classList.add('blog-editor-open');
    button.setAttribute('aria-expanded', 'true');
    frame.focus();
  });

  window.addEventListener('message', (event) => {
    if (event.origin !== editorOrigin || event.source !== frame.contentWindow) return;
    if (event.data === 'blog-editor:close') closePanel();
    if (event.data === 'blog-editor:signed-in') button.textContent = '编辑文章';
    if (event.data === 'blog-editor:signed-out') button.textContent = '作者登录';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) requestClose();
  });
})();
