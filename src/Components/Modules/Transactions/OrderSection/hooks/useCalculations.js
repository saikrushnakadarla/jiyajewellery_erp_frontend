import { useEffect } from 'react';

const useCalculations = (formData, setFormData) => {
  // Calculate Weight BW
  useEffect(() => {
    const grossWeight = parseFloat(formData.gross_weight) || 0;
    const stonesWeight = parseFloat(formData.stone_weight) || 0;
    const weightBW = grossWeight - stonesWeight;

    setFormData(prev => ({
      ...prev,
      weight_bw: weightBW.toFixed(3),
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
      wastage_weight: wastageWeight.toFixed(3),
      total_weight_av: totalWeight.toFixed(3),
    }));
  }, [formData.va_on, formData.va_percent, formData.gross_weight, formData.weight_bw]);

  // Calculate Making Charges
  useEffect(() => {
    const totalWeight = parseFloat(formData.total_weight_av) || 0;
    const mcPerGram = parseFloat(formData.mc_per_gram) || 0;
    const makingCharges = parseFloat(formData.making_charges) || 0;
    const rateAmount = parseFloat(formData.rate_amt) || 0;

    if (formData.mc_on === "MC / Gram") {
      // Calculate making_charges as mcPerGram * totalWeight
      const calculatedMakingCharges = mcPerGram * totalWeight;
      setFormData((prev) => ({
        ...prev,
        making_charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.mc_on === "MC %") {
      // Calculate making_charges as (mcPerGram * rateAmount) / 100
      const calculatedMakingCharges = (mcPerGram * rateAmount) / 100;
      setFormData((prev) => ({
        ...prev,
        making_charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.mc_on === "MC / Piece") {
      // If making_charges is manually entered, calculate mc_per_gram
      if (makingCharges && totalWeight > 0) {
        const calculatedMcPerGram = makingCharges / totalWeight;
        setFormData((prev) => ({
          ...prev,
          mc_per_gram: calculatedMcPerGram.toFixed(2),
        }));
      }
    }
  }, [
    formData.mc_on,
    formData.mc_per_gram,
    formData.making_charges,
    formData.total_weight_av,
    formData.rate_amt,
  ]);

  // Calculate Rate Amount
  useEffect(() => {
    const rate = parseFloat(formData.rate) || 0;
    const totalWeight = parseFloat(formData.total_weight_av) || 0;
    const qty = parseFloat(formData.qty) || 0;
    const pieceCost = parseFloat(formData.pieace_cost) || 0;
    let rateAmt = 0;

    if (formData.pricing === "By fixed") {
      rateAmt = pieceCost * qty;
    } else {
      rateAmt = rate * totalWeight;
    }

    setFormData((prev) => ({
      ...prev,
      rate_amt: rateAmt.toFixed(2),
    }));
  }, [formData.rate, formData.total_weight_av, formData.qty, formData.pricing, formData.pieace_cost]);

  // Calculate Tax Amount and Total Price
  useEffect(() => {
    const taxPercent = parseFloat(formData.tax_percent) || 0;
    const rateAmt = parseFloat(formData.rate_amt) || 0;
    const stonePrice = parseFloat(formData.stone_price) || 0;
    const makingCharges = parseFloat(formData.making_charges) || 0;
    const discountAmt = parseFloat(formData.disscount) || 0;
    const hmCharges = parseFloat(formData.hm_charges) || 0;

    // Ensure discount is subtracted before tax calculation
    const taxableAmount = rateAmt + stonePrice + makingCharges + hmCharges - discountAmt;
    const taxAmt = (taxableAmount * taxPercent) / 100;

    // Calculate Total Price
    const totalPrice = taxableAmount + taxAmt;

    setFormData((prev) => ({
      ...prev,
      tax_amt: taxAmt.toFixed(2),
      total_price: totalPrice.toFixed(2),
    }));
  }, [formData.tax_percent, formData.rate_amt, formData.stone_price, formData.making_charges, formData.disscount, formData.hm_charges]);

};

export default useCalculations;