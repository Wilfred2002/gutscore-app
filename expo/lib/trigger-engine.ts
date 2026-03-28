import { Meal, Symptom, Trigger } from '@/types';

interface TriggerSuspect {
    name: string;
    occurrences: number; // How many times present before a symptom
    totalOccurrences: number; // How many times present in total
    correlatedIntensity_sum: number;
}

/**
 * Analyzes meals and symptoms to detect potential trigger foods.
 * Heuristic:
 * 1. Filter for significant symptoms (intensity >= 4)
 * 2. Look for meals consumed 30 min to 6 hours before the symptom.
 * 3. Calculate a "confidence score" based on how often the food is followed by a symptom
 *    vs how often it is eaten in general.
 */
export const analyzeTriggers = (meals: Meal[], symptoms: Symptom[]): Trigger[] => {
    if (meals.length === 0 || symptoms.length === 0) return [];

    const suspects: Record<string, TriggerSuspect> = {};

    // 1. Calculate Total Frequency of each food
    meals.forEach(meal => {
        meal.foods.forEach(food => {
            const normalizedName = food.name.toLowerCase().trim();
            if (!suspects[normalizedName]) {
                suspects[normalizedName] = {
                    name: food.name, // Keep original casing for display
                    occurrences: 0,
                    totalOccurrences: 0,
                    correlatedIntensity_sum: 0
                };
            }
            suspects[normalizedName].totalOccurrences += 1;
        });
    });

    // 2. Correlate Symptoms to Meals
    // Significant symptoms: high bloat/pain (>=3) or low energy (<=2)
    const significantSymptoms = symptoms.filter(s =>
        s.bloat >= 3 || s.pain >= 3 || s.energy <= 2
    );

    significantSymptoms.forEach(symptom => {
        const symptomTime = new Date(symptom.timestamp).getTime();

        // Find relevant meals (30 mins to 6 hours before)
        const relevantMeals = meals.filter(meal => {
            const mealTime = new Date(meal.timestamp).getTime();
            const diffHours = (symptomTime - mealTime) / (1000 * 60 * 60);
            return diffHours >= 0.5 && diffHours <= 6;
        });

        // If "associatedMealId" is explicitly set, prioritize that
        const linkedMeal = symptom.associatedMealId ? meals.find(m => m.id === symptom.associatedMealId) : null;
        if (linkedMeal && !relevantMeals.some(m => m.id === linkedMeal.id)) {
            relevantMeals.push(linkedMeal);
        }

        // Add weight to suspects
        const processedFoods = new Set<string>(); // Avoid double counting if food appears twice in window
        relevantMeals.forEach(meal => {
            meal.foods.forEach(food => {
                const normalizedName = food.name.toLowerCase().trim();
                if (suspects[normalizedName] && !processedFoods.has(normalizedName)) {
                    suspects[normalizedName].occurrences += 1;
                    // Calculate severity from bloat/pain (higher is worse) and energy (lower is worse)
                    const severity = Math.max(symptom.bloat, symptom.pain) + (5 - symptom.energy);
                    suspects[normalizedName].correlatedIntensity_sum += severity;
                    processedFoods.add(normalizedName);
                }
            });
        });
    });

    // 3. Score and Filter Triggers
    const triggers: Trigger[] = [];

    Object.values(suspects).forEach(suspect => {
        // Minimum data requirement: Eaten at least 3 times, caused issues at least 2 times
        if (suspect.totalOccurrences < 3 || suspect.occurrences < 2) return;

        // Correlation Ratio: (rareness of food * occurrences) / total
        // Simple ratio: occurrences / totalOccurrences
        const ratio = suspect.occurrences / suspect.totalOccurrences;

        // Intensity factor: Average intensity when it causes issues
        const avgIntensity = suspect.correlatedIntensity_sum / suspect.occurrences;

        let confidence = 0;

        // Very logical scoring
        if (ratio > 0.8 && suspect.totalOccurrences >= 3) confidence = 95; // Almost always causes it
        else if (ratio > 0.5) confidence = 75; // Often causes it
        else if (ratio > 0.3) confidence = 40; // Sometimes
        else return; // Ignore low correlation

        // Boost confidence if high intensity
        if (avgIntensity > 7) confidence += 10;
        if (confidence > 100) confidence = 99;

        triggers.push({
            id: `trigger_${suspect.name}_${Date.now()}`,
            name: suspect.name, // Use the display name
            confidence: confidence,
            status: confidence > 80 ? 'avoid' : confidence > 50 ? 'limit' : 'monitor',
        });
    });

    // Sort by confidence
    return triggers.sort((a, b) => b.confidence - a.confidence);
};
