import { execSync } from "child_process";
import * as fs from "fs";

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log(`
❌ Uso incorrecto del script. Por favor ejecútalo de la siguiente manera:
   npx tsx push_to_github.ts <TU_TOKEN_DE_GITHUB> <TU_USUARIO_DE_GITHUB> <NOMBRE_DEL_NUEVO_REPOSITORIO>

💡 Cómo obtener un Token de Acceso Personal en GitHub (PAT):
   1. Ve a GitHub -> Settings -> Developer settings -> Personal access tokens -> Tokens (classic).
   2. Genera un nuevo token con permisos de 'repo' (full control of private repositories).
   3. Copia el token generado y úsalo aquí.
`);
  process.exit(1);
}

const [token, username, repoName] = args;

try {
  console.log("🚀 Iniciando proceso para subir tu código a GitHub...");

  // 1. Inicializar git si no está inicializado
  if (!fs.existsSync(".git")) {
    console.log("📦 Inicializando repositorio Git local...");
    execSync("git init", { stdio: "inherit" });
  }

  // 2. Configurar usuario local para este commit
  console.log("👤 Configurando datos de usuario de Git locales...");
  execSync(`git config user.name "${username}"`, { stdio: "inherit" });
  execSync(`git config user.email "${username}@users.noreply.github.com"`, { stdio: "inherit" });

  // 3. Agregar archivos al commit (ignorando lo que esté en .gitignore)
  console.log("📂 Agregando los archivos locales...");
  execSync("git add .", { stdio: "inherit" });

  // 4. Hacer el commit inicial o de actualización
  console.log("⚙️ Creando commit...");
  try {
    execSync('git commit -m "Actualización FinanzAsistente AI con procesamiento conversacional y lector visual"', { stdio: "inherit" });
  } catch (err) {
    console.log("⚠️ No se detectaron cambios nuevos para hacer commit.");
  }

  // 5. Renombrar la rama principal a main
  console.log("🌿 Cambiando de rama principal a 'main'...");
  execSync("git branch -M main", { stdio: "inherit" });

  // 6. Eliminar el remote anterior si existe
  console.log("🔄 Asegurando configuración de remote...");
  try {
    execSync("git remote remove origin", { stdio: "ignore" });
  } catch {}

  // 7. Configurar el nuevo remote con autenticación segura usando el Token
  const remoteUrl = `https://${token}@github.com/${username}/${repoName}.git`;
  execSync(`git remote add origin ${remoteUrl}`, { stdio: "pipe" });

  // 8. Hacer Push a GitHub
  console.log(`📤 Subiendo código a https://github.com/${username}/${repoName}...`);
  execSync("git push -u origin main --force", { stdio: "inherit" });

  console.log(`\n🎉 ¡Éxito total! Tu código ha sido subido con éxito al repositorio:`);
  console.log(`🔗 https://github.com/${username}/${repoName}`);

} catch (error: any) {
  console.error("\n❌ Error durante el proceso de Git:");
  console.error(error.message || error);
}
