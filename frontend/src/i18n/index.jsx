// Unified comprehensive i18n configuration (merged richer resources + RA namespaces)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import React from 'react';
import portalEn from './locales/en.json';
import portalRo from './locales/ro.json';
import portalRu from './locales/ru.json';

// Explicit map of portal locales to ensure they are bundled and available synchronously
const portalLocalesMap = {
  en: portalEn,
  ro: portalRo,
  ru: portalRu
};

// Auto-pickup of additional portal locales if present (Vite only)
// This is kept as a fallback or for future languages, but we prefer explicit imports above

// To avoid runtime failures inside Docker if extra language packages are missing,
// we inline minimal RA translation objects instead of importing optional packages.
const englishMessages = {
  ra: {
    action: { edit: 'Edit', save: 'Save', delete: 'Delete', refresh: 'Refresh', show: 'Show', list: 'List', create: 'Create', bulk_actions: 'Bulk actions', export: 'Export', search: 'Search', select_all: 'Select all', clear_input_value: 'Clear', remove_filter: 'Remove filter', add_filter: 'ADD FILTER', open_menu: 'Open menu', close_menu: 'Close menu', open: 'Open', close: 'Close', back: 'Back', undo: 'Undo' },
    navigation: { next: 'Next', prev: 'Prev', page_range_info: 'Page {{offsetBegin}}-{{offsetEnd}} of {{total}}', page_rows_per_page: 'Rows per page:', no_results: 'No results' },
    sort: { sort_by: 'Sort by {{field}} {{order}}', ASC: 'ascending', DESC: 'descending' },
    auth: { email: 'Email', username: 'Username', password: 'Password', sign_in: 'Sign in', sign_out: 'Sign out', logout: 'Sign out', user_menu: 'User' },
    page: { login: 'Login', list: 'List', dashboard: 'Dashboard', create: 'Create', edit: 'Edit', show: 'Show', error: 'Error' },
    message: { error: 'Error', invalid_form: 'Invalid form' }, validation: { required: 'Required' },
    custom: { import_csv: 'Import CSV', export_csv: 'Export CSV' }, notification: { updated: 'Element updated', created: 'Element created', deleted: 'Element deleted' },
  },
};
const romanianMessages = {
  ra: {
    action: {
      edit: 'Editează',
      save: 'Salvează',
      delete: 'Șterge',
      refresh: 'Reîmprospătează',
      show: 'Vezi',
      list: 'Listă',
      create: 'Creează',
      bulk_actions: 'Acțiuni în masă',
      export: 'Exportă',
      search: 'Caută',
      select_all: 'Selectează tot',
      clear_input_value: 'Curăță',
      remove_filter: 'Elimină filtrul',
      add_filter: 'ADAUGĂ FILTRU',
      open_menu: 'Deschide meniul',
      close_menu: 'Închide meniul',
      open: 'Deschide',
      close: 'Închide',
      back: 'Înapoi',
      undo: 'Anulează',
    },
    navigation: {
      next: 'Următor',
      prev: 'Anterior',
      page_range_info: 'Pagina {{offsetBegin}}-{{offsetEnd}} din {{total}}',
      page_rows_per_page: 'Rânduri pe pagină:',
      no_results: 'Fără rezultate',
    },
    sort: {
      sort_by: 'Sortează după {{field}} {{order}}',
      ASC: 'crescător',
      DESC: 'descrescător',
    },
    // Merged auth keys
    auth: {
      email: 'Email',
      username: 'Utilizator',
      password: 'Parolă',
      sign_in: 'Autentificare',
      sign_out: 'Deconectare',
      logout: 'Deconectare',
      user_menu: 'Utilizator',
    },
    // Merged page keys
    page: {
      login: 'Autentificare',
      list: 'Listă',
      dashboard: 'Tablou de bord',
      create: 'Creează',
      edit: 'Editează',
      show: 'Vezi',
      error: 'Eroare',
    },
    message: { error: 'Eroare', invalid_form: 'Formular invalid' }, validation: { required: 'Obligatoriu' }, custom: { import_csv: 'Importă CSV', export_csv: 'Exportă CSV' }, notification: { updated: 'Element actualizat', created: 'Element creat', deleted: 'Element șters' },
  },
};
const russianMessages = {
  ra: {
    action: {
      edit: 'Редактировать',
      save: 'Сохранить',
      delete: 'Удалить',
      refresh: 'Обновить',
      show: 'Просмотр',
      list: 'Список',
      create: 'Создать',
      bulk_actions: 'Массовые действия',
      export: 'Экспорт',
      search: 'Поиск',
      select_all: 'Выбрать все',
      clear_input_value: 'Очистить',
      remove_filter: 'Убрать фильтр',
      add_filter: 'ДОБАВИТЬ ФИЛЬТР',
      open_menu: 'Открыть меню',
      close_menu: 'Закрыть меню',
      open: 'Открыть',
      close: 'Закрыть',
      back: 'Назад',
      undo: 'Отменить',
    },
    navigation: {
      next: 'Следующий',
      prev: 'Предыдущий',
      page_range_info: 'Страница {{offsetBegin}}-{{offsetEnd}} из {{total}}',
      page_rows_per_page: 'Строк на странице:',
      no_results: 'Нет результатов',
    },
    sort: {
      sort_by: 'Сортировать по {{field}} {{order}}',
      ASC: 'по возрастанию',
      DESC: 'по убыванию',
    },
    // Merged auth keys
    auth: {
      email: 'Email',
      username: 'Имя пользователя',
      password: 'Пароль',
      sign_in: 'Войти',
      sign_out: 'Выйти',
      logout: 'Выйти',
      user_menu: 'Пользователь',
    },
    // Merged page keys
    page: {
      login: 'Вход',
      list: 'Список',
      dashboard: 'Панель',
      create: 'Создать',
      edit: 'Редактировать',
      show: 'Просмотр',
      error: 'Ошибка',
    },
    message: { error: 'Ошибка', invalid_form: 'Неверная форма' }, validation: { required: 'Обязательно' }, custom: { import_csv: 'Импорт CSV', export_csv: 'Экспорт CSV' }, notification: { updated: 'Элемент обновлен', created: 'Элемент создан', deleted: 'Элемент удален' },
  },
};

// Normalize RA placeholders from "%{var}" to i18next format "{{var}}"
const fixPlaceholders = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const recur = (o) => Object.fromEntries(
    Object.entries(o).map(([k, v]) => {
      if (typeof v === 'string') {
        return [k, v.replace(/%\{(.*?)\}/g, '{{$1}}')];
      }
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return [k, recur(v)];
      }
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
     hide_filters: 'Hide Filters',
     show_filters: 'Show Filters',
  instructors: { free_instructors: 'Free instructors', gearbox: { label: 'Gearbox', manual: 'Manual', automatic: 'Automatic', both: 'Both' } },
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
      // Admin / Backend validation keys
      requiredField: 'This field is required',
      instructorConflict: 'Instructor has a conflicting lesson at this time',
      studentConflict: 'Student has a conflicting lesson at this time',
      vehicleConflict: 'Vehicle is already booked at this time',
      resourceConflict: 'Resource is already booked at this time',
      outsideAvailability: 'Selected time is outside instructor availability',
      categoryMismatch: 'Vehicle category does not match course category',
      instructorLicenseMismatch: 'Instructor is not licensed for this category',
      vehicleUnavailable: 'Vehicle is unavailable',
      vehicleResourceRequired: 'Only vehicle-type resources (max_capacity = 2) can be assigned to lessons.',
      practiceEnrollmentRequired: 'Lessons can only be created for practice enrollments.',
      theoryOnly: 'Scheduled classes can only be created for THEORY courses.',
      classroomResourceRequired: 'Only classroom-type resources (max_capacity > 2) can be assigned to scheduled classes.',
      capacityExceeded: 'Max students must be positive and cannot exceed the room capacity.',
      capacityBelowEnrolled: 'Max students cannot be lower than current enrollment.',
      studentNotEnrolledToCourse: 'All selected students must be enrolled in the chosen course.',
      studentNotEnrolledToCourseNames: 'The following students are not enrolled in the chosen course: {{names}}.',
  capacityBelowSelected: 'Max students cannot be lower than number of selected students.',
  selectedStudentsExceedCapacity: 'Selected students exceed room capacity.',
  atLeastOneRecurrence: 'At least one recurrence is required',
    },
    admin: {
      resources: {
  students: { name:'Students', empty:'No students yet', invite:'Create the first student', import_helper:'You can import a CSV to add multiple students at once.', import_format_hint:'Required columns: first_name,last_name,email,phone_number,date_of_birth,status (others ignored).', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', date_of_birth:'Date of birth', enrollment_date:'Enrollment date', status:'Status', password: 'Password', confirm_password: 'Confirm password' } },
    instructors: { name:'Instructors', empty:'No instructors yet', invite:'Create the first instructor', import_helper:'You can import a CSV to add multiple instructors at once.', import_format_hint:'Required columns: first_name,last_name,email,phone_number,hire_date,license_categories (others ignored).', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', hire_date:'Hire date', license_categories:'License categories', experience: 'Experience' } },
    vehicles: { name:'Vehicles', empty:'No vehicles yet', invite:'Create the first vehicle', import_helper:'You can import a CSV to add multiple vehicles at once.', import_format_hint:'Required columns: make,model,license_plate,year,category (others ignored).', fields:{ id:'ID', make:'Make', model:'Model', license_plate:'License plate', year:'Year', category:'Category', is_available:'Available', last_service:'Last service', maintenance_status:'Maintenance status' } },
  resources: { name:'Resources', empty:'No resources yet', invite:'Create the first resource', import_helper:'You can import a CSV to add multiple resources at once.', fields:{ id:'ID', name:'Name', max_capacity:'Max Capacity', category:'Category', resource_type:'Type', is_available:'Available', make: "Make", model: "Model", year: "Year", license_plate: "License Plate", vehicle: "Vehicle", classroom: "Classroom" } },
    courses: { name:'Courses', empty:'No courses yet', invite:'Create the first course', import_helper:'You can import a CSV to add multiple courses at once.', import_format_hint:'Required columns: name,category,type,description,price,required_lessons (others ignored).', fields:{ id:'ID', name:'Name', category:'Category', type:'Type', description:'Description', price:'Price', required_lessons:'Required lessons' } },
    payments: { name:'Payments', empty:'No payments yet', invite:'Create the first payment', import_helper:'You can import a CSV to add multiple payments at once.', import_format_hint:'Required columns: enrollment_id,amount,payment_method,description (others ignored).', fields:{ id:'ID', enrollment:'Enrollment', amount:'Amount', payment_date:'Payment date', payment_method:'Payment method', status:'Status', description:'Description' } },
    enrollments: { name:'Enrollments', empty:'No enrollments yet', invite:'Create the first enrollment', import_helper:'You can import a CSV to add multiple enrollments at once.', import_format_hint:'Required columns: student_id,course_id,type,status (others ignored).', fields:{ id:'ID', student:'Student', course:'Course', enrollment_date:'Enrollment date', type:'Type', status:'Status', label:'Label' } },
  lessons: { name:'Lessons', empty:'No lessons yet', invite:'Schedule the first lesson', import_helper:'You can import a CSV to add multiple lessons at once.', import_format_hint:'Required columns: enrollment_id,instructor_id,resource_id,scheduled_time,duration_minutes,status (others ignored).', fields:{ id:'ID', enrollment:'Enrollment', instructor:'Instructor', vehicle:'Vehicle', resource:'Resource', scheduled_time:'Scheduled time', duration_minutes:'Duration (min)', status:'Status', notes:'Notes' } },
        'instructor-availabilities': { name: 'Instructor Availabilities', empty: 'No availabilities yet', invite: 'Create availabilities', fields: { id: 'ID', instructor_id: 'Instructor', day: 'Day', hours: 'Hours' } },
        classes: { name:'Courses', empty:'No courses yet', invite:'Create the first course', fields: { id: 'ID', name: 'Name', category: 'Category', type: 'Type', description: 'Description', price: 'Price', required_lessons: 'Required lessons' } },
        scheduledclasses: { 
          name: 'Scheduled Classes', 
          empty: 'No scheduled classes yet', 
          invite: 'Create the first scheduled class', 
          import_helper: 'You can import a CSV to add multiple scheduled classes at once.', 
          import_format_hint: 'Required columns: name,course_id,instructor_id,resource_id,scheduled_time,duration_minutes,max_students (others ignored).', 
          fields: { 
            id: 'ID', 
            name: 'Name', 
            course: 'Course', 
            instructor: 'Instructor', 
            resource: 'Resource', 
            scheduled_time: 'Scheduled time', 
            duration_minutes: 'Duration (min)', 
            max_students: 'Max students', 
            students: 'Students', 
            current_enrollment: 'Current enrollment', 
            available_spots: 'Available spots',
            pattern: 'Pattern'
          }, 
          helper: 'Create a scheduled class to start planning lessons.', 
          create: 'Create Scheduled Class' 
        },
        scheduledclasspatterns: {
          name: 'Scheduled Class Patterns',
          empty: 'No patterns yet',
          invite: 'Create the first pattern',
          fields: {
            id: 'ID',
            name: 'Name',
            course: 'Course',
            instructor: 'Instructor',
            resource: 'Resource',
            recurrence_days: 'Recurrence Days',
            times: 'Times',
            start_date: 'Start Date',
            num_lessons: 'Number of Lessons',
            default_duration_minutes: 'Default Duration (min)',
            default_max_students: 'Default Max Students',
            students: 'Students',
            day: 'Day',
            time: 'Time',
            recurrences: 'Recurrences'
          },
          generate: {
            button: 'Generate Classes',
            confirm_title: 'Generate Classes',
            confirm_content: 'Generate scheduled classes for this pattern?',
            success: 'Classes generated successfully',
            error: 'Error generating classes'
          },
          bulk: {
            generate: 'Generate Classes',
            regenerate: 'Regenerate Classes',
            generate_success: 'Generated classes for %{count} patterns (%{classes} classes)',
            generate_partial_success: 'Generated classes: %{success_count} success, %{fail_count} failed (%{classes} classes)',
            generate_error: 'Error generating classes: %{error}',
            regenerate_success: 'Regenerated classes for %{count} patterns (deleted %{deleted}, generated %{generated})',
            regenerate_error: 'Error regenerating classes: %{error}',
            generate_confirm_title: 'Generate Classes',
            generate_confirm_content: 'Are you sure you want to generate classes for %{count} pattern(s)? This may take some time.',
            regenerate_confirm_title: 'Regenerate Classes',
            regenerate_confirm_content: 'Are you sure you want to regenerate classes for %{count} pattern(s)? This will delete existing classes and create new ones.'
          },
          viewClasses: 'View Classes'
        },
      }
    },
    resources: {
  students: { name:'Students', empty:'No students yet', invite:'Create the first student', import_helper:'You can import a CSV to add multiple students at once.', import_format_hint:'Required columns: first_name,last_name,email,phone_number,date_of_birth,status (others ignored).', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', date_of_birth:'Date of birth', enrollment_date:'Enrollment date', status:'Status', password:'Password', confirm_password:'Confirm password' } },
    instructors: { name:'Instructors', empty:'No instructors yet', invite:'Create the first instructor', import_helper:'You can import a CSV to add multiple instructors at once.', import_format_hint:'Required columns: first_name,last_name,email,phone_number,hire_date,license_categories (others ignored).', fields:{ id:'ID', first_name:'First name', last_name:'Last name', email:'Email', phone_number:'Phone', hire_date:'Hire date', license_categories:'License categories', license_categories_hint:'Comma separated e.g., B,BE,C', experience: 'Experience' } },
    vehicles: { name:'Vehicles', empty:'No vehicles yet', invite:'Create the first vehicle', import_helper:'You can import a CSV to add multiple vehicles at once.', import_format_hint:'Required columns: make,model,license_plate,year,category (others ignored).', fields:{ id:'ID', make:'Make', model:'Model', license_plate:'License plate', year:'Year', category:'Category', is_available:'Available', last_service:'Last service', maintenance_status:'Maintenance status' } },
  resources: { name:'Resources', empty:'No resources yet', invite:'Create the first resource', import_helper:'You can import a CSV to add multiple resources at once.', fields:{ id:'ID', name:'Name', max_capacity:'Max Capacity', category:'Category', resource_type:'Type', is_available:'Available', make: "Make", model: "Model", year: "Year", license_plate: "License Plate", vehicle: "Vehicle", classroom: "Classroom" } },
    courses: { name:'Courses', empty:'No courses yet', invite:'Create the first course', import_helper:'You can import a CSV to add multiple courses at once.', import_format_hint:'Required columns: name,category,type,description,price,required_lessons (others ignored).', fields:{ id:'ID', name:'Name', category:'Category', type:'Type', description:'Description', price:'Price', required_lessons:'Required lessons' } },
    payments: { name:'Payments', empty:'No payments yet', invite:'Create the first payment', import_helper:'You can import a CSV to add multiple payments at once.', import_format_hint:'Required columns: enrollment_id,amount,payment_method,description (others ignored).', fields:{ id:'ID', enrollment:'Enrollment', amount:'Amount', payment_date:'Payment date', payment_method:'Payment method', status:'Status', description:'Description' } },
    enrollments: { name:'Enrollments', empty:'No enrollments yet', invite:'Create the first enrollment', import_helper:'You can import a CSV to add multiple enrollments at once.', import_format_hint:'Required columns: student_id,course_id,type,status (others ignored).', fields:{ id:'ID', student:'Student', course:'Course', enrollment_date:'Enrollment date', type:'Type', status:'Status', label:'Label' } },
  lessons: { name:'Lessons', empty:'No lessons yet', invite:'Schedule the first lesson', import_helper:'You can import a CSV to add multiple lessons at once.', import_format_hint:'Required columns: enrollment_id,instructor_id,resource_id,scheduled_time,duration_minutes,status (others ignored).', fields:{ id:'ID', enrollment:'Enrollment', instructor:'Instructor', vehicle:'Vehicle', resource:'Resource', scheduled_time:'Scheduled time', duration_minutes:'Duration (min)', status:'Status', notes:'Notes' } },
      'instructor-availabilities': { name: 'Instructor Availabilities', empty: 'No availabilities yet', invite: 'Create availabilities', fields: { id: 'ID', instructor_id: 'Instructor', day: 'Day', hours: 'Hours' } },
      classes: { name:'Courses', empty:'No courses yet', invite:'Create the first course', fields: { id: 'ID', name: 'Name', category: 'Category', type: 'Type', description: 'Description', price: 'Price', required_lessons: 'Required lessons' } },
      scheduledclasses: { name: 'Scheduled Classes', empty: 'No scheduled classes yet', invite: 'Create the first scheduled class', import_helper: 'You can import a CSV to add multiple scheduled classes at once.', import_format_hint: 'Required columns: name,course_id,instructor_id,resource_id,scheduled_time,duration_minutes,max_students (others ignored).', fields: { id: 'ID', name: 'Name', course: 'Course', instructor: 'Instructor', resource: 'Resource', scheduled_time: 'Scheduled time', duration_minutes: 'Duration (min)', max_students: 'Max students', students: 'Students', current_enrollment: 'Current enrollment', available_spots: 'Available spots', pattern: 'Pattern' }, helper: 'Create a scheduled class to start planning lessons.', create: 'Create Scheduled Class' },
      scheduledclasspatterns: { 
        name: 'Scheduled Class Patterns', 
        empty: 'No patterns yet', 
        invite: 'Create the first pattern', 
        fields: { 
          id: 'ID', 
          name: 'Name', 
          course: 'Course', 
          instructor: 'Instructor', 
          resource: 'Resource', 
          recurrence_days: 'Recurrence Days', 
          times: 'Times', 
          start_date: 'Start Date', 
          num_lessons: 'Number of Lessons', 
          default_duration_minutes: 'Default Duration (min)', 
          default_max_students: 'Default Max Students', 
          students: 'Students', 
          day: 'Day', 
          time: 'Time', 
          recurrences: 'Recurrences' 
        },
        generate: {
          button: 'Generate Classes',
          confirm_title: 'Generate Classes',
          confirm_content: 'Generate scheduled classes for this pattern?',
          success: 'Classes generated successfully',
          error: 'Error generating classes'
        },
        bulk: {
          generate: 'Generate Classes',
          regenerate: 'Regenerate Classes',
          generate_success: 'Generated classes for %{count} patterns (%{classes} classes)',
          generate_partial_success: 'Generated classes: %{success_count} success, %{fail_count} failed (%{classes} classes)',
          generate_error: 'Error generating classes: %{error}',
          regenerate_success: 'Regenerated classes for %{count} patterns (deleted %{deleted}, generated %{generated})',
          regenerate_error: 'Error regenerating classes: %{error}',
          generate_confirm_title: 'Generate Classes',
          generate_confirm_content: 'Are you sure you want to generate classes for %{count} pattern(s)? This may take some time.',
          regenerate_confirm_title: 'Regenerate Classes',
          regenerate_confirm_content: 'Are you sure you want to regenerate classes for %{count} pattern(s)? This will delete existing classes and create new ones.'
        },
        viewClasses: 'View Classes'
      },
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
      hide_filters: 'Ascunde filtrele',
      show_filters: 'Arată filtrele',
  instructors: { free_instructors: 'Instructori disponibili', gearbox: { label: 'Cutie de viteze', manual: 'Manual', automatic: 'Automat', both: 'Ambele' } },
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
      // Admin / Backend validation keys
      requiredField: 'Acest câmp este obligatoriu',
      instructorConflict: 'Instructorul are deja o lecție în acest interval',
      studentConflict: 'Studentul are deja o lecție în acest interval',
      vehicleConflict: 'Vehiculul este deja rezervat în acest interval',
      resourceConflict: 'Resursa este deja rezervată în acest interval',
      outsideAvailability: 'Ora selectată este în afara disponibilității instructorului',
      categoryMismatch: 'Categoria vehiculului nu corespunde categoriei cursului',
      instructorLicenseMismatch: 'Instructorul nu este licențiat pentru această categorie',
      vehicleUnavailable: 'Vehiculul selectat este indisponibil',
      vehicleResourceRequired: 'Doar resurse de tip vehicul (max_capacity = 2) pot fi alocate lecțiilor.',
      practiceEnrollmentRequired: 'Lecțiile pot fi create doar pentru înscrieri la practică.',
      theoryOnly: 'Clasele programate pot fi create doar pentru cursuri de TEORIE.',
      classroomResourceRequired: 'Doar resurse de tip sală (max_capacity > 2) pot fi alocate claselor programate.',
      capacityExceeded: 'Numărul maxim de studenți trebuie să fie pozitiv și să nu depășească capacitatea sălii.',
      capacityBelowEnrolled: 'Numărul maxim de studenți nu poate fi mai mic decât numărul înscrișilor curent.',
      studentNotEnrolledToCourse: 'Toți studenții selectați trebuie să fie înscriși la cursul ales.',
  studentNotEnrolledToCourseNames: 'Următorii studenți nu sunt înscriși la cursul ales: {{names}}.',
  capacityBelowSelected: 'Numărul maxim nu poate fi mai mic decât numărul de studenți selectați.',
  selectedStudentsExceedCapacity: 'Numărul de studenți selectați depășește capacitatea sălii.',
  atLeastOneRecurrence: 'Este necesară cel puțin o recurență',
    },
    // Duplicate resource labels under the 'admin' namespace to ensure RA menu/items resolve without falling back to EN
    admin: {
      resources: {
  students: { name:'Studenți', empty:'Niciun student încă', invite:'Creați primul student', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai mulți studenți odată.', import_format_hint:'Coloane obligatorii: first_name,last_name,email,phone_number,date_of_birth,status (altele sunt ignorate).', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', date_of_birth:'Data nașterii', enrollment_date:'Data înscrierii', status:'Statut', password:'Parolă', confirm_password:'Confirmă parola' } },
    instructors: { name:'Instructori', empty:'Niciun instructor încă', invite:'Creați primul instructor', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai mulți instructori odată.', import_format_hint:'Coloane obligatorii: first_name,last_name,email,phone_number,hire_date,license_categories (altele sunt ignorate).', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', hire_date:'Data angajării', license_categories:'Categorii licență', license_categories_hint:'Separate prin virgulă ex.: B,BE,C', experience: 'Experiență' } },
    vehicles: { name:'Vehicule', empty:'Niciun vehicul încă', invite:'Creați primul vehicul', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe vehicule odată.', import_format_hint:'Coloane obligatorii: make,model,license_plate,year,category (altele sunt ignorate).', fields:{ id:'ID', make:'Marcă', model:'Model', license_plate:'Număr înmatriculare', year:'An', category:'Categorie', is_available:'Disponibil', last_service:'Ultimul service', maintenance_status:'Stare mentenanță' } },
  resources: { name:'Resurse', empty:'Nicio resursă încă', invite:'Creați prima resursă', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe resurse.', fields:{ id:'ID', name:'Nume', max_capacity:'Capacitate maximă', category:'Categorie', resource_type:'Tip', is_available:'Disponibil', make: "Marcă", model: "Model", year: "An", license_plate: "Număr de înmatriculare", vehicle: "Vehicul", classroom: "Sală de curs" } },
    courses: { name:'Cursuri', empty:'Niciun curs încă', invite:'Creați primul curs', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe cursuri odată.', import_format_hint:'Coloane obligatorii: name,category,type,description,price,required_lessons (altele sunt ignorate).', fields:{ id:'ID', name:'Nume', category:'Categorie', type:'Tip', description:'Descriere', price:'Preț', required_lessons:'Lecții necesare' } },
    payments: { name:'Plăți', empty:'Nicio plată încă', invite:'Creați prima plată', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe plăți odată.', import_format_hint:'Coloane obligatorii: enrollment_id,amount,payment_method,description (altele sunt ignorate).', fields:{ id:'ID', enrollment:'Înscriere', amount:'Sumă', payment_date:'Data plății', payment_method:'Metodă plată', status:'Statut', description:'Descriere' } },
    enrollments: { name:'Înscrieri', empty:'Nicio înscriere încă', invite:'Creați prima înscriere', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe înscrieri odată.', import_format_hint:'Coloane obligatorii: student_id,course_id,type,status (altele sunt ignorate).', fields:{ id:'ID', student:'Student', course:'Curs', enrollment_date:'Data înscrierii', type:'Tip', status:'Statut', label:'Etichetă' } },
  lessons: { name:'Lecții', empty:'Nicio lecție încă', invite:'Programați prima lecție', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe lecții odată.', import_format_hint:'Coloane obligatorii: enrollment_id,instructor_id,resource_id,scheduled_time,duration_minutes,status (altele sunt ignorate).', fields:{ id:'ID', enrollment:'Înscriere', instructor:'Instructor', vehicle:'Vehicul', resource:'Resursă', scheduled_time:'Ora programării', duration_minutes:'Durată (min)', status:'Statut', notes:'Note' } },
        'instructor-availabilities': { name: 'Disponibilități instructor', empty: 'Nicio disponibilitate', invite: 'Adaugă disponibilități', fields: { id: 'ID', instructor_id: 'Instructor', day: 'Zi', hours: 'Ore' } },
        classes: { name:'Clase', empty:'Nicio clasă încă', invite:'Creați prima clasă', fields: { id: 'ID', name: 'Nume', category: 'Categorie', type: 'Tip', description: 'Descriere', price: 'Preț', required_lessons: 'Lecții necesare' } },
        scheduledclasses: { name: 'Clase programate', empty: 'Nicio clasă programată încă', invite: 'Creați prima clasă programată', import_helper: 'Puteți importa un CSV pentru a adăuga mai multe clase programate odată.', import_format_hint: 'Coloane obligatorii: name,course_id,instructor_id,resource_id,scheduled_time,duration_minutes,max_students (altele sunt ignorate).', fields: { id: 'ID', name: 'Nume', course: 'Curs', instructor: 'Instructor', resource: 'Resursă', scheduled_time: 'Ora programării', duration_minutes: 'Durată (min)', max_students: 'Număr maxim de studenți', students: 'Studenți', current_enrollment: 'Înscriși curent', available_spots: 'Locuri disponibile', pattern: 'Model' }, helper: 'Creați o clasă programată pentru a începe planificarea lecțiilor.', create: 'Creați clasă programată' },
        scheduledclasspatterns: {
          name: 'Modele de clase programate',
          empty: 'Niciun model încă',
          invite: 'Creați primul model',
          fields: {
            id: 'ID',
            name: 'Nume',
            course: 'Curs',
            instructor: 'Instructor',
            resource: 'Resursă',
            recurrence_days: 'Zile de recurență',
            times: 'Ore',
            start_date: 'Data de început',
            num_lessons: 'Număr de lecții',
            default_duration_minutes: 'Durată implicită (min)',
            default_max_students: 'Studenți maximi impliciți',
            students: 'Studenți',
            day: 'Zi',
            time: 'Oră',
            recurrences: 'Recurențe'
          },
          generate: {
            button: 'Generează Clase',
            confirm_title: 'Generează Clase',
            confirm_content: 'Generați clase programate pentru acest model?',
            success: 'Clase generate cu succes',
            error: 'Eroare la generarea claselor'
          },
          bulk: {
            generate: 'Generează Clase',
            regenerate: 'Regenerează Clase',
            generate_success: 'Clase generate pentru %{count} modele (%{classes} clase)',
            generate_partial_success: 'Clase generate: %{success_count} succes, %{fail_count} eșuate (%{classes} clase)',
            generate_error: 'Eroare la generarea claselor: %{error}',
            regenerate_success: 'Clase regenerate pentru %{count} modele (șterse %{deleted}, generate %{generated})',
            regenerate_error: 'Eroare la regenerarea claselor: %{error}',
            generate_confirm_title: 'Generează Clase',
            generate_confirm_content: 'Sunteți sigur că doriți să generați clase pentru %{count} modele? Acest lucru poate dura.',
            regenerate_confirm_title: 'Regenerează Clase',
            regenerate_confirm_content: 'Sunteți sigur că doriți să regenerați clase pentru %{count} modele? Aceasta va șterge clasele existente și va crea altele noi.'
          },
          viewClasses: 'Vezi Clase'
        },
      }
    },
    resources: {
  students: { name:'Studenți', empty:'Niciun student încă', invite:'Creați primul student', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai mulți studenți odată.', import_format_hint:'Coloane obligatorii: first_name,last_name,email,phone_number,date_of_birth,status (altele sunt ignorate).', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', date_of_birth:'Data nașterii', enrollment_date:'Data înscrierii', status:'Statut', password:'Parolă', confirm_password:'Confirmă parola' } },
    instructors: { name:'Instructori', empty:'Niciun instructor încă', invite:'Creați primul instructor', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai mulți instructori odată.', import_format_hint:'Coloane obligatorii: first_name,last_name,email,phone_number,hire_date,license_categories (altele sunt ignorate).', fields:{ id:'ID', first_name:'Prenume', last_name:'Nume', email:'Email', phone_number:'Telefon', hire_date:'Data angajării', license_categories:'Categorii licență', license_categories_hint:'Separate prin virgulă ex.: B,BE,C', experience: 'Experiență' } },
    vehicles: { name:'Vehicule', empty:'Niciun vehicul încă', invite:'Creați primul vehicul', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe vehicule odată.', import_format_hint:'Coloane obligatorii: make,model,license_plate,year,category (altele sunt ignorate).', fields:{ id:'ID', make:'Marcă', model:'Model', license_plate:'Număr înmatriculare', year:'An', category:'Categorie', is_available:'Disponibil', last_service:'Ultimul service', maintenance_status:'Stare mentenanță' } },
  resources: { name:'Resurse', empty:'Nicio resursă încă', invite:'Creați prima resursă', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe resurse.', fields:{ id:'ID', name:'Nume', max_capacity:'Capacitate maximă', category:'Categorie', resource_type:'Tip', is_available:'Disponibil', make: "Marcă", model: "Model", year: "An", license_plate: "Număr de înmatriculare", vehicle: "Vehicul", classroom: "Sală de curs" } },
    courses: { name:'Cursuri', empty:'Niciun curs încă', invite:'Creați primul curs', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe cursuri odată.', import_format_hint:'Coloane obligatorii: name,category,type,description,price,required_lessons (altele sunt ignorate).', fields:{ id:'ID', name:'Nume', category:'Categorie', type:'Tip', description:'Descriere', price:'Preț', required_lessons:'Lecții necesare' } },
    payments: { name:'Plăți', empty:'Nicio plată încă', invite:'Creați prima plată', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe plăți odată.', import_format_hint:'Coloane obligatorii: enrollment_id,amount,payment_method,description (altele sunt ignorate).', fields:{ id:'ID', enrollment:'Înscriere', amount:'Sumă', payment_date:'Data plății', payment_method:'Metodă plată', status:'Statut', description:'Descriere' } },
    enrollments: { name:'Înscrieri', empty:'Nicio înscriere încă', invite:'Creați prima înscriere', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe înscrieri odată.', import_format_hint:'Coloane obligatorii: student_id,course_id,type,status (altele sunt ignorate).', fields:{ id:'ID', student:'Student', course:'Curs', enrollment_date:'Data înscrierii', type:'Tip', status:'Statut', label:'Etichetă' } },
  lessons: { name:'Lecții', empty:'Nicio lecție încă', invite:'Programați prima lecție', import_helper:'Puteți importa un fișier CSV pentru a adăuga mai multe lecții odată.', import_format_hint:'Coloane obligatorii: enrollment_id,instructor_id,resource_id,scheduled_time,duration_minutes,status (altele sunt ignorate).', fields:{ id:'ID', enrollment:'Înscriere', instructor:'Instructor', vehicle:'Vehicul', resource:'Resursă', scheduled_time:'Ora programării', duration_minutes:'Durată (min)', status:'Statut', notes:'Note' } },
      'instructor-availabilities': { name: 'Disponibilități instructor', empty: 'Nicio disponibilitate', invite: 'Adaugă disponibilități', fields: { id: 'ID', instructor_id: 'Instructor', day: 'Zi', hours: 'Ore' } },
      classes: { name:'Clase', empty:'Nicio clasă încă', invite:'Creați prima clasă', fields: { id: 'ID', name: 'Nume', category: 'Categorie', type: 'Tip', description: 'Descriere', price: 'Preț', required_lessons: 'Lecții necesare' } },
      scheduledclasses: { name: 'Clase programate', empty: 'Nicio clasă programată încă', invite: 'Creați prima clasă programată', import_helper: 'Puteți importa un CSV pentru a adăuga mai multe clase programate odată.', import_format_hint: 'Coloane obligatorii: name,course_id,instructor_id,resource_id,scheduled_time,duration_minutes,max_students (altele sunt ignorate).', fields: { id: 'ID', name: 'Nume', course: 'Curs', instructor: 'Instructor', resource: 'Resursă', scheduled_time: 'Ora programării', duration_minutes: 'Durată (min)', max_students: 'Număr maxim de studenți', students: 'Studenți', current_enrollment: 'Înscriși curent', available_spots: 'Locuri disponibile', pattern: 'Model' }, helper: 'Creați o clasă programată pentru a începe planificarea lecțiilor.', create: 'Creați clasă programată' },
      scheduledclasspatterns: { 
        name: 'Modele de clase programate', 
        empty: 'Niciun model încă', 
        invite: 'Creați primul model', 
        fields: { 
          id: 'ID', 
          name: 'Nume', 
          course: 'Curs', 
          instructor: 'Instructor', 
          resource: 'Resursă', 
          recurrence_days: 'Zile de recurență', 
          times: 'Ore', 
          start_date: 'Data de început', 
          num_lessons: 'Număr de lecții', 
          default_duration_minutes: 'Durată implicită (min)', 
          default_max_students: 'Studenți maximi impliciți', 
          students: 'Studenți', 
          day: 'Zi', 
          time: 'Oră', 
          recurrences: 'Recurențe' 
        },
        generate: {
          button: 'Generează Clase',
          confirm_title: 'Generează Clase',
          confirm_content: 'Generați clase programate pentru acest model?',
          success: 'Clase generate cu succes',
          error: 'Eroare la generarea claselor'
        },
        bulk: {
          generate: 'Generează Clase',
          regenerate: 'Regenerează Clase',
          generate_success: 'Clase generate pentru %{count} modele (%{classes} clase)',
          generate_partial_success: 'Clase generate: %{success_count} succes, %{fail_count} eșuate (%{classes} clase)',
          generate_error: 'Eroare la generarea claselor: %{error}',
          regenerate_success: 'Clase regenerate pentru %{count} modele (șterse %{deleted}, generate %{generated})',
          regenerate_error: 'Eroare la regenerarea claselor: %{error}',
          generate_confirm_title: 'Generează Clase',
          generate_confirm_content: 'Sunteți sigur că doriți să generați clase pentru %{count} modele? Acest lucru poate dura.',
          regenerate_confirm_title: 'Regenerează Clase',
          regenerate_confirm_content: 'Sunteți sigur că doriți să regenerați clase pentru %{count} modele? Aceasta va șterge clasele existente și va crea altele noi.'
        },
        viewClasses: 'Vezi Clase'
      },
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
      hide_filters: 'Скрыть фильтры',
      show_filters: 'Показать фильтры',
  instructors: { free_instructors: 'Свободные инструкторы', gearbox: { label: 'Коробка передач', manual: 'Ручная', automatic: 'Автоматическая', both: 'Обе' } },
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
      // Admin / Backend validation keys
      requiredField: 'Это обязательное поле',
      instructorConflict: 'У инструктора уже есть занятие в это время',
      studentConflict: 'У студента уже есть занятие в это время',
      vehicleConflict: 'Транспорт уже занят в это время',
      resourceConflict: 'Ресурс уже занят в это время',
      outsideAvailability: 'Выбранное время вне доступности инструктора',
      categoryMismatch: 'Категория транспорта не соответствует категории курса',
      instructorLicenseMismatch: 'Инструктор не имеет лицензии для этой категории',
      vehicleUnavailable: 'Транспорт недоступен',
      vehicleResourceRequired: 'К урокам можно привязывать только ресурсы типа «транспорт» (max_capacity = 2).',
      practiceEnrollmentRequired: 'Уроки можно создавать только для практических записей.',
      theoryOnly: 'Запланированные занятия можно создавать только для ТЕОРЕТИЧЕСКИХ курсов.',
      classroomResourceRequired: 'Только ресурсы типа аудитории (max_capacity > 2) можно назначать запланированным занятиям.',
      capacityExceeded: 'Макс. число студентов должно быть положительным и не превышать вместимость аудитории.',
      capacityBelowEnrolled: 'Макс. число студентов не может быть меньше текущего количества записанных.',
      studentNotEnrolledToCourse: 'Все выбранные студенты должны быть записаны на выбранный курс.',
      studentNotEnrolledToCourseNames: 'Следующие студенты не записаны на выбранный курс: {{names}}.',
  capacityBelowSelected: 'Макс. число студентов не может быть меньше количества выбранных студентов.',
  selectedStudentsExceedCapacity: 'Количество выбранных студентов превышает вместимость аудитории.',
  atLeastOneRecurrence: 'Требуется хотя бы одно повторение',
    },
    // Duplicate resource labels under 'admin' for consistent RA lookups
    admin: {
      resources: {
  students: { name:'Студенты', empty:'Студентов пока нет', invite:'Создайте первого студента', import_helper:'Вы можете импортировать CSV, чтобы добавить нескольких студентов сразу.', import_format_hint:'Обязательные колонки: first_name,last_name,email,phone_number,date_of_birth,status (остальные игнорируются).', fields:{ id:'ИД', first_name:'Имя', last_name:'Фамилия', email:'Email', phone_number:'Телефон', date_of_birth:'Дата рождения', enrollment_date:'Дата записи', status:'Статус', password:'Пароль', confirm_password:'Подтвердите пароль' } },
  instructors: { name:'Инструкторы', empty:'Инструкторов пока нет', invite:'Создайте первого инструктора', import_helper:'Вы можете импортировать CSV, чтобы добавить нескольких инструкторов сразу.', import_format_hint:'Обязательные колонки: first_name,last_name,email,phone_number,hire_date,license_categories (остальные игнорируются).', fields:{ id:'ИД', first_name:'Имя', last_name:'Фамилия', email:'Email', phone_number:'Телефон', hire_date:'Дата найма', license_categories:'Категории лицензии', license_categories_hint:'Через запятую, например: B,BE,C', experience: 'Опыт' } },
  vehicles: { name:'Транспорт', empty:'Транспортных средств пока нет', invite:'Добавьте первое транспортное средство', import_helper:'Вы можете импортировать CSV, чтобы добавить несколько транспортных средств сразу.', import_format_hint:'Обязательные колонки: make,model,license_plate,year,category (остальные игнорируются).', fields:{ id:'ИД', make:'Марка', model:'Модель', license_plate:'Номер', year:'Год', category:'Категория', is_available:'Доступен', last_service:'Последний сервис', maintenance_status:'Статус обслуживания' } },
  resources: { name:'Ресурсы', empty:'Ресурсов пока нет', invite:'Создайте первый ресурс', import_helper:'Вы можете импортировать CSV, чтобы добавить несколько ресурсов сразу.', fields:{ id:'ИД', name:'Название', max_capacity:'Макс. вместимость', category:'Категория', resource_type:'Тип', is_available:'Доступен', make: "Марка", model: "Модель", year: "Год", license_plate: "Номерной знак", vehicle: "Транспорт", classroom: "Аудитория" } },
  courses: { name:'Курсы', empty:'Курсов пока нет', invite:'Создайте первый курс', import_helper:'Вы можете импортировать CSV, чтобы добавить несколько курсов сразу.', import_format_hint:'Обязательные колонки: name,category,type,description,price,required_lessons (остальные игнорируются).', fields:{ id:'ИД', name:'Название', category:'Категория', type:'Тип', description:'Описание', price:'Цена', required_lessons:'Требуемые уроки' } },
  payments: { name:'Платежи', empty:'Платежей пока нет', invite:'Создайте первый платеж', import_helper:'Вы можете импортировать CSV, чтобы добавить несколько платежей сразу.', import_format_hint:'Обязательные колонки: enrollment_id,amount,payment_method,description (остальные игнорируются).', fields:{ id:'ИД', enrollment:'Запись', amount:'Сумма', payment_date:'Дата платежа', payment_method:'Метод платежа', status:'Статус', description:'Описание' } },
  enrollments: { name:'Записи', empty:'Записей пока нет', invite:'Создайте первую запись', import_helper:'Вы можете импортировать CSV, чтобы добавить несколько записей сразу.', import_format_hint:'Обязательные колонки: student_id,course_id,type,status (остальные игнорируются).', fields:{ id:'ИД', student:'Студент', course:'Курс', enrollment_date:'Дата записи', type:'Тип', status:'Статус', label:'Метка' } },
  lessons: { name:'Уроки', empty:'Уроков пока нет', invite:'Запланируйте первый урок', import_helper:'Вы можете импортировать CSV, чтобы добавить несколько уроков сразу.', import_format_hint:'Обязательные колонки: enrollment_id,instructor_id,resource_id,scheduled_time,duration_minutes,status (остальные игнорируются).', fields:{ id:'ИД', enrollment:'Запись', instructor:'Инструктор', vehicle:'Транспорт', resource:'Ресурс', scheduled_time:'Время', duration_minutes:'Длительность (мин)', status:'Статус', notes:'Заметки' } },
        'instructor-availabilities': { name: 'Доступность инструкторов', empty: 'Нет доступности', invite: 'Добавьте доступность', fields: { id: 'ID', instructor_id: 'Инструктор', day: 'День', hours: 'Часы' } },
        classes: { name:'Занятия', empty:'Занятий пока нет', invite:'Создайте первое занятие', fields: { id: 'ID', name: 'Название', category: 'Категория', type: 'Тип', description: 'Описание', price: 'Цена', required_lessons: 'Требуемые уроки' } },
      scheduledclasses: { name: 'Запланированные занятия', empty: 'Пока нет запланированных занятий', invite: 'Создайте первое запланированное занятие', import_helper: 'Вы можете импортировать CSV, чтобы добавить несколько занятий сразу.', import_format_hint: 'Обязательные колонки: name,course,instructor,resource,scheduled_time,duration_minutes,max_students (остальные игнорируются).', fields: { id: 'ИД', name: 'Название', course: 'Курс', instructor: 'Инструктор', resource: 'Ресурс', scheduled_time: 'Время', duration_minutes: 'Длительность (мин)', max_students: 'Макс. число студентов', students: 'Студенты', current_enrollment: 'Текущая запись', available_spots: 'Доступные места', pattern: 'Шаблон' }, helper: 'Создайте запланированное занятие, чтобы начать планирование уроков.', create: 'Создать запланированное занятие' },
      scheduledclasspatterns: {
        name: 'Шаблоны запланированных занятий',
        empty: 'Шаблонов пока нет',
        invite: 'Создайте первый шаблон',
        fields: {
          id: 'ИД',
          name: 'Название',
          course: 'Курс',
          instructor: 'Инструктор',
          resource: 'Ресурс',
          recurrence_days: 'Дни повторения',
          times: 'Время',
          start_date: 'Дата начала',
          num_lessons: 'Количество занятий',
          default_duration_minutes: 'Длительность по умолчанию (мин)',
          default_max_students: 'Макс. студентов по умолчанию',
          students: 'Студенты',
          day: 'День',
          time: 'Время',
          recurrences: 'Повторения'
        },
        generate: {
          button: 'Создать занятия',
          confirm_title: 'Создать занятия',
          confirm_content: 'Создать запланированные занятия для этого шаблона?',
          success: 'Занятия созданы успешно',
          error: 'Ошибка при создании занятий'
        },
        bulk: {
          generate: 'Создать занятия',
          regenerate: 'Пересоздать занятия',
          generate_success: 'Созданы занятия для %{count} шаблонов (%{classes} занятий)',
          generate_partial_success: 'Созданы занятия: %{success_count} успешно, %{fail_count} неудачно (%{classes} занятий)',
          generate_error: 'Ошибка при создании занятий: %{error}',
          regenerate_success: 'Пересозданы занятия для %{count} шаблонов (удалено %{deleted}, создано %{generated})',
          regenerate_error: 'Ошибка при пересоздании занятий: %{error}',
          generate_confirm_title: 'Создать занятия',
          generate_confirm_content: 'Вы уверены, что хотите создать занятия для %{count} шаблонов? Это может занять некоторое время.',
          regenerate_confirm_title: 'Пересоздать занятия',
          regenerate_confirm_content: 'Вы уверены, что хотите пересоздать занятия для %{count} шаблонов? Это удалит существующие занятия и создаст новые.'
        },
        viewClasses: 'Просмотр занятий'
      },
    },
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
    // Add portal namespace: use explicit map first, then fallback to glob or English
    // We use the entire JSON object so that 'portal.*' keys and top-level keys (appName) resolve correctly
    // We ALSO merge the content of 'portal' key to the top level to support 'booking.*' style keys (legacy support)
    let portalJson = portalLocalesMap[lng] || portalEn;
    let portalNS = { ...portalJson, ...(portalJson.portal || {}) };
    return [lng, { ...rest, common: mergedCommon, portal: portalNS }];
  })
);

// Runtime safeguard: removed since glob is not used.

// Initialize only once; keep a helper for legacy calls (initI18n) used in main.jsx
export function initI18n(lang = storedLang || 'en') {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng: lang,
      fallbackLng: 'en',
  supportedLngs: ['en', 'ro', 'ru'],
  load: 'languageOnly',
  nonExplicitSupportedLngs: true,
  cleanCode: true,
      ns: ['ra', 'common', 'validation', 'admin', 'portal'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      react: {
        bindI18n: 'languageChanged loaded added',
      },
    });
    // Initial hydration attempt for starting language
    // ensurePortalBundle(lang);
    i18n.on('languageChanged', (lng) => {
      try { window.localStorage.setItem(LS_KEY, lng); } catch (_) {}
      // ensurePortalBundle(lng);
    });
  }
  return i18n;
}

// Ensure default initialization (so components using hooks without manual init still work)
initI18n();

// Small helper React hook (kept here to avoid a new file) to force a re-render on language changes when
// a component needs to display newly hydrated async portal bundles immediately. In most cases
// useTranslation already re-renders, but if a key was missing at first render (showing raw) and later
// gets added via ensurePortalBundle, this hook guarantees a flush.
export function useI18nForceUpdate() {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const bump = () => setTick(t => t +  1);
    i18n.on('languageChanged', bump);
    // Also react when async namespaces (like 'portal') finish loading
    i18n.on('loaded', bump);
    i18n.on('added', bump);
    return () => {
      i18n.off('languageChanged', bump);
      i18n.off('loaded', bump);
      i18n.off('added', bump);
    };
  }, []);
}

// Expose globally for console debugging (e.g., window.i18n.changeLanguage('ro'))
if (typeof window !== 'undefined') {
  window.i18n = i18n; // alias
  window.i18next = i18n; // common naming expectation
}

// React-Admin i18n provider bridge
// Enhanced RA translation provider mapping RA / common / resources prefixed keys to proper namespaces
let currentLocale = i18n.language || 'en';

export const raI18nProvider = {
  translate: (key, options = {}) => {
    if (!key) return '';

    const tryKey = (k, ns) => {
      // react-admin often passes '_' as alias for defaultValue
      const { _, defaultValue, ...rest } = options || {};
      // Force use of currentLocale to avoid lag
      const r = i18n.t(k, { ns, lng: currentLocale, defaultValue: defaultValue ?? _ ?? k, ...rest });
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
  const { _, defaultValue, ...rest } = options || {};
  const direct = i18n.t(key, { ...rest, lng: currentLocale, defaultValue: defaultValue ?? _ ?? key });
    if (direct && direct !== key) return direct;
    return key; // fallback to raw key (helps detect missing keys in UI)
  },
  changeLocale: (locale) => {
    currentLocale = locale;
    return i18n.changeLanguage(locale);
  },
  getLocale: () => currentLocale,
};

export default i18n;

// Simple app-wide locale state mirroring RA's useLocaleState for the portal
const APP_LOCALE_KEY = 'app_lang';
export function useAppLocaleState() {
  const getBase = (lng) => (lng || 'en').split('-')[0];
  const getStoredLang = () => {
    try {
      return window.localStorage.getItem(APP_LOCALE_KEY);
    } catch {
      return null;
    }
  };
  const [locale, setLocaleState] = React.useState(() => {
    const stored = getStoredLang();
    return stored || getBase(i18n.resolvedLanguage || i18n.language);
  });
  React.useEffect(() => {
    const onLang = (lng) => {
      if (typeof lng === 'string') {
        setLocaleState(getBase(lng));
      }
    };
    i18n.on('languageChanged', onLang);
    return () => { 
      i18n.off('languageChanged', onLang); 
    };
  }, []);
  const setLocale = React.useCallback((lng) => {
    const base = getBase(lng);
    const allowed = ['en','ro','ru'];
    const next = allowed.includes(base) ? base : 'en';
    setLocaleState(next); // Update state immediately
    try { window.localStorage.setItem(APP_LOCALE_KEY, next); } catch {}
    const currentLang = i18n.language;
    i18n.changeLanguage(next).then(() => {
      // Ensure event fires even if language didn't change
      if (next === currentLang) {
        i18n.emit('languageChanged', next);
      }
    });
  }, []);
  return [locale, setLocale];
}