import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inventoryData, menuData, dishData, summaryStats } = body;

    if (!inventoryData || !menuData || !dishData || !summaryStats) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prepare the prompt for Gemini
    const prompt = `
      You are a restaurant management system AI assistant specializing in inventory analysis. Analyze the following inventory data and provide 4-5 insights, each followed by an actionable recommendation:
      
      Inventory Summary:
      - Total Ingredients: ${summaryStats.totalIngredients}
      - Average Price: $${summaryStats.averagePrice.toFixed(2)}
      - Price Range: $${summaryStats.minPrice.toFixed(
        2
      )} - $${summaryStats.maxPrice.toFixed(2)}
      - Most Expensive Category: ${summaryStats.mostExpensiveCategory}
      
      Menu Distribution:
      ${menuData
        .map(
          (m: any, i: number) =>
            `${i + 1}. ${m.name}: ${m.ingredientCount} ingredients`
        )
        .join("\n")}
      
      Top Dishes by Ingredient Count:
      ${dishData
        .map(
          (d: any, i: number) =>
            `${i + 1}. ${d.name}: ${d.ingredientCount} ingredients`
        )
        .join("\n")}
      
      Inventory Data (sample):
      ${inventoryData
        .slice(0, 10)
        .map(
          (i: any) =>
            `${i.IngredientName}: $${i.Price.toFixed(2)} (${i.MenuName} - ${
              i.DishName
            })`
        )
        .join("\n")}
      
      For each insight:
      1. Start with a clear heading
      2. Use **bold** for important numbers, percentages, and key terms
      3. Keep insights concise and focused
      4. End each insight with "Actionable Recommendation:" followed by a specific, actionable step
      
      Example format:
      Cost Analysis
      Your inventory shows **high variability** in ingredient costs, with the most expensive items costing **$X.XX**.
      Actionable Recommendation: Consider bulk purchasing for high-cost ingredients to reduce per-unit costs.
      
      Focus on these areas:
      1. Cost optimization opportunities
      2. Inventory distribution across menus and dishes
      3. Potential for ingredient consolidation
      4. Pricing strategy recommendations
      5. Supply chain efficiency
    `;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Split the response into individual insights
    const insights = text
      .split(/\n\n|\n\d+\./)
      .filter((insight) => insight.trim().length > 0)
      .map((insight) => insight.trim());

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error generating inventory insights:", error);
    return NextResponse.json(
      { error: "Failed to generate inventory insights" },
      { status: 500 }
    );
  }
}
