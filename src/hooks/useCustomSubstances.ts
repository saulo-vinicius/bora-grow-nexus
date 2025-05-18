
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SubstanceData } from '@/data/SubstanceData';
import { toast } from './use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useCustomSubstances = () => {
  const [customSubstances, setCustomSubstances] = useState<SubstanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCustomSubstances();
    }
  }, [user]);

  const fetchCustomSubstances = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_substances')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const formattedSubstances: SubstanceData[] = data.map(substance => ({
        id: substance.id,
        name: substance.name,
        formula: substance.formula || '',
        elements: substance.elements as any,
        custom: true,
        amount: 0
      }));
      
      setCustomSubstances(formattedSubstances);
    } catch (error) {
      console.error('Error fetching custom substances:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom substances',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomSubstance = async (substance: SubstanceData) => {
    if (!user) {
      // If not authenticated, store substances locally
      const tempId = uuidv4();
      const newSubstance = { ...substance, id: tempId, custom: true };
      setCustomSubstances([...customSubstances, newSubstance]);
      return newSubstance;
    }
    
    try {
      // Format the substance for Supabase
      const substanceData = {
        user_id: user.id,
        name: substance.name,
        formula: substance.formula,
        elements: substance.elements
      };
      
      const { data, error } = await supabase
        .from('custom_substances')
        .insert(substanceData)
        .select()
        .single();
        
      if (error) throw error;
      
      const newSubstance: SubstanceData = {
        id: data.id,
        name: data.name,
        formula: data.formula || '',
        elements: data.elements as any,
        custom: true,
        amount: 0
      };
      
      setCustomSubstances([...customSubstances, newSubstance]);
      return newSubstance;
    } catch (error) {
      console.error('Error adding custom substance:', error);
      toast({
        title: 'Error',
        description: 'Failed to save custom substance',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteCustomSubstance = async (id: string) => {
    if (!user) {
      // If not authenticated, just update the local state
      setCustomSubstances(customSubstances.filter(s => s.id !== id));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('custom_substances')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setCustomSubstances(customSubstances.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting custom substance:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete custom substance',
        variant: 'destructive'
      });
    }
  };

  return {
    customSubstances,
    loading,
    addCustomSubstance,
    deleteCustomSubstance,
    refreshCustomSubstances: fetchCustomSubstances
  };
};
