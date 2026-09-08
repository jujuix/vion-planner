import './ui-kit.css';

const THEMES = [
  { name: 'Vion Blue', color: '#4f6bff' },
  { name: 'Indigo', color: '#6655d9' },
  { name: 'Emerald', color: '#159570' },
  { name: 'Rose', color: '#d85d82' },
  { name: 'Amber', color: '#d28a25' },
];

export default function UiKitPreview() {
  return (
    <main className="ui-kit">
      <header className="ui-kit-header">
        <div>
          <p className="ui-kit-eyebrow">Vion. design system</p>
          <h1>UI kit preview</h1>
          <p>Yoğun veri ekranları için sade, kompakt ve tutarlı arayüz temeli.</p>
        </div>
        <button type="button" className="ui-kit-button primary">Yeni kayıt</button>
      </header>

      <section className="ui-kit-section">
        <div className="ui-kit-section-title"><h2>Renk temaları</h2><span>Preset + custom accent</span></div>
        <div className="ui-kit-themes">
          {THEMES.map(theme => <button type="button" className="ui-kit-theme" key={theme.name}><i style={{ background: theme.color }} />{theme.name}</button>)}
          <button type="button" className="ui-kit-theme custom"><i />Özel renk seç</button>
        </div>
      </section>

      <div className="ui-kit-grid">
        <section className="ui-kit-section">
          <div className="ui-kit-section-title"><h2>Butonlar ve form</h2><span>Compact controls</span></div>
          <div className="ui-kit-actions"><button type="button" className="ui-kit-button primary">Kaydet</button><button type="button" className="ui-kit-button">İptal</button><button type="button" className="ui-kit-button danger">Arşivle</button></div>
          <label className="ui-kit-field">Görev başlığı<input placeholder="Yeni görev yaz..." /></label>
          <div className="ui-kit-fields"><label className="ui-kit-field">Tarih<input type="text" placeholder="12 Eylül 2026" /></label><label className="ui-kit-field">Öncelik<select defaultValue="high"><option value="high">Yüksek</option><option value="medium">Orta</option><option value="low">Düşük</option></select></label></div>
        </section>

        <section className="ui-kit-section">
          <div className="ui-kit-section-title"><h2>Durumlar</h2><span>Clear feedback</span></div>
          <div className="ui-kit-state success"><b>✓ Başarılı</b><span>Kayıt güncellendi.</span><button type="button">Kapat</button></div>
          <div className="ui-kit-state warning"><b>! Uyarı</b><span>Eksik alanları kontrol et.</span><button type="button">Düzenle</button></div>
          <div className="ui-kit-state error"><b>× Hata</b><span>Veri yüklenemedi.</span><button type="button">Tekrar dene</button></div>
        </section>
      </div>

      <section className="ui-kit-section">
        <div className="ui-kit-section-title"><h2>Yoğun veri tablosu</h2><span>List-first layout</span></div>
        <div className="ui-kit-tabs"><button type="button" className="active">Tümü <small>12</small></button><button type="button">Bugün <small>4</small></button><button type="button">Arşiv <small>2</small></button></div>
        <div className="ui-kit-table-wrap"><table><thead><tr><th>Görev</th><th>Alan</th><th>Durum</th><th>Tarih</th></tr></thead><tbody><tr><td><span className="ui-kit-dot" />Matematik denemesi çöz</td><td>Eğitim</td><td><em className="pill blue">Devam ediyor</em></td><td>Bugün</td></tr><tr><td><span className="ui-kit-dot done" />Haftalık planı gözden geçir</td><td>Kişisel</td><td><em className="pill green">Tamamlandı</em></td><td>11 Eyl</td></tr></tbody></table></div>
      </section>
    </main>
  );
}
