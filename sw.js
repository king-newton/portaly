const CACHE_NAME = 'portaly-v1';

// 安裝 Service Worker 時，預先快取重要的檔案
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 在這裡列出即使離線也必須存在的檔案
      return cache.addAll([
        'index.html',
        'manifest.json',
        'icon-192.png',
        'icon-512.png'
      ]);
    })
  );
});

// 攔截請求，執行網路優先策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 如果網路連線成功，則更新快取並回傳最新內容
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // 如果網路失敗 (例如離線)，則從快取讀取備份
        return caches.match(event.request);
      })
  );
});

// 清理舊的快取 (當您更新 CACHE_NAME 時，這會自動移除舊版)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
