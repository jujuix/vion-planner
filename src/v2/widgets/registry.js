import BalanceWidget from './BalanceWidget';
import FocusWidget from './FocusWidget';
import GoalsWidget from './GoalsWidget';
import JournalWidget from './JournalWidget';
import RoutineWidget from './RoutineWidget';
import TasksWidget from './TasksWidget';

export const WIDGETS = {
  focus: { title: 'Bugünün odağı', description: 'Bugün için en önemli işi belirle.', icon: '✦', tone: 'violet', Component: FocusWidget },
  routine: { title: 'Rutinler', description: 'Günlük alışkanlıklarını tek yerde takip et.', icon: '↻', tone: 'mint', Component: RoutineWidget },
  goals: { title: 'Hedef ilerlemesi', description: 'Büyük hedeflerini küçük adımlara böl.', icon: '◎', tone: 'blue', Component: GoalsWidget },
  tasks: { title: 'Görev listesi', description: 'Öncelikli işlerini planla ve tamamla.', icon: '✓', tone: 'orange', Component: TasksWidget },
  journal: { title: 'Günlük notu', description: 'Bugününü birkaç cümleyle kaydet.', icon: '▤', tone: 'pink', Component: JournalWidget },
  balance: { title: 'Gün dengesi', description: 'Çalışma, dinlenme ve kişisel zamanını gör.', icon: '◌', tone: 'yellow', Component: BalanceWidget },
};
