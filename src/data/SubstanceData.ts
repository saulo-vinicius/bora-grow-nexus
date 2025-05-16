
import { Element } from "@/logic/CalculatorLogic";

export interface SubstanceData {
  id: string;
  name: string;
  formula: string;
  elements: Record<Element, number>;
  custom?: boolean;
  user_id?: string;
}

// This is a subset of the 24 standard HydroBuddy salts
export const STANDARD_SUBSTANCES: SubstanceData[] = [
  {
    id: "1",
    name: "Ammonium Chloride",
    formula: "NH4Cl",
    elements: {
      "N(NH4+)": 26.2,
      "Cl": 66.3,
    } as Record<Element, number>
  },
  {
    id: "2",
    name: "Ammonium Dibasic Phosphate",
    formula: "(NH4)2HPO4",
    elements: {
      "N(NH4+)": 21.2,
      "P": 23.5,
    } as Record<Element, number>
  },
  {
    id: "3",
    name: "Ammonium Monobasic Phosphate",
    formula: "NH4H2PO4",
    elements: {
      "N(NH4+)": 12.2,
      "P": 26.7,
    } as Record<Element, number>
  },
  {
    id: "4",
    name: "Ammonium Nitrate",
    formula: "NH4NO3",
    elements: {
      "N(NO3-)": 17.5,
      "N(NH4+)": 17.5,
    } as Record<Element, number>
  },
  {
    id: "5",
    name: "Ammonium Sulfate",
    formula: "(NH4)2SO4",
    elements: {
      "N(NH4+)": 21.2,
      "S": 24.3,
    } as Record<Element, number>
  },
  {
    id: "6",
    name: "Boric Acid",
    formula: "H3BO3",
    elements: {
      "B": 17.5,
    } as Record<Element, number>
  },
  {
    id: "7",
    name: "Calcium Chloride",
    formula: "CaCl2·2H2O",
    elements: {
      "Ca": 24.4,
      "Cl": 43.4,
    } as Record<Element, number>
  },
  {
    id: "8",
    name: "Calcium Nitrate",
    formula: "Ca(NO3)2·4H2O",
    elements: {
      "N(NO3-)": 11.9,
      "Ca": 19.4,
    } as Record<Element, number>
  },
  {
    id: "9",
    name: "Copper Sulfate",
    formula: "CuSO4·5H2O",
    elements: {
      "Cu": 25.5,
      "S": 12.8,
    } as Record<Element, number>
  },
  {
    id: "10",
    name: "Iron EDTA (13%)",
    formula: "Fe-EDTA",
    elements: {
      "Fe": 13.0,
    } as Record<Element, number>
  },
  {
    id: "11",
    name: "Magnesium Nitrate",
    formula: "Mg(NO3)2·6H2O",
    elements: {
      "N(NO3-)": 10.9,
      "Mg": 9.5,
    } as Record<Element, number>
  },
  {
    id: "12",
    name: "Magnesium Sulfate",
    formula: "MgSO4·7H2O",
    elements: {
      "Mg": 9.9,
      "S": 13.0,
    } as Record<Element, number>
  }
];

export default STANDARD_SUBSTANCES;
