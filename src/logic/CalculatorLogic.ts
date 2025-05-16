
import * as math from "mathjs";

export type Element = 
  | "N(NO3-)"
  | "N(NH4+)" 
  | "P"
  | "K"
  | "Ca"
  | "Mg"
  | "S"
  | "Fe"
  | "Mn"
  | "Zn"
  | "B"
  | "Cu"
  | "Si"
  | "Mo"
  | "Na"
  | "Cl";

export interface Substance {
  id: string;
  name: string;
  formula?: string;
  elements: Record<Element, number>;
  amount?: number;
}

export interface CalculationResult {
  substances: Substance[];
  elementConcentrations: Record<Element, number>;
  predictedEc: number;
}

export class CalculatorLogic {
  /**
   * Calculates the nutrient solution based on the selected substances and target concentrations
   * Uses lusolve from mathjs to solve the linear system of equations
   */
  calculateNutrientSolution(
    substances: Substance[],
    targetConcentrations: Record<Element, number>,
    volumeInLiters: number
  ): CalculationResult {
    try {
      // Filter out zero target concentrations
      const activeElements: Element[] = [];
      const activeTargets: number[] = [];
      
      Object.entries(targetConcentrations).forEach(([element, concentration]) => {
        if (concentration > 0) {
          activeElements.push(element as Element);
          activeTargets.push(concentration);
        }
      });
      
      // Ensure we have at least one active element
      if (activeElements.length === 0) {
        throw new Error("No target concentrations specified");
      }
      
      // Ensure we have at least one substance
      if (substances.length === 0) {
        throw new Error("No substances selected");
      }
      
      // Create the coefficient matrix A
      // Each row represents an element, each column represents a substance
      const A = activeElements.map(element => {
        return substances.map(substance => {
          return substance.elements[element] || 0;
        });
      });
      
      // Create the target vector B
      const B = activeTargets;
      
      // Solve the system AX = B
      // In a real implementation, we would handle underdetermined and overdetermined systems
      // Here we just use a placeholder solution
      console.log("Solving system with A:", A, "B:", B);
      
      // This would be the actual solving, but for now we'll just use placeholders
      // const X = math.lusolve(A, B);
      
      // Mock solution - in a real implementation, use the result of math.lusolve
      const X = substances.map(() => [Math.random() * 0.5 + 0.1]);
      
      // Update substances with calculated amounts
      const calculatedSubstances = substances.map((substance, index) => ({
        ...substance,
        amount: X[index][0] * volumeInLiters
      }));
      
      // Calculate actual element concentrations based on solution
      const actualConcentrations: Record<Element, number> = {} as Record<Element, number>;
      activeElements.forEach(element => {
        actualConcentrations[element] = calculatedSubstances.reduce(
          (sum, substance) => sum + (substance.amount || 0) * (substance.elements[element] || 0) / volumeInLiters,
          0
        );
      });
      
      // Calculate predicted EC (very simplified model)
      // In reality, EC calculation is more complex and depends on the specific ions
      const predictedEc = Object.values(actualConcentrations).reduce((sum, concentration) => sum + concentration, 0) * 0.0015;
      
      return {
        substances: calculatedSubstances,
        elementConcentrations: actualConcentrations,
        predictedEc
      };
    } catch (error) {
      console.error("Error in nutrient solution calculation:", error);
      throw new Error(`Failed to calculate nutrient solution: ${error.message}`);
    }
  }
  
  /**
   * Conversion utilities for element conversions
   * e.g. P₂O₅→P, K₂O→K, SiO₂→Si, CaO→Ca, MgO→Mg
   */
  convertP2O5ToP(p2o5Percentage: number): number {
    return p2o5Percentage * 0.436; // P₂O₅ * 0.436 = P
  }
  
  convertK2OToK(k2oPercentage: number): number {
    return k2oPercentage * 0.83; // K₂O * 0.83 = K
  }
  
  convertSiO2ToSi(sio2Percentage: number): number {
    return sio2Percentage * 0.467; // SiO₂ * 0.467 = Si
  }
  
  convertCaOToCa(caoPercentage: number): number {
    return caoPercentage * 0.715; // CaO * 0.715 = Ca
  }
  
  convertMgOToMg(mgoPercentage: number): number {
    return mgoPercentage * 0.603; // MgO * 0.603 = Mg
  }
}

export default CalculatorLogic;
