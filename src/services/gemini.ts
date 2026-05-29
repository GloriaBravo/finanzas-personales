import { Expense, Budget, ParsedExpenseResponse, AnalyzedReceiptResponse, ReceiptItem } from '../types';
import { CATEGORIES } from '../constants';

/**
 * Procesa un texto natural para parsearlo en un gasto en pesos colombianos.
 * Ejemplo: "Ayer gasté 45.000 en el Éxito" -> { amount: 45000, description: "Éxito", category: "Comida", date: "..." }
 */
export async function parseExpenseWithAI(text: string, todayDate: string): Promise<ParsedExpenseResponse> {
  try {
    const res = await fetch("/api/gemini/parse-expense", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, todayDate })
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.success !== undefined) {
      return data as ParsedExpenseResponse;
    }
    return fallbackLocalParser(text, todayDate);
  } catch (error) {
    console.warn("Fallo el parseo remoto con Gemini, usando fallback local:", error);
    return fallbackLocalParser(text, todayDate);
  }
}

/**
 * Obtener un análisis financiero conversacional de presupuesto y gastos actuales en pesos colombianos.
 */
export async function getFinancialAdviceStream(
  expenses: Expense[],
  budget: Budget,
  messages: { role: 'user' | 'model'; text: string }[],
  onChunk: (text: string) => void,
  lang: 'es' | 'en' = 'es'
): Promise<string> {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Resumen por categoría
  const categorySpentMap: Record<string, number> = {};
  expenses.forEach(e => {
    categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + e.amount;
  });

  try {
    const res = await fetch("/api/gemini/financial-advice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ expenses, budget, messages, lang })
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) {
      throw new Error("No reader available in body stream");
    }

    let fullAdviceText = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.error) {
              console.warn("Remoto reportó error, usando fallback local:", parsed.error);
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              fullAdviceText = parsed.text;
              onChunk(fullAdviceText);
            }
          } catch (e) {
            // Ignorar errores menores de parsing intermedio
          }
        }
      }
    }

    if (!fullAdviceText) {
      throw new Error("Empty response from server-side advice stream.");
    }

    return fullAdviceText;

  } catch (error) {
    console.warn("Fallo el advice por streaming remoto, usando simulación de fallback local:", error);
    
    // Simular streaming de fallback inteligente local de forma instantánea
    const fallbackResponse = getLocalAdviceFallback(messages[messages.length - 1]?.text || "", totalSpent, budget, categorySpentMap, lang);
    
    // Simular efecto de streaming dividiendo el texto para animarlo en trozos
    const words = fallbackResponse.split(' ');
    let currentText = "";
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      onChunk(currentText);
      await new Promise(resolve => setTimeout(resolve, 8)); // Pequeña espera para imitar streaming
    }
    return fallbackResponse;
  }
}

/**
 * Fallback local cuando no hay conexión a internet o falta la API_KEY.
 * Diseñado con soporte de pesos colombianos (COP).
 */
function fallbackLocalParser(text: string, todayDate: string): ParsedExpenseResponse {
  const normalized = text.toLowerCase().trim();
  
  // Limpieza inicial para palabras de cantidades colombianas ("mil", "k", "luca", "lucas", "palo", "palos")
  let amount = 15000; // Por defecto
  
  // Buscar palabras de escala Estilo Colombia
  const normalizedTextCleaned = normalized
    .replace(/(\d+)\s*(mil|k|lucas|luca)\b/gi, (_, val) => `${val}000`)
    .replace(/\b1\s*(palo|millon|millón)\b/gi, "1000000")
    .replace(/\b(\d+)\s*(palos|millones)\b/gi, (_, val) => `${val}000000`);

  const numbersGuerilla = normalizedTextCleaned.match(/\b\d+([\.,]\d+)?\b/g);
  if (numbersGuerilla) {
    const candidate = numbersGuerilla.find(num => {
      let cleanNum = num;
      if (num.includes('.') && num.split('.')[1].length === 3) {
        cleanNum = num.replace('.', '');
      } else if (num.includes(',') && num.split(',')[1].length === 3) {
        cleanNum = num.replace(',', '');
      }
      const val = parseInt(cleanNum);
      return val > 200 && val < 10000000;
    });

    if (candidate) {
      let cleanCandidate = candidate;
      if (candidate.includes('.') && candidate.split('.')[1].length === 3) {
        cleanCandidate = candidate.replace('.', '');
      } else if (candidate.includes(',') && candidate.split(',')[1].length === 3) {
        cleanCandidate = candidate.replace(',', '');
      }
      amount = parseInt(cleanCandidate);
    } else {
      const smallNum = parseInt(numbersGuerilla[0]);
      if (smallNum > 0 && smallNum <= 500) {
        amount = smallNum * 1000;
      }
    }
  }

  // Detectar categoría a través de palabras clave
  let category = 'Otros';
  if (/(comida|restaurante|cena|almuerzo|desayuno|burger|pizza|mercadona|carrefour|super|exito|carulla|olimpica|ara|d1|corrientazo|valdez|cafe|cafeteria|pan|merienda|bar|tapa|frisby|crepes|hamburguesa|empanada|tinto)/.test(normalized)) {
    category = 'Comida';
  } else if (/(bus|metro|autobus|gasolina|gasolineria|combustible|uber|cabify|taxi|peaje|tren|viaje|parking|coche|carro|transmilenio|sitp|didi|transmi)/.test(normalized)) {
    category = 'Transporte';
  } else if (/(cine|netflix|spotify|hbo|disney|ocio|concierto|fútbol|futbol|juego|playstation|steam|suscripcion|copa|cerveza|pub|discoteca|rumba)/.test(normalized)) {
    category = 'Entretenimiento';
  } else if (/(alquiler|luz|agua|gas|hogar|mueble|reparacion|limpieza|electricista|fontanero|comunidad|piso|arriendo|vanti|codensa|enel|claro|tigo_movistar)/.test(normalized)) {
    category = 'Hogar';
  } else if (/(medico|dentista|farmacia|pastilla|gimnasio|gym|entrenamiento|doctor|salud|crossfit|drogueria|verde|rebaja)/.test(normalized)) {
    category = 'Salud';
  } else if (/(libro|curso|escuela|colegio|universidad|udemy|coursera|matricula|papel|boligrafo|cuaderno)/.test(normalized)) {
    category = 'Educación';
  } else if (/(movil|telefono|teclado|raton|auriculares|cascos|software|ordenador|pc|laptop|gadget|celular)/.test(normalized)) {
    category = 'Tecnología';
  }

  // Detectar fecha
  let date = todayDate;
  if (normalized.includes('ayer')) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().split('T')[0];
  } else if (normalized.includes('anteayer') || normalized.includes('hace dos días') || normalized.includes('hace 2 dias')) {
    const past = new Date();
    past.setDate(past.getDate() - 2);
    date = past.toISOString().split('T')[0];
  }

  // Intentar deducir concepto limpiando partes conocidas
  let description = text;
  if (numbersGuerilla) {
    numbersGuerilla.forEach(num => {
      description = description.replace(num, '');
    });
  }
  description = description
    .replace(/(euros|euro|eur|€|pesos|peso|cop|lucas|luca|mil|palos|palo|gaste|gasté|añade|pon|compre|compré|pague|pagué|en el|en la|en|de|ayer|hoy|anteayer|hace \d+ dias|hace \d+ días)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!description) {
    description = `Gasto de ${CATEGORIES.find(c => c.id === category)?.name || 'Categoría ' + category}`;
  } else {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  return {
    description,
    amount,
    category,
    date,
    success: true
  };
}

/**
 * Provee respuestas predefinidas locales en pesos colombianos para la simulación del chat.
 */
function getLocalAdviceFallback(query: string, totalSpent: number, budget: Budget, spentByCategory: Record<string, number>, lang: 'es' | 'en' = 'es'): string {
  const norm = query.toLowerCase();
  const rest = budget.total - totalSpent;
  const percentage = budget.total > 0 ? (totalSpent / budget.total) * 100 : 0;

  // Encontrar la categoría con mayor gasto
  let highestCategory = 'Ninguna';
  let maxSpent = 0;
  Object.entries(spentByCategory).forEach(([cat, val]) => {
    if (val > maxSpent) {
      maxSpent = val;
      highestCategory = cat;
    }
  });

  const hCatTheme = CATEGORIES.find(c => c.id === highestCategory);
  let highestCatName = hCatTheme ? hCatTheme.name : highestCategory;
  if (lang === 'en' && hCatTheme) {
    highestCatName = hCatTheme.id === 'Comida' ? 'Food & Groceries' 
      : hCatTheme.id === 'Transporte' ? 'Transportation'
      : hCatTheme.id === 'Entretenimiento' ? 'Entertainment'
      : hCatTheme.id === 'Hogar' ? 'Rent & Utilities'
      : hCatTheme.id === 'Salud' ? 'Health & Care'
      : hCatTheme.id === 'Educación' ? 'Education'
      : hCatTheme.id === 'Tecnología' ? 'Technology'
      : 'Others';
  }

  if (lang === 'en') {
    if (norm.includes('advice') || norm.includes('save') || norm.includes('help') || norm.includes('hello') || norm.includes('hi') || norm.includes('how am i')) {
      let advice = `👋 **Hello! I am your Colombian FinanceAssistant AI (offline mode).** 

Currently, you have consumed **${percentage.toFixed(1)}%** of your global budget ($${totalSpent.toLocaleString('es-CO')} COP out of a $${budget.total.toLocaleString('es-CO')} COP limit). You have **$${rest.toLocaleString('es-CO')} COP** remaining for this month.

`;

      if (percentage > 90) {
        advice += `🚨 **Budget Alert!** You have almost exhausted or already exceeded your monthly spending boundary. Immediately freeze non-priority expenses like restaurants, parties, or gadget impulses.\n\n`;
      } else if (percentage > 70) {
        advice += `⚠️ **Caution:** You have used over 70% of your budget. I suggest attempting a "Zero-Spend Weekend" (cook at home, relax with friends, enjoy free public parks) to bring down your daily average.\n\n`;
      } else {
        advice += `✅ **You are doing great!** Your consumption rate is fully safe and healthy. Keep managing your expenses to reach your savings target.\n\n`;
      }

      if (maxSpent > 0) {
        advice += `🔍 **Focus Area:** Your largest spending center is **${highestCatName}** with **$${maxSpent.toLocaleString('es-CO')} COP**. Reducing your daily expenses there by just 15% would save you around $${(maxSpent * 0.15).toLocaleString('es-CO')} COP to build your emergency fund.\n\n`;
      }

      advice += `💡 **Colombian Financial Therapy:** Use the **50/30/20 Rule**:
1. **50% Needs**: Rent, basic groceries, utilities (EPM, Codensa), essential transportation.
2. **30% Wants**: Meetups, eating out, streaming subscriptions, tech gadgets.
3. **20% Direct Savings**: Save this immediately as soon as you receive your monthly income. Don't save what is left after spending, spend what is left after saving!`;

      return advice;
    }

    if (norm.includes('categor') || norm.includes('breakdown') || norm.includes('summary')) {
      let analysis = `📊 **Your Expense Breakdown per Category (in COP):**\n\n`;
      
      CATEGORIES.forEach(c => {
        const g = spentByCategory[c.id] || 0;
        const bObj = budget.byCategory.find(cb => cb.category === c.id);
        const b = bObj ? bObj.amount : 0;
        const progressPct = b > 0 ? (g / b) * 100 : 0;
        
        const statusSymbol = progressPct > 100 ? '🔴 Exceeded' : progressPct > 80 ? '🟡 At Limit' : '🟢 Safe';
        const engName = c.id === 'Comida' ? 'Food & Groceries' 
          : c.id === 'Transporte' ? 'Transportation'
          : c.id === 'Entretenimiento' ? 'Entertainment'
          : c.id === 'Hogar' ? 'Rent & Utilities'
          : c.id === 'Salud' ? 'Health & Care'
          : c.id === 'Educación' ? 'Education'
          : c.id === 'Tecnología' ? 'Technology'
          : 'Others';
        analysis += `- **${engName}**: Spent: $${g.toLocaleString('es-CO')} COP / Limit: $${b.toLocaleString('es-CO')} COP (${progressPct.toFixed(0)}%) - *Status: ${statusSymbol}*\n`;
      });

      return analysis;
    }

    return `🤖 **FinanceAssistant AI** is here listening to you.

I've analyzed your entries. Your current available balance is **$${rest.toLocaleString('es-CO')} COP**.

Here are some questions you can ask me:
- *"How am I doing with my rent and utility bills this month?"*
- *"Suggest a weekly savings challenge to fight daily coffee leaks"*
- *"What has been my spending pattern in ${highestCatName}?"*
- *"Give me guidelines on the 50/30/20 rule"*

*Tip: For advanced deep analysis with reasoning, remember to configure your GEMINI_API_KEY secret in the settings panel.*`;
  }

  if (norm.includes('consejo') || norm.includes('ahorrar') || norm.includes('ayuda') || norm.includes('hola') || norm.includes('¿cómo voy')) {
    let advice = `👋 **¡Hola! Soy tu FinanzAsistente AI colombiano (remoto).** 

Actualmente has consumido el **${percentage.toFixed(1)}%** de tu presupuesto total ($${totalSpent.toLocaleString('es-CO')} COP de un límite de $${budget.total.toLocaleString('es-CO')} COP). Te quedan disponibles **$${rest.toLocaleString('es-CO')} COP** para gastar este mes.

`;

    if (percentage > 90) {
      advice += `🚨 **¡Alerta de bolsillo!** Estás muy cerca de sobrepasar tu presupuesto o ya lo superaste. Congela inmediatamente gastos no prioritarios como restaurantes gourmet, rumba o antojos tecnológicos.\n\n`;
    } else if (percentage > 70) {
      advice += `⚠️ **Pasos de precaución:** Llevas más del 70% ejecutado. Te sugiero intentar un "fin de semana de gasto cero" (planes en casa, parques públicos, cocinar juntos) para bajar el promedio diario.\n\n`;
    } else {
      advice += `✅ **¡Vas muy bien parce!** Tu ritmo de consumo está perfectamente controlado y saludable. Continúa administrando los egresos para cumplir tu meta de ahorro mensual.\n\n`;
    }

    if (maxSpent > 0) {
      advice += `🔍 **Foco de atención:** Tu mayor centro de egreso es **${highestCatName}** donde has invertido **$${maxSpent.toLocaleString('es-CO')} COP**. Si logras reducir apenas un 15% los gastos cotidianos ahí, te estarías guardando cerca de $${(maxSpent * 0.15).toLocaleString('es-CO')} COP adicionales para tu fondo de imprevistos.\n\n`;
    }

    advice += `💡 **Terapia Financiera Colombiana:** Usa la regla **50/30/20**:
1. **50% Necesidades**: Arriendo, mercado indispensable, servicios (EPM, Codensa), transporte.
2. **30% Deseos**: Salidas con amigos, comida rápida (El Corral), streaming, tecnología.
3. **20% Ahorro Directo**: Guárdalo apenas recibas tu sueldo o ingresos fijos. ¡No ahorres lo que te sobra, gasta lo que te sobra una vez hayas ahorrado!`;

    return advice;
  }

  if (norm.includes('categor') || norm.includes('desglose') || norm.includes('resumen')) {
    let analysis = `📊 **Desglose de tus Gastos por Categoría (en COP):**\n\n`;
    
    CATEGORIES.forEach(c => {
      const g = spentByCategory[c.id] || 0;
      const bObj = budget.byCategory.find(cb => cb.category === c.id);
      const b = bObj ? bObj.amount : 0;
      const progressPct = b > 0 ? (g / b) * 100 : 0;
      
      const statusSymbol = progressPct > 100 ? '🔴 Excedido' : progressPct > 80 ? '🟡 Al límite' : '🟢 Seguro';
      analysis += `- **${c.name}**: Gastado: $${g.toLocaleString('es-CO')} COP / Límite: $${b.toLocaleString('es-CO')} COP (${progressPct.toFixed(0)}%) - *Estado: ${statusSymbol}*\n`;
    });

    return analysis;
  }

  return `🤖 **FinanzAsistente AI** está escuchándote.

He analizado tus transacciones del mes. Tu balance actual disponible es de **$${rest.toLocaleString('es-CO')} COP**.

Aquí algunas preguntas que me puedes hacer en español de Colombia:
- *"¿Cómo voy con mi arriendo y servicios públicos este mes?"*
- *"Sugiéreme un reto de ahorro semanal para ganarle a los gastos hormiga"*
- *"¿Cuál ha sido mi comportamiento de compras en ${highestCatName}?"*
- *"Dame pautas sobre la regla 50/30/20"*

*Tip: Si deseas análisis sumamente profundos con razonamiento avanzado de la API de Gemini, recuerda configurar tu clave de secretos GEMINI_API_KEY en la configuración del editor.*`;
}

/**
 * Analiza detalladamente una imagen de factura/receipt (base64) para desglosar sus artículos por categoría.
 */
export async function analyzeInvoiceImageWithAI(
  base64Image: string,
  mimeType: string,
  todayDate: string
): Promise<AnalyzedReceiptResponse> {
  try {
    const res = await fetch("/api/gemini/analyze-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ base64Image, mimeType, todayDate })
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.establishmentName && data.items) {
      const itemsWithIds: ReceiptItem[] = (data.items || []).map((item: any, idx: number) => ({
        id: `rcpt-item-${Date.now()}-${idx}`,
        description: item.description || "Gasto de factura",
        amount: Math.round(Number(item.amount) || 0),
        category: item.category || "Otros",
        date: item.date || todayDate,
        selected: true
      }));

      return {
        establishmentName: data.establishmentName || "Comercio Local",
        totalAmount: Math.round(Number(data.totalAmount) || itemsWithIds.reduce((sum, item) => sum + item.amount, 0)),
        date: data.date || todayDate,
        items: itemsWithIds,
        isMock: false
      };
    }
    return getLocalInvoiceFallback(todayDate);
  } catch (error) {
    console.warn("Fallo el análisis de imagen remoto, usando fallback local:", error);
    return getLocalInvoiceFallback(todayDate);
  }
}

/**
 * Retorna datos de fallback realistas en Pesos Colombianos para simular el análisis de la foto.
 */
function getLocalInvoiceFallback(todayDate: string): AnalyzedReceiptResponse {
  const selectedItems: ReceiptItem[] = [
    {
      id: `rcpt-item-fb-1-${Date.now()}`,
      description: "Leche Colanta Larga Vida 1L",
      amount: 4500,
      category: "Comida",
      date: todayDate,
      selected: true
    },
    {
      id: `rcpt-item-fb-2-${Date.now()}`,
      description: "Papel Higiénico Familia 4 Rollos",
      amount: 7800,
      category: "Hogar",
      date: todayDate,
      selected: true
    }
  ];

  return {
    establishmentName: "Supermercado Éxito / Ara / D1 (Offline Fallback)",
    totalAmount: 12300,
    date: todayDate,
    items: selectedItems,
    isMock: true
  };
}
