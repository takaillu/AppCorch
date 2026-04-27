const Beep = (() => {
  let ctx = null;

  function unlock() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      // iOS Safari のロック解除：無音バッファを再生する
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch (_) {}
  }

  function play() {
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      const now = ctx.currentTime;
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  return { unlock, play };
})();
