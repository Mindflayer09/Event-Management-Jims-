require('dotenv').config();

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ NO API KEY FOUND IN .env!");
    return;
  }

  console.log("Fetching allowed models from Google...");

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ GOOGLE API ERROR:", data.error.message);
      return;
    }

    console.log("\n✅ === AVAILABLE MODELS FOR YOUR KEY ===");
    data.models.forEach(model => {
      // We only care about models that can generate text/JSON
      if (model.supportedGenerationMethods.includes("generateContent")) {
        // Strip the "models/" prefix to show the exact string you need
        console.log(`➡️  ${model.name.replace('models/', '')}`);
      }
    });
    console.log("=======================================\n");

  } catch (err) {
    console.error("❌ NETWORK ERROR:", err.message);
  }
}

checkModels();