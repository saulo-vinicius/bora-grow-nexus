
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Edit, FileText } from "lucide-react";

// Mock data - would come from Supabase in production
const mockPlantDetails = {
  id: "1",
  name: "Northern Lights",
  strain: "Northern Lights",
  medium: "Soil",
  environment: "Indoor",
  potSize: "5 gal",
  lightType: "LED",
  currentStage: "Vegetative",
  germDate: "2025-03-15",
  lastUpdated: "2025-05-15T14:30:00Z",
  image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&h=600",
  logs: [
    { date: "May 10", temperature: 24, humidity: 60, ppm: 650 },
    { date: "May 11", temperature: 25, humidity: 58, ppm: 655 },
    { date: "May 12", temperature: 24, humidity: 59, ppm: 660 },
    { date: "May 13", temperature: 26, humidity: 57, ppm: 670 },
    { date: "May 14", temperature: 25, humidity: 61, ppm: 680 },
    { date: "May 15", temperature: 24, humidity: 60, ppm: 685 },
    { date: "May 16", temperature: 25, humidity: 59, ppm: 690 }
  ],
  recipes: [
    { id: "1", name: "Veg Nutrient Mix", date: "May 13" },
    { id: "2", name: "Micronutrient Boost", date: "May 15" }
  ]
};

const PlantDetail = () => {
  const { plantId } = useParams();
  const { t } = useTranslation();
  
  // In a real app, we'd fetch the plant details based on the plantId
  const plant = mockPlantDetails;
  
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
                <Button variant="ghost" size="icon">
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
              
              <Button className="w-full">
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
                    {plant.recipes.map((recipe) => (
                      <div key={recipe.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          <div>
                            <p className="font-medium">{recipe.name}</p>
                            <p className="text-sm text-muted-foreground">Applied: {recipe.date}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {t("common.view")}
                        </Button>
                      </div>
                    ))}
                    <Button className="w-full">
                      {t("plants.applyRecipe")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;
