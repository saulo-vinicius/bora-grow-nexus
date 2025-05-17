import React, { ChangeEvent, useState, useEffect } from "react";
import { Input } from "./input";
import { formatDecimal, isValidDecimal } from "@/lib/formatters";

interface DecimalInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  value: string | number;
  onChange: (value: number) => void;
  decimalPlaces?: number;
}

export function DecimalInput({
  value,
  onChange,
  decimalPlaces = 2,
  ...props
}: DecimalInputProps) {
  // Keep the display value as string for user input
  const [displayValue, setDisplayValue] = useState("");

  // Initialize display value from prop value
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const stringValue = typeof value === 'number' 
        ? value.toFixed(decimalPlaces) 
        : value.toString();
      
      setDisplayValue(stringValue);
    } else {
      setDisplayValue("");
    }
  }, [value, decimalPlaces]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input
    if (!inputValue) {
      setDisplayValue("");
      onChange(0);
      return;
    }
    
    // Validate that it's a valid decimal number
    if (isValidDecimal(inputValue)) {
      setDisplayValue(inputValue);
      
      // Convert comma to dot for parsing
      const formattedValue = formatDecimal(inputValue);
      const numericValue = parseFloat(formattedValue);
      
      // Call onChange with the parsed number
      onChange(isNaN(numericValue) ? 0 : numericValue);
    }
  };
  
  // When the input loses focus, format the value nicely
  const handleBlur = () => {
    if (displayValue) {
      try {
        const formattedValue = formatDecimal(displayValue);
        const numericValue = parseFloat(formattedValue);
        if (!isNaN(numericValue)) {
          setDisplayValue(numericValue.toFixed(decimalPlaces));
        }
      } catch (e) {
        // Keep current value if parsing fails
      }
    }
  };

  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      inputMode="decimal"
      {...props}
    />
  );
}

export default DecimalInput;
