
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Download, Copy } from 'lucide-react';
import { Element } from "@/logic/CalculatorLogic";
import { toast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CalculationResultsProps {
  results: any;
  targets: Record<Element, number>;
  solutionVolume: number;
  volumeUnit: string;
  massUnit: string;
  onSaveClick: () => void;
  exportToCsv: () => void;
  copyResultsToClipboard: () => void;
}

const CalculationResults: React.FC<CalculationResultsProps> = ({
  results,
  targets,
  solutionVolume,
  volumeUnit,
  massUnit,
  onSaveClick,
  exportToCsv,
  copyResultsToClipboard
}) => {
  const { t } = useTranslation();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  
  if (!results) return null;
  
  const handleSaveClick = () => {
    setSaveDialogOpen(true);
  };
  
  const saveRecipe = () => {
    // Get existing recipes or initialize an empty array
    const existingRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    
    // Create a new recipe object
    const newRecipe = {
      id: Date.now().toString(),
      name: recipeName || `Recipe ${existingRecipes.length + 1}`,
      description: recipeDescription,
      substances: results.substances,
      elementConcentrations: results.elementConcentrations,
      predictedEc: results.predictedEc,
      stage: "Any", // This could be made dynamic
      lastUsed: new Date().toISOString(),
      solutionVolume,
      volumeUnit,
      massUnit
    };
    
    // Add the new recipe and save to localStorage
    existingRecipes.push(newRecipe);
    localStorage.setItem('savedRecipes', JSON.stringify(existingRecipes));
    
    // Close the dialog and show success toast
    setSaveDialogOpen(false);
    setRecipeName("");
    setRecipeDescription("");
    
    toast({
      title: t("recipes.saved"),
      description: t("recipes.recipeSaved")
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t("calculator.results")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {results.messages && results.messages.length > 0 && (
            <div className="bg-amber-50 border-amber-200 text-amber-800 border rounded-md p-4 mb-4">
              <h3 className="font-medium mb-2">{t("calculator.calculationNotes")}</h3>
              <ul className="list-disc pl-5 space-y-1">
                {results.messages.map((message: string, index: number) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-medium text-lg mb-2">
              {t("calculator.substanceWeights")} {solutionVolume} {volumeUnit}
            </h3>
            <div className="space-y-2">
              {results.substances
                .filter((substance: any) => substance.amount > 0.001)
                .map((substance: any) => (
                  <div key={substance.id} className="flex justify-between items-center border-b pb-2">
                    <div>{substance.name}</div>
                    <div className="font-medium">{substance.amount.toFixed(3)} {massUnit}</div>
                  </div>
                ))}
            </div>
          </div>
          
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="flex w-full items-center justify-between font-medium text-lg mb-2 hover:text-primary transition-colors">
              <span>{t("calculator.elementConcentrations")}</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent>
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
                      const targetVal = targets[element as Element];
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
                            Math.abs(diff) < 0.01 ? "text-green-500" :
                            diff < 0 ? "text-red-500" : 
                            diff > 0 ? "text-amber-500" : ""
                          }`}>
                            {diff.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium text-lg">{t("calculator.predictedEcValue")}: {results.predictedEc.toFixed(2)} mS/cm</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("calculator.ecDescription")}</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
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
              onClick={handleSaveClick}
            >
              <Save className="mr-2 h-4 w-4" />
              {t("calculator.saveRecipe")}
            </Button>
          </div>
        </div>
      </CardContent>
      
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("calculator.saveRecipe")}</DialogTitle>
            <DialogDescription>
              {t("recipes.enterRecipeDetails")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="recipe-name">{t("recipes.recipeName")}</Label>
              <Input
                id="recipe-name"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder={`Recipe ${new Date().toLocaleDateString()}`}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="recipe-description">{t("recipes.recipeDescription")}</Label>
              <Input
                id="recipe-description"
                value={recipeDescription}
                onChange={(e) => setRecipeDescription(e.target.value)}
                placeholder={t("recipes.optionalDescription")}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={saveRecipe}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CalculationResults;
