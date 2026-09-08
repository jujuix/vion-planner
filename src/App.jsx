import { lazy, Suspense, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { getGreetingMessage, ALL_WIDGETS, SINAV_MUFREDATLARI, EMOJI_HAVUZU } from './constants';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DynamicTabBar } from './components/dashboard/DynamicTabBar';
import { DailySummary } from './components/dashboard/DailySummary';
import { CalendarView } from './components/dashboard/CalendarView';
import { TaskCategoryCard } from './components/dashboard/TaskCategoryCard';
import { Notebook } from './components/dashboard/Notebook';
import { Pomodoro } from './components/dashboard/Pomodoro';
import { motion, AnimatePresence } from 'framer-motion';

const lazyNamed = (importer, exportName) => lazy(() => importer().then(module => ({ default: module[exportName] })));
const SettingsModule = lazyNamed(() => import('./components/settings/SettingsModule'), 'SettingsModule');
const CustomSelect = lazyNamed(() => import('./components/ui/CustomSelect'), 'CustomSelect');
const CustomDatePicker = lazyNamed(() => import('./components/ui/CustomDatePicker'), 'CustomDatePicker');
const HabitWeeklyWidget = lazyNamed(() => import('./components/dashboard/HabitWeeklyWidget'), 'HabitWeeklyWidget');
const HabitMonthlyWidget = lazyNamed(() => import('./components/dashboard/HabitMonthlyWidget'), 'HabitMonthlyWidget');
const WorkKanbanWidget = lazyNamed(() => import('./components/work/WorkKanbanWidget'), 'WorkKanbanWidget');
const BugunOdakWidget = lazyNamed(() => import('./components/work/BugunOdakWidget'), 'BugunOdakWidget');
const ProjeFikirleriWidget = lazyNamed(() => import('./components/work/ProjeFikirleriWidget'), 'ProjeFikirleriWidget');
const HizliBaglantilarWidget = lazyNamed(() => import('./components/work/HizliBaglantilarWidget'), 'HizliBaglantilarWidget');
const YoutubeKursWidget = lazyNamed(() => import('./components/dashboard/YoutubeKursWidget'), 'YoutubeKursWidget');
const SportProgramWidget = lazyNamed(() => import('./components/sport/SportWidgets'), 'SportProgramWidget');
const SportDailyWidget = lazyNamed(() => import('./components/sport/SportWidgets'), 'SportDailyWidget');
const SportExercisesWidget = lazyNamed(() => import('./components/sport/SportWidgets'), 'SportExercisesWidget');
const MoodTrackerWidget = lazyNamed(() => import('./components/personal/PersonalWidgets'), 'MoodTrackerWidget');
const PersonalHabitWidget = lazyNamed(() => import('./components/personal/PersonalWidgets'), 'PersonalHabitWidget');
const PersonalListsWidget = lazyNamed(() => import('./components/personal/PersonalWidgets'), 'PersonalListsWidget');
const PersonalBooksWidget = lazyNamed(() => import('./components/personal/PersonalWidgets'), 'PersonalBooksWidget');
const PersonalMediaWidget = lazyNamed(() => import('./components/personal/PersonalWidgets'), 'PersonalMediaWidget');
const PersonalBudgetWidget = lazyNamed(() => import('./components/personal/PersonalWidgets'), 'PersonalBudgetWidget');
const PersonalSubscriptionWidget = lazyNamed(() => import('./components/personal/PersonalWidgets'), 'PersonalSubscriptionWidget');
const PersonalCycleWidget = lazyNamed(() => import('./components/personal/PersonalWidgets'), 'PersonalCycleWidget');
const KonularWidget = lazyNamed(() => import('./components/lessons/DersModule'), 'KonularWidget');
const DenemeEkleWidget = lazyNamed(() => import('./components/lessons/DersModule'), 'DenemeEkleWidget');
const DenemeGecmisiWidget = lazyNamed(() => import('./components/lessons/DersModule'), 'DenemeGecmisiWidget');
const YanlisAnalizWidget = lazyNamed(() => import('./components/lessons/DersModule'), 'YanlisAnalizWidget');
const YanlisEkleWidget = lazyNamed(() => import('./components/lessons/DersModule'), 'YanlisEkleWidget');
const YanlisArsivWidget = lazyNamed(() => import('./components/lessons/DersModule'), 'YanlisArsivWidget');
const CalismaTakvimWidget = lazyNamed(() => import('./components/lessons/DersModule'), 'CalismaTakvimWidget');
const HedeflerWidget = lazyNamed(() => import('./components/lessons/DersModule'), 'HedeflerWidget');


export default function App() {
  const { session, loading: authLoading } = useAuth();
  const {
    activePage, userName, setUserName, pages = [],
    categories, addCategory,
    widgetLayouts = {}, isEditMode, setIsEditMode,
    updateWidgetWidth, toggleWidgetVisibility, reorderWidgets, resetWidgets,
    setUserAvatar, activeTabByPage = { ana: "ana", is: "is", ders: "ders_genel" },
    dersData, setDersData, changeExamType,
    dialogModal, setDialogModal, closeDialog, simgesi, isData, setIsData,
    getSafeWidgetLayout, sportData, setSportData
  } = useApp();

  const [draggedWidgetId, setDraggedWidgetId] = useState(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWidgetIds, setSelectedWidgetIds] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeInput, setWelcomeInput] = useState('');

  const [selectedWidgetCat, setSelectedWidgetCat] = useState('Tümü');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📌');
  const [newCatBinding, setNewCatBinding] = useState('bagimsiz');
  const [newCatShowOnHome, setNewCatShowOnHome] = useState(true);

  const [globalUrgency, setGlobalUrgency] = useState('hepsi');
  const [greetingText, setGreetingText] = useState('');

  // Çalışma Planı State
  const [planDers, setPlanDers] = useState('');
  const [planKonu, setPlanKonu] = useState('');
  const [planSure, setPlanSure] = useState('');
  const [planSoru, setPlanSoru] = useState('');

  // Proje / Zaman Çizelgesi State
  const [projName, setProjName] = useState('');
  const [projStart, setProjStart] = useState('');
  const [projEnd, setProjEnd] = useState('');
  const [fastNote, setFastNote] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const dersLessons = Array.isArray(dersData?.dersler) ? dersData.dersler : [];
  const calismaPlanlari = Array.isArray(dersData?.calismaPlani) ? dersData.calismaPlani : [];
  const denemeListesi = Array.isArray(dersData?.denemeler) ? dersData.denemeler : [];

  useEffect(() => {
    if (!userName) {
      setShowWelcomeModal(true);
    } else {
      setGreetingText(getGreetingMessage(userName));
    }
  }, [userName]);

  // Hangi sayfadaysak o sayfanın aktif sekmesini al
  const currentTabId = activeTabByPage?.[activePage] || (activePage === 'ders' ? 'ders_genel' : activePage);
  const currentPage = pages.find(page => page.id === activePage);
  
  // O sekmedeki widget listesi
  const currentLayout = getSafeWidgetLayout(currentTabId);
  const activeWidgets = currentLayout.filter(w => w?.gorunur !== false);
  const widgetGridRef = useRef(null);
  const [masonryReadyFor, setMasonryReadyFor] = useState(null);
  const masonryRowHeight = 8;
  const masonryRowGap = 18;

  const recalcMasonry = () => {
    const grid = widgetGridRef.current;
    if (!grid) return false;

    const elements = [...grid.querySelectorAll(':scope > .widget-kutu')];
    if (!elements.length) return false;

    let everyWidgetMeasured = true;
    elements.forEach(element => {
      const content = element.querySelector(':scope > .widget-icerik');
      if (!content || content.getBoundingClientRect().height === 0) {
        everyWidgetMeasured = false;
        return;
      }

      const toolbarHeight = element.querySelector(':scope > .widget-arac-cubugu')?.scrollHeight || 0;
      const styles = getComputedStyle(element);
      const verticalBoxSpace = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
        + parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
      const contentHeight = Math.max(content.scrollHeight, content.getBoundingClientRect().height)
        + verticalBoxSpace;
      const rowSpan = Math.max(1, Math.ceil(
        (toolbarHeight + contentHeight + masonryRowGap) / (masonryRowHeight + masonryRowGap)
      ));
      element.style.gridRowEnd = `span ${rowSpan}`;
    });

    return everyWidgetMeasured;
  };

  useLayoutEffect(() => {
    let firstFrame;
    let secondFrame;
    let firstTimeout;
    let secondTimeout;
    let resizeObserver;
    let mutationObserver;

    setMasonryReadyFor(null);

    const measureAndReady = () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (recalcMasonry()) setMasonryReadyFor(currentTabId);
        });
      });
    };

    measureAndReady();
    firstTimeout = window.setTimeout(measureAndReady, 80);
    secondTimeout = window.setTimeout(measureAndReady, 300);

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measureAndReady);
      if (widgetGridRef.current) resizeObserver.observe(widgetGridRef.current);
      widgetGridRef.current?.querySelectorAll('.widget-kutu, .widget-icerik').forEach(element => resizeObserver.observe(element));
    }
    if (typeof MutationObserver !== 'undefined' && widgetGridRef.current) {
      mutationObserver = new MutationObserver(measureAndReady);
      mutationObserver.observe(widgetGridRef.current, { childList: true, subtree: true });
    }
    window.addEventListener('resize', measureAndReady);

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.clearTimeout(firstTimeout);
      window.clearTimeout(secondTimeout);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', measureAndReady);
    };
  }, [activeWidgets, currentTabId, isEditMode]);

  const moveWidget = (widgetId, direction) => {
    const layout = widgetLayouts[currentTabId] || [];
    const visibleWidgets = layout.filter(widget => widget.gorunur);
    const visibleIndex = visibleWidgets.findIndex(widget => widget.id === widgetId);
    const targetVisibleIndex = direction === 'up' ? visibleIndex - 1 : visibleIndex + 1;
    if (visibleIndex === -1 || targetVisibleIndex < 0 || targetVisibleIndex >= visibleWidgets.length) return;

    const startIndex = layout.findIndex(widget => widget.id === widgetId);
    const targetIndex = layout.findIndex(widget => widget.id === visibleWidgets[targetVisibleIndex].id);
    reorderWidgets(currentTabId, startIndex, direction === 'up' ? targetIndex : targetIndex + 1);
  };

  // Bu sekmede henüz eklenmemiş olan widget'lar
  const unaddedWidgets = ALL_WIDGETS.filter(w => !activeWidgets.some(aw => aw.id === w.id));

  const widgetCategories = [
    "Tümü",
    ...Array.from(new Set(ALL_WIDGETS.map(widget => widget.kategori).filter(Boolean)))
  ];
  const filteredUnaddedWidgets = selectedWidgetCat === "Tümü" 
    ? unaddedWidgets 
    : unaddedWidgets.filter(w => w.kategori === selectedWidgetCat);

  const toggleWidgetSelection = (widgetId) => {
    setSelectedWidgetIds(prev => prev.includes(widgetId)
      ? prev.filter(id => id !== widgetId)
      : [...prev, widgetId]
    );
  };

  const addSelectedWidgets = () => {
    selectedWidgetIds.forEach(widgetId => toggleWidgetVisibility(currentTabId, widgetId));
    setSelectedWidgetIds([]);
    setShowAddModal(false);
  };

  // Sayfaya göre filtrelenmiş kategoriler
  const pageCategories = categories.filter(c => {
    if (activePage === "ana") return c.anaSayfadaGoster !== false;
    if (activePage === "is") return c.baglanti === "is";
    if (activePage === "ders") return c.baglanti === "ders";
    return true;
  });

  // Zayıf Konular Algoritması
  const allTopics = [];
  dersLessons.forEach(d => {
    (d?.konular || []).forEach(k => {
      let soru = 0, dogru = 0, lastDate = null;
      (k.kayitlar || []).forEach(r => {
        if (['test', 'tekrar'].includes(r.tip)) {
          soru += Number(r.soru) || 0;
          dogru += Number(r.dogru) || 0;
        }
        if (!lastDate || r.tarih > lastDate) lastDate = r.tarih;
      });
      const rate = soru >= 5 ? Math.round((dogru / soru) * 100) : null;
      allTopics.push({ dersId: d.id, dersAdi: d.ad, konu: k, soru, rate, lastDate });
    });
  });

  const lowestRateTopics = allTopics.filter(t => t.rate !== null).sort((a, b) => a.rate - b.rate).slice(0, 5);
  const neglectedTopics = allTopics.filter(t => t.lastDate).map(t => {
    const diff = Math.round((new Date(todayStr) - new Date(t.lastDate)) / 86400000);
    return { ...t, diff };
  }).filter(t => t.diff >= 10).sort((a, b) => b.diff - a.diff).slice(0, 5);

const today = new Date();
  today.setHours(0, 0, 0, 0);

 

  // Evrensel Widget Render Motoru
  const renderWidgetContent = (id) => {
    switch (id) {
      case "hizli-baglantilar": 
        return <HizliBaglantilarWidget />;
      case "youtube-kurs":
        return <YoutubeKursWidget />;
      case "spor-program": return <SportProgramWidget />;
      case "spor-gunluk": return <SportDailyWidget />;
      case "spor-hareketler": return <SportExercisesWidget />;
      case "gunluk-mod": return <MoodTrackerWidget />;
      case "gunluk-aliskanlik": return <PersonalHabitWidget />;
      case "gunluk-listeler": return <PersonalListsWidget />;
      case "gunluk-kitap": return <PersonalBooksWidget />;
      case "gunluk-medya": return <PersonalMediaWidget />;
      case "gunluk-regl": return <PersonalCycleWidget />;
      case "gunluk-butce": return <PersonalBudgetWidget />;
      case "gunluk-abonelik": return <PersonalSubscriptionWidget />;
      case "proje-fikirleri": 
        return <ProjeFikirleriWidget />;
      case "bugun-odak":
        return <BugunOdakWidget />
      case "is-kanban":
        return <WorkKanbanWidget />;
      case "aliskanlik-haftalik":
        return <HabitWeeklyWidget />;
      case "aliskanlik-aylik":
        return <HabitMonthlyWidget />;
      
      case "gunluk-ozet":
        return <DailySummary />;
      case "gorevler":
        return (
          <div>
            <div className="dashboard-ust">
              <div className="aciliyet-filtre-satiri">
                <button className={`aciliyet-filtre-btn ${globalUrgency === 'hepsi' ? 'aktif' : ''}`} onClick={() => setGlobalUrgency('hepsi')}>
                  Tümü
                </button>
                <button className={`aciliyet-filtre-btn ${globalUrgency === 'acil' ? 'aktif' : ''}`} onClick={() => setGlobalUrgency('acil')} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff6961' }}></span>
                  Acil
                </button>
                <button className={`aciliyet-filtre-btn ${globalUrgency === 'orta' ? 'aktif' : ''}`} onClick={() => setGlobalUrgency('orta')} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--renk-vurgu)' }}></span>
                  Orta
                </button>
                <button className={`aciliyet-filtre-btn ${globalUrgency === 'dusuk' ? 'aktif' : ''}`} onClick={() => setGlobalUrgency('dusuk')} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--renk-metin-ikincil)' }}></span>
                  Düşük
                </button>
              </div>
              <button className="kategori-ekle-butonu" onClick={() => setShowCategoryModal(true)}>+ Kategori Ekle</button>
            </div>
            
            <div className="kategoriler-alani" style={{ margin: 0 }}>
              {pageCategories.map(cat => (
                <TaskCategoryCard key={cat.id} category={cat} sourcePage={activePage} />
              ))}
            </div>
          </div>
        );
      case "takvim": {
        const currentWidget = activeWidgets.find(w => w.id === "takvim");
        return <CalendarView size={currentWidget?.genislik || 2} />;
      }
      case "not-defteri":
        return <Notebook />;
      case "pomodoro":
        return <Pomodoro />;
      
      // Ders Widget'ları
      case "ders-zayif-konular":
        return (
          <div>
            <div className="section-header"><h2>{simgesi("⚠️")} Zayıf Konular</h2></div>
            <div className="zayif-konular-grid">
              <div className="zayif-konular-kolon">
                <h4 className="zayif-konular-alt-baslik">📉 En Düşük Başarı</h4>
                {lowestRateTopics.length === 0 ? <p className="bos-durum-notu">Yeterli soru verisi yok.</p> : (
                  lowestRateTopics.map((t, idx) => (
                    <div key={idx} className="zayif-konu-satiri">
                      <span className="zayif-konu-adi">{t.konu.ad}</span>
                      <span className="zayif-konu-ders-etiketi">{t.dersAdi}</span>
                      <span className="zayif-konu-deger dusuk">%{t.rate}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="zayif-konular-kolon">
                <h4 className="zayif-konular-alt-baslik">⏳ Uzun Süredir Çalışılmayan</h4>
                {neglectedTopics.length === 0 ? <p className="bos-durum-notu">Tüm konular güncel 👍</p> : (
                  neglectedTopics.map((t, idx) => (
                    <div key={idx} className="zayif-konu-satiri">
                      <span className="zayif-konu-adi">{t.konu.ad}</span>
                      <span className="zayif-konu-ders-etiketi">{t.dersAdi}</span>
                      <span className="zayif-konu-deger">{t.diff} gün önce</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case "ders-calisma-plani":
        return (
          <div>
            <div className="section-header"><h2>{simgesi("🎯")} Günün Çalışma Planı</h2></div>
            <div className="calisma-plani-formu">
              <div className="gorev-formu-satir">
                <CustomSelect 
                  value={planDers} 
                  onChange={(val) => setPlanDers(val)} 
                  placeholder="Ders Seç..."
                  options={[
                    { value: "", label: "Ders Seç..." },
                    ...dersLessons.map(d => ({ value: d.ad, label: d.ad }))
                  ]} 
                />
                <input type="text" placeholder="Konu..." value={planKonu} onChange={e => setPlanKonu(e.target.value)} />
              </div>
              <div className="gorev-formu-satir">
                <input type="number" placeholder="Süre (saat)" value={planSure} onChange={e => setPlanSure(e.target.value)} />
                <input type="number" placeholder="Soru Sayısı" value={planSoru} onChange={e => setPlanSoru(e.target.value)} />
                <button className="ders-buyuk-buton" onClick={() => {
                  if (!planDers) return;
                  const p = { id: "p_" + Date.now(), tarih: todayStr, ders: planDers, konu: planKonu, sureHedefi: planSure, soruHedefi: planSoru, tamamlandi: false };
                  setDersData(prev => ({ ...prev, calismaPlani: [...(prev.calismaPlani || []), p] }));
                  setPlanKonu(''); setPlanSure(''); setPlanSoru('');
                }}>＋</button>
              </div>
            </div>
            <div className="calisma-plani-listesi" style={{ marginTop: '10px' }}>
              {calismaPlanlari.filter(p => p.tarih === todayStr).map(p => (
                <div key={p.id} className={`calisma-plani-satiri ${p.tamamlandi ? 'tamamlandi' : ''}`}>
                  <input type="checkbox" checked={p.tamamlandi} onChange={() => {
                    setDersData(prev => ({ ...prev, calismaPlani: prev.calismaPlani.map(x => x.id === p.id ? { ...x, tamamlandi: !x.tamamlandi } : x) }));
                  }} />
                  <div className="calisma-plani-metin">
                    <strong>{p.ders}</strong> {p.konu && `— ${p.konu}`}
                    <div className="calisma-plani-hedefler">
                      {p.sureHedefi > 0 && `⏱️ ${p.sureHedefi}s`} {p.soruHedefi > 0 && `📝 ${p.soruHedefi} soru`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "ders-ilerleme":
        return (
          <div>
            <div className="section-header"><h2>{simgesi("📚")} Ders İlerlemesi</h2></div>
            {dersLessons.map(d => {
              const bitti = d.konular.filter(k => ['bitti', 'tekrar_edildi'].includes(k.durum)).length;
              const percent = d.konular.length ? Math.round((bitti / d.konular.length) * 100) : 0;
              return (
                <div key={d.id} className="ders-ilerleme-satiri">
                  <span className="ders-ilerleme-ad">{d.ad}</span>
                  <div className="ilerleme-bar"><div className="ilerleme-dolu" style={{ width: `${percent}%` }}></div></div>
                  <span className="ilerleme-yuzde">%{percent}</span>
                </div>
              );
            })}
          </div>
        );

      case "ders-net-grafik":
        return (
          <div>
            <div className="section-header"><h2>{simgesi("📈")} Net Gelişimi</h2></div>
            {denemeListesi.length === 0 ? <p className="bos-durum-notu">Deneme kaydı yok.</p> : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '10px 0' }}>
                {denemeListesi.slice(0, 8).reverse().map((exam, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>{exam.toplamNet.toFixed(1)}</span>
                    <div style={{ width: '100%', height: `${Math.min(100, Math.max(10, exam.toplamNet * 0.8))}%`, background: 'var(--renk-vurgu)', borderRadius: '4px 4px 0 0' }}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // İş Modülü Widget'ları
      case "is-zaman":
        return (
          <div>
            <div className="section-header"><h2>{simgesi("🗓️")} Zaman Çizelgesi</h2></div>
            <div className="zaman-cizelgesi-govde">
              {(isData.projeler || []).length === 0 ? (
                <div className="bos-durum-notu">Henüz proje eklenmedi.</div>
              ) : (
                isData.projeler.map(p => {
                  const bDate = new Date(p.bitis + "T00:00:00");
                  const remaining = Math.round((bDate - today) / 86400000);
                  let statusClass = "normal";
                  if (remaining < 0) statusClass = "doldu";
                  else if (remaining <= 3) statusClass = "acil";
                  else if (remaining <= 7) statusClass = "yaklasan";

                  return (
                    <div key={p.id} className="zaman-satiri">
                      <div className="zaman-satiri-etiket">{p.ad}</div>
                      <div className="zaman-satiri-track">
                        <div className={`zaman-bar zaman-bar-${statusClass}`} style={{ width: '80%' }}>
                          <span className="zaman-bar-etiket">{remaining < 0 ? 'Süresi Doldu' : `${remaining} gün kaldı`}</span>
                        </div>
                      </div>
                      <button className="konu-sil-btn" onClick={() => setIsData(prev => ({ ...prev, projeler: prev.projeler.filter(item => item.id !== p.id) }))}>🗑️</button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="zaman-ekle-formu">
              <input type="text" placeholder="Proje Adı..." value={projName} onChange={e => setProjName(e.target.value)} />
              <CustomDatePicker value={projStart} onChange={val => setProjStart(val)} />
<CustomDatePicker value={projEnd} onChange={val => setProjEnd(val)} />
              <button className="ders-buyuk-buton" onClick={() => {
                if (!projName.trim() || !projStart || !projEnd) return;
                setIsData(prev => ({ ...prev, projeler: [...(prev.projeler || []), { id: "p_" + Date.now(), ad: projName.trim(), baslangic: projStart, bitis: projEnd }] }));
                setProjName(''); setProjStart(''); setProjEnd('');
              }}>＋</button>
            </div>
          </div>
        );

      case "is-fikirler":
        return (
          <div>
            <div className="section-header"><h2>{simgesi("💡")} Fikirler</h2></div>
            <textarea 
              rows="6" 
              placeholder="Aklına gelen fikirleri yaz..."
              value={isData.fikirler || ''}
              onChange={e => setIsData({ ...isData, fikirler: e.target.value })}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        );

      case "is-hizli-not":
        return (
          <div>
            <div className="section-header"><h2>{simgesi("⚡")} Hızlı Not</h2></div>
            <div className="gorev-formu-satir">
              <input type="text" placeholder="Hızlı not..." value={fastNote} onChange={e => setFastNote(e.target.value)} />
              <button className="ders-buyuk-buton" onClick={() => {
                if (!fastNote.trim()) return;
                setIsData(prev => ({ ...prev, hizliNotlar: [{ id: "fn_" + Date.now(), metin: fastNote, tarih: todayStr }, ...(prev.hizliNotlar || [])] }));
                setFastNote('');
              }}>Ekle</button>
            </div>
            <div className="hedef-listesi" style={{ marginTop: '10px' }}>
              {(isData.hizliNotlar || []).map(n => (
                <div key={n.id} className="hedef-item"><span className="hedef-metin">{n.metin}</span></div>
              ))}
            </div>
          </div>
        );
      case "konular-panel": return <KonularWidget />;
      case "deneme-ekle": return <DenemeEkleWidget />;
      case "deneme-gecmisi": return <DenemeGecmisiWidget />;
      case "deneme-istatistikler":
        return (
          <div>
            <div className="widget-ic-baslik"><h2>{simgesi("📊")} Deneme İstatistikleri</h2></div>
            {(dersData.denemeler || []).length === 0 ? <p className="bos-durum-notu widget-bos-durum">Henüz deneme kaydı yok. Deneme eklediğinde istatistikler burada görünecek.</p> : (
              <div className="konu-ozet-grid">
                <div className="konu-ozet-kutu"><div className="konu-ozet-deger">{dersData.denemeler.length}</div><div className="konu-ozet-etiket">Toplam Deneme</div></div>
                <div className="konu-ozet-kutu"><div className="konu-ozet-deger">{Math.max(...dersData.denemeler.map(exam => exam.toplamNet)).toFixed(2)}</div><div className="konu-ozet-etiket">En Yüksek Net</div></div>
                <div className="konu-ozet-kutu"><div className="konu-ozet-deger">{(dersData.denemeler.reduce((sum, exam) => sum + exam.toplamNet, 0) / dersData.denemeler.length).toFixed(2)}</div><div className="konu-ozet-etiket">Ortalama Net</div></div>
              </div>
            )}
          </div>
        );
      case "yanlis-analiz": return <YanlisAnalizWidget />;
      case "yanlis-ekle": return <YanlisEkleWidget />;
      case "yanlis-arsiv": return <YanlisArsivWidget />;
      case "takip-takvim": return <CalismaTakvimWidget />;
      case "takip-hedefler": return <HedeflerWidget />;
      default:
        return null;
    }
  };

  let examCountdown = "Sınav tarihi seçilmedi";
  if (dersData?.sinavTarihi) {
    const diff = Math.ceil((new Date(dersData.sinavTarihi) - new Date()) / (1000 * 60 * 60 * 24));
    examCountdown = diff > 0 ? `${diff} gün kaldı` : (diff === 0 ? "Sınav bugün!" : "Sınav tarihi geçti");
  }

  // Ders modülü için sabit alt sekmeler (Konular, Denemeler, Yanlışlar, Çalışma Takibi)
  if (authLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yükleniyor...</div>;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--renk-metin-ikincil)' }}>Yükleniyor...</div>}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onOpenAvatarModal={() => setShowAvatarModal(true)} />
      
      <main className="ana-icerik-alani" style={{ flex: 1 }}>
        {/* Topbar'a taşınan widget kontrol özellikleri */}
        <Topbar 
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          onOpenAddWidgetModal={() => { setSelectedWidgetIds([]); setShowAddModal(true); }}
          onResetWidgets={() => resetWidgets(currentTabId)}
          showEditControls={activePage !== 'ayarlar'}
        />

        {activePage !== 'ayarlar' ? (
          <div className="container">
            {/* SOLDA SELAMLAMA, SAĞDA TARİH - AYNI YATAY DÜZLEMDE */}
            <header className="ust-baslik" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {activePage === 'ana' && (
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                    {greetingText || userName}
                  </h1>
                )}
                {activePage === 'ders' && (
                  <>
                    <h1 style={{ margin: 0 }}>{simgesi("📚")} Ders Takip</h1>
                    <CustomSelect 
  value={dersData?.sinavTuru || "kpss_ortaogretim"} 
  onChange={(val) => changeExamType(val)}
  options={Object.keys(SINAV_MUFREDATLARI).map(k => ({
    value: k,
    label: SINAV_MUFREDATLARI[k].ad
  }))}
/>
                    <div className="kpss-geri-sayim-satiri" style={{ marginLeft: '8px' }}>
                      <span className="kpss-geri-sayim-metin">{simgesi("⏳")} {examCountdown}</span>
                      <CustomDatePicker 
  value={dersData?.sinavTarihi || ""} 
  onChange={val => setDersData(prev => ({ ...prev, sinavTarihi: val }))} 
/>
                    </div>
                  </>
                )}
                {activePage === 'is' && (
                  <h1 style={{ margin: 0 }}>{simgesi("💼")} İş Takip</h1>
                )}
                {currentPage && !['ana', 'ders', 'is'].includes(activePage) && (
                  <>
                    <h1 style={{ margin: 0 }}>{simgesi(currentPage.ikon)} {currentPage.ad}</h1>
                    {currentPage.templateId === 'spor' && <CustomSelect value={sportData?.sporTuru || 'Fitness'} onChange={val => setSportData(prev => ({ ...prev, sporTuru: val }))} options={['Pilates', 'Yoga', 'Fitness', 'Koşu', 'Yüzme', 'Dans'].map(value => ({ value, label: value }))} />}
                  </>
                )}
              </div>
              <div id="bugunTarih" style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--renk-metin-ikincil)', whiteSpace: 'nowrap' }}>
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </header>

            {/* Dinamik Sekme Barı */}
            <DynamicTabBar sayfaTuru={activePage} />

            {/* Dinamik Widget Grid Alanı - ARTIK TÜM SAYFALARDA AKTİF */}
            <div style={{ marginTop: '30px' }}>
              {activeWidgets.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="bos-durum-notu"
                  style={{ padding: '50px 20px', background: 'var(--renk-yuzey)', border: '2px dashed var(--renk-kenarlik)', borderRadius: '24px', margin: '16px 0' }}
                >
                  <p style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '600' }}>Bu sekmede widget bulunmuyor. Dilediğin widget'ları ekleyerek başlayabilirsin.</p>
                  <button type="button" className="ders-buyuk-buton" onClick={() => { setSelectedWidgetIds([]); setShowAddModal(true); }}>+ Widget Ekle</button>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    ref={widgetGridRef}
                    key={currentTabId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={`widget-grid ${isEditMode ? 'duzenle-modu' : ''} ${masonryReadyFor === currentTabId ? 'masonry-ready' : ''}`}
                    style={{ marginTop: '16px' }}
                  >
                    {activeWidgets.map((w) => {
                      const widgetInfo = ALL_WIDGETS.find(aw => aw.id === w.id);
                      return (
                        <motion.div
                          transition={{
                            opacity: { duration: 0.12 }
                          }}
                          key={w.id}
                          className={`widget-kutu ${isEditMode ? 'duzenle-modu' : ''} ${draggedWidgetId === w.id ? 'surukleniyor' : ''} ${dragOverWidgetId === w.id && draggedWidgetId !== w.id ? 'surukle-hedef' : ''}`}
                          data-genislik={Math.min(6, Math.max(1, w.genislik || 2))}
                          
                          /* ==========================================
                             GÜNCELLENMİŞ SÜRÜKLE & BIRAK EKLENTİSİ
                             ========================================== */
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            if (draggedWidgetId && draggedWidgetId !== w.id) setDragOverWidgetId(w.id);
                          }}

                          onDragLeave={() => setDragOverWidgetId(null)}
                          
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = "1"; // Bırakılınca veya iptal olunca saydamlık düzelir
                            setDraggedWidgetId(null);
                          }}
                          
                          onDrop={(e) => {
                            e.preventDefault();
                            
                            // Kendi üzerine bırakıldıysa veya bir sorun varsa saydamlığı geri al ve bitir
                            if (!draggedWidgetId || draggedWidgetId === w.id) {
                              e.currentTarget.style.opacity = "1";
                              return;
                            }
                            
                            const layout = widgetLayouts[currentTabId] || [];
                            const fromIndex = layout.findIndex(item => item.id === draggedWidgetId);
                            const targetIndex = layout.findIndex(item => item.id === w.id);
                            if (fromIndex !== -1 && targetIndex !== -1) {
                              reorderWidgets(currentTabId, fromIndex, targetIndex);
                            }
                            
                            e.currentTarget.style.opacity = "1";
                            setDraggedWidgetId(null);
                            setDragOverWidgetId(null);
                          }}
                          /* ========================================== */
                        >
                          {isEditMode && (
                            <div className="widget-arac-cubugu">
                              <div className="widget-arac-sol">
                                {/* İmleç grab (tutma eli) yapıldı */}
                                <span
                                  className="widget-surukle"
                                  title="Sürükleyip Taşı"
                                  draggable={isEditMode}
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    setDraggedWidgetId(w.id);
                                    e.dataTransfer.effectAllowed = "move";
                                    const preview = document.createElement('div');
                                    preview.className = 'widget-drag-preview';
                                    preview.innerHTML = `<span>${widgetInfo?.ikon || '📦'}</span><strong>${widgetInfo?.baslik || 'Widget'}</strong><small>Taşınıyor</small>`;
                                    document.body.appendChild(preview);
                                    e.dataTransfer.setDragImage(preview, 18, 22);
                                    setTimeout(() => preview.remove(), 0);
                                    e.currentTarget.closest('.widget-kutu').style.opacity = '0.4';
                                  }}
                                  onDragEnd={(e) => {
                                    e.stopPropagation();
                                    e.currentTarget.closest('.widget-kutu').style.opacity = '1';
                                    setDraggedWidgetId(null);
                                    setDragOverWidgetId(null);
                                  }}
                                >⠿</span>
                                <span className="widget-arac-baslik">
                                  {simgesi(widgetInfo?.ikon)} {widgetInfo?.baslik}
                                </span>
                              </div>
                              <div className="widget-arac-sag">
                                <div className="widget-mobil-siralama" aria-label="Widget sırasını değiştir">
                                  <button type="button" onClick={() => moveWidget(w.id, 'up')} disabled={activeWidgets[0]?.id === w.id} title="Yukarı taşı" aria-label="Yukarı taşı">↑</button>
                                  <button type="button" onClick={() => moveWidget(w.id, 'down')} disabled={activeWidgets[activeWidgets.length - 1]?.id === w.id} title="Aşağı taşı" aria-label="Aşağı taşı">↓</button>
                                </div>
                                <div className="widget-boyut-grubu">
                                  {[1, 2, 3, 4, 5, 6].map(size => (
                                    <button 
                                      key={size} 
                                      type="button" 
                                      className={`widget-boyut-btn ${w.genislik === size ? 'aktif' : ''}`} 
                                      onClick={() => updateWidgetWidth(currentTabId, w.id, size)}
                                    >
                                      {size === 6 ? 'Tam' : `${size}s`}
                                    </button>
                                  ))}
                                </div>
                                <button 
                                  type="button" 
                                  className="widget-gizle-btn" 
                                  onClick={() => toggleWidgetVisibility(currentTabId, w.id)}
                                  title="Gizle"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="widget-icerik" style={{ padding: isEditMode ? '8px' : '0' }}>
                            {renderWidgetContent(w.id)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        ) : (
          <SettingsModule />
        )}

        {/* Dialog / Prompt Modalı */}
        {dialogModal.isOpen && (
          <div className="modal-overlay" onClick={closeDialog} style={{ zIndex: 3000 }}>
            <div className="modal-kutu onay-modal-kutu" onClick={e => e.stopPropagation()}>
              <div className="modal-baslik">
                <h3>{dialogModal.title}</h3>
              </div>
              <p id="onayModalMesaj">{dialogModal.message}</p>

              {dialogModal.type === 'prompt' && (
                <input 
                  type="text" 
                  value={dialogModal.inputValue} 
                  maxLength={dialogModal.maxLength || 30}
                  onChange={e => setDialogModal({ ...dialogModal, inputValue: e.target.value.slice(0, dialogModal.maxLength || 30) })}
                  style={{ width: '100%', margin: '12px 0' }}
                  autoFocus 
                />
              )}

              <div className="modal-alt-bar">
                <button type="button" className="onay-modal-vazgec-btn" onClick={closeDialog}>
                  {dialogModal.cancelText}
                </button>
                <button 
                  type="button" 
                  className={`gorev-kaydet-btn ${dialogModal.isDanger ? 'onay-modal-onayla-btn tehlikeli' : ''}`}
                  onClick={() => {
                    if (dialogModal.type === 'prompt') {
                      dialogModal.onConfirm(dialogModal.inputValue);
                    } else {
                      dialogModal.onConfirm();
                    }
                  }}
                >
                  {dialogModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kategorize Edilmiş Widget Ekleme Modalı */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => { setShowAddModal(false); setSelectedWidgetIds([]); }}>
            <div className="modal-kutu" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-baslik">
                <h3>Widget Ekle</h3>
                <button className="gun-detay-kapat" onClick={() => setShowAddModal(false)}>✕</button>
              </div>

              <div className="tekrar-butonlari" style={{ margin: '10px 0' }}>
                {widgetCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`tekrar-btn ${selectedWidgetCat === cat ? 'aktif' : ''}`}
                    onClick={() => setSelectedWidgetCat(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="widget-ekle-listesi" style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {filteredUnaddedWidgets.length === 0 ? (
                  <p className="bos-liste-notu">Bu kategoride eklenebilecek widget bulunamadı.</p>
                ) : (
                  filteredUnaddedWidgets.map(widget => (
                    <button
                      key={widget.id} 
                      type="button" 
                      className={`widget-ekle-oge ${selectedWidgetIds.includes(widget.id) ? 'secili' : ''}`}
                      onClick={() => toggleWidgetSelection(widget.id)}
                    >
                      <span className="widget-ekle-checkbox" aria-hidden="true">{selectedWidgetIds.includes(widget.id) ? '✓' : ''}</span>
                      <span className="widget-ekle-ikon">{simgesi(widget.ikon)}</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold' }}>{widget.baslik}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{widget.kategori}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="widget-ekle-alt-bar">
                <span>{selectedWidgetIds.length > 0 ? `${selectedWidgetIds.length} widget seçildi` : 'Eklemek istediğin widgetları seç'}</span>
                <button type="button" className="ders-buyuk-buton" disabled={selectedWidgetIds.length === 0} onClick={addSelectedWidgets}>
                  Seçilenleri Ekle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* İlk Giriş Modalı */}
        {showWelcomeModal && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: 2000 }}>
            <div className="modal-kutu" style={{ textAlign: 'center', maxWidth: '380px' }}>
              <div style={{ fontSize: '40px', marginBottom: '4px' }}>👋</div>
              <h2 style={{ margin: 0 }}>Hoş Geldin!</h2>
              <p style={{ margin: 0, color: 'var(--renk-metin-ikincil)' }}>Panelini sana özel hale getirebilmemiz için lütfen adını yaz:</p>
              <input type="text" placeholder="Adın..." value={welcomeInput} onChange={e => setWelcomeInput(e.target.value)} style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', margin: '14px 0' }} autoFocus />
              <button className="ders-buyuk-buton" style={{ width: '100%' }} onClick={() => { if (welcomeInput.trim()) { setUserName(welcomeInput.trim()); setShowWelcomeModal(false); } }}>Başlayalım 🚀</button>
            </div>
          </div>
        )}

        {/* Avatar Modalı */}
        {showAvatarModal && (
          <div className="modal-overlay" onClick={() => setShowAvatarModal(false)} style={{ zIndex: 1500 }}>
            <div className="modal-kutu" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-baslik"><h3>Avatar Seçimi</h3><button className="gun-detay-kapat" onClick={() => setShowAvatarModal(false)}>✕</button></div>
              <div>
                <label className="modal-label">Cihazından Fotoğraf Yükle</label>
                <label className="ders-buyuk-buton" style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                  🖼️ Fotoğraf Seç
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { setUserAvatar({ tip: 'gorsel', deger: reader.result }); setShowAvatarModal(false); }; reader.readAsDataURL(file); }} />
                </label>
              </div>
              <div style={{ marginTop: '14px' }}>
                <label className="modal-label">Veya Emoji Seç</label>
                <div className="emoji-havuzu">
                  {EMOJI_HAVUZU.map(emoji => (
                    <button key={emoji} type="button" className="emoji-btn" onClick={() => { setUserAvatar({ tip: 'emoji', deger: emoji }); setShowAvatarModal(false); }}>{emoji}</button>
                  ))}
                </div>
              </div>
              <div className="modal-alt-bar"><button type="button" className="onay-modal-vazgec-btn" onClick={() => { setUserAvatar(null); setShowAvatarModal(false); }}>İsmin Harflerine Dön</button></div>
            </div>
          </div>
        )}

        {/* Kategori Ekleme Modalı */}
        {showCategoryModal && (
          <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
            <div className="modal-kutu" onClick={e => e.stopPropagation()}>
              <div className="modal-baslik"><h3>Yeni Kategori</h3><button className="gun-detay-kapat" onClick={() => setShowCategoryModal(false)}>✕</button></div>
              <div>
                <label className="modal-label">Kategori adı</label>
                <input type="text" placeholder="Örn: Pazarlama, Proje A..." value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              </div>
              <div>
                <label className="modal-label">Bağlantılı Sayfa / Modül</label>
                <select value={newCatBinding} onChange={e => setNewCatBinding(e.target.value)}>
                  <option value="bagimsiz">🔗 Bağımsız Kategori (Genel Panel)</option>
                  <option value="is">💼 İş Takip Sayfasına Bağla</option>
                  <option value="ders">📚 Ders Takip Sayfasına Bağla</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input type="checkbox" id="modalCatShowHome" checked={newCatShowOnHome} onChange={e => setNewCatShowOnHome(e.target.checked)} />
                <label htmlFor="modalCatShowHome" style={{ fontSize: '13px' }}>🏠 Ana sayfada göster</label>
              </div>
              <div>
                <label className="modal-label">Simge seç</label>
                <div className="emoji-havuzu">
                  {EMOJI_HAVUZU.map(emoji => (
                    <button key={emoji} type="button" className={`emoji-btn ${newCatIcon === emoji ? 'secili' : ''}`} onClick={() => setNewCatIcon(emoji)}>{emoji}</button>
                  ))}
                </div>
              </div>
              <div className="modal-alt-bar">
                <span>Seçili: {newCatIcon}</span>
                <button className="gorev-kaydet-btn" onClick={() => {
                  if (newCatName.trim()) {
                    addCategory({ name: newCatName.trim(), icon: newCatIcon, baglanti: newCatBinding, anaSayfadaGoster: newCatShowOnHome });
                    setNewCatName('');
                    setShowCategoryModal(false);
                  }
                }}>Kategori Ekle</button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </Suspense>
  );
}