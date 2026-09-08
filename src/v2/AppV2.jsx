import { useEffect, useState } from 'react';
import './v2.css';
import { DEFAULT_WIDGETS, PAGE_DEFINITIONS } from './config/workspace';
import WidgetShell from './components/WidgetShell';
import { WIDGETS } from './widgets/registry';

const THEME_PRESETS = [
  { id: 'blue', label: 'Vion Blue', color: '#4f6bff' },
  { id: 'indigo', label: 'Indigo', color: '#6655d9' },
  { id: 'emerald', label: 'Emerald', color: '#159570' },
  { id: 'rose', label: 'Rose', color: '#d85d82' },
  { id: 'amber', label: 'Amber', color: '#d28a25' },
];

function readSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem('vion-state-v1'));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

export default function AppV2() {
  const [saved] = useState(readSavedState);
  const [activePage, setActivePage] = useState(saved.activePage || 'overview');
  const [pages, setPages] = useState(saved.pages || PAGE_DEFINITIONS);
  const [widgetsByPage, setWidgetsByPage] = useState(saved.widgetsByPage || DEFAULT_WIDGETS);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [themeMode, setThemeMode] = useState(saved.themeMode || 'system');
  const [accent, setAccent] = useState(saved.accent || '#4f6bff');
  const [newPageName, setNewPageName] = useState('');

  const activePageInfo = pages.find(page => page.id === activePage) || PAGE_DEFINITIONS[0];
  const activeWidgets = widgetsByPage[activePage] || [];

  const persist = (next) => {
    localStorage.setItem('vion-state-v1', JSON.stringify(next));
  };

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.themeMode = themeMode;
    root.style.setProperty('--v2-accent', accent);
    root.style.setProperty('--v2-accent-soft', `${accent}20`);
    root.style.setProperty('--v2-accent-pale', `${accent}12`);
    persist({ activePage, pages, widgetsByPage, themeMode, accent });
  }, [themeMode, accent]);

  const updateWidgets = (nextWidgets) => {
    const next = { ...widgetsByPage, [activePage]: nextWidgets };
    setWidgetsByPage(next);
    persist({ activePage, pages, widgetsByPage: next });
  };

  const addWidget = (widgetId) => {
    if (!activeWidgets.includes(widgetId)) updateWidgets([...activeWidgets, widgetId]);
    setShowAddWidget(false);
  };

  const removeWidget = (widgetId) => updateWidgets(activeWidgets.filter(id => id !== widgetId));

  const addPage = (event) => {
    event.preventDefault();
    const label = newPageName.trim();
    if (!label) return;
    const id = `page-${Date.now()}`;
    const nextPages = [...pages, { id, label, icon: '＋' }];
    setPages(nextPages);
    setNewPageName('');
    persist({ activePage: id, pages: nextPages, widgetsByPage });
    setActivePage(id);
  };

  return (
    <div className="v2-shell">
      <aside className="v2-sidebar">
        <div className="v2-brand">
          <span className="v2-brand-mark">V</span>
          <div><strong>Vion<span>.</span></strong><small>Planla · Takip Et · Başar</small></div>
        </div>
        <div className="v2-sidebar-label">Çalışma alanları</div>
        <nav className="v2-nav" aria-label="Ana navigasyon">
          {pages.map(page => (
            <button
              type="button"
              key={page.id}
              className={activePage === page.id ? 'active' : ''}
              onClick={() => {
                setActivePage(page.id);
                persist({ activePage: page.id, pages, widgetsByPage });
              }}
            >
              <span>{page.icon}</span>{page.label}
            </button>
          ))}
        </nav>
        <form className="v2-new-page" onSubmit={addPage}>
          <input value={newPageName} onChange={event => setNewPageName(event.target.value)} placeholder="Yeni sayfa..." />
          <button type="submit" aria-label="Sayfa ekle">＋</button>
        </form>
        <div className="v2-sidebar-footer">
          <span className="v2-avatar">V</span>
          <div><strong>Benim alanım</strong><small>Vion. çalışma alanı</small></div>
        </div>
      </aside>

      <main className="v2-main">
        <header className="v2-topbar">
          <div className="v2-breadcrumb">Çalışma alanı <span>/</span> {activePageInfo.label}</div>
          <div className="v2-top-actions">
            <button type="button" className="v2-secondary">Bugün</button>
            <button type="button" className={isEditing ? 'v2-primary active' : 'v2-primary'} onClick={() => setIsEditing(value => !value)}>
              {isEditing ? 'Düzenlemeyi bitir' : 'Düzenle'}
            </button>
          </div>
        </header>

        <section className="v2-content">
          <div className="v2-page-heading">
            <div><p className="v2-eyebrow">8 Eylül 2026 · Salı</p><h1>{activePageInfo.label}</h1><p className="v2-subtitle">{activePageInfo.description}</p></div>
            {isEditing && <button type="button" className="v2-add" onClick={() => setShowAddWidget(true)}>＋ Widget ekle</button>}
          </div>

          {activePage === 'settings' ? (
            <section className="v2-settings-page">
              <div className="v2-settings-card">
                <div className="v2-settings-card-heading">
                  <div><p className="v2-eyebrow">Görünüm</p><h2>Tema ayarları</h2><p>Vion. görünümünü açık, koyu veya sistem tercihinle kullan.</p></div>
                  <span className="v2-settings-preview" style={{ background: accent }} />
                </div>
                <div className="v2-theme-modes">
                  {['system', 'light', 'dark'].map(mode => <button type="button" key={mode} className={themeMode === mode ? 'active' : ''} onClick={() => setThemeMode(mode)}>{mode === 'system' ? 'Sistem' : mode === 'light' ? 'Açık' : 'Koyu'}</button>)}
                </div>
                <p className="v2-theme-label">Vurgu rengi</p>
                <div className="v2-theme-swatches">{THEME_PRESETS.map(theme => <button type="button" key={theme.id} aria-label={theme.label} className={accent === theme.color ? 'selected' : ''} style={{ '--swatch': theme.color }} onClick={() => setAccent(theme.color)} />)}</div>
                <label className="v2-custom-color">Özel renk<input type="color" value={accent} onChange={event => setAccent(event.target.value)} /></label>
              </div>
            </section>
          ) : <div className="v2-widget-grid">
            {activeWidgets.map(widgetId => {
              const widget = WIDGETS[widgetId];
              if (!widget) return null;
              const WidgetComponent = widget.Component;
              return <WidgetShell widget={widget} isEditing={isEditing} onRemove={() => removeWidget(widgetId)} key={widgetId}><WidgetComponent /></WidgetShell>;
            })}
          </div>}
        </section>
      </main>

      {showAddWidget && (
        <div className="v2-modal-backdrop" onClick={() => setShowAddWidget(false)}>
          <div className="v2-modal" onClick={event => event.stopPropagation()}>
            <div className="v2-modal-heading"><div><p className="v2-eyebrow">Sayfanı kişiselleştir</p><h2>Widget ekle</h2></div><button type="button" onClick={() => setShowAddWidget(false)}>×</button></div>
            <div className="v2-widget-options">
              {Object.entries(WIDGETS).map(([id, widget]) => <button type="button" key={id} onClick={() => addWidget(id)} disabled={activeWidgets.includes(id)}><span>{widget.icon}</span>{widget.title}<small>{activeWidgets.includes(id) ? 'Ekli' : 'Ekle'}</small></button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
