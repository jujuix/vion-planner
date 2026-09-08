export const PAGE_DEFINITIONS = [
  { id: 'overview', label: 'Ana Sayfa', icon: '⌂', description: 'Bugünün planını ve önemli alanlarını tek yerde gör.' },
  { id: 'routines', label: 'Rutinler', icon: '↻', description: 'Günlük alışkanlıklarını ve tekrar eden planlarını takip et.' },
  { id: 'goals', label: 'Hedefler', icon: '◎', description: 'Büyük hedeflerini küçük ve ölçülebilir adımlara böl.' },
  { id: 'tasks', label: 'Görevler', icon: '✓', description: 'Tüm görevlerini önceliklendir ve tamamla.' },
  { id: 'journal', label: 'Notlar', icon: '▤', description: 'Düşüncelerini, fikirlerini ve günlük notlarını kaydet.' },
  { id: 'summary', label: 'Alanlar', icon: '▥', description: 'Eğitim, spor, kişisel ve iş alanlarını birlikte yönet.' },
];

export const DEFAULT_WIDGETS = {
  overview: ['focus', 'routine', 'goals', 'tasks', 'journal', 'balance'],
  routines: ['routine', 'balance'],
  goals: ['goals', 'focus'],
  tasks: ['tasks', 'focus'],
  journal: ['journal', 'balance'],
  summary: ['balance', 'goals', 'routine'],
};
