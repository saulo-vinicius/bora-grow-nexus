import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, X, Plus, FileText, Copy, Download, Save } from "lucide-react";

import { CalculatorLogic } from "@/logic/CalculatorLogic";

// Define interface for targets to fix TypeScript errors
interface TargetElements {
  "N(NO3-)": number;
  "N(NH4+)": number;
  P: number;
  K: number;
  Ca: number;
  Mg: number;
  S: number;
  Fe: number;
  Mn: number;
  Zn: number;
  B: number;
  Cu: number;
  Si: number;
  Mo: number;
  Na: number;
  Cl: number;
}

const DEFAULT_TARGETS = {
  veg: {
    "N(NO3-)": 199,
    "N(NH4+)": 0,
    P: 62,
    K: 207,
    Ca: 242,
    Mg: 60,
    S: 132,
    Fe: 0,
    Mn: 0,
    Zn: 0,
    B: 0,
    Cu: 0,
    Si: 0,
    Mo: 0,
    Na: 0,
    Cl: 0
  } as TargetElements,
  flowering: {
    "N(NO3-)": 150,
    "N(NH4+)": 0,
    P: 100,
    K: 300,
    Ca: 200,
    Mg: 55,
    S: 120,
    Fe: 0,
    Mn: 0,
    Zn: 0,
    B: 0,
    Cu: 0,
    Si: 0,
    Mo: 0,
    Na: 0,
    Cl: 0
  } as TargetElements
};

// Mock substances from HydroBuddy
const MOCK_SUBSTANCES = [
  {
    id: "1",
    name: "Ammonium Chloride",
    formula: "NH4Cl",
    elements: {
      "N(NH4+)": 26.2,
      Cl: 66.3
    }
  },
  {
    id: "2",
    name: "Ammonium Dibasic Phosphate",
    formula: "(NH4)2HPO4",
    elements: {
      "N(NH4+)": 21.2,
      P: 23.5
    }
  },
  {
    id: "3",
    name: "Ammonium Monobasic Phosphate",
    formula: "NH4H2PO4",
    elements: {
      "N(NH4+)": 12.2,
      P: 26.7
    }
  },
  {
    id: "4",
    name: "Ammonium Sulfate",
    formula: "(NH4)2SO4",
    elements: {
      "N(NH4+)": 21.2,
      S: 24.3
    }
  },
  {
    id: "5",
    name: "Boric Acid",
    formula: "H3BO3",
    elements: {
      B: 17.5
    }
  }
];

const Calculator = () => {
  const { t } = useTranslation();
  const [solutionVolume, setSolutionVolume] = useState<number>(1);
  const [volumeUnit, setVolumeUnit] = useState<string>("liters");
  const [massUnit, setMassUnit] = useState<string>("grams");
  
  const [targetMode, setTargetMode] = useState<"veg" | "flowering">("veg");
  const [targets, setTargets] = useState<TargetElements>({ ...DEFAULT_TARGETS.veg });
  
  const [selectedSubstances, setSelectedSubstances] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Results state
  const [results, setResults] = useState<any>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  
  const filteredSubstances = MOCK_SUBSTANCES.filter(substance => 
    substance.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectSubstance = (substance: any) => {
    if (!selectedSubstances.find(s => s.id === substance.id)) {
      setSelectedSubstances([...selectedSubstances, { ...substance, amount: 0 }]);
    }
  };
  
  const removeSubstance = (id: string) => {
    setSelectedSubstances(selectedSubstances.filter(s => s.id !== id));
  };
  
  const handleTargetChange = (element: string, value: string) => {
    setTargets({
      ...targets,
      [element]: value === "" ? 0 : parseFloat(value)
    });
  };
  
  const loadDefaultTargets = (mode: "veg" | "flowering") => {
    setTargetMode(mode);
    setTargets({ ...DEFAULT_TARGETS[mode] });
  };
  
  const clearTargets = () => {
    const emptyTargets: TargetElements = { ...targets };
    Object.keys(targets).forEach(key => {
      emptyTargets[key as keyof TargetElements] = 0;
    });
    setTargets(emptyTargets);
  };
  
  const handleCalculate = () => {
    try {
      const calculator = new CalculatorLogic();
      const calculationResults = calculator.calculateNutrientSolution(
        selectedSubstances,
        targets,
        solutionVolume
      );
      setResults(calculationResults);
      setCalculationError(null);
      
      // In a real app, we would update the selected substances with the calculated amounts
      // setSelectedSubstances(calculationResults.substances);
    } catch (error) {
      console.error("Calculation error:", error);
      setCalculationError("Failed to calculate nutrient solution. Please check your inputs.");
      setResults(null);
    }
  };
  
  const handleSubstanceAmountChange = (id: string, value: string) => {
    const updatedSubstances = selectedSubstances.map(s => {
      if (s.id === id) {
        return { ...s, amount: value === "" ? 0 : parseFloat(value) };
      }
      return s;
    });
    setSelectedSubstances(updatedSubstances);
    
    // In a real app, we would recalculate the element concentrations based on the new amounts
    // This would trigger a new calculation or update the existing one
  };
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("calculator.title")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Solution Settings & Target Concentrations */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="solution-volume">{t("calculator.solutionVolume")}</Label>
                  <div className="flex mt-1">
                    <Input
                      id="solution-volume"
                      type="number"
                      value={solutionVolume}
                      onChange={(e) => setSolutionVolume(parseFloat(e.target.value) || 0)}
                      min="0.1"
                      step="0.1"
                      className="rounded-r-none"
                    />
                    <Select value={volumeUnit} onValueChange={setVolumeUnit}>
                      <SelectTrigger className="w-[120px] rounded-l-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liters">{t("common.liters")}</SelectItem>
                        <SelectItem value="gallons">{t("common.gallons")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="mass-units">{t("calculator.massUnits")}</Label>
                  <Select value={massUnit} onValueChange={setMassUnit}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grams">{t("common.grams")}</SelectItem>
                      <SelectItem value="milligrams">{t("common.milligrams")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant={targetMode === "veg" ? "default" : "outline"}
              onClick={() => loadDefaultTargets("veg")}
              className="w-full"
            >
              {t("calculator.veg")}
            </Button>
            <Button 
              variant={targetMode === "flowering" ? "default" : "outline"}
              onClick={() => loadDefaultTargets("flowering")}
              className="w-full"
            >
              {t("calculator.flowering")}
            </Button>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{t("calculator.targetConcentrations")} (ppm)</CardTitle>
              <Button variant="outline" size="sm" onClick={clearTargets}>
                {t("calculator.clearValues")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(targets).map((element) => (
                  <div key={element}>
                    <Label htmlFor={`target-${element}`}>{t(`elements.${element}`) || element}</Label>
                    <Input
                      id={`target-${element}`}
                      type="number"
                      value={targets[element]}
                      onChange={(e) => handleTargetChange(element, e.target.value)}
                      min="0"
                      step="0.1"
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: Substance Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("calculator.substanceDatabase")}</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("calculator.addCustom")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("calculator.search")}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
                {filteredSubstances.map((substance) => (
                  <div key={substance.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{substance.name}</h4>
                        <p className="text-sm text-muted-foreground">{substance.formula}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => selectSubstance(substance)}
                        disabled={selectedSubstances.some(s => s.id === substance.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 space-x-2">
                      {Object.entries(substance.elements).map(([element, percentage]) => (
                        <span key={element} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted">
                          {element}: {percentage}%
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                
                {filteredSubstances.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No substances found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("calculator.substanceSelection")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedSubstances.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No substances selected
                  </p>
                ) : (
                  selectedSubstances.map((substance) => (
                    <div key={substance.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{substance.name}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeSubstance(substance.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <Label htmlFor={`amount-${substance.id}`}>{t("common.grams")}</Label>
                        <Input
                          id={`amount-${substance.id}`}
                          type="number"
                          value={substance.amount}
                          onChange={(e) => handleSubstanceAmountChange(substance.id, e.target.value)}
                          min="0"
                          step="0.001"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              onClick={handleCalculate}
              disabled={selectedSubstances.length === 0}
            >
              {t("calculator.calculate")}
            </Button>
            
            <Button variant="outline" onClick={() => {
              setSelectedSubstances([]);
              clearTargets();
              setResults(null);
            }}>
              {t("calculator.clearAll")}
            </Button>
          </div>
        </div>
      </div>
      
      {calculationError && (
        <div className="mt-6 bg-destructive/20 border-destructive/50 border rounded-md p-4 text-destructive">
          {calculationError}
        </div>
      )}
      
      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("calculator.results")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">
                  {t("calculator.substanceWeights")} {solutionVolume} {volumeUnit}
                </h3>
                <div className="space-y-2">
                  {selectedSubstances.map((substance) => (
                    <div key={substance.id} className="flex justify-between items-center border-b pb-2">
                      <div>{substance.name}</div>
                      <div className="font-medium">{substance.amount.toFixed(3)} {massUnit}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">
                  {t("calculator.elementConcentrations")}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">{t("calculator.element")}</th>
                        <th className="text-right py-2">{t("calculator.target")} (ppm)</th>
                        <th className="text-right py-2">{t("calculator.actual")} (ppm)</th>
                        <th className="text-right py-2">{t("calculator.difference")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(targets).map((element) => (
                        <tr key={element} className="border-b">
                          <td className="py-2">{t(`elements.${element}`) || element}</td>
                          <td className="text-right py-2">{targets[element].toFixed(2)}</td>
                          <td className="text-right py-2">0.00</td>
                          <td className={`text-right py-2 ${targets[element] > 0 ? "text-destructive" : "text-green-500"}`}>
                            {targets[element] > 0 ? `-${targets[element].toFixed(2)}` : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium text-lg">{t("calculator.predictedEcValue")}: 0.00 mS/cm</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("calculator.ecDescription")}</p>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  {t("calculator.exportRecipe")}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  {t("calculator.copyResults")}
                </Button>
                <Button className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {t("calculator.saveRecipe")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Calculator;
