// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import  {getStorage} from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkfVNWuDoiIt6y8u02KcaWuM_8iEkRnQ4",
    authDomain: "cricboost-balling-grip.firebaseapp.com",
    projectId: "cricboost-balling-grip",
    storageBucket: "cricboost-balling-grip.appspot.com",
    messagingSenderId: "965515139589",
    appId: "1:965515139589:web:727eeac3c1057df1b49a6c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app)

export {storage};