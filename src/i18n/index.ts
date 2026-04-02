import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ဘာသာပြန်စာသားများ
const resources = {
  en: {
    translation: {
          appName: "NgweNote",
        appDesc: "Track your daily expenses\nand income easily",
      welcome: "Welcome back,",
      guest: "Guest",
      balance: "Total Balance",
      income: "Income",
      expense: "Expense",
      recent: "Recent Activity",
      // Login Screen
      chooseOption: "Choose an option",
      loginGuest: "Log in as Guest",
      loginGoogle: "Log in with Google",
          or: "or",
      footerNote: "If you use it as a guest, the data will not\nbe saved in the cloud.",
      // Add Transaction Screen
      createRecord: "Create Record",
    amount: "Amount",
    category: "Select Category",
    today: "Today",
    note: "Note",
    writeNote: "Write a note...",
    save: "Save Record",
    home: "Home",
    history: "History",
    settings: "Settings"
    }
  },
  mm: {
    translation: {
          appName: "ငွေနုတ်", // Font လှလှလေးနဲ့ပြမှာပါ
        appDesc: "သင်၏ အသုံးစရိတ်များကို အလွယ်တကူ\nမှတ်တမ်းတင်ပါ",
      welcome: "ပြန်လည်ကြိုဆိုပါတယ်၊",
      guest: "ဧည့်သည်",
      balance: "စုစုပေါင်း လက်ကျန်ငွေ",
      income: "ဝင်ငွေ",
      expense: "အသုံးစရိတ်",
      recent: "လတ်တလော မှတ်တမ်းများ",
      // Login Screen
      chooseOption: "အသုံးပြုရန် ရွေးချယ်ပါ",
      loginGuest: "ဧည့်သည်အဖြစ် ဝင်မည်",
      loginGoogle: "Google ဖြင့် ဝင်မည်",
          or: "သို့မဟုတ်",
      footerNote: "ဧည့်သည်အဖြစ်သုံးပါက ဒေတာများကို cloud တွင် သိမ်းဆည်း\nမည်မဟုတ်ပါ။",
      // Add Transaction Screen
      createRecord: "စာရင်းအသစ်ထည့်ရန်",
    amount: "ပမာဏ",
    category: "အမျိုးအစားရွေးပါ",
    today: "ယနေ့",
    note: "မှတ်စု",
    writeNote: "မှတ်စုရေးရန်...",
    save: "သိမ်းဆည်းမည်",
    home: "ပင်မ",
    history: "မှတ်တမ်း",
    settings: "ဆက်တင်"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'mm', // Default Language (မြန်မာ)
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  interpolation: { escapeValue: false }
});

export default i18n;