import { useState, useEffect } from "react";
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
import { getSavedRecipes, getPlants, savePlants } from "@/lib/localStorageUtils";
import { Badge } from "@/components/ui/badge";

const Recipes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [deletingRecipeId, setDeletingRecipeId] = useState(null);
  const [applyingRecipeId, setApplyingRecipeId] = useState(null);
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  
  // Load recipes and plants from localStorage
  useEffect(() => {
    const savedRecipes = getSavedRecipes();
    setRecipes(savedRecipes);
    
    const savedPlants = getPlants();
    setPlants(savedPlants);
  }, []);
  
  const handleCopyRecipe = (recipe) => {
    // Create a text representation of the recipe
    let recipeText = `${recipe.name}\n`;
    recipeText += `${recipe.description || ""}\n\n`;
    recipeText += `Stage: ${recipe.stage}\n\n`;
    
    recipeText += "Substances:\n";
    recipe.substances.forEach(substance => {
      recipeText += `- ${substance.name}: ${substance.amount} g/L\n`;
    });
    
    recipeText += "\nElements (ppm):\n";
    Object.entries(recipe.elementConcentrations).forEach(([element, value]) => {
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
    Object.entries(recipe.elementConcentrations).forEach(([element, value]) => {
      if (typeof value === 'number') {
        csvContent += `${element},${value}\n`;
      }
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
      // Get existing recipes from localStorage
      const savedRecipes = getSavedRecipes();
      const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== deletingRecipeId);
      
      // Save updated recipes back to localStorage
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
      
      // Update state
      setRecipes(updatedRecipes);
      setDeletingRecipeId(null);
      
      toast({
        title: t("recipes.deleted"),
        description: t("recipes.recipeDeleted")
      });
    }
  };
  
  const handleApplyToPlant = (recipeId) => {
    setApplyingRecipeId(recipeId);
  };
  
  const confirmApplyToPlant = () => {
    if (!selectedPlantId || !applyingRecipeId) {
      toast({
        title: t("common.error"),
        description: t("recipes.selectPlant"),
        variant: "destructive"
      });
      return;
    }
    
    const recipe = recipes.find(r => r.id === applyingRecipeId);
    const allPlants = getPlants();
    const plantIndex = allPlants.findIndex(p => p.id === selectedPlantId);
    
    if (recipe && plantIndex !== -1) {
      // Add recipe to plant's recipes
      if (!allPlants[plantIndex].recipes) {
        allPlants[plantIndex].recipes = [];
      }
      
      const recipeToAdd = {
        id: recipe.id,
        name: recipe.name,
        date: new Date().toLocaleDateString()
      };
      
      allPlants[plantIndex].recipes.unshift(recipeToAdd);
      allPlants[plantIndex].lastUpdated = new Date().toISOString();
      
      // Update plants in localStorage
      savePlants(allPlants);
      
      // Show success message
      toast({
        title: t("common.success"),
        description: t("recipes.recipeAppliedToPlant")
      });
      
      // Reset and close dialog
      setApplyingRecipeId(null);
      setSelectedPlantId(null);
      
      // Navigate to the plant details
      navigate(`/plants/${selectedPlantId}`);
    }
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
                      <span className="flex items-center">
                        {substance.name}
                        {substance.custom && (
                          <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>
                        )}
                      </span>
                      <span>{substance.amount.toFixed(3)} g/L</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Elements (ppm):</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(recipe.elementConcentrations).map(([element, value]) => {
                      // Skip elements with zero or very small values
                      // Explicitly type check the value
                      const numValue = typeof value === 'number' ? value : 0;
                      if (Math.abs(numValue) < 0.01) return null;
                      
                      // Convert element to string if it's not already
                      const elementKey = String(element);
                      
                      return (
                        <span 
                          key={elementKey} 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted"
                        >
                          {t(`elements.${elementKey}`) || elementKey}: {parseFloat(String(numValue)).toFixed(1)}
                        </span>
                      );
                    })}
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
                    onClick={() => handleApplyToPlant(recipe.id)}
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
            {plants.length > 0 ? (
              <div className="space-y-2">
                {plants.map(plant => (
                  <div 
                    key={plant.id} 
                    className={`p-3 border rounded-md cursor-pointer flex items-center ${
                      selectedPlantId === plant.id ? 'border-primary bg-primary/10' : ''
                    }`}
                    onClick={() => setSelectedPlantId(plant.id)}
                  >
                    {plant.image && (
                      <img 
                        src={plant.image} 
                        alt={plant.name} 
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium">{plant.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {plant.strain} • {plant.currentStage}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted-foreground">{t("plants.noPlants")}</p>
                <Button className="mt-4" asChild>
                  <Link to="/plants">
                    {t("plants.addPlant")}
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setApplyingRecipeId(null);
              setSelectedPlantId(null);
            }}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={confirmApplyToPlant}
              disabled={!selectedPlantId || plants.length === 0}
            >
              {t("common.apply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recipes;
