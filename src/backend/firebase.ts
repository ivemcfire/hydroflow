// File: src/backend/firebase.ts
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

if (!admin.apps.length) {
  admin.initializeApp();
}

const app = admin.app();

// Use the specific database ID if provided in the config, otherwise use the default
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
console.log('Using Firestore Database ID:', databaseId);

export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

export const auth = admin.auth();

export default admin;
