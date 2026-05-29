import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Expense, Budget, Message } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without this line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Error handling types and enums as strictly demanded by user instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Handle and structure firestore errors exactly as demanded by guidelines
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null, // Custom user system acts as key here
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Test the Firestore connection on boot up as demanded by critical constraints
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test-connection-field', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Call testConnection right away to fulfill critical constraint
testConnection();

// --- SERVICES FOR CLOUD SYNC ---

/**
 * Check if a username is already taken or look up user profile
 */
export async function getUserFromCloud(username: string): Promise<User | null> {
  const cleanUsername = username.trim().toLowerCase();
  const path = `finanzas_usuarios/${cleanUsername}`;
  try {
    const docRef = doc(db, 'finanzas_usuarios', cleanUsername);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save user profile on cloud (Register)
 */
export async function registerUserOnCloud(user: User): Promise<void> {
  const cleanUsername = user.username.trim().toLowerCase();
  const path = `finanzas_usuarios/${cleanUsername}`;
  try {
    const docRef = doc(db, 'finanzas_usuarios', cleanUsername);
    await setDoc(docRef, {
      username: cleanUsername,
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Get all expenses for a user from Firestore
 */
export async function getExpensesFromCloud(username: string): Promise<Expense[]> {
  const cleanUsername = username.trim().toLowerCase();
  const path = 'finanzas_gastos';
  try {
    const q = query(
      collection(db, 'finanzas_gastos'),
      where('username', '==', cleanUsername)
    );
    const querySnapshot = await getDocs(q);
    const expenses: Expense[] = [];
    querySnapshot.forEach((docSnap) => {
      expenses.push(docSnap.data() as Expense);
    });
    return expenses;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save or update a specific expense on Firestore
 */
export async function saveExpenseOnCloud(expense: Expense, username: string): Promise<void> {
  const path = `finanzas_gastos/${expense.id}`;
  try {
    const docRef = doc(db, 'finanzas_gastos', expense.id);
    await setDoc(docRef, {
      id: expense.id,
      username: username.trim().toLowerCase(),
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      tags: expense.tags || []
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a specific expense from Firestore
 */
export async function deleteExpenseOnCloud(expenseId: string): Promise<void> {
  const path = `finanzas_gastos/${expenseId}`;
  try {
    const docRef = doc(db, 'finanzas_gastos', expenseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Get user budget limits from Firestore
 */
export async function getBudgetFromCloud(username: string): Promise<Budget | null> {
  const cleanUsername = username.trim().toLowerCase();
  const path = `finanzas_presupuesto/${cleanUsername}`;
  try {
    const docRef = doc(db, 'finanzas_presupuesto', cleanUsername);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Budget;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save user budget limits on Firestore
 */
export async function saveBudgetOnCloud(budget: Budget, username: string): Promise<void> {
  const cleanUsername = username.trim().toLowerCase();
  const path = `finanzas_presupuesto/${cleanUsername}`;
  try {
    const docRef = doc(db, 'finanzas_presupuesto', cleanUsername);
    await setDoc(docRef, {
      username: cleanUsername,
      total: budget.total,
      byCategory: budget.byCategory
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Get chat messages history for a user from Firestore
 */
export async function getMessagesFromCloud(username: string): Promise<Message[]> {
  const cleanUsername = username.trim().toLowerCase();
  const path = 'finanzas_mensajes';
  try {
    const q = query(
      collection(db, 'finanzas_mensajes'),
      where('username', '==', cleanUsername)
    );
    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    querySnapshot.forEach((docSnap) => {
      messages.push(docSnap.data() as Message);
    });
    // Sort by timeline
    return messages.sort((a, b) => a.createdAt - b.createdAt);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save a message on Firestore
 */
export async function saveMessageOnCloud(message: Message, username: string): Promise<void> {
  const path = `finanzas_mensajes/${message.id}`;
  try {
    const docRef = doc(db, 'finanzas_mensajes', message.id);
    await setDoc(docRef, {
      id: message.id,
      username: username.trim().toLowerCase(),
      role: message.role,
      text: message.text,
      createdAt: message.createdAt,
      isQuickAction: message.isQuickAction || false
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Clear chat history from Firestore
 */
export async function clearMessagesFromCloud(username: string): Promise<void> {
  const cleanUsername = username.trim().toLowerCase();
  const path = 'finanzas_mensajes';
  try {
    const q = query(
      collection(db, 'finanzas_mensajes'),
      where('username', '==', cleanUsername)
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
