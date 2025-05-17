
import { Element } from "@/logic/CalculatorLogic";

export interface SubstanceData {
  id: string;
  name: string;
  formula: string;
  elements: Record<Element, number>;
  custom?: boolean;
  user_id?: string;
}

// This is the full set of 24 standard HydroBuddy salts
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
  },
  {
    id: "13",
    name: "Manganese Sulfate",
    formula: "MnSO4·H2O",
    elements: {
      "Mn": 32.3,
      "S": 19.0,
    } as Record<Element, number>
  },
  {
    id: "14",
    name: "Monopotassium Phosphate",
    formula: "KH2PO4",
    elements: {
      "K": 28.7,
      "P": 22.8,
    } as Record<Element, number>
  },
  {
    id: "15",
    name: "Potassium Chloride",
    formula: "KCl",
    elements: {
      "K": 52.4,
      "Cl": 47.6,
    } as Record<Element, number>
  },
  {
    id: "16",
    name: "Potassium Nitrate",
    formula: "KNO3",
    elements: {
      "N(NO3-)": 13.9,
      "K": 38.6,
    } as Record<Element, number>
  },
  {
    id: "17",
    name: "Potassium Sulfate",
    formula: "K2SO4",
    elements: {
      "K": 44.9,
      "S": 18.4,
    } as Record<Element, number>
  },
  {
    id: "18",
    name: "Sodium Molybdate",
    formula: "Na2MoO4·2H2O",
    elements: {
      "Mo": 39.6,
      "Na": 9.6,
    } as Record<Element, number>
  },
  {
    id: "19",
    name: "Sodium Silicate",
    formula: "Na2SiO3·9H2O",
    elements: {
      "Si": 6.7,
      "Na": 10.0,
    } as Record<Element, number>
  },
  {
    id: "20",
    name: "Urea",
    formula: "CO(NH2)2",
    elements: {
      "N(NH4+)": 46.6,
    } as Record<Element, number>
  },
  {
    id: "21",
    name: "Zinc Sulfate",
    formula: "ZnSO4·7H2O",
    elements: {
      "Zn": 22.7,
      "S": 11.2,
    } as Record<Element, number>
  },
  {
    id: "22",
    name: "Calcium Sulfate",
    formula: "CaSO4·2H2O",
    elements: {
      "Ca": 23.3,
      "S": 18.6,
    } as Record<Element, number>
  },
  {
    id: "23",
    name: "Potassium Dibasic Phosphate",
    formula: "K2HPO4",
    elements: {
      "K": 44.9,
      "P": 17.8,
    } as Record<Element, number>
  },
  {
    id: "24",
    name: "Calcium Chloride Anhydrous",
    formula: "CaCl2",
    elements: {
      "Ca": 36.1,
      "Cl": 63.9,
    } as Record<Element, number>
  }
];

export default STANDARD_SUBSTANCES;
