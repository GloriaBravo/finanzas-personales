import { Expense } from './types';

export interface CategoryTheme {
  id: string;
  name: string;
  color: string;      // Tailwind Class Name (e.g. 'emerald')
  bgClass: string;     // bg-emerald-50 etc
  borderClass: string; // border-emerald-200
  textClass: string;   // text-emerald-700
  accentBg: string;    // bg-emerald-500
  icon: string;        // Lucide icon key name
}

export const CATEGORIES: CategoryTheme[] = [
  {
    id: 'Comida',
    name: 'Alimentación',
    color: 'amber',
    bgClass: 'bg-amber-50/70 border-amber-200 text-amber-700 hover:bg-amber-100/50',
    borderClass: 'border-amber-100',
    textClass: 'text-amber-600',
    accentBg: 'bg-amber-500',
    icon: 'Utensils',
  },
  {
    id: 'Transporte',
    name: 'Transporte',
    color: 'blue',
    bgClass: 'bg-blue-50/70 border-blue-200 text-blue-700 hover:bg-blue-100/50',
    borderClass: 'border-blue-100',
    textClass: 'text-blue-600',
    accentBg: 'bg-blue-500',
    icon: 'Car',
  },
  {
    id: 'Entretenimiento',
    name: 'Ocio y Entretenimiento',
    color: 'purple',
    bgClass: 'bg-purple-50/70 border-purple-200 text-purple-700 hover:bg-purple-100/50',
    borderClass: 'border-purple-100',
    textClass: 'text-purple-600',
    accentBg: 'bg-purple-500',
    icon: 'Film',
  },
  {
    id: 'Hogar',
    name: 'Hogar y Servicios',
    color: 'rose',
    bgClass: 'bg-rose-50/70 border-rose-200 text-rose-700 hover:bg-rose-100/50',
    borderClass: 'border-rose-100',
    textClass: 'text-rose-600',
    accentBg: 'bg-rose-500',
    icon: 'Home',
  },
  {
    id: 'Salud',
    name: 'Salud y Bienestar',
    color: 'emerald',
    bgClass: 'bg-emerald-50/70 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50',
    borderClass: 'border-emerald-100',
    textClass: 'text-emerald-600',
    accentBg: 'bg-emerald-500',
    icon: 'HeartPulse',
  },
  {
    id: 'Educación',
    name: 'Educación',
    color: 'indigo',
    bgClass: 'bg-indigo-50/70 border-indigo-200 text-indigo-700 hover:bg-indigo-100/50',
    borderClass: 'border-indigo-100',
    textClass: 'text-indigo-600',
    accentBg: 'bg-indigo-500',
    icon: 'GraduationCap',
  },
  {
    id: 'Tecnología',
    name: 'Tecnología',
    color: 'cyan',
    bgClass: 'bg-cyan-50/70 border-cyan-200 text-cyan-700 hover:bg-cyan-100/50',
    borderClass: 'border-cyan-100',
    textClass: 'text-cyan-600',
    accentBg: 'bg-cyan-500',
    icon: 'Laptop',
  },
  {
    id: 'Otros',
    name: 'Otros Gastos',
    color: 'slate',
    bgClass: 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/50',
    borderClass: 'border-slate-100',
    textClass: 'text-slate-600',
    accentBg: 'bg-slate-500',
    icon: 'MoreHorizontal',
  },
];

// Generar fechas relativas al mes y año actual en pesos colombianos para 3 meses
const getRelativeDate = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString().split('T')[0];
};

export const INITIAL_EXPENSES: Expense[] = [
  // --- MES ACTUAL (Normalmente MAYO 2026) ---
  {
    id: 'exp-col-1',
    description: 'Café Juan Valdez y Buñuelo',
    amount: 12500,
    category: 'Comida',
    date: getRelativeDate(0),
    tags: ['De paso', 'Café'],
  },
  {
    id: 'exp-col-2',
    description: 'Compra quincenal de mercado',
    amount: 345000,
    category: 'Comida',
    date: getRelativeDate(1),
    tags: ['Mercado', 'Familia'],
  },
  {
    id: 'exp-col-3',
    description: 'Pasajes Transmilenio Semanal',
    amount: 23600,
    category: 'Transporte',
    date: getRelativeDate(2),
    tags: ['TransportePúblico'],
  },
  {
    id: 'exp-col-4',
    description: 'Almuerzo Ejecutivo Corrientazo',
    amount: 18000,
    category: 'Comida',
    date: getRelativeDate(4),
    tags: ['Trabajo'],
  },
  {
    id: 'exp-col-5',
    description: 'Suscripción Netflix Colombia',
    amount: 44900,
    category: 'Entretenimiento',
    date: getRelativeDate(7),
    tags: ['Digital', 'Streaming'],
  },
  {
    id: 'exp-col-6',
    description: 'Factura de luz Enel Codensa',
    amount: 135000,
    category: 'Hogar',
    date: getRelativeDate(8),
    tags: ['ServiciosPub', 'Luz'],
  },
  {
    id: 'exp-col-7',
    description: 'Cena Pizzería Bella Italia',
    amount: 85000,
    category: 'Comida',
    date: getRelativeDate(11),
    tags: ['Cena', 'FinDeSemana'],
  },

  // --- MES ANTERIOR 1 (Normalmente ABRIL 2026) ---
  {
    id: 'exp-col-8',
    description: 'Medicamentos Cruz Verde',
    amount: 48000,
    category: 'Salud',
    date: getRelativeDate(14),
    tags: ['Farmacia', 'Fórmulas'],
  },
  {
    id: 'exp-col-9',
    description: 'Cine y Palomitas Centro Mayor',
    amount: 52000,
    category: 'Entretenimiento',
    date: getRelativeDate(17),
    tags: ['Salida', 'Cine'],
  },
  {
    id: 'exp-col-10',
    description: 'Tanqueada de gasolina Terpel',
    amount: 110000,
    category: 'Transporte',
    date: getRelativeDate(22),
    tags: ['Combustible', 'Carro'],
  },
  {
    id: 'exp-col-11',
    description: 'Surtido de supermercado',
    amount: 290000,
    category: 'Comida',
    date: getRelativeDate(26),
    tags: ['Mercado', 'Premium'],
  },
  {
    id: 'exp-col-12',
    description: 'Curso online Python en Udemy',
    amount: 59900,
    category: 'Educación',
    date: getRelativeDate(32),
    tags: ['Aprender', 'Online'],
  },
  {
    id: 'exp-col-13',
    description: 'Suscripción Netflix Colombia (Abril)',
    amount: 44900,
    category: 'Entretenimiento',
    date: getRelativeDate(37),
    tags: ['Digital'],
  },
  {
    id: 'exp-col-14',
    description: 'Factura de agua Acueducto Bogotá',
    amount: 78000,
    category: 'Hogar',
    date: getRelativeDate(38),
    tags: ['ServiciosPub', 'Agua'],
  },
  {
    id: 'exp-col-15',
    description: 'Pasajes Transmilenio',
    amount: 30000,
    category: 'Transporte',
    date: getRelativeDate(40),
    tags: ['TransportePúblico'],
  },

  // --- MES ANTERIOR 2 (Normalmente MARZO 2026) ---
  {
    id: 'exp-col-16',
    description: 'Consulta Odontológica particular',
    amount: 90000,
    category: 'Salud',
    date: getRelativeDate(45),
    tags: ['SaludOral', 'Control'],
  },
  {
    id: 'exp-col-17',
    description: 'Mouse inalámbrico Logitech',
    amount: 85000,
    category: 'Tecnología',
    date: getRelativeDate(49),
    tags: ['Gadget', 'Computador'],
  },
  {
    id: 'exp-col-18',
    description: 'Almuerzo familiar asadero de pollos',
    amount: 42000,
    category: 'Comida',
    date: getRelativeDate(53),
    tags: ['Familia', 'Almuerzo'],
  },
  {
    id: 'exp-col-19',
    description: 'Tanqueada de gasolina carro',
    amount: 105000,
    category: 'Transporte',
    date: getRelativeDate(55),
    tags: ['Combustible'],
  },
  {
    id: 'exp-col-20',
    description: 'Suscripción mensual Netflix (Marzo)',
    amount: 44900,
    category: 'Entretenimiento',
    date: getRelativeDate(68),
    tags: ['Digital'],
  },
  {
    id: 'exp-col-21',
    description: 'Factura de Gas Vanti natural',
    amount: 32050,
    category: 'Hogar',
    date: getRelativeDate(69),
    tags: ['ServiciosPub', 'Gas'],
  },
  {
    id: 'exp-col-22',
    description: 'Hamburguesas rústicas artesanales',
    amount: 64000,
    category: 'Comida',
    date: getRelativeDate(72),
    tags: ['Cena', 'Hamburguesas'],
  },
  {
    id: 'exp-col-23',
    description: 'Compra quincenal de víveres',
    amount: 320000,
    category: 'Comida',
    date: getRelativeDate(75),
    tags: ['Mercado'],
  },
  {
    id: 'exp-col-24',
    description: 'Libro Kindle Educación Financiera',
    amount: 35000,
    category: 'Educación',
    date: getRelativeDate(80),
    tags: ['Lectura', 'Libros'],
  }
];

export const SUGGESTED_BUDGET_TOTAL = 1800000; // 1.8 millones de pesos colombianos

export const DEFAULT_CATEGORY_BUDGETS = [
  { category: 'Comida', amount: 650000 },
  { category: 'Transporte', amount: 250000 },
  { category: 'Entretenimiento', amount: 180000 },
  { category: 'Hogar', amount: 450000 },
  { category: 'Salud', amount: 120000 },
  { category: 'Educación', amount: 70000 },
  { category: 'Tecnología', amount: 100000 },
  { category: 'Otros', amount: 50000 },
];
