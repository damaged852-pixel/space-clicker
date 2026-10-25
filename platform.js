'use strict';
// Платформа: ВКонтакте / Одноклассники (VK Bridge, vk-bridge.min.js подключается в index.html)
(function () {
  const bridge = window.vkBridge;
  const SAVE_KEY = 'save';

  // Вне VK bridge может не ответить вовсе — не даём игре зависнуть
  function send(method, params, timeoutMs) {
    if (!bridge) return Promise.reject(new Error('no vkBridge'));
    return Promise.race([
      bridge.send(method, params || {}),
      new Promise((_, reject) => setTimeout(() => reject(new Error(method + ' timeout')), timeoutMs || 4000)),
    ]);
  }

  function preload(format) {
    send('VKWebAppCheckNativeAds', { ad_format: format }).catch(() => {});
  }

  async function show(format) {
    try {
      const r = await send('VKWebAppShowNativeAds', { ad_format: format }, 120000);
      return !!(r && r.result);
    } catch (e) {
      return false;
    } finally {
      preload(format);
    }
  }

  window.Platform = {
    name: 'vk',
    async init(handlers) {
      handlers = handlers || {};
      if (!bridge) return;
      bridge.subscribe((e) => {
        const type = e.detail && e.detail.type;
        if (type === 'VKWebAppViewHide' && handlers.onPause) handlers.onPause();
        if (type === 'VKWebAppViewRestore' && handlers.onResume) handlers.onResume();
      });
      try { await send('VKWebAppInit'); } catch (e) { console.warn('VKWebAppInit failed', e); }
      preload('interstitial');
      preload('reward');
    },
    lang() {
      return new URLSearchParams(location.search).get('vk_language') || navigator.language;
    },
    ready() {},
    gameStart() {},
    gameStop() {},
    showInterstitial() { return show('interstitial'); },
    showRewarded() { return show('reward'); },
    async loadData() {
      try {
        const r = await send('VKWebAppStorageGet', { keys: [SAVE_KEY] });
        const item = r && r.keys && r.keys[0];
        return item && item.value ? item.value : null;
      } catch (e) {
        return null;
      }
    },
    async saveData(json) {
      try { await send('VKWebAppStorageSet', { key: SAVE_KEY, value: json }); } catch (e) { /* не критично */ }
    },
  };
})();
