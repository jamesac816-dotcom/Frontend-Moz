/**
 * PWA Initialization Script para ContaFácil MZ
 * 
 * Responsabilidades:
 * - Registar Service Worker
 * - Detectar instalação e modo standalone
 * - Gerenciar atualizações
 * - Detectar conectividade
 * - Mostrar indicadores de status
 */

class ContaFacilPWA {
  constructor() {
    this.serviceWorkerRegistration = null;
    this.isOnline = navigator.onLine;
    this.isStandalone = this.detectStandalone();
    this.init();
  }

  /**
   * Inicializar PWA
   */
  async init() {
    try {
      // Registar Service Worker
      await this.registerServiceWorker();

      // Configurar listeners de conectividade
      this.setupConnectivityListeners();

      // Configurar update checks
      this.setupUpdateChecks();

      // Inicializar UI adaptada
      this.adaptUIForMode();

      console.log('[PWA] ContaFácil MZ inicializado com sucesso');
    } catch (error) {
      console.error('[PWA] Erro ao inicializar:', error);
    }
  }

  /**
   * Registar Service Worker
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Workers não suportados');
      return;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register(
        '/service-worker.js',
        {
          scope: '/',
          updateViaCache: 'none' // Sempre verificar atualizações
        }
      );

      console.log('[PWA] Service Worker registado:', this.serviceWorkerRegistration);

      // Ouvir updates
      this.setupServiceWorkerUpdates();
    } catch (error) {
      console.error('[PWA] Erro ao registar Service Worker:', error);
    }
  }

  /**
   * Configurar detecção de atualizações do SW
   */
  setupServiceWorkerUpdates() {
    if (!this.serviceWorkerRegistration) return;

    // Verificar updates a cada hora
    setInterval(() => {
      this.serviceWorkerRegistration.update();
    }, 60 * 60 * 1000);

    // Ouvir updates
    this.serviceWorkerRegistration.addEventListener('updatefound', () => {
      const newWorker = this.serviceWorkerRegistration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Nova versão disponível
          this.showUpdateNotification();
        }
      });
    });
  }

  /**
   * Mostrar notificação de atualização
   */
  showUpdateNotification() {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">🔄</span>
        <div class="notification-text">
          <p class="notification-title">Atualização disponível</p>
          <p class="notification-message">Uma nova versão do ContaFácil MZ está disponível.</p>
        </div>
        <button class="notification-button" onclick="window.PWAManager.updateApp()">
          Atualizar
        </button>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remover após 10 segundos
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 10000);
  }

  /**
   * Atualizar app (recarregar com novo SW)
   */
  async updateApp() {
    if (this.serviceWorkerRegistration?.waiting) {
      // Informar novo SW para skip waiting
      this.serviceWorkerRegistration.waiting.postMessage({
        type: 'SKIP_WAITING'
      });

      // Recarregar quando novo SW ativa
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        location.reload();
      });
    }
  }

  /**
   * Detectar modo standalone (app instalada)
   */
  detectStandalone() {
    // Detectar várias formas de instalação
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      console.log('[PWA] Modo standalone detectado');
      document.documentElement.classList.add('pwa-standalone');
    }

    return isStandalone;
  }

  /**
   * Adaptar UI para modo (standalone vs browser)
   */
  adaptUIForMode() {
    if (this.isStandalone) {
      // Em modo standalone, pode remover elementos desnecessários
      // Por exemplo, aviso de instalar como app
      document.documentElement.style.paddingTop = 'env(safe-area-inset-top)';
      document.documentElement.style.paddingBottom = 'env(safe-area-inset-bottom)';
      document.documentElement.style.paddingLeft = 'env(safe-area-inset-left)';
      document.documentElement.style.paddingRight = 'env(safe-area-inset-right)';
    }
  }

  /**
   * Configurar listeners de conectividade
   */
  setupConnectivityListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleConnectionRestored();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleConnectionLost();
    });
  }

  /**
   * Quando conexão é perdida
   */
  handleConnectionLost() {
    console.log('[PWA] Conexão perdida');
    document.documentElement.classList.add('offline-mode');
    this.showConnectivityIndicator('Sem conexão', false);
  }

  /**
   * Quando conexão é restaurada
   */
  handleConnectionRestored() {
    console.log('[PWA] Conexão restaurada');
    document.documentElement.classList.remove('offline-mode');
    this.showConnectivityIndicator('Conexão restaurada', true);

    // Remover indicador após 3 segundos
    setTimeout(() => {
      const indicator = document.querySelector('.pwa-connectivity-indicator');
      if (indicator) {
        indicator.classList.add('fade-out');
        setTimeout(() => indicator.remove(), 300);
      }
    }, 3000);
  }

  /**
   * Mostrar indicador de conectividade
   */
  showConnectivityIndicator(message, isOnline) {
    // Remover indicador anterior se existir
    const existing = document.querySelector('.pwa-connectivity-indicator');
    if (existing) existing.remove();

    const indicator = document.createElement('div');
    indicator.className = 'pwa-connectivity-indicator';
    if (isOnline) indicator.classList.add('online');
    indicator.textContent = message;

    document.body.appendChild(indicator);
  }

  /**
   * Configurar checks periódicos
   */
  setupUpdateChecks() {
    if (!this.serviceWorkerRegistration) return;

    // Verificar updates a cada 30 minutos
    setInterval(() => {
      this.serviceWorkerRegistration.update().catch(err => {
        console.warn('[PWA] Erro ao verificar updates:', err);
      });
    }, 30 * 60 * 1000);
  }

  /**
   * Métodos públicos para usar em templates
   */
  isAppInstalled() {
    return this.isStandalone;
  }

  isOnlineStatus() {
    return this.isOnline;
  }

  getSafeAreaInsets() {
    const styles = getComputedStyle(document.documentElement);
    return {
      top: styles.getPropertyValue('--safe-area-inset-top') || '0',
      right: styles.getPropertyValue('--safe-area-inset-right') || '0',
      bottom: styles.getPropertyValue('--safe-area-inset-bottom') || '0',
      left: styles.getPropertyValue('--safe-area-inset-left') || '0'
    };
  }
}

// Inicializar PWA Manager globalmente
let PWAManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    PWAManager = new ContaFacilPWA();
  });
} else {
  PWAManager = new ContaFacilPWA();
}

// Exportar para uso global
window.PWAManager = PWAManager;
