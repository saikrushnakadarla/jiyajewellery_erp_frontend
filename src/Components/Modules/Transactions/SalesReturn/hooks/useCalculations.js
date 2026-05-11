import { useEffect } from 'react';

const useCalculations = (formData, setFormData) => {
  // Calculate Weight BW
  useEffect(() => {
    const grossWeight = parseFloat(formData.gross_weight) || 0;
    const stonesWeight = parseFloat(formData.stone_weight) || 0;
    const weightBW = grossWeight - stonesWeight;

    setFormData(prev => ({
      ...prev,
      weight_bw: weightBW.toFixed(2),
    }));
  }, [formData.gross_weight, formData.stone_weight]);

  // Calculate Wastage Weight and Total Weight
  useEffect(() => {
    const wastagePercentage = parseFloat(formData.va_percent) || 0;
    const grossWeight = parseFloat(formData.gross_weight) || 0;
    const weightBW = parseFloat(formData.weight_bw) || 0;

    let wastageWeight = 0;
    let totalWeight = 0;

    if (formData.va_on === "Gross Weight") {
      wastageWeight = (grossWeight * wastagePercentage) / 100;
      totalWeight = weightBW + wastageWeight;
    } else if (formData.va_on === "Weight BW") {
      wastageWeight = (weightBW * wastagePercentage) / 100;
      totalWeight = weightBW + wastageWeight;
    }

    setFormData(prev => ({
      ...prev,
      wastage_weight: wastageWeight.toFixed(2),
      total_weight_av: totalWeight.toFixed(2),
    }));
  }, [formData.va_on, formData.va_percent, formData.gross_weight, formData.weight_bw]);

  // Calculate Making Charges
  useEffect(() => {
    const totalWeight = parseFloat(formData.total_weight_av) || 0;
    const mcPerGram = parseFloat(formData.mc_per_gram) || 0;
    const makingCharges = parseFloat(formData.making_charges) || 0;

    if (formData.mc_on === "By Weight") {
      const calculatedMakingCharges = totalWeight * mcPerGram;
      setFormData(prev => ({
        ...prev,
        making_charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.mc_on === "Fixed" && totalWeight > 0) {
      const calculatedMcPerGram = makingCharges / totalWeight;
      setFormData(prev => ({
        ...prev,
        mc_per_gram: calculatedMcPerGram.toFixed(2),
      }));
    }
  }, [formData.mc_on, formData.mc_per_gram, formData.making_charges, formData.total_weight_av]);

  // Calculate Rate Amount
  useEffect(() => {
    const rate = parseFloat(formData.rate) || 0;
    const totalWeight = parseFloat(formData.total_weight_av) || 0;
    const rateAmt = rate * totalWeight;

    setFormData(prev => ({
      ...prev,
      rate_amt: rateAmt.toFixed(2),
    }));
  }, [formData.rate, formData.total_weight_av]);

  // Calculate Tax Amount
  useEffect(() => {
    const taxPercent = parseFloat(formData.tax_percent) || 0;
    const rateAmt = parseFloat(formData.rate_amt) || 0;
    const taxAmt = (rateAmt * taxPercent) / 100;

    setFormData(prev => ({
      ...prev,
      tax_amt: taxAmt.toFixed(2),
    }));
  }, [formData.tax_percent, formData.rate_amt]);

  // Calculate Total Price
  useEffect(() => {
    const rateAmt = parseFloat(formData.rate_amt) || 0;
    const taxAmt = parseFloat(formData.tax_amt) || 0;
    const stonePrice = parseFloat(formData.stone_price) || 0;
    const makingCharges = parseFloat(formData.making_charges) || 0;
    const totalPrice = rateAmt + taxAmt + stonePrice + makingCharges;

    setFormData(prev => ({
      ...prev,
      total_price: totalPrice.toFixed(2),
    }));
  }, [formData.rate_amt, formData.tax_amt, formData.stone_price, formData.making_charges]);
};

export default useCalculations;