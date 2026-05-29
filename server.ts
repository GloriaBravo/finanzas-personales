import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
}

app.use(express.json());

// API: Intelligent categorization of bank transactions utilizing Gemini 3.5 Flash
app.post("/api/categorize-bank", async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid items array." });
    }

    if (!ai) {
      // Graceful fallback if API key is missing
      const mockedResponse = items.map((item: any) => {
        const desc = (item.description || "").toLowerCase();
        let category = "Otros Gastos";
        let cleanTitle = item.description || "Transacción Bancaria";
        let type: 'expense' | 'income' = 'expense';

        if (desc.includes("starbucks") || desc.includes("mcdonald") || desc.includes("rest") || desc.includes("pizza") || desc.includes("uber eats")) {
          category = "Alimentación";
          cleanTitle = item.description.split(" ")[0] || "Restaurante";
        } else if (desc.includes("netflix") || desc.includes("spotify") || desc.includes("disney") || desc.includes("prime")) {
          category = "Suscripciones";
          cleanTitle = item.description.split(" ")[0] || "Suscripción";
        } else if (desc.includes("uber") || desc.includes("taxi") || desc.includes("gasol") || desc.includes("metro")) {
          category = "Transporte";
          cleanTitle = desc.includes("gasol") ? "Gasolinera" : "Transporte/Uber";
        } else if (desc.includes("nomina") || desc.includes("salario") || desc.includes("pago") || desc.includes("pay") || desc.includes("sueldo") || desc.includes("transfer")) {
          category = "Salario & Ingresos";
          cleanTitle = "Nómina / Transferencia";
          type = "income";
        } else if (desc.includes("supermercado") || desc.includes("carrefour") || desc.includes("walmart") || desc.includes("oxxo") || desc.includes("merca")) {
          category = "Alimentación";
          cleanTitle = "Supermercado";
        } else if (desc.includes("luz") || desc.includes("agua") || desc.includes("gas") || desc.includes("alquiler") || desc.includes("renta") || desc.includes("hipoteca")) {
          category = "Vivienda & Servicios";
          cleanTitle = "Servicio Hogar";
        }
        return {
          id: item.id,
          category,
          cleanTitle,
          type
        };
      });
      return res.json({ categories: mockedResponse, fallback: true });
    }

    const payloadPrompt = `Por favor analiza esta lista de nombres de comercios o transacciones bancarias ruidosas y para cada elemento determina:
1. Un título limpio legible por humanos ('cleanTitle'). No uses mayúsculas sostenidas ni códigos raros.
2. La categoría financiera adecuada ('category'). Elige estrictamente entre: 'Alimentación', 'Vivienda & Servicios', 'Transporte', 'Entretenimiento & Ocio', 'Compras', 'Salud & Bienestar', 'Educación', 'Suscripciones', 'Inversiones', 'Salario & Ingresos', 'Otros Gastos'.
3. El tipo de transacción ('type'): 'expense' (gasto) o 'income' (ingreso).

Lista de transacciones: ${JSON.stringify(items.map((i: any) => ({ id: i.id, text: i.description })))}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: payloadPrompt,
      config: {
        systemInstruction: "Eres un categorizador de transacciones financieras inteligente que opera para el mercado hispanohablante. Analizas nombres de transacciones bancarias, remueves ruidos numéricos o códigos, y clasificas con precisión quirúrgica.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["categories"],
          properties: {
            categories: {
              type: Type.ARRAY,
              description: "Lista de transacciones procesadas con las categorías detectadas y títulos amigables.",
              items: {
                type: Type.OBJECT,
                required: ["id", "category", "cleanTitle", "type"],
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING, description: "La categoría exacta del movimiento" },
                  cleanTitle: { type: Type.STRING, description: "Un nombre bonito para mostrar (ej: Walmart, Netflix, Nómina)" },
                  type: { type: Type.STRING, description: "Puede ser 'expense' o 'income'." }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    const parsed = JSON.parse(resultText || "{}");
    return res.json({ categories: parsed.categories, fallback: false });
  } catch (err: any) {
    console.error("Gemini classification failed:", err);
    return res.status(500).json({ error: "Hubo un error al clasificar tus transacciones de forma inteligente." });
  }
});

// Category list used by server-side parse logic
const CATEGORY_IDS = ['Comida', 'Transporte', 'Entretenimiento', 'Hogar', 'Salud', 'Educación', 'Tecnología', 'Otros'];

// API: Parse colloquial Colombian expense text using Gemini 3.5 Flash
app.post("/api/gemini/parse-expense", async (req, res) => {
  const { text, todayDate } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing text payload" });
  }

  if (!ai) {
    return res.status(404).json({ error: "Gemini server client not configured" });
  }

  try {
    const prompt = `Analiza la siguiente frase del usuario en español que representa un gasto en PESOS COLOMBIANOS (COP) y extrae los detalles estructurados: "${text}".
    
Fecha de referencia hoy es: ${todayDate}.
Si la frase dice "ayer", calcula la fecha restando 1 día a la fecha de hoy.
Si dice "anteayer" o "hace dos días", resta 2 días, etc. Si no especifica, asume la fecha de hoy: ${todayDate}.

*CRÍTICO COLOQUIAL COLOMBIANO:* 
En Colombia es común hablar de 'mil' de forma informal. Por ejemplo, "45 mil", "45k", "45.000" o sólo "45 lucas" significan 45000 COP. "un palo" significa 1000000 COP.
Por favor extrae el valor real completo en COP (un número entero, por ejemplo, 45000, no 45 ni 45.0).

Las categorías que debes asignar obligatoriamente son solo unas de estas:
${CATEGORY_IDS.join(', ')}

Guía de categorización:
- 'Comida': restaurantes, supermercados, almuerzos, café (Juan Valdez, Tostao, etc.), comida rápida (El Corral, Frisby, Crepes), bar.
- 'Transporte': gasolina, taxi, Transmilenio, SITP, metro, autobús, tren, peaje, parking, Uber, Cabify, DiDi.
- 'Entretenimiento': cine, conciertos, suscripciones (Netflix, Spotify, HBO, etc.), discotecas, cerveza, ocio, paseos.
- 'Hogar': alquiler, servicios públicos (EPM, Codensa, Acueducto, Gas, Vanti, Claro, Tigo, Movistar), arriendos, servicios.
- 'Salud': gimnasio, consultas médicas, medicamentos, farmacias (Cruz Verde, Drogas La Rebaja), dentista.
- 'Educación': libros, escuelas, universidades, cursos online, papelería.
- 'Tecnología': gadgets, componentes de PC, teléfonos, computadores, audífonos, software.
- 'Otros': cualquier cosa que no encaje en las anteriores.

Devuelve la información estrictamente acorde al esquema JSON indicado.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["description", "amount", "category", "date", "success"],
          properties: {
            description: {
              type: Type.STRING,
              description: "Nombre del lugar, comercio o concepto del gasto. Capitaliza el primer carácter (ej: 'Almacenes Éxito' o 'Netflix')."
            },
            amount: {
              type: Type.NUMBER,
              description: "Cantidad de dinero gastada en Pesos Colombianos (COP) como número entero (ej: 45000)."
            },
            category: {
              type: Type.STRING,
              description: `Debe ser exactamente uno de estos valores: ${CATEGORY_IDS.join(', ')}`
            },
            date: {
              type: Type.STRING,
              description: "Fecha en formato YYYY-MM-DD"
            },
            success: {
              type: Type.BOOLEAN,
              description: "True si se pudo parsear al menos el importe o monto y el concepto básico."
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);

  } catch (error: any) {
    console.error("Server-side parseExpenseWithAI error:", error);
    return res.status(500).json({ error: "Fallo el procesamiento remoto de la frase" });
  }
});

// API: Stream financial advice conversations using Server-Sent Events (SSE)
app.post("/api/gemini/financial-advice", async (req, res) => {
  const { expenses, budget, messages, lang } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!ai) {
    res.write(`data: ${JSON.stringify({ error: "Gemini server client not configured" })}\n\n`);
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  try {
    const totalSpent = (expenses || []).reduce((sum: number, e: any) => sum + e.amount, 0);
    const remaining = (budget?.total || 1800000) - totalSpent;

    const categorySpentMap: Record<string, number> = {};
    (expenses || []).forEach((e: any) => {
      categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + e.amount;
    });

    const categoryBreakdownText = CATEGORY_IDS.map(catId => {
      const spent = categorySpentMap[catId] || 0;
      const catBudgetObj = (budget?.byCategory || []).find((cb: any) => cb.category === catId);
      const catBudget = catBudgetObj ? catBudgetObj.amount : 0;
      const realPct = catBudget > 0 ? (spent / catBudget) * 100 : 0;
      
      if (lang === 'en') {
        const engName = catId === 'Comida' ? 'Food & Groceries' 
          : catId === 'Transporte' ? 'Transportation'
          : catId === 'Entretenimiento' ? 'Entertainment'
          : catId === 'Hogar' ? 'Rent & Utilities'
          : catId === 'Salud' ? 'Health & Care'
          : catId === 'Educación' ? 'Education'
          : catId === 'Tecnología' ? 'Technology'
          : 'Others';
        return `- ${engName}: Spent: $${spent.toLocaleString('es-CO')} COP / Budget: $${catBudget.toLocaleString('es-CO')} COP (${realPct.toFixed(0)}%)`;
      }
      return `- ${catId}: Gastado: $${spent.toLocaleString('es-CO')} COP / Presupuestado: $${catBudget.toLocaleString('es-CO')} COP (${realPct.toFixed(0)}%)`;
    }).join('\n');

    let contextPrompt = "";
    if (lang === 'en') {
      contextPrompt = `You are "FinanceAssistant AI", a personal finance planner and advisory expert in personal budgets based in Colombia. You help the user manage their personal savings and stay within their cash limits.
      
  Current monthly user financial standing (Valued in Colombian Pesos COP with $ symbol):
  - Total Monthly Budget: $${(budget?.total || 1800000).toLocaleString('es-CO')} COP
  - Total Spent: $${totalSpent.toLocaleString('es-CO')} COP
  - Remaining Balance: $${remaining.toLocaleString('es-CO')} COP (${remaining >= 0 ? "Favorable (Within limit)" : "Exceeded (Alert!)"})
  - Consumed budget percentage: ${(((totalSpent) / (budget?.total || 1800000)) * 100).toFixed(1)}%
  
  Expense breakdown per category:
  ${categoryBreakdownText}
  
  Full list of existing transactions (with date, concept, and amount):
  ${(expenses || []).map((e: any) => `- [${e.date}] ${e.description}: $${e.amount.toLocaleString('es-CO')} COP in category [${e.category}]${e.tags ? ` (Tags: ${e.tags.join(', ')})` : ''}`).join('\n')}
  
  CONVERSATION INSTRUCTIONS:
  1. Be very direct, empowering, friendly, and practical. Speak with a warm, personal tone.
  2. Provide tailored saving hacks regarding common "leaking" habits (e.g. daily coffees, eating out frequently, subscription creep, taxi or rideshare apps).
  3. If the user asks about calculations, provide exact math by summarizing transaction values.
  4. Keep replies concise and formatted with neat Markdown (bold text, lists, subheadings).
  5. ALWAYS reply in English. Use $ symbol for COP prices.`;
    } else {
      contextPrompt = `Eres "FinanzAsistente AI", un planificador y asesor financiero experto en Finanzas Personales con contexto en Colombia. Ayudas al usuario a controlar sus gastos personales y mantenerse dentro de su presupuesto en Pesos Colombianos (COP).
  
  Información financiera actual del usuario para este mes (Valores expresados en Pesos Colombianos COP con el símbolo $):
  - Presupuesto Mensual Total: $${(budget?.total || 1800000).toLocaleString('es-CO')} COP
  - Total Gastado: $${totalSpent.toLocaleString('es-CO')} COP
  - Saldo Restante: $${remaining.toLocaleString('es-CO')} COP (${remaining >= 0 ? "Favorable (Estás dentro del límite)" : "Excedido (¡Alerta!)"})
  - Porcentaje consumido del presupuesto total: ${(((totalSpent) / (budget?.total || 1800000)) * 100).toFixed(1)}%
  
  Desglose de gastos por categoría activa:
  ${categoryBreakdownText}
  
  Listado completo de transacciones existentes (con fecha, detalle e importe):
  ${(expenses || []).map((e: any) => `- [${e.date}] ${e.description}: $${e.amount.toLocaleString('es-CO')} COP en categoría [${e.category}]${e.tags ? ` (Etiquetas: ${e.tags.join(', ')})` : ''}`).join('\n')}
  
  PAUTAS DE CONVERSACIÓN COLOMBIANA:
  1. Sé muy directo, empático, amigable y profesional. Usa un tono cercano y si lo deseas algunos térmicos afables sin perder profesionalismo.
  2. Considera consejos personalizados sobre "gastos hormiga" representativos en Colombia (comer empanadas diariamente, tintos, compras de impulso en tiendas de barrio, plataformas de transporte, suscripciones que no uses).
  3. Si el usuario te pregunta cosas del historial, por favor calcula los valores de forma exacta sumando los gastos relacionados.
  4. Siempre da respuestas concisas utilizando Markdown (en negritas, subtítulos o listas ordenadas). Limítate a responder lo requerido directamente con un formato impecable.
  5. Responde SIEMPRE en español de Colombia.`;
    }

    const formattedHistory = (messages || []).map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const lastMessage = formattedHistory.pop()?.parts[0]?.text || (lang === 'en' ? "Give me a saving tip today" : "Dame un consejo general de ahorro hoy");

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: `${contextPrompt}\n\nConsulta del usuario: ${lastMessage}` }] }
      ],
      config: {
        systemInstruction: lang === 'en' 
          ? "You are FinanceAssistant AI, a personal finance expert and budget guide in Colombia. Your answers must be extremely practical, direct, stimulating, and always express prices in Colombian Pesos (COP)."
          : "Eres FinanzAsistente AI, un gurú experto en finanzas personales de Colombia. Tus respuestas deben ser sumamente prácticas, directas, estimulantes y siempre expresadas en pesos colombianos (COP).",
        temperature: 0.85,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    return res.end();

  } catch (error: any) {
    console.error("Server financial advice error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message || "Advice error" })}\n\n`);
    res.write("data: [DONE]\n\n");
    return res.end();
  }
});

// API: Analyze base64 receipt/factura visual image using Gemini 3.5 Flash
app.post("/api/gemini/analyze-invoice", async (req, res) => {
  const { base64Image, mimeType, todayDate } = req.body;
  if (!base64Image || !mimeType) {
    return res.status(400).json({ error: "Missing base64Image or mimeType parameters" });
  }

  if (!ai) {
    return res.status(404).json({ error: "Gemini server client not configured" });
  }

  try {
    const prompt = `Analiza detalladamente esta imagen de factura de compra o ticket de compras para extraer el desglose de productos y gastos en Pesos Colombianos (COP).
    
Extrae el nombre del establecimiento comercial y desglosa los artículos de manera individual o agrupados convenientemente.
Asigna a cada artículo una de las siguientes categorías que son obligatorias (usa exactamente el id indicado):
${CATEGORY_IDS.join(', ')}

Guía de asignación según el id:
- 'Comida': Mercado, carnes, verduras, lácteos, pan, almuerzo, snacks de comer, gaseosa, restaurantes, café.
- 'Transporte': Gasolina, parqueadero, peaje, SITP, Transmilenio, DiDi, Uber.
- 'Entretenimiento': Boletas de cine, snacks de diversión, juegos, suscripciones (Netflix/Spotify).
- 'Hogar': Artículos de aseo (Clorox, jabón platos), bombillas, papelería, servicios hogareños.
- 'Salud': Medicamentos, curas, visitas médicas, gimnasio.
- 'Educación': Libros, cuadernos, matrículas.
- 'Tecnología': Gadgets, cables, auriculares, pilas.
- 'Otros': Cosas diversas no contempladas.

Para la fecha de los gastos:
- Busca la fecha del ticket en formato YYYY-MM-DD. Si no la encuentras o es ilegible, usa exactamente la fecha de hoy: ${todayDate}.

Formato de retorno: Devuelve la información estrictamente estructurada acorde al esquema JSON especificado.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        },
        {
          text: prompt
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["establishmentName", "totalAmount", "date", "items"],
          properties: {
            establishmentName: {
              type: Type.STRING,
              description: "Nombre del almacén, negocio o comercio (ej: 'Supermercado Local', 'D1', 'Tiendas Ara', 'Olímpica', 'Primax')."
            },
            totalAmount: {
              type: Type.NUMBER,
              description: "Monto total registrado en el ticket en Pesos Colombianos (COP) como número entero."
            },
            date: {
              type: Type.STRING,
              description: "Fecha impresa en la factura (YYYY-MM-DD). Si no la hay, usa hoy."
            },
            items: {
              type: Type.ARRAY,
              description: "Arreglo de los artículos o grupos de gastos identificados.",
              items: {
                type: Type.OBJECT,
                required: ["description", "amount", "category", "date"],
                properties: {
                  description: {
                    type: Type.STRING,
                    description: "Concepto resumido del artículo o grupo (ej: 'Leche Enterprise 1L', 'Combustible corriente', 'Servicio de parqueadero')."
                  },
                  amount: {
                    type: Type.NUMBER,
                    description: "Importe del artículo individual o grupo en Pesos Colombianos (COP) como entero positivo."
                  },
                  category: {
                    type: Type.STRING,
                    description: `Debe ser exactamente uno de estos valores de id: ${CATEGORY_IDS.join(', ')}`
                  },
                  date: {
                    type: Type.STRING,
                    description: "Fecha en formato YYYY-MM-DD (coincidente con la general de la factura)."
                  }
                }
              }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);

  } catch (error: any) {
    console.error("Server analyzeInvoiceImageWithAI error:", error);
    return res.status(500).json({ error: "Fallo la lectura visual remota con Gemini AI" });
  }
});

// Setup Vite & App Server routing
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server listening at http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((error) => {
  console.error("Failed to start server:", error);
});
