
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Leaf, Calculator, Trash, Copy, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

// Mock recipes data - would come from Supabase in production
const mockRecipes = [
  {
    id: "1",
    name: "Veg Base Nutrient Mix",
    description: "Standard nutrient solution for vegetative growth stage",
    stage: "Vegetative",
    lastUsed: "2025-05-10T10:30:00Z",
    substances: [
      { id: "1", name: "Calcium Nitrate", amount: 0.95 },
      { id: "2", name: "Master Blend", amount: 0.6 },
      { id: "3", name: "Magnesium Sulfate", amount: 0.6 },
    ],
    elements: {
      "N(NO3-)": 199,
      "N(NH4+)": 0,
      P: 62,
      K: 207,
      Ca: 242,
      Mg: 60,
      S: 132
    }
  },
  {
    id: "2",
    name: "Flowering Mix",
    description: "Enhanced phosphorus and potassium for flowering stage",
    stage: "Flowering",
    lastUsed: "2025-05-15T14:45:00Z",
    substances: [
      { id: "1", name: "Calcium Nitrate", amount: 0.75 },
      { id: "2", name: "Monopotassium Phosphate", amount: 0.7 },
      { id: "3", name: "Magnesium Sulfate", amount: 0.5 },
      { id: "4", name: "Potassium Sulfate", amount: 0.4 },
    ],
    elements: {
      "N(NO3-)": 150,
      "N(NH4+)": 0,
      P: 100,
      K: 300,
      Ca: 200,
      Mg: 55,
      S: 120
    }
  },
  {
    id: "3",
    name: "Micronutrient Boost",
    description: "Supplementary mix for micronutrient deficiencies",
    stage: "Any",
    lastUsed: "2025-05-12T09:15:00Z",
    substances: [
      { id: "1", name: "Chelated Iron", amount: 0.05 },
      { id: "2", name: "Manganese Sulfate", amount: 0.02 },
      { id: "3", name: "Zinc Sulfate", amount: 0.01 },
      { id: "4", name: "Borax", amount: 0.01 },
      { id: "5", name: "Copper Sulfate", amount: 0.005 },
    ],
    elements: {
      Fe: 5,
      Mn: 2,
      Zn: 1,
      B: 1,
      Cu: 0.5
    }
  },
];

const Recipes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState(mockRecipes);
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);
  const [applyingRecipeId, setApplyingRecipeId] = useState<string | null>(null);
  
  const handleCopyRecipe = (recipe) => {
    // Create a text representation of the recipe
    let recipeText = `${recipe.name}\n`;
    recipeText += `${recipe.description}\n\n`;
    recipeText += `Stage: ${recipe.stage}\n\n`;
    
    recipeText += "Substances:\n";
    recipe.substances.forEach(substance => {
      recipeText += `- ${substance.name}: ${substance.amount} g/L\n`;
    });
    
    recipeText += "\nElements (ppm):\n";
    Object.entries(recipe.elements).forEach(([element, value]) => {
      recipeText += `- ${element}: ${value}\n`;
    });
    
    navigator.clipboard.writeText(recipeText);
    toast({
      title: t("recipes.copied"),
      description: t("recipes.recipeCopiedToClipboard")
    });
  };
  
  const handleDownloadCSV = (recipe) => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Amount (g/L)\n";
    
    recipe.substances.forEach(substance => {
      csvContent += `${substance.name},${substance.amount}\n`;
    });
    
    csvContent += "\nElement,PPM\n";
    Object.entries(recipe.elements).forEach(([element, value]) => {
      csvContent += `${element},${value}\n`;
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${recipe.name.replace(/ /g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t("recipes.downloaded"),
      description: t("recipes.recipeDownloaded")
    });
  };
  
  const confirmDelete = () => {
    if (deletingRecipeId) {
      setRecipes(recipes.filter(recipe => recipe.id !== deletingRecipeId));
      setDeletingRecipeId(null);
      toast({
        title: t("recipes.deleted"),
        description: t("recipes.recipeDeleted")
      });
    }
  };
  
  const handleApplyToPlant = () => {
    // Close the dialog first
    setApplyingRecipeId(null);
    
    // Navigate to the plants page or show a plant selection dialog
    navigate("/plants");
    
    toast({
      title: t("recipes.applyReady"),
      description: t("recipes.selectPlantToApply")
    });
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("recipes.title")}</h1>
        <Button asChild>
          <Link to="/calculator">
            <Calculator className="mr-2 h-4 w-4" />
            {t("recipes.createRecipe")}
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">{t("recipes.noRecipes")}</h3>
            <p className="text-muted-foreground mb-4">{t("recipes.createRecipe")}</p>
            <Button asChild>
              <Link to="/calculator">
                <Calculator className="mr-2 h-4 w-4" />
                {t("recipes.createRecipe")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <CardTitle>{recipe.name}</CardTitle>
                <CardDescription>{recipe.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{t("recipes.targetStage")}:</span>
                    <span>{recipe.stage}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">{t("recipes.lastUsed")}:</span>
                    <span>{new Date(recipe.lastUsed).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Substances:</h4>
                  {recipe.substances.map((substance) => (
                    <div key={substance.id} className="flex justify-between text-sm">
                      <span>{substance.name}</span>
                      <span>{substance.amount} g/L</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Elements (ppm):</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(recipe.elements).map(([element, value]) => (
                      <span 
                        key={element} 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted"
                      >
                        {t(`elements.${element}`) || element}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyRecipe(recipe)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadCSV(recipe)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDeletingRecipeId(recipe.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setApplyingRecipeId(recipe.id)}
                  >
                    <Leaf className="h-4 w-4 mr-2" />
                    {t("recipes.applyToPlant")}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingRecipeId} onOpenChange={(open) => !open && setDeletingRecipeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("recipes.confirmDelete")}</DialogTitle>
            <DialogDescription>
              {t("recipes.deleteWarning")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRecipeId(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Apply Recipe Dialog */}
      <Dialog open={!!applyingRecipeId} onOpenChange={(open) => !open && setApplyingRecipeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("recipes.applyToPlant")}</DialogTitle>
            <DialogDescription>
              {t("recipes.selectPlantToApply")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>{t("recipes.navigateToPlants")}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyingRecipeId(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleApplyToPlant}>
              <Leaf className="h-4 w-4 mr-2" />
              {t("recipes.goToPlants")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recipes;
