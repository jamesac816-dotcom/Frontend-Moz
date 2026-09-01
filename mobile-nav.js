/**
 * Mobile Navigation Manager para ContaFácil MZ
 * 
 * Responsabilidades:
 * - Gerenciar drawer (menu lateral)
 * - Gerenciar bottom navigation
 * - Detectar tamanho da tela
 * - Adaptar UI baseado em breakpoints
 */

class MobileNavManager {
  constructor() {
    this.isMobileView = window.innerWidth <= 768;
    this.isTabletView = window.innerWidth > 768 && window.innerWidth <= 1024;
    this.drawerOpen = false;
    this.currentView = 'dashboard';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.syncVisibility();
    this.updateViewMode();
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('orientationchange', () => this.handleOrientationChange());
  }

  /**
   * Setup de event listeners
   */
  setupEventListeners() {
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', () => this.toggleDrawer());
    }

    // Overlay para fechar drawer
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeDrawer());
    }

    // Detectar tecla Escape para fechar drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawerOpen) {
        this.closeDrawer();
      }
    });

    // Click em nav items para fechar drawer
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (this.isMobileView) {
          this.closeDrawer();
        }
      });
    });
  }

  /**
   * Criar bottom navigation para mobile
   */
  isAppSessionActive() {
    const appScreen = document.getElementById('screen-app');
    const adminScreen = document.getElementById('screen-admin');
    const appActive = !!appScreen && appScreen.classList.contains('active');
    const adminActive = !!adminScreen && adminScreen.classList.contains('active');

    return !!(state && state.user) && appActive && !adminActive;
  }

  syncVisibility() {
    const appActive = this.isAppSessionActive();
    const bottomNav = document.querySelector('.bottom-nav');

    if (!appActive) {
      if (bottomNav) bottomNav.remove();
      return;
    }

    if (this.isMobileView && !bottomNav) {
      this.createBottomNav();
    }

    if (!this.isMobileView && bottomNav) {
      bottomNav.remove();
    }
  }

  createBottomNav() {
    if (!this.isAppSessionActive() || !this.isMobileView || document.querySelector('.bottom-nav')) {
      return;
    }

    const bottomNav = document.createElement('div');
    bottomNav.className = 'bottom-nav';
    bottomNav.innerHTML = `
      <div class="bottom-nav-inner">
        <a class="bottom-nav-item active" data-view="dashboard" onclick="MobileNav.switchView('dashboard')">
          <i class="fa-solid fa-gauge-high"></i>
          <span>Dashboard</span>
        </a>
        <a class="bottom-nav-item" data-view="vendas" onclick="MobileNav.switchView('vendas')">
          <i class="fa-solid fa-cash-register"></i>
          <span>Vendas</span>
        </a>
        <a class="bottom-nav-item" data-view="caixa" onclick="MobileNav.switchView('caixa')">
          <i class="fa-solid fa-vault"></i>
          <span>Caixa</span>
        </a>
        <a class="bottom-nav-item" data-view="menu" onclick="MobileNav.toggleDrawer()">
          <i class="fa-solid fa-bars"></i>
          <span>Menu</span>
        </a>
      </div>
    `;
    document.body.appendChild(bottomNav);
  }

  /**
   * Alternar drawer
   */
  toggleDrawer() {
    if (this.drawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  /**
   * Abrir drawer
   */
  openDrawer() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) {
      sidebar.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    if (overlay) {
      overlay.classList.add('show');
    }

    this.drawerOpen = true;
  }

  /**
   * Fechar drawer
   */
  closeDrawer() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) {
      sidebar.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (overlay) {
      overlay.classList.remove('show');
    }

    this.drawerOpen = false;
  }

  /**
   * Mudar view e atualizar bottom nav
   */
  switchView(viewName) {
    this.currentView = viewName;

    if (viewName !== 'menu') {
      // Chamar showView do init.js
      if (typeof showView === 'function') {
        showView(viewName);
      }
    }

    // Atualizar bottom nav
    this.updateBottomNavActive();

    // Fechar drawer se aberto
    if (this.drawerOpen && this.isMobileView) {
      this.closeDrawer();
    }
  }

  /**
   * Atualizar qual item está ativo no bottom nav
   */
  updateBottomNavActive() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
      const itemView = item.getAttribute('data-view');
      if (itemView === this.currentView) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Detectar modo (mobile/tablet/desktop)
   */
  updateViewMode() {
    const newIsMobileView = window.innerWidth <= 768;
    const newIsTabletView = window.innerWidth > 768 && window.innerWidth <= 1024;

    this.isMobileView = newIsMobileView;
    this.isTabletView = newIsTabletView;

    this.syncVisibility();

    if (!this.isMobileView && this.drawerOpen) {
      this.closeDrawer();
    }

    // Atualizar padding para safe areas
    this.updateSafeAreaPadding();
  }

  /**
   * Gerenciar padding para safe areas (notch, home indicator)
   */
  updateSafeAreaPadding() {
    const isStandalone = window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) {
      document.documentElement.classList.add('pwa-standalone');
    }
  }

  /**
   * Handle resize
   */
  handleResize() {
    this.updateViewMode();
  }

  /**
   * Handle orientation change
   */
  handleOrientationChange() {
    setTimeout(() => {
      this.updateViewMode();
      // Fechar drawer após mudança de orientação
      if (this.drawerOpen) {
        this.closeDrawer();
      }
    }, 100);
  }

  /**
   * Método público para toggle drawer (chamado do hamburger)
   */
  static toggleSidebar(open) {
    if (open !== undefined) {
      if (open) {
        MobileNav.openDrawer();
      } else {
        MobileNav.closeDrawer();
      }
    } else {
      MobileNav.toggleDrawer();
    }
  }

  /**
   * Otimizar tabelas para mobile
   */
  optimizeTablesForMobile() {
    if (!this.isMobileView) return;

    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.style.overflowX = 'auto';
      wrapper.style.WebkitOverflowScrolling = 'touch';

      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  /**
   * Gerenciar visibilidade de colunas baseado em screen size
   */
  manageColumnVisibility() {
    if (this.isMobileView) {
      // Ocultar colunas menos importantes em 320px-480px
      const columnsToHide = document.querySelectorAll('.column-desktop');
      columnsToHide.forEach(col => {
        col.style.display = 'none';
      });
    } else {
      // Mostrar todas as colunas em telas maiores
      const columnsToShow = document.querySelectorAll('.column-desktop');
      columnsToShow.forEach(col => {
        col.style.display = '';
      });
    }
  }

  /**
   * Ajustar altura de modals para mobile
   */
  adjustModalsForMobile() {
    if (!this.isMobileView) return;

    const modalBoxes = document.querySelectorAll('.modal-box');
    modalBoxes.forEach(box => {
      const maxHeight = window.innerHeight * 0.85;
      box.style.maxHeight = maxHeight + 'px';
    });
  }

  /**
   * Detectar device específico
   */
  getDeviceInfo() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    const isTouch = () => {
      try {
        document.createEvent('TouchEvent');
        return true;
      } catch (e) {
        return false;
      }
    };

    return {
      width,
      height,
      orientation,
      isTouchDevice: isTouch(),
      hasNotch: CSS.supports('padding: max(0px)'),
      isStandalone: window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches
    };
  }

  /**
   * Log device info para debug
   */
  debugDeviceInfo() {
    const info = this.getDeviceInfo();
    console.log('[MobileNav] Device Info:', {
      ...info,
      userAgent: navigator.userAgent,
      pixelRatio: window.devicePixelRatio,
      viewportScale: window.visualViewport?.scale || 1
    });
  }
}

// Instanciar globalmente
let MobileNav;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MobileNav = new MobileNavManager();
    window.MobileNav = MobileNav;
  });
} else {
  MobileNav = new MobileNavManager();
  window.MobileNav = MobileNav;
}

/**
 * Função global para toggle sidebar (compatível com HTML inline onclick)
 */
function toggleSidebar(open) {
  if (!MobileNav) return;

  if (typeof MobileNav.toggleSidebar === 'function') {
    MobileNav.toggleSidebar(open);
    return;
  }

  if (typeof MobileNav.constructor?.toggleSidebar === 'function') {
    MobileNav.constructor.toggleSidebar(open);
    return;
  }

  if (typeof MobileNav.toggleDrawer === 'function') {
    MobileNav.toggleDrawer();
  }
}

/**
 * Função global para switch view via bottom nav
 */
function switchToView(viewName) {
  if (MobileNav) {
    MobileNav.switchView(viewName);
  }
}
