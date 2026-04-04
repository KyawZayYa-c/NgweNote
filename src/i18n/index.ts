import i18n from 'i18next';
import { HistoryIcon } from 'lucide-react-native';
import { initReactI18next } from 'react-i18next';

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
      todayActivity: "Today Activity",
      noEntryToday: "No entries for today",
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
      food: "Food",
      shopping: "Shopping",
      transport: "Transport",
      rent: "Rent",
      bills: "Bills",
      health: "Health",
    today: "Today",
    note: "Note",
    writeNote: "Write a note...",
      save: "Save Record",
    warning: "Warning",
  enterAmount: "Please enter a valid amount",
  selectCategory: "Please select a category",
  insufficientBalance: "Insufficient Balance",
      saveError: "Error saving transaction",
  addAnother: "Add Another",
  saveAll: "Save All",
  batchLockType: "Cannot change type while batch adding",
  editLock: "Locked during edit mode",


    home: "Home",
    analytics: "Analytics",
    history: "History",
    settings: "Settings",
    

    historyTitle: "Transaction History",
    searchPlaceholder: "Search by note...",
    all: "All",
      filterByCategory: "Filter by Category",
      // HistoryScreen
      success: "Success",
      error: "Error",
      confirm: "Confirm",
      cancel: "Cancel",
      enterPasscode: "Enter Passcode",
      wrongPasscode: "Wrong passcode!",
      deletedSuccess: "Transaction deleted successfully",
      options: "Options",
      editRecord: "Edit Record",
      deleteRecord: "Delete Record",
      editMode: "Edit Mode",
      editNavNote: "Redirecting to edit form...",
      noRecords: "No records found",


  totalIncome: "Total Income",
  totalExpense: "Total Expense",
  ratioTitle: "Income vs Expense Ratio",
  topExpenses: "Top 5 Expenses",
  saveAsImage: "Save Chart as Image",
  imageSaved: "Image has been saved to your gallery.",
    }
  },
  mm: {
    translation: {
          appName: "ငွေနုတ်",
        appDesc: "သင်၏ အသုံးစရိတ်များကို အလွယ်တကူ\nမှတ်တမ်းတင်ပါ",
      welcome: "ပြန်လည်ကြိုဆိုပါတယ်၊",
      guest: "ဧည့်သည်",
      balance: "စုစုပေါင်း လက်ကျန်ငွေ",
      income: "ဝင်ငွေ",
      expense: "အသုံးစရိတ်",
      recent: "လတ်တလော မှတ်တမ်းများ",
      todayActivity: "ယနေ့လှုပ်ရှားမှု",
      noEntryToday: "ဒီနေ့အတွက် မှတ်တမ်းတင်ရန်",
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
      all: "အားလုံး",
      food: "စားသောက်စရိတ်",
      shopping: "ဈေးဝယ်ခြင်း",
      transport: "သယ်ယူပို့ဆောင်ရေး",
      rent: "အိမ်လခ",
      bills: "ဘေလ်ဆောင်ခြင်း",
      health: "ကျန်းမာရေး",
      today: "ယနေ့",
      note: "မှတ်စု",
      writeNote: "မှတ်စုရေးရန်...",
      save: "သိမ်းဆည်းမည်",
      warning: "သတိပေးချက်",
      enterAmount: "ပမာဏကို မှန်ကန်စွာ ရိုက်ထည့်ပါ",
      selectCategory: "အမျိုးအစား ရွေးချယ်ပေးပါ",
      insufficientBalance: "လက်ကျန်ငွေ မလုံလောက်ပါ",
      saveError: "သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိပါသည်",
      addAnother: "နောက်တစ်ခုထည့်မည်",
      saveAll: "အားလုံးသိမ်းမည်",
      batchLockType: "စာရင်းအများကြီးသွင်းနေချိန်တွင် အမျိုးအစားပြောင်း၍မရပါ",
      editLock: "ပြင်ဆင်နေချိန်တွင် ပြောင်းလဲ၍မရပါ",


    home: "ပင်မ",
    analytics: "သုံးသပ်ချက်",
    history: "မှတ်တမ်း",
      settings: "ဆက်တင်",
  historyTitle: "ငွေစာရင်း မှတ်တမ်းများ",
searchPlaceholder: "မှတ်စုဖြင့် ရှာဖွေရန်...",
      filterByCategory: "အမျိုးအစားအလိုက် စစ်ထုတ်ရန်",
      //history Screen
      success: "အောင်မြင်သည်",
      error: "အမှားအယွင်း",
      confirm: "အတည်ပြုမည်",
      cancel: "ပယ်ဖျက်မည်",
      enterPasscode: "လျှို့ဝှက်နံပါတ် ရိုက်ထည့်ပါ",
      wrongPasscode: "လျှို့ဝှက်နံပါတ် မှားယွင်းနေသည်",
      deletedSuccess: "စာရင်းကို ဖျက်သိမ်းပြီးပါပြီ",
      options: "ရွေးချယ်စရာများ",
      editRecord: "စာရင်းပြင်ဆင်မည်",
      deleteRecord: "စာရင်းဖျက်သိမ်းမည်",
      editMode: "ပြင်ဆင်ရန်",
      editNavNote: "ပြင်ဆင်ရန် Form သို့ သွားပါမည်",
      noRecords: "မှတ်တမ်းများ မရှိသေးပါ",


    
  totalIncome: "စုစုပေါင်းဝင်ငွေ",
  totalExpense: "စုစုပေါင်းအသုံးစရိတ်",
  ratioTitle: "ဝင်ငွေနှင့် အသုံးစရိတ် အချိုး",
  topExpenses: "အများဆုံး အသုံးစရိတ် (၅) ခု",
  saveAsImage: "ဇယားကို ဓာတ်ပုံသိမ်းရန်",
  imageSaved: "ဓာတ်ပုံကို Gallery ထဲသို့ သိမ်းဆည်းပြီးပါပြီ။",
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