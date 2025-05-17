import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { getPlants, savePlants } from "@/lib/localStorageUtils";
import { formatDecimal, parseDecimalInput } from "@/lib/formatters";

const PlantEdit = () => {
  const { t } = useTranslation();
  const { plantId } = useParams();
  const navigate = useNavigate();
  
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    strain: "",
    medium: "Soil",
    environment: "Indoor",
    potSize: "3 gal",
    lightType: "LED",
    currentStage: "Vegetative",
    germDate: "",
    image: ""
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  
  useEffect(() => {
    // Load plant from localStorage
    const plants = getPlants();
    const foundPlant = plants.find(p => p.id === plantId);
    
    if (foundPlant) {
      setPlant(foundPlant);
      setFormData({
        name: foundPlant.name,
        strain: foundPlant.strain,
        medium: foundPlant.medium,
        environment: foundPlant.environment,
        potSize: foundPlant.potSize,
        lightType: foundPlant.lightType,
        currentStage: foundPlant.currentStage,
        germDate: foundPlant.germDate,
        image: foundPlant.image
      });
      
      if (foundPlant.image) {
        setUploadedImage(foundPlant.image);
      }
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImage(reader.result);
          setFormData(prev => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
    // Required field validation
    if (!formData.name) {
      toast({
        title: t("common.error"),
        description: t("plants.nameRequired"),
        variant: "destructive"
      });
      return;
    }
    
    // Update plant in localStorage
    const plants = getPlants();
    const plantIndex = plants.findIndex(p => p.id === plantId);
    
    if (plantIndex !== -1) {
      // Update plant data
      plants[plantIndex] = {
        ...plants[plantIndex],
        ...formData,
        lastUpdated: new Date().toISOString()
      };
      
      // Save to localStorage
      savePlants(plants);
      
      // Show success message
      toast({
        title: t("plants.updated"),
        description: t("plants.plantUpdated")
      });
      
      // Navigate back to plant details
      navigate(`/plants/${plantId}`);
    }
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
          <form className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("plants.plantName")}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="strain">{t("plants.strain")}</Label>
                <Input
                  id="strain"
                  name="strain"
                  value={formData.strain}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medium">{t("plants.medium")}</Label>
                <Select 
                  value={formData.medium} 
                  onValueChange={(value) => handleSelectChange("medium", value)}
                >
                  <SelectTrigger id="medium">
                    <SelectValue placeholder={t("plants.selectMedium")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Soil">Soil</SelectItem>
                    <SelectItem value="Coco">Coco</SelectItem>
                    <SelectItem value="DWC">DWC (Deep Water Culture)</SelectItem>
                    <SelectItem value="Hydroponics">Hydroponics</SelectItem>
                    <SelectItem value="Aeroponics">Aeroponics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="environment">{t("plants.environment")}</Label>
                <Select 
                  value={formData.environment} 
                  onValueChange={(value) => handleSelectChange("environment", value)}
                >
                  <SelectTrigger id="environment">
                    <SelectValue placeholder={t("plants.selectEnvironment")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor">{t("plants.indoor")}</SelectItem>
                    <SelectItem value="Outdoor">{t("plants.outdoor")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="potSize">{t("plants.potSize")}</Label>
                <Input
                  id="potSize"
                  name="potSize"
                  value={formData.potSize}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lightType">{t("plants.lightType")}</Label>
                <Input
                  id="lightType"
                  name="lightType"
                  value={formData.lightType}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentStage">{t("plants.currentStage")}</Label>
                <Select 
                  value={formData.currentStage} 
                  onValueChange={(value) => handleSelectChange("currentStage", value)}
                >
                  <SelectTrigger id="currentStage">
                    <SelectValue placeholder={t("plants.selectStage")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seedling">Seedling</SelectItem>
                    <SelectItem value="Vegetative">Vegetative</SelectItem>
                    <SelectItem value="Flowering">Flowering</SelectItem>
                    <SelectItem value="Harvested">Harvested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="germDate">{t("plants.germDate")}</Label>
                <Input
                  id="germDate"
                  name="germDate"
                  type="date"
                  value={formData.germDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">{t("plants.plantImage")}</Label>
              <div className="flex items-start gap-4">
                {uploadedImage && (
                  <img 
                    src={uploadedImage} 
                    alt="Plant preview" 
                    className="w-40 h-40 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
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
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("plants.imageGuideline")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t("common.cancel")}
              </Button>
              <Button type="button" onClick={handleSave}>
                {t("common.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantEdit;
