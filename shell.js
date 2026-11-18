/**
 * Sangar Studio OS — Shared App Shell Controller
 * Handles theme toggling (light/dark/system), collapsible sidebar & mobile drawer,
 * contextual greeting, notifications popover, command palette (<dialog>), and toasts.
 */

(() => {
  const THEME_STORAGE_KEY = 'sg-theme';
  const SIDEBAR_STORAGE_KEY = 'sg-sidebar-collapsed';
  const NOTIF_STORAGE_KEY = 'sg-read-notifs';

  // Offline SVG fallback paths (24x24 Lucide geometry) in case CDN is unavailable offline
  const FALLBACK_SVG_PATHS = {
    'sparkles': '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    'clapperboard': '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    'gem': '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    'wand-sparkles': '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/>',
    'film': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    'cpu': '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    'menu': '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    'panel-left-close': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
    'panel-left-open': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>',
    'copy': '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    'sliders-horizontal': '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'chevrons-up-down': '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    'zap': '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'terminal': '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    'code-2': '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
    'eye': '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>'
  };

  let searchCatalog = [];
  let activeScope = 'all';
  let selectedCmdIndex = 0;

  /**
   * Render Lucide icons with graceful offline SVG fallback
   */
  function renderIcons(root = document) {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try {
        window.lucide.createIcons();
        return;
      } catch (_) {
        // Fallback below
      }
    }

    const targets = root.querySelectorAll('i[data-lucide]');
    targets.forEach((el) => {
      const name = el.getAttribute('data-lucide');
      const inner = FALLBACK_SVG_PATHS[name];
      if (!inner) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.9');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      if (el.className) svg.setAttribute('class', `lucide lucide-${name} ${el.className}`);
      else svg.setAttribute('class', `lucide lucide-${name}`);
      svg.innerHTML = inner;
      el.replaceWith(svg);
    });
  }

  /**
   * Theme Management (Light / Dark / System via localStorage 'sg-theme')
   */
  function getSystemScheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getStoredTheme() {
    try {
      const val = localStorage.getItem(THEME_STORAGE_KEY);
      return val === 'light' || val === 'dark' ? val : null;
    } catch (_) {
      return null;
    }
  }

  function applyTheme(storedTheme) {
    const html = document.documentElement;
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      html.setAttribute('data-theme', storedTheme);
      if (meta) meta.setAttribute('content', storedTheme);
    } else {
      html.removeAttribute('data-theme');
      if (meta) meta.setAttribute('content', 'light dark');
    }

    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
      const effective = storedTheme || getSystemScheme();
      const nextLabel = effective === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      toggleBtn.setAttribute('aria-label', nextLabel);
      toggleBtn.setAttribute('aria-pressed', String(effective === 'dark'));
    }
  }

  function initTheme() {
    applyTheme(getStoredTheme());

    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentRendered = getStoredTheme() || getSystemScheme();
        const target = currentRendered === 'dark' ? 'light' : 'dark';
        const system = getSystemScheme();

        try {
          if (target === system) {
            localStorage.removeItem(THEME_STORAGE_KEY);
            applyTheme(null);
          } else {
            localStorage.setItem(THEME_STORAGE_KEY, target);
            applyTheme(target);
          }
        } catch (_) {
          applyTheme(target);
        }
      });
    }

    // Keep in sync across browser tabs
    window.addEventListener('storage', (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        applyTheme(getStoredTheme());
      }
    });

    // Update toggle aria state if OS theme changes while following system
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if (!getStoredTheme()) applyTheme(null);
    });
  }

  /**
   * Contextual Greeting based on time of day
   */
  function initGreeting() {
    const el = document.getElementById('topbar-greeting');
    if (!el) return;
    const hour = new Date().getHours();
    let greeting = 'Buenas noches';
    if (hour >= 6 && hour < 13) greeting = 'Buenos días';
    else if (hour >= 13 && hour < 20) greeting = 'Buenas tardes';
    el.textContent = `${greeting}, Sangar Studio`;
  }

  /**
   * Collapsible Sidebar (Desktop) & Drawer (Mobile <= 992px)
   */
  function initSidebar() {
    const collapseBtn = document.getElementById('btn-sidebar-collapse');
    const mobileToggle = document.getElementById('btn-sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    const mainEl = document.querySelector('.sg-main');
    const sidebar = document.getElementById('sg-sidebar');
    const mobileQuery = window.matchMedia('(max-width: 992px)');

    // Restore collapsed state on desktop
    try {
      if (localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true' && !mobileQuery.matches) {
        document.body.classList.add('sidebar-collapsed');
      }
    } catch (_) {}

    function syncCollapseIcon() {
      if (!collapseBtn) return;
      const collapsed = document.body.classList.contains('sidebar-collapsed');
      collapseBtn.setAttribute('aria-expanded', String(!collapsed));
      collapseBtn.setAttribute('aria-label', collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral');
      collapseBtn.innerHTML = `<i data-lucide="${collapsed ? 'panel-left-open' : 'panel-left-close'}"></i>`;
      renderIcons(collapseBtn);
    }

    syncCollapseIcon();

    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        const next = !document.body.classList.contains('sidebar-collapsed');
        document.body.classList.toggle('sidebar-collapsed', next);
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
        } catch (_) {}
        syncCollapseIcon();
      });
    }

    function openMobileDrawer() {
      document.body.classList.add('sidebar-open');
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
      if (mainEl) mainEl.inert = true;
      if (sidebar && mobileQuery.matches) {
        sidebar.setAttribute('role', 'dialog');
        sidebar.setAttribute('aria-modal', 'true');
        const firstLink = sidebar.querySelector('.sg-nav__item, button, a');
        if (firstLink) firstLink.focus({ preventScroll: true });
      }
    }

    function closeMobileDrawer(restoreFocus = true) {
      if (!document.body.classList.contains('sidebar-open')) return;
      document.body.classList.remove('sidebar-open');
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      if (mainEl) mainEl.inert = false;
      if (sidebar) {
        sidebar.removeAttribute('role');
        sidebar.removeAttribute('aria-modal');
      }
      if (restoreFocus && mobileToggle && mobileQuery.matches) {
        mobileToggle.focus({ preventScroll: true });
      }
    }

    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        if (document.body.classList.contains('sidebar-open')) {
          closeMobileDrawer(true);
        } else {
          openMobileDrawer();
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => closeMobileDrawer(true));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
        closeMobileDrawer(true);
      }
    });

    mobileQuery.addEventListener('change', (e) => {
      if (!e.matches) closeMobileDrawer(false);
    });

    // Expose close helper for tab switches
    window.SangarShell = window.SangarShell || {};
    window.SangarShell.closeMobileDrawer = () => closeMobileDrawer(false);
  }

  /**
   * Notifications / Studio Tips Popover
   */
  function initNotificationsPopover() {
    const btn = document.getElementById('btn-notifications');
    const panel = document.getElementById('notifications-popover');
    const markReadBtn = document.getElementById('btn-mark-notifs-read');
    const badge = document.getElementById('notif-badge');
    if (!btn || !panel) return;

    function syncReadState() {
      let readIds = [];
      try {
        readIds = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
      } catch (_) {}

      const items = panel.querySelectorAll('.sg-notif-item[data-notif-id]');
      let unreadCount = 0;
      items.forEach((item) => {
        const id = item.getAttribute('data-notif-id');
        const isRead = readIds.includes(id);
        item.classList.toggle('is-read', isRead);
        if (!isRead) unreadCount++;
      });

      if (badge) {
        badge.textContent = String(unreadCount);
        badge.hidden = unreadCount === 0;
      }
    }

    function setOpen(open) {
      panel.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        const firstInteractive = panel.querySelector('button, a');
        if (firstInteractive) firstInteractive.focus({ preventScroll: true });
      }
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!panel.classList.contains('is-open'));
    });

    panel.querySelectorAll('.sg-notif-item[data-notif-id]').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-notif-id');
        try {
          const readIds = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
          if (!readIds.includes(id)) {
            readIds.push(id);
            localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(readIds));
          }
        } catch (_) {}
        syncReadState();
        setOpen(false);
      });
    });

    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        const ids = Array.from(panel.querySelectorAll('.sg-notif-item[data-notif-id]'))
          .map((el) => el.getAttribute('data-notif-id'));
        try {
          localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(ids));
        } catch (_) {}
        syncReadState();
        showToast('Notificaciones marcadas como leídas', 'success');
      });
    }

    document.addEventListener('click', (e) => {
      if (panel.classList.contains('is-open') && !panel.contains(e.target) && !btn.contains(e.target)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
        btn.focus({ preventScroll: true });
      }
    });

    syncReadState();
  }

  /**
   * Command Palette (<dialog id="cmd-palette">)
   */
  function initCommandPalette() {
    const dialog = document.getElementById('cmd-palette');
    const openBtns = document.querySelectorAll('[data-open-cmd]');
    const input = document.getElementById('cmd-palette-input');
    const resultsEl = document.getElementById('cmd-palette-results');
    const scopeBtns = document.querySelectorAll('#cmd-palette-scopes .sg-filter-pill');
    const closeBtn = document.getElementById('cmd-palette-close');

    if (!dialog || !input || !resultsEl) return;

    function openPalette() {
      if (!dialog.open) {
        dialog.showModal();
      }
      input.value = '';
      renderCmdResults();
      requestAnimationFrame(() => input.focus());
    }

    function closePalette() {
      if (dialog.open) dialog.close();
    }

    openBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openPalette();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closePalette);
    }

    // Light dismiss fallback for browsers without <dialog closedby="any"> (e.g. Safari)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e)) closePalette();
      });
    }

    // Keyboard shortcut Cmd+K / Ctrl+K
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialog.open) closePalette();
        else openPalette();
      }
    });

    scopeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        scopeBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeScope = btn.getAttribute('data-scope') || 'all';
        selectedCmdIndex = 0;
        renderCmdResults();
        input.focus();
      });
    });

    input.addEventListener('input', () => {
      selectedCmdIndex = 0;
      renderCmdResults();
    });

    input.addEventListener('keydown', (e) => {
      const items = resultsEl.querySelectorAll('.sg-cmd-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedCmdIndex = (selectedCmdIndex + 1) % items.length;
        updateSelectedHighlight(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedCmdIndex = (selectedCmdIndex - 1 + items.length) % items.length;
        updateSelectedHighlight(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = items[selectedCmdIndex];
        if (activeItem) activeItem.click();
      }
    });

    function updateSelectedHighlight(items) {
      items.forEach((item, idx) => {
        item.classList.toggle('is-selected', idx === selectedCmdIndex);
        if (idx === selectedCmdIndex) {
          item.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    function renderCmdResults() {
      const q = input.value.trim().toLowerCase();
      const filtered = searchCatalog.filter((entry) => {
        const matchesScope = activeScope === 'all' || entry.scope === activeScope;
        const matchesQuery = !q ||
          entry.title.toLowerCase().includes(q) ||
          (entry.subtitle && entry.subtitle.toLowerCase().includes(q)) ||
          (entry.keywords && entry.keywords.toLowerCase().includes(q));
        return matchesScope && matchesQuery;
      }).slice(0, 14);

      resultsEl.innerHTML = '';

      if (filtered.length === 0) {
        resultsEl.innerHTML = `
          <div class="sg-cmd-empty">
            No se encontraron resultados para "<strong>${escapeHtml(input.value)}</strong>"
          </div>
        `;
        return;
      }

      filtered.forEach((entry, idx) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = `sg-cmd-item${idx === selectedCmdIndex ? ' is-selected' : ''}`;
        row.innerHTML = `
          <span class="sg-cmd-item__icon"><i data-lucide="${entry.icon || 'sparkles'}"></i></span>
          <span class="sg-cmd-item__body">
            <span class="sg-cmd-item__title">${escapeHtml(entry.title)}</span>
            ${entry.subtitle ? `<span class="sg-cmd-item__sub">${escapeHtml(entry.subtitle)}</span>` : ''}
          </span>
          <span class="sg-badge sg-badge--neutral">${escapeHtml(entry.badge || entry.scope)}</span>
        `;
        row.addEventListener('click', () => {
          closePalette();
          if (typeof entry.action === 'function') entry.action();
        });
        resultsEl.appendChild(row);
      });

      renderIcons(resultsEl);
    }

    window.SangarShell = window.SangarShell || {};
    window.SangarShell.openCommandPalette = openPalette;
  }

  /**
   * Register items for the Command Palette
   */
  function registerSearchItems(items) {
    if (!Array.isArray(items)) return;
    const existingIds = new Set(searchCatalog.map((i) => i.id));
    items.forEach((item) => {
      if (!existingIds.has(item.id)) {
        searchCatalog.push(item);
        existingIds.add(item.id);
      }
    });
  }

  /**
   * Toast Notification System (.sg-toast-wrap + aria-live)
   */
  function showToast(message, variant = 'default') {
    const wrap = document.getElementById('sg-toast-wrap');
    const live = document.getElementById('sg-live-announcer');

    if (live) {
      live.textContent = '';
      requestAnimationFrame(() => {
        live.textContent = message;
      });
    }

    if (!wrap) return;

    const toast = document.createElement('div');
    let variantClass = '';
    let iconName = 'check';

    if (variant === 'success') {
      variantClass = ' sg-toast--success';
      iconName = 'check';
    } else if (variant === 'danger') {
      variantClass = ' sg-toast--danger';
      iconName = 'alert-triangle';
    } else if (variant === 'info') {
      iconName = 'info';
    }

    toast.className = `sg-toast${variantClass}`;
    toast.innerHTML = `
      <i data-lucide="${iconName}" aria-hidden="true"></i>
      <span>${escapeHtml(message)}</span>
    `;

    wrap.appendChild(toast);
    renderIcons(toast);

    // Keep max 3 visible toasts
    while (wrap.children.length > 3) {
      wrap.removeChild(wrap.firstElementChild);
    }

    setTimeout(() => {
      toast.classList.add('is-leaving');
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initGreeting();
    initSidebar();
    initNotificationsPopover();
    initCommandPalette();
    renderIcons();
  });

  window.SangarShell = Object.assign(window.SangarShell || {}, {
    renderIcons,
    registerSearchItems,
    showToast,
    escapeHtml
  });
})();
