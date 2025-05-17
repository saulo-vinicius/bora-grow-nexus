
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Plus } from 'lucide-react';
import { SubstanceData } from "@/data/SubstanceData";
import { Element } from "@/logic/CalculatorLogic";
import CustomSubstanceForm from './CustomSubstanceForm';
import { toast } from "@/hooks/use-toast";

interface SubstanceSelectionPanelProps {
  substances: SubstanceData[];
  selectedSubstances: SubstanceData[];
  onSelectSubstance: (substance: SubstanceData) => void;
  onRemoveSubstance: (id: string) => void;
  onSubstanceAmountChange: (id: string, value: string) => void;
  massUnit: string;
  addCustomSubstance: (substance: SubstanceData) => void;
}

const SubstanceSelectionPanel: React.FC<SubstanceSelectionPanelProps> = ({
  substances,
  selectedSubstances,
  onSelectSubstance,
  onRemoveSubstance,
  onSubstanceAmountChange,
  massUnit,
  addCustomSubstance
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  
  const filteredSubstances = substances.filter(substance => 
    substance.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomSubstance = (substance: SubstanceData) => {
    addCustomSubstance(substance);
    setShowCustomForm(false);
    toast({
      title: t("calculator.customSubstanceAdded"),
      description: t("calculator.customSubstanceAddedDescription")
    });
  };

  const getElementHighlights = (target: Record<Element, number>, substance: SubstanceData) => {
    const highlights: Element[] = [];
    
    Object.entries(target).forEach(([element, concentration]) => {
      if (concentration > 0 && substance.elements[element as Element]) {
        highlights.push(element as Element);
      }
    });
    
    return highlights;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("calculator.substanceDatabase")}</CardTitle>
            <Button size="sm" onClick={() => setShowCustomForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("calculator.addCustom")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("calculator.search")}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
            {filteredSubstances.map((substance) => (
              <div key={substance.id} className="border rounded-md p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{substance.name}</h4>
                    <p className="text-sm text-muted-foreground">{substance.formula}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectSubstance(substance)}
                    disabled={selectedSubstances.some(s => s.id === substance.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 space-x-2 flex flex-wrap gap-1">
                  {Object.entries(substance.elements).map(([element, percentage]) => (
                    <span key={element} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted">
                      {element}: {percentage}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            {filteredSubstances.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No substances found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("calculator.substanceSelection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedSubstances.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No substances selected
              </p>
            ) : (
              selectedSubstances.map((substance) => (
                <div key={substance.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{substance.name}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onRemoveSubstance(substance.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <label htmlFor={`amount-${substance.id}`} className="text-sm font-medium">
                      {massUnit}
                    </label>
                    <Input
                      id={`amount-${substance.id}`}
                      type="number"
                      value={substance.amount?.toFixed(3) || 0}
                      onChange={(e) => onSubstanceAmountChange(substance.id, e.target.value)}
                      min="0"
                      step="0.001"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCustomForm} onOpenChange={setShowCustomForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("calculator.addCustomSubstance")}</DialogTitle>
          </DialogHeader>
          <CustomSubstanceForm 
            onSave={handleAddCustomSubstance} 
            onCancel={() => setShowCustomForm(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubstanceSelectionPanel;
