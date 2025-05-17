
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the plant form schema
const plantSchema = z.object({
  name: z.string().min(1, { message: "Plant name is required" }),
  strain: z.string().min(1, { message: "Strain name is required" }),
  medium: z.string().min(1, { message: "Growing medium is required" }),
  environment: z.string().min(1, { message: "Environment is required" }),
  potSize: z.string().min(1, { message: "Pot size is required" }),
  lightType: z.string().min(1, { message: "Light type is required" }),
  currentStage: z.string().min(1, { message: "Current stage is required" }),
  germDate: z.string().min(1, { message: "Germination date is required" }),
  image: z.string().optional(),
});

type PlantFormValues = z.infer<typeof plantSchema>;

interface PlantEditFormProps {
  plant?: {
    id: string;
    name: string;
    strain: string;
    medium: string;
    environment: string;
    potSize: string;
    lightType: string;
    currentStage: string;
    germDate: string;
    image?: string;
    lastUpdated?: string;
  };
  onSave: (data: PlantFormValues) => void;
  onCancel: () => void;
}

const PlantEditForm: React.FC<PlantEditFormProps> = ({
  plant,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();
  
  // Initialize the form with default values or existing plant data
  const form = useForm<PlantFormValues>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: plant?.name || '',
      strain: plant?.strain || '',
      medium: plant?.medium || '',
      environment: plant?.environment || '',
      potSize: plant?.potSize || '',
      lightType: plant?.lightType || '',
      currentStage: plant?.currentStage || '',
      germDate: plant?.germDate ? plant.germDate.split('T')[0] : '',
      image: plant?.image || '',
    }
  });

  // Handle form submission
  const onSubmit = (data: PlantFormValues) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("plants.name")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("plants.enterName")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="strain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("plants.strain")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("plants.enterStrain")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="medium"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("plants.medium")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("plants.selectMedium")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Soil">Soil</SelectItem>
                    <SelectItem value="Coco">Coco</SelectItem>
                    <SelectItem value="Hydroponics">Hydroponics</SelectItem>
                    <SelectItem value="DWC">DWC</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="environment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("plants.environment")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("plants.selectEnvironment")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="Greenhouse">Greenhouse</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="potSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("plants.potSize")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="3 gal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lightType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("plants.lightType")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("plants.selectLightType")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LED">LED</SelectItem>
                    <SelectItem value="HPS">HPS</SelectItem>
                    <SelectItem value="MH">MH</SelectItem>
                    <SelectItem value="CFL">CFL</SelectItem>
                    <SelectItem value="Sun">Sun</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentStage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("plants.currentStage")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("plants.selectStage")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Germination">Germination</SelectItem>
                    <SelectItem value="Seedling">Seedling</SelectItem>
                    <SelectItem value="Vegetative">Vegetative</SelectItem>
                    <SelectItem value="Pre-flower">Pre-flower</SelectItem>
                    <SelectItem value="Flowering">Flowering</SelectItem>
                    <SelectItem value="Harvest">Harvest</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="germDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("plants.germDate")}</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Hidden image field */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="submit">
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PlantEditForm;
