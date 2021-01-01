import * as firebase from 'firebase'
require('@firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyCUqylylMJ8RGyIMGNgTk2ET4ZIAkHtRf0",
  authDomain: "wili-again.firebaseapp.com",
  databaseURL: "https://wili-again.firebaseio.com",
  projectId: "wili-again",
  storageBucket: "wili-again.appspot.com",
  messagingSenderId: "824370826789",
  appId: "1:824370826789:web:6a9f56bf207e34529479cc"
};

  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();