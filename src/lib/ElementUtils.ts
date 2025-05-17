
import { Element } from "@/logic/CalculatorLogic";

// Define nutrient categories
export enum NutrientCategory {
  PRIMARY_MACRONUTRIENT = "primary",
  SECONDARY_MACRONUTRIENT = "secondary",
  MICRONUTRIENT = "micro"
}

// Color scheme for nutrient categories
export const NUTRIENT_COLORS = {
  [NutrientCategory.PRIMARY_MACRONUTRIENT]: "#9b87f5", // Primary Purple
  [NutrientCategory.SECONDARY_MACRONUTRIENT]: "#F2FCE2", // Soft Green
  [NutrientCategory.MICRONUTRIENT]: "#FEF7CD", // Soft Yellow
};

// Categorize elements
export const getElementCategory = (element: Element): NutrientCategory => {
  // Primary macronutrients
  if (['N', 'P', 'K'].includes(element)) {
    return NutrientCategory.PRIMARY_MACRONUTRIENT;
  }
  
  // Secondary macronutrients
  if (['Ca', 'Mg', 'S'].includes(element)) {
    return NutrientCategory.SECONDARY_MACRONUTRIENT;
  }
  
  // All others are micronutrients
  return NutrientCategory.MICRONUTRIENT;
};

// Get color for element based on its category
export const getElementColor = (element: Element): string => {
  const category = getElementCategory(element);
  return NUTRIENT_COLORS[category];
};

// Get text color based on background color (for contrast)
export const getTextColorForBackground = (bgColor: string): string => {
  // For dark backgrounds, use light text
  if (bgColor === NUTRIENT_COLORS[NutrientCategory.PRIMARY_MACRONUTRIENT]) {
    return 'text-white';
  }
  
  // For light backgrounds, use dark text
  return 'text-gray-800';
};

// Get tailwind background class for element
export const getElementBgClass = (element: Element): string => {
  const category = getElementCategory(element);
  
  switch (category) {
    case NutrientCategory.PRIMARY_MACRONUTRIENT:
      return 'bg-[#9b87f5] text-white';
    case NutrientCategory.SECONDARY_MACRONUTRIENT:
      return 'bg-[#F2FCE2] text-gray-800';
    case NutrientCategory.MICRONUTRIENT:
      return 'bg-[#FEF7CD] text-gray-800';
    default:
      return 'bg-muted';
  }
};
