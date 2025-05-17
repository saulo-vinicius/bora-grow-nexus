
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Element } from "@/logic/CalculatorLogic";
import { SubstanceData } from "@/data/SubstanceData";
import { v4 as uuidv4 } from 'uuid';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { CircleMinus, CirclePlus, HelpCircle } from 'lucide-react';

const customSubstanceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  formula: z.string().optional(),
  elements: z.record(z.string(), z.number().min(0).max(100)),
});

type CustomSubstanceFormValues = z.infer<typeof customSubstanceSchema>;

interface CustomSubstanceFormProps {
  onSave: (substance: SubstanceData) => void;
  onCancel: () => void;
}

const CustomSubstanceForm: React.FC<CustomSubstanceFormProps> = ({ onSave, onCancel }) => {
  const { t } = useTranslation();
  const [selectedElements, setSelectedElements] = useState<Element[]>(["N(NO3-)", "P", "K"]);
  
  const form = useForm<CustomSubstanceFormValues>({
    resolver: zodResolver(customSubstanceSchema),
    defaultValues: {
      name: "",
      formula: "",
      elements: { "N(NO3-)": 0, "P": 0, "K": 0 },
    },
  });

  const addElement = () => {
    const allElements: Element[] = [
      "N(NO3-)", "N(NH4+)", "P", "K", "Ca", "Mg", "S", 
      "Fe", "Mn", "Zn", "B", "Cu", "Si", "Mo", "Na", "Cl"
    ];
    
    // Find first element not already selected
    const newElement = allElements.find(
      element => !selectedElements.includes(element)
    );
    
    if (newElement) {
      setSelectedElements([...selectedElements, newElement]);
      
      // Add the new element to the form values
      const currentElements = form.getValues("elements");
      form.setValue("elements", {
        ...currentElements,
        [newElement]: 0
      });
    }
  };

  const removeElement = (elementToRemove: Element) => {
    // Don't allow removing all elements
    if (selectedElements.length <= 1) return;
    
    setSelectedElements(selectedElements.filter(element => element !== elementToRemove));
    
    // Remove the element from the form values
    const currentElements = form.getValues("elements");
    const updatedElements = { ...currentElements };
    delete updatedElements[elementToRemove];
    form.setValue("elements", updatedElements);
  };

  const onSubmit = (data: CustomSubstanceFormValues) => {
    // Create the substance object with proper typing
    const elements: Record<Element, number> = {} as Record<Element, number>;
    
    // Only include elements with values > 0
    Object.entries(data.elements).forEach(([key, value]) => {
      if (value > 0) {
        elements[key as Element] = value;
      }
    });

    const substance: SubstanceData = {
      id: uuidv4(), // Generate a unique ID
      name: data.name,
      formula: data.formula || "",
      elements: elements,
      custom: true,
    };

    onSave(substance);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("calculator.substanceName")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Custom NPK Mix" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("calculator.substanceFormula")} ({t("common.optional")})</FormLabel>
              <FormControl>
                <Input {...field} placeholder="N-P-K" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t("calculator.elementContent")}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" type="button">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{t("calculator.elementContentHelp")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            {selectedElements.map((element) => (
              <div key={element} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`elements.${element}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 items-center gap-2">
                      <FormLabel className="w-20">{t(`elements.${element}`) || element}</FormLabel>
                      <FormControl>
                        <div className="flex flex-1 items-center">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value || 0}
                          />
                          <span className="ml-2">%</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeElement(element)}
                >
                  <CircleMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addElement}
            disabled={selectedElements.length === 16} // All elements already selected
            className="w-full"
          >
            <CirclePlus className="h-4 w-4 mr-2" />
            {t("calculator.addElement")}
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} type="button">
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

export default CustomSubstanceForm;
