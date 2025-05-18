import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Plus, Trash2 } from 'lucide-react';
import { SubstanceData } from "@/data/SubstanceData";
import { Element } from "@/logic/CalculatorLogic";
import CustomSubstanceForm from './CustomSubstanceForm';
import { toast } from "@/hooks/use-toast";
import { getElementBgClass } from "@/lib/ElementUtils";
import { DecimalInput } from "@/components/ui/decimal-input";
import { useCustomSubstances } from "@/hooks/useCustomSubstances";
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false);
  const [substanceToDelete, setSubstanceToDelete] = useState<string | null>(null);
  const { customSubstances, loading, addCustomSubstance: saveCustomSubstance, deleteCustomSubstance } = useCustomSubstances();
  
  // Combine builtin substances with custom ones
  const allSubstances = [...substances, ...customSubstances];
  
  const filteredSubstances = allSubstances.filter(substance => 
    substance.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomSubstance = async (substance: SubstanceData) => {
    // If not authenticated, prompt to sign in
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    const savedSubstance = await saveCustomSubstance(substance);
    if (savedSubstance) {
      addCustomSubstance(savedSubstance);
      setShowCustomForm(false);
      toast({
        title: t("calculator.customSubstanceAdded"),
        description: t("calculator.customSubstanceAddedDescription")
      });
    }
  };
  
  const handleDeleteCustomSubstance = (id: string) => {
    setSubstanceToDelete(id);
  };
  
  const confirmDeleteSubstance = async () => {
    if (substanceToDelete) {
      await deleteCustomSubstance(substanceToDelete);
      if (selectedSubstances.some(s => s.id === substanceToDelete)) {
        onRemoveSubstance(substanceToDelete);
      }
      setSubstanceToDelete(null);
    }
  };

  // Helper function to handle decimal separators (comma or period)
  const handleAmountChange = (id: string, value: string) => {
    // Replace comma with period for decimal values
    const normalizedValue = value.replace(',', '.');
    onSubstanceAmountChange(id, normalizedValue);
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
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{substance.name}</h4>
                      {(substance as any).custom && (
                        <span className="bg-primary/20 text-xs px-1.5 py-0.5 rounded text-primary">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{substance.formula}</p>
                  </div>
                  <div className="flex gap-2">
                    {(substance as any).custom && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCustomSubstance(substance.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onSelectSubstance(substance)}
                      disabled={selectedSubstances.some(s => s.id === substance.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 space-x-2 flex flex-wrap gap-1">
                  {Object.entries(substance.elements).map(([element, percentage]) => (
                    <span 
                      key={element} 
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getElementBgClass(element as Element)}`}
                    >
                      {element}: {percentage}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            {filteredSubstances.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                {t("calculator.noSubstancesFound")}
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
                {t("calculator.noSubstancesSelected")}
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
                    <DecimalInput
                      id={`amount-${substance.id}`}
                      value={substance.amount || 0}
                      onChange={(value) => handleAmountChange(substance.id, value.toString())}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Substance Form Dialog */}
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

      {/* Authentication Prompt Dialog */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to save custom substances. Would you like to login or register now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button asChild>
                <Link to="/auth">Login / Register</Link>
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!substanceToDelete} onOpenChange={() => setSubstanceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Substance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom substance? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSubstance}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubstanceSelectionPanel;
