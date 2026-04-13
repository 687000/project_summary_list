const firebaseConfig = {
  apiKey: "AIzaSyCXSS72HgGD_8swIahYtNgSlqXvnKhPxuQ",
  authDomain: "project-summary-data.firebaseapp.com",
  projectId: "project-summary-data",
  storageBucket: "project-summary-data.firebasestorage.app",
  messagingSenderId: "1089446666374",
  appId: "1:1089446661374:web:b1bf3beacdf29272767107",
  measurementId: "G-CTD6CTD1E9",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
