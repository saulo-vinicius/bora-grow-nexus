
import { useState, useEffect } from "react";
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
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CalculatorLogic, type Element } from "@/logic/CalculatorLogic";
import { STANDARD_SUBSTANCES, SubstanceData } from "@/data/SubstanceData";
import SubstanceSelectionPanel from "@/components/SubstanceSelectionPanel";
import CalculationResults from "@/components/CalculationResults";
// import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

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
    Fe: 2,
    Mn: 0.5,
    Zn: 0.3,
    B: 0.3,
    Cu: 0.1,
    Si: 0,
    Mo: 0.05,
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
    Fe: 2,
    Mn: 0.5,
    Zn: 0.3,
    B: 0.3,
    Cu: 0.1,
    Si: 0,
    Mo: 0.05,
    Na: 0,
    Cl: 0
  } as TargetElements
};

const Calculator = () => {
  const { t } = useTranslation();
  const [solutionVolume, setSolutionVolume] = useState<number>(1);
  const [volumeUnit, setVolumeUnit] = useState<string>("liters");
  const [massUnit, setMassUnit] = useState<string>("grams");
  
  const [targetMode, setTargetMode] = useState<"veg" | "flowering">("veg");
  const [targets, setTargets] = useState<TargetElements>({ ...DEFAULT_TARGETS.veg });
  
  const [availableSubstances, setAvailableSubstances] = useState<SubstanceData[]>(STANDARD_SUBSTANCES);
  const [selectedSubstances, setSelectedSubstances] = useState<SubstanceData[]>([]);
  
  // Results state
  const [results, setResults] = useState<any>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  // Save recipe state
  const [isSavingRecipe, setIsSavingRecipe] = useState<boolean>(false);
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);
  
  // This function will be called when we want to load custom substances from Supabase
  const loadCustomSubstances = async () => {
    try {
      // This would be implemented when Supabase is integrated
      // const { data, error } = await supabase
      //  .from('substances')
      //  .select('*')
      //  .eq('user_id', auth.user()?.id);
      // 
      // if (error) throw error;
      //
      // const customSubstances = data.map(item => ({
      //   ...item,
      //   custom: true,
      // }));
      //
      // setAvailableSubstances([...STANDARD_SUBSTANCES, ...customSubstances]);
    } catch (error) {
      console.error("Error loading custom substances:", error);
      // Fall back to standard substances
      setAvailableSubstances(STANDARD_SUBSTANCES);
    }
  };
  
  const addCustomSubstance = (substance: SubstanceData) => {
    // In a real implementation, this would save to Supabase
    // try {
    //   const { error } = await supabase.from('substances').insert({
    //     ...substance,
    //     user_id: auth.user()?.id
    //   });
    //   if (error) throw error;
    // } catch (error) {
    //   console.error('Error saving custom substance:', error);
    // }
    
    // For now, just add to local state
    setAvailableSubstances(prev => [...prev, substance]);
  };
  
  const selectSubstance = (substance: SubstanceData) => {
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
  
  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      setCalculationError(null);
      
      // Make sure we have at least one substance and one target
      if (selectedSubstances.length === 0) {
        throw new Error(t("calculator.errors.noSubstancesSelected"));
      }
      
      const hasTargets = Object.values(targets).some(value => value > 0);
      if (!hasTargets) {
        throw new Error(t("calculator.errors.noTargetsSpecified"));
      }
      
      const calculator = new CalculatorLogic();
      const calculationResults = calculator.calculateNutrientSolution(
        selectedSubstances,
        targets,
        solutionVolume
      );
      
      // Update selected substances with calculated amounts
      setSelectedSubstances(calculationResults.substances);
      
      setResults(calculationResults);
    } catch (error) {
      console.error("Calculation error:", error);
      setCalculationError(`${t("calculator.errors.calculationError")}: ${error.message}`);
      setResults(null);
      
      toast({
        title: t("calculator.errors.calculationError"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
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
  };
  
  const handleSaveRecipe = () => {
    // This would be implemented when Supabase is integrated
    setShowSaveForm(true);
  };
  
  const exportToCsv = () => {
    if (!results) return;
    
    // Create CSV content
    let csvContent = "Nutrientes,Alvo (ppm),Real (ppm),Diferença\n";
    
    Object.keys(targets).forEach((element) => {
      const targetValue = targets[element as keyof TargetElements];
      const actualValue = results.elementConcentrations[element] || 0;
      
      // Skip elements with zero values for both target and actual
      if (targetValue === 0 && Math.abs(actualValue) < 0.001) {
        return;
      }
      
      const difference = actualValue - targetValue;
      csvContent += `${element},${targetValue.toFixed(2)},${actualValue.toFixed(2)},${difference.toFixed(2)}\n`;
    });
    
    csvContent += `\nSubstância,Quantidade (${massUnit})\n`;
    
    results.substances.forEach((substance: any) => {
      if (substance.amount > 0.001) {
        csvContent += `${substance.name},${substance.amount.toFixed(3)}\n`;
      }
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `nutrient-solution-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t("calculator.exportSuccessful"),
      description: t("calculator.fileDownloaded"),
    });
  };
  
  const copyResultsToClipboard = () => {
    if (!results) return;
    
    let text = `Solução Nutritiva - Bora Grow\n\n`;
    text += `Volume: ${solutionVolume} ${volumeUnit}\n\n`;
    
    text += `Substâncias:\n`;
    results.substances.forEach((substance: any) => {
      if (substance.amount > 0.001) {
        text += `${substance.name}: ${substance.amount.toFixed(3)} ${massUnit}\n`;
      }
    });
    
    text += `\nConcentrações de Elementos (ppm):\n`;
    Object.keys(targets).forEach((element) => {
      const targetValue = targets[element as keyof TargetElements];
      const actualValue = results.elementConcentrations[element] || 0;
      
      if (targetValue > 0 || actualValue > 0.001) {
        text += `${element}: ${actualValue.toFixed(2)} (alvo: ${targetValue.toFixed(2)})\n`;
      }
    });
    
    text += `\nEC Previsto: ${results.predictedEc.toFixed(2)} mS/cm`;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: t("calculator.copiedToClipboard"),
          description: t("calculator.resultsCopied"),
        });
      })
      .catch(() => {
        toast({
          title: t("calculator.copyError"),
          description: t("calculator.couldNotCopy"),
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    // Load any custom substances if Supabase is integrated
    // loadCustomSubstances();
  }, []);
  
  return (
    <div className="container mx-auto pb-8">
      <h1 className="text-3xl font-bold mb-6">{t("calculator.title")}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Solution Settings & Target Concentrations */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.keys(targets).map((element) => (
                  <div key={element}>
                    <Label htmlFor={`target-${element}`}>{t(`elements.${element}`) || element}</Label>
                    <Input
                      id={`target-${element}`}
                      type="number"
                      value={targets[element as keyof TargetElements]}
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
          <SubstanceSelectionPanel
            substances={availableSubstances}
            selectedSubstances={selectedSubstances}
            onSelectSubstance={selectSubstance}
            onRemoveSubstance={removeSubstance}
            onSubstanceAmountChange={handleSubstanceAmountChange}
            massUnit={massUnit}
            addCustomSubstance={addCustomSubstance}
          />
          
          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              onClick={handleCalculate}
              disabled={selectedSubstances.length === 0 || isCalculating}
            >
              {isCalculating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {t("calculator.calculating")}
                </>
              ) : (
                t("calculator.calculate")
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedSubstances([]);
                clearTargets();
                setResults(null);
              }}
            >
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
        <CalculationResults
          results={results}
          targets={targets}
          solutionVolume={solutionVolume}
          volumeUnit={volumeUnit}
          massUnit={massUnit}
          onSaveClick={handleSaveRecipe}
          exportToCsv={exportToCsv}
          copyResultsToClipboard={copyResultsToClipboard}
        />
      )}
      
      {/* This would be a dialog/modal for saving recipes when Supabase is integrated */}
      {/*
      <Dialog open={showSaveForm} onOpenChange={setShowSaveForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("calculator.saveRecipe")}</DialogTitle>
            <DialogDescription>
              {t("calculator.saveRecipeDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...saveRecipeForm}>
            <form onSubmit={saveRecipeForm.handleSubmit(handleSaveRecipe)} className="space-y-4">
              <FormField
                control={saveRecipeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("calculator.recipeName")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={saveRecipeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("calculator.recipeDescription")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowSaveForm(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingRecipe}
                >
                  {isSavingRecipe ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    t("common.save")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      */}
    </div>
  );
};

export default Calculator;
