import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Migrated from translations.js (legacy LanguageContext) to standard i18next resources.
const resources = {
  en: { translation: {
    welcome: "Welcome to School Portal",
    connect: "Connect",
    signupTitle: "Student Signup",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    dob: "Date of Birth",
    status: "Status",
    selectStatus: "Select Status",
    active: "Active",
    inactive: "Inactive",
    signUp: "Sign Up",
    invalidPhone: "Invalid phone number",
    invalidEmail: "Invalid email address",
    required: "This field is required",
    invalidDob: "You cannot select a future date",
    tooYoung: "You must be at least 15 years old",
    submitting: "Submitting...",
    signupSuccess: "Registration successful",
    signupFailed: "Registration failed",
    networkError: "Network error. Please try again.",
    debugLabel: "Debug info",
  }},
  ro: { translation: {
    welcome: "Bine ați venit la Portalul Școlii",
    connect: "Conectează-te",
    signupTitle: "Înregistrare Student",
    firstName: "Prenume",
    lastName: "Nume",
    email: "Email",
    phone: "Telefon",
    dob: "Data nașterii",
    status: "Statut",
    selectStatus: "Selectați statutul",
    active: "Activ",
    inactive: "Inactiv",
    signUp: "Înregistrează-te",
    invalidPhone: "Număr de telefon invalid",
    invalidEmail: "Adresă de email invalidă",
    required: "Acest câmp este obligatoriu",
    invalidDob: "Nu puteți selecta o dată din viitor",
    tooYoung: "Trebuie să aveți cel puțin 15 ani",
    submitting: "Se trimite...",
    signupSuccess: "Înregistrare reușită",
    signupFailed: "Înregistrare eșuată",
    networkError: "Eroare de rețea. Reîncercați.",
    debugLabel: "Informații debug",
  }},
  ru: { translation: {
    welcome: "Добро пожаловать в школьный портал",
    connect: "Подключиться",
    signupTitle: "Регистрация студента",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "Эл. почта",
    phone: "Телефон",
    dob: "Дата рождения",
    status: "Статус",
    selectStatus: "Выберите статус",
    active: "Активный",
    inactive: "Неактивный",
    signUp: "Зарегистрироваться",
    invalidPhone: "Неверный номер телефона",
    invalidEmail: "Неверный адрес электронной почты",
    required: "Это обязательное поле",
    invalidDob: "Вы не можете выбрать дату в будущем",
    tooYoung: "Вам должно быть не менее 15 лет",
    submitting: "Отправка...",
    signupSuccess: "Регистрация успешна",
    signupFailed: "Ошибка регистрации",
    networkError: "Сетевая ошибка. Повторите попытку.",
    debugLabel: "Отладочная информация",
  }},
};

export function initI18n(lang = 'en') {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: lang,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
      });
  }
  return i18n;
}

export default i18n;
