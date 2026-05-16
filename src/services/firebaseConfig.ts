import app from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAXjupaMMC2jRAPqrv2PoAkFonjJ39Tt0w",
  authDomain: "ngwenoteapp.firebaseapp.com",
  projectId: "ngwenoteapp",
  storageBucket: "ngwenoteapp.firebasestorage.app",
  messagingSenderId: "925381789702",
  appId: "1:925381789702:web:993f0f5b3be586e9f49b87",
  measurementId: "G-4B8YH6LBVJ",
  databaseURL: "https://ngwenoteapp-default-rtdb.firebaseio.com"
};

// App ကို တစ်ကြိမ်ပဲ Initialize လုပ်ဖို့ စစ်ပါတယ်
if (!app.apps.length) {
  app.initializeApp(firebaseConfig);
}

// Export ထုတ်တဲ့အခါ နာမည်ရှင်းရှင်းလေးပဲ ပေးလိုက်ပါမယ်
export const db = firestore();
export const firebaseAuth = auth();