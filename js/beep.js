const Beep = (() => {
  let ctx = null;

  function unlock() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch (_) {}
  }

  function _beep(freq, dur) {
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      const now = ctx.currentTime;
      osc.start(now);
      osc.stop(now + dur);
    } catch (_) {}
  }

  function play()     { _beep(880,  0.1); }
  function playLong() { _beep(1100, 0.6); }

  return { unlock, play, playLong };
})();
