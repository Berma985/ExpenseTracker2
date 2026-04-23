// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDvlRsFFUi60ScqOuG5NQRhiLZMjm0CVRE',
  authDomain: 'crud-demo-a7e2c.firebaseapp.com',
  projectId: 'crud-demo-a7e2c',
  storageBucket: 'crud-demo-a7e2c.firebasestorage.app',
  messagingSenderId: '827258894762',
  appId: '1:827258894762:web:481400d2fbbfcfe15b93d3',
  measurementId: 'G-T2N0PX8LBP',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export { firestore };
