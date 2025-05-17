
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Edit, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getPlants, savePlants, getSavedRecipes } from "@/lib/localStorageUtils";
import { formatDecimal, parseDecimalInput } from "@/lib/formatters";

const PlantDetail = () => {
  const { plantId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyRecipeDialogOpen, setApplyRecipeDialogOpen] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  
  useEffect(() => {
    // Load plant from localStorage
    const plants = getPlants();
    const foundPlant = plants.find(p => p.id === plantId);
    
    if (foundPlant) {
      // Add logs if they don't exist
      if (!foundPlant.logs) {
        foundPlant.logs = [
          { date: "May 10", temperature: 24, humidity: 60, ppm: 650 },
          { date: "May 11", temperature: 25, humidity: 58, ppm: 655 },
          { date: "May 12", temperature: 24, humidity: 59, ppm: 660 },
          { date: "May 13", temperature: 26, humidity: 57, ppm: 670 },
          { date: "May 14", temperature: 25, humidity: 61, ppm: 680 },
          { date: "May 15", temperature: 24, humidity: 60, ppm: 685 },
          { date: "May 16", temperature: 25, humidity: 59, ppm: 690 }
        ];
      }
      
      // Add recipes if they don't exist
      if (!foundPlant.recipes) {
        foundPlant.recipes = [];
      }
      
      setPlant(foundPlant);
    } else {
      toast({
        title: t("plants.notFound"),
        description: t("plants.plantNotFound"),
        variant: "destructive"
      });
      navigate("/plants");
    }
    
    setLoading(false);
    
    // Load recipes
    const savedRecipes = getSavedRecipes();
    setRecipes(savedRecipes);
  }, [plantId, navigate, t]);
  
  const handleApplyRecipe = () => {
    setApplyRecipeDialogOpen(true);
  };
  
  const confirmApplyRecipe = () => {
    if (!selectedRecipeId) {
      toast({
        title: t("common.error"),
        description: t("recipes.selectRecipe"),
        variant: "destructive"
      });
      return;
    }
    
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (recipe) {
      const plants = getPlants();
      const plantIndex = plants.findIndex(p => p.id === plantId);
      
      if (plantIndex !== -1) {
        // Update the plant with the new recipe
        if (!plants[plantIndex].recipes) {
          plants[plantIndex].recipes = [];
        }
        
        // Add recipe to plant's recipes
        const recipeToAdd = {
          id: recipe.id,
          name: recipe.name,
          date: new Date().toLocaleDateString()
        };
        
        plants[plantIndex].recipes.unshift(recipeToAdd);
        plants[plantIndex].lastUpdated = new Date().toISOString();
        
        // Update plant in localStorage
        savePlants(plants);
        
        // Update local state
        setPlant(plants[plantIndex]);
        
        // Close dialog and show success message
        setApplyRecipeDialogOpen(false);
        setSelectedRecipeId(null);
        
        toast({
          title: t("common.success"),
          description: t("recipes.recipeApplied")
        });
      }
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <div className="animate-pulse">
              {t("common.loading")}...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!plant) {
    return null; // Should never reach here due to navigate in useEffect
  }
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <div className="aspect-video md:aspect-square relative">
              <img 
                src={plant.image}
                alt={plant.name}
                className="object-cover w-full h-full rounded-t-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                <p>{plant.currentStage}</p>
              </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{plant.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(`/plants/${plant.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="font-medium">{t("plants.strain")}:</div>
                <div>{plant.strain}</div>
                
                <div className="font-medium">{t("plants.medium")}:</div>
                <div>{plant.medium}</div>
                
                <div className="font-medium">{t("plants.environment")}:</div>
                <div>{plant.environment}</div>
                
                <div className="font-medium">{t("plants.potSize")}:</div>
                <div>{plant.potSize}</div>
                
                <div className="font-medium">{t("plants.lightType")}:</div>
                <div>{plant.lightType}</div>
                
                <div className="font-medium">{t("plants.germDate")}:</div>
                <div>{new Date(plant.germDate).toLocaleDateString()}</div>
                
                <div className="font-medium">{t("plants.lastUpdated")}:</div>
                <div>{new Date(plant.lastUpdated).toLocaleString()}</div>
              </div>
              
              <Button className="w-full" onClick={handleApplyRecipe}>
                {t("plants.applyRecipe")}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <Tabs defaultValue="logs">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="logs">{t("plants.dailyLog")}</TabsTrigger>
              <TabsTrigger value="recipes">{t("recipes.title")}</TabsTrigger>
            </TabsList>
            <TabsContent value="logs" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("plants.temperature")} & {t("plants.humidity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={plant.logs}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" name={t("plants.temperature") + " (°C)"} />
                        <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#82ca9d" name={t("plants.humidity") + " (%)"} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>PPM/EC</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={plant.logs}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="ppm" stroke="#ff7300" name="PPM" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recipes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("recipes.myRecipes")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plant.recipes && plant.recipes.length > 0 ? (
                      plant.recipes.map((recipe) => (
                        <div key={recipe.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5" />
                            <div>
                              <p className="font-medium">{recipe.name}</p>
                              <p className="text-sm text-muted-foreground">Applied: {recipe.date}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/recipes">
                              {t("common.view")}
                            </Link>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-muted-foreground">{t("recipes.noRecipesApplied")}</p>
                      </div>
                    )}
                    <Button className="w-full" onClick={handleApplyRecipe}>
                      {t("plants.applyRecipe")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Apply Recipe Dialog */}
      <Dialog open={applyRecipeDialogOpen} onOpenChange={setApplyRecipeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("plants.applyRecipe")}</DialogTitle>
            <DialogDescription>
              {t("recipes.selectRecipeToApply")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {recipes.length > 0 ? (
              <div className="space-y-2">
                {recipes.map(recipe => (
                  <div 
                    key={recipe.id} 
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedRecipeId === recipe.id ? 'border-primary bg-primary/10' : ''
                    }`}
                    onClick={() => setSelectedRecipeId(recipe.id)}
                  >
                    <div className="font-medium">{recipe.name}</div>
                    {recipe.description && (
                      <div className="text-sm text-muted-foreground">{recipe.description}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted-foreground">{t("recipes.noRecipes")}</p>
                <Button className="mt-4" asChild>
                  <Link to="/calculator">
                    {t("recipes.createRecipe")}
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setApplyRecipeDialogOpen(false);
              setSelectedRecipeId(null);
            }}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={confirmApplyRecipe} 
              disabled={!selectedRecipeId || recipes.length === 0}
            >
              {t("common.apply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlantDetail;
