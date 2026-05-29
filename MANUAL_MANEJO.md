# Manual de Manejo e Información de Datos • FinanzAsistente AI 🚀

Bienvenido al manual educativo de **FinanzAsistente AI**, un sistema avanzado, Local-First e impulsado por Inteligencia Artificial (Google Gemini) diseñado de forma exclusiva para ayudarte a comprender, auditar y optimizar tu salud financiera mensual de manera interactiva.

Este manual fue diseñado para guiarte en el uso diario de la herramienta y detallar de forma absolutamente transparente cómo se protege y almacena tu información de conformidad con la ley aplicable de protección de datos personales.

---

## 📌 1. ¿Qué es FinanzAsistente AI y para qué sirve?

**FinanzAsistente AI** es una plataforma interactiva que actúa como tu copiloto de finanzas personales o de negocios. Sirve para:
1. **Ver un control gráfico en tiempo real**: Monitorea de forma visual qué porcentaje de tus ingresos o presupuesto mensual has ejecutado y qué dinero real te queda disponible.
2. **Evitar sobregasto innecesario**: Configura un límite global de dinero para el mes y distribúyelo en categorías específicas (Alimentación, Transporte, Entretenimiento, Servicios del Hogar, etc.). El sistema activará alertas visuales automáticas cuando estés cerca de sobrepasar tus límites.
3. **Automatizar la entrada de datos con AI**: Olvídate de rellenar complicados formularios tradicionales de contabilidad. La plataforma procesa tu lenguaje coloquial o las fotos de tus recibos físicos gracias a los modelos de inteligencia artificial multimodal de Google (Gemini 2.5) para registrar egresos en 1 segundo.
4. **Recibir auditoría financiera permanente**: Habla de forma interactiva con un Asesor de IA privado que audita tus números, te da consejos de ahorro prácticos basados en tus hábitos y te incentiva con retos semanales dinámicos.

---

## 💾 2. ¿Dónde se guarda la información de cada usuario?

La privacidad de tu billetera es nuestra máxima prioridad por diseño. FinanzAsistente AI implementa un **esquema de almacenamiento dual sumamente seguro**:

### A. Almacenamiento Local Privado (Local-First)
* **¿Dónde?** Directamente en el navegador web de tu equipo personal, utilizando la tecnología **`localStorage`**.
* **¿Cómo sirve?** Si decides usar la herramienta sin registrarte en la nube o de forma local offline, tus transacciones, mensajes del asistente y límites de presupuesto se quedan almacenados físicamente en la memoria interna aislada de tu navegador. Ningún servidor corporativo o tercero tiene la capacidad de leer tus cifras o gastos.

### B. Almacenamiento en la Nube Sincronizado (Google Firebase Firestore)
* **¿Dónde?** En un servidor de base de datos de alto rendimiento de **Google Cloud (Firebase Firestore)**.
* **¿Cómo sirve?** Si creas una cuenta de usuario y dejas activa la casilla **"Almacenamiento en la Nube (Firebase)"**, la información de tu perfil, gastos, presupuestos y chats se subirá en tiempo real de forma encriptada al almacenamiento en la nube de Google. Esto te permite iniciar sesión desde otros dispositivos y mantener tus cuentas integradas.
* **¿Quién tiene acceso?** Todos los documentos se configuran con reglas de seguridad estrictas indexadas bajo tu nombre de usuario en minúsculas. De esta forma, el sistema solo permite consultar, modificar o eliminar datos de la base de datos si corresponden exactamente al perfil activo.

---

## ⚖️ 3. Tratamiento de Datos Personales (Ley 1581 de 2012 / Habeas Data)

En cumplimiento de las regulaciones globales sobre protección de datos personales y Habeas Data, la plataforma garantiza que **eres el dueño absoluto de tu información**.

1. **Autorización requerida**: Al registrarte por primera vez, verás de manera obligatoria un checkbox de autorización. Al marcarlo, otorgas el consentimiento libre e informado de procesar tus números estrictamente dentro del ecosistema interno de cálculo del FinanzAsistente.
2. **Uso de la Inteligencia Artificial**: Cuando introduces un texto coloquial o una imagen de factura, esta viaja cifrada mediante la API de Google Gemini para ser interpretada, sin que Google almacene o use tu información de forma permanente para el reentrenamiento de modelos públicos.
3. **Derecho de Supresión (Borrado Total)**: De acuerdo con la Ley 1581 de 2012, puedes revocar tu autorización y suprimir tu información en cualquier momento. Para ejercer esto al instante, ve a **Ajustes > Acciones de Datos** y presiona el botón **"Borrar Todo"**. El sistema purgará físicamente y de forma irreversible todos tus registros locales de `localStorage` y removerá todas las instancias asociadas a tu usuario en la base de datos en la nube (Firestore) en segundos.

---

## 🛠️ 4. Guía de Manejo Paso a Paso

### 1️⃣ Inicio de Sesión y Perfiles de Prueba
* **Creación de Cuenta**: Ve a "Crear Cuenta Nueva", ingresa tu nombre, digita un usuario único (en minúsculas) y tu contraseña. Recuerda marcar el checkbox de Tratamiento de Datos.
* **Modo Demostración**: Si deseas explorar la herramienta con datos de ejemplo ficticios antes de configurar tus cuentas reales, presiona el botón interactivo **"Cargar Cuenta de Demostración (Glory-Dev)"**. Se cargará un perfil de pruebas con un histórico de gastos completo y presupuestos simulados con los cuales podrás interactuar libremente.

### 2️⃣ Registro Manual de Egresos
* Ubicado en la barra lateral del **Dashboard**.
* Permite rellenar de forma exacta la descripción del gasto, el valor ($ COP), la categoría representativa, la fecha del suceso y etiquetas de segmentación separadas por comas.

### 3️⃣ Registro Inteligente por Lenguaje Natural (NLP)
* En el banner central del Dashboard, escribe o pega un texto informal sobre lo que compraste. Por ejemplo:
  > *"Hoy por la tarde almorcé con mi equipo de desarrollo de software y gasté 42 mil pesos en comida rápida"*
* Presiona **"Analizar"**. La Inteligencia Artificial interpretará el contexto y un cuadro emergente te presentará la transacción autodetectada (Monto: `$ 42,000`, Categoría: `Alimentación`, Descripción: `Almuerzo con equipo de desarrollo`). Puedes editar los campos si es necesario y guardarlo con un solo clic.

### 4️⃣ Escaneo Óptico de Facturas (Gemini Vision)
* Si tienes una foto en tu computador o celular de un recibo arrugado de supermercado, restaurante o farmacia, súbela en el área de carga.
* Presiona **"Analizar Foto con AI"**. Gemini Vision escaneará la imagen, aislará el texto y te arrojará:
  * El establecimiento de compra.
  * La fecha oficial de la transacción.
  * Una tabla desglosada con todos los artículos individuales detectados, sus precios y categorías sugeridas.
* Selecciona las casillas de verificación de los artículos específicos que desees añadir y haz clic en **"Confirmar y Agregar Gastos"**.

### 5️⃣ Control de Presupuesto y Semáforo de Alertas
* Navega a la pestaña de **Ajustes** (Ajustes).
* Define un **Presupuesto Mensual Global** (ej: `$ 1.800.000 COP`).
* Asigna límites de control individuales para cada categoría de la lista (Alimentación, Transporte, Entretenimiento, Tecnología, etc.).
* En el Dashboard verás un indicador porcentual de ejecución por categoría. Cuando un límite individual sea rebasado, el sistema convertirá las barras y etiquetas a color naranja brillante de **"Exceso de Presupuesto"** para advertirte del riesgo.

### 6️⃣ Interactuar con el Asesor AI Financiero
* Ve a la pestaña de **Asesor AI**.
* Puedes usar los tres disparadores de diagnóstico rápido prefabricados:
  * **Analizar categoría estrella de sobregasto**: La IA auditará tu histórico detallado para indicarte qué categoría consume más porcentaje de tus ingresos.
  * **Dame 3 consejos súper prácticos y rápidos**: Consejos de ahorro ultra-rápidos basados en tus números reales.
  * **Desafío de Ahorro Semanal**: Retos aplicables para restringir fugas hormiga.
* O si lo prefieres, escribe en el chat libre preguntas naturales como:
  * *"¿De cuánto fue mi factura de luz según los gastos que registré?"*
  * *"¿Cuánto me queda de dinero disponible si quiero ahorrar 200 mil pesos este mes?"*
  * El asistente te responderá de forma conversacional basándose de manera privada exclusivamente en tus números registrados.

### 7️⃣ Inspector de Base de Datos para Control Total
* En el panel inferior de **Ajustes**, encontrarás el **Inspector Físico de Base de Datos (JSON)**.
* Te permite visualizar el estado del almacenamiento en tiempo real correspondiente a gastos, chats, sesiones virtuales y presupuestos. Puedes copiar los objetos de datos en bruto para respaldarlos o examinarlos con total transparencia de almacenamiento.

---
**© 2026 Glory-Dev • FinanzAsistente AI**
*Local-first, inteligente y seguro. ¡Toma el control de tus finanzas hoy mismo!*
