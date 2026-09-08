import React, { createContext, useContext, useState, useEffect } from 'react';
import { createCurriculum, VEKTOR_IKONLAR, ALL_WIDGETS, SINAV_MUFREDATLARI, PAGE_TEMPLATES, getNextExamDate } from '../constants';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const [language, setLanguageState] = useState(() => localStorage.getItem('vion-language') || 'tr');
  const setLanguage = (nextLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem('vion-language', nextLanguage);
  };
  const [theme, setTheme] = useState('acik');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [iconStyle, setIconStyle] = useState('emoji');
  const [uiScale, setUiScale] = useState(0.8);
  
  const [userName, setUserName] = useState('Kişisel Panel');
  const [userAvatar, setUserAvatar] = useState(null);

  const [activePage, setActivePage] = useState('ana');
  const [pages, setPages] = useState([
    { id: 'ana', ad: 'Panel', ikon: '🏠', sabit: true },
    { id: 'ders', ad: 'Ders', ikon: '📚', sabit: true },
    { id: 'is', ad: 'İş', ikon: '💼', sabit: true }
  ]);
  const [activeDersTab, setActiveDersTab] = useState('ders_genel');
  const [isEditMode, setIsEditMode] = useState(false);

  // Evrensel Dialog State
  const [dialogModal, setDialogModal] = useState({
    isOpen: false,
    type: 'confirm',
    title: 'Uyarı',
    message: '',
    inputValue: '',
    maxLength: 100,
    confirmText: 'Tamam',
    cancelText: 'Vazgeç',
    isDanger: false,
    onConfirm: () => {}
  });

  const showConfirm = ({ title = 'Uyarı', message, confirmText = 'Tamam', cancelText = 'Vazgeç', isDanger = false, onConfirm }) => {
    setDialogModal({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setDialogModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const showPrompt = ({ title = 'Giriş', message, defaultValue = '', confirmText = 'Kaydet', maxLength = 30, onConfirm }) => {
    setDialogModal({
      isOpen: true,
      type: 'prompt',
      title,
      message,
      inputValue: defaultValue,
      maxLength,
      confirmText,
      cancelText: 'Vazgeç',
      isDanger: false,
      onConfirm: (val) => {
        if (onConfirm) onConfirm(val);
        setDialogModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const closeDialog = () => setDialogModal(prev => ({ ...prev, isOpen: false }));

  // Dinamik Sekmeler
  const defaultTabs = {
    ana: [{ id: "ana", ad: "Genel Panel", ikon: "🏠", ozelMi: false }],
    is: [{ id: "is", ad: "Genel Bakış", ikon: "💼", ozelMi: false }],
    ders: [
      { id: "ders_genel", ad: "Genel Bakış", ikon: "📊", ozelMi: false },
      { id: "ders_konular", ad: "Konular", ikon: "📖", ozelMi: false },
      { id: "ders_denemeler", ad: "Denemeler", ikon: "📝", ozelMi: false },
      { id: "ders_yanlislar", ad: "Yanlışlarım", ikon: "❌", ozelMi: false },
      { id: "ders_takip", ad: "Çalışma Takibi", ikon: "🔥", ozelMi: false }
    ]
  };

  const [tabs, setTabs] = useState(defaultTabs);

  const [activeTabByPage, setActiveTabByPage] = useState({
    ana: "ana",
    is: "is",
    ders: "ders_genel"
  });

  // Orijinal Dosyalardaki Varsayılan Sekme Widget Düzenleri (İlk Açılışta Dolu Gelir)
  const defaultWidgets = {
    ana: [
      { id: "gunluk-ozet", genislik: 4, gorunur: true },
      { id: "gorevler", genislik: 2, gorunur: true },
      { id: "takvim", genislik: 2, gorunur: true },
      { id: "not-defteri", genislik: 2, gorunur: true },
      { id: "pomodoro", genislik: 2, gorunur: true }
    ],
    ders_genel: [
      { id: "ders-zayif-konular", genislik: 4, gorunur: true },
      { id: "ders-calisma-plani", genislik: 2, gorunur: true },
      { id: "ders-ilerleme", genislik: 2, gorunur: true },
      { id: "ders-net-grafik", genislik: 2, gorunur: true },
      { id: "gunluk-ozet", genislik: 2, gorunur: true }
    ],
    is: [
      { id: "is-zaman", genislik: 4, gorunur: true },
      { id: "gorevler", genislik: 2, gorunur: true },
      { id: "takvim", genislik: 2, gorunur: true },
      { id: "is-fikirler", genislik: 2, gorunur: true },
      { id: "is-hizli-not", genislik: 2, gorunur: true }
    ],
    ders_konular: [
      { id: "konular-panel", genislik: 4, gorunur: true }
    ],
    ders_denemeler: [
      { id: "deneme-ekle", genislik: 2, gorunur: true },
      { id: "deneme-gecmisi", genislik: 2, gorunur: true }
    ],
    ders_yanlislar: [
      { id: "yanlis-ekle", genislik: 2, gorunur: true },
      { id: "yanlis-analiz", genislik: 2, gorunur: true },
      { id: "yanlis-arsiv", genislik: 4, gorunur: true }
    ],
    ders_takip: [
      { id: "takip-takvim", genislik: 2, gorunur: true },
      { id: "takip-hedefler", genislik: 4, gorunur: true }
    ]
  };

  const getSafeWidgetLayout = (panelId) => {
    const list = widgetLayouts?.[panelId];
    if (Array.isArray(list) && list.length > 0) return list;
    return defaultWidgets?.[panelId] || [];
  };

  const [widgetLayouts, setWidgetLayouts] = useState(defaultWidgets);

  // Merkezi Görevler ve Kategoriler
  const defaultCategories = [
    { id: "kat_is", ad: "İş", ikon: "💼", baglanti: "is", anaSayfadaGoster: true },
    { id: "kat_ders", ad: "Ders", ikon: "📚", baglanti: "ders", anaSayfadaGoster: true },
    { id: "kat_kisisel", ad: "Kişisel", ikon: "🎯", baglanti: "bagimsiz", anaSayfadaGoster: true }
  ];

  const [categories, setCategories] = useState(defaultCategories);

  const [tasks, setTasks] = useState([]);

  const [panelData, setPanelData] = useState({ takvimNotlari: {}, notKagidi: "" });

  const defaultDersData = {
    sinavTuru: "kpss_ortaogretim",
    sinavTarihi: getNextExamDate(SINAV_MUFREDATLARI.kpss_ortaogretim.varsayilanTarih),
    dersler: createCurriculum("kpss_ortaogretim"),
    denemeler: [],
    yanlislar: [],
    calismaGunleri: {},
    hedefler: [],
    calismaPlani: []
  };

  const normalizeDersData = (incoming = null) => {
    const source = incoming && typeof incoming === 'object' ? incoming : {};
    return {
      ...defaultDersData,
      ...source,
      dersler: Array.isArray(source.dersler) ? source.dersler : defaultDersData.dersler,
      denemeler: Array.isArray(source.denemeler) ? source.denemeler : [],
      yanlislar: Array.isArray(source.yanlislar) ? source.yanlislar : [],
      calismaGunleri: source.calismaGunleri && typeof source.calismaGunleri === 'object' ? source.calismaGunleri : {},
      hedefler: Array.isArray(source.hedefler) ? source.hedefler : [],
      calismaPlani: Array.isArray(source.calismaPlani) ? source.calismaPlani : [],
      sinavTuru: source.sinavTuru || defaultDersData.sinavTuru,
      sinavTarihi: source.sinavTarihi || defaultDersData.sinavTarihi
    };
  };

  const [dersData, setDersData] = useState(() => normalizeDersData());

  const [isData, setIsData] = useState({ projeler: [], fikirler: "", hizliNotlar: [] });
  const [sportData, setSportData] = useState({ sporTuru: 'Fitness', kayitlar: [], hareketler: [] });
  const [personalData, setPersonalData] = useState({ modlar: {}, aliskanliklar: [], aliskanlikKayitlari: {}, listeler: [], kitaplar: [], medya: [], regl: { baslangic: '', sure: 5, not: '' }, gelirler: [], giderler: [], maasGunu: 1, abonelikler: [] });

  const [weeklyHabits, setWeeklyHabits] = useState([{ id: 'h1', name: 'KPSS Soru Çözümü', history: {} }, { id: 'h2', name: 'Kitap Okuma', history: {} }]);
  const [monthlyHabits, setMonthlyHabits] = useState([{ id: 'm1', name: 'Derin Çalışma (Deep Work)', history: {} }]);
  const [timelineProjects, setTimelineProjects] = useState(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    return [
      { id: 'p1', isim: 'Okula Dönüş Kampanyası', phases: [{ id: 'ph1', isim: 'Araştırma', startTimestamp: new Date(year, month, 2).getTime(), endTimestamp: new Date(year, month, 5).getTime(), isHighlight: false }, { id: 'ph2', isim: 'Tasarım', startTimestamp: new Date(year, month, 6).getTime(), endTimestamp: new Date(year, month, 12).getTime(), isHighlight: true }] },
      { id: 'p2', isim: 'Yeni Web Sitesi', phases: [{ id: 'ph3', isim: 'Geliştirme', startTimestamp: new Date(year, month, 10).getTime(), endTimestamp: new Date(year, month, 25).getTime(), isHighlight: false }] }
    ];
  });

  useEffect(() => { document.body.classList.toggle('koyu-tema', theme === 'koyu'); }, [theme]);
  useEffect(() => {
    document.body.style.setProperty('--renk-vurgu', accentColor);
    document.body.style.setProperty('--renk-vurgu-hover', `color-mix(in srgb, ${accentColor} 82%, black)`);
    document.body.style.setProperty('--renk-vurgu-halka', `color-mix(in srgb, ${accentColor} 15%, transparent)`);
    document.body.style.setProperty('--renk-vurgu-yuzey', `color-mix(in srgb, ${accentColor} 12%, ${theme === 'koyu' ? 'transparent' : 'white'})`);
  }, [accentColor, theme]);

  useEffect(() => {
    document.body.style.zoom = String(uiScale);
  }, [uiScale]);

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [appDataLoaded, setAppDataLoaded] = useState(false);

  useEffect(() => {
    if (!user || isDemoMode) {
      setProfileLoaded(isDemoMode);
      setAppDataLoaded(isDemoMode);
      return;
    }

    const loadUserData = async () => {
      const [{ data: profile }, { data: savedState, error: stateError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('widget_data').select('data').eq('user_id', user.id).eq('widget_id', 'app-state').eq('panel_id', 'global').maybeSingle()
      ]);

      const metadataName = (user.user_metadata?.user_name || '').trim();
      if (profile) {
        setUserName(profile.user_name || metadataName || 'Kişisel Panel');
        try { setUserAvatar(profile.avatar_url ? JSON.parse(profile.avatar_url) : null); } catch { setUserAvatar(null); }
        setTheme(profile.theme || 'acik');
        setAccentColor(profile.accent_color || '#10b981');
        setIconStyle(profile.icon_style || 'emoji');
        if (profile.language) setLanguage(profile.language);
      } else if (!profile) {
        const { error: insertError } = await supabase.from('profiles').insert({ id: user.id, user_name: metadataName || 'Kişisel Panel' });
        if (insertError) console.error('Profil oluşturulamadı:', insertError);
      }
      if (stateError) console.error('Uygulama verileri okunamadı:', stateError);
      if (savedState?.data) {
        const saved = savedState.data;
        if (Array.isArray(saved.pages) && saved.pages.length > 0) setPages(saved.pages);
        if (saved.tabs) setTabs(saved.tabs);
        if (saved.widgetLayouts) {
          const mergedLayouts = { ...defaultWidgets, ...(saved.widgetLayouts || {}) };
          Object.keys(mergedLayouts).forEach(panelId => {
            if (!Array.isArray(mergedLayouts[panelId])) {
              mergedLayouts[panelId] = defaultWidgets[panelId] || [];
            }
          });
          setWidgetLayouts(mergedLayouts);
        }
        if (saved.activeTabByPage) {
          setActiveTabByPage({
            ana: saved.activeTabByPage.ana || 'ana',
            is: saved.activeTabByPage.is || 'is',
            ders: saved.activeTabByPage.ders || 'ders_genel'
          });
        }
        if (saved.categories) setCategories(saved.categories);
        if (saved.tasks) setTasks(saved.tasks);
        if (saved.panelData) setPanelData(saved.panelData);
        if (saved.dersData) setDersData(normalizeDersData(saved.dersData));
        if (saved.isData) setIsData(saved.isData);
        if (saved.sportData) setSportData(saved.sportData);
        if (saved.personalData) setPersonalData(saved.personalData);
        if (saved.weeklyHabits) setWeeklyHabits(saved.weeklyHabits);
        if (saved.monthlyHabits) setMonthlyHabits(saved.monthlyHabits);
        if (saved.timelineProjects) setTimelineProjects(saved.timelineProjects);
        if (saved.uiScale) setUiScale(saved.uiScale);
      } else if (Array.isArray(user.user_metadata?.selected_pages) && user.user_metadata.selected_pages.length > 0) {
        const selected = new Set(user.user_metadata.selected_pages);
        const selectedTemplates = PAGE_TEMPLATES
          .filter(template => selected.has(template.builtinId || template.id))
        const selectedDefinitions = selectedTemplates.map(template => ({ id: template.builtinId || template.id, ad: template.ad, ikon: template.ikon, sabit: true, templateId: template.id }));
        const selectedTabs = selectedTemplates.reduce((result, template) => ({ ...result, [template.builtinId || template.id]: template.tabs }), {});
        const selectedLayouts = selectedTemplates.reduce((result, template) => ({ ...result, [template.tabs[0].id]: template.widgets }), {});
        const selectedActiveTabs = selectedTemplates.reduce((result, template) => ({ ...result, [template.builtinId || template.id]: template.tabs[0].id }), {});
        setPages(selectedDefinitions);
        setTabs(prev => ({ ...prev, ...selectedTabs }));
        setWidgetLayouts(prev => ({ ...prev, ...selectedLayouts }));
        setActiveTabByPage(prev => ({ ...prev, ...selectedActiveTabs }));
      }
      setProfileLoaded(true);
      setAppDataLoaded(true);
    };

    loadUserData();
  }, [user, isDemoMode]);

  useEffect(() => {
    if (!user || isDemoMode || !profileLoaded) return;
    supabase.from('profiles').upsert({
      id: user.id,
      user_name: userName,
      avatar_url: JSON.stringify(userAvatar),
      theme,
      accent_color: accentColor,
      icon_style: iconStyle
      , language
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('Profil kaydedilemedi:', error);
    });
  }, [userName, userAvatar, theme, accentColor, iconStyle, language, user, isDemoMode, profileLoaded]);
  useEffect(() => {
    if (!user || isDemoMode || !appDataLoaded) return;
    const data = { pages, tabs, widgetLayouts, activeTabByPage, categories, tasks, panelData, dersData, isData, sportData, personalData, weeklyHabits, monthlyHabits, timelineProjects, uiScale };
    supabase.from('widget_data').upsert({
      user_id: user.id,
      widget_id: 'app-state',
      panel_id: 'global',
      data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,widget_id,panel_id' }).then(({ error }) => {
      if (error) console.error('Uygulama verileri kaydedilemedi:', error);
    });
  }, [user, isDemoMode, appDataLoaded, pages, tabs, widgetLayouts, activeTabByPage, categories, tasks, panelData, dersData, isData, sportData, personalData, weeklyHabits, monthlyHabits, timelineProjects, uiScale]);

  const simgesi = (emoji) => {
    if (iconStyle === "svg") {
      const iconText = String(emoji || '📌');
      const normalizedIcon = iconText.replace(/\uFE0F/g, '');
      const matchedKey = Object.keys(VEKTOR_IKONLAR).find(key => key.replace(/\uFE0F/g, '') === normalizedIcon);
      const svg = VEKTOR_IKONLAR[iconText] || VEKTOR_IKONLAR[normalizedIcon] || VEKTOR_IKONLAR[matchedKey] || VEKTOR_IKONLAR['📌'];
      return <span className="vektor-ikon-kutusu" dangerouslySetInnerHTML={{ __html: svg }} />;
    }
    return emoji;
  };

  const toggleTheme = () => setTheme(prev => prev === 'koyu' ? 'acik' : 'koyu');

  const changeExamType = (examCode) => {
    const examInfo = SINAV_MUFREDATLARI[examCode];
    if (!examInfo) return;

    showConfirm({
      title: "Sınav Değiştir",
      message: `Hedef sınavını "${examInfo.ad}" olarak değiştirmek istediğine emin misin? Sınav tarihi otomatik olarak "${examInfo.varsayilanTarih}" olarak ayarlanacak ve ders müfredatın güncellenecektir.`,
      confirmText: "Evet, Değiştir",
      onConfirm: () => {
        setDersData(prev => ({
          ...prev,
          sinavTuru: examCode,
          sinavTarihi: getNextExamDate(examInfo.varsayilanTarih),
          dersler: createCurriculum(examCode)
        }));
      }
    });
  };

  // Yeni Sekme Ekle (Yalnızca Yeni Açılan Özel Sekmeler Boş Başlar)
  const addTab = (sayfaTuru, tabName) => {
    const newId = `${sayfaTuru}_ozel_${Date.now()}`;
    const newTab = { id: newId, ad: tabName, ikon: "📌", ozelMi: true };
    setTabs(prev => ({ ...prev, [sayfaTuru]: [...(prev?.[sayfaTuru] || []), newTab] }));
    setActiveTabByPage(prev => ({ ...prev, [sayfaTuru]: newId }));
    setWidgetLayouts(prev => ({ ...prev, [newId]: [] }));
  };

  const addPageFromTemplate = (templateId, pageName, pageIcon) => {
    const template = PAGE_TEMPLATES.find(item => item.id === templateId);
    if (!template) return;
    const pageId = template.builtinId || `sayfa_${templateId}_${Date.now()}`;
    const firstTabId = template.builtinId ? template.tabs[0].id : `${pageId}_genel`;
    const pageTabs = template.tabs.map(tab => ({ ...tab, id: template.builtinId ? tab.id : (tab.id === `${templateId}_genel` ? firstTabId : `${pageId}_${tab.id}`) }));
    const page = { id: pageId, ad: pageName?.trim() || template.ad, ikon: pageIcon || template.ikon, sabit: false, templateId };
    setPages(prev => prev.some(item => item.id === pageId) ? prev : [...prev, page]);
    setTabs(prev => ({ ...prev, [pageId]: pageTabs }));
    setActiveTabByPage(prev => ({ ...prev, [pageId]: firstTabId }));
    setWidgetLayouts(prev => ({ ...prev, [firstTabId]: template.widgets }));
    setActivePage(pageId);
    return pageId;
  };

  const deletePage = (pageId) => {
    const fallbackPage = pages.find(page => page.id !== pageId)?.id || 'ayarlar';
    setPages(prev => prev.filter(page => page.id !== pageId));
    setActivePage(current => current === pageId ? fallbackPage : current);
    setTabs(prev => {
      const next = { ...prev };
      delete next[pageId];
      return next;
    });
    setActiveTabByPage(prev => {
      const next = { ...prev };
      delete next[pageId];
      return next;
    });
    setActivePage(prev => prev === pageId ? 'ana' : prev);
  };

  const updatePage = (pageId, changes) => {
    setPages(prev => prev.map(page => page.id === pageId ? {
      ...page,
      ad: changes.ad?.trim() || page.ad,
      ikon: changes.ikon || page.ikon
    } : page));
  };

  const deleteTab = (sayfaTuru, tabId) => {
    setTabs(prev => ({ ...prev, [sayfaTuru]: (prev?.[sayfaTuru] || []).filter(t => t.id !== tabId) }));
    setActiveTabByPage(prev => ({ ...prev, [sayfaTuru]: defaultTabs[sayfaTuru][0].id }));
  };

  const updateWidgetWidth = (panelId, widgetId, genislik) => {
    setWidgetLayouts(prev => ({
      ...prev,
      [panelId]: (prev?.[panelId] || []).map(w => w.id === widgetId ? { ...w, genislik } : w)
    }));
  };

  const toggleWidgetVisibility = (panelId, widgetId) => {
    setWidgetLayouts(prev => {
      const currentList = prev?.[panelId] || [];
      const exists = currentList.some(w => w.id === widgetId);
      if (!exists) {
        const base = ALL_WIDGETS.find(w => w.id === widgetId) || { id: widgetId, varsayilanGenislik: 2 };
        return { ...prev, [panelId]: [...currentList, { id: widgetId, genislik: base.varsayilanGenislik, gorunur: true }] };
      }
      return {
        ...prev,
        [panelId]: currentList.map(w => w.id === widgetId ? { ...w, gorunur: !w.gorunur } : w)
      };
    });
  };

  const reorderWidgets = (panelId, startIndex, endIndex) => {
    setWidgetLayouts(prev => {
      const list = [...(prev?.[panelId] || [])];
      const [removed] = list.splice(startIndex, 1);
      let hedefIndex = endIndex;
      if (startIndex < endIndex) hedefIndex = endIndex - 1;
      hedefIndex = Math.max(0, Math.min(hedefIndex, list.length));
      list.splice(hedefIndex, 0, removed);
      return { ...prev, [panelId]: list };
    });
  };

  const resetWidgets = (panelId) => {
    setWidgetLayouts(prev => ({
      ...prev,
      [panelId]: defaultWidgets[panelId] || []
    }));
  };

  const addCategory = ({ name, icon = "📁", baglanti = "bagimsiz", anaSayfadaGoster = true }) => {
    const newCat = { id: "kat_" + Date.now(), ad: name.trim(), ikon: icon, baglanti, anaSayfadaGoster };
    setCategories(prev => [...(prev || []), newCat]);
    return newCat.id;
  };

  const deleteCategory = (catId) => {
    setCategories(prev => (prev || []).filter(c => c.id !== catId));
    setTasks(prev => (prev || []).filter(t => t.kategoriId !== catId));
  };

  const addTask = ({ kategoriId, metin, aciliyet = "orta", baglanti = "bagimsiz", anaSayfadaGoster = true }) => {
    if (!metin.trim()) return;
    const newTask = {
      id: "g_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
      kategoriId,
      metin: metin.trim(),
      aciliyet,
      baglanti,
      anaSayfadaGoster,
      tamamlandi: false,
      olusturmaTarihi: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...(prev || [])]);
  };

  const toggleTask = (taskId) => {
    setTasks(prev => (prev || []).map(t => {
      if (t.id === taskId) {
        const isNowCompleted = !t.tamamlandi;
        return { 
          ...t, 
          tamamlandi: isNowCompleted,
          // Senkronizasyon sihri burada:
          status: isNowCompleted ? 'bitti' : (t.status === 'bitti' ? 'bekliyor' : t.status)
        };
      }
      return t;
    }));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => (prev || []).filter(t => t.id !== taskId));
  };

  const toggleTaskHomeVisibility = (taskId) => {
    setTasks(prev => (prev || []).map(t => t.id === taskId ? { ...t, anaSayfadaGoster: !t.anaSayfadaGoster } : t));
  };

  const updateTask = (id, updatedFields) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, ...updatedFields } : t
    ));
  };

  return (
    <AppContext.Provider value={{
      updateTask,
      theme, toggleTheme,
      accentColor, setAccentColor,
      uiScale, setUiScale,
      iconStyle, setIconStyle, simgesi,
      userName, setUserName,
      userAvatar, setUserAvatar,
      activePage, setActivePage,
      pages, setPages, addPageFromTemplate, deletePage, updatePage,
      language, setLanguage,
      activeDersTab, setActiveDersTab,
      tabs: tabs || defaultTabs, setTabs,
      activeTabByPage: activeTabByPage || { ana: "ana", is: "is", ders: "ders_genel" }, setActiveTabByPage, addTab, deleteTab,
      widgetLayouts: widgetLayouts || defaultWidgets, getSafeWidgetLayout, isEditMode, setIsEditMode,
      updateWidgetWidth, toggleWidgetVisibility, reorderWidgets, resetWidgets,
      categories: categories || defaultCategories, setCategories, addCategory, deleteCategory,
      tasks: tasks || [], setTasks, addTask, toggleTask, deleteTask, toggleTaskHomeVisibility,
      panelData: panelData || { takvimNotlari: {}, notKagidi: "" }, setPanelData,
      dersData: normalizeDersData(dersData), setDersData: (updater) => {
        setDersData(prev => normalizeDersData(typeof updater === 'function' ? updater(prev || defaultDersData) : updater));
      },
      isData: isData || { projeler: [], fikirler: "", hizliNotlar: [] }, setIsData,
      sportData, setSportData, personalData, setPersonalData,
      weeklyHabits, setWeeklyHabits,
      monthlyHabits, setMonthlyHabits,
      timelineProjects, setTimelineProjects,
      changeExamType,
      dialogModal, setDialogModal, showConfirm, showPrompt, closeDialog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);