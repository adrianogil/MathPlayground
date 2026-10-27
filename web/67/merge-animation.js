/* Cosmetic only: arithmetic still commits if animation is unavailable or cancelled. */
(function (root) {
  'use strict';
  async function animateMerge(board, first, second, destination, { reducedMotion = false, duration = 480 } = {}) {
    if (reducedMotion || !first || !second || !destination ||
        typeof first.animate !== 'function' || typeof second.animate !== 'function') return;
    const sources = [first, second], animations = [];
    let timeout;
    try {
      board.classList.add('is-merging');
      sources.forEach(element => element.classList.add('merge-source'));
      const target = destination.getBoundingClientRect();
      for (const element of sources) {
        const rect = element.getBoundingClientRect();
        const dx = target.left + target.width / 2 - rect.left - rect.width / 2;
        const dy = target.top + target.height / 2 - rect.top - rect.height / 2;
        const animation = element.animate([
          { transform: 'translate(0px, 0px) scale(1)', opacity: 1 },
          { transform: 'translate(0px, 0px) scale(1.05)', opacity: 1, offset: 0.24 },
          { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - (dx || dy ? 22 : 0)}px) scale(0.9)`, opacity: 0.85, offset: 0.65 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.7)`, opacity: 0, offset: 1 }
        ], { duration, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
        animations.push(animation);
        // Observe rejections even if a later element fails to start animating.
        animation.finished.catch(() => {});
      }
      // Never leave the controls locked if a background tab stalls its timeline.
      await Promise.race([
        Promise.allSettled(animations.map(animation => animation.finished)),
        new Promise(resolve => { timeout = setTimeout(resolve, duration + 250); })
      ]);
    } finally {
      clearTimeout(timeout);
      animations.forEach(animation => animation.cancel());
      sources.forEach(element => element.classList.remove('merge-source'));
      board.classList.remove('is-merging');
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { animateMerge };
  else root.SixtySevenMotion = { animateMerge };
})(typeof globalThis !== 'undefined' ? globalThis : this);
