
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import PlantEditForm from "@/components/PlantEditForm";

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

const PlantEdit = () => {
  const { t } = useTranslation();
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, this would fetch from an API or Supabase
    const foundPlant = mockPlants.find(p => p.id === plantId);
    
    if (foundPlant) {
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
  }, [plantId, navigate, t]);
  
  const handleSave = (data) => {
    // In a real app, this would update the plant in the database
    console.log("Saving plant data:", data);
    
    // Mock update
    const updatedPlant = {
      ...plant,
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Show success message
    toast({
      title: t("plants.updated"),
      description: t("plants.plantUpdated")
    });
    
    // Navigate back to plant details
    navigate(`/plants/${plantId}`);
  };
  
  const handleCancel = () => {
    navigate(`/plants/${plantId}`);
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
      <Card>
        <CardHeader>
          <CardTitle>{t("plants.editPlant")}: {plant.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <PlantEditForm 
            plant={plant} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantEdit;
