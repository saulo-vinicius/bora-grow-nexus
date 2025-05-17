
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
import { Search, X, Plus, FileText, Copy, Download, Save, Loader } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { CalculatorLogic, type Element } from "@/logic/CalculatorLogic";
import { STANDARD_SUBSTANCES } from "@/data/SubstanceData";
// import { supabase } from "@/integrations/supabase/client";

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

// Save recipe form schema
const saveRecipeSchema = z.object({
  name: z.string().min(1, "Nome da receita é obrigatório"),
  description: z.string().optional(),
});

type SaveRecipeForm = z.infer<typeof saveRecipeSchema>;

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
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  // Save recipe state
  const [isSavingRecipe, setIsSavingRecipe] = useState<boolean>(false);
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);
  
  const filteredSubstances = STANDARD_SUBSTANCES.filter(substance => 
    substance.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Initialize save recipe form
  const saveRecipeForm = useForm<SaveRecipeForm>({
    resolver: zodResolver(saveRecipeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

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
      // setAllSubstances([...STANDARD_SUBSTANCES, ...customSubstances]);
    } catch (error) {
      console.error("Error loading custom substances:", error);
      // Fall back to standard substances
    }
  };
  
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
  
  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      setCalculationError(null);
      
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
      setCalculationError(`Erro no cálculo: ${error.message}`);
      setResults(null);
      
      toast({
        title: "Erro no cálculo",
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
  
  const handleSaveRecipe = async (data: SaveRecipeForm) => {
    // In a real application, this would save to Supabase
    // const { name, description } = data;
    
    try {
      setIsSavingRecipe(true);
      
      // This would be implemented when Supabase is integrated
      // const { error } = await supabase
      //   .from('recipes')
      //   .insert({
      //     user_id: auth.user()?.id,
      //     name,
      //     description,
      //     target_elements: targets,
      //     solution_substances: selectedSubstances,
      //     volume: solutionVolume,
      //     volume_unit: volumeUnit,
      //   });
      //
      // if (error) throw error;
      
      toast({
        title: "Receita salva",
        description: "Sua receita foi salva com sucesso.",
      });
      
      setShowSaveForm(false);
    } catch (error) {
      console.error("Error saving recipe:", error);
      
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a receita.",
        variant: "destructive",
      });
    } finally {
      setIsSavingRecipe(false);
    }
  };
  
  const exportToCsv = () => {
    if (!results) return;
    
    // Create CSV content
    let csvContent = "Nutrientes,Alvo (ppm),Real (ppm),Diferença\n";
    
    Object.keys(targets).forEach((element) => {
      const targetValue = targets[element as keyof TargetElements];
      const actualValue = results.elementConcentrations[element] || 0;
      const difference = actualValue - targetValue;
      
      csvContent += `${element},${targetValue.toFixed(2)},${actualValue.toFixed(2)},${difference.toFixed(2)}\n`;
    });
    
    csvContent += "\nSubstância,Quantidade (${massUnit})\n";
    
    results.substances.forEach((substance) => {
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
  };
  
  const copyResultsToClipboard = () => {
    if (!results) return;
    
    let text = `Solução Nutritiva - Bora Grow\n\n`;
    text += `Volume: ${solutionVolume} ${volumeUnit}\n\n`;
    
    text += `Substâncias:\n`;
    results.substances.forEach((substance) => {
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
          title: "Copiado para a área de transferência",
          description: "Os resultados foram copiados.",
        });
      })
      .catch(() => {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar os resultados.",
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    // Load any custom substances if Supabase is integrated
    // loadCustomSubstances();
  }, []);
  
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
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("calculator.substanceDatabase")}</CardTitle>
                <Button size="sm" disabled>
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
                        <Label htmlFor={`amount-${substance.id}`}>{massUnit}</Label>
                        <Input
                          id={`amount-${substance.id}`}
                          type="number"
                          value={substance.amount?.toFixed(3) || 0}
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
                  {results.substances.map((substance) => (
                    substance.amount > 0.001 && (
                      <div key={substance.id} className="flex justify-between items-center border-b pb-2">
                        <div>{substance.name}</div>
                        <div className="font-medium">{substance.amount.toFixed(3)} {massUnit}</div>
                      </div>
                    )
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
                      {Object.keys(targets).map((element) => {
                        const targetVal = targets[element as keyof TargetElements];
                        const actualVal = results.elementConcentrations[element] || 0;
                        const diff = actualVal - targetVal;
                        
                        // Skip elements with zero values for both target and actual
                        if (targetVal === 0 && Math.abs(actualVal) < 0.001) {
                          return null;
                        }
                        
                        return (
                          <tr key={element} className="border-b">
                            <td className="py-2">{t(`elements.${element}`) || element}</td>
                            <td className="text-right py-2">{targetVal.toFixed(2)}</td>
                            <td className="text-right py-2">{actualVal.toFixed(2)}</td>
                            <td className={`text-right py-2 ${
                              diff < 0 ? "text-destructive" : 
                              diff > 0 ? "text-green-500" : ""
                            }`}>
                              {diff.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium text-lg">{t("calculator.predictedEcValue")}: {results.predictedEc.toFixed(2)} mS/cm</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("calculator.ecDescription")}</p>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={exportToCsv}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("calculator.exportRecipe")}
                </Button>
                <Button variant="outline" className="flex-1" onClick={copyResultsToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  {t("calculator.copyResults")}
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => setShowSaveForm(true)}
                  disabled
                >
                  <Save className="mr-2 h-4 w-4" />
                  {t("calculator.saveRecipe")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
