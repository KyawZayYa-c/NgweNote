// src/theme/colors.ts

const common = {
  white: '#FFFFFF',
  googleRed: '#EA4335',
};

export const lightColors = {
  ...common,
  primary: '#e711ee',                     
  secondary: '#e711ee',                    // 👈 ပန်းရောင်ပြောင်းလဲ
  accent: '#FF6B6B',
  income: '#10B981',
  tab:'#de0bb1' ,// စာရင်းဝင်ငွေအတွက် အစိမ်းရောင်ငြိမ်ငြိမ်လေး
  expense: '#EF4444',                      // စာရင်းထွက်ငွေအတွက် အနီရောင်ငြိမ်ငြိမ်လေး
  primaryBtn: ['#5e3fbb', '#e711ee'],
  background: '#F8F7FC',                   // ခရမ်းရောင်သန်းသော Soft Background
  surface: '#FFFFFF',
  cardShadow: 'rgba(94, 63, 187, 0.08)',
  border: '#EAE6F5',                       // ခရမ်းနုရောင်စပ် အနားသတ်
  primaryGradient: ['#5e3fbb', '#e711ee'], 
  notiProgress: '#e711ee',                 
  bellIconBg: 'rgba(255, 255, 255, 0.25)', 
  glassBorder: 'rgba(255, 255, 255, 0.35)', 
  subGreetingText: 'rgba(255, 255, 255, 0.85)', // 👈 HomeScreen ကုဒ်ထဲက အရောင်ကို ဒီထဲရွှေ့လိုက်ပါတယ်
  statsRowBorder: 'rgba(255, 255, 255, 0.2)',   
  statSeparator: 'rgba(255, 255, 255, 0.25)',  
  walletIconBg: 'rgba(255, 255, 255, 0.25)',   
  text: {
    primary: '#1C162E',                    // Deep Purple Tinted Black
    secondary: '#6E658A',                  // Muted Purple Grey
    onPrimary: '#FFFFFF',
  }
};

export const darkColors = {
  ...common,
  primary: '#00D1FF',
   tab:'#08c6f1e7',
  secondary: '#00D1FF',
  accent: '#FF6B6B',
  income: '#00D1FF',
  expense: '#FF6B6B',
  primaryBtn: ['#42bec4c7', '#9768e3f3'],
  background: '#0F172A', 
  surface: '#1E293B',    
  border: '#334155',
  primaryGradient: ['#25519a', '#162038'], 
  notiProgress: '#00D1FF',                 
  bellIconBg: 'rgba(255, 255, 255, 0.12)',     
  glassBorder: 'rgba(0, 209, 255, 0.15)',  
  subGreetingText: '#94A3B8',              // 👈 Dark mode အတွက် Slate Gray
  statsRowBorder: 'rgba(255, 255, 255, 0.08)',  
  statSeparator: 'rgba(255, 255, 255, 0.08)',   
  walletIconBg: 'rgba(37, 81, 154, 0.4)',     
  text: {
    primary: '#F8FAFC',
    secondary: '#d5dbe4',
    onPrimary: '#FFFFFF',
  }
};

export const colors = {
  light: lightColors,
  dark: darkColors,
};