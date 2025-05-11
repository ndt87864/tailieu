import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDj_FhdiYG8sgrqzSBlf9SrGF8FQR4fCI4",
  authDomain: "tailieuehou.com",
  projectId: "tailieu-89ca9",
  storageBucket: "tailieu-89ca9.firebasestorage.app",
  messagingSenderId: "739034600322",
  appId: "1:739034600322:web:771c49578c29c8cabe359b",
  measurementId: "G-4KTZWXH5KE"
};
let app, db, auth, storage, analytics;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  if (typeof window !== 'undefined') {
    import('firebase/analytics').then(({ getAnalytics }) => {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.warn("Analytics không thể khởi tạo:", error);
      }
    }).catch(err => {
      console.warn("Không thể load module Analytics:", err);
    });
  }
} catch (error) {
  console.error("Lỗi khởi tạo Firebase:", error);
}
export { app, db, auth, storage, analytics };