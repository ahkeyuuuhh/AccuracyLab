import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpD-1AWELSF8ReVvlOHqWc3DcmZYyvf88",
  authDomain: "accuracylab.firebaseapp.com",
  projectId: "accuracylab",
  storageBucket: "accuracylab.firebasestorage.app",
  messagingSenderId: "724266255866",
  appId: "1:724266255866:web:68a9dab4606a917ef81043",
  measurementId: "G-T9EP619B2D"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
export const auth = getAuth(app)

// Initialize Firestore Database
export const db = getFirestore(app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

export default app
