import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
// Add Google Calendar scopes
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/calendar');

// In-memory access token caching per Workspace skill (no localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Clear cached token on sign-out
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
  }
});

// Initialize Firestore with specific database ID if provided
const customDbId = (firebaseConfigJson as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = customDbId
  ? getFirestore(app, customDbId)
  : getFirestore(app);

// Test Firestore connectivity on boot as required by Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firestore connection validated successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error.message);
    }
    // Return true for non-blocking UI behavior
    return false;
  }
}

// Run test connection
testFirestoreConnection();

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    const user = result.user;
    
    // Upsert user profile in firestore
    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Passenger',
        photoURL: user.photoURL || '',
        role: 'passenger',
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Get or request Google Calendar OAuth Access Token
export async function getOrRequestGoogleCalendarAccessToken(forceSelect = false): Promise<string> {
  if (cachedAccessToken && !forceSelect) {
    return cachedAccessToken;
  }
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error('Google access token could not be obtained from login result.');
  }
  cachedAccessToken = credential.accessToken;
  return cachedAccessToken;
}

// Sign Out
export async function signOutUser() {
  try {
    cachedAccessToken = null;
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Persist Ticket Booking
export async function saveBookingToFirestore(userId: string, bookingData: any) {
  try {
    const bookingId = bookingData.id || `BK-${Date.now()}`;
    const bookingRef = doc(db, 'users', userId, 'bookings', bookingId);
    const payload = {
      ...bookingData,
      id: bookingId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };
    await setDoc(bookingRef, payload);
    return bookingId;
  } catch (error) {
    console.error('Failed to save booking to Firestore:', error);
    return null;
  }
}

// Load Bookings for User
export async function loadUserBookings(userId: string) {
  try {
    const q = query(
      collection(db, 'users', userId, 'bookings'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (error) {
    console.error('Failed to load user bookings:', error);
    return [];
  }
}

// Persist Complaint (RailMadad)
export async function saveComplaintToFirestore(userId: string, complaintData: any) {
  try {
    const complaintId = complaintData.id || `CMP-${Date.now().toString().slice(-6)}`;
    const compRef = doc(db, 'users', userId, 'complaints', complaintId);
    const payload = {
      ...complaintData,
      id: complaintId,
      userId,
      status: complaintData.status || 'Registered',
      createdAt: new Date().toISOString()
    };
    await setDoc(compRef, payload);
    return complaintId;
  } catch (error) {
    console.error('Failed to save complaint to Firestore:', error);
    return null;
  }
}

// Persist Meal Order
export async function saveMealOrderToFirestore(userId: string, mealData: any) {
  try {
    const orderId = mealData.id || `ORD-${Date.now().toString().slice(-6)}`;
    const orderRef = doc(db, 'users', userId, 'mealOrders', orderId);
    const payload = {
      ...mealData,
      id: orderId,
      userId,
      status: mealData.status || 'Preparing',
      createdAt: new Date().toISOString()
    };
    await setDoc(orderRef, payload);
    return orderId;
  } catch (error) {
    console.error('Failed to save meal order to Firestore:', error);
    return null;
  }
}

// Persist Station QR Clearance Token
export async function saveStationVerificationToFirestore(userId: string, tokenData: {
  id: string;
  stationCode: string;
  stationName: string;
  verifiedAt: string;
  expiresAt: string;
  verificationMethod: string;
  isSafetyCleared: boolean;
}) {
  try {
    const tokenRef = doc(db, 'users', userId, 'stationVerifications', tokenData.id);
    await setDoc(tokenRef, tokenData);
    return tokenData.id;
  } catch (error) {
    console.error('Failed to save station verification:', error);
    return null;
  }
}
