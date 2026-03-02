import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type LangId = 'ar' | 'en' | 'fr';

export interface LangConfig {
  id: LangId;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const languages: LangConfig[] = [
  { id: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { id: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
];

// ========== TRANSLATIONS ==========
const translations = {
  // ---- App / General ----
  appName: { ar: 'LevelUp Life', en: 'LevelUp Life', fr: 'LevelUp Life' },
  appSlogan: { ar: 'نظام تطوير حياة متكامل', en: 'Integrated Life System', fr: 'Système de vie intégré' },
  dataLocal: { ar: '🔒 بيانات محفوظة محلياً', en: '🔒 Data stored locally', fr: '🔒 Données stockées localement' },
  madeBy: { ar: 'صنع بـ ❤️ DigitPro', en: 'Made with ❤️ by DigitPro', fr: 'Fait avec ❤️ par DigitPro' },
  changeTheme: { ar: 'تغيير الثيم', en: 'Change Theme', fr: 'Changer le thème' },
  contactDev: { ar: 'تواصل مع المطور', en: 'Contact Developer', fr: 'Contacter le développeur' },
  supportGroup: { ar: 'مجموعة الدعم', en: 'Support Group', fr: 'Groupe de soutien' },

  // ---- Navigation / Pages ----
  navDashboard: { ar: 'لوحة التحكم', en: 'Dashboard', fr: 'Tableau de bord' },
  navGoals: { ar: 'الأهداف', en: 'Goals', fr: 'Objectifs' },
  navTasks: { ar: 'المهام', en: 'Tasks', fr: 'Tâches' },
  navFocus: { ar: 'التركيز', en: 'Focus', fr: 'Concentration' },
  navHabits: { ar: 'العادات', en: 'Habits', fr: 'Habitudes' },
  navAnalytics: { ar: 'التحليلات', en: 'Analytics', fr: 'Analyses' },
  navContact: { ar: 'متجر الإضافات', en: 'Extensions Store', fr: `Boutique d'extensions` },
  navSettings: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres' },

  // ---- Page Titles (header) ----
  pageDashboard: { ar: 'لوحة التحكم', en: 'Dashboard', fr: 'Tableau de bord' },
  pageGoals: { ar: 'الأهداف الكبرى', en: 'Major Goals', fr: 'Objectifs majeurs' },
  pageTasks: { ar: 'المهام', en: 'Tasks', fr: 'Tâches' },
  pageFocus: { ar: 'جلسات التركيز', en: 'Focus Sessions', fr: 'Sessions de concentration' },
  pageHabits: { ar: 'العادات اليومية', en: 'Daily Habits', fr: 'Habitudes quotidiennes' },
  pageAnalytics: { ar: 'التحليلات', en: 'Analytics', fr: 'Analyses' },
  pageContact: { ar: 'متجر الإضافات', en: 'Extensions Store', fr: `Boutique d'extensions` },
  pageSettings: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres' },

  // ---- Sidebar Level / Points ----
  level: { ar: 'المستوى', en: 'Level', fr: 'Niveau' },
  points: { ar: 'نقطة', en: 'points', fr: 'points' },
  toNextLevel: { ar: 'للمستوى التالي', en: 'to next level', fr: 'au niveau suivant' },
  consecutiveDays: { ar: 'يوم متتالي!', en: 'consecutive days!', fr: 'jours consécutifs !' },
  keepGoing: { ar: 'استمر في الالتزام!', en: 'Keep going!', fr: 'Continuez !' },
  levelTitles: {
    ar: ['مبتدئ', 'نشيط', 'متميز', 'محترف', 'خبير', 'أسطوري', 'أسطوري+'],
    en: ['Beginner', 'Active', 'Outstanding', 'Professional', 'Expert', 'Legendary', 'Legendary+'],
    fr: ['Débutant', 'Actif', 'Remarquable', 'Professionnel', 'Expert', 'Légendaire', 'Légendaire+'],
  },

  // ---- Dashboard ----
  greetingMorning: { ar: 'صباح الخير ☀️', en: 'Good morning ☀️', fr: 'Bonjour ☀️' },
  greetingAfternoon: { ar: 'مرحباً 🌤️', en: 'Good afternoon 🌤️', fr: 'Bon après-midi 🌤️' },
  greetingEvening: { ar: 'مساء النور 🌅', en: 'Good evening 🌅', fr: 'Bonsoir 🌅' },
  greetingNight: { ar: 'مساء الخير 🌙', en: 'Good night 🌙', fr: 'Bonne nuit 🌙' },
  greetingMorningSub: { ar: 'يوم جديد مليء بالإنجازات!', en: 'A new day full of achievements!', fr: 'Une nouvelle journée pleine de réalisations !' },
  greetingAfternoonSub: { ar: 'استمر في العمل الرائع!', en: 'Keep up the great work!', fr: 'Continuez votre excellent travail !' },
  greetingEveningSub: { ar: 'أوشك اليوم على الانتهاء!', en: 'The day is almost over!', fr: 'La journée touche à sa fin !' },
  greetingNightSub: { ar: 'اختم يومك بإنجاز!', en: 'End your day with an achievement!', fr: 'Terminez votre journée avec une réalisation !' },
  greetingLateSub: { ar: 'وقت متأخر! خذ قسطاً من الراحة', en: 'Late! Get some rest', fr: 'Tard ! Reposez-vous' },
  tasksCompleted: { ar: 'المهام المنجزة', en: 'Tasks Completed', fr: 'Tâches accomplies' },
  focusMinutes: { ar: 'دقائق التركيز', en: 'Focus Minutes', fr: 'Minutes de concentration' },
  habitsCompleted: { ar: 'العادات المنجزة', en: 'Habits Completed', fr: 'Habitudes accomplies' },
  productivity: { ar: 'الإنتاجية', en: 'Productivity', fr: 'Productivité' },
  fromTasks: { ar: 'مهمة', en: 'tasks', fr: 'tâches' },
  sessionToday: { ar: 'جلسة اليوم', en: 'sessions today', fr: 'sessions aujourd\'hui' },
  fromHabits: { ar: 'عادة', en: 'habits', fr: 'habitudes' },
  activeGoals: { ar: 'الأهداف النشطة', en: 'Active Goals', fr: 'Objectifs actifs' },
  upcomingTasks: { ar: 'المهام القادمة', en: 'Upcoming Tasks', fr: 'Tâches à venir' },
  viewAll: { ar: 'عرض الكل', en: 'View All', fr: 'Voir tout' },
  noActiveGoals: { ar: 'لا توجد أهداف نشطة', en: 'No active goals', fr: 'Aucun objectif actif' },
  addFirstGoal: { ar: 'أضف هدفاً جديداً ←', en: 'Add a new goal ←', fr: 'Ajouter un objectif ←' },
  noPendingTasks: { ar: 'لا توجد مهام معلقة', en: 'No pending tasks', fr: 'Aucune tâche en attente' },
  addFirstTask: { ar: 'أضف مهمة جديدة ←', en: 'Add a new task ←', fr: 'Ajouter une tâche ←' },
  quickActions: { ar: 'إجراءات سريعة', en: 'Quick Actions', fr: 'Actions rapides' },
  newGoal: { ar: 'هدف جديد', en: 'New Goal', fr: 'Nouvel objectif' },
  newTask: { ar: 'مهمة جديدة', en: 'New Task', fr: 'Nouvelle tâche' },
  startFocus: { ar: 'ابدأ التركيز', en: 'Start Focus', fr: 'Démarrer la concentration' },
  trackHabits: { ar: 'تتبع العادات', en: 'Track Habits', fr: 'Suivre les habitudes' },
  noDate: { ar: 'بدون موعد', en: 'No date', fr: 'Sans date' },
  minute: { ar: 'دقيقة', en: 'min', fr: 'min' },
  overdue: { ar: '⚠️ متأخرة', en: '⚠️ Overdue', fr: '⚠️ En retard' },
  day: { ar: 'يوم', en: 'day', fr: 'jour' },
  days: { ar: 'يوم', en: 'days', fr: 'jours' },

  // ---- Goals ----
  majorGoals: { ar: 'الأهداف الكبرى', en: 'Major Goals', fr: 'Objectifs majeurs' },
  goalsSubtitle: { ar: 'حدد أهدافك طويلة المدى وتابع تقدمك', en: 'Set your long-term goals and track progress', fr: 'Définissez vos objectifs à long terme et suivez vos progrès' },
  all: { ar: 'الكل', en: 'All', fr: 'Tous' },
  active: { ar: 'نشطة', en: 'Active', fr: 'Actifs' },
  completed: { ar: 'مكتملة', en: 'Completed', fr: 'Terminés' },
  editGoal: { ar: '✏️ تعديل الهدف', en: '✏️ Edit Goal', fr: '✏️ Modifier l\'objectif' },
  newGoalTitle: { ar: '🎯 هدف جديد', en: '🎯 New Goal', fr: '🎯 Nouvel objectif' },
  goalTitle: { ar: 'عنوان الهدف', en: 'Goal Title', fr: 'Titre de l\'objectif' },
  goalTitlePlaceholder: { ar: 'مثال: تعلم البرمجة', en: 'e.g., Learn programming', fr: 'ex., Apprendre la programmation' },
  description: { ar: 'الوصف', en: 'Description', fr: 'Description' },
  descriptionPlaceholder: { ar: 'وصف مختصر للهدف...', en: 'Brief description...', fr: 'Brève description...' },
  targetDate: { ar: '📅 تاريخ الإنجاز', en: '📅 Target Date', fr: '📅 Date cible' },
  priority: { ar: '🚩 الأولوية', en: '🚩 Priority', fr: '🚩 Priorité' },
  priorityLow: { ar: '🟢 منخفضة', en: '🟢 Low', fr: '🟢 Basse' },
  priorityMedium: { ar: '🟡 متوسطة', en: '🟡 Medium', fr: '🟡 Moyenne' },
  priorityHigh: { ar: '🔴 عالية', en: '🔴 High', fr: '🔴 Haute' },
  priorityLowShort: { ar: 'منخفضة', en: 'Low', fr: 'Basse' },
  priorityMediumShort: { ar: 'متوسطة', en: 'Medium', fr: 'Moyenne' },
  priorityHighShort: { ar: 'عالية', en: 'High', fr: 'Haute' },
  saveChanges: { ar: '💾 حفظ التعديلات', en: '💾 Save Changes', fr: '💾 Enregistrer' },
  addGoal: { ar: 'إضافة الهدف', en: 'Add Goal', fr: 'Ajouter l\'objectif' },
  noGoalsYet: { ar: 'لا توجد أهداف بعد', en: 'No goals yet', fr: 'Aucun objectif pour le moment' },
  startAddGoal: { ar: 'ابدأ بإضافة هدفك الأول!', en: 'Start by adding your first goal!', fr: 'Commencez par ajouter votre premier objectif !' },
  deleteGoalConfirm: { ar: 'هل أنت متأكد من حذف هذا الهدف وجميع مهامه؟', en: 'Are you sure you want to delete this goal and all its tasks?', fr: 'Êtes-vous sûr de vouloir supprimer cet objectif et toutes ses tâches ?' },
  task: { ar: 'مهمة', en: 'task', fr: 'tâche' },
  late: { ar: 'متأخر!', en: 'Late!', fr: 'En retard !' },

  // ---- Tasks ----
  tasksTitle: { ar: 'المهام', en: 'Tasks', fr: 'Tâches' },
  tasksSubtitle: { ar: 'نظّم مهامك وتابع إنجازها', en: 'Organize your tasks and track completion', fr: 'Organisez vos tâches et suivez leur achèvement' },
  editTask: { ar: '✏️ تعديل المهمة', en: '✏️ Edit Task', fr: '✏️ Modifier la tâche' },
  newTaskTitle: { ar: '✅ مهمة جديدة', en: '✅ New Task', fr: '✅ Nouvelle tâche' },
  taskTitle: { ar: 'عنوان المهمة', en: 'Task Title', fr: 'Titre de la tâche' },
  taskTitlePlaceholder: { ar: 'مثال: قراءة الفصل الأول', en: 'e.g., Read the first chapter', fr: 'ex., Lire le premier chapitre' },
  taskDescPlaceholder: { ar: 'تفاصيل المهمة...', en: 'Task details...', fr: 'Détails de la tâche...' },
  linkedGoal: { ar: '🎯 الهدف المرتبط', en: '🎯 Linked Goal', fr: '🎯 Objectif lié' },
  noGoal: { ar: 'بدون هدف', en: 'No goal', fr: 'Sans objectif' },
  dueDate: { ar: '📅 الموعد', en: '📅 Due Date', fr: '📅 Échéance' },
  duration: { ar: '⏱ المدة', en: '⏱ Duration', fr: '⏱ Durée' },
  addTask: { ar: 'إضافة المهمة', en: 'Add Task', fr: 'Ajouter la tâche' },
  pending: { ar: 'معلقة', en: 'Pending', fr: 'En attente' },
  today: { ar: 'اليوم', en: 'Today', fr: 'Aujourd\'hui' },
  noTasks: { ar: 'لا توجد مهام', en: 'No tasks', fr: 'Aucune tâche' },
  addFirstTaskShort: { ar: 'أضف مهمتك الأولى!', en: 'Add your first task!', fr: 'Ajoutez votre première tâche !' },

  // ---- Focus Timer ----
  focusSessions: { ar: 'جلسات التركيز', en: 'Focus Sessions', fr: 'Sessions de concentration' },
  focusSubtitle: { ar: 'تقنية بومودورو لزيادة إنتاجيتك', en: 'Pomodoro technique to boost productivity', fr: 'Technique Pomodoro pour augmenter votre productivité' },
  deepFocus: { ar: 'تركيز عميق', en: 'Deep Focus', fr: 'Concentration profonde' },
  shortBreak: { ar: 'استراحة قصيرة', en: 'Short Break', fr: 'Pause courte' },
  longBreak: { ar: 'استراحة طويلة', en: 'Long Break', fr: 'Pause longue' },
  session: { ar: 'الجلسة', en: 'Session', fr: 'Session' },
  pauseTimer: { ar: 'إيقاف مؤقت', en: 'Pause', fr: 'Pause' },
  startTimer: { ar: 'ابدأ التركيز', en: 'Start Focus', fr: 'Démarrer' },
  linkToTask: { ar: 'ربط بمهمة', en: 'Link to Task', fr: 'Lier à une tâche' },
  noSpecificTask: { ar: 'بدون مهمة محددة', en: 'No specific task', fr: 'Aucune tâche spécifique' },
  todayStats: { ar: 'إحصائيات اليوم', en: 'Today\'s Stats', fr: 'Statistiques du jour' },
  completedSessions: { ar: 'جلسات مكتملة', en: 'Completed Sessions', fr: 'Sessions terminées' },
  focusMinutesLabel: { ar: 'دقائق تركيز', en: 'Focus Minutes', fr: 'Minutes de concentration' },
  earnedPoints: { ar: 'نقاط مكتسبة', en: 'Points Earned', fr: 'Points gagnés' },
  tip: { ar: 'نصيحة', en: 'Tip', fr: 'Conseil' },
  focusTips: {
    ar: ['أغلق جميع الإشعارات 📴', 'ركز على مهمة واحدة فقط 🎯', 'خذ نفساً عميقاً 🌬️', 'اجلس بشكل مريح 🪑', 'اشرب الماء 💧', 'ابتعد عن المشتتات 🚫'],
    en: ['Turn off all notifications 📴', 'Focus on one task only 🎯', 'Take a deep breath 🌬️', 'Sit comfortably 🪑', 'Drink water 💧', 'Avoid distractions 🚫'],
    fr: ['Désactivez les notifications 📴', 'Concentrez-vous sur une tâche 🎯', 'Respirez profondément 🌬️', 'Asseyez-vous confortablement 🪑', 'Buvez de l\'eau 💧', 'Évitez les distractions 🚫'],
  },

  // ---- Habits ----
  dailyHabits: { ar: 'العادات اليومية', en: 'Daily Habits', fr: 'Habitudes quotidiennes' },
  habitsSubtitle: { ar: 'ابنِ عادات إيجابية وتابع التزامك', en: 'Build positive habits and track consistency', fr: 'Construisez des habitudes positives et suivez votre régularité' },
  newHabit: { ar: 'عادة جديدة', en: 'New Habit', fr: 'Nouvelle habitude' },
  editHabit: { ar: '✏️ تعديل العادة', en: '✏️ Edit Habit', fr: '✏️ Modifier l\'habitude' },
  newHabitTitle: { ar: '💪 عادة جديدة', en: '💪 New Habit', fr: '💪 Nouvelle habitude' },
  habitName: { ar: 'اسم العادة', en: 'Habit Name', fr: 'Nom de l\'habitude' },
  habitNamePlaceholder: { ar: 'مثال: قراءة 30 دقيقة', en: 'e.g., Read for 30 minutes', fr: 'ex., Lire 30 minutes' },
  habitDescPlaceholder: { ar: 'وصف العادة...', en: 'Habit description...', fr: 'Description de l\'habitude...' },
  weeklyGoal: { ar: '🎯 الهدف الأسبوعي (مرات/أسبوع)', en: '🎯 Weekly Goal (times/week)', fr: '🎯 Objectif hebdomadaire (fois/semaine)' },
  addHabit: { ar: 'إضافة العادة', en: 'Add Habit', fr: 'Ajouter l\'habitude' },
  todayAchievement: { ar: 'إنجاز اليوم 🌟', en: 'Today\'s Achievement 🌟', fr: 'Réalisation du jour 🌟' },
  allHabitsDone: { ar: '🎉 أحسنت! أنجزت جميع العادات!', en: '🎉 Great! All habits done!', fr: '🎉 Bravo ! Toutes les habitudes terminées !' },
  halfwayThere: { ar: '💪 استمر، أنت في المنتصف!', en: '💪 Keep going, halfway there!', fr: '💪 Continuez, vous êtes à mi-chemin !' },
  startStrong: { ar: '🚀 ابدأ يومك بقوة!', en: '🚀 Start your day strong!', fr: '🚀 Commencez votre journée en force !' },
  noHabitsYet: { ar: 'لا توجد عادات بعد', en: 'No habits yet', fr: 'Aucune habitude pour le moment' },
  startBuilding: { ar: 'ابدأ ببناء عاداتك الإيجابية!', en: 'Start building positive habits!', fr: 'Commencez à construire des habitudes positives !' },
  deleteHabitConfirm: { ar: 'هل أنت متأكد من حذف هذه العادة؟', en: 'Are you sure you want to delete this habit?', fr: 'Êtes-vous sûr de vouloir supprimer cette habitude ?' },
  thisWeek: { ar: 'هذا الأسبوع', en: 'this week', fr: 'cette semaine' },
  goalAchieved: { ar: '🏆 هدف محقق!', en: '🏆 Goal achieved!', fr: '🏆 Objectif atteint !' },
  dayNames: {
    ar: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  },

  // ---- Analytics ----
  analyticsTitle: { ar: 'التحليلات والأداء', en: 'Analytics & Performance', fr: 'Analyses et Performance' },
  analyticsSubtitle: { ar: 'تابع إحصائياتك وتقدمك', en: 'Track your stats and progress', fr: 'Suivez vos statistiques et progrès' },
  totalPoints: { ar: 'إجمالي النقاط', en: 'Total Points', fr: 'Points totaux' },
  levelLabel: { ar: 'المستوى', en: 'Level', fr: 'Niveau' },
  goalsCompleted: { ar: 'الأهداف المنجزة', en: 'Goals Completed', fr: 'Objectifs terminés' },
  totalTasksCompleted: { ar: 'المهام المنجزة', en: 'Tasks Completed', fr: 'Tâches accomplies' },
  totalFocusMinutes: { ar: 'دقائق التركيز', en: 'Focus Minutes', fr: 'Minutes de concentration' },
  totalFocusSessions: { ar: 'جلسات التركيز', en: 'Focus Sessions', fr: 'Sessions de concentration' },
  commitmentStreak: { ar: 'سلسلة الالتزام', en: 'Commitment Streak', fr: 'Série d\'engagement' },
  productivityScore7d: { ar: 'نقاط الإنتاجية (7 أيام)', en: 'Productivity Score (7 days)', fr: 'Score de productivité (7 jours)' },
  tasksAndFocus: { ar: 'المهام ودقائق التركيز', en: 'Tasks & Focus Minutes', fr: 'Tâches et minutes de concentration' },
  taskDistribution: { ar: '📋 توزيع المهام', en: '📋 Task Distribution', fr: '📋 Distribution des tâches' },
  goalDistribution: { ar: '🎯 توزيع الأهداف', en: '🎯 Goal Distribution', fr: '🎯 Distribution des objectifs' },
  habitsChart: { ar: 'العادات (7 أيام)', en: 'Habits (7 days)', fr: 'Habitudes (7 jours)' },
  achievements: { ar: 'الإنجازات', en: 'Achievements', fr: 'Réalisations' },
  noDataYet: { ar: 'لا توجد بيانات كافية بعد', en: 'Not enough data yet', fr: 'Pas encore assez de données' },
  noTasksYet: { ar: 'لا توجد مهام بعد', en: 'No tasks yet', fr: 'Aucune tâche pour le moment' },
  noGoalsYetShort: { ar: 'لا توجد أهداف بعد', en: 'No goals yet', fr: 'Aucun objectif pour le moment' },
  achieved: { ar: '✓ محقق', en: '✓ Achieved', fr: '✓ Atteint' },
  // Achievement names
  achFirstGoal: { ar: 'أول هدف', en: 'First Goal', fr: 'Premier objectif' },
  achFirstGoalDesc: { ar: 'أنشئ هدفك الأول', en: 'Create your first goal', fr: 'Créez votre premier objectif' },
  achTaskMaster: { ar: 'منجز المهام', en: 'Task Master', fr: 'Maître des tâches' },
  achTaskMasterDesc: { ar: 'أنجز 10 مهام', en: 'Complete 10 tasks', fr: 'Accomplir 10 tâches' },
  achMeditator: { ar: 'متأمل', en: 'Meditator', fr: 'Méditant' },
  achMeditatorDesc: { ar: 'أكمل 5 جلسات تركيز', en: 'Complete 5 focus sessions', fr: 'Terminer 5 sessions de concentration' },
  achCommitted: { ar: 'ملتزم', en: 'Committed', fr: 'Engagé' },
  achCommittedDesc: { ar: 'حافظ على سلسلة 3 أيام', en: 'Maintain a 3-day streak', fr: 'Maintenir une série de 3 jours' },
  achExpert: { ar: 'خبير', en: 'Expert', fr: 'Expert' },
  achExpertDesc: { ar: 'وصل للمستوى 5', en: 'Reach level 5', fr: 'Atteindre le niveau 5' },
  achTimeChamp: { ar: 'بطل الوقت', en: 'Time Champion', fr: 'Champion du temps' },
  achTimeChampDesc: { ar: '100 دقيقة تركيز', en: '100 focus minutes', fr: '100 minutes de concentration' },
  score: { ar: 'النقاط', en: 'Score', fr: 'Score' },
  tasksLabel: { ar: 'المهام', en: 'Tasks', fr: 'Tâches' },
  habitsLabel: { ar: 'العادات المنجزة', en: 'Habits Completed', fr: 'Habitudes accomplies' },
  chartDayNames: {
    ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  },

  // ---- Settings ----
  settingsTitle: { ar: '⚙️ الإعدادات', en: '⚙️ Settings', fr: '⚙️ Paramètres' },
  settingsSubtitle: { ar: 'تخصيص التطبيق وإدارة الأمان', en: 'Customize the app and manage security', fr: 'Personnalisez l\'application et gérez la sécurité' },
  whatsappFloating: { ar: 'زر تلغرام العائم', en: 'Floating Telegram Button', fr: 'Bouton Telegram flottant' },
  whatsappFloatingDesc: { ar: 'إظهار أو إخفاء أيقونة التواصل السريع', en: 'Show or hide the quick contact icon', fr: 'Afficher ou masquer l\'icône de contact rapide' },
  whatsappEnabled: { ar: '✅ الزر العائم مُفعّل ويظهر في جميع الصفحات', en: '✅ Floating button is enabled on all pages', fr: '✅ Le bouton flottant est activé sur toutes les pages' },
  whatsappDisabled: { ar: '❌ الزر العائم مُخفي', en: '❌ Floating button is hidden', fr: '❌ Le bouton flottant est masqué' },
  whatsappHidden: { ar: 'تم إخفاء زر التلغرام', en: 'Telegram button hidden', fr: 'Bouton Telegram masqué' },
  whatsappShown: { ar: 'تم إظهار زر التلغرام', en: 'Telegram button shown', fr: 'Bouton Telegram affiché' },
  passwordProtection: { ar: '🔐 حماية التطبيق بكلمة مرور', en: '🔐 Password Protection', fr: '🔐 Protection par mot de passe' },
  passwordProtDesc: { ar: 'حماية بياناتك بكلمة مرور آمنة', en: 'Protect your data with a secure password', fr: 'Protégez vos données avec un mot de passe sécurisé' },
  enabled: { ar: 'مُفعّل', en: 'Enabled', fr: 'Activé' },
  appProtected: { ar: '🛡️ التطبيق محمي', en: '🛡️ App Protected', fr: '🛡️ Application protégée' },
  appProtectedDesc: { ar: 'سيطلب كلمة المرور عند فتح التطبيق', en: 'Password required when opening the app', fr: 'Mot de passe requis à l\'ouverture de l\'application' },
  appNotProtected: { ar: '⚠️ التطبيق غير محمي', en: '⚠️ App Not Protected', fr: '⚠️ Application non protégée' },
  appNotProtectedDesc: { ar: 'يمكن لأي شخص الوصول إلى بياناتك', en: 'Anyone can access your data', fr: 'N\'importe qui peut accéder à vos données' },
  newPassword: { ar: 'كلمة المرور الجديدة', en: 'New Password', fr: 'Nouveau mot de passe' },
  newPasswordPlaceholder: { ar: 'أدخل كلمة المرور (4 أحرف على الأقل)', en: 'Enter password (at least 4 characters)', fr: 'Entrez le mot de passe (au moins 4 caractères)' },
  confirmPassword: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password', fr: 'Confirmer le mot de passe' },
  confirmPasswordPlaceholder: { ar: 'أعد إدخال كلمة المرور', en: 'Re-enter password', fr: 'Ressaisissez le mot de passe' },
  currentPassword: { ar: 'كلمة المرور الحالية', en: 'Current Password', fr: 'Mot de passe actuel' },
  currentPasswordPlaceholder: { ar: 'أدخل كلمة المرور الحالية', en: 'Enter current password', fr: 'Entrez le mot de passe actuel' },
  setPassword: { ar: 'تعيين كلمة المرور', en: 'Set Password', fr: 'Définir le mot de passe' },
  changePassword: { ar: 'تغيير كلمة المرور', en: 'Change Password', fr: 'Changer le mot de passe' },
  removePassword: { ar: 'إزالة', en: 'Remove', fr: 'Supprimer' },
  removePasswordConfirm: { ar: 'هل أنت متأكد من إزالة كلمة المرور؟', en: 'Are you sure you want to remove the password?', fr: 'Êtes-vous sûr de vouloir supprimer le mot de passe ?' },
  removePasswordConfirmLabel: { ar: 'أدخل كلمة المرور الحالية للتأكيد', en: 'Enter current password to confirm', fr: 'Entrez le mot de passe actuel pour confirmer' },
  yesRemoveProtection: { ar: 'نعم، إزالة الحماية', en: 'Yes, remove protection', fr: 'Oui, supprimer la protection' },
  cancel: { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler' },
  passwordWeak: { ar: 'ضعيفة', en: 'Weak', fr: 'Faible' },
  passwordMedium: { ar: 'متوسطة', en: 'Medium', fr: 'Moyen' },
  passwordStrong: { ar: 'قوية 💪', en: 'Strong 💪', fr: 'Fort 💪' },
  passwordsMatch: { ar: 'كلمتا المرور متطابقتان ✓', en: 'Passwords match ✓', fr: 'Les mots de passe correspondent ✓' },
  passwordsNoMatch: { ar: 'كلمتا المرور غير متطابقتان', en: 'Passwords don\'t match', fr: 'Les mots de passe ne correspondent pas' },
  passwordSetSuccess: { ar: 'تم تعيين كلمة المرور بنجاح! 🔒', en: 'Password set successfully! 🔒', fr: 'Mot de passe défini avec succès ! 🔒' },
  passwordRemoved: { ar: 'تم إزالة كلمة المرور', en: 'Password removed', fr: 'Mot de passe supprimé' },
  wrongCurrentPassword: { ar: 'كلمة المرور الحالية غير صحيحة', en: 'Current password is incorrect', fr: 'Le mot de passe actuel est incorrect' },
  passwordTooShort: { ar: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل', en: 'Password must be at least 4 characters', fr: 'Le mot de passe doit comporter au moins 4 caractères' },
  passwordMismatch: { ar: 'كلمة المرور غير متطابقة', en: 'Passwords don\'t match', fr: 'Les mots de passe ne correspondent pas' },
  lockOptions: { ar: '🔔 خيارات القفل', en: '🔔 Lock Options', fr: '🔔 Options de verrouillage' },
  lockOnClose: { ar: 'القفل عند الإغلاق', en: 'Lock on Close', fr: 'Verrouiller à la fermeture' },
  lockOnCloseDesc: { ar: 'طلب كلمة المرور عند إعادة فتح التطبيق', en: 'Require password when reopening the app', fr: 'Demander le mot de passe à la réouverture' },
  autoLock: { ar: 'القفل التلقائي', en: 'Auto Lock', fr: 'Verrouillage automatique' },
  autoLockDesc: { ar: 'قفل بعد فترة عدم النشاط', en: 'Lock after inactivity period', fr: 'Verrouiller après une période d\'inactivité' },
  oneMinute: { ar: 'دقيقة واحدة', en: '1 minute', fr: '1 minute' },
  fiveMinutes: { ar: '5 دقائق', en: '5 minutes', fr: '5 minutes' },
  tenMinutes: { ar: '10 دقائق', en: '10 minutes', fr: '10 minutes' },
  thirtyMinutes: { ar: '30 دقيقة', en: '30 minutes', fr: '30 minutes' },
  noAutoLock: { ar: 'بدون قفل تلقائي', en: 'No auto lock', fr: 'Pas de verrouillage auto' },
  dangerZone: { ar: '⚠️ منطقة الخطر', en: '⚠️ Danger Zone', fr: '⚠️ Zone de danger' },
  dangerZoneDesc: { ar: 'إجراءات لا يمكن التراجع عنها', en: 'Irreversible actions', fr: 'Actions irréversibles' },
  deleteAllData: { ar: 'حذف جميع البيانات', en: 'Delete All Data', fr: 'Supprimer toutes les données' },
  deleteAllConfirm: { ar: '⚠️ هل أنت متأكد؟ سيتم حذف جميع البيانات نهائياً!', en: '⚠️ Are you sure? All data will be permanently deleted!', fr: '⚠️ Êtes-vous sûr ? Toutes les données seront définitivement supprimées !' },
  enterCorrectPassword: { ar: 'أدخل كلمة المرور الصحيحة أولاً', en: 'Enter the correct password first', fr: 'Entrez d\'abord le mot de passe correct' },
  appInfo: { ar: 'نظام تطوير حياة متكامل • صنع بـ ❤️ بواسطة DigitPro', en: 'Integrated Life System • Made with ❤️ by DigitPro', fr: 'Système de vie intégré • Fait avec ❤️ par DigitPro' },

  // ---- Language Settings ----
  languageTitle: { ar: '🌐 اللغة', en: '🌐 Language', fr: '🌐 Langue' },
  languageDesc: { ar: 'اختر لغة التطبيق المفضلة', en: 'Choose your preferred language', fr: 'Choisissez votre langue préférée' },
  currentLanguage: { ar: 'اللغة الحالية', en: 'Current Language', fr: 'Langue actuelle' },

  // ---- Lock Screen ----
  enterPassword: { ar: '🔐 أدخل كلمة المرور', en: '🔐 Enter Password', fr: '🔐 Entrez le mot de passe' },
  appProtectedByPassword: { ar: 'التطبيق محمي بكلمة مرور', en: 'App is password protected', fr: 'L\'application est protégée par mot de passe' },
  tempLocked: { ar: '🔒 تم القفل مؤقتاً', en: '🔒 Temporarily Locked', fr: '🔒 Verrouillé temporairement' },
  welcomeBack: { ar: '✅ مرحباً بك!', en: '✅ Welcome back!', fr: '✅ Bienvenue !' },
  waitSeconds: { ar: 'ثانية', en: 'seconds', fr: 'secondes' },
  openingApp: { ar: 'جارٍ فتح التطبيق...', en: 'Opening app...', fr: 'Ouverture de l\'application...' },
  wrongPassword: { ar: 'كلمة المرور غير صحيحة ❌', en: 'Wrong password ❌', fr: 'Mot de passe incorrect ❌' },
  lockedFor30s: { ar: 'تم قفل التطبيق لمدة 30 ثانية ⏳', en: 'App locked for 30 seconds ⏳', fr: 'Application verrouillée pendant 30 secondes ⏳' },
  attemptsLeft: { ar: 'محاولات متبقية', en: 'attempts left', fr: 'tentatives restantes' },
  wrongPasswordWarning: { ar: 'كلمة المرور خاطئة!', en: 'Wrong password!', fr: 'Mot de passe incorrect !' },
  retryAfter: { ar: 'إعادة المحاولة بعد', en: 'Retry after', fr: 'Réessayer après' },
  enterAboveOrPad: { ar: 'أدخل كلمة المرور أعلاه أو استخدم لوحة الأرقام', en: 'Enter password above or use the keypad', fr: 'Entrez le mot de passe ci-dessus ou utilisez le clavier' },
  locked: { ar: 'مقفل...', en: 'Locked...', fr: 'Verrouillé...' },
  lockFooter: { ar: '🔒 LevelUp Life • محمي بواسطة DigitPro', en: '🔒 LevelUp Life • Protected by DigitPro', fr: '🔒 LevelUp Life • Protégé par DigitPro' },

  // ---- Extensions Store ----
  navFreeApps: { ar: 'متجر الإضافات', en: 'Extensions', fr: 'Extensions' },
  pageFreeApps: { ar: 'متجر الإضافات', en: 'Extensions Store', fr: `Boutique d'extensions` },
  freeAppsTitle: { ar: 'إضافات التطبيق', en: 'App Extensions', fr: `Extensions de l'application` },
  freeAppsSlogan: { ar: 'عزز تجربتك بإضافات احترافية', en: 'Enhance your experience with professional extensions', fr: 'Améliorez votre expérience avec des extensions pro' },
  freeAppsDesc: { ar: 'نقدم لكم مجموعة من الإضافات لتسهيل حياتكم اليومية. قم بتفعيل ما تحتاجه للظهور في القائمة الرئيسية.', en: 'We offer a collection of extensions to simplify your daily life. Activate what you need to show in the sidebar.', fr: 'Nous offrons des extensions pour simplifier votre vie. Activez ce dont vous avez besoin.' },
  freeAppsCount: { ar: 'إضافات', en: 'Extensions', fr: 'Extensions' },
  freeAppsUsers: { ar: 'مستخدم', en: 'Users', fr: 'Utilisateurs' },
  freeAppsAvgRating: { ar: 'تقييم', en: 'Rating', fr: 'Note' },

  // Features
  featureFree: { ar: 'إضافة مجانية', en: 'Free Extension', fr: 'Extension Gratuite' },
  featureOffline: { ar: 'سرعة وكفاءة', en: 'Fast & Efficient', fr: 'Rapide & Efficace' },
  featureNoAds: { ar: 'مدمج في التطبيق', en: 'Integrated', fr: 'Intégré' },
  featureUpdates: { ar: 'تحديثات مستمرة', en: 'Regular Updates', fr: 'Mises à jour régulières' },

  // Apps list
  ourFreeApps: { ar: 'الإضافات المتاحة', en: 'Available Extensions', fr: 'Extensions Disponibles' },
  ourFreeAppsDesc: { ar: 'اختر الإضافة المناسبة لك وقم بتفعيلها', en: 'Choose the right extension and activate it', fr: 'Choisissez la bonne extension et activez-la' },
  downloadNow: { ar: 'تفعيل الإضافة', en: 'Activate Extension', fr: `Activer l'extension` },
  downloadFree: { ar: 'تفعيل الآن', en: 'Activate Now', fr: 'Activer Maintenant' },
  deactivate: { ar: 'إلغاء التفعيل', en: 'Deactivate', fr: 'Désactiver' },
  activated: { ar: 'مُفعلة', en: 'Activated', fr: 'Activé' },
  showDetails: { ar: 'عرض التفاصيل', en: 'Show Details', fr: 'Voir les détails' },
  hideDetails: { ar: 'إخفاء التفاصيل', en: 'Hide Details', fr: 'Masquer les détails' },

  // App names and descriptions
  app_taskManager_name: { ar: 'مدير المهام الذكي', en: 'Smart Task Manager', fr: 'Gestionnaire de tâches intelligent' },
  app_taskManager_desc: { ar: 'نظّم مهامك اليومية بذكاء وتتبع إنجازاتك', en: 'Organize your daily tasks smartly and track achievements', fr: 'Organisez vos tâches quotidiennes intelligemment' },
  app_taskManager_f1: { ar: 'تنظيم المهام حسب الأولوية', en: 'Organize tasks by priority', fr: 'Organiser les tâches par priorité' },
  app_taskManager_f2: { ar: 'تنبيهات وإشعارات ذكية', en: 'Smart alerts and notifications', fr: 'Alertes et notifications intelligentes' },
  app_taskManager_f3: { ar: 'إحصائيات الإنتاجية اليومية', en: 'Daily productivity statistics', fr: 'Statistiques de productivité quotidiennes' },

  app_habitTracker_name: { ar: 'متتبع العادات', en: 'Habit Tracker', fr: 'Suivi des habitudes' },
  app_habitTracker_desc: { ar: 'ابنِ عادات إيجابية وتابع تقدمك يومياً', en: 'Build positive habits and track daily progress', fr: 'Construisez des habitudes positives et suivez vos progrès' },
  app_habitTracker_f1: { ar: 'تتبع العادات اليومية والأسبوعية', en: 'Track daily and weekly habits', fr: 'Suivre les habitudes quotidiennes et hebdomadaires' },
  app_habitTracker_f2: { ar: 'نظام سلاسل الالتزام', en: 'Streak system for consistency', fr: 'Système de séries pour la régularité' },
  app_habitTracker_f3: { ar: 'رسوم بيانية للتقدم', en: 'Progress charts', fr: 'Graphiques de progrès' },

  app_myWallet_name: { ar: 'محفظتي', en: 'My Wallet', fr: 'Mon portefeuille' },
  app_myWallet_desc: { ar: 'إدارة مصاريفك ومدخراتك بسهولة', en: 'Manage your expenses and savings easily', fr: 'Gérez vos dépenses et économies facilement' },
  app_myWallet_f1: { ar: 'تتبع المصاريف والمداخيل', en: 'Track expenses and income', fr: 'Suivre les dépenses et les revenus' },
  app_myWallet_f2: { ar: 'تصنيف تلقائي للمعاملات', en: 'Automatic transaction categorization', fr: 'Catégorisation automatique des transactions' },
  app_myWallet_f3: { ar: 'تقارير مالية مفصلة', en: 'Detailed financial reports', fr: 'Rapports financiers détaillés' },

  app_myHealth_name: { ar: 'صحتي', en: 'My Health', fr: 'Ma santé' },
  app_myHealth_desc: { ar: 'تابع صحتك ولياقتك البدنية يومياً', en: 'Track your health and fitness daily', fr: 'Suivez votre santé et votre forme physique quotidiennement' },
  app_myHealth_f1: { ar: 'تتبع الخطوات والسعرات', en: 'Track steps and calories', fr: 'Suivre les pas et les calories' },
  app_myHealth_f2: { ar: 'تذكير بشرب الماء', en: 'Water drinking reminders', fr: 'Rappels pour boire de l\'eau' },
  app_myHealth_f3: { ar: 'تقارير صحية أسبوعية', en: 'Weekly health reports', fr: 'Rapports de santé hebdomadaires' },

  app_myDiary_name: { ar: 'مذكراتي', en: 'My Diary', fr: 'Mon journal' },
  app_myDiary_desc: { ar: 'دوّن أفكارك وذكرياتك بخصوصية تامة', en: 'Write your thoughts and memories with full privacy', fr: 'Écrivez vos pensées et souvenirs en toute confidentialité' },
  app_myDiary_f1: { ar: 'كتابة يومية مع تنسيق غني', en: 'Daily writing with rich formatting', fr: 'Écriture quotidienne avec mise en forme riche' },
  app_myDiary_f2: { ar: 'حماية بكلمة مرور', en: 'Password protection', fr: 'Protection par mot de passe' },
  app_myDiary_f3: { ar: 'البحث في المذكرات القديمة', en: 'Search through old entries', fr: 'Rechercher dans les anciennes entrées' },

  // Reviews
  userReviews: { ar: 'آراء المستخدمين', en: 'User Reviews', fr: 'Avis des utilisateurs' },
  userReviewsDesc: { ar: 'ماذا يقول مستخدمونا عن تطبيقاتنا', en: 'What our users say about our apps', fr: 'Ce que nos utilisateurs disent de nos applications' },
  rev1Name: { ar: 'أحمد محمد', en: 'Ahmed Mohammed', fr: 'Ahmed Mohammed' },
  rev1Role: { ar: 'طالب جامعي', en: 'University Student', fr: 'Étudiant universitaire' },
  rev1Text: { ar: 'تطبيقات رائعة ومجانية بالكامل! ساعدتني كثيراً في تنظيم وقتي', en: 'Amazing and completely free apps! They helped me organize my time a lot', fr: 'Applications incroyables et entièrement gratuites ! Elles m\'ont beaucoup aidé à organiser mon temps' },
  rev2Name: { ar: 'سارة علي', en: 'Sarah Ali', fr: 'Sarah Ali' },
  rev2Role: { ar: 'معلمة', en: 'Teacher', fr: 'Enseignante' },
  rev2Text: { ar: 'أفضل تطبيقات مجانية استخدمتها، بدون إعلانات مزعجة!', en: 'Best free apps I\'ve used, no annoying ads!', fr: 'Les meilleures applications gratuites que j\'ai utilisées, sans publicité ennuyeuse !' },
  rev3Name: { ar: 'خالد يوسف', en: 'Khaled Youssef', fr: 'Khaled Youssef' },
  rev3Role: { ar: 'مصمم جرافيك', en: 'Graphic Designer', fr: 'Designer graphique' },
  rev3Text: { ar: 'تصميم جميل وسهولة في الاستخدام، أنصح بها بشدة!', en: 'Beautiful design and easy to use, highly recommend!', fr: 'Beau design et facile à utiliser, je les recommande vivement !' },

  // Subscribe
  subscribeTitle: { ar: 'اشترك للتطبيقات الجديدة', en: 'Subscribe for New Apps', fr: 'Abonnez-vous pour les nouvelles apps' },
  subscribeDesc: { ar: 'كن أول من يعرف عن تطبيقاتنا المجانية الجديدة', en: 'Be the first to know about our new free apps', fr: 'Soyez le premier à connaître nos nouvelles applications gratuites' },
  emailPlaceholder: { ar: 'أدخل بريدك الإلكتروني', en: 'Enter your email', fr: 'Entrez votre email' },
  subscribe: { ar: 'اشتراك', en: 'Subscribe', fr: 'S\'abonner' },
  subscribeSuccess: { ar: 'تم الاشتراك بنجاح! 🎉', en: 'Subscribed successfully! 🎉', fr: 'Abonné avec succès ! 🎉' },
  subscribeSuccessDesc: { ar: 'سنبلغك بكل جديد', en: 'We\'ll notify you of every update', fr: 'Nous vous informerons de chaque mise à jour' },

  // Request App
  requestAppTitle: { ar: 'اقترح تطبيقاً جديداً', en: 'Suggest a New App', fr: 'Suggérer une nouvelle application' },
  requestAppDesc: { ar: 'أخبرنا بالتطبيق الذي تحتاجه وسنصنعه لك مجاناً!', en: 'Tell us what app you need and we\'ll build it for free!', fr: 'Dites-nous quelle application vous avez besoin et nous la créerons gratuitement !' },
  requestAppPlaceholder: { ar: 'اكتب فكرة التطبيق هنا...', en: 'Write your app idea here...', fr: 'Écrivez votre idée d\'application ici...' },
  requestMsg1: { ar: 'أريد تطبيق إدارة مشاريع 📱', en: 'I want a project management app 📱', fr: 'Je veux une app de gestion de projets 📱' },
  requestMsg2: { ar: 'أريد لعبة تعليمية 🎮', en: 'I want an educational game 🎮', fr: 'Je veux un jeu éducatif 🎮' },
  requestMsg3: { ar: 'أريد تطبيق تعليمي 📚', en: 'I want an educational app 📚', fr: 'Je veux une application éducative 📚' },
  requestMsg4: { ar: 'لدي فكرة تطبيق جديد 💡', en: 'I have a new app idea 💡', fr: 'J\'ai une idée de nouvelle application 💡' },

  freeAppsFooterText: { ar: 'جميع تطبيقاتنا مجانية ومصنوعة بحب', en: 'All our apps are free and made with love', fr: 'Toutes nos applications sont gratuites et faites avec amour' },

  // ---- Contact Developer ----
  digitProSlogan: { ar: 'حلول رقمية احترافية', en: 'Professional Digital Solutions', fr: 'Solutions numériques professionnelles' },
  digitProDesc: { ar: 'نحن نحول أفكارك إلى واقع رقمي مذهل. متخصصون في تطوير التطبيقات والمواقع بأحدث التقنيات وأجمل التصاميم.', en: 'We turn your ideas into stunning digital reality. We specialize in developing apps and websites with the latest technologies and most beautiful designs.', fr: 'Nous transformons vos idées en réalité numérique époustouflante. Spécialisés dans le développement d\'applications et de sites web avec les dernières technologies.' },
  contactWhatsApp: { ar: 'تواصل عبر تلغرام', en: 'Contact via Telegram', fr: 'Contacter via Telegram' },
  ourServices: { ar: 'خدماتنا', en: 'Our Services', fr: 'Nos services' },
  bestDigitalSolutions: { ar: 'نقدم أفضل الحلول الرقمية', en: 'We offer the best digital solutions', fr: 'Nous offrons les meilleures solutions numériques' },
  quickMessage: { ar: 'رسالة سريعة', en: 'Quick Message', fr: 'Message rapide' },
  quickMessageDesc: { ar: 'اختر رسالة جاهزة أو اكتب رسالتك', en: 'Choose a preset or write your message', fr: 'Choisissez un modèle ou écrivez votre message' },
  writeYourMessage: { ar: 'اكتب رسالتك هنا...', en: 'Write your message here...', fr: 'Écrivez votre message ici...' },
  send: { ar: 'إرسال', en: 'Send', fr: 'Envoyer' },
  customerReviews: { ar: 'آراء العملاء', en: 'Customer Reviews', fr: 'Avis clients' },
  whatCustomersSay: { ar: 'ماذا يقول عملاؤنا عنا', en: 'What our customers say about us', fr: 'Ce que nos clients disent de nous' },
  inquireAbout: { ar: 'استفسر عن هذه الخدمة', en: 'Inquire about this service', fr: 'Renseignez-vous sur ce service' },
  projectsDone: { ar: 'مشروع منجز', en: 'Projects Done', fr: 'Projets réalisés' },
  happyClients: { ar: 'عميل سعيد', en: 'Happy Clients', fr: 'Clients satisfaits' },
  yearsExp: { ar: 'سنوات خبرة', en: 'Years Experience', fr: 'Années d\'expérience' },
  support247: { ar: 'دعم متواصل', en: 'Ongoing Support', fr: 'Support continu' },
  appDeveloper: { ar: 'مطور تطبيقات ومواقع', en: 'App & Web Developer', fr: 'Développeur d\'applications et de sites' },
  whatsapp: { ar: 'تلغرام', en: 'Telegram', fr: 'Telegram' },

  // Service names
  svcWebDev: { ar: 'تطوير مواقع الويب', en: 'Web Development', fr: 'Développement web' },
  svcWebDevDesc: { ar: 'مواقع احترافية وسريعة بأحدث التقنيات', en: 'Professional, fast websites with latest tech', fr: 'Sites professionnels et rapides avec les dernières technologies' },
  svcMobile: { ar: 'تطبيقات الموبايل', en: 'Mobile Apps', fr: 'Applications mobiles' },
  svcMobileDesc: { ar: 'تطبيقات Android و iOS بتصميم عصري', en: 'Android & iOS apps with modern design', fr: 'Applications Android et iOS au design moderne' },
  svcCustom: { ar: 'برمجة مخصصة', en: 'Custom Development', fr: 'Développement sur mesure' },
  svcCustomDesc: { ar: 'حلول برمجية مخصصة لاحتياجاتك', en: 'Custom software solutions for your needs', fr: 'Solutions logicielles personnalisées pour vos besoins' },
  svcManagement: { ar: 'أنظمة إدارة', en: 'Management Systems', fr: 'Systèmes de gestion' },
  svcManagementDesc: { ar: 'أنظمة إدارة متكاملة للشركات', en: 'Integrated management systems for businesses', fr: 'Systèmes de gestion intégrés pour les entreprises' },
  svcSupport: { ar: 'دعم فني', en: 'Technical Support', fr: 'Support technique' },
  svcSupportDesc: { ar: 'دعم فني متواصل على مدار الساعة', en: '24/7 continuous technical support', fr: 'Support technique continu 24/7' },
  svcConsulting: { ar: 'استشارات تقنية', en: 'Tech Consulting', fr: 'Conseil technique' },
  svcConsultingDesc: { ar: 'استشارات لتطوير مشاريعك الرقمية', en: 'Consulting to develop your digital projects', fr: 'Conseil pour développer vos projets numériques' },

  // Quick WhatsApp messages
  qmWebsite: { ar: 'أريد تطوير موقع ويب 🌐', en: 'I want a website developed 🌐', fr: 'Je veux un site web développé 🌐' },
  qmMobileApp: { ar: 'أريد تطوير تطبيق موبايل 📱', en: 'I want a mobile app developed 📱', fr: 'Je veux une application mobile développée 📱' },
  qmConsulting: { ar: 'أحتاج استشارة تقنية 💡', en: 'I need tech consulting 💡', fr: 'J\'ai besoin d\'un conseil technique 💡' },
  qmPricing: { ar: 'أريد معرفة الأسعار 💰', en: 'I want to know the pricing 💰', fr: 'Je veux connaître les tarifs 💰' },

  // Testimonials
  testimonial1Name: { ar: 'أحمد محمد', en: 'Ahmed Mohammed', fr: 'Ahmed Mohammed' },
  testimonial1Role: { ar: 'صاحب شركة', en: 'Company Owner', fr: 'Propriétaire d\'entreprise' },
  testimonial1Text: { ar: 'عمل احترافي ودقة في المواعيد، أنصح بالتعامل معهم بشدة!', en: 'Professional work and punctuality, highly recommend them!', fr: 'Travail professionnel et ponctualité, je les recommande vivement !' },
  testimonial2Name: { ar: 'سارة علي', en: 'Sarah Ali', fr: 'Sarah Ali' },
  testimonial2Role: { ar: 'مصممة', en: 'Designer', fr: 'Designer' },
  testimonial2Text: { ar: 'تصميم رائع وتنفيذ مذهل، فريق DigitPro هو الأفضل!', en: 'Amazing design and stunning execution, DigitPro team is the best!', fr: 'Design incroyable et exécution impressionnante, l\'équipe DigitPro est la meilleure !' },
  testimonial3Name: { ar: 'خالد يوسف', en: 'Khaled Youssef', fr: 'Khaled Youssef' },
  testimonial3Role: { ar: 'رائد أعمال', en: 'Entrepreneur', fr: 'Entrepreneur' },
  testimonial3Text: { ar: 'ساعدوني في تحويل فكرتي لتطبيق ناجح، شكراً DigitPro!', en: 'They helped turn my idea into a successful app, thanks DigitPro!', fr: 'Ils ont aidé à transformer mon idée en application réussie, merci DigitPro !' },

  // Motivational quotes
  quotes: {
    ar: [
      { text: 'النجاح ليس نهائياً، والفشل ليس قاتلاً، إنما الشجاعة للاستمرار هي ما يهم.', author: 'ونستون تشرشل' },
      { text: 'لا تنتظر الفرصة، بل اصنعها.', author: 'جورج برنارد شو' },
      { text: 'ابدأ من حيث أنت، استخدم ما لديك، افعل ما تستطيع.', author: 'آرثر آش' },
      { text: 'المستقبل ملك لأولئك الذين يؤمنون بجمال أحلامهم.', author: 'إليانور روزفلت' },
      { text: 'كل إنجاز عظيم بدأ بقرار المحاولة.', author: 'مجهول' },
      { text: 'الطريقة الوحيدة للقيام بعمل عظيم هي أن تحب ما تفعله.', author: 'ستيف جوبز' },
      { text: 'لا يهم مدى بطء سيرك، المهم أن لا تتوقف.', author: 'كونفوشيوس' },
      { text: 'الانضباط هو الجسر بين الأهداف والإنجاز.', author: 'جيم رون' },
    ],
    en: [
      { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
      { text: "Don't wait for opportunity, create it.", author: 'George Bernard Shaw' },
      { text: 'Start where you are, use what you have, do what you can.', author: 'Arthur Ashe' },
      { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
      { text: 'Every great achievement started with the decision to try.', author: 'Unknown' },
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
      { text: "It doesn't matter how slowly you go, as long as you don't stop.", author: 'Confucius' },
      { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
    ],
    fr: [
      { text: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", author: 'Winston Churchill' },
      { text: "N'attendez pas l'opportunité, créez-la.", author: 'George Bernard Shaw' },
      { text: 'Commencez là où vous êtes, utilisez ce que vous avez, faites ce que vous pouvez.', author: 'Arthur Ashe' },
      { text: "L'avenir appartient à ceux qui croient en la beauté de leurs rêves.", author: 'Eleanor Roosevelt' },
      { text: "Toute grande réalisation a commencé par la décision d'essayer.", author: 'Inconnu' },
      { text: "La seule façon de faire un excellent travail est d'aimer ce que vous faites.", author: 'Steve Jobs' },
      { text: "Peu importe la lenteur, tant que vous ne vous arrêtez pas.", author: 'Confucius' },
      { text: "La discipline est le pont entre les objectifs et l'accomplissement.", author: 'Jim Rohn' },
    ],
  },

  // FloatingWhatsApp
  floatingChatTitle: { ar: 'DigitPro 💬', en: 'DigitPro 💬', fr: 'DigitPro 💬' },
  floatingChatGreeting: { ar: 'مرحباً! 👋 كيف يمكنني مساعدتك؟', en: 'Hello! 👋 How can I help you?', fr: 'Bonjour ! 👋 Comment puis-je vous aider ?' },
  floatingTooltip: { ar: 'تواصل مع DigitPro', en: 'Contact DigitPro', fr: 'Contacter DigitPro' },
  floatingQm1: { ar: 'أريد تطوير تطبيق 📱', en: 'I want an app developed 📱', fr: 'Je veux développer une app 📱' },
  floatingQm2: { ar: 'أحتاج موقع ويب 🌐', en: 'I need a website 🌐', fr: 'J\'ai besoin d\'un site web 🌐' },
  floatingQm3: { ar: 'استفسار عام 💬', en: 'General inquiry 💬', fr: 'Question générale 💬' },

  // Theme names for ThemeSelector
  themeKids: { ar: 'أطفال', en: 'Kids', fr: 'Enfants' },
  themeYouth: { ar: 'شباب', en: 'Youth', fr: 'Jeunes' },
  themeGirls: { ar: 'بنات', en: 'Girls', fr: 'Filles' },
  themeClassic: { ar: 'كلاسيك', en: 'Classic', fr: 'Classique' },
  themeModern: { ar: 'عصري', en: 'Modern', fr: 'Moderne' },
  themeDescKids: { ar: 'ألوان مرحة ومشرقة للصغار', en: 'Fun, bright colors for kids', fr: 'Couleurs vives et amusantes pour les enfants' },
  themeDescYouth: { ar: 'طاقة وحيوية مع ألوان نيون', en: 'Energy and vibrancy with neon colors', fr: 'Énergie et vivacité avec des couleurs néon' },
  themeDescGirls: { ar: 'ألوان ناعمة وأنثوية راقية', en: 'Soft and elegant feminine colors', fr: 'Couleurs féminines douces et élégantes' },
  themeDescClassic: { ar: 'أناقة كلاسيكية خالدة', en: 'Timeless classic elegance', fr: 'Élégance classique intemporelle' },
  themeDescModern: { ar: 'تصميم حديث ومينيمال', en: 'Modern minimal design', fr: 'Design moderne et minimal' },
  chooseTheme: { ar: 'اختر الثيم المفضل', en: 'Choose Your Theme', fr: 'Choisissez votre thème' },
  themeSubtitle: { ar: 'اختر التصميم الذي يناسب ذوقك', en: 'Pick the design that suits your taste', fr: 'Choisissez le design qui vous convient' },
  close: { ar: 'إغلاق', en: 'Close', fr: 'Fermer' },

  // ---- Wallet ----
  walletDashboard: { ar: 'لوحة المحفظة', en: 'Wallet Dashboard', fr: 'Tableau de bord du portefeuille' },
  totalBalance: { ar: 'الرصيد الكلي', en: 'Total Balance', fr: 'Solde total' },
  totalIncome: { ar: 'إجمالي الدخل', en: 'Total Income', fr: 'Revenus totaux' },
  totalExpense: { ar: 'إجمالي المصاريف', en: 'Total Expense', fr: 'Dépenses totales' },
  addTransaction: { ar: 'إضافة معاملة', en: 'Add Transaction', fr: 'Ajouter une transaction' },
  transactionType: { ar: 'نوع المعاملة', en: 'Transaction Type', fr: 'Type de transaction' },
  income: { ar: 'دخل', en: 'Income', fr: 'Revenu' },
  expense: { ar: 'مصروف', en: 'Expense', fr: 'Dépense' },
  amount: { ar: 'المبلغ', en: 'Amount', fr: 'Montant' },
  category: { ar: 'التصنيف', en: 'Category', fr: 'Catégorie' },
  saveTransaction: { ar: 'حفظ المعاملة', en: 'Save Transaction', fr: 'Enregistrer' },
  recentTransactions: { ar: 'أحدث المعاملات', en: 'Recent Transactions', fr: 'Transactions récentes' },
  noTransactions: { ar: 'لا توجد معاملات بعد', en: 'No transactions yet', fr: 'Aucune transaction pour le moment' },
  deleteTransaction: { ar: 'حذف المعاملة', en: 'Delete Transaction', fr: 'Supprimer la transaction' },
  reports: { ar: 'التقارير', en: 'Reports', fr: 'Rapports' },
  incomeVsExpense: { ar: 'الدخل مقابل المصاريف', en: 'Income vs Expense', fr: 'Revenus vs Dépenses' },

  // ---- Diary ----
  diaryDashboard: { ar: 'مذكراتي', en: 'My Diary', fr: 'Mon Journal' },
  newEntry: { ar: 'كتابة تدوينة جديدة', en: 'Write New Entry', fr: 'Écrire une nouvelle entrée' },
  diaryTitle: { ar: 'عنوان المذكرة', en: 'Entry Title', fr: 'Titre de l\'entrée' },
  diaryContentPlaceHolder: { ar: 'بم تفكر؟ (يمكنك استخدام التنسيق الغني)', en: 'What are you thinking? (Rich formatting supported)', fr: 'À quoi pensez-vous ? (Formatage riche supporté)' },
  date: { ar: 'التاريخ', en: 'Date', fr: 'Date' },
  saveEntry: { ar: 'حفظ المذكرة', en: 'Save Entry', fr: 'Enregistrer l\'entrée' },
  searchDiary: { ar: 'ابحث في المذكرات القديمة...', en: 'Search old entries...', fr: 'Rechercher d\'anciennes entrées...' },
  noEntries: { ar: 'لا توجد مذكرات بعد، ابدأ بكتابة يومياتك!', en: 'No entries yet, start writing your journal!', fr: 'Aucune entrée pour l\'instant, commencez à écrire votre journal !' },
  editEntry: { ar: 'تعديل', en: 'Edit', fr: 'Modifier' },
  diaryLocked: { ar: 'المذكرات محمية بكلمة مرور', en: 'Diary is password protected', fr: 'Le journal est protégé par mot de passe' },
  enterDiaryPassword: { ar: 'أدخل الرقم السري للمذكرات', en: 'Enter diary password', fr: 'Entrez le mot de passe du journal' },
  createDiaryPassword: { ar: 'قم بتعيين رقم سري لحماية مذكراتك', en: 'Set a password to protect your diary', fr: 'Définissez un mot de passe pour protéger votre journal' },

  // ---- Health ----
  healthDashboard: { ar: 'صحتي', en: 'My Health', fr: 'Ma Santé' },
  stepsTracking: { ar: 'تتبع الخطوات', en: 'Steps Tracking', fr: 'Suivi des pas' },
  addSteps: { ar: 'إضافة خطوات', en: 'Add Steps', fr: 'Ajouter des pas' },
  stepsCount: { ar: 'عدد الخطوات', en: 'Steps', fr: 'Pas' },
  caloriesBurned: { ar: 'السعرات المحروقة', en: 'Calories Burned', fr: 'Calories brûlées' },
  waterReminder: { ar: 'تذكير شرب الماء', en: 'Water Reminder', fr: 'Rappel d\'eau' },
  waterGlasses: { ar: 'أكواب', en: 'Glasses', fr: 'Verres' },
  drinkWater: { ar: 'شرب كوب ماء', en: 'Drink Water', fr: 'Boire de l\'eau' },
  dailyGoalProgress: { ar: 'نسبة الإنجاز اليومي', en: 'Daily Progress', fr: 'Progression quotidienne' },
  weeklyHealthReport: { ar: 'التقرير الصحي الأسبوعي', en: 'Weekly Health Report', fr: 'Rapport de santé hebdomadaire' },
  avgSteps: { ar: 'متوسط الخطوات', en: 'Avg Steps', fr: 'Moyenne des pas' },
  totalWater: { ar: 'إجمالي أكواب الماء', en: 'Total Water', fr: 'Eau totale' },
  saveHealthData: { ar: 'حفظ التحديث', en: 'Save Update', fr: 'Enregistrer' },
  bloodSugar: { ar: 'نسبة السكر', en: 'Blood Sugar', fr: 'Glycémie' },
  bloodSugarUnit: { ar: 'ملغم/ديسيلتر', en: 'mg/dL', fr: 'mg/dL' },
  bloodPressure: { ar: 'ضغط الدم', en: 'Blood Pressure', fr: 'Pression Artérielle' },
  bloodPressureFormat: { ar: 'مثال: 120/80', en: 'e.g. 120/80', fr: 'ex: 120/80' },
  weight: { ar: 'الوزن', en: 'Weight', fr: 'Poids' },
  weightUnit: { ar: 'كجم', en: 'kg', fr: 'kg' },
  vision: { ar: 'النظر', en: 'Vision', fr: 'Vision' },
  visionFormat: { ar: 'مثال: 6/6', en: 'e.g. 6/6', fr: 'ex: 6/6' },
  healthyDiet: { ar: 'برنامج غذائي صحي', en: 'Healthy Diet', fr: 'Régime Sain' },
  dietFollowed: { ar: 'اتبعت النظام اليوم', en: 'Followed diet today', fr: 'Régime suivi aujourd\'hui' },
  sleepHours: { ar: 'ساعات النوم', en: 'Sleep Hours', fr: 'Heures de sommeil' },
  regularSleep: { ar: 'نوم منتظم', en: 'Regular Sleep', fr: 'Sommeil régulier' },
  exercise: { ar: 'ممارسة الرياضة', en: 'Exercise', fr: 'Exercice' },
  exerciseMinutes: { ar: 'دقائق الرياضة', en: 'Exercise Minutes', fr: 'Minutes d\'exercice' },
  healthVitals: { ar: 'المؤشرات الحيوية', en: 'Health Vitals', fr: 'Signes Vitaux' },
  lifestyle: { ar: 'نمط الحياة', en: 'Lifestyle', fr: 'Mode de Vie' },

  // ---- Reading ----
  app_myReading_name: { ar: 'المطالعة', en: 'Reading', fr: 'Lecture' },
  app_myReading_desc: { ar: 'تحويل القراءة إلى عادة يومية ممتعة', en: 'Make reading a fun daily habit', fr: 'Faites de la lecture une habitude quotidienne amusante' },
  myLibrary: { ar: 'مكتبتي الشخصية', en: 'My Library', fr: 'Ma Bibliothèque' },
  addBook: { ar: 'إضافة كتاب', en: 'Add Book', fr: 'Ajouter un livre' },
  bookTitle: { ar: 'عنوان الكتاب', en: 'Book Title', fr: 'Titre du livre' },
  bookCategory: { ar: 'التصنيف', en: 'Category', fr: 'Catégorie' },
  cat_selfdev: { ar: 'تطوير ذاتي', en: 'Self Development', fr: 'Développement personnel' },
  cat_money: { ar: 'مال وأعمال', en: 'Money & Business', fr: 'Argent et Affaires' },
  cat_novels: { ar: 'روايات', en: 'Novels', fr: 'Romans' },
  cat_languages: { ar: 'لغات', en: 'Languages', fr: 'Langues' },
  cat_other: { ar: 'أخرى', en: 'Other', fr: 'Autre' },
  readingProgress: { ar: 'نسبة الإنجاز %', en: 'Progress %', fr: 'Progression %' },
  saveBook: { ar: 'حفظ الكتاب', en: 'Save Book', fr: 'Enregistrer le livre' },
  readingTimer: { ar: 'مؤقت القراءة', en: 'Reading Timer', fr: 'Minuteur de lecture' },
  dailyChallengeMessage: { ar: 'تحدي 20 دقيقة يومياً', en: '20 Min Daily Challenge', fr: 'Défi de 20 min par jour' },
  startReading: { ar: 'ابدأ القراءة', en: 'Start Reading', fr: 'Commencer la lecture' },
  stopReading: { ar: 'إيقاف مؤقت', en: 'Pause', fr: 'Pause' },
  finishSession: { ar: 'إنهاء الجلسة', en: 'Finish Session', fr: 'Terminer la session' },
  totalMinutes: { ar: 'دقائق القراءة', en: 'Minutes Read', fr: 'Minutes lues' },
  smartSummary: { ar: 'ملخصات ذكية', en: 'Smart Summaries', fr: 'Résumés intelligents' },
  notesAndThoughts: { ar: 'أفكار وملاحظات', en: 'Notes & Thoughts', fr: 'Notes et Pensées' },
  topLessons: { ar: 'أهم 3 دروس تعلمتها', en: 'Top 3 Lessons', fr: 'Top 3 des leçons' },
  lesson1: { ar: 'الدرس الأول', en: 'Lesson 1', fr: 'Leçon 1' },
  lesson2: { ar: 'الدرس الثاني', en: 'Lesson 2', fr: 'Leçon 2' },
  lesson3: { ar: 'الدرس الثالث', en: 'Lesson 3', fr: 'Leçon 3' },
  reading_achievements: { ar: 'الإنجازات', en: 'Achievements', fr: 'Réalisations' },
  ach_10books: { ar: 'قارئ 10 كتب', en: '10 Books Reader', fr: 'Lecteur de 10 livres' },
  ach_100hours: { ar: 'قارئ 100 ساعة', en: '100 Hours Reader', fr: 'Lecteur de 100 heures' },
  ach_streak: { ar: 'شهر متواصل', en: '1 Month Streak', fr: 'Mois consécutif' },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: LangId;
  setLang: (l: LangId) => void;
  config: LangConfig;
  t: (key: TranslationKey) => string;
  tArray: (key: TranslationKey) => string[];
  tQuotes: () => { text: string; author: string }[];
  tObj: (key: TranslationKey) => Record<string, unknown>;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  setLang: () => { },
  config: languages[0],
  t: () => '',
  tArray: () => [],
  tQuotes: () => [],
  tObj: () => ({}),
  dir: 'rtl',
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangId>(() => {
    const saved = localStorage.getItem('tm_lang');
    return (saved as LangId) || 'ar';
  });

  const setLang = useCallback((l: LangId) => {
    setLangState(l);
    localStorage.setItem('tm_lang', l);
  }, []);

  useEffect(() => {
    const cfg = languages.find(l => l.id === lang) || languages[0];
    document.documentElement.dir = cfg.dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const configVal = languages.find(l => l.id === lang) || languages[0];

  const t = useCallback((key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    const val = (entry as Record<string, unknown>)[lang];
    if (typeof val === 'string') return val;
    return key;
  }, [lang]);

  const tArray = useCallback((key: TranslationKey): string[] => {
    const entry = translations[key];
    if (!entry) return [];
    const val = (entry as Record<string, unknown>)[lang];
    if (Array.isArray(val)) return val as string[];
    return [];
  }, [lang]);

  const tQuotes = useCallback((): { text: string; author: string }[] => {
    const entry = translations.quotes;
    const arr = entry[lang] || entry.ar;
    return arr.map(q => ({ text: q.text, author: q.author }));
  }, [lang]);

  const tObj = useCallback((key: TranslationKey): Record<string, unknown> => {
    const entry = translations[key];
    if (!entry) return {};
    return entry as Record<string, unknown>;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, config: configVal, t, tArray, tQuotes, tObj, dir: configVal.dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
