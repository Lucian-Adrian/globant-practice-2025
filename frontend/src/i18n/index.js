// Unified comprehensive i18n configuration (merged richer resources + RA namespaces)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// To avoid runtime failures inside Docker if extra language packages are missing,
// we inline minimal RA translation objects instead of importing optional packages.
const englishMessages = {
  ra: {
    action: { edit: 'Edit', save: 'Save', delete: 'Delete', refresh: 'Refresh', show: 'Show', list: 'List', create: 'Create', bulk_actions:'Bulk actions', export:'Export', search:'Search', select_all:'Select all', clear_input_value:'Clear', remove_filter:'Remove filter', add_filter:'ADD FILTER' },
    navigation: { next: 'Next', prev: 'Prev', page_range_info: 'Page %{offsetBegin}-%{offsetEnd} of %{total}', page_rows_per_page: 'Rows per page:' },
    // Merged auth keys
    auth: { email: 'Email', username:'Username', password: 'Password', sign_in: 'Sign in', sign_out: 'Sign out', logout: 'Sign out', user_menu: 'User' },
    // Merged page keys
    page: { login: 'Login', list: 'List', dashboard: 'Dashboard', create: 'Create', edit: 'Edit', show: 'Show' },
    custom: { import_csv: 'Import CSV', export_csv: 'Export CSV' },
    notification: { updated: 'Element updated', created: 'Element created', deleted: 'Element deleted' },
  }
};
const romanianMessages = {
  ra: {
    action: { edit: 'Editează', save: 'Salvează', delete: 'Șterge', refresh: 'Reîmprospătează', show: 'Vezi', list: 'Listă', create: 'Creează', bulk_actions:'Acțiuni în masă', export:'Exportă', search:'Caută', select_all:'Selectează tot', clear_input_value:'Curăță', remove_filter:'Elimină filtrul', add_filter:'ADAUGĂ FILTRU' },
    navigation: { next: 'Următor', prev: 'Anterior', page_range_info: 'Pagina %{offsetBegin}-%{offsetEnd} din %{total}', page_rows_per_page: 'Rânduri pe pagină:' },
    // Merged auth keys
    auth: { email: 'Email', username:'Utilizator', password: 'Parolă', sign_in: 'Autentificare', sign_out: 'Deconectare', logout: 'Deconectare', user_menu: 'Utilizator' },
    // Merged page keys
    page: { login: 'Autentificare', list: 'Listă', dashboard: 'Tablou de bord', create: 'Creează', edit: 'Editează', show: 'Vezi' },
    custom: { import_csv: 'Importă CSV', export_csv: 'Exportă CSV' },
    notification: { updated: 'Element actualizat', created: 'Element creat', deleted: 'Element șters' },
  }
};
const russianMessages = {
  ra: {
    action: { edit: 'Редактировать', save: 'Сохранить', delete: 'Удалить', refresh: 'Обновить', show: 'Просмотр', list: 'Список', create: 'Создать', bulk_actions:'Массовые действия', export:'Экспорт', search:'Поиск', select_all:'Выбрать все', clear_input_value:'Очистить', remove_filter:'Убрать фильтр', add_filter:'ДОБАВИТЬ ФИЛЬТР' },
    navigation: { next: 'Следующий', prev: 'Предыдущий', page_range_info: 'Страница %{offsetBegin}-%{offsetEnd} из %{total}', page_rows_per_page: 'Строк на странице:' },
    // Merged auth keys
    auth: { email: 'Email', username:'Имя пользователя', password: 'Пароль', sign_in: 'Войти', sign_out: 'Выйти', logout: 'Выйти', user_menu: 'Пользователь' },
    // Merged page keys
    page: { login: 'Вход', list: 'Список', dashboard: 'Панель', create: 'Создать', edit: 'Редактировать', show: 'Просмотр' },
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
      // Merged keys from both versions
      helpers: { license_categories: 'Comma separated e.g. B,BE,C' },
      car: { manual: 'Manual', automatic: 'Automatic', both: 'Both' },
      filters: { last_activity:'Last activity', today:'Today', this_week:'This week', last_week:'Last week', this_month:'This month', last_month:'Last month', earlier:'Earlier', status:'Status', active:'Active', inactive:'Inactive', graduated:'Graduated', pending:'Pending', in_progress:'In progress', completed:'Completed', refunded:'Refunded', canceled:'Canceled', scheduled:'Scheduled', payment_method:'Payment method', cash:'Cash', card:'Card', transfer:'Transfer', processing:'Processing', verification:'Verification', failed:'Failed', type:'Type', theory:'Theory', practice:'Practice', availability:'Availability', available:'Available', unavailable:'Unavailable', category:'Category' },
      filters_extra_local: { imminent: 'Imminent', planned: 'Planned' },
      unknown: 'Unknown',
      instructors: { free_instructors: 'Free instructors', gearbox: { manual: 'Manual', automatic: 'Automatic', both: 'Both' } },
      filters_extra: { new: 'New', experienced: 'Experienced', senior: 'Senior' },
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
      },
      loading: 'Loading…',
      error_loading: 'Error loading data',
      dashboard: {
        top_stats: {
          active_enrollments: 'Active enrollments',
          payments_total: 'Payments total'
        },
        lesson_stats: {
          title: 'Lesson statistics',
          today_created: 'Registered today',
          completed_this_week: 'Completed this week',
          attendance_rate: 'Attendance rate',
          top_instructors: 'Top instructors',
          weekly_trend: 'Weekly trend'
        }
      }
      ,
      days: {
        MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
        MONDAY_short: 'Mon', TUESDAY_short: 'Tue', WEDNESDAY_short: 'Wed', THURSDAY_short: 'Thu', FRIDAY_short: 'Fri', SATURDAY_short: 'Sat', SUNDAY_short: 'Sun'
      },
      instructorAvailabilities: {
        select_instructor: '-- Select instructor --',
        save: 'Save availabilities',
        failed_load_instructors: 'Failed to load instructors',
        failed_load_availabilities: 'Failed to load availabilities',
        select_instructor_first: 'Select an instructor first',
        availabilities_saved: 'Availabilities saved',
        available: 'Available - click to remove',
        not_available: 'Not available - click to add',
        failed_saving_availabilities: 'Failed saving availabilities',
        time_label: 'Time'
      }
    },
    validation: {
      required: 'This field is required',
      invalidPhone: 'Invalid phone number',
      invalidEmail: 'Invalid email address',
      invalidDob: 'You cannot select a future date',
      tooYoung: 'You must be at least {{years}} years old',
    },
    admin: {
      resources: {
        students: { name:'Students', empty:'No students yet', invite:'Create the first student', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', date_of_birth:'Date of birth', enrollment_date:'Enrollment date', status:'Status', password: 'Password', confirm_password: 'Confirm password' } },
        instructors: { name:'Instructors', empty:'No instructors yet', invite:'Create the first instructor', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', hire_date:'Hire date', license_categories:'License categories', experience: 'Experience' } },
        vehicles: { name:'Vehicles', empty:'No vehicles yet', invite:'Create the first vehicle', fields:{ id:'ID', make:'Make', model:'Model', license_plate:'License plate', year:'Year', category:'Category', is_available:'Available', last_service:'Last service', maintenance_status:'Maintenance status' } },
        courses: { name:'Courses', empty:'No courses yet', invite:'Create the first course', fields:{ id:'ID', name:'Name', category:'Category', type:'Type', description:'Description', price:'Price', required_lessons:'Required lessons' } },
        payments: { name:'Payments', empty:'No payments yet', invite:'Create the first payment', fields:{ id:'ID', enrollment:'Enrollment', amount:'Amount', payment_date:'Payment date', payment_method:'Payment method', status:'Status', description:'Description' } },
        enrollments: { name:'Enrollments', empty:'No enrollments yet', invite:'Create the first enrollment', fields:{ id:'ID', student:'Student', course:'Course', enrollment_date:'Enrollment date', type:'Type', status:'Status', label:'Label' } },
        lessons: { name:'Lessons', empty:'No lessons yet', invite:'Schedule the first lesson', fields:{ id:'ID', enrollment:'Enrollment', instructor:'Instructor', vehicle:'Vehicle', scheduled_time:'Scheduled time', duration_minutes:'Duration (min)', status:'Status', notes:'Notes' } },
        'instructor-availabilities': { name: 'Instructor Availabilities', empty: 'No availabilities yet', invite: 'Create availabilities', fields: { id: 'ID', instructor_id: 'Instructor', day: 'Day', hours: 'Hours' } },
        classes: { name:'Classes', empty:'No classes yet', invite:'Create the first class', fields: { id: 'ID', name: 'Name', category: 'Category', type: 'Type', description: 'Description', price: 'Price', required_lessons: 'Required lessons' } },
      }
    },
    resources: {
      students: { name:'Students', empty:'No students yet', invite:'Create the first student', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', date_of_birth:'Date of birth', enrollment_date:'Enrollment date', status:'Status', password:'Password', confirm_password:'Confirm password' } },
      instructors: { name:'Instructors', empty:'No instructors yet', invite:'Create the first instructor', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', hire_date:'Hire date', license_categories:'License categories', license_categories_hint:'Comma separated e.g., B,BE,C', experience: 'Experience' } },
      vehicles: { name:'Vehicles', empty:'No vehicles yet', invite:'Create the first vehicle', fields:{ id:'ID', make:'Make', model:'Model', license_plate:'License plate', year:'Year', category:'Category', is_available:'Available', last_service:'Last service', maintenance_status:'Maintenance status' } },
      courses: { name:'Courses', empty:'No courses yet', invite:'Create the first course', fields:{ id:'ID', name:'Name', category:'Category', type:'Type', description:'Description', price:'Price', required_lessons:'Required lessons' } },
      payments: { name:'Payments', empty:'No payments yet', invite:'Create the first payment', fields:{ id:'ID', enrollment:'Enrollment', amount:'Amount', payment_date:'Payment date', payment_method:'Payment method', status:'Status', description:'Description' } },
      enrollments: { name:'Enrollments', empty:'No enrollments yet', invite:'Create the first enrollment', fields:{ id:'ID', student:'Student', course:'Course', enrollment_date:'Enrollment date', type:'Type', status:'Status', label:'Label' } },
      lessons: { name:'Lessons', empty:'No lessons yet', invite:'Schedule the first lesson', fields:{ id:'ID', enrollment:'Enrollment', instructor:'Instructor', vehicle:'Vehicle', scheduled_time:'Scheduled time', duration_minutes:'Duration (min)', status:'Status', notes:'Notes' } },
      'instructor-availabilities': { name: 'Instructor Availabilities', empty: 'No availabilities yet', invite: 'Create availabilities', fields: { id: 'ID', instructor_id: 'Instructor', day: 'Day', hours: 'Hours' } },
      classes: { name:'Classes', empty:'No classes yet', invite:'Create the first class', fields: { id: 'ID', name: 'Name', category: 'Category', type: 'Type', description: 'Description', price: 'Price', required_lessons: 'Required lessons' } },
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
      // Merged keys from both versions
      helpers: { license_categories: 'Separate prin virgula ex. B,BE,C' },
      car: { manual: 'Manual', automatic: 'Automat', both: 'Ambele' },
      filters: { last_activity:'Ultima activitate', today:'Astăzi', this_week:'Săptămâna aceasta', last_week:'Săptămâna trecută', this_month:'Luna aceasta', last_month:'Luna trecută', earlier:'Anterior', status:'Statut', active:'Activ', inactive:'Inactiv', graduated:'Absolvit', pending:'În așteptare', in_progress:'În derulare', completed:'Finalizat', refunded:'Rambursat', canceled:'Anulat', scheduled:'Programat', payment_method:'Metodă plată', cash:'Numerar', card:'Card', transfer:'Transfer', processing:'În procesare', verification:'Verificare', failed:'Eșuat', type:'Tip', theory:'Teorie', practice:'Practică', availability:'Disponibilitate', available:'Disponibil', unavailable:'Indisponibil', category:'Categorie' },
      filters_extra_local: { imminent: 'Imediat', planned: 'Planificat' },
      unknown: 'Necunoscut',
      instructors: { free_instructors: 'Instructori disponibili', gearbox: { manual: 'Manual', automatic: 'Automat', both: 'Ambele' } },
      filters_extra: { new: 'Nou', experienced: 'Cu experiență', senior: 'Senior' },
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
      },
      loading: 'Se încarcă…',
      error_loading: 'Eroare la încărcarea datelor',
      dashboard: {
        top_stats: {
          active_enrollments: 'Înscrieri active',
          payments_total: 'Total plăți'
        },
        lesson_stats: {
          title: 'Statistici Lecții',
          today_created: 'Înregistrate astăzi',
          completed_this_week: 'Completate săpt. aceasta',
          attendance_rate: 'Rata de prezență',
          top_instructors: 'Top Instructori',
          weekly_trend: 'Evoluție săptămânală'
        }
      }
      ,
      days: {
        MONDAY: 'Luni', TUESDAY: 'Marți', WEDNESDAY: 'Miercuri', THURSDAY: 'Joi', FRIDAY: 'Vineri', SATURDAY: 'Sâmbătă', SUNDAY: 'Duminică',
        MONDAY_short: 'Lun', TUESDAY_short: 'Mar', WEDNESDAY_short: 'Mie', THURSDAY_short: 'Joi', FRIDAY_short: 'Vin', SATURDAY_short: 'Sâm', SUNDAY_short: 'Dum'
      },
      instructorAvailabilities: {
        select_instructor: '-- Selectați instructorul --',
        save: 'Salvează disponibilități',
        failed_load_instructors: 'Încărcare instructori eșuată',
        failed_load_availabilities: 'Încărcare disponibilități eșuată',
        select_instructor_first: 'Selectați mai întâi un instructor',
        availabilities_saved: 'Disponibilitățile au fost salvate',
        available: 'Disponibil - click pentru a elimina',
        not_available: 'Indisponibil - click pentru a adăuga',
        failed_saving_availabilities: 'Eșec la salvarea disponibilităților',
        time_label: 'Timp'
      }
    },
    validation: {
      required: 'Acest câmp este obligatoriu',
      invalidPhone: 'Număr de telefon invalid',
      invalidEmail: 'Adresă de email invalidă',
      invalidDob: 'Nu puteți selecta o dată din viitor',
      tooYoung: 'Trebuie să aveți cel puțin {{years}} ani',
    },
    // Duplicate resource labels under the 'admin' namespace to ensure RA menu/items resolve without falling back to EN
    admin: {
      resources: {
        students: { name:'Studenți', empty:'Niciun student încă', invite:'Creați primul student', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', date_of_birth:'Data nașterii', enrollment_date:'Data înscrierii', status:'Statut', password:'Parolă', confirm_password:'Confirmă parola' } },
        instructors: { name:'Instructori', empty:'Niciun instructor încă', invite:'Creați primul instructor', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', hire_date:'Data angajării', license_categories:'Categorii licență', license_categories_hint:'Separate prin virgulă ex.: B,BE,C', experience: 'Experiență' } },
        vehicles: { name:'Vehicule', empty:'Niciun vehicul încă', invite:'Creați primul vehicul', fields:{ id:'ID', make:'Marcă', model:'Model', license_plate:'Număr înmatriculare', year:'An', category:'Categorie', is_available:'Disponibil', last_service:'Ultimul service', maintenance_status:'Stare mentenanță' } },
        courses: { name:'Cursuri', empty:'Niciun curs încă', invite:'Creați primul curs', fields:{ id:'ID', name:'Nume', category:'Categorie', type:'Tip', description:'Descriere', price:'Preț', required_lessons:'Lecții necesare' } },
        payments: { name:'Plăți', empty:'Nicio plată încă', invite:'Creați prima plată', fields:{ id:'ID', enrollment:'Înscriere', amount:'Sumă', payment_date:'Data plății', payment_method:'Metodă plată', status:'Statut', description:'Descriere' } },
        enrollments: { name:'Înscrieri', empty:'Nicio înscriere încă', invite:'Creați prima înscriere', fields:{ id:'ID', student:'Student', course:'Curs', enrollment_date:'Data înscrierii', type:'Tip', status:'Statut', label:'Etichetă' } },
        lessons: { name:'Lecții', empty:'Nicio lecție încă', invite:'Programați prima lecție', fields:{ id:'ID', enrollment:'Înscriere', instructor:'Instructor', vehicle:'Vehicul', scheduled_time:'Ora programării', duration_minutes:'Durată (min)', status:'Statut', notes:'Note' } },
        'instructor-availabilities': { name: 'Disponibilități instructor', empty: 'Nicio disponibilitate', invite: 'Adaugă disponibilități', fields: { id: 'ID', instructor_id: 'Instructor', day: 'Zi', hours: 'Ore' } },
        classes: { name:'Clase', empty:'Nicio clasă încă', invite:'Creați prima clasă', fields: { id: 'ID', name: 'Nume', category: 'Categorie', type: 'Tip', description: 'Descriere', price: 'Preț', required_lessons: 'Lecții necesare' } },
      }
    },
    resources: {
      students: { name:'Studenți', empty:'Niciun student încă', invite:'Creați primul student', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', date_of_birth:'Data nașterii', enrollment_date:'Data înscrierii', status:'Statut', password:'Parolă', confirm_password:'Confirmă parola' } },
      instructors: { name:'Instructori', empty:'Niciun instructor încă', invite:'Creați primul instructor', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', hire_date:'Data angajării', license_categories:'Categorii licență', license_categories_hint:'Separate prin virgulă ex.: B,BE,C', experience: 'Experiență' } },
      vehicles: { name:'Vehicule', empty:'Niciun vehicul încă', invite:'Creați primul vehicul', fields:{ id:'ID', make:'Marcă', model:'Model', license_plate:'Număr înmatriculare', year:'An', category:'Categorie', is_available:'Disponibil', last_service:'Ultimul service', maintenance_status:'Stare mentenanță' } },
      courses: { name:'Cursuri', empty:'Niciun curs încă', invite:'Creați primul curs', fields:{ id:'ID', name:'Nume', category:'Categorie', type:'Tip', description:'Descriere', price:'Preț', required_lessons:'Lecții necesare' } },
      payments: { name:'Plăți', empty:'Nicio plată încă', invite:'Creați prima plată', fields:{ id:'ID', enrollment:'Înscriere', amount:'Sumă', payment_date:'Data plății', payment_method:'Metodă plată', status:'Statut', description:'Descriere' } },
      enrollments: { name:'Înscrieri', empty:'Nicio înscriere încă', invite:'Creați prima înscriere', fields:{ id:'ID', student:'Student', course:'Curs', enrollment_date:'Data înscrierii', type:'Tip', status:'Statut', label:'Etichetă' } },
      lessons: { name:'Lecții', empty:'Nicio lecție încă', invite:'Programați prima lecție', fields:{ id:'ID', enrollment:'Înscriere', instructor:'Instructor', vehicle:'Vehicul', scheduled_time:'Ora programării', duration_minutes:'Durată (min)', status:'Statut', notes:'Note' } },
      'instructor-availabilities': { name: 'Disponibilități instructor', empty: 'Nicio disponibilitate', invite: 'Adaugă disponibilități', fields: { id: 'ID', instructor_id: 'Instructor', day: 'Zi', hours: 'Ore' } },
      classes: { name:'Clase', empty:'Nicio clasă încă', invite:'Creați prima clasă', fields: { id: 'ID', name: 'Nume', category: 'Categorie', type: 'Tip', description: 'Descriere', price: 'Preț', required_lessons: 'Lecții necesare' } },
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
      // Merged keys from both versions
      helpers: { license_categories: 'Через запятую, напр. B,BE,C' },
      car: { manual: 'Механика', automatic: 'Автомат', both: 'Оба' },
      filters: { last_activity:'Последняя активность', today:'Сегодня', this_week:'Эта неделя', last_week:'Прошлая неделя', this_month:'Этот месяц', last_month:'Прошлый месяц', earlier:'Ранее', status:'Статус', active:'Активный', inactive:'Неактивный', graduated:'Выпустился', pending:'В ожидании', in_progress:'В процессе', completed:'Завершено', refunded:'Возврат', canceled:'Отменено', scheduled:'Запланировано', payment_method:'Метод оплаты', cash:'Наличные', card:'Карта', transfer:'Перевод', processing:'Обработка', verification:'Проверка', failed:'Неудачно', type:'Тип', theory:'Теория', practice:'Практика', availability:'Доступность', available:'Доступен', unavailable:'Недоступен', category:'Категория' },
      filters_extra_local: { imminent: 'Скоро', planned: 'Запланировано' },
      unknown: 'Неизвестно',
      instructors: { free_instructors: 'Свободные инструкторы', gearbox: { manual: 'Ручная', automatic: 'Автоматическая', both: 'Обе' } },
      filters_extra: { new: 'Новый', experienced: 'Опытный', senior: 'Старший' },
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
      },
      loading: 'Загрузка…',
      error_loading: 'Ошибка загрузки данных',
      dashboard: {
        top_stats: {
          active_enrollments: 'Активные записи',
          payments_total: 'Сумма платежей'
        },
        lesson_stats: {
          title: 'Статистика уроков',
          today_created: 'Зарегистрировано сегодня',
          completed_this_week: 'Завершено на этой неделе',
          attendance_rate: 'Посещаемость',
          top_instructors: 'Топ инструкторы',
          weekly_trend: 'Недельный тренд'
        }
      }
      ,
      days: {
        MONDAY: 'Понедельник', TUESDAY: 'Вторник', WEDNESDAY: 'Среда', THURSDAY: 'Четверг', FRIDAY: 'Пятница', SATURDAY: 'Суббота', SUNDAY: 'Воскресенье',
        MONDAY_short: 'Пн', TUESDAY_short: 'Вт', WEDNESDAY_short: 'Ср', THURSDAY_short: 'Чт', FRIDAY_short: 'Пт', SATURDAY_short: 'Сб', SUNDAY_short: 'Вс'
      },
      instructorAvailabilities: {
        select_instructor: '-- Выберите инструктора --',
        save: 'Сохранить доступность',
        failed_load_instructors: 'Не удалось загрузить инструкторов',
        failed_load_availabilities: 'Не удалось загрузить доступность',
        select_instructor_first: 'Сначала выберите инструктора',
        availabilities_saved: 'Доступность сохранена',
        available: 'Доступен - нажмите, чтобы удалить',
        not_available: 'Недоступен - нажмите, чтобы добавить',
        failed_saving_availabilities: 'Ошибка при сохранении доступности',
        time_label: 'Время'
      }
    },
    validation: {
      required: 'Это обязательное поле',
      invalidPhone: 'Неверный номер телефона',
      invalidEmail: 'Неверный адрес электронной почты',
      invalidDob: 'Вы не можете выбрать дату в будущем',
      tooYoung: 'Вам должно быть не менее {{years}} лет',
    },
    // Duplicate resource labels under 'admin' for consistent RA lookups
    admin: {
      resources: {
        students: { name:'Студенты', empty:'Студентов пока нет', invite:'Создайте первого студента', fields:{ id:'ID', first_name:'Имя', last_name:'Фамилия', email:'Email', phone_number:'Телефон', date_of_birth:'Дата рождения', enrollment_date:'Дата записи', status:'Статус', password:'Пароль', confirm_password:'Подтвердите пароль' } },
        instructors: { name:'Инструкторы', empty:'Инструкторов пока нет', invite:'Создайте первого инструктора', fields:{ id:'ID', first_name:'Имя', last_name:'Фамилия', email:'Email', phone_number:'Телефон', hire_date:'Дата найма', license_categories:'Категории лицензии', license_categories_hint:'Через запятую, например: B,BE,C', experience: 'Опыт' } },
        vehicles: { name:'Транспорт', empty:'Транспортных средств пока нет', invite:'Добавьте первое транспортное средство', fields:{ id:'ID', make:'Марка', model:'Модель', license_plate:'Номер', year:'Год', category:'Категория', is_available:'Доступен', last_service:'Последний сервис', maintenance_status:'Статус обслуживания' } },
        courses: { name:'Курсы', empty:'Курсов пока нет', invite:'Создайте первый курс', fields:{ id:'ID', name:'Название', category:'Категория', type:'Тип', description:'Описание', price:'Цена', required_lessons:'Требуемые уроки' } },
        payments: { name:'Платежи', empty:'Платежей пока нет', invite:'Создайте первый платеж', fields:{ id:'ID', enrollment:'Запись', amount:'Сумма', payment_date:'Дата платежа', payment_method:'Метод платежа', status:'Статус', description:'Описание' } },
        enrollments: { name:'Записи', empty:'Записей пока нет', invite:'Создайте первую запись', fields:{ id:'ID', student:'Студент', course:'Курс', enrollment_date:'Дата записи', type:'Тип', status:'Статус', label:'Метка' } },
        lessons: { name:'Уроки', empty:'Уроков пока нет', invite:'Запланируйте первый урок', fields:{ id:'ID', enrollment:'Запись', instructor:'Инструктор', vehicle:'Транспорт', scheduled_time:'Время', duration_minutes:'Длительность (мин)', status:'Статус', notes:'Заметки' } },
        'instructor-availabilities': { name: 'Доступность инструкторов', empty: 'Нет доступности', invite: 'Добавьте доступность', fields: { id: 'ID', instructor_id: 'Инструктор', day: 'День', hours: 'Часы' } },
        classes: { name:'Занятия', empty:'Занятий пока нет', invite:'Создайте первое занятие', fields: { id: 'ID', name: 'Название', category: 'Категория', type: 'Тип', description: 'Описание', price: 'Цена', required_lessons: 'Требуемые уроки' } },
      }
    },
    resources: {
      students: { name:'Студенты', empty:'Студентов пока нет', invite:'Создайте первого студента', fields:{ id:'ID', first_name:'Имя', last_name:'Фамилия', email:'Email', phone_number:'Телефон', date_of_birth:'Дата рождения', enrollment_date:'Дата записи', status:'Статус', password:'Пароль', confirm_password:'Подтвердите пароль' } },
      instructors: { name:'Инструкторы', empty:'Инструкторов пока нет', invite:'Создайте первого инструктора', fields:{ id:'ID', first_name:'Имя', last_name:'Фамилия', email:'Email', phone_number:'Телефон', hire_date:'Дата найма', license_categories:'Категории лицензии', license_categories_hint:'Через запятую, например: B,BE,C', experience: 'Опыт' } },
      vehicles: { name:'Транспорт', empty:'Транспортных средств пока нет', invite:'Добавьте первое транспортное средство', fields:{ id:'ID', make:'Марка', model:'Модель', license_plate:'Номер', year:'Год', category:'Категория', is_available:'Доступен', last_service:'Последний сервис', maintenance_status:'Статус обслуживания' } },
      courses: { name:'Курсы', empty:'Курсов пока нет', invite:'Создайте первый курс', fields:{ id:'ID', name:'Название', category:'Категория', type:'Тип', description:'Описание', price:'Цена', required_lessons:'Требуемые уроки' } },
      payments: { name:'Платежи', empty:'Платежей пока нет', invite:'Создайте первый платеж', fields:{ id:'ID', enrollment:'Запись', amount:'Сумма', payment_date:'Дата платежа', payment_method:'Метод платежа', status:'Статус', description:'Описание' } },
      enrollments: { name:'Записи', empty:'Записей пока нет', invite:'Создайте первую запись', fields:{ id:'ID', student:'Студент', course:'Курс', enrollment_date:'Дата записи', type:'Тип', status:'Статус', label:'Метка' } },
      lessons: { name:'Уроки', empty:'Уроков пока нет', invite:'Запланируйте первый урок', fields:{ id:'ID', enrollment:'Запись', instructor:'Инструктор', vehicle:'Транспорт', scheduled_time:'Время', duration_minutes:'Длительность (мин)', status:'Статус', notes:'Заметки' } },
      'instructor-availabilities': { name: 'Доступность инструкторов', empty: 'Нет доступности', invite: 'Добавьте доступность', fields: { id: 'ID', instructor_id: 'Инструктор', day: 'День', hours: 'Часы' } },
      classes: { name:'Занятия', empty:'Занятий пока нет', invite:'Создайте первое занятие', fields: { id: 'ID', name: 'Название', category: 'Категория', type: 'Тип', description: 'Описание', price: 'Цена', required_lessons: 'Требуемые уроки' } },
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
    // 5. Resource labels (resources.students.name) — try admin namespace first, then common.resources.*
    // Also attempt variants without the 'resources.' prefix since some lookups omit it.
    if (key.startsWith('resources.')) {
      const rAdmin = tryKey(key, 'admin');
      if (rAdmin) return rAdmin;
      const rCommon = tryKey(key, 'common');
      if (rCommon) return rCommon;

      // Try without the 'resources.' prefix: e.g. 'lessons.fields.enrollment'
      const withoutPrefix = key.replace(/^resources\./, '');
      const rAdmin2 = tryKey(withoutPrefix, 'admin');
      if (rAdmin2) return rAdmin2;
      const rCommon2 = tryKey(withoutPrefix, 'common');
      if (rCommon2) return rCommon2;
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