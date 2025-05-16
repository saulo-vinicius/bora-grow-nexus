
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plant, Plus, Edit, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// This is a mock for testing - would come from Supabase in production
const mockPlants = [
  {
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
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&h=300"
  },
  {
    id: "2",
    name: "Blue Dream",
    strain: "Blue Dream",
    medium: "Coco",
    environment: "Indoor",
    potSize: "3 gal",
    lightType: "LED",
    currentStage: "Flowering",
    germDate: "2025-02-20",
    lastUpdated: "2025-05-16T09:45:00Z",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=300&h=300"
  }
];

const Plants = () => {
  const { t } = useTranslation();
  const [plants, setPlants] = useState(mockPlants);
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("plants.title")}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("plants.addPlant")}
        </Button>
      </div>

      {plants.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <Plant className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">{t("plants.noPlants")}</h3>
            <p className="text-muted-foreground mb-4">{t("plants.addPlant")}</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("plants.addPlant")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <Card key={plant.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src={plant.image || "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&h=300"}
                  alt={plant.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                  <p>{plant.currentStage}</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{plant.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="font-medium">{t("plants.strain")}:</div>
                  <div>{plant.strain}</div>
                  
                  <div className="font-medium">{t("plants.medium")}:</div>
                  <div>{plant.medium}</div>
                  
                  <div className="font-medium">{t("plants.environment")}:</div>
                  <div>{plant.environment}</div>
                  
                  <div className="font-medium">{t("plants.germDate")}:</div>
                  <div>{new Date(plant.germDate).toLocaleDateString()}</div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/plants/${plant.id}`}>
                    {t("plants.viewDetails")}
                  </Link>
                </Button>
                <div className="space-x-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {plants.length < 2 && (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center text-center p-6">
              <Plant className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">{t("plants.addPlant")}</h3>
              <Button size="sm" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                {t("plants.addPlant")}
              </Button>
            </Card>
          )}
          
          {plants.length >= 2 && (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center text-center p-6">
              <Plant className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">{t("plants.upgradePlans")}</h3>
              <p className="text-muted-foreground mb-4">Free plan limited to 2 plants</p>
              <Button size="sm" variant="premium">
                {t("profile.upgradeAccount")}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Plants;
