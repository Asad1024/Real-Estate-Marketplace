// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDMBjzIvY6pJ4yRg3MOPPAzCGbMlSqz7vI",
  authDomain: "house-marketplace-91746.firebaseapp.com",
  projectId: "house-marketplace-91746",
  storageBucket: "house-marketplace-91746.appspot.com",
  messagingSenderId: "522958657258",
  appId: "1:522958657258:web:6b2c418213065fc815a993",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
