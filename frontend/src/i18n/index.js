// Unified comprehensive i18n configuration (merged richer resources + RA namespaces)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// To avoid runtime failures inside Docker if extra language packages are missing,
// we inline minimal RA translation objects instead of importing optional packages.
// (english base kept minimal; extend as needed.)
const englishMessages = {
  ra: {
    action: { edit: 'Edit', save: 'Save', delete: 'Delete', refresh: 'Refresh', show: 'Show', list: 'List', create: 'Create', bulk_actions:'Bulk actions', export:'Export', search:'Search', select_all:'Select all', clear_input_value:'Clear', remove_filter:'Remove filter' },
  navigation: { next: 'Next', prev: 'Prev', page_range_info: 'Page %{offsetBegin}-%{offsetEnd} of %{total}', page_rows_per_page: 'Rows per page:' },
  auth: { email: 'Email', username:'Username', password: 'Password', sign_in: 'Sign in', sign_out: 'Sign out' },
  page: { login: 'Login', list: 'List', dashboard: 'Dashboard' },
  custom: { import_csv: 'Import CSV', export_csv: 'Export CSV' },
    notification: { updated: 'Element updated', created: 'Element created', deleted: 'Element deleted' },
  }
};
const romanianMessages = {
  ra: {
    action: { edit: 'Editează', save: 'Salvează', delete: 'Șterge', refresh: 'Reîmprospătează', show: 'Vezi', list: 'Listă', create: 'Creează', bulk_actions:'Acțiuni în masă', export:'Exportă', search:'Caută', select_all:'Selectează tot', clear_input_value:'Curăță', remove_filter:'Elimină filtrul' },
  navigation: { next: 'Următor', prev: 'Anterior', page_range_info: 'Pagina %{offsetBegin}-%{offsetEnd} din %{total}', page_rows_per_page: 'Rânduri pe pagină:' },
  auth: { email: 'Email', username:'Utilizator', password: 'Parolă', sign_in: 'Autentificare', sign_out: 'Deconectare' },
  page: { login: 'Autentificare', list: 'Listă', dashboard: 'Tablou de bord' },
  custom: { import_csv: 'Importă CSV', export_csv: 'Exportă CSV' },
    notification: { updated: 'Element actualizat', created: 'Element creat', deleted: 'Element șters' },
  }
};
const russianMessages = {
  ra: {
    action: { edit: 'Редактировать', save: 'Сохранить', delete: 'Удалить', refresh: 'Обновить', show: 'Просмотр', list: 'Список', create: 'Создать', bulk_actions:'Массовые действия', export:'Экспорт', search:'Поиск', select_all:'Выбрать все', clear_input_value:'Очистить', remove_filter:'Убрать фильтр' },
  navigation: { next: 'Следующий', prev: 'Предыдущий', page_range_info: 'Страница %{offsetBegin}-%{offsetEnd} из %{total}', page_rows_per_page: 'Строк на странице:' },
  auth: { email: 'Email', username:'Имя пользователя', password: 'Пароль', sign_in: 'Войти', sign_out: 'Выйти' },
  page: { login: 'Вход', list: 'Список', dashboard: 'Панель' },
  custom: { import_csv: 'Импорт CSV', export_csv: 'Экспорт CSV' },
    notification: { updated: 'Элемент обновлен', created: 'Элемент создан', deleted: 'Элемент удален' },
  }
};

// Normalize RA placeholders from "%{var}" to i18next format "{{var}}"
const fixPlaceholders = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const recur = (o) => Object.fromEntries(
    Object.entries(o).map(([k, v]) => {
      if (typeof v === 'string') return [k, v.replace(/%\{(.*?)\}/g, '{{$1}}')];
      if (v && typeof v === 'object' && !Array.isArray(v)) return [k, recur(v)];
      return [k, v];
    })
  );
  return recur(obj);
};

const LS_KEY = 'app_lang';
const storedLang = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;

// Shared portal (signup) translations live in `common`, validation in `validation`
// Admin-specific RA resource labels live in `admin` namespace; RA core strings in `ra`.
const languageData = {
  en: {
    ra: fixPlaceholders(englishMessages.ra || englishMessages),
    common: {
      welcome: 'Welcome to School Portal',
      connect: 'Connect',
      signupTitle: 'Student Signup',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      dob: 'Date of Birth',
      status: 'Status',
      selectStatus: 'Select Status',
      active: 'Active',
      inactive: 'Inactive',
      signUp: 'Sign Up',
      submitting: 'Submitting...',
      signupSuccess: 'Registration successful',
      signupFailed: 'Registration failed',
      networkError: 'Network error. Please try again.',
      debugLabel: 'Debug info',
      languages: { en: 'English', ro: 'Romanian', ru: 'Russian' },
  filters: { last_activity:'Last activity', today:'Today', this_week:'This week', last_week:'Last week', this_month:'This month', last_month:'Last month', earlier:'Earlier', status:'Status', active:'Active', inactive:'Inactive', graduated:'Graduated', pending:'Pending', in_progress:'In progress', completed:'Completed', canceled:'Canceled', scheduled:'Scheduled', payment_method:'Payment method', cash:'Cash', card:'Card', transfer:'Transfer', type:'Type', theory:'Theory', practice:'Practice', availability:'Availability', available:'Available', unavailable:'Unavailable', category:'Category' },
      vehicles: { filters: { ok:'OK', due:'Due', overdue:'Overdue' } },
      students: {
        board: {
          title: 'Students Board',
          search: { placeholder: 'Search by name or email…' },
          column: { pending: 'Pending', active: 'Active', graduated: 'Graduated', inactive: 'Inactive' },
          actions: { load_more: 'Load more' },
          empty: 'No items',
          loading: 'Loading…'
        }
      }
    },
    validation: {
      required: 'This field is required',
      invalidPhone: 'Invalid phone number',
      invalidEmail: 'Invalid email address',
      invalidDob: 'You cannot select a future date',
      tooYoung: 'You must be at least {{years}} years old',
    },
    admin: {},
    resources: {
      students: { name:'Students', empty:'No students yet', invite:'Create the first student', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', date_of_birth:'Date of birth', enrollment_date:'Enrollment date', status:'Status' } },
      instructors: { name:'Instructors', empty:'No instructors yet', invite:'Create the first instructor', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', hire_date:'Hire date', license_categories:'License categories' } },
      vehicles: { name:'Vehicles', empty:'No vehicles yet', invite:'Create the first vehicle', fields:{ id:'ID', make:'Make', model:'Model', license_plate:'License plate', year:'Year', category:'Category', is_available:'Available', last_service:'Last service', maintenance_status:'Maintenance status' } },
      courses: { name:'Courses', empty:'No courses yet', invite:'Create the first course', fields:{ id:'ID', name:'Name', category:'Category', type:'Type', description:'Description', price:'Price', required_lessons:'Required lessons' } },
      payments: { name:'Payments', empty:'No payments yet', invite:'Create the first payment', fields:{ id:'ID', enrollment:'Enrollment', amount:'Amount', payment_date:'Payment date', payment_method:'Payment method', description:'Description' } },
      enrollments: { name:'Enrollments', empty:'No enrollments yet', invite:'Create the first enrollment', fields:{ id:'ID', student:'Student', course:'Course', enrollment_date:'Enrollment date', type:'Type', status:'Status', label:'Label' } },
      lessons: { name:'Lessons', empty:'No lessons yet', invite:'Schedule the first lesson', fields:{ id:'ID', enrollment:'Enrollment', instructor:'Instructor', vehicle:'Vehicle', scheduled_time:'Scheduled time', duration_minutes:'Duration (min)', status:'Status', notes:'Notes' } },
      classes: { name:'Classes', empty:'No classes yet', invite:'Create the first class' },
    },
  },
  ro: {
    ra: fixPlaceholders(romanianMessages.ra || romanianMessages),
    common: {
      welcome: 'Bine ați venit la Portalul Școlii',
      connect: 'Conectează-te',
      signupTitle: 'Înregistrare Student',
      firstName: 'Prenume',
      lastName: 'Nume',
      email: 'Email',
      phone: 'Telefon',
      dob: 'Data nașterii',
      status: 'Statut',
      selectStatus: 'Selectați statutul',
      active: 'Activ',
      inactive: 'Inactiv',
      signUp: 'Înregistrează-te',
      submitting: 'Se trimite...',
      signupSuccess: 'Înregistrare reușită',
      signupFailed: 'Înregistrare eșuată',
      networkError: 'Eroare de rețea. Reîncercați.',
      debugLabel: 'Informații debug',
      languages: { en: 'Engleză', ro: 'Română', ru: 'Rusă' },
  filters: { last_activity:'Ultima activitate', today:'Astăzi', this_week:'Săptămâna aceasta', last_week:'Săptămâna trecută', this_month:'Luna aceasta', last_month:'Luna trecută', earlier:'Anterior', status:'Statut', active:'Activ', inactive:'Inactiv', graduated:'Absolvit', pending:'În așteptare', in_progress:'În derulare', completed:'Finalizat', canceled:'Anulat', scheduled:'Programat', payment_method:'Metodă plată', cash:'Numerar', card:'Card', transfer:'Transfer', type:'Tip', theory:'Teorie', practice:'Practică', availability:'Disponibilitate', available:'Disponibil', unavailable:'Indisponibil', category:'Categorie' },
      vehicles: { filters: { ok:'OK', due:'Scadent', overdue:'Depășit' } },
      students: {
        board: {
          title: 'Tablă Studenți',
          search: { placeholder: 'Căutați după nume sau email…' },
          column: { pending: 'În așteptare', active: 'Activ', graduated: 'Absolvit', inactive: 'Inactiv' },
          actions: { load_more: 'Încarcă mai mult' },
          empty: 'Fără elemente',
          loading: 'Se încarcă…'
        }
      }
    },
    validation: {
      required: 'Acest câmp este obligatoriu',
      invalidPhone: 'Număr de telefon invalid',
      invalidEmail: 'Adresă de email invalidă',
      invalidDob: 'Nu puteți selecta o dată din viitor',
      tooYoung: 'Trebuie să aveți cel puțin {{years}} ani',
    },
    admin: {},
    resources: {
      students: { name:'Studenți', empty:'Niciun student încă', invite:'Creați primul student', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', date_of_birth:'Data nașterii', enrollment_date:'Data înscrierii', status:'Statut' } },
      instructors: { name:'Instructori', empty:'Niciun instructor încă', invite:'Creați primul instructor', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', hire_date:'Data angajării', license_categories:'Categorii licență' } },
      vehicles: { name:'Vehicule', empty:'Niciun vehicul încă', invite:'Creați primul vehicul', fields:{ id:'ID', make:'Marcă', model:'Model', license_plate:'Număr înmatriculare', year:'An', category:'Categorie', is_available:'Disponibil', last_service:'Ultimul service', maintenance_status:'Stare mentenanță' } },
      courses: { name:'Cursuri', empty:'Niciun curs încă', invite:'Creați primul curs', fields:{ id:'ID', name:'Nume', category:'Categorie', type:'Tip', description:'Descriere', price:'Preț', required_lessons:'Lecții necesare' } },
      payments: { name:'Plăți', empty:'Nicio plată încă', invite:'Creați prima plată', fields:{ id:'ID', enrollment:'Înscriere', amount:'Sumă', payment_date:'Data plății', payment_method:'Metodă plată', description:'Descriere' } },
      enrollments: { name:'Înscrieri', empty:'Nicio înscriere încă', invite:'Creați prima înscriere', fields:{ id:'ID', student:'Student', course:'Curs', enrollment_date:'Data înscrierii', type:'Tip', status:'Statut', label:'Etichetă' } },
      lessons: { name:'Lecții', empty:'Nicio lecție încă', invite:'Programați prima lecție', fields:{ id:'ID', enrollment:'Înscriere', instructor:'Instructor', vehicle:'Vehicul', scheduled_time:'Ora programării', duration_minutes:'Durată (min)', status:'Statut', notes:'Note' } },
      classes: { name:'Clase', empty:'Nicio clasă încă', invite:'Creați prima clasă' },
    },
  },
  ru: {
    ra: fixPlaceholders(russianMessages.ra || russianMessages),
    common: {
      welcome: 'Добро пожаловать в школьный портал',
      connect: 'Подключиться',
      signupTitle: 'Регистрация студента',
      firstName: 'Имя',
      lastName: 'Фамилия',
      email: 'Эл. почта',
      phone: 'Телефон',
      dob: 'Дата рождения',
      status: 'Статус',
      selectStatus: 'Выберите статус',
      active: 'Активный',
      inactive: 'Неактивный',
      signUp: 'Зарегистрироваться',
      submitting: 'Отправка...',
      signupSuccess: 'Регистрация успешна',
      signupFailed: 'Ошибка регистрации',
      networkError: 'Сетевая ошибка. Повторите попытку.',
      debugLabel: 'Отладочная информация',
      languages: { en: 'Английский', ro: 'Румынский', ru: 'Русский' },
  filters: { last_activity:'Последняя активность', today:'Сегодня', this_week:'Эта неделя', last_week:'Прошлая неделя', this_month:'Этот месяц', last_month:'Прошлый месяц', earlier:'Ранее', status:'Статус', active:'Активный', inactive:'Неактивный', graduated:'Выпустился', pending:'В ожидании', in_progress:'В процессе', completed:'Завершено', canceled:'Отменено', scheduled:'Запланировано', payment_method:'Метод оплаты', cash:'Наличные', card:'Карта', transfer:'Перевод', type:'Тип', theory:'Теория', practice:'Практика', availability:'Доступность', available:'Доступен', unavailable:'Недоступен', category:'Категория' },
      vehicles: { filters: { ok:'OK', due:'Скоро сервис', overdue:'Просрочено' } },
      students: {
        board: {
          title: 'Доска студентов',
          search: { placeholder: 'Поиск по имени или email…' },
          column: { pending: 'В ожидании', active: 'Активный', graduated: 'Выпустился', inactive: 'Неактивный' },
          actions: { load_more: 'Загрузить еще' },
          empty: 'Пусто',
          loading: 'Загрузка…'
        }
      }
    },
    validation: {
      required: 'Это обязательное поле',
      invalidPhone: 'Неверный номер телефона',
      invalidEmail: 'Неверный адрес электронной почты',
      invalidDob: 'Вы не можете выбрать дату в будущем',
      tooYoung: 'Вам должно быть не менее {{years}} лет',
    },
    admin: {},
    resources: {
      students: { name:'Студенты', empty:'Студентов пока нет', invite:'Создайте первого студента', fields:{ id:'ID', first_name:'Имя', last_name:'Фамилия', email:'Email', phone_number:'Телефон', date_of_birth:'Дата рождения', enrollment_date:'Дата записи', status:'Статус' } },
      instructors: { name:'Инструкторы', empty:'Инструкторов пока нет', invite:'Создайте первого инструктора', fields:{ id:'ID', first_name:'Имя', last_name:'Фамилия', email:'Email', phone_number:'Телефон', hire_date:'Дата найма', license_categories:'Категории лицензии' } },
      vehicles: { name:'Транспорт', empty:'Транспортных средств пока нет', invite:'Добавьте первое транспортное средство', fields:{ id:'ID', make:'Марка', model:'Модель', license_plate:'Номер', year:'Год', category:'Категория', is_available:'Доступен', last_service:'Последний сервис', maintenance_status:'Статус обслуживания' } },
      courses: { name:'Курсы', empty:'Курсов пока нет', invite:'Создайте первый курс', fields:{ id:'ID', name:'Название', category:'Категория', type:'Тип', description:'Описание', price:'Цена', required_lessons:'Требуемые уроки' } },
      payments: { name:'Платежи', empty:'Платежей пока нет', invite:'Создайте первый платеж', fields:{ id:'ID', enrollment:'Запись', amount:'Сумма', payment_date:'Дата платежа', payment_method:'Метод платежа', description:'Описание' } },
      enrollments: { name:'Записи', empty:'Записей пока нет', invite:'Создайте первую запись', fields:{ id:'ID', student:'Студент', course:'Курс', enrollment_date:'Дата записи', type:'Тип', status:'Статус', label:'Метка' } },
      lessons: { name:'Уроки', empty:'Уроков пока нет', invite:'Запланируйте первый урок', fields:{ id:'ID', enrollment:'Запись', instructor:'Инструктор', vehicle:'Транспорт', scheduled_time:'Время', duration_minutes:'Длительность (мин)', status:'Статус', notes:'Заметки' } },
      classes: { name:'Занятия', empty:'Занятий пока нет', invite:'Создайте первое занятие' },
    },
  },
};

// Transform so resource keys live under the default namespace (common.resources.*)
// This makes i18n.t('resources.payments.name') resolve, since defaultNS='common'.
const resources = Object.fromEntries(
  Object.entries(languageData).map(([lng, data]) => {
    const { common = {}, resources: resourceBlock, ...rest } = data;
    // Avoid overwriting if already nested
    const mergedCommon = { ...common, resources: resourceBlock };
    return [lng, { ...rest, common: mergedCommon }];
  })
);

// Initialize only once; keep a helper for legacy calls (initI18n) used in main.jsx
export function initI18n(lang = storedLang || 'en') {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng: lang,
      fallbackLng: 'en',
      ns: ['ra', 'common', 'validation', 'admin'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
    });
    i18n.on('languageChanged', (lng) => { try { window.localStorage.setItem(LS_KEY, lng); } catch (_) {} });
  }
  return i18n;
}

// Ensure default initialization (so components using hooks without manual init still work)
initI18n();

// Expose globally for console debugging (e.g., window.i18n.changeLanguage('ro'))
if (typeof window !== 'undefined') {
  window.i18n = i18n; // alias
  window.i18next = i18n; // common naming expectation
}

// React-Admin i18n provider bridge
// Enhanced RA translation provider mapping RA / common / resources prefixed keys to proper namespaces
export const raI18nProvider = {
  translate: (key, options = {}) => {
    if (!key) return '';

    const tryKey = (k, ns) => {
      const r = i18n.t(k, { ns, defaultValue: k, ...options });
      return r && r !== k ? r : null;
    };

    // 1. Exact namespaced markers like ra.something.* -> strip 'ra.' and use ns 'ra'
    if (key.startsWith('ra.')) {
      const path = key.slice(3); // page.list, action.create etc.
      const r = tryKey(path, 'ra');
      if (r) return r;
    }
    // 2. Uppercase RA.* form -> normalize to lower and retry
    if (key.startsWith('RA.')) {
      const lower = key.toLowerCase();
      const path = lower.slice(3);
      const r = tryKey(path, 'ra');
      if (r) return r;
    }
    // 3. Common namespace (common.languages.en, common.filters.today)
    if (key.startsWith('common.')) {
      const path = key.slice(7);
      const r = tryKey(path, 'common');
      if (r) return r;
    }
    // 4. Validation namespace
    if (key.startsWith('validation.')) {
      const path = key.slice(11);
      const r = tryKey(path, 'validation');
      if (r) return r;
    }
    // 5. Resource labels (resources.students.name) live under common.resources.*
    if (key.startsWith('resources.')) {
      const r = tryKey(key, 'common');
      if (r) return r;
    }
    // 6. Direct attempt (maybe already using internal path without prefix)
    const direct = i18n.t(key, { ...options, defaultValue: key });
    if (direct && direct !== key) return direct;
    return key; // fallback to raw key (helps detect missing keys in UI)
  },
  changeLocale: (locale) => {
    return i18n.changeLanguage(locale);
  },
  getLocale: () => i18n.language,
};

export default i18n;