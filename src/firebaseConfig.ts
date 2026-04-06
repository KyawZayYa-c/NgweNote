import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google Sign-in ကို အစပြုခြင်း
GoogleSignin.configure({
  webClientId: 'အစ်ကို့ရဲ့-WEB-CLIENT-ID', // ဒါကို Firebase Console ကနေ ယူရပါမယ်
});

export { auth };