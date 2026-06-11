/* 炼伴 ForgeMate · 页面动效
   滚动渐显 / 数字滚动 / 聊天气泡打字 / 阅读进度条
   prefers-reduced-motion 时全部退化为直接显示 */
(() => {
  const root = document.documentElement;
  root.classList.add('js');

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('no-anim');
    return;
  }

  /* ── 顶部阅读进度条 ── */
  const bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);
  const onScroll = () => {
    const max = root.scrollHeight - root.clientHeight;
    bar.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 滚动渐显 ── */
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  /* 子元素依次错峰出现 */
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    [...parent.children].forEach((c, i) => {
      c.style.transitionDelay = `${i * 110}ms`;
    });
  });

  /* ── 数字滚动 ── */
  const cio = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      cio.unobserve(e.target);
      const el = e.target;
      const end = +el.dataset.count;
      const dur = 1200;
      const t0 = performance.now();
      const tick = t => {
        const k = Math.min(1, (t - t0) / dur);
        const ease = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(end * ease);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* ── 聊天演示：气泡逐条出现，教练先「打字」── */
  const chat = document.querySelector('.chat-demo');
  if (chat) {
    const bubbles = [...chat.querySelectorAll('.bubble')];
    bubbles.forEach(b => b.classList.add('hide'));
    const chatIO = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      chatIO.disconnect();
      let delay = 300;
      const TYPE = 950;
      bubbles.forEach(b => {
        if (b.classList.contains('coach')) {
          const html = b.innerHTML;
          setTimeout(() => {
            b.classList.remove('hide');
            b.classList.add('typing');
            b.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
            setTimeout(() => {
              b.classList.remove('typing');
              b.innerHTML = html;
            }, TYPE);
          }, delay);
          delay += TYPE + 750;
        } else {
          setTimeout(() => b.classList.remove('hide'), delay);
          delay += 700;
        }
      });
    }, { threshold: 0.35 });
    chatIO.observe(chat);
  }
})();
