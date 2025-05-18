
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
  custom?: boolean;
  user_id?: string;
}

export interface CalculationResult {
  substances: Substance[];
  elementConcentrations: Record<Element, number>;
  predictedEc: number;
  messages?: string[];
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
      const messages: string[] = [];
      
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
      
      // Filter out rows with all zeros and corresponding targets
      const { filteredA, filteredB, removedElements } = this.filterZeroRows(A, B, activeElements);
      
      if (removedElements.length > 0) {
        messages.push(`No substances provide these elements: ${removedElements.join(', ')}. Consider adding substances with these elements.`);
      }
      
      if (filteredA.length === 0) {
        throw new Error("All target elements have no corresponding substances. Select substances that provide your target elements.");
      }
      
      let X;
      let solveMethod = "exact"; // Track which solving method was used
      
      // Check if system is determined, underdetermined, or overdetermined
      try {
        // First try direct solution
        if (filteredA.length === substances.length) {
          // Determined system: A is square
          try {
            X = math.lusolve(filteredA, filteredB);
            solveMethod = "determined";
          } catch (error) {
            console.log("Error with lusolve on square matrix, trying pseudoinverse:", error);
            // Fallback to pseudoinverse
            const AT = math.transpose(filteredA);
            const ATA = math.multiply(AT, filteredA);
            
            // Check if matrix is singular by testing if determinant is very close to 0
            const det = math.det(ATA);
            if (Math.abs(det) < 1e-10) {
              throw new Error("Matrix is singular, cannot be inverted directly");
            }
            
            const ATAinv = math.inv(ATA);
            const Adag = math.multiply(ATAinv, AT);
            X = math.multiply(Adag, filteredB);
            X = X.map((val: number) => [Math.max(0, val)]);
            solveMethod = "pseudoinverse-determined";
          }
        } else if (filteredA.length < substances.length) {
          // Underdetermined system: more substances than constraints
          solveMethod = "underdetermined";
          const AT = math.transpose(filteredA);
          const AAT = math.multiply(filteredA, AT);
          
          try {
            const AATinv = math.inv(AAT);
            const Adag = math.multiply(AT, AATinv);
            X = math.multiply(Adag, filteredB);
            X = X.map((val: number) => [Math.max(0, val)]); // Ensure non-negative values
          } catch (error) {
            console.log("Error with pseudoinverse for underdetermined system:", error);
            // Fallback to a simpler approach
            X = this.calculateEvenDistribution(substances, activeElements, activeTargets);
            solveMethod = "even-distribution";
            messages.push("Using simplified calculation due to matrix singularity.");
          }
        } else {
          // Overdetermined system: more constraints than substances
          solveMethod = "overdetermined";
          const AT = math.transpose(filteredA);
          const ATA = math.multiply(AT, filteredA);
          
          try {
            const ATAinv = math.inv(ATA);
            const Adag = math.multiply(ATAinv, AT);
            X = math.multiply(Adag, filteredB);
            X = X.map((val: number) => [Math.max(0, val)]); // Ensure non-negative values
          } catch (error) {
            console.log("Error with pseudoinverse for overdetermined system:", error);
            // Fallback to a simpler approach
            X = this.calculateEvenDistribution(substances, activeElements, activeTargets);
            solveMethod = "even-distribution";
            messages.push("Using simplified calculation due to matrix singularity.");
          }
        }
      } catch (error) {
        console.log("Matrix solution error, using fallback approach:", error);
        // Last resort fallback
        X = this.calculateEvenDistribution(substances, activeElements, activeTargets);
        solveMethod = "fallback-distribution";
        messages.push("Using simplified calculation (approximate solution).");
      }
      
      // Update substances with calculated amounts
      const calculatedSubstances = substances.map((substance, index) => ({
        ...substance,
        amount: (X[index] && X[index][0] !== undefined) ? 
                X[index][0] * volumeInLiters : 0
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
      
      messages.push(`Calculation method used: ${solveMethod}`);
      
      return {
        substances: calculatedSubstances,
        elementConcentrations: actualConcentrations,
        predictedEc,
        messages
      };
    } catch (error) {
      console.error("Error in nutrient solution calculation:", error);
      throw new Error(`Failed to calculate nutrient solution: ${error.message}`);
    }
  }
  
  /**
   * Alternative calculation method that distributes elements evenly
   * Used as a fallback when matrix calculations fail
   */
  private calculateEvenDistribution(
    substances: Substance[],
    activeElements: Element[],
    activeTargets: number[]
  ): number[][] {
    const X = Array(substances.length).fill([0]);
    
    // For each target element, distribute it among substances that provide it
    activeElements.forEach((element, elementIndex) => {
      const substancesWithElement = substances
        .map((s, substanceIndex) => ({ 
          index: substanceIndex, 
          percentage: s.elements[element] || 0 
        }))
        .filter(s => s.percentage > 0);
        
      if (substancesWithElement.length > 0) {
        const targetValue = activeTargets[elementIndex];
        const totalPercentage = substancesWithElement.reduce(
          (sum, s) => sum + s.percentage, 
          0
        );
        
        // Distribute proportionally to percentage content
        substancesWithElement.forEach(s => {
          const contribution = targetValue * (s.percentage / totalPercentage);
          const massNeeded = contribution / s.percentage;
          
          // Update the value if it's larger than what's already there
          const currentValue = X[s.index][0] || 0;
          X[s.index] = [Math.max(currentValue, massNeeded)];
        });
      }
    });
    
    return X;
  }
  
  /**
   * Filters out zero rows from the coefficient matrix and corresponding targets
   */
  private filterZeroRows(A: number[][], B: number[], elements: Element[]) {
    const filteredA: number[][] = [];
    const filteredB: number[] = [];
    const removedElements: Element[] = [];
    
    A.forEach((row, rowIndex) => {
      if (!row.every(val => val === 0)) {
        filteredA.push(row);
        filteredB.push(B[rowIndex]);
      } else {
        removedElements.push(elements[rowIndex]);
      }
    });
    
    return { filteredA, filteredB, removedElements };
  }
  
  /**
   * Validates matrix to ensure it's suitable for solving
   * Now only checks for NaN values and all-zero columns
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
    
    // Check for all-zero columns
    for (let j = 0; j < (A[0]?.length || 0); j++) {
      let allZero = true;
      for (let i = 0; i < A.length; i++) {
        if (A[i]?.[j] !== 0) {
          allZero = false;
          break;
        }
      }
      if (allZero) {
        throw new Error(`Matrix contains an all-zero column at column ${j}. This substance doesn't contribute to any target element.`);
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
