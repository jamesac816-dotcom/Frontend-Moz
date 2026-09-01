/**
 * Service Worker para ContaFácil MZ
 * Implementação segura de cache e offline functionality
 * 
 * IMPORTANTE: Dados financeiros sensíveis não devem ser cacheados.
 * Apenas recursos estáticos e UI são cacheados.
 */

const CACHE_NAME = 'contafacil-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts/init.js',
  '/scripts/navegacao.js',
  '/scripts/dashboard.js',
  '/scripts/vendas.js',
  '/scripts/caixa.js',
  '/scripts/clientes.js',
  '/scripts/produtos-estoque.js',
  '/scripts/financeiro.js',
  '/scripts/relatorios.js',
  '/scripts/perfil-config.js',
  '/scripts/admin.js',
  '/scripts/auth.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints que NÃO devem ser cacheados (dados dinâmicos/sensíveis)
const NO_CACHE_PATTERNS = [
  '/api/auth',
  '/api/vendas',
  '/api/caixa',
  '/api/pagamentos',
  '/api/clientes',
  '/api/produtos',
  '/api/estoque',
  '/api/financeiro',
  '/api/dashboard',
  '/api/relatorios',
  '/api/transacoes',
  '/api/imobilizado',
  '/api/compras',
  '/api/fornecedores',
  '/api/funcionarios',
  '/api/notificacoes',
  '/api/user_plans'
];

/**
 * Verificar se uma URL deve ser cacheada
 */
function shouldCache(url) {
  // URLs de API dinâmicas não são cacheadas
  if (NO_CACHE_PATTERNS.some(pattern => url.includes(pattern))) {
    return false;
  }
  // Recursos externos (CDN, Google Fonts) não são cacheados por padrão
  if (url.includes('cdn.') || url.includes('googleapis') || url.includes('cdnjs')) {
    return false;
  }
  return true;
}

/**
 * Install: Cachear recursos estáticos principais
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cachear apenas recursos estáticos críticos
        return cache.addAll(STATIC_ASSETS.filter(asset => {
          // Filtrar recursos que realmente existem
          return !asset.includes('/icons/') || asset.includes('192x192');
        })).catch(err => {
          console.warn('[SW] Erro ao cachear alguns assets:', err);
          // Continuar mesmo se alguns assets falharem
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

/**
 * Activate: Limpar caches antigos
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch: Estratégia Network First com Fallback para Cache
 * - Tenta rede primeiro (melhor para dados dinâmicos)
 * - Se falhar, tenta cache
 * - Se ambos falharem, mostra página offline
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Apenas GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Não intercepção de requisições para outros domínios (exceto assets CDN permitidos)
  if (url.origin !== self.location.origin) {
    // Permitir apenas recursos de CDN conhecidos
    if (!url.hostname.includes('googleapis.com') && 
        !url.hostname.includes('cdnjs.cloudflare.com') &&
        !url.hostname.includes('cdn.jsdelivr.net') &&
        !url.hostname.includes('fonts.gstatic.com')) {
      return;
    }
  }

  // Estratégia: Network First para APIs, Cache First para assets
  if (url.pathname.includes('/api/')) {
    handleNetworkFirstForAPI(event);
  } else {
    handleCacheFirstForAssets(event);
  }
});

/**
 * Network First para APIs: tenta rede, depois cache
 */
function handleNetworkFirstForAPI(event) {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Verificar resposta válida
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Não cachear respostas de API (dados dinâmicos/sensíveis)
        return response;
      })
      .catch(err => {
        // Se rede falhar, tentar cache apenas para GETs
        if (event.request.method === 'GET') {
          return caches.match(event.request);
        }
        // Se não estiver em cache, retornar página offline
        return caches.match('/offline.html')
          .then(response => response || new Response('Sem conexão', { status: 503 }));
      })
  );
}

/**
 * Cache First para Assets: tenta cache, depois rede
 */
function handleCacheFirstForAssets(event) {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {
            // Verificar resposta válida
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cachear assets estáticos
            if (shouldCache(event.request.url)) {
              const cacheCopy = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, cacheCopy);
              });
            }

            return response;
          })
          .catch(err => {
            // Se ambos falharem, tentar cache ou offline
            return caches.match(event.request)
              .then(cachedResponse => {
                return cachedResponse || caches.match('/offline.html')
                  .then(offlineResponse => offlineResponse || new Response('Recurso não disponível', { status: 503 }));
              });
          });
      })
  );
}

/**
 * Message Handler: comunicação com cliente
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});

/**
 * Background Sync: sincronizar vendas quando offline
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-vendas') {
    event.waitUntil(
      // Implementar sincronização de vendas pendentes
      Promise.resolve()
    );
  }
});

/**
 * Push Notifications
 */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'ContaFácil MZ',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'contafacil-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('ContaFácil MZ', options)
  );
});

/**
 * Notification Click
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Se a app já está aberta, focar nela
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão, abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
