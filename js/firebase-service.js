/**
 * SMART GROCERY & BUDGET SAFETY TRACKER - FIREBASE SERVICE
 * Cloud Firestore Realtime Architecture (Multi-Device HP & PC Synchronized)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  enableIndexedDbPersistence 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaakDjNeUlawGJht3BRNewggHWaUqkMUU",
  authDomain: "djiosmo.firebaseapp.com",
  projectId: "djiosmo",
  storageBucket: "djiosmo.firebasestorage.app",
  messagingSenderId: "1034496179985",
  appId: "1:1034496179985:web:1d24673648bc1b51a056b0"
};

// Initialize Firebase App & Cloud Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable Offline Persistence with IndexedDB fallback
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('[Firestore] Multiple tabs open; persistence active in primary tab.');
    } else if (err.code === 'unimplemented') {
      console.warn('[Firestore] Browser does not support IndexedDb persistence.');
    }
  });
} catch (e) {
  console.warn('[Firestore] Persistence setup note:', e);
}

const ACTIVE_SESSION_DOC = "active_session";
const SESSIONS_COLLECTION = "shopping_sessions";

/**
 * PENTING: Realtime listener onSnapshot()
 * JANGAN gunakan getDoc() atau getDocs() sekali baca.
 * Listener ini mendengarkan dokumen sesi aktif secara terus-menerus.
 * Saat HP mengubah data di supermarket, layar PC di rumah langsung
 * ter-update seketika (zero-refresh).
 */
export function listenToActiveSession(onDataChange, onError) {
  const sessionDocRef = doc(db, SESSIONS_COLLECTION, ACTIVE_SESSION_DOC);

  return onSnapshot(sessionDocRef, 
    (docSnap) => {
      const fromCache = docSnap.metadata ? docSnap.metadata.fromCache : false;
      const hasPendingWrites = docSnap.metadata ? docSnap.metadata.hasPendingWrites : false;

      if (docSnap.exists()) {
        const data = docSnap.data();
        onDataChange(data, { fromCache, hasPendingWrites, exists: true });
      } else {
        // Dokumen belum dibuat di Firestore
        onDataChange(null, { fromCache, hasPendingWrites, exists: false });
      }
    },
    (error) => {
      console.error('[Firestore onSnapshot Error]:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Simpan/Update sesi belanja aktif ke Cloud Firestore.
 * Payload wajib memuat: storeLocation, shoppingDate, walletLimit, items, totalSpent.
 */
export async function saveActiveSessionToFirestore(sessionPayload) {
  try {
    const sessionDocRef = doc(db, SESSIONS_COLLECTION, ACTIVE_SESSION_DOC);
    
    // Pastikan data yang dikirim bersih dan serializable
    const cleanPayload = {
      storeLocation: sessionPayload.storeLocation || 'Supermarket',
      shoppingDate: sessionPayload.shoppingDate || new Date().toISOString().split('T')[0],
      walletLimit: Number(sessionPayload.walletLimit || sessionPayload.budgetLimit || 750000),
      items: Array.isArray(sessionPayload.items) ? sessionPayload.items : [],
      totalSpent: Number(sessionPayload.totalSpent || 0),
      totalSavings: Number(sessionPayload.totalSavings || 0),
      updatedAt: serverTimestamp(),
      lastClientTimestamp: Date.now()
    };

    await setDoc(sessionDocRef, cleanPayload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[Firestore Write Error - LocalStorage fallback active]:', err);
    return { success: false, error: err };
  }
}

/**
 * Arsipkan sesi belanja yang sudah selesai (checkout) ke koleksi riwayat Firestore
 */
export async function archiveSessionToFirestore(historySession) {
  try {
    const histDocRef = doc(db, "history_sessions", historySession.id);
    await setDoc(histDocRef, {
      ...historySession,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error('[Firestore Archive Error]:', err);
    return false;
  }
}

