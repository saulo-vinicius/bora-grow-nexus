
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
      
      console.log("Solving system with A:", A, "B:", B);
      
      // Validate matrix to ensure no NaN or all zero rows/columns
      this.validateMatrix(A);
      
      let X;
      
      // Check if system is determined, underdetermined, or overdetermined
      if (A.length === substances.length) {
        // Determined system: A is square
        X = math.lusolve(A, B);
      } else if (A.length < substances.length) {
        // Underdetermined system: more substances than constraints
        // Use the pseudo-inverse to find a minimum norm solution
        const AT = math.transpose(A);
        const AAT = math.multiply(A, AT);
        const AATinv = math.inv(AAT);
        const Adag = math.multiply(AT, AATinv);
        X = math.multiply(Adag, B);
        
        // Convert to column vector format
        X = X.map((val: number) => [Math.max(0, val)]); // Ensure non-negative values
      } else {
        // Overdetermined system: more constraints than substances
        // Use the pseudo-inverse to find a least squares solution
        const AT = math.transpose(A);
        const ATA = math.multiply(AT, A);
        const ATAinv = math.inv(ATA);
        const Adag = math.multiply(ATAinv, AT);
        X = math.multiply(Adag, B);
        
        // Convert to column vector format
        X = X.map((val: number) => [Math.max(0, val)]); // Ensure non-negative values
      }
      
      // Update substances with calculated amounts
      const calculatedSubstances = substances.map((substance, index) => ({
        ...substance,
        amount: X[index][0] * volumeInLiters
      }));
      
      // Calculate actual element concentrations based on solution
      const actualConcentrations: Record<Element, number> = {} as Record<Element, number>;
      
      // Initialize all elements in target concentrations
      Object.keys(targetConcentrations).forEach(element => {
        actualConcentrations[element as Element] = 0;
      });
      
      // Calculate the actual concentrations from the solution
      calculatedSubstances.forEach(substance => {
        Object.entries(substance.elements).forEach(([element, percentage]) => {
          if (!actualConcentrations[element as Element]) {
            actualConcentrations[element as Element] = 0;
          }
          
          actualConcentrations[element as Element] += 
            (substance.amount || 0) * percentage / volumeInLiters;
        });
      });
      
      // Calculate predicted EC (more accurate model based on ion contributions)
      // This is a simplified model - actual EC depends on specific ions
      const elementContributions: Record<Element, number> = {
        "N(NO3-)": 0.0071,
        "N(NH4+)": 0.0074,
        "P": 0.0032,
        "K": 0.0020,
        "Ca": 0.0044,
        "Mg": 0.0074,
        "S": 0.0080,
        "Fe": 0.0036,
        "Mn": 0.0037,
        "Zn": 0.0031,
        "B": 0.0000, // Very low contribution
        "Cu": 0.0032,
        "Si": 0.0000, // Very low contribution
        "Mo": 0.0021,
        "Na": 0.0043,
        "Cl": 0.0028
      };
      
      const predictedEc = Object.entries(actualConcentrations).reduce((sum, [element, concentration]) => {
        return sum + concentration * (elementContributions[element as Element] || 0);
      }, 0);
      
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
   * Validates matrix to ensure it's suitable for solving
   */
  private validateMatrix(A: number[][]) {
    // Check for NaN values
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[i].length; j++) {
        if (isNaN(A[i][j])) {
          throw new Error(`Matrix contains NaN values at position [${i}, ${j}]`);
        }
      }
    }
    
    // Check for all-zero rows
    for (let i = 0; i < A.length; i++) {
      if (A[i].every(val => val === 0)) {
        throw new Error(`Matrix contains an all-zero row at row ${i}`);
      }
    }
    
    // Check for all-zero columns
    for (let j = 0; j < A[0].length; j++) {
      let allZero = true;
      for (let i = 0; i < A.length; i++) {
        if (A[i][j] !== 0) {
          allZero = false;
          break;
        }
      }
      if (allZero) {
        throw new Error(`Matrix contains an all-zero column at column ${j}`);
      }
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
