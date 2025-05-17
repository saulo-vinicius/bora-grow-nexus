
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Plus, Edit, Trash, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getPlants, savePlants } from "@/lib/localStorageUtils";
import { Input } from "@/components/ui/input";

// Import the formatters for handling decimal inputs
import { formatDecimal, parseDecimalInput } from "@/lib/formatters";

// Default images for plants
const defaultImages = [
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&h=300",
  "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=300&h=300"
];

const Plants = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [deletingPlantId, setDeletingPlantId] = useState(null);
  const [isAddPlantDialogOpen, setIsAddPlantDialogOpen] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  
  useEffect(() => {
    // Load plants from localStorage
    const storedPlants = getPlants();
    if (storedPlants && storedPlants.length > 0) {
      setPlants(storedPlants);
    } else {
      // Use mock data if no plants in localStorage
      setPlants([
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
      ]);
    }
  }, []);
  
  // Effect to save plants to localStorage when they change
  useEffect(() => {
    if (plants.length > 0) {
      savePlants(plants);
    }
  }, [plants]);
  
  const handleDeletePlant = (id) => {
    setDeletingPlantId(id);
  };
  
  const confirmDelete = () => {
    if (deletingPlantId) {
      const updatedPlants = plants.filter(plant => plant.id !== deletingPlantId);
      setPlants(updatedPlants);
      setDeletingPlantId(null);
      toast({
        title: t("plants.deletedSuccessfully"),
        description: t("plants.plantHasBeenDeleted"),
      });
    }
  };
  
  const handleEditPlant = (id) => {
    navigate(`/plants/${id}/edit`);
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddPlant = () => {
    if (!newPlantName) {
      toast({
        title: t("common.error"),
        description: t("plants.nameRequired"),
        variant: "destructive"
      });
      return;
    }
    
    const newPlant = {
      id: Date.now().toString(),
      name: newPlantName,
      strain: "",
      medium: "Soil",
      environment: "Indoor",
      potSize: "3 gal",
      lightType: "LED",
      currentStage: "Vegetative",
      germDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      image: uploadedImage || defaultImages[Math.floor(Math.random() * defaultImages.length)]
    };
    
    setPlants([...plants, newPlant]);
    setIsAddPlantDialogOpen(false);
    setNewPlantName("");
    setUploadedImage(null);
    
    toast({
      title: t("common.success"),
      description: t("plants.plantAdded")
    });
    
    // Navigate to the edit page for the new plant
    setTimeout(() => {
      navigate(`/plants/${newPlant.id}/edit`);
    }, 300);
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("plants.title")}</h1>
        <Button onClick={() => setIsAddPlantDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("plants.addPlant")}
        </Button>
      </div>

      {plants.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <Leaf className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">{t("plants.noPlants")}</h3>
            <p className="text-muted-foreground mb-4">{t("plants.addPlant")}</p>
            <Button onClick={() => setIsAddPlantDialogOpen(true)}>
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
                  src={plant.image || defaultImages[0]}
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditPlant(plant.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeletePlant(plant.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {plants.length < 2 && (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center text-center p-6">
              <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">{t("plants.addPlant")}</h3>
              <Button size="sm" className="mt-2" onClick={() => setIsAddPlantDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("plants.addPlant")}
              </Button>
            </Card>
          )}
          
          {plants.length >= 2 && (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center text-center p-6">
              <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">{t("plants.upgradePlans")}</h3>
              <p className="text-muted-foreground mb-4">Free plan limited to 2 plants</p>
              <Button size="sm" variant="secondary" asChild>
                <Link to="/upgrade">
                  {t("profile.upgradeAccount")}
                </Link>
              </Button>
            </Card>
          )}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPlantId} onOpenChange={(open) => !open && setDeletingPlantId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("plants.confirmDelete")}</DialogTitle>
            <DialogDescription>
              {t("plants.deleteWarning")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPlantId(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Plant Dialog */}
      <Dialog open={isAddPlantDialogOpen} onOpenChange={setIsAddPlantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("plants.addPlant")}</DialogTitle>
            <DialogDescription>
              {t("plants.enterBasicInfo")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                {t("plants.plantName")}
              </label>
              <Input
                id="name"
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                placeholder={t("plants.enterPlantName")}
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium mb-1">
                {t("plants.plantImage")}
              </label>
              <div className="flex items-center space-x-4">
                <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload').click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("plants.uploadImage")}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {uploadedImage && (
                <div className="mt-4">
                  <img 
                    src={uploadedImage} 
                    alt="Preview" 
                    className="h-40 w-40 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddPlantDialogOpen(false);
              setNewPlantName("");
              setUploadedImage(null);
            }}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddPlant}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plants;
