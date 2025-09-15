import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
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
    },
    validation: {
      required: 'This field is required',
      invalidPhone: 'Invalid phone number',
      invalidEmail: 'Invalid email address',
      invalidDob: 'You cannot select a future date',
      tooYoung: 'You must be at least {{years}} years old',
      tooOld: 'Date cannot be more than {{years}} years ago',
      invalidHireDate: 'Invalid hire date',
    },
  },
  ro: {
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
    },
    validation: {
      required: 'Acest câmp este obligatoriu',
      invalidPhone: 'Număr de telefon invalid',
      invalidEmail: 'Adresă de email invalidă',
      invalidDob: 'Nu puteți selecta o dată din viitor',
      tooYoung: 'Trebuie să aveți cel puțin {{years}} ani',
      tooOld: 'Data nu poate fi mai veche de {{years}} ani',
      invalidHireDate: 'Data angajării invalidă',
    },
  },
  ru: {
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
    },
    validation: {
      required: 'Это обязательное поле',
      invalidPhone: 'Неверный номер телефона',
      invalidEmail: 'Неверный адрес электронной почты',
      invalidDob: 'Вы не можете выбрать дату в будущем',
      tooYoung: 'Вам должно быть не менее {{years}} лет',
      tooOld: 'Дата не может быть старше {{years}} лет',
      invalidHireDate: 'Неверная дата приема на работу',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'validation'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    // Let t('required') resolve to validation.required while UI labels resolve in common
    // This works because we include both namespaces and default to 'common'.
  });

export default i18n;
