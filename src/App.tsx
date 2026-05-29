import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wallet,
  Coins,
  TrendingUp,
  Plus,
  Trash2,
  Sparkles,
  Bot,
  Send,
  Calendar,
  Filter,
  ArrowUpDown,
  RefreshCw,
  TrendingDown,
  Activity,
  SlidersHorizontal,
  Lightbulb,
  Check,
  X,
  PlusCircle,
  HelpCircle,
  Info,
  Camera,
  Image,
  FileText,
  CheckSquare,
  Square,
  User as UserIcon,
  Lock,
  UserPlus,
  LogIn,
  LogOut,
  UserCheck,
  Key,
  Smartphone,
  Database,
  Eye,
  Clipboard,
  Download,
  HardDrive,
  Cloud,
  Languages,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { CATEGORIES, INITIAL_EXPENSES, SUGGESTED_BUDGET_TOTAL, DEFAULT_CATEGORY_BUDGETS } from './constants';
import { Expense, Budget, CategoryBudget, Message, ParsedExpenseResponse, ReceiptItem, AnalyzedReceiptResponse, User } from './types';
import { parseExpenseWithAI, getFinancialAdviceStream, analyzeInvoiceImageWithAI } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import {
  getUserFromCloud,
  registerUserOnCloud,
  getExpensesFromCloud,
  saveExpenseOnCloud,
  deleteExpenseOnCloud,
  getBudgetFromCloud,
  saveBudgetOnCloud,
  getMessagesFromCloud,
  saveMessageOnCloud,
  clearMessagesFromCloud
} from './services/firebaseService';

const TRANSLATIONS = {
  es: {
    appName: "FinanzAsistente",
    tagline: "Control de gastos inteligentes",
    dashboard: "Dashboard",
    history: "Gastos",
    assistant: "Asesor AI",
    chat: "Chat AI",
    settings: "Ajustes",
    welcome: "Bienvenido",
    todaySpent: "Gasto de Hoy",
    remainingBudget: "Presupuesto Restante",
    consumed: "Consumido",
    addManualExpense: "Gasto Manual",
    taglineManual: "Ingresa tus egresos uno a uno con precisión quirúrgica",
    description: "Descripción del gasto",
    amount: "Monto",
    category: "Categoría",
    date: "Fecha",
    tags: "Etiquetas (separadas por coma)",
    addExpense: "Agregar Gasto",
    orUploadInvoice: "O, ¡Sube una Foto de tu Recibo!",
    uploadReceiptHelp: "Sube un recibo para extraer los artículos automáticamente con Gemini Vision.",
    analyzeWithAI: "Analizar Foto con AI",
    photoInProgress: "Gemini está analizando la imagen de tu recibo...",
    nlpPlaceholder: "Pega o escribe tu gasto coloquialmente (ej: 'Ayer almorcé por 22 mil pesos')",
    nlpTitle: "Ingreso Inteligente por Lenguaje Natural",
    nlpSubtitle: "Pega en texto libre y FinanzAsistente AI ordenará el importe y categoría.",
    aiConfirmTitle: "Confirmación de Gasto Detectado por AI",
    aiConfirmHelp: "Revisa si el análisis de la Inteligencia Artificial fue acertado:",
    confirmAddGasto: "Confirmar y Agregar Gasto",
    recentHistory: "Historial de Gastos Recientes",
    totalExpThisMonth: "Total de Gastos de este mes",
    limitsSummary: "Resumen de tus Límites Mensuales",
    underBudget: "Dentro del Presupuesto",
    overBudget: "¡Alerta de Exceso!",
    favorable: "Favorable (Estás dentro del límite)",
    exceeded: "Excedido (¡Alerta!)",
    viewAllRecords: "Ver todas las transacciones históricas",
    searchPlaceholder: "Busca por artículo, categoría o etiqueta...",
    sortBy: "Ordenar por:",
    latestDate: "Fecha más reciente",
    highestAmount: "Mayor monto",
    clearFilters: "Ver todos",
    noExpenses: "Aún no tienes gastos agregados para este mes.",
    tipsAndChallenges: "Tips y Desafíos AI",
    tipsAndChallengesHelp: "Elige un disparador automático para que el asesor de IA audite tus finanzas.",
    tipsTriggerMajorSpent: "¿En qué categoría tengo mi mayor nivel de gasto y cómo puedo reducirlo?",
    tipsTriggerHacks: "Dame 3 consejos súper prácticos y rápidos para ahorrar en el día a día.",
    tipsTriggerChallenge: "Desafío de Ahorro para esta semana",
    chatPromptPlaceholder: "Pregúntame algo sobre tus números (ej. '¿De cuánto fue mi factura de luz?')",
    globalBudget: "Presupuesto Global",
    globalBudgetHelp: "Configura el límite de dinero que planeas gastar en el mes",
    monthlyTotal: "Presupuesto Mensual Total ($ COP)",
    globalBudgetTip: "Tu presupuesto se calcula para tus metas. Un presupuesto balanceado previene las deudas por tarjetas de crédito.",
    individualBudgets: "Ajustes de Límite por Categorías",
    individualBudgetsHelp: "Reparte tu presupuesto global en las subtareas del día a día",
    dataActions: "Acciones de Datos",
    dataActionsHelp: "Borra o restablece tu base de datos local",
    loadMockData: "Cargar Mock Data",
    clearAllData: "Borrar Todo",
    dbInspector: "Inspector de tu Base de Datos Actual",
    dbInspectorHelp: "Inspecciona, descarga, filtra y administra el almacenamiento físico de datos local privado (Local-First localStorage).",
    activeSession: "Sesión Activa",
    usersCatalog: "Catálogo de Usuarios",
    expenseHistory: "Historial de Gastos",
    limitDistribution: "Distribución de Límites",
    aiChatHistory: "Historial de Chat de AI",
    searchInJson: "Buscar en JSON...",
    copyToClipboard: "Copiar JSON",
    sessionName: "Nombre de Usuario",
    currentPassword: "Contraseña Actual",
    newPassword: "Nueva Contraseña",
    confirmNewPassword: "Confirmar nueva contraseña",
    changePassBtn: "Cambiar Contraseña",
    langTitle: "Configuración de Idioma / Language Settings",
    langSubtitle: "Configura el idioma de la interfaz y la respuesta del Asistente AI",
    es: "Español",
    en: "English",
    logout: "Cerrar Sesión",
    changePassSuccess: "¡Contraseña actualizada con éxito!",
    changePassError: "La contraseña actual es incorrecta o las nuevas contraseñas no coinciden.",
    clearAllConfirmTitle: "¿Deseas borrar absolutamente toda la información?",
    clearAllConfirmBody: "Esta acción eliminará todos tus registros de gastos, personalizaciones de presupuesto y mensajes del chat de IA para restablecer el panel en ceros ($0). No se puede deshacer.",
    confirmDelete: "Sí, Borrar Todo",
    cancel: "Cancelar",
    wrongCurrentPassword: "La contraseña actual ingresada es incorrecta.",
    newPasswordsDoNotMatch: "Las nuevas contraseñas ingresadas no coinciden.",
    passwordUpdatedSuccess: "¡Contraseña cambiada con éxito en tu cuenta de usuario!",
    registerUser: "Crear Cuenta Nueva",
    registerUserHelp: "Crea tu perfil local y privado",
    fullName: "Nombre Completo",
    usernameInputLabel: "Nombre de Usuario",
    passwordLabel: "Contraseña",
    signInTitle: "Inicia Sesión",
    signUpTitle: "Crea tu Cuenta",
    hasAccount: "¿Ya tienes cuenta? Inicia Sesión",
    noAccount: "¿No tienes cuenta? Crea una",
    loginError: "Datos incorrectos.",
    loginSuccess: "¡Sesión iniciada con éxito!",
    howToReduce: "Cómo puedo reducir gastos en",
    underSpendDesc: "Excelente! Has de manera ordenada contenido este gasto.",
    overSpendDesc: "Alerta de Exceso! Considera detener egresos no esenciales.",
    categoryComida: "Alimentación",
    categoryTransporte: "Transporte",
    categoryEntretenimiento: "Entretenimiento",
    categoryHogar: "Hogar y Servicios",
    categorySalud: "Salud y Bienestar",
    categoryEducacion: "Educación",
    categoryTecnologia: "Tecnología",
    categoryOtros: "Otros Gastos",
    loadDemoTrigger: "Cargar Cuenta Demo (Glory-Dev)",
    orUseDemo: "O ingresa al panel de control de pruebas instantáneamente:",
    recoveryTitle: "¿Olvidaste tu contraseña o usuario?",
    recoveryTitleSection: "Recuperar o Restablecer contraseña",
    detectedAccounts: "Cuentas privadas de navegador registradas:",
    selectedUserToReset: "Selecciona un usuario de arriba para rellenar o ingresa sus datos para restablecer:",
    resetPassTitle: "Establecer Nueva Contraseña",
    resetPassBtn: "Restablecer Contraseña",
    registerSuccessMsg: "¡Cuenta registrada con éxito! Ya puedes iniciar sesión.",
    suggestedBudgetNote: "Tu presupuesto actual se calculó inicialmente en base al valor sugerido de **$1.800.000 COP**. Puedes adaptarlo para reflejar tus ingresos recurrentes reales.",
  },
  en: {
    appName: "FinanceAssistant",
    tagline: "Smart expense tracker & advisor",
    dashboard: "Dashboard",
    history: "Expenses",
    assistant: "AI Advisor",
    chat: "AI Chat",
    settings: "Settings",
    welcome: "Welcome",
    todaySpent: "Today's Expenses",
    remainingBudget: "Remaining Budget",
    consumed: "Consumed",
    addManualExpense: "Manual Expense",
    taglineManual: "Enter your transactions step-by-step with surgical precision",
    description: "Expense Description",
    amount: "Amount",
    category: "Category",
    date: "Date",
    tags: "Tags (comma-separated)",
    addExpense: "Add Expense",
    orUploadInvoice: "Or, Upload a Receipt Photo!",
    uploadReceiptHelp: "Upload a receipt photo for Gemini Vision to extract details and items automatically.",
    analyzeWithAI: "Analyze Photo with AI",
    photoInProgress: "Gemini is scanning your receipt image...",
    nlpPlaceholder: "Type your expense colloquially (e.g., 'Yesterday I spent 22 thousand on food')",
    nlpTitle: "Smart Natural Language Entry",
    nlpSubtitle: "Paste free-form text and FinanceAssistant AI will structure the amount and category.",
    aiConfirmTitle: "AI Detected Expense Confirmation",
    aiConfirmHelp: "Please verify if the AI analysis is accurate:",
    confirmAddGasto: "Confirm & Add Expense",
    recentHistory: "Recent Transaction History",
    totalExpThisMonth: "This Month's Total Expenses",
    limitsSummary: "Your Monthly Budget Limits Summary",
    underBudget: "On Track / Under Budget",
    overBudget: "Exceeded Limit / Over Budget",
    favorable: "Favorable (Within budget)",
    exceeded: "Exceeded (Alert!)",
    viewAllRecords: "View all historical transactions",
    searchPlaceholder: "Search by item, category or tag...",
    sortBy: "Sort by:",
    text: "Text", // added text
    latestDate: "Latest Date",
    highestAmount: "Highest Amount",
    clearFilters: "Clear filters",
    noExpenses: "You don't have any recorded expenses for this month yet.",
    tipsAndChallenges: "AI Advice & Challenges",
    tipsAndChallengesHelp: "Choose an automatic trigger for the AI advisor to audit your finances.",
    tipsTriggerMajorSpent: "In which category is my largest expenditure and how can I reduce it?",
    tipsTriggerHacks: "Give me 3 hyper-practical and quick daily saving hacks.",
    tipsTriggerChallenge: "A saving challenge for this week.",
    chatPromptPlaceholder: "Ask me anything about your finance numbers (e.g. 'How much was my electricity bill?')",
    globalBudget: "Total Monthly Budget",
    globalBudgetHelp: "Set the total spend limit you plan for the month",
    monthlyTotal: "Total Monthly Budget ($ COP)",
    globalBudgetTip: "Your budget serves your saving goals. A balanced budget avoids high credit card interest.",
    individualBudgets: "Category Limits Configuration",
    individualBudgetsHelp: "Allocate portions of your global budget into day-to-day category limits",
    dataActions: "Data Actions",
    dataActionsHelp: "Clean or load sample state into your local database",
    loadMockData: "Load Mock Data",
    clearAllData: "Reset All",
    dbInspector: "Active Database Inspector",
    dbInspectorHelp: "Inspect, export, search, and manage your private offline Local-First localStorage.",
    activeSession: "Active Session",
    usersCatalog: "Users Catalog",
    expenseHistory: "Expense History",
    limitDistribution: "Limit Allocation",
    aiChatHistory: "AI Chat History",
    searchInJson: "Search JSON...",
    copyToClipboard: "Copy JSON",
    sessionName: "Active User",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    changePassBtn: "Change Password",
    langTitle: "Language Settings / Configuración de Idioma",
    langSubtitle: "Set the UI locale and AI Assistant speech language",
    es: "Español",
    en: "English",
    logout: "Log Out",
    changePassSuccess: "Password successfully changed!",
    changePassError: "Wrong current password or new passwords do not match.",
    clearAllConfirmTitle: "Are you sure you want to delete all database statistics?",
    clearAllConfirmBody: "This action will delete all your transaction entries, custom category budget limits, and AI chat history messages, completely resetting your dashboard to zeros ($0). This cannot be undone.",
    confirmDelete: "Yes, Reset Everything",
    cancel: "Cancel",
    wrongCurrentPassword: "The current password inputted is incorrect.",
    newPasswordsDoNotMatch: "The new passwords entered do not match.",
    passwordUpdatedSuccess: "Password updated successfully in your account!",
    registerUser: "Create Local Account",
    registerUserHelp: "Build your private database profile in this browser",
    fullName: "Your Name",
    usernameInputLabel: "Username",
    passwordLabel: "Password",
    signInTitle: "Sign In",
    signUpTitle: "Sign Up",
    hasAccount: "Already have an account? Sign In",
    noAccount: "No account? Sign Up",
    loginError: "Incorrect credentials.",
    loginSuccess: "Successfully logged in!",
    howToReduce: "How to reduce expenses in",
    underSpendDesc: "Awesome! You are within your budget limit for this category.",
    overSpendDesc: "Over-spending alert! Look for non-essential cash cuts.",
    categoryComida: "Food & Groceries",
    categoryTransporte: "Transportation",
    categoryEntretenimiento: "Entertainment",
    categoryHogar: "Rent & Utilities",
    categorySalud: "Health & Care",
    categoryEducacion: "Education",
    categoryTecnologia: "Technology",
    categoryOtros: "Other Expenses",
    loadDemoTrigger: "Load Demo Account (Glory-Dev)",
    orUseDemo: "Or explore our premium demo dashboard instantly:",
    recoveryTitle: "Forgot your password or username?",
    recoveryTitleSection: "Recover or Reset Password",
    detectedAccounts: "Registered accounts offline in this browser:",
    selectedUserToReset: "Select a user from above or fill form manually to override password:",
    resetPassTitle: "Set New Password",
    resetPassBtn: "Reset Password",
    registerSuccessMsg: "Account registered successfully! You may now sign in.",
    suggestedBudgetNote: "Your initial budget was pre-calculated at a recommended **$1.800.000 COP** standard. You can scale it to mirror your actual monthly inflow.",
  }
};

export default function App() {
  // --- CURRENT USER & AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('finanzas_currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error loading finanzas_currentUser:", e);
      return null;
    }
  });

  const [syncingCloud, setSyncingCloud] = useState(false);
  
  // --- STATE PERSISTENCE GUARD & DARK MODE ---
  const ignorePersistenceRef = useRef(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('finanzas_darkMode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('finanzas_darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('finanzas_darkMode', 'false');
    }
  }, [isDarkMode]);

  const [cloudMode, setCloudMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('finanzas_cloudMode');
      return saved !== 'false'; // Standard premium experience is cloud-first!
    } catch {
      return true;
    }
  });

  // --- STATE ---
  const [lang, setLang] = useState<'es' | 'en'>(() => {
    const saved = localStorage.getItem('finanzas_language');
    return (saved === 'en' || saved === 'es') ? saved : 'es';
  });

  const t = (key: string): string => {
    const dict = TRANSLATIONS[lang];
    return dict[key as keyof typeof dict] || TRANSLATIONS['es'][key as keyof typeof TRANSLATIONS['es']] || key;
  };

  const getCategoryTranslation = (catId: string) => {
    const keyMap: Record<string, string> = {
      'Comida': 'categoryComida',
      'Transporte': 'categoryTransporte',
      'Entretenimiento': 'categoryEntretenimiento',
      'Hogar': 'categoryHogar',
      'Salud': 'categorySalud',
      'Educación': 'categoryEducacion',
      'Tecnología': 'categoryTecnologia',
      'Otros': 'categoryOtros'
    };
    const translationKey = keyMap[catId] || 'categoryOtros';
    return t(translationKey);
  };

  const [oldPasswordChangeInput, setOldPasswordChangeInput] = useState('');
  const [newPasswordChangeInput, setNewPasswordChangeInput] = useState('');
  const [confirmPasswordChangeInput, setConfirmPasswordChangeInput] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [acceptedDataTreatment, setAcceptedDataTreatment] = useState(false);
  const [showDataTreatmentModal, setShowDataTreatmentModal] = useState(false);
  const [showUserManualModal, setShowUserManualModal] = useState(false);

  const [dbSelectedTable, setDbSelectedTable] = useState<'users' | 'expenses' | 'budget' | 'messages' | 'session'>('expenses');
  const [dbCopiedNotification, setDbCopiedNotification] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const userSaved = localStorage.getItem('finanzas_currentUser');
      if (userSaved) {
        const u = JSON.parse(userSaved) as User;
        const saved = localStorage.getItem(`finanzas_gastos_${u.username}`);
        return saved ? JSON.parse(saved) : (u.username === 'glory-dev' ? INITIAL_EXPENSES : []);
      }
    } catch (e) {
      console.error("Error loading expenses:", e);
    }
    return []; // Empty base for personalization
  });

  const [budget, setBudget] = useState<Budget>(() => {
    const defaultZeroCategories = CATEGORIES.map(c => ({ category: c.id, amount: 0 }));
    try {
      const userSaved = localStorage.getItem('finanzas_currentUser');
      if (userSaved) {
        const u = JSON.parse(userSaved) as User;
        const saved = localStorage.getItem(`finanzas_presupuesto_${u.username}`);
        return saved ? JSON.parse(saved) : (u.username === 'glory-dev' 
          ? { total: SUGGESTED_BUDGET_TOTAL, byCategory: DEFAULT_CATEGORY_BUDGETS } 
          : { total: 0, byCategory: defaultZeroCategories });
      }
    } catch (e) {
      console.error("Error loading budget:", e);
    }
    return { total: 0, byCategory: defaultZeroCategories };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'assistant' | 'config'>('dashboard');

  // --- AUTH FORM STATES ---
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authUsername, setAuthUsername] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedMonth, setSelectedMonth] = useState<string>('todos');

  // Dynamic Month option detector
  const monthOptions = useMemo(() => {
    const monthsMap: Record<string, string> = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };
    // Extract unique YYYY-MM
    const uniqueMonths: string[] = Array.from(new Set(expenses.map(e => e.date.substring(0, 7)))).sort().reverse() as string[];
    return uniqueMonths.map((ym: string) => {
      const [year, month] = ym.split('-');
      return {
        value: ym,
        label: `${monthsMap[month] || month} ${year}`
      };
    });
  }, [expenses]);

  // Filtered expenses specifically in the active chart/dashboard contextual month
  const dashboardExpenses = useMemo(() => {
    if (selectedMonth === 'todos') {
      return expenses;
    }
    if (selectedMonth === '3meses') {
      const today = new Date();
      const limitDate = new Date();
      // Filter for current month, last month, and month before that
      limitDate.setMonth(today.getMonth() - 2);
      limitDate.setDate(1);
      limitDate.setHours(0, 0, 0, 0);

      return expenses.filter(e => {
        const d = new Date(e.date);
        return !isNaN(d.getTime()) && d >= limitDate;
      });
    }
    return expenses.filter(e => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Expense form state
  const [descInput, setDescInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState(CATEGORIES[0].id);
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // AI Parser state
  const [nlpText, setNlpText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedExpenseResponse | null>(null);

  // Receipt Image Scan States (Para desglosar facturas por celular/cámara)
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/png');
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanProgressMsg, setScanProgressMsg] = useState('');
  const [analyzedReceipt, setAnalyzedReceipt] = useState<AnalyzedReceiptResponse | null>(null);
  const [scanTab, setScanTab] = useState<'text' | 'image'>('text'); 
  const [activeCameraStream, setActiveCameraStream] = useState<MediaStream | null>(null);
  const [showLiveCamera, setShowLiveCamera] = useState(false);

  // AI chat advisor state
  const [chatMessages, setChatMessages] = useState<Message[]>(() => {
    try {
      const userSaved = localStorage.getItem('finanzas_currentUser');
      const systemLang = localStorage.getItem('finanzas_language') || 'es';
      if (userSaved) {
        const u = JSON.parse(userSaved) as User;
        const saved = localStorage.getItem(`finanzas_mensajes_${u.username}`);
        if (saved) return JSON.parse(saved);
        return [
          {
            id: 'msg-init',
            role: 'model',
            text: systemLang === 'en'
              ? `👋 Welcome, **${u.name}**! I am **FinanceAssistant AI**, your private financial advisor. Your panel is loaded in Colombian Pesos ($ COP). How can I assist you today?`
              : `👋 ¡Hola de nuevo, **${u.name}**! Te saluda **FinanzAsistente AI**, tu asesor financiero privado. Tu panel está cargado en Pesos Colombianos ($ COP). ¿En qué puedo ayudarte hoy?`,
            createdAt: Date.now()
          }
        ];
      }
    } catch (e) {
      console.error("Error loading chatMessages or user:", e);
    }

    const systemLang = localStorage.getItem('finanzas_language') || 'es';
    return [
      {
        id: 'msg-init',
        role: 'model',
        text: systemLang === 'en'
          ? '👋 Hello! I am **FinanceAssistant AI**, your private financial planner. Type a colloquial expense phrase or scan a ticket to begin.'
          : '👋 ¡Hola! Soy **FinanzAsistente AI**, tu asesor financiero privado. Describe tus gastos diarios o escanea un recibo para comenzar.',
        createdAt: Date.now()
      }
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [isReceivingAdvice, setIsReceivingAdvice] = useState(false);
  const [incomingAdviceText, setIncomingAdviceText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    if (ignorePersistenceRef.current) return;
    if (currentUser) {
      localStorage.setItem('finanzas_currentUser', JSON.stringify(currentUser));
      localStorage.setItem(`finanzas_gastos_${currentUser.username}`, JSON.stringify(expenses));
    } else {
      localStorage.removeItem('finanzas_currentUser');
    }
  }, [expenses, currentUser]);

  useEffect(() => {
    if (ignorePersistenceRef.current) return;
    if (currentUser) {
      localStorage.setItem(`finanzas_presupuesto_${currentUser.username}`, JSON.stringify(budget));
    }
  }, [budget, currentUser]);

  useEffect(() => {
    if (ignorePersistenceRef.current) return;
    if (currentUser) {
      localStorage.setItem(`finanzas_mensajes_${currentUser.username}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, currentUser]);

  useEffect(() => {
    localStorage.setItem('finanzas_language', lang);
  }, [lang]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, incomingAdviceText]);

  // --- AUTH OPERATIONS ---
  const handleLogin = async (user: User, options?: { loadFromCloud?: boolean }) => {
    ignorePersistenceRef.current = true;
    setCurrentUser(user);
    localStorage.setItem('finanzas_currentUser', JSON.stringify(user));
    
    const activeCloud = cloudMode || options?.loadFromCloud || false;
    if (activeCloud && !cloudMode) {
      setCloudMode(true);
    }
    localStorage.setItem('finanzas_cloudMode', activeCloud ? 'true' : 'false');

    const defaultZeroCategories = CATEGORIES.map(c => ({ category: c.id, amount: 0 }));

    if (activeCloud) {
      setSyncingCloud(true);
      try {
        // Enforce registration on Cloud in case they signed up offline/locally
        await registerUserOnCloud(user);

        const [cloudExpenses, cloudBudget, cloudMessages] = await Promise.all([
          getExpensesFromCloud(user.username),
          getBudgetFromCloud(user.username),
          getMessagesFromCloud(user.username)
        ]);

        if (cloudExpenses && cloudExpenses.length > 0) {
          setExpenses(cloudExpenses);
          localStorage.setItem(`finanzas_gastos_${user.username}`, JSON.stringify(cloudExpenses));
        } else {
          const savedExpenses = localStorage.getItem(`finanzas_gastos_${user.username}`);
          const initExp = savedExpenses ? JSON.parse(savedExpenses) : (user.username === 'glory-dev' ? INITIAL_EXPENSES : []);
          setExpenses(initExp);
          // Sync to Cloud
          await Promise.all(initExp.map((exp: Expense) => saveExpenseOnCloud(exp, user.username)));
        }

        if (cloudBudget) {
          setBudget(cloudBudget);
          localStorage.setItem(`finanzas_presupuesto_${user.username}`, JSON.stringify(cloudBudget));
        } else {
          const savedBudget = localStorage.getItem(`finanzas_presupuesto_${user.username}`);
          const initBud = savedBudget ? JSON.parse(savedBudget) : (user.username === 'glory-dev' 
            ? { total: SUGGESTED_BUDGET_TOTAL, byCategory: DEFAULT_CATEGORY_BUDGETS } 
            : { total: 0, byCategory: defaultZeroCategories });
          setBudget(initBud);
          await saveBudgetOnCloud(initBud, user.username);
        }

        if (cloudMessages && cloudMessages.length > 0) {
          setChatMessages(cloudMessages);
          localStorage.setItem(`finanzas_mensajes_${user.username}`, JSON.stringify(cloudMessages));
        } else {
          const savedMessages = localStorage.getItem(`finanzas_mensajes_${user.username}`);
          if (savedMessages) {
            const initMessages = JSON.parse(savedMessages);
            setChatMessages(initMessages);
            await Promise.all(initMessages.map((msg: Message) => saveMessageOnCloud(msg, user.username)));
          } else {
            const welcomeMsg: Message = {
              id: 'msg-init-new',
              role: 'model',
              text: lang === 'en'
                ? `👋 Hi again, **${user.name}**! Welcome to **FinanceAssistant AI**, your private financial advisor connected securely to Firebase Cloud.\n\nI have loaded your active database in Colombian Pesos ($ COP). Anything you add will be saved safely on the cloud.`
                : `👋 ¡Hola de nuevo, **${user.name}**! Te saluda **FinanzAsistente AI**, tu asesor financiero privado conectado de forma segura a Firebase Cloud.\n\nHe cargado tu base de datos activa en Pesos Colombianos ($ COP). Todo lo que agregues se sincronizará de inmediato en la nube.`,
              createdAt: Date.now()
            };
            setChatMessages([welcomeMsg]);
            await saveMessageOnCloud(welcomeMsg, user.username);
          }
        }
      } catch (e) {
        console.error("Failed to load user remote data from Firestore:", e);
        // Silent local fallback
        const savedExpenses = localStorage.getItem(`finanzas_gastos_${user.username}`);
        setExpenses(savedExpenses ? JSON.parse(savedExpenses) : (user.username === 'glory-dev' ? INITIAL_EXPENSES : []));

        const savedBudget = localStorage.getItem(`finanzas_presupuesto_${user.username}`);
        setBudget(savedBudget ? JSON.parse(savedBudget) : (user.username === 'glory-dev' 
          ? { total: SUGGESTED_BUDGET_TOTAL, byCategory: DEFAULT_CATEGORY_BUDGETS } 
          : { total: 0, byCategory: defaultZeroCategories }));

        const savedMessages = localStorage.getItem(`finanzas_mensajes_${user.username}`);
        if (savedMessages) setChatMessages(JSON.parse(savedMessages));
      } finally {
        setSyncingCloud(false);
      }
    } else {
      const savedExpenses = localStorage.getItem(`finanzas_gastos_${user.username}`);
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : (user.username === 'glory-dev' ? INITIAL_EXPENSES : []));

      const savedBudget = localStorage.getItem(`finanzas_presupuesto_${user.username}`);
      setBudget(savedBudget ? JSON.parse(savedBudget) : (user.username === 'glory-dev' 
        ? { total: SUGGESTED_BUDGET_TOTAL, byCategory: DEFAULT_CATEGORY_BUDGETS } 
        : { total: 0, byCategory: defaultZeroCategories }));

      const savedMessages = localStorage.getItem(`finanzas_mensajes_${user.username}`);
      if (savedMessages) {
        setChatMessages(JSON.parse(savedMessages));
      } else {
        setChatMessages([
          {
            id: 'msg-init-new',
            role: 'model',
            text: lang === 'en'
              ? `👋 Hi again, **${user.name}**! Welcome to **FinanceAssistant AI**.\n\nI have loaded your local browser-first dashboard. Sign in with Cloud Mode enabled to keep your data synced across devices!`
              : `👋 ¡Hola de nuevo, **${user.name}**! Te saluda **FinanzAsistente AI**.\n\nHe cargado tu panel de control local. ¡Habilita el Almacenamiento en la Nube (Firebase) para guardar tus datos de manera permanente!`,
            createdAt: Date.now()
          }
        ]);
      }
    }
    setActiveTab('dashboard');
    setTimeout(() => {
      ignorePersistenceRef.current = false;
    }, 200);
  };

  const handleLogout = () => {
    ignorePersistenceRef.current = true;
    setCurrentUser(null);
    localStorage.removeItem('finanzas_currentUser');
    const defaultZeroCategories = CATEGORIES.map(c => ({ category: c.id, amount: 0 }));
    setExpenses([]);
    setBudget({ total: 0, byCategory: defaultZeroCategories });
    setChatMessages([
      {
        id: 'msg-init',
        role: 'model',
        text: lang === 'en'
          ? '👋 Hello! I am **FinanceAssistant AI**, your private financial advisor.\n\nI am ready to help you manage your everyday finances and answer your budget questions. Sign in or sign up to start personalizing your budget in Colombian Pesos ($ COP).'
          : '👋 ¡Hola! Soy **FinanzAsistente AI**, tu asesor financiero privado.\n\nEstoy listo para ayudarte a administrar tus finanzas cotidianas y responder tus dudas sobre dinero. Inicia tu sesión o regístrate para comenzar a personalizar tu presupuesto en pesos colombianos ($ COP).',
        createdAt: Date.now()
      }
    ]);
    setTimeout(() => {
      ignorePersistenceRef.current = false;
    }, 200);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!currentUser) {
      setPasswordChangeError(lang === 'en' ? 'No authenticated user found.' : 'No hay usuario autenticado.');
      return;
    }

    if (!oldPasswordChangeInput || !newPasswordChangeInput || !confirmPasswordChangeInput) {
      setPasswordChangeError(lang === 'en' ? 'Please fill in all security fields.' : 'Por favor completa todos los campos de seguridad.');
      return;
    }

    if (currentUser.username !== 'glory-dev' && currentUser.passwordHash !== oldPasswordChangeInput) {
      setPasswordChangeError(t('wrongCurrentPassword'));
      return;
    }

    if (newPasswordChangeInput !== confirmPasswordChangeInput) {
      setPasswordChangeError(t('newPasswordsDoNotMatch'));
      return;
    }

    setSyncingCloud(true);
    try {
      const savedUsersRaw = localStorage.getItem('finanzas_usuarios');
      const usersList: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const index = usersList.findIndex(u => u.username === currentUser.username);

      if (index !== -1) {
        usersList[index].passwordHash = newPasswordChangeInput;
        localStorage.setItem('finanzas_usuarios', JSON.stringify(usersList));
      }

      if (cloudMode && currentUser.username !== 'glory-dev') {
        const cloudUser = await getUserFromCloud(currentUser.username);
        if (cloudUser) {
          const updatedCloudUser = { ...cloudUser, passwordHash: newPasswordChangeInput };
          await registerUserOnCloud(updatedCloudUser);
        }
      }

      const updatedUser = { ...currentUser, passwordHash: newPasswordChangeInput };
      setCurrentUser(updatedUser);
      localStorage.setItem('finanzas_currentUser', JSON.stringify(updatedUser));

      setOldPasswordChangeInput('');
      setNewPasswordChangeInput('');
      setConfirmPasswordChangeInput('');
      setPasswordChangeSuccess(t('passwordUpdatedSuccess'));
      setSuccessMsg(t('passwordUpdatedSuccess'));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Password update failed on Cloud:", err);
      setPasswordChangeError(lang === 'en' ? 'Failed to update password on cloud.' : 'No se pudo actualizar la contraseña en la nube.');
    } finally {
      setSyncingCloud(false);
    }
  };

  const handleRegisterUser = async (username: string, name: string, passwordHash: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !name.trim() || !passwordHash) {
      return { 
        success: false, 
        error: lang === 'en' 
          ? 'Please complete all required fields.' 
          : 'Por favor completa todos los campos requeridos.' 
      };
    }

    setSyncingCloud(true);
    try {
      if (cloudMode) {
        const cloudUser = await getUserFromCloud(cleanUsername);
        if (cloudUser) {
          return { 
            success: false, 
            error: lang === 'en' 
              ? 'The username is already registered in the Cloud database. Try another or sign in.' 
              : 'El nombre de usuario ya se encuentra registrado en la nube. Intenta con otro o inicia sesión.' 
          };
        }
      }

      const savedUsersRaw = localStorage.getItem('finanzas_usuarios');
      const usersList: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

      if (usersList.some(u => u.username === cleanUsername)) {
        return { 
          success: false, 
          error: lang === 'en' 
            ? 'The username is already registered on this device. Try another or sign in.' 
            : 'El nombre de usuario ya se encuentra registrado en este dispositivo. Intenta con otro o inicia sesión.' 
        };
      }

      const newUser: User = {
        username: cleanUsername,
        name: name.trim(),
        passwordHash: passwordHash,
        createdAt: new Date().toISOString()
      };

      // Always try to register account in Cloud for cross-device authentication
      try {
        await registerUserOnCloud(newUser);
      } catch (cloudErr) {
        console.warn("Cloud user registration offline/failed, registering locally:", cloudErr);
      }

      usersList.push(newUser);
      localStorage.setItem('finanzas_usuarios', JSON.stringify(usersList));

      const defaultZeroCategories = CATEGORIES.map(c => ({ category: c.id, amount: 0 }));

      localStorage.setItem(`finanzas_gastos_${newUser.username}`, JSON.stringify([]));
      localStorage.setItem(`finanzas_presupuesto_${newUser.username}`, JSON.stringify({ total: 0, byCategory: defaultZeroCategories }));

      if (cloudMode) {
        await Promise.all([
          saveBudgetOnCloud({ total: 0, byCategory: defaultZeroCategories }, newUser.username),
          saveMessageOnCloud({
            id: 'msg-init-new',
            role: 'model',
            text: lang === 'en'
              ? `👋 Welcome to your new cloud-synced account, **${newUser.name}**!`
              : `👋 ¡Bienvenido a tu nueva cuenta sincronizada, **${newUser.name}**!`,
            createdAt: Date.now()
          }, newUser.username)
        ]);
      }

      await handleLogin(newUser, { loadFromCloud: true });
      return { success: true };
    } catch (e) {
      console.error("Error during cloud registration:", e);
      return { 
        success: false, 
        error: lang === 'en' 
          ? 'Failed to connect to Cloud database. Check your connection or disable Cloud Sync in adjustments.' 
          : 'No se pudo registrar en la nube. Revisa tu conexión o desactiva el Almacenamiento en la Nube.' 
      };
    } finally {
      setSyncingCloud(false);
    }
  };

  const handleRecoverOrResetPassword = async (username: string, newPass: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const clean = username.trim().toLowerCase();
    
    setSyncingCloud(true);
    try {
      let remoteUser: User | null = null;
      if (cloudMode) {
        remoteUser = await getUserFromCloud(clean);
      }

      const savedUsersRaw = localStorage.getItem('finanzas_usuarios');
      const usersList: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const localIndex = usersList.findIndex(u => u.username === clean);

      if (!remoteUser && localIndex === -1) {
        if (clean === 'glory-dev') {
          return { 
            success: false, 
            error: lang === 'en'
              ? 'The demo user "glory-dev" cannot be reset (use default password: glory123).'
              : 'El usuario demo "glory-dev" no puede restablecerse (usa su clave por defecto: glory123).' 
          };
        }
        return { 
          success: false, 
          error: lang === 'en'
            ? 'The user entered is not registered in the system.'
            : 'El usuario ingresado no está registrado en el sistema.' 
        };
      }

      if (!newPass.trim()) {
        return { 
          success: false, 
          error: lang === 'en'
            ? 'The new password cannot be empty.'
            : 'La nueva contraseña no puede estar vacía.' 
        };
      }

      if (localIndex !== -1) {
        usersList[localIndex].passwordHash = newPass;
        localStorage.setItem('finanzas_usuarios', JSON.stringify(usersList));
      }

      if (remoteUser && cloudMode) {
        const updatedCloudUser = { ...remoteUser, passwordHash: newPass };
        await registerUserOnCloud(updatedCloudUser);
      }

      return { 
        success: true, 
        message: lang === 'en'
          ? `Password for user "${clean}" successfully reset!`
          : `¡Contraseña del usuario "${clean}" restablecida con éxito!` 
      };
    } catch (err) {
      console.error("Password recovery failed on cloud:", err);
      return {
        success: false,
        error: lang === 'en'
          ? 'Failed to connect to Cloud database.'
          : 'Error de conexión con la base de datos en la nube.'
      };
    } finally {
      setSyncingCloud(false);
    }
  };




  const handleLoadDemoAccount = () => {
    // If Glory-Dev demo account not in system, register it
    const savedUsersRaw = localStorage.getItem('finanzas_usuarios');
    const usersList: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
    
    let demoUser = usersList.find(u => u.username === 'glory-dev');
    if (!demoUser) {
      demoUser = {
        username: 'glory-dev',
        name: 'Glory-Dev',
        passwordHash: 'glory123',
        createdAt: new Date().toISOString()
      };
      usersList.push(demoUser);
      localStorage.setItem('finanzas_usuarios', JSON.stringify(usersList));

      // Prepopulate premium demo balance
      localStorage.setItem(`finanzas_gastos_glory-dev`, JSON.stringify(INITIAL_EXPENSES));
      localStorage.setItem(`finanzas_presupuesto_glory-dev`, JSON.stringify({
        total: 2500000, 
        byCategory: [
          { category: 'Comida', amount: 800000 },
          { category: 'Transporte', amount: 350000 },
          { category: 'Hogar', amount: 550000 },
          { category: 'Entretenimiento', amount: 400000 },
          { category: 'Educación', amount: 400000 }
        ]
      }));
    }

    handleLogin(demoUser);
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert(lang === 'en' ? 'No transactions to export.' : 'No hay transacciones para exportar.');
      return;
    }

    const headers = lang === 'en' 
      ? ['ID', 'Date', 'Description', 'Category', 'Amount (COP)', 'Tags']
      : ['ID', 'Fecha', 'Descripción', 'Categoría', 'Monto (COP)', 'Etiquetas'];

    const csvRows = [
      headers.join(';'),
      ...expenses.map(e => [
        `"${e.id}"`,
        `"${e.date}"`,
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.category}"`,
        e.amount,
        `"${(e.tags || []).join(', ').replace(/"/g, '""')}"`
      ].join(';'))
    ];

    const csvContent = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Finanzas_ControlContable_${currentUser ? currentUser.username : 'Offline'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMsg(lang === 'en' ? 'Accounting CSV downloaded successfully!' : '¡Planilla contable CSV descargada con éxito!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // --- STATS CALCULATIONS ---
  const totalSpent = useMemo(() => {
    return dashboardExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [dashboardExpenses]);

  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    CATEGORIES.forEach(c => map[c.id] = 0);
    dashboardExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [dashboardExpenses]);

  const statsObj = useMemo(() => {
    const rem = budget.total - totalSpent;
    const spentPct = budget.total > 0 ? (totalSpent / budget.total) * 100 : 0;
    return {
      remaining: rem,
      spentPct,
      isUnderBudget: rem >= 0
    };
  }, [budget, totalSpent]);

  // --- HANDLERS ---
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput.trim() || !amountInput || parseFloat(amountInput) <= 0) return;

    const newExpense: Expense = {
      id: 'manual-' + Date.now(),
      description: descInput.trim(),
      amount: parseFloat(amountInput),
      category: categoryInput,
      date: dateInput || new Date().toISOString().split('T')[0],
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    setExpenses(prev => [newExpense, ...prev]);
    if (cloudMode && currentUser) {
      saveExpenseOnCloud(newExpense, currentUser.username).catch(e => console.error("Cloud expense save err:", e));
    }
    setDescInput('');
    setAmountInput('');
    setTagsInput('');
    setSuccessMsg('¡Gasto registrado con éxito!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (cloudMode && currentUser) {
      deleteExpenseOnCloud(id).catch(e => console.error("Cloud expense del err:", e));
    }
  };

  const handleUpdateCategoryBudget = (categoryKey: string, amountStr: string) => {
    const freshAmount = Math.max(0, parseFloat(amountStr) || 0);
    setBudget(prev => {
      const idx = prev.byCategory.findIndex(cb => cb.category === categoryKey);
      const copy = [...prev.byCategory];
      if (idx !== -1) {
        copy[idx] = { category: categoryKey, amount: freshAmount };
      } else {
        copy.push({ category: categoryKey, amount: freshAmount });
      }
      const sumTotal = copy.reduce((sum, c) => sum + c.amount, 0);
      const updated = {
        total: sumTotal,
        byCategory: copy
      };
      if (cloudMode && currentUser) {
        saveBudgetOnCloud(updated, currentUser.username).catch(e => console.error("Cloud budget save err:", e));
      }
      return updated;
    });
  };

  const handleUpdateGlobalBudget = (amountStr: string) => {
    const freshAmount = Math.max(0, parseFloat(amountStr) || 0);
    setBudget(prev => {
      const updated = {
        ...prev,
        total: freshAmount
      };
      if (cloudMode && currentUser) {
        saveBudgetOnCloud(updated, currentUser.username).catch(e => console.error("Cloud global budget save err:", e));
      }
      return updated;
    });
  };

  const handleAddSampleData = async () => {
    setExpenses(INITIAL_EXPENSES);
    const updatedBudget = { total: SUGGESTED_BUDGET_TOTAL, byCategory: DEFAULT_CATEGORY_BUDGETS };
    setBudget(updatedBudget);
    if (cloudMode && currentUser) {
      setSyncingCloud(true);
      try {
        await Promise.all([
          saveBudgetOnCloud(updatedBudget, currentUser.username),
          ...INITIAL_EXPENSES.map(e => saveExpenseOnCloud(e, currentUser.username))
        ]);
      } catch (err) {
        console.error("Cloud sample sync failed:", err);
      } finally {
        setSyncingCloud(false);
      }
    }
  };

  const handleClearAllData = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClearAllData = async () => {
    const listToDelete = [...expenses];
    setExpenses([]);
    const defaultZeroCategories = CATEGORIES.map(c => ({ category: c.id, amount: 0 }));
    setBudget({ total: 0, byCategory: defaultZeroCategories });
    
    const newWelcome = lang === 'en'
      ? 'Database flushed to zeros ($0) in Cloud & Local. Tell me about your new transactions or configure budget limits in the Settings tab.'
      : 'Base de datos limpia en ceros ($0) en la Nube y Local. Cuéntame sobre tus nuevos gastos o ajusta tus límites mensuales en la pestaña de Ajustes.';
    
    const clearedInitMsg: Message = {
      id: 'msg-init-reset',
      role: 'model',
      text: newWelcome,
      createdAt: Date.now()
    };
    setChatMessages([clearedInitMsg]);

    if (currentUser) {
      localStorage.setItem(`finanzas_gastos_${currentUser.username}`, JSON.stringify([]));
      localStorage.setItem(`finanzas_presupuesto_${currentUser.username}`, JSON.stringify({ total: 0, byCategory: defaultZeroCategories }));
      localStorage.setItem(`finanzas_mensajes_${currentUser.username}`, JSON.stringify([]));
      
      if (cloudMode) {
        setSyncingCloud(true);
        try {
          await Promise.all([
            ...listToDelete.map(e => deleteExpenseOnCloud(e.id)),
            saveBudgetOnCloud({ total: 0, byCategory: defaultZeroCategories }, currentUser.username),
            clearMessagesFromCloud(currentUser.username)
          ]);
          await saveMessageOnCloud(clearedInitMsg, currentUser.username);
        } catch (e) {
          console.error("Cloud reset error:", e);
        } finally {
          setSyncingCloud(false);
        }
      }
    }
    
    setShowClearConfirm(false);
    setSuccessMsg(lang === 'en' ? 'Database completely reset to zeros.' : 'Base de datos completamente restablecida en ceros.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Synchronize Backup/Restore Operations
  const handleUploadLocalToCloud = async () => {
    if (!currentUser) return;
    setSyncingCloud(true);
    setSuccessMsg(lang === 'en' ? 'Synchronizing local data to the Cloud...' : 'Sincronizando datos locales con la Nube...');
    try {
      // 1. Save user profile
      await registerUserOnCloud(currentUser);
      // 2. Save budget
      await saveBudgetOnCloud(budget, currentUser.username);
      // 3. Save all expenses
      await Promise.all(expenses.map(exp => saveExpenseOnCloud(exp, currentUser.username)));
      // 4. Save chat messages
      await Promise.all(chatMessages.map(msg => saveMessageOnCloud(msg, currentUser.username)));

      setSuccessMsg(lang === 'en' ? '¡Data uploaded and synchronized successfully to Firebase!' : '¡Datos locales respaldados y sincronizados con éxito en Firebase!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      alert(lang === 'en' ? 'Error syncing data to Cloud.' : 'Error al sincronizar datos con la nube de Firebase.');
    } finally {
      setSyncingCloud(false);
    }
  };

  const handleDownloadCloudToLocal = async () => {
    if (!currentUser) return;
    
    const confirmMessage = lang === 'en' 
      ? 'This will overwrite your local device transactions with the data stored on the Firebase Cloud. Do you want to proceed?' 
      : 'Esto sobrescribirá tus transacciones locales de este dispositivo con los datos almacenados en la Nube de Firebase. ¿Deseas continuar?';
      
    if (!window.confirm(confirmMessage)) return;

    setSyncingCloud(true);
    setSuccessMsg(lang === 'en' ? 'Downloading your data from Cloud...' : 'Descargando tus datos desde la Nube...');
    try {
      const [cloudExpenses, cloudBudget, cloudMessages] = await Promise.all([
        getExpensesFromCloud(currentUser.username),
        getBudgetFromCloud(currentUser.username),
        getMessagesFromCloud(currentUser.username)
      ]);

      if (cloudExpenses) {
        setExpenses(cloudExpenses);
        localStorage.setItem(`finanzas_gastos_${currentUser.username}`, JSON.stringify(cloudExpenses));
      }
      if (cloudBudget) {
        setBudget(cloudBudget);
        localStorage.setItem(`finanzas_presupuesto_${currentUser.username}`, JSON.stringify(cloudBudget));
      }
      if (cloudMessages && cloudMessages.length > 0) {
        setChatMessages(cloudMessages);
        localStorage.setItem(`finanzas_mensajes_${currentUser.username}`, JSON.stringify(cloudMessages));
      }

      setSuccessMsg(lang === 'en' ? '¡Cloud data downloaded and restored successfully!' : '¡Datos de la nube descargados y cargados con éxito!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      alert(lang === 'en' ? 'Error pulling data from Cloud.' : 'Error al descargar datos de la nube.');
    } finally {
      setSyncingCloud(false);
    }
  };

  // NLP Parser trigger
  const handleAIParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpText.trim()) return;

    setIsParsing(true);
    setParsedPreview(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const parsed = await parseExpenseWithAI(nlpText, today);
      setParsedPreview(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const confirmParsedExpense = () => {
    if (!parsedPreview) return;
    const newExpense: Expense = {
      id: 'ai-' + Date.now(),
      description: parsedPreview.description,
      amount: parsedPreview.amount,
      category: parsedPreview.category,
      date: parsedPreview.date || new Date().toISOString().split('T')[0],
      tags: ['AI-Parse']
    };
    setExpenses(prev => [newExpense, ...prev]);
    if (cloudMode && currentUser) {
      saveExpenseOnCloud(newExpense, currentUser.username).catch(e => console.error("Cloud NLP expense save err:", e));
    }
    setNlpText('');
    setParsedPreview(null);
    setSuccessMsg('Gasto parseado e ingresado!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // --- ESCANER DE FACTURAS Y FOTOS CON IA ---
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Usa la cámara trasera en celular
        audio: false
      });
      setActiveCameraStream(stream);
      setShowLiveCamera(true);
      // Pequeño timeout para asegurar que el elemento video esté montado
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      console.error("Error al iniciar cámara en vivo:", err);
      alert("No se pudo iniciar la cámara en vivo. Asegúrate de dar los permisos correspondientes. Puedes usar alternativamente el botón 'Tomar Foto u Hojear Archivo' para capturar usando el sistema nativo de tu celular.");
    }
  };

  const stopLiveCamera = () => {
    if (activeCameraStream) {
      activeCameraStream.getTracks().forEach(track => track.stop());
      setActiveCameraStream(null);
    }
    setShowLiveCamera(false);
  };

  const captureFromVideo = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64ImageUrl = canvas.toDataURL('image/jpeg');
        const base64Data = base64ImageUrl.split(',')[1];
        setSelectedImageBase64(base64Data);
        setSelectedImageMime('image/jpeg');
        stopLiveCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type || "image/jpeg";
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.split(',')[1];
      setSelectedImageBase64(base64Data);
      setSelectedImageMime(mime);
      // Limpiar análisis previo
      setAnalyzedReceipt(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScanReceipt = async () => {
    if (!selectedImageBase64) return;

    setIsScanningReceipt(true);
    setAnalyzedReceipt(null);
    
    // Lista de mensajes divertidos para que el usuario sepa qué está haciendo la IA
    const progressMsgs = [
      "📸 Procesando imagen y optimizando contraste...",
      "🔍 Transcribiendo textos y buscando valores monetarios...",
      "🧾 Detectando almacén e identificando productos...",
      "🏷️ Categorizando cada artículo en pesos colombianos ($ COP)...",
      "🤖 Puliendo cuentas. Gemini está ordenando tu factura..."
    ];

    let msgIdx = 0;
    setScanProgressMsg(progressMsgs[0]);
    const progressInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % progressMsgs.length;
      setScanProgressMsg(progressMsgs[msgIdx]);
    }, 2800);

    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await analyzeInvoiceImageWithAI(
        selectedImageBase64,
        selectedImageMime,
        today
      );
      setAnalyzedReceipt(result);
    } catch (err) {
      console.error(err);
      alert("Error al analizar la imagen. Por favor intenta de nuevo con una foto más enfocada y con buena iluminación.");
    } finally {
      clearInterval(progressInterval);
      setIsScanningReceipt(false);
      setScanProgressMsg('');
    }
  };

  const toggleReceiptItemSelect = (itemId: string) => {
    if (!analyzedReceipt) return;
    setAnalyzedReceipt({
      ...analyzedReceipt,
      items: analyzedReceipt.items.map(it => 
        it.id === itemId ? { ...it, selected: !it.selected } : it
      )
    });
  };

  const updateReceiptItemField = (itemId: string, field: 'description' | 'amount' | 'category', value: any) => {
    if (!analyzedReceipt) return;
    setAnalyzedReceipt({
      ...analyzedReceipt,
      items: analyzedReceipt.items.map(it => {
        if (it.id === itemId) {
          if (field === 'amount') {
            const num = Math.max(0, parseInt(value) || 0);
            return { ...it, amount: num };
          }
          return { ...it, [field]: value };
        }
        return it;
      })
    });
  };

  const confirmReceiptBreakdown = () => {
    if (!analyzedReceipt) return;
    
    const selectedItems = analyzedReceipt.items.filter(it => it.selected);
    if (selectedItems.length === 0) {
      alert("Por favor selecciona al menos un artículo para registrar.");
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const newExpenses: Expense[] = selectedItems.map(item => ({
      id: 'receipt-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      description: `${item.description} (${analyzedReceipt.establishmentName})`,
      amount: item.amount,
      category: item.category,
      date: item.date || todayDate,
      tags: ['Factura-AI']
    }));

    setExpenses(prev => [...newExpenses, ...prev]);
    if (cloudMode && currentUser) {
      newExpenses.forEach(exp => {
        saveExpenseOnCloud(exp, currentUser.username).catch(e => console.error("Cloud receipt item save err:", e));
      });
    }
    
    const totalDeducted = selectedItems.reduce((sum, item) => sum + item.amount, 0);

    // Limpiar estados
    setAnalyzedReceipt(null);
    setSelectedImageBase64(null);

    // Mensaje explicativo y gratificante de deducción del monto inicial
    setSuccessMsg(`¡Factura desglosada con éxito! Se registraron ${selectedItems.length} gastos y se redujeron $${totalDeducted.toLocaleString('es-CO')} COP del total disponible.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  useEffect(() => {
    // Cleanup de la cámara al desmontar
    return () => {
      if (activeCameraStream) {
        activeCameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCameraStream]);

  // AI chat triggers
  const sendChatMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || isReceivingAdvice) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: text.trim(),
      createdAt: Date.now()
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (cloudMode && currentUser) {
      saveMessageOnCloud(userMsg, currentUser.username).catch(e => console.error("Cloud msg sync err:", e));
    }

    if (!textToSend) setChatInput('');
    setIsReceivingAdvice(true);
    setIncomingAdviceText('');

    let finalBotText = '';
    try {
      const chatHistory = [...chatMessages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      finalBotText = await getFinancialAdviceStream(
        expenses,
        budget,
        chatHistory,
        (chunk) => {
          setIncomingAdviceText(chunk);
        },
        lang
      );
    } catch (err) {
      console.error(err);
      finalBotText = lang === 'en'
        ? 'An error occurred while processing request with Gemini. Please try again or check local connectivity.'
        : 'Ocurrió un error al procesar tu solicitud con Gemini. Por favor intenta de nuevo.';
      setIncomingAdviceText(finalBotText);
    } finally {
      setIsReceivingAdvice(false);
      const textToSave = finalBotText || incomingAdviceText || 'No obtuve respuesta del servicio.';
      
      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        role: 'model',
        text: textToSave,
        createdAt: Date.now()
      };

      setChatMessages(prev => [...prev, botMsg]);
      if (cloudMode && currentUser) {
        saveMessageOnCloud(botMsg, currentUser.username).catch(e => console.error("Cloud msg sync err:", e));
      }
      setIncomingAdviceText('');
    }
  };

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase()) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
        const matchesCat = catFilter === 'Todas' || item.category === catFilter;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        let valueA = sortField === 'date' ? a.date : a.amount;
        let valueB = sortField === 'date' ? b.date : b.amount;

        if (sortField === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
          return sortDirection === 'desc' ? (valueB as number) - (valueA as number) : (valueA as number) - (valueB as number);
        }
      });
  }, [expenses, search, catFilter, sortField, sortDirection]);

  // --- SVG DIAGRAMS DATA ---
  const chartData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    // Agrupar ultimos 15 dias activos
    expenses.forEach(e => {
      const day = e.date.substring(5); // MM-DD
      dayMap[day] = (dayMap[day] || 0) + e.amount;
    });

    const sortedDays = Object.keys(dayMap).sort().slice(-10); // ultimos 10 dias con movimientos
    const dataPoints = sortedDays.map(day => ({
      day,
      amount: dayMap[day]
    }));

    // Calcular acumulativo
    let cum = 0;
    const withCumulative = sortedDays.map(day => {
      cum += dayMap[day];
      return {
        day,
        amount: dayMap[day],
        cumulative: cum
      };
    });

    return {
      points: dataPoints,
      cumulative: withCumulative
    };
  }, [expenses]);

  // --- DETECTOR DE ENTORNO Y BASE DE DATOS LOCAL ---
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbImportError, setDbImportError] = useState('');
  const [dbImportSuccess, setDbImportSuccess] = useState('');

  const dbUsersCount = useMemo(() => {
    try {
      const u = localStorage.getItem('finanzas_usuarios');
      return u ? JSON.parse(u).length : 0;
    } catch {
      return 0;
    }
  }, [currentUser, dbImportSuccess]);

  const handleExportDatabase = () => {
    const username = currentUser?.username || 'glory';
    const backup = {
      usuarios: JSON.parse(localStorage.getItem('finanzas_usuarios') || '[]'),
      currentUser: currentUser,
      gastos: expenses,
      presupuesto: budget,
      mensajes: chatMessages,
      exportAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzas_db_backup_${username}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDbImportError('');
    setDbImportSuccess('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.usuarios) {
          localStorage.setItem('finanzas_usuarios', JSON.stringify(data.usuarios));
        }
        if (data.currentUser) {
          localStorage.setItem('finanzas_currentUser', JSON.stringify(data.currentUser));
          setCurrentUser(data.currentUser);
        }
        const username = data.currentUser?.username || currentUser?.username || 'glory';
        if (data.gastos) {
          localStorage.setItem(`finanzas_gastos_${username}`, JSON.stringify(data.gastos));
          setExpenses(data.gastos);
        }
        if (data.presupuesto) {
          localStorage.setItem(`finanzas_presupuesto_${username}`, JSON.stringify(data.presupuesto));
          setBudget(data.presupuesto);
        }
        if (data.mensajes) {
          localStorage.setItem(`finanzas_mensajes_${username}`, JSON.stringify(data.mensajes));
          setChatMessages(data.mensajes);
        }
        setDbImportSuccess('¡Base de datos importada con éxito!');
      } catch (err) {
        setDbImportError('Error al importar el respaldo JSON. Formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  const getDatabaseContent = () => {
    const username = currentUser?.username || 'glory';
    const rawUsers = localStorage.getItem('finanzas_usuarios') || '[]';
    const rawExpenses = JSON.stringify(expenses);
    const rawBudget = JSON.stringify(budget);
    const rawMessages = JSON.stringify(chatMessages);
    const rawCurrentUser = JSON.stringify(currentUser);

    let parsed: any = null;
    let title = '';
    let description = '';

    switch (dbSelectedTable) {
      case 'users':
        parsed = JSON.parse(rawUsers);
        title = 'finanzas_usuarios';
        description = 'Tabla relacional con credenciales hashed y registros de usuarios en este navegador.';
        break;
      case 'expenses':
        parsed = JSON.parse(rawExpenses);
        title = `finanzas_gastos_${username}`;
        description = `Historial completo de gastos registrados en pesos colombianos para el usuario "${username}".`;
        break;
      case 'budget':
        parsed = JSON.parse(rawBudget);
        title = `finanzas_presupuesto_${username}`;
        description = `Límites de presupuesto global y desglose por categorías para el usuario "${username}".`;
        break;
      case 'messages':
        parsed = JSON.parse(rawMessages);
        title = `finanzas_mensajes_${username}`;
        description = `Historial de chat e interacciones de memoria con FinanzAsistente AI.`;
        break;
      case 'session':
        parsed = JSON.parse(rawCurrentUser);
        title = 'finanzas_currentUser';
        description = 'Usuario autenticado actualmente con sesión abierta en esta ventana.';
        break;
    }

    if (dbSearchQuery.trim() && parsed) {
      if (Array.isArray(parsed)) {
        parsed = parsed.filter((item: any) => {
          const s = JSON.stringify(item).toLowerCase();
          return s.includes(dbSearchQuery.toLowerCase());
        });
      }
    }

    return {
      title,
      description,
      content: parsed
    };
  };

  const currentDbView = getDatabaseContent();

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setDbCopiedNotification(true);
    setTimeout(() => setDbCopiedNotification(false), 2000);
  };

  // --- AUTH GATEWAY IF NO USER ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center items-center p-4 relative antialiased">
        {/* Floating Language Toggle */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-1 bg-white border border-slate-200/80 rounded-full p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setLang('es');
              setAuthError('');
              setAuthSuccessMsg('');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1 cursor-pointer ${
              lang === 'es' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🇨🇴</span>
            <span>ES</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLang('en');
              setAuthError('');
              setAuthSuccessMsg('');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1 cursor-pointer ${
              lang === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🇺🇸</span>
            <span>EN</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1 text-slate-400 hover:text-blue-600 rounded-full transition cursor-pointer flex items-center justify-center w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isDarkMode ? (lang === 'en' ? 'Light Mode' : 'Modo Claro') : (lang === 'en' ? 'Dark Mode' : 'Modo Oscuro')}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-12 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl translate-x-12 pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          {/* Logo element */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-sky-500 text-white rounded-2xl shadow-lg shadow-blue-500/10 mb-3.5">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              FinanzAsistente <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
              {lang === 'en'
                ? "Smart and private management of your personal finances and budget with the support of Artificial Intelligence."
                : "Gestión inteligente y privada de tus finanzas personales y presupuesto con el apoyo de Inteligencia Artificial."}
            </p>
          </div>

          {/* Tab switches */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 leading-none">
            <button
              onClick={() => {
                setAuthMode('signin');
                setAuthError('');
                setAuthSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? "Sign In" : "Inicia Sesión"}</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setAuthError('');
                setAuthSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? "Create Account" : "Crea Cuenta"}</span>
            </button>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError('');
              setAuthSuccessMsg('');

              if (!authUsername.trim() || !authPassword) {
                setAuthError(lang === 'en' ? 'Please complete all fields.' : 'Por favor completa todos los campos.');
                return;
              }

              if (authMode === 'signup') {
                if (!authName.trim()) {
                  setAuthError(lang === 'en' ? 'Please tell us your name.' : 'Por favor dinos tu nombre.');
                  return;
                }
                if (!acceptedDataTreatment) {
                  setAuthError(lang === 'en' ? 'You must accept the Personal Data Treatment & Privacy Policy to register.' : 'Debes autorizar el Tratamiento de Datos Personales y Políticas de Privacidad para registrarte.');
                  return;
                }
                const res = await handleRegisterUser(authUsername, authName, authPassword);
                if (res.success) {
                  setAuthSuccessMsg(
                    lang === 'en'
                      ? 'Account registered successfully! Now you can sign in with your username.'
                      : '¡Cuenta registrada con éxito! Ya puedes iniciar sesión con tu usuario.'
                  );
                  setAuthUsername('');
                  setAuthName('');
                  setAuthPassword('');
                  setAuthMode('signin');
                } else {
                  setAuthError(res.error || (lang === 'en' ? 'An error occurred during registration.' : 'Ocurrió un error en el registro.'));
                }
              } else {
                // Sign in
                const cleanUser = authUsername.trim().toLowerCase();
                const savedUsersRaw = localStorage.getItem('finanzas_usuarios');
                const usersList: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

                let match = usersList.find(u => u.username === cleanUser);

                let loadedFromCloud = false;
                // Fallback & Synchronize: If the user is not found locally OR if cloudMode is active, fetch from the cloud database
                if (!match || cloudMode) {
                  setSyncingCloud(true);
                  try {
                    const cloudUser = await getUserFromCloud(cleanUser);
                    if (cloudUser) {
                      match = cloudUser;
                      loadedFromCloud = true;
                      
                      // Remove previous entries for this username and register the latest cloud version locally
                      const otherUsers = usersList.filter(u => u.username !== cleanUser);
                      otherUsers.push(cloudUser);
                      localStorage.setItem('finanzas_usuarios', JSON.stringify(otherUsers));
                    }
                  } catch (err) {
                    console.error("Failed to query user from Firestore during signin:", err);
                  } finally {
                    setSyncingCloud(false);
                  }
                }

                if (match) {
                  const isValidPassword = match.passwordHash === authPassword;
                  if (isValidPassword) {
                    await handleLogin(match, { loadFromCloud: loadedFromCloud || cloudMode });
                  } else {
                    setAuthError(
                      lang === 'en'
                        ? 'Incorrect password. If you forgot it, use the recovery option below.'
                        : 'Contraseña incorrecta para el usuario ingresado. Si olvidaste tu contraseña, usa el botón de recuperar abajo.'
                    );
                  }
                } else if (cleanUser === 'glory-dev' && authPassword === 'glory123') {
                  // Fallback load demo credentials instantly
                  handleLoadDemoAccount();
                } else {
                  setAuthError(
                    lang === 'en'
                      ? 'Username not registered in the system. Check your spelling, toggle Cloud Sync or sign up.'
                      : 'El nombre de usuario no está registrado en el sistema. Verifica que esté bien escrito, activa la Sincronización en la Nube o regístralo arriba.'
                  );
                }
              }
            }}
            className="space-y-4"
          >
            {authError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium leading-relaxed flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccessMsg && (
              <div className="p-3.5 bg-blue-50 border border-blue-100 text-blue-900 text-xs rounded-xl font-medium leading-relaxed flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-blue-500" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {lang === 'en' ? "Your Name" : "Tu Nombre"}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={lang === 'en' ? "Enter your name" : "Escribe tu nombre"}
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm focus:outline-none transition outline-none"
                    autoComplete="name"
                    autoCapitalize="words"
                    autoCorrect="off"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {lang === 'en' ? "Username" : "Usuario"}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'en' ? "Enter username (e.g. your_name)" : "Escribe tu usuario (ej: tu_nombre)"}
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm focus:outline-none transition outline-none font-medium"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {lang === 'en' ? "Password" : "Contraseña"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm focus:outline-none transition outline-none"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>
            </div>

            {/* Cloud Sync Toggle inside Auth panel */}
            <div className="pt-1.5 pb-0.5">
              <label className="relative flex items-center justify-between p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border border-slate-200/70 hover:border-blue-200 hover:bg-white rounded-2xl cursor-pointer transition select-none">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-xl transition ${cloudMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                    <Cloud className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left leading-none">
                    <span className="text-[11px] font-black text-slate-800 block">
                      {lang === 'en' ? "Cloud Storage (Firebase)" : "Almacenamiento en la Nube"}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold mt-0.5 block">
                      {lang === 'en' ? "Sync securely across devices (Free tier)" : "Guarda datos de forma gratis y segura"}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={cloudMode}
                  onChange={(e) => {
                    setCloudMode(e.target.checked);
                    localStorage.setItem('finanzas_cloudMode', e.target.checked ? 'true' : 'false');
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Checkbox Tratamiento de Datos (Ley 1581 de 2012) */}
            {authMode === 'signup' && (
              <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-2xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="acceptedDataTreatment"
                  checked={acceptedDataTreatment}
                  onChange={(e) => setAcceptedDataTreatment(e.target.checked)}
                  className="mt-1 h-3.5 w-3.5 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="text-left leading-tight">
                  <label htmlFor="acceptedDataTreatment" className="text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                    {lang === 'en' 
                      ? "I authorize the processing of my personal financial data" 
                      : "Autorizo el Tratamiento de mis Datos Personales Financieros"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDataTreatmentModal(true)}
                    className="block text-[10px] text-blue-600 hover:text-blue-700 font-bold underline mt-0.5 transition cursor-pointer"
                  >
                    {lang === 'en' ? "Read Habeas Data & Privacy Policy" : "Ver Política de Privacidad (Ley 1581 de 2012)"}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'signin' && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(!showRecovery);
                    setAuthError('');
                    setAuthSuccessMsg('');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? "Forgot your password or username?" : "¿Olvidaste tu contraseña o usuario?"}</span>
                </button>
              </div>
            )}

            {showRecovery && (
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3 mt-2 text-left animate-fadeIn">
                <div className="flex justify-between items-center bg-blue-50/50 pb-1">
                  <h3 className="text-xs font-black text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? "Recover or Reset" : "Recuperar o Restablecer"}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="p-1 hover:bg-blue-100 rounded-full text-blue-700 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <p className="text-[11px] text-slate-600 leading-normal font-semibold">
                  {lang === 'en'
                    ? "Your data is saved strictly privately in this browser (localStorage). Select your user below to pre-fill the form, or enter details to override/reset password."
                    : "Tus datos se guardan estrictamente de forma privada en este navegador (localStorage). Selecciona tu usuario abajo para precompletar el formulario o escribe tus datos para restablecer la contraseña."}
                </p>

                {/* Display Registered Users List */}
                {(() => {
                  const saved = localStorage.getItem('finanzas_usuarios');
                  const list: User[] = saved ? JSON.parse(saved) : [];
                  if (list.length === 0) {
                    return (
                      <span className="text-[10px] text-rose-600 font-bold block bg-rose-50 p-2 rounded-xl">
                        {lang === 'en'
                          ? "No registered accounts found in this browser yet. Create a new account above."
                          : "Aún no hay cuentas registradas en este navegador. Registra una cuenta nueva arriba."}
                      </span>
                    );
                  }
                  return (
                    <div className="space-y-2">
                       <span className="text-[10px] font-bold text-slate-500 block">
                        {lang === 'en' ? "Accounts detected on this device:" : "Cuentas detectadas en este dispositivo:"}
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {list.map(u => (
                          <button
                            key={u.username}
                            type="button"
                            onClick={() => {
                              setAuthUsername(u.username);
                              setRecoveryUsername(u.username);
                              setAuthSuccessMsg(
                                lang === 'en'
                                  ? `User "${u.username}" selected. Type your passcode above to login, or type a new password below to reset it.`
                                  : `Usuario "${u.username}" seleccionado. Digita tu clave arriba para ingresar, o ingresa una nueva contraseña abajo para restablecerla.`
                              );
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5 shrink-0"
                            title={lang === 'en' ? "Tap to select this user" : "Toca para seleccionar este usuario"}
                          >
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.username}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="border-t border-blue-100/60 pt-2.5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {lang === 'en' ? "Reset your user's password:" : "Restablecer la clave de tu usuario:"}
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder={lang === 'en' ? "Username" : "Nombre de usuario"}
                      value={recoveryUsername}
                      onChange={(e) => setRecoveryUsername(e.target.value.toLowerCase().trim())}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-medium"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <input
                      type="password"
                      placeholder={lang === 'en' ? "New password" : "Nueva contraseña"}
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-medium"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!recoveryUsername || !recoveryNewPassword) {
                        alert(
                          lang === 'en'
                            ? "Please complete the username and new password fields to reset."
                            : "Por favor completa el usuario y la nueva contraseña para restablecer."
                        );
                        return;
                      }
                      const res = await handleRecoverOrResetPassword(recoveryUsername, recoveryNewPassword);
                      if (res.success) {
                        setAuthSuccessMsg(res.message || (lang === 'en' ? "Password updated successfully." : "Contraseña restablecida con éxito."));
                        setAuthUsername(recoveryUsername);
                        setAuthPassword(recoveryNewPassword);
                        setShowRecovery(false);
                      } else {
                        alert(res.error || (lang === 'en' ? "An error occurred." : "Ocurrió un error."));
                      }
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? "Set New Password" : "Establecer Nueva Contraseña"}</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold hover:-translate-y-0.5 duration-200 transition-all cursor-pointer shadow-md shadow-slate-900/10 flex items-center justify-center gap-1.5"
            >
              {authMode === 'signup' ? (
                <>
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'en' ? "Create Account" : "Crear Cuenta"}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'en' ? "Sign In" : "Iniciar Sesión"}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Trigger line */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-white px-3 text-slate-400 tracking-wider">
                {lang === 'en' ? "Demo / Sandbox" : "Demostración / Pruebas"}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleLoadDemoAccount}
              className="w-full py-3 bg-blue-50 border border-blue-100 hover:border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition duration-150 cursor-pointer shadow-xs flex items-center justify-center gap-2 animate-pulse hover:animate-none"
            >
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              {lang === 'en' ? "Load Demo Account (Glory-Dev)" : "Cargar Cuenta de Demostración (Glory-Dev)"}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center font-medium mt-3">
            {lang === 'en'
              ? "* Register a unique user above to start with clean zeros ($0) and secure your private transactions in this local sandbox. 'Glory-Dev' includes placeholder records to explore the dynamic analytics."
              : "* Registra un usuario único arriba para comenzar con tu presupuesto en ceros ($0) y meter tus finanzas privadas en este navegador. \"Glory-Dev\" incluye transacciones ficticias de ejemplo para explorar la herramienta."}
          </p>
        </div>
        <footer className="mt-8 text-center text-slate-400 text-[11px] font-semibold tracking-wide">
          {lang === 'en'
            ? "© 2026 Glory-Dev • FinanceAssistant AI. All local profile data is processed privately."
            : "© 2026 Glory-Dev • FinanzAsistente AI. Todos los datos locales se procesan de forma privada."}
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-600/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                {t('appName')} <span className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold px-2 py-0.5 rounded-full">AI</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">{t('tagline')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex space-x-1" aria-label="Tabs Principal">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                    : 'text-slate-655 hover:bg-slate-100'
                }`}
              >
                {t('dashboard')}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                    : 'text-slate-655 hover:bg-slate-100'
                }`}
              >
                {t('history')}
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-1.5 ${
                  activeTab === 'assistant'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                    : 'text-slate-655 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500 fill-amber-500/25" />
                <span className="hidden sm:inline">{t('assistant')}</span>
                <span className="sm:hidden">{t('chat')}</span>
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'config'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                    : 'text-slate-655 hover:bg-slate-100'
                }`}
              >
                {t('settings')}
              </button>
            </nav>

            {currentUser && (
              <div className="flex items-center gap-1.5 sm:gap-2.5 border-l border-slate-200 pl-2 sm:pl-3 ml-1 sm:ml-2">
                {/* Cloud Connection Badge */}
                <div className="flex items-center gap-1 sm:gap-1.5 mr-0.5 sm:mr-1" title={cloudMode ? "Firebase Cloud Database Sync Enabled & Verified" : "Local-only Sandbox Storage Mode"}>
                  <div className={`p-1 rounded-lg border ${cloudMode ? 'bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    <Cloud className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${cloudMode ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                    {cloudMode ? "Cloud" : "Local"}
                  </span>
                </div>

                <div className="hidden md:flex flex-col items-end leading-none mr-1">
                  <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">@{currentUser.username}</span>
                </div>
                <div className="p-1.5 bg-blue-600/10 text-blue-600 rounded-lg md:hidden">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowUserManualModal(true)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                  title={lang === 'en' ? 'User Manual & Data' : 'Manual de Manejo y Datos'}
                >
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span className="hidden lg:inline text-xs font-bold text-slate-600 transition">{lang === 'en' ? 'Manual' : 'Manual'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition cursor-pointer flex items-center justify-center"
                  title={isDarkMode ? (lang === 'en' ? 'Light Mode' : 'Modo Claro') : (lang === 'en' ? 'Dark Mode' : 'Modo Oscuro')}
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* COMPONENT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* BANNER NOTIFICATION */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <Check className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm font-medium">{successMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* AYUDA / CÓMO ALIMENTAR LA INFORMACIÓN */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 rounded-3xl border border-slate-850 shadow-xl text-white relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5" /> Guía Práctica de Uso
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-white">¿Cómo alimentar tu información de gastos de forma ágil?</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Hemos optimizado este sistema para que puedas subir transacciones cómodamente en Pesos Colombianos (COP) a través de tres intuitivos métodos:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs text-slate-300">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                      <span className="font-bold text-blue-400 block">1. Formulario Manual</span>
                      <p className="leading-relaxed text-slate-400">Ve a la pestaña <strong>Gastos</strong> y escribe el valor en pesos COP, selecciona categoría y guarda.</p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                      <span className="font-bold text-sky-400 block">2. Texto por IA (Arriba)</span>
                      <p className="leading-relaxed text-slate-400">Describe el egreso: <em>"45 mil en Juan Valdez"</em>, pulsa <strong>Analizar</strong> y regístralo con un clic.</p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                      <span className="font-bold text-amber-400 block">3. Chat del Asistente</span>
                      <p className="leading-relaxed text-slate-400">Habla con <strong>Asistente AI</strong> y pídele de forma natural que agregue o analice egresos de tu historial.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 shrink-0 md:max-w-xs w-full text-xs">
                  <span className="font-bold text-slate-200 block">💡 Proba estas sugerencias de texto:</span>
                  <div className="space-y-1.5">
                    <button 
                      onClick={() => setNlpText('Ayer gasté 45000 canasta básica en el Éxito')}
                      className="w-full text-left p-1.5 bg-white/5 hover:bg-white/10 rounded-md transition text-slate-300 truncate"
                    >
                      "Ayer gasté 45000 en el Éxito"
                    </button>
                    <button 
                      onClick={() => setNlpText('Pagamos 120mil pesos de arriendo')}
                      className="w-full text-left p-1.5 bg-white/5 hover:bg-white/10 rounded-md transition text-slate-300 truncate"
                    >
                      "Pagamos 120mil pesos de arriendo"
                    </button>
                    <button 
                      onClick={() => setNlpText('Pagué 12.000 de café y buñuelo hoy')}
                      className="w-full text-left p-1.5 bg-white/5 hover:bg-white/10 rounded-md transition text-slate-300 truncate"
                    >
                      "Compando café por 12.000 cop"
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MONTH FILTER SELECTION PILLS */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Rango del Historial (Presupuesto Mensualizado)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Filas calculadas y métricas adaptadas para el periodo seleccionado</p>
              </div>

              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl leading-none">
                <button
                  type="button"
                  onClick={() => setSelectedMonth('todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedMonth === 'todos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-650 hover:text-slate-900'
                  }`}
                >
                  {lang === 'en' ? 'Full History' : 'Historial Completo'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMonth('3meses')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedMonth === '3meses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-650 hover:text-slate-900'
                  }`}
                >
                  {lang === 'en' ? 'Last 3 Months' : 'Últimos 3 Meses'}
                </button>
                {monthOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedMonth(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedMonth === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                     {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI OVERVIEW (BENTO TYPE) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Presupuesto Total */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-42">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Presupuesto Mensual</h3>
                    <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono mt-2 block">
                      ${budget.total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}<span className="text-xs font-sans font-medium text-slate-500 ml-1">COP</span>
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Definido por categorías
                  </div>
                  <button onClick={() => setActiveTab('config')} className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                    Ver límites →
                  </button>
                </div>
              </div>

              {/* Total Gastado */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-42">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Total Gastado ({selectedMonth === 'todos' ? 'Historial' : 'Mes'})</h3>
                    <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono mt-2 block">
                      ${totalSpent.toLocaleString('es-CO', { maximumFractionDigits: 0 })}<span className="text-xs font-sans font-medium text-slate-505 ml-1">COP</span>
                    </span>
                  </div>
                  <div className={`p-3 rounded-2xl ${statsObj.isUnderBudget ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                    {statsObj.isUnderBudget ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>Consumido del presupuesto</span>
                    <span>{statsObj.spentPct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-550 ${
                        statsObj.spentPct > 100
                          ? 'bg-rose-500'
                          : statsObj.spentPct > 80
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, statsObj.spentPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Saldo Restante */}
              <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden flex flex-col justify-between h-42 ${
                statsObj.isUnderBudget
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-rose-900 text-white border-rose-950'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400">Arqueo Disponible</h3>
                    <span className="text-3xl font-bold tracking-tight font-mono mt-2 block">
                      ${statsObj.remaining.toLocaleString('es-CO', { maximumFractionDigits: 0 })}<span className="text-xs font-sans font-medium text-slate-450 ml-1">COP</span>
                    </span>
                  </div>
                  <div className={`p-3 rounded-2xl ${statsObj.isUnderBudget ? 'bg-white/10 text-white' : 'bg-white/20 text-white'}`}>
                    <Coins className="w-6 h-6" />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${statsObj.isUnderBudget ? 'text-blue-400' : 'text-rose-400'}`} />
                  <span className="text-xs font-medium">
                    {statsObj.isUnderBudget
                      ? 'Estás en zona segura de finanzas'
                      : '¡Cuidado! Has excedido el límite mensual'}
                  </span>
                </div>
              </div>
            </div>

            {/* DUAL-MODE AI ENTRY STATION (TEXT OR RECEIPT IMAGE SCAN) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full translate-x-8 -translate-y-8 select-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gradient-to-tr from-blue-600 to-sky-500 text-white rounded-2xl shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Estación de Registro Inteligente AI</h3>
                    <p className="text-xs text-slate-505">Alimenta tus egresos por texto descriptivo o capturando tu factura de compra física.</p>
                  </div>
                </div>

                {/* Sub-tabs toggler */}
                <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto leading-none">
                  <button
                    type="button"
                    onClick={() => {
                      setScanTab('text');
                      setAnalyzedReceipt(null);
                      setSelectedImageBase64(null);
                      stopLiveCamera();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      scanTab === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-650 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Descripción de Texto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScanTab('image');
                      setParsedPreview(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      scanTab === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-sky-600" />
                    <span>Escanear Factura 📸</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: TEXT DESCRIPTIVE ENTRY (ORIGINAL FUNCTIONALITY HIGHTENED) */}
              {scanTab === 'text' && (
                <div className="space-y-4">
                  <form onSubmit={handleAIParse} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Ej. 'Ayer gasté 45mil pesos en el Éxito almorzando' o 'Plataforma de streaming por 44900 hoy'"
                      value={nlpText}
                      onChange={(e) => setNlpText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isParsing || !nlpText.trim()}
                      className="bg-slate-900 text-white hover:bg-slate-850 px-6 py-3 rounded-2xl text-sm font-semibold transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isParsing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analizar
                        </>
                      )}
                    </button>
                  </form>

                  {/* AI Parser Preview Panel (Text model) */}
                  {parsedPreview && (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 relative animate-fadeIn">
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => setParsedPreview(null)}
                          className="p-1 hover:bg-slate-200 text-slate-450 rounded-full cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-slate-505 uppercase tracking-widest mb-3 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" /> Vista Previa Parseada por IA
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="block text-xs text-slate-400">Concepto</span>
                          <strong className="text-sm text-slate-800">{parsedPreview.description}</strong>
                        </div>
                        <div>
                          <span className="block text-xs text-slate-400">Importe</span>
                          <strong className="text-sm text-slate-955 font-mono">${parsedPreview.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP</strong>
                        </div>
                        <div>
                          <span className="block text-xs text-slate-400">Categoría Sugerida</span>
                          <strong className="text-xs text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mt-0.5 border border-blue-100 font-semibold">
                            {CATEGORIES.find(c => c.id === parsedPreview.category)?.name || parsedPreview.category}
                          </strong>
                        </div>
                        <div>
                          <span className="block text-xs text-slate-400">Fecha</span>
                          <strong className="text-sm text-slate-800 font-mono">{parsedPreview.date}</strong>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
                        <button
                          onClick={() => setParsedPreview(null)}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-medium text-slate-700 transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={confirmParsedExpense}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Registrar en mi Cuenta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: RECEIPT IMAGE SCAN AND BREAKDOWN */}
              {scanTab === 'image' && (
                <div className="space-y-4">
                  {/* Option Selector Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Native Camera trigger (Mobile-optimized capture) */}
                    <label id="btn-capture-camera" className="flex flex-col items-center justify-center p-3.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-200 border-dashed rounded-2xl cursor-pointer text-xs font-bold text-blue-900 transition hover:shadow-md select-none text-center gap-1.5">
                      <div className="p-2 bg-blue-600 text-white rounded-full">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold">Tomar Foto con Cámara 📸</span>
                      <span className="text-[10px] text-blue-600/75 font-normal">Abre la cámara trasera de tu móvil</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {/* Standard Gallery trigger (Screenshots, saved files) */}
                    <label id="btn-browse-gallery" className="flex flex-col items-center justify-center p-3.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200 border-dashed rounded-2xl cursor-pointer text-xs font-bold text-indigo-900 transition hover:shadow-md select-none text-center gap-1.5">
                      <div className="p-2 bg-indigo-600 text-white rounded-full">
                        <Image className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold">Elegir de mi Galería 🖼️</span>
                      <span className="text-[10px] text-indigo-600/75 font-normal">Subir captura o foto ya guardada</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {/* Inline Laptop/PC Webcam toggle */}
                    <button
                      id="btn-inline-webcam"
                      type="button"
                      onClick={showLiveCamera ? stopLiveCamera : startLiveCamera}
                      className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 transition hover:shadow-md select-none cursor-pointer text-center gap-1.5"
                    >
                      <div className={`p-2 rounded-full ${showLiveCamera ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-700 text-white'}`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold">{showLiveCamera ? "Apagar Cámara Inline" : "Abrir Cámara Web Inline 🎥"}</span>
                      <span className="text-[10px] text-slate-500 font-normal">Transmisión dentro del navegador</span>
                    </button>
                  </div>

                  {/* Live WebCam Feed View */}
                  {showLiveCamera && (
                    <div className="p-4 bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-950 space-y-3.5 animate-fadeIn">
                      <div className="relative aspect-video max-w-sm mx-auto bg-black rounded-2xl overflow-hidden border border-slate-800">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute right-3.5 top-3.5 px-3 py-1 bg-black/60 rounded-full text-[10px] text-white font-bold flex items-center gap-1.5 uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 bg-rose-500 animate-ping rounded-full" /> Cámara Activa
                        </div>
                      </div>
                      <div className="flex justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={captureFromVideo}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Capturar Foto de Factura
                        </button>
                        <button
                          type="button"
                          onClick={stopLiveCamera}
                          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selected Image Screen and Button */}
                  {selectedImageBase64 && !isScanningReceipt && !analyzedReceipt && (
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
                      <div className="flex items-center gap-4.5">
                        <img
                          src={`data:${selectedImageMime};base64,${selectedImageBase64}`}
                          alt="Recibo"
                          className="w-20 h-20 object-cover rounded-2xl border border-slate-300 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Imagen de Factura Capturada</span>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            Hemos guardado tu foto de factura de compra. Pulsa el botón para desglosarla inteligentemente con Gemini.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 w-full md:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageBase64(null);
                            setAnalyzedReceipt(null);
                          }}
                          className="flex-1 px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                        >
                          Quitar Foto
                        </button>
                        <button
                          type="button"
                          onClick={handleScanReceipt}
                          className="flex-2 bg-slate-900 hover:bg-slate-850 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          Desglosar Factura
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Progress screen loader */}
                  {isScanningReceipt && (
                    <div className="p-8 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 rounded-3xl border border-blue-900/40 text-center space-y-4 animate-pulse">
                      <div className="inline-flex p-3 bg-blue-600/25 text-blue-400 rounded-full">
                        <Sparkles className="w-6 h-6 animate-spin" />
                      </div>
                      <h4 className="text-sm font-bold text-blue-400">Gemini está analizando tu recibo...</h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed font-medium">{scanProgressMsg}</p>
                      <div className="w-48 bg-white/10 h-1.5 rounded-full mx-auto overflow-hidden">
                        <div className="bg-blue-400 h-full w-2/3 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}

                  {/* Structured Review Panel for Analyzed Receipt */}
                  {analyzedReceipt && (
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-bold text-blue-700 uppercase tracking-widest select-none">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            {analyzedReceipt.isMock ? "Modo Demostración / Sin API Key" : "Análisis Realizado por Gemini"}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <FileText className="w-4.5 h-4.5 text-slate-500 mt-0.5" />
                            <input
                              type="text"
                              value={analyzedReceipt.establishmentName}
                              onChange={(e) => setAnalyzedReceipt({ ...analyzedReceipt, establishmentName: e.target.value })}
                              placeholder="Nombre del Comercio"
                              className="bg-transparent hover:bg-white focus:bg-white text-base font-bold text-slate-900 border border-transparent focus:border-slate-300 rounded px-1.5 py-0.5 focus:outline-none leading-none transition"
                              title="Toca para renombrar el comercio si es necesario"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-550 font-bold">Fecha Compra:</span>
                          <input
                            type="date"
                            value={analyzedReceipt.date}
                            onChange={(e) => {
                              const newDate = e.target.value;
                              setAnalyzedReceipt({
                                ...analyzedReceipt,
                                date: newDate,
                                items: analyzedReceipt.items.map(it => ({ ...it, date: newDate }))
                              });
                            }}
                            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold font-mono text-slate-800 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-slate-550 uppercase tracking-widest leading-none">
                          Artículos Desglosados en el Recibo
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Tilda para agregar, toca textos o montos para editarlos libremente antes de guardar.</p>
                      </div>

                      {/* Items loop */}
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {analyzedReceipt.items.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                              item.selected
                                ? 'bg-white border-slate-250 shadow-sm'
                                : 'bg-slate-100/60 border-slate-200 opacity-55'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              {/* Custom Checkbox */}
                              <button
                                type="button"
                                onClick={() => toggleReceiptItemSelect(item.id)}
                                className="p-1 rounded-full text-slate-400 hover:text-blue-600 shrink-0 select-none cursor-pointer"
                              >
                                {item.selected ? (
                                  <CheckSquare className="w-5 h-5 text-blue-600 fill-blue-50/50" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-350" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  disabled={!item.selected}
                                  onChange={(e) => updateReceiptItemField(item.id, 'description', e.target.value)}
                                  className="bg-transparent hover:bg-slate-50 focus:bg-white text-xs font-bold text-slate-800 border border-transparent focus:border-slate-300 rounded px-1.5 py-0.5 w-full focus:outline-none text-ellipsis overflow-hidden"
                                />

                                {/* Category Dropdown Selector */}
                                <select
                                  value={item.category}
                                  disabled={!item.selected}
                                  onChange={(e) => updateReceiptItemField(item.id, 'category', e.target.value)}
                                  className="bg-slate-100 sm:bg-transparent text-[11px] font-bold text-slate-650 border border-transparent hover:bg-slate-150 rounded px-2 py-1 focus:outline-none cursor-pointer text-ellipsis max-w-[120px]"
                                >
                                  {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto px-1">
                              <span className="text-[11px] text-slate-400 font-bold">$</span>
                              <input
                                type="number"
                                step="500"
                                disabled={!item.selected}
                                value={item.amount}
                                onChange={(e) => updateReceiptItemField(item.id, 'amount', e.target.value)}
                                className="w-20 bg-transparent text-right hover:bg-slate-50 focus:bg-white text-xs font-mono font-bold text-slate-900 border border-transparent focus:border-slate-300 rounded px-1 w-full focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-405 font-bold">COP</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Math deduction layout explaining 'Monto inicial' reduction */}
                      {(() => {
                        const selectedItems = analyzedReceipt.items.filter(it => it.selected);
                        const totalAddedSum = selectedItems.reduce((sum, item) => sum + item.amount, 0);
                        const finalRemainingProjected = statsObj.remaining - totalAddedSum;

                        return (
                          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-slate-800 space-y-2 mt-2">
                            <span className="font-bold text-slate-900 block border-b border-blue-100/60 pb-1.5 uppercase tracking-wider text-[10px]">
                              📉 Disminución de tu Monto Financiero Inicial
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-medium mt-1">
                              <div className="p-3 bg-white/80 border border-slate-150 rounded-xl space-y-0.5">
                                <span className="text-slate-500 block text-[9px] uppercase tracking-wide">Monto Disponible Inicial</span>
                                <strong className="text-sm text-slate-900 font-mono font-bold">${statsObj.remaining.toLocaleString('es-CO')} <span className="text-[10px]">COP</span></strong>
                              </div>
                              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl space-y-0.5">
                                <span className="text-rose-650 block text-[9px] uppercase tracking-wide">Descuento Factura AI</span>
                                <strong className="text-sm text-rose-700 font-mono font-bold">-${totalAddedSum.toLocaleString('es-CO')} <span className="text-[10px]">COP</span></strong>
                              </div>
                              <div className={`p-3 border rounded-xl space-y-0.5 ${finalRemainingProjected >= 0 ? 'bg-blue-200/50 border-blue-300 text-blue-950' : 'bg-red-200/60 border-red-300 text-red-950'}`}>
                                <span className="block text-[9px] uppercase tracking-wide">{finalRemainingProjected >= 0 ? 'Arqueo Restante Final' : 'Exceso de Presupuesto'}</span>
                                <strong className="text-sm font-mono font-bold">${finalRemainingProjected.toLocaleString('es-CO')} <span className="text-[10px]">COP</span></strong>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-550 leading-relaxed pt-1 font-medium">
                              💡 Al presionar guardar, se descontarán **${totalAddedSum.toLocaleString('es-CO')} COP** de tu saldo inicial de **$${statsObj.remaining.toLocaleString('es-CO')} COP**.
                            </p>
                          </div>
                        );
                      })()}

                      {/* Confirm Actions bar */}
                      <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-200/60 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setAnalyzedReceipt(null);
                            setSelectedImageBase64(null);
                          }}
                          className="px-4.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                        >
                          Descartar Todo
                        </button>
                        <button
                          type="button"
                          onClick={confirmReceiptBreakdown}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 duration-200"
                        >
                          <Check className="w-4 h-4" />
                          Guardar Desglose y Descontar Balance
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* GRAPHS & CATEGORIES SPEEDOMETERS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
              {/* Categorías Desbloqueadas */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Límites por Categoría
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Cómo va tu consumo respecto al presupuesto individual</p>
                </div>

                <div className="space-y-4.5 mt-6">
                  {CATEGORIES.map(cat => {
                    const spent = spentByCategory[cat.id] || 0;
                    const catBudgetObj = budget.byCategory.find(cb => cb.category === cat.id);
                    const catBudget = catBudgetObj ? catBudgetObj.amount : 0;
                    const percent = catBudget > 0 ? (spent / catBudget) * 100 : 0;

                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-850">
                            <span className={`w-2.5 h-2.5 rounded-full ${cat.accentBg}`} />
                            <span className="font-semibold">{cat.name}</span>
                          </div>
                          <span className="font-mono text-slate-600 font-medium">
                            ${spent.toLocaleString('es-CO', { maximumFractionDigits: 0 })} / <span className="text-slate-450">${catBudget.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full ${
                              percent > 100 ? 'bg-rose-500' : percent > 80 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LINE CHART DETAILED GASTO DIARIO */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Historial Acumulativo de Gastos</h3>
                      <p className="text-xs text-slate-500 mt-1">Suma acumulada del mes sobre tus últimos días con movimientos</p>
                    </div>
                    <div className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-full text-slate-650 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      Acumulativo
                    </div>
                  </div>
                </div>

                {chartData.cumulative.length > 0 ? (
                  <div className="mt-6 flex-1 flex flex-col justify-end">
                    {/* SVG PLOTTING */}
                    <div className="relative h-56 w-full pt-4">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="0" y1="160" x2="500" y2="160" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />

                        {/* Path drawing */}
                        {(() => {
                          const rawPoints = chartData.cumulative || [];
                          // Ensure all points are completely valid and clean numbers
                          const points = rawPoints.map(p => ({
                            day: p.day || '',
                            amount: Number(p.amount) || 0,
                            cumulative: Number(p.cumulative) || 0
                          })).filter(p => !isNaN(p.cumulative));

                          const maxAmt = Math.max(...points.map(p => p.cumulative), 1) || 100;
                          const divisorX = points.length > 1 ? points.length - 1 : 1;
                          
                          const mappedPoints = points.map((p, idx) => {
                            const rawX = points.length === 1 ? 250 : (idx / divisorX) * 500;
                            const rawY = 180 - (p.cumulative / maxAmt) * 150;
                            
                            // Fully sanitize coordinates keeping them strictly finite and numeric
                            const x = isNaN(rawX) || !isFinite(rawX) ? 250 : rawX;
                            const y = isNaN(rawY) || !isFinite(rawY) ? 180 : rawY;
                            
                            return { x, y, ...p };
                          });

                          const pathStr = mappedPoints.reduce((acc, p, idx) => {
                            return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                          }, '');

                          const areaStr = mappedPoints.length > 0 
                            ? pathStr + ` L ${mappedPoints[mappedPoints.length - 1].x} 180 L ${mappedPoints[0].x} 180 Z`
                            : '';

                          return (
                            <>
                              {points.length > 1 && (
                                <>
                                  <path d={areaStr} fill="url(#chartGrad)" />
                                  <path d={pathStr} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                                </>
                              )}

                              {/* Interactive Dot markers */}
                              {mappedPoints.map((p, idx) => (
                                <g key={idx}>
                                  <circle cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" className="cursor-pointer" />
                                  <text x={p.x} y={p.y - 12} fontSize="9" fill="#334155" fontFamily="monospace" textAnchor="middle" className="font-semibold">
                                    ${p.cumulative >= 1000 ? (p.cumulative / 1000).toFixed(0) + 'k' : p.cumulative.toFixed(0)}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* X Labels */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-3 px-1">
                      {chartData.cumulative.map((p, idx) => (
                        <span key={idx}>{p.day}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-60 mt-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col justify-center items-center text-slate-400 p-4">
                    <p className="text-sm font-medium">No hay suficientes datos temporales para graficar.</p>
                    <p className="text-xs text-slate-400 mt-1">Registra gastos con diferentes fechas para observar tendencias.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ADVISOR BANNER LINK */}
            <div className="p-6 bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="absolute left-0 bottom-0 top-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Bot className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">¿Quieres un plan personalizado para recortar un 20% tu gasto?</h3>
                  <p className="text-xs text-blue-100">Nuestro consultor de Inteligencia Artificial evaluará todos tus gastos hoy y preparará tu meta.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('assistant');
                  sendChatMessage('Por favor, dame un análisis global de mis gastos de este mes y 3 sugerencias para recortar un 20% en base a mis categorías principales.');
                }}
                className="bg-white text-blue-800 hover:bg-blue-50 px-5 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer shrink-0 shadow-sm select-none transition"
              >
                Preguntar a la IA Ahora
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORIAL DE GASTOS */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Registro de Gasto Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-4 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registrar Nuevo Gasto</h3>
                <p className="text-xs text-slate-500 mt-1">Introduce los detalles de tu compra</p>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Descripción / Comercio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Súper Alcampo o Uber oficina"
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Importe ($ COP)</label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="45000"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoría</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-all cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Etiquetas (Opcional)</label>
                  <input
                    type="text"
                    placeholder="separadas por coma (ej. fijos, ocio)"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-blue-600/15 cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  Guardar Gasto
                </button>
              </form>
            </div>

            {/* List and Filters Grid */}
            <div className="lg:col-span-8 space-y-6">
              {/* Filter Panel */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Filter className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o etiqueta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl pl-9.5 pr-4 py-2 text-sm focus:outline-none transition"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-650">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Categoría:</span>
                    <select
                      value={catFilter}
                      onChange={(e) => setCatFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                    >
                      <option value="Todas">Todas</option>
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Orden:</span>
                    <button
                      onClick={() => {
                        if (sortField === 'date') {
                          setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSortField('date');
                          setSortDirection('desc');
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                        sortField === 'date' ? 'bg-blue-50 text-blue-800 border border-blue-100 font-bold' : 'bg-slate-100 text-slate-650'
                      }`}
                    >
                      <span>Fecha</span>
                      {sortField === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
                    </button>
                    <button
                      onClick={() => {
                        if (sortField === 'amount') {
                          setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSortField('amount');
                          setSortDirection('desc');
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                        sortField === 'amount' ? 'bg-blue-50 text-blue-800 border border-blue-100 font-bold' : 'bg-slate-100 text-slate-650'
                      }`}
                    >
                      <span>Monto</span>
                      {sortField === 'amount' && (sortDirection === 'desc' ? '↓' : '↑')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expense Table List */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900">Historial de Transacciones ({filteredExpenses.length})</h3>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/45 dark:border-emerald-800 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs select-none"
                      title={lang === 'en' ? 'Download Excel CSV spreadsheet' : 'Descargar planilla Excel CSV'}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Export Excel' : 'Exportar Excel'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Gastado Filtrado: ${filteredExpenses.reduce((s, x) => s + x.amount, 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP
                  </div>
                </div>

                {filteredExpenses.length > 0 ? (
                  <div className="divide-y divide-slate-150">
                    {filteredExpenses.map((expense) => {
                      const catTheme = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[CATEGORIES.length - 1];
                      return (
                        <div key={expense.id} className="p-4.5 flex items-center justify-between hover:bg-slate-50/50 transition">
                          <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                            <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${catTheme.accentBg}`} />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-slate-800 capitalize truncate leading-normal">
                                {expense.description}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">
                                  {catTheme.name}
                                </span>
                                <span className="text-slate-300 text-xs">•</span>
                                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {expense.date}
                                </span>
                                {expense.tags && expense.tags.length > 0 && (
                                  <>
                                    <span className="text-slate-300 text-xs">•</span>
                                    <div className="flex gap-1 overflow-hidden">
                                      {expense.tags.map((t, i) => (
                                        <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">#{t}</span>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-sm font-bold text-slate-900 font-mono text-right whitespace-nowrap">
                              ${expense.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                            </span>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                              title="Borrar gasto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 flex flex-col justify-center items-center">
                    <Info className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No se encontraron gastos con los criterios de búsqueda.</p>
                    <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o agrega un nuevo gasto.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ASISTENTE FINANCIERO AI */}
        {activeTab === 'assistant' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-[calc(100vh-16rem)]">
            {/* Preguntas Frecuentes Quick Actions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <Bot className="w-5 h-5 text-blue-600 animate-pulse" /> Tips y Desafíos AI
                </h3>
                <p className="text-xs text-slate-500 mt-1">Elige un disparador automático para que el asesor evalúe tus finanzas.</p>

                <div className="space-y-3 mt-6">
                  <button
                    onClick={() => sendChatMessage('¿En qué categoría tengo mi mayor nivel de gasto y cómo puedo reducirlo?')}
                    className="w-full text-left p-3.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-100 rounded-2xl text-xs font-semibold text-slate-700 hover:text-blue-950 transition flex items-start gap-2.5 cursor-pointer leading-relaxed"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>¿En qué categoría gasto más?</span>
                  </button>
                  <button
                    onClick={() => sendChatMessage('Dame 3 consejos súper prácticos y rápidos para ahorrar en el día a día.')}
                    className="w-full text-left p-3.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-100 rounded-2xl text-xs font-semibold text-slate-700 hover:text-blue-950 transition flex items-start gap-2.5 cursor-pointer leading-relaxed"
                  >
                    <Coins className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>¿Dame 3 consejos de ahorro diario?</span>
                  </button>
                  <button
                    onClick={() => sendChatMessage('Proponme un Desafío Semanal de Gasto Cero estimulante en base a lo que llevo este mes.')}
                    className="w-full text-left p-3.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-100 rounded-2xl text-xs font-semibold text-slate-700 hover:text-blue-950 transition flex items-start gap-2.5 cursor-pointer leading-relaxed"
                  >
                    <Activity className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Desafío de Ahorro para esta semana</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/85 rounded-2xl mt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" /> Privacidad Garantizada
                </h4>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  Tus transacciones y presupuestos se cargan directamente como contexto temporal de análisis para Gemini, garantizando sugerencias completamente personalizadas sin almacenar tu información en bases de datos externas de terceros.
                </p>
              </div>
            </div>

            {/* AI CHAT CONTAINER */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm lg:col-span-8 flex flex-col justify-between overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    {/* Character Avatar */}
                    <div className={`p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {msg.role === 'user' ? <Wallet className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`p-4 rounded-3xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-tr from-blue-600 to-sky-600 text-white rounded-tr-none font-medium'
                        : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-150'
                    }`}>
                      <div className="whitespace-pre-line leading-relaxed markdown-body">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Stream indicator */}
                {isReceivingAdvice && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="p-2 rounded-xl shrink-0 h-9 w-9 bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-3xl text-sm bg-slate-50 text-slate-800 rounded-tl-none border border-slate-150 flex-1 min-w-0">
                      <div className="whitespace-pre-line leading-relaxed font-normal">
                        {incomingAdviceText ? incomingAdviceText : 'Analizando tus presupuestos...'}
                      </div>
                      <span className="inline-block w-2.5 h-2.5 bg-blue-500 animate-ping rounded-full ml-1" />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input form */}
              <div className="p-4 bg-slate-50/60 border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendChatMessage();
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    required
                    disabled={isReceivingAdvice}
                    placeholder="Pregúntame algo sobre tus números (ej. '¿De cuánto fue mi factura de luz?')"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 focus:border-blue-600 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isReceivingAdvice || !chatInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-11 w-11 rounded-2xl shrink-0 flex items-center justify-center cursor-pointer transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONFIGURACION DE PRESUPUESTOS Y DATOS */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left Column (Global Budget & Language Selection) */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-8">
              {/* Editor de Presupuesto Global */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-5 h-5 text-blue-600" /> {t('globalBudget')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{t('globalBudgetHelp')}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('monthlyTotal')}</label>
                    <input
                      type="number"
                      step="50000"
                      value={budget.total}
                      onChange={(e) => handleUpdateGlobalBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-3 text-lg font-bold font-mono text-slate-900 focus:outline-none transition"
                    />
                  </div>

                  <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 space-y-2">
                    <p className="font-semibold flex items-center gap-1"><Info className="w-3.5 h-3.5 shrink-0" /> {t('appName')} Tips</p>
                    <p className="leading-relaxed text-slate-600">
                      {t('suggestedBudgetNote')} {t('globalBudgetTip')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Language Selection Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    <Languages className="w-5 h-5 text-blue-600" /> {t('langTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{t('langSubtitle')}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setLang('es');
                      setSuccessMsg('Idioma ajustado a Español / Language set to Spanish');
                      setTimeout(() => setSuccessMsg(''), 3000);
                    }}
                    className={`p-4 rounded-2xl border text-sm font-bold flex flex-col items-center gap-2 transition cursor-pointer ${
                      lang === 'es'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">🇨🇴</span>
                    <span>{t('es')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setLang('en');
                      setSuccessMsg('Language set to English / Idioma ajustado a Inglés');
                      setTimeout(() => setSuccessMsg(''), 3000);
                    }}
                    className={`p-4 rounded-2xl border text-sm font-bold flex flex-col items-center gap-2 transition cursor-pointer ${
                      lang === 'en'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">🇺🇸</span>
                    <span>{t('en')}</span>
                  </button>
                </div>
              </div>

              {/* Cloud Synchronization Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                      <Cloud className={`w-5 h-5 ${cloudMode ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                      {lang === 'en' ? 'Cloud Synchronization' : 'Sincronización en la Nube'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'en' 
                        ? 'Keep your budget and expenses synchronized across your phone and PC.' 
                        : 'Mantén tus presupuestos y gastos sincronizados entre tu celular y tu PC.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {lang === 'en' ? 'Sync Status' : 'Estado de Sincronización'}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      cloudMode 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cloudMode 
                        ? (lang === 'en' ? 'Active Cloud' : 'Nube Activa') 
                        : (lang === 'en' ? 'Local Storage Only' : 'Exclusivo Local')}
                    </span>
                  </div>

                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-200 transition select-none">
                    <span className="text-xs font-black text-slate-700">
                      {lang === 'en' ? 'Enable Firebase Cloud Sync' : 'Activar Sincronización Firebase'}
                    </span>
                    <input
                      type="checkbox"
                      checked={cloudMode}
                      onChange={(e) => {
                        const nextVal = e.target.checked;
                        setCloudMode(nextVal);
                        localStorage.setItem('finanzas_cloudMode', nextVal ? 'true' : 'false');
                        
                        setSuccessMsg(nextVal
                          ? (lang === 'en' ? 'Cloud sync enabled. Your data will now store in Firebase.' : 'Sincronización de nube activada. Los datos se guardarán en Firebase.')
                          : (lang === 'en' ? 'Cloud sync disabled. Data will be saved on this device only.' : 'Sincronización desactivada. Datos se guardarán localmente.')
                        );
                        setTimeout(() => setSuccessMsg(''), 4000);
                      }}
                      className="w-4 h-4 text-blue-600 accent-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                </div>

                {currentUser && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {lang === 'en' ? 'Manual Sync Tools' : 'Herramientas de sincronización manual'}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleUploadLocalToCloud}
                        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center border border-blue-600 shadow-sm"
                        title={lang === 'en' ? 'Upload current local profile & expenses to Cloud' : 'Subir perfil y gastos locales actuales a la Nube'}
                      >
                        <Database className="w-4 h-4" />
                        <span>{lang === 'en' ? 'Backup to Cloud' : 'Subir a la Nube'}</span>
                      </button>
                      
                      <button
                        onClick={handleDownloadCloudToLocal}
                        className="p-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center shadow-xs"
                        title={lang === 'en' ? 'Download cloud profile & overwrite local data' : 'Descargar datos de la nube y sobrescribir los locales'}
                      >
                        <Download className="w-4 h-4" />
                        <span>{lang === 'en' ? 'Restore from Cloud' : 'Descargar de la Nube'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal text-center">
                      {lang === 'en' 
                        ? 'Use Backup if you want to push your local offline transactions to Firebase. Use Restore to sync down from PC.' 
                        : 'Usa "Subir" si deseas registrar tus compras locales en Firebase. Usa "Descargar" para recuperar tu historial.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Category Limits & Password Change) */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-8">
              {/* Ajustes individuales por categorías */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('individualBudgets')}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t('individualBudgetsHelp')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CATEGORIES.map(cat => {
                    const cbValue = budget.byCategory.find(cb => cb.category === cat.id)?.amount || 0;
                    return (
                      <div key={cat.id} className="p-4.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${cat.accentBg}`} />
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">{getCategoryTranslation(cat.id)}</h4>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            step="5000"
                            value={cbValue}
                            onChange={(e) => handleUpdateCategoryBudget(cat.id, e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-8 pr-3 py-2 text-sm font-semibold font-mono text-slate-800 focus:outline-none transition"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botones de acción masiva */}
                <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{t('dataActions')}</h4>
                    <p className="text-xs text-slate-500 leading-normal">{t('dataActionsHelp')}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddSampleData}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-705 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                      title="Cargar gastos de prueba"
                    >
                      {t('loadMockData')}
                    </button>
                    <button
                      onClick={handleClearAllData}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition border border-rose-100"
                      title="Reiniciar panel en ceros"
                    >
                      {t('clearAllData')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Change Password Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-5 h-5 text-blue-600" /> {t('changePassBtn')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{lang === 'en' ? 'Modify your offline device credentials to guarantee security' : 'Modifica las credenciales de tu perfil privado en este dispositivo'}</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {passwordChangeError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold animate-fadeIn">
                      {passwordChangeError}
                    </div>
                  )}
                  {passwordChangeSuccess && (
                     <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl text-xs font-semibold animate-fadeIn">
                       {passwordChangeSuccess}
                     </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('currentPassword')}</label>
                      <input
                        type="password"
                        required
                        value={oldPasswordChangeInput}
                        onChange={(e) => setOldPasswordChangeInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-sm focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('newPassword')}</label>
                      <input
                        type="password"
                        required
                        value={newPasswordChangeInput}
                        onChange={(e) => setNewPasswordChangeInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-sm focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('confirmNewPassword')}</label>
                      <input
                        type="password"
                        required
                        value={confirmPasswordChangeInput}
                        onChange={(e) => setConfirmPasswordChangeInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-sm focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs hover:-translate-y-0.5 duration-150 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t('changePassBtn')}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* INSPECTOR DE BASE DE DATOS LOCAL SÚPER PREMIUM */}
            <div className="lg:col-span-12 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600 animate-pulse animate-duration-1000" /> 
                    <span>Inspector de tu Base de Datos Actual</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Inspecciona, descarga, filtra y administra el almacenamiento físico de datos local privado (Local-First localStorage).
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleExportDatabase}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs hover:-translate-y-0.5 transition duration-150 cursor-pointer shadow-sm flex items-center gap-2"
                    title="Exportar base completa en formato JSON compatible"
                  >
                    <Download className="w-4 h-4" />
                    <span>Respaldar Base (.json)</span>
                  </button>
                  
                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs hover:-translate-y-0.5 transition duration-155 cursor-pointer flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-slate-600" />
                    <span>Restaurar Base</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportDatabase}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Success/Error Alerts for DB Operations */}
              {(dbImportSuccess || dbImportError) && (
                <div className="space-y-2">
                  {dbImportSuccess && (
                    <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{dbImportSuccess}</span>
                    </div>
                  )}
                  {dbImportError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 font-medium">
                      <X className="w-4 h-4 shrink-0" />
                      <span>{dbImportError}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                {/* Left Side Navigation (Files / Tables/ Entities) */}
                <div className="lg:col-span-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Tablas Albergadas en tu Navegador</span>
                  
                  <div className="space-y-1.5">
                    {/* Session Node */}
                    <button
                      onClick={() => setDbSelectedTable('session')}
                      className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        dbSelectedTable === 'session'
                          ? 'bg-blue-50 border-blue-200 text-blue-950 font-bold'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCheck className={`w-4 h-4 ${dbSelectedTable === 'session' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <div className="leading-tight">
                          <span className="text-xs block">Sesión Activa</span>
                          <span className="text-[10px] text-slate-450 font-mono">finanzas_currentUser</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                        {currentUser ? '1' : '0'}
                      </span>
                    </button>

                    {/* Users Table */}
                    <button
                      onClick={() => setDbSelectedTable('users')}
                      className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        dbSelectedTable === 'users'
                          ? 'bg-blue-50 border-blue-200 text-blue-950 font-bold'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <UserIcon className={`w-4 h-4 ${dbSelectedTable === 'users' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <div className="leading-tight">
                          <span className="text-xs block">Catálogo de Usuarios</span>
                          <span className="text-[10px] text-slate-450 font-mono">finanzas_usuarios</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-black rounded-full font-mono">
                        {dbUsersCount}
                      </span>
                    </button>

                    {/* Expenses Table */}
                    <button
                      onClick={() => setDbSelectedTable('expenses')}
                      className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        dbSelectedTable === 'expenses'
                          ? 'bg-blue-50 border-blue-200 text-blue-950 font-bold'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Wallet className={`w-4 h-4 ${dbSelectedTable === 'expenses' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <div className="leading-tight">
                          <span className="text-xs block">Historial de Gastos</span>
                          <span className="text-[10px] text-slate-450 font-mono">finanzas_gastos_{currentUser?.username || 'glory'}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full font-mono">
                        {expenses.length}
                      </span>
                    </button>

                    {/* Budget configuration Table */}
                    <button
                      onClick={() => setDbSelectedTable('budget')}
                      className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        dbSelectedTable === 'budget'
                          ? 'bg-blue-50 border-blue-200 text-blue-950 font-bold'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <SlidersHorizontal className={`w-4 h-4 ${dbSelectedTable === 'budget' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <div className="leading-tight">
                          <span className="text-xs block">Distribución de Límites</span>
                          <span className="text-[10px] text-slate-450 font-mono">finanzas_presupuesto_{currentUser?.username || 'glory'}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-full font-mono">
                        ${budget.total.toLocaleString()}
                      </span>
                    </button>

                    {/* Chat history Table */}
                    <button
                      onClick={() => setDbSelectedTable('messages')}
                      className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        dbSelectedTable === 'messages'
                          ? 'bg-blue-50 border-blue-200 text-blue-950 font-bold'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Bot className={`w-4 h-4 ${dbSelectedTable === 'messages' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <div className="leading-tight">
                          <span className="text-xs block">Historial de Chat de AI</span>
                          <span className="text-[10px] text-slate-450 font-mono">finanzas_mensajes_{currentUser?.username || 'glory'}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full font-mono font-medium font-bold">
                        {chatMessages.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right Side Content Terminal Console */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">Clave de Almacenamiento Seleccionada:</span>
                      <code className="text-xs font-black text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-mono block sm:inline-block">
                        {currentDbView.title}
                      </code>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Buscar en JSON..."
                          value={dbSearchQuery}
                          onChange={(e) => setDbSearchQuery(e.target.value)}
                          className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 w-36 sm:w-44 font-semibold text-slate-850"
                        />
                        {dbSearchQuery && (
                          <button
                            onClick={() => setDbSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent cursor-pointer p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleCopyToClipboard(JSON.stringify(currentDbView.content, null, 2))}
                        className="p-1.5 sm:p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer transition flex items-center justify-center text-slate-750 gap-1 shrink-0"
                        title="Copiar contenido JSON completo"
                      >
                        {dbCopiedNotification ? (
                          <Check className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                        ) : (
                          <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="text-[11px] font-black hidden sm:inline">{dbCopiedNotification ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic px-1 font-semibold leading-relaxed">
                    * {currentDbView.description}
                  </p>

                  {/* Dark Terminal Frame */}
                  <div className="bg-slate-900 rounded-2xl relative border border-slate-950 overflow-hidden shadow-inner flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-900 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-[10px] text-slate-400 font-extrabold font-mono ml-1.5 truncate">
                          local_browser_db://{currentUser?.username || 'glory'}/{currentDbView.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-450 font-mono bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded-md font-black shrink-0">
                        {Array.isArray(currentDbView.content) ? `${currentDbView.content.length} registros` : 'Objeto único'}
                      </span>
                    </div>

                    <div className="p-4 overflow-auto max-h-80 text-left selection:bg-blue-900 selection:text-white bg-slate-900">
                      <pre className="text-[11px] font-mono leading-relaxed text-blue-400 overflow-x-auto whitespace-pre-wrap">
                        <code>{JSON.stringify(currentDbView.content, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © 2026 Glory-Dev • FinanzAsistente AI. Local-first, inteligente y seguro. Todos los cálculos se efectúan en tiempo real.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-500 font-mono tracking-wider">MODO INTELIGENTE ACTIVO</span>
          </div>
        </div>
      </footer>

      {/* CLEAR DATA CONFIRMATION MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden animate-scaleIn">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {lang === 'en' ? 'Reset All Private Database?' : '¿Restablecer Base de Datos en Ceros?'}
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {lang === 'en' 
                ? 'Are you sure you want to flush all transactions, custom budget configurations, and AI chat memory? Your local browser wallet will start back from $0. This action is permanent and cannot be undone.'
                : '¿Estás seguro de que deseas vaciar todos los gastos cargados, topes de presupuestos y tu memoria conversacional con la AI? Volverás a empezar completamente desde $0 en ceros. Esta acción es definitiva e irreversible.'}
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 animate-pulse hover:animate-none"
              >
                <Trash2 className="w-4 h-4" />
                <span>{lang === 'en' ? 'Yes, Reset' : 'Sí, Borrar Todo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DATA TREATMENT / PRIVACY POLICY MODAL (Ley 1581 de 2012) */}
      {showDataTreatmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative overflow-hidden animate-scaleIn max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3 text-blue-600">
                <div className="p-2.5 bg-blue-50 rounded-2xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {lang === 'en' ? 'Personal Data Treatment Policy' : 'Política de Tratamiento de Datos Personales'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mt-0.5">
                    {lang === 'en' ? 'In Compliance with Habeas Data Standards' : 'De conformidad con la Ley 1581 de 2012 / Habeas Data'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDataTreatmentModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-705 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed font-semibold pr-2 text-left flex-1">
              <section className="space-y-1.5">
                <h4 className="text-sm font-extrabold text-slate-805">
                  {lang === 'en' ? '1. Scope and Controller of the Treatment' : '1. Ámbito de Aplicación y Responsable'}
                </h4>
                <p>
                  {lang === 'en'
                    ? 'This Authorization and Policy rule the processing of financial transaction records, credentials, budgets, and chat history of users inside the FinanzAsistente AI environment. The application acts as a processor and local administrator of your data, guaranteeing your right of Habeas Data.'
                    : 'La presente política regula el almacenamiento, recolección y procesamiento de los registros de gastos, ingresos, presupuestos, credenciales de inicio de sesión e historial de chat de los usuarios dentro de la plataforma FinanzAsistente AI. La aplicación actúa como responsable y administradora de los datos personales ingresados, garantizando la seguridad bajo estrictos estándares de confidencialidad y control.'}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="text-sm font-extrabold text-slate-805">
                  {lang === 'en' ? '2. Purpose of Data Collection' : '2. Finalidad de la Recolección y Procesamiento'}
                </h4>
                <p>
                  {lang === 'en' ? 'Your personal financial information is processed strictly for the following actions:' : 'Sus datos personales y financieros son tratados única y exclusivamente para cumplir con las siguientes finalidades:'}
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-500 font-medium">
                  <li>{lang === 'en' ? 'Structure and record manually entered daily expenses with category categorization.' : 'Registrar y organizar de forma estructurada sus egresos para la autogestión de sus finanzas corporativas o del día a día.'}</li>
                  <li>{lang === 'en' ? 'Compute totals, statistical summaries, and dynamic alerts when you overpass categories configuration limits.' : 'Calcular indicadores en tiempo real, resúmenes analíticos mensuales y dar alertas dinámicas ante excesos de presupuesto.'}</li>
                  <li>{lang === 'en' ? 'Process text prompts (via NLP) and receipt images (via Gemini Vision SDK) in real-time to automate data inputs.' : 'Procesar su lenguaje coloquial (NLP) y fotos de tiquetes de compra (Gemini Vision) para clasificar y rellenar automáticamente sus transacciones.'}</li>
                  <li>{lang === 'en' ? 'Provide personalized and dynamic saving hacks, chats, challenges, and advices filtered by your history database.' : 'Responder consultas y suministrar consejos prácticos, retos de ahorro y tips financieros contextualizados en base a su historial.'}</li>
                  <li>{lang === 'en' ? 'Synchronize your encrypted credentials and user statistics across multiple devices if Cloud Sync is active.' : 'Guardar y sincronizar tus credenciales encriptadas y transacciones entre dispositivos de forma segura si activas el almacenamiento en la nube.'}</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="text-sm font-extrabold text-slate-805">
                  {lang === 'en' ? '3. Data Storage (Where is your info saved?)' : '3. Dónde se Guardan tus Datos y Medidas de Privacidad'}
                </h4>
                <p>
                  {lang === 'en'
                    ? 'FinanzAsistente operates under a secure Local-First architecture by default. If you interact offline or without logging in, your data is saved solely in the private memory space of your browser (localStorage). Under this model, no external servers get access to your raw database. On the other hand, if you toggle Cloud Storage, your records are transmitted securely to a protected Google Cloud Firebase Firestore database, filtered under your user hash so that only you have permission to query, access, or modify them.'
                    : 'La plataforma implementa un esquema dual de persistencia enfocado en la privacidad del usuario. Por defecto, funciona bajo el paradigma Local-First, lo que significa que si prefiere operar en modo local o sin loguearse todas las transacciones se almacenan directamente y de forma física en la memoria privada de su propio navegador de internet (localStorage). Bajo este modelo, ningún tercero o servidor centralizado puede recopilar sus registros. Por su parte, si activa la casilla "Sincronización en la Nube", los registros se transmitirán de forma encriptada a una base de datos segura de Google Cloud (Firebase Firestore), filtrada e indexada bajo el Hash de su usuario para garantizar que nadie más tenga acceso a sus números.'}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="text-sm font-extrabold text-slate-805">
                  {lang === 'en' ? '4. Your Rights and Data Deletion (Habeas Data)' : '4. Derechos del Titular y Supresión de Datos'}
                </h4>
                <p>
                  {lang === 'en'
                    ? 'Under global personal data policies (like Colombian Law 1581 of 2012), you remain the absolute owner of your information. You hold the right to access, edit, update, retrieve, or completely delete your profile database. FinanzAsistente includes an action button called "Reset All" inside your Settings directory, allowing you to trigger a complete purge that wipes clean every record from your localStorage space and Firebase Firestore database instantly.'
                    : 'De acuerdo con la legislación sobre protección de datos personales (incluyendo la Ley 1581 de 2012 de Colombia), usted es el único dueño de su información y tiene el derecho constitucional de conocer, actualizar, rectificar y suprimir sus registros en cualquier momento. Para facilitar el ejercicio de este derecho, FinanzAsistente incluye una herramienta de "Acciones de Datos" en el menú de Ajustes, la cual permite realizar un borrado total inmediato que purgará permanentemente toda su información del navegador e instancias en la nube (Firestore) en un solo clic, sin dejar rastros.'}
                </p>
              </section>

              <section className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-700">
                  {lang === 'en'
                    ? '✓ By creating an account, you authorize the processing of your data strictly for internal calculations and conversational support within the limits details of this policy.'
                    : '✓ Al crear tu cuenta e ingresar datos a la aplicación, aceptas y autorizas de forma voluntaria, libre e informada el tratamiento de tus datos financieros únicamente para las rutinas de cálculo interno y el soporte conversacional del FinanzAsistente.'}
                </p>
              </section>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAcceptedDataTreatment(true);
                  setShowDataTreatmentModal(false);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/10 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'en' ? 'Authorize and Accept' : 'Autorizar y Aceptar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER MANUAL INTERACTIVE BOOK MODAL */}
      {showUserManualModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 relative overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3 text-blue-600">
                <div className="p-2.5 bg-blue-50 rounded-2xl">
                  <HelpCircle className="w-6 h-6 text-blue-600 animate-bounce" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {lang === 'en' ? 'Interactive Guide & User Manual' : 'Guía de Manejo e Instrucciones de Uso'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mt-0.5">
                    {lang === 'en' ? 'Learn to master your personal finance platform' : 'Aprende a dominar tu herramienta FinanzAsistente AI'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUserManualModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-705 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Manual Body */}
            <div className="overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed pr-2 text-left flex-1 font-semibold">
              
              {/* Introduction Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Wallet className="w-4 h-4 shrink-0" />
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                      {lang === 'en' ? 'What is FinanzAsistente AI?' : '¿Qué es FinanzAsistente AI?'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {lang === 'en'
                      ? 'It is an offline-first financial platform empowered with Gemini AI. It allows you to log hourly expenses, define spending limits/budgets per categories ($ COP) and audit your money conversations with an artificial helper.'
                      : 'Es un gestor inteligente de finanzas personales que opera con filosofía Local-First y combina la potencia de la Inteligencia Artificial de Google (Gemini) para auditar, automatizar e interpretar la salud de sus cuentas mensuales en pesos colombianos ($ COP) u otras divisas.'}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Database className="w-4 h-4 shrink-0" />
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                      {lang === 'en' ? 'Where is my information stored?' : '¿Dónde se guarda tu información?'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {lang === 'en'
                      ? 'By default, everything lives privately in your browser (LocalStorage) so no data leaves your command. If you activate Cloud Sincronization, we synchronize statistics transparently into Google Firestore (Cloud Run database) based on your user.'
                      : 'Por defecto, de forma local y offline en el almacenamiento privado de su navegador de internet (localStorage). Si prefiere sincronizar sus estadísticas de forma permanente y entre múltiples dispositivos, el sistema sincroniza su perfil con la base de datos centralizada de Google Firestore (en la nube) asociada a su usuario.'}
                  </p>
                </div>
              </div>

              {/* Core Features Accordion list */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-505" />
                  <span>{lang === 'en' ? 'Core Operation & Smart Features' : 'Operaciones Esenciales y Funcionalidades Inteligentes'}</span>
                </h4>

                {/* Feature 1: Manual vs Smart Text Inputs */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <h5 className="font-extrabold text-xs">{lang === 'en' ? '1. Adding Expenses (Manual & Intelligent NLP)' : '1. Alimentación de Gastos (Manual e Ingreso NLP Coloquial)'}</h5>
                  </div>
                  <div className="pl-4 space-y-1 text-slate-500 font-medium">
                    <p>
                      <strong>{lang === 'en' ? 'Manual Input : ' : 'Entrada Manual: '}</strong>
                      {lang === 'en'
                        ? 'Under the Dashboard section, use the left side form to type description, select custom Category, select Expense Date and add specific tags.'
                        : 'En la tarjeta de la izquierda del panel, digita la descripción, categoría, valor numérico de tu compra y añade etiquetas útiles para organizar tus egresos.'}
                    </p>
                    <p className="mt-1">
                      <strong>{lang === 'en' ? 'Natural Language Input : ' : 'Entrada Inteligente por Lenguaje Natural: '}</strong>
                      {lang === 'en'
                        ? 'Just paste or write free text like "Yesterday paid 35000 cop on transport food" and press Enter. Gemini AI automatically parses and returns a structured record (Amount: $35,000, Category: Transportation) for your rapid validation.'
                        : 'Simplemente redacta de forma coloquial un párrafo en la barra inteligente (ej. "Ayer almorcé una bandeja paisa deliciosa por 28 mil pesos en el portal") y FinanzAsistente interpretará el valor ($28.000), la fecha (el día de ayer) y la categoría (Alimentación) de forma instantánea.'}
                    </p>
                  </div>
                </div>

                {/* Feature 2: Vision Image Receipts */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <h5 className="font-extrabold text-xs">{lang === 'en' ? '2. Optical Receipt Camera parsing with Gemini Vision' : '2. Lector Óptico de Fotos de Recibos y Facturas con Gemini Vision'}</h5>
                  </div>
                  <div className="pl-4 text-slate-500 font-medium">
                    <p>
                      {lang === 'en'
                        ? 'You can drag-and-drop or select any file snapshot of your physical market receipt. Pressing "Analyze Photo" leverages Gemini Vision SDK to extract: establishment name, purchase date, total amount, and item breakdown. You can select individual item rows to register selective items with a single button.'
                        : 'Sube una fotografía de tu recibo físico de mercado, combustible o restaurante. Presiona "Analizar Foto con AI" y de forma automatizada la Inteligencia Artificial escaneará y extraerá: el nombre del negocio, la fecha, el importe total, y un listado línea por línea de los productos adquiridos. Podrás elegir del listado de artículos cuáles deseas incorporar a tu histórico con un clic.'}
                    </p>
                  </div>
                </div>

                {/* Feature 3: Budgets */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <h5 className="font-extrabold text-xs">{lang === 'en' ? '3. Budget Controls & Overspending Alerts' : '3. Configuración de Presupuestos y Semáforos de Límites'}</h5>
                  </div>
                  <div className="pl-4 text-slate-550 space-y-1 font-medium">
                    <p>
                      {lang === 'en'
                        ? 'Using the "Settings" tab, configure your General Monthly Budget and share specific limits for sub-categories. The dashboard maps dynamic charts showing real-time distribution percentages and triggers orange warning tags if category limits get exceeded.'
                        : 'En la pestaña "Ajustes", configura tu Presupuesto Mensual Global y subdivídelo en las categorías operativas (Alimentación, Tecnología, Hogar, etc.). El panel principal y los gráficos adaptarán semáforos de advertencia en naranja si el porcentaje de ejecución rebasa tus metas financieras.'}
                    </p>
                  </div>
                </div>

                {/* Feature 4: AI Advisor Chats */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <h5 className="font-extrabold text-xs">{lang === 'en' ? '4. Chat with your Smart AI Financial Butler' : '4. Consultas y Chat Auditor Permanente con la IA'}</h5>
                  </div>
                  <div className="pl-4 text-slate-500 font-medium">
                    <p>
                      {lang === 'en'
                        ? 'Navigate to "AI Advisor" tab to audit. You have three quick-auditing triggers (major expenditures, saving hacks, and saving weekly challenges), or query anything to the prompt box. Gemini processes the query holding your records context to resolve specific questions securely.'
                        : 'En la pestaña de "Asesor AI" dispones de tres disparadores de auditoría automáticos (analizar mayor nivel de gastos, consejos prácticos rápidos de ahorro, y desafíos semanales), además de una barra de chat libre. La IA de Gemini analizará de forma segura tus transacciones previas para responderte preguntas de tus números exactos en segundos.'}
                    </p>
                  </div>
                </div>

                {/* Database Inspector */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <h5 className="font-extrabold text-xs">{lang === 'en' ? '5. Database Inspector' : '5. Inspector Físico de Base de Datos (JSON)'}</h5>
                  </div>
                  <div className="pl-4 text-slate-500 font-medium">
                    <p>
                      {lang === 'en'
                        ? 'Located at Settings, it maps the raw JSON storage of every collection (expenses, users, messages, sessions). You can filter contents, copy JSON details to clipboard, and reset or restore demo states with absolute transparency.'
                        : 'En la base de la pestaña de Ajustes se ubica un inspector físico interactivo de datos. Podrás examinar el JSON en crudo de tu información del navegador y de la nube (gastos cargados, historiales de chat, límites de presupuesto) para copiarlo al portapapeles, o borrarlo todo, brindando máxima transparencia.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Treatment Integration Shortcut */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <h5 className="font-black text-slate-800 text-xs flex items-center gap-1.5 leading-none">
                    <FileText className="w-4 h-4 text-blue-600" />
                    {lang === 'en' ? 'Habeas Data & Protection' : 'Habeas Data & Protección de Datos Personales'}
                  </h5>
                  <p className="text-[10px] text-slate-505 font-medium">
                    {lang === 'en'
                      ? 'We implement robust measures to protect your rights ( Colombian Law 1581 of 2012). Click to check detailed handling, processor actions, and deletion options.'
                      : 'Implementamos estrictas directrices de acuerdo a la Ley 1581 de 2012 para salvaguardar tu privacidad financiera. Consulta los detalles de control, supresión y procesamiento.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserManualModal(false);
                    setShowDataTreatmentModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 hover:-translate-y-0.5 text-[10px] duration-150 transition-all font-bold rounded-xl shadow-md cursor-pointer shrink-0"
                >
                  {lang === 'en' ? 'Display Data Treatment Policy' : 'Consultar Autorización de Datos'}
                </button>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowUserManualModal(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/10 transition cursor-pointer"
              >
                {lang === 'en' ? 'Got it' : 'Entendido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

