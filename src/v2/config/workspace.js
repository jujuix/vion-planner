export const PAGE_DEFINITIONS = [
  { id: 'overview', label: 'Ana Sayfa', icon: '⌂', description: 'Bugünün planını ve önemli alanlarını tek yerde gör.' },
  { id: 'tasks', label: 'Görevler', icon: '✓', description: 'Tüm görevlerini önceliklendir ve tamamla.' },
  { id: 'calendar', label: 'Takvim', icon: '▣', description: 'Zamanını, etkinliklerini ve planlarını gör.' },
  { id: 'notes', label: 'Notlar', icon: '▤', description: 'Düşüncelerini, fikirlerini ve günlük notlarını kaydet.' },
  { id: 'goals', label: 'Hedefler', icon: '◎', description: 'Büyük hedeflerini küçük ve ölçülebilir adımlara böl.' },
  { id: 'areas', label: 'Alanlar', icon: '▥', description: 'Eğitim, spor, kişisel ve iş alanlarını birlikte yönet.' },
];

export const DEFAULT_WIDGETS = {
  overview: ['focus', 'routine', 'goals', 'tasks', 'journal', 'balance'],
  tasks: ['tasks', 'focus'],
  calendar: ['routine', 'balance'],
  notes: ['journal', 'focus'],
  goals: ['goals', 'focus'],
  areas: ['balance', 'goals', 'routine'],
};
