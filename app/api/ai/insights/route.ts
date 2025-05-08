import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salesData, restaurantData, summaryStats } = body;

    if (!salesData || !restaurantData || !summaryStats) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prepare the prompt for Gemini
    const prompt = `
      You are a restaurant management system AI assistant. Analyze the following sales data and provide 4-5 insights, each followed by an actionable recommendation:
      
      Sales Summary:
      - Total Sales: $${summaryStats.totalSales.toLocaleString()}
      - Average Sale: $${summaryStats.averageSale.toFixed(2)}
      - Growth Rate: ${summaryStats.growthRate.toFixed(1)}%
      - Sales Range: $${summaryStats.minSale.toLocaleString()} - $${summaryStats.maxSale.toLocaleString()}
      
      Top Performing Restaurants:
      ${restaurantData
        .map(
          (r: any, i: number) =>
            `${i + 1}. ${r.name}: $${r.total.toLocaleString()} (${
              r.count
            } transactions)`
        )
        .join("\n")}
      
      Sales Data (last 10 entries):
      ${salesData
        .slice(0, 10)
        .map(
          (s: any) =>
            `${s.RestaurantName}: $${s.Amount.toLocaleString()} on ${new Date(
              s.Date
            ).toLocaleDateString()}`
        )
        .join("\n")}
      
      For each insight:
      1. Start with a clear heading
      2. Use **bold** for important numbers, percentages, and key terms
      3. Keep insights concise and focused
      4. End each insight with "Actionable Recommendation:" followed by a specific, actionable step
      
      Example format:
      Sales Growth Analysis
      Your sales have shown a **strong growth** of **15%**. This indicates increasing market presence.
      Actionable Recommendation: Increase inventory by 20% to meet growing demand.
      
      Focus on these areas:
      1. Sales trends and growth patterns
      2. Restaurant performance comparisons
      3. Customer behavior and transaction values
      4. Opportunities for improvement
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
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
