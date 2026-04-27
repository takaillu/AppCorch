const Speech = (() => {
  let enabled = false;

  function unlock() {
    if (enabled) return;
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    enabled = true;
  }

  function speak(text) {
    if (!enabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }

  return { unlock, speak };
})();
