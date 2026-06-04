import { useEffect } from 'react';

const useCalculations = (formData, setFormData, offers,   isManualTotalPriceChange,
  setIsManualTotalPriceChange, isTotalPriceCleared) => {
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
      const calculatedMakingCharges = mcPerGram * totalWeight;
      setFormData((prev) => ({
        ...prev,
        making_charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.mc_on === "MC %") {
      const calculatedMakingCharges = (mcPerGram * rateAmount) / 100;
      setFormData((prev) => ({
        ...prev,
        making_charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.mc_on === "MC / Piece") {
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
     // Skip if it's a manual total_price change
    // Skip if total_price was manually cleared or changed
    if (isTotalPriceCleared || isManualTotalPriceChange) return;
    const taxPercent = parseFloat(formData.tax_percent) || 0;

    if (formData.pricing === "By Weight") {
      const rateAmt = parseFloat(formData.rate_amt) || 0;
      const stonePrice = parseFloat(formData.stone_price) || 0;
      const makingCharges = parseFloat(formData.making_charges) || 0;
      const discountAmt = parseFloat(formData.disscount) || 0;
      const festivalDiscount = parseFloat(formData.festival_discount) || 0;
      const hmCharges = parseFloat(formData.hm_charges) || 0;

      const totalDiscount = discountAmt + festivalDiscount;

      const taxableAmount = rateAmt + stonePrice + makingCharges + hmCharges - totalDiscount;
      const taxAmt = (taxableAmount * taxPercent) / 100;
      const totalPrice = taxableAmount + taxAmt;

      setFormData((prev) => ({
        ...prev,
        tax_amt: taxAmt.toFixed(2),
        total_price: totalPrice.toFixed(2),
      }));
    } else if (formData.pricing === "By fixed") {
      const pieceCost = parseFloat(formData.pieace_cost) || 0;
      const qty = parseFloat(formData.qty) || 1;

      const pieceTaxableAmt = pieceCost * qty;
      const taxAmt = (taxPercent * pieceCost * qty) / 100;
      const mrpPrice = pieceCost + (taxAmt / qty);
      const totalPrice = pieceTaxableAmt + taxAmt;

      setFormData((prev) => ({
        ...prev,
        piece_taxable_amt: pieceTaxableAmt.toFixed(2),
        tax_amt: taxAmt.toFixed(2),
        mrp_price: mrpPrice.toFixed(2),
        total_price: totalPrice.toFixed(2),
      }));
    } else {
      const mrpPrice = parseFloat(formData.mrp_price) || 0;
      setFormData((prev) => ({
        ...prev,
        tax_amt: "0.00",
        total_price: mrpPrice.toFixed(2),
      }));
    }
  }, [
    formData.tax_percent,
    formData.rate_amt,
    formData.stone_price,
    formData.making_charges,
    formData.disscount,
    formData.festival_discount,
    formData.hm_charges,
    formData.pricing,
    formData.mrp_price,
    formData.pieace_cost,
    formData.qty,
      /* all your existing dependencies */
  isTotalPriceCleared,
  isManualTotalPriceChange
  ]);

  useEffect(() => {
    if (!offers || offers.length === 0) return;

    const selectedOffer = offers[0]; // Assuming auto-apply first offer
    const percentageDiscount = parseFloat(selectedOffer.discount_percentage) || 0;
    const rateDiscount = parseFloat(selectedOffer.discount_on_rate) || 0;
    const fixedPercentageDiscount = parseFloat(selectedOffer.discount_percent_fixed) || 0;

    const taxPercent = parseFloat(formData.tax_percent) || 1;
    const pieceCost = parseFloat(formData.pieace_cost) || 0;
    const qty = parseFloat(formData.qty) || 1;
    const rateAmt = parseFloat(formData.rate_amt) || 0;
    const stonePrice = parseFloat(formData.stone_price) || 0;
    const makingCharges = parseFloat(formData.making_charges) || 0;
    const hmCharges = parseFloat(formData.hm_charges) || 0;
    const grossWeight = parseFloat(formData.gross_weight) || 0;
    const discountAmt = parseFloat(formData.disscount) || 0;

    if (formData.pricing === "By fixed") {
      const pieceTaxableAmt = pieceCost * qty;
      const originalPieceTaxableAmt = formData.original_piece_taxable_amt
        ? parseFloat(formData.original_piece_taxable_amt)
        : pieceTaxableAmt;

      const calculatedDiscount = (pieceTaxableAmt * fixedPercentageDiscount) / 100;
      const updatedPieceTaxableAmt = originalPieceTaxableAmt - calculatedDiscount - discountAmt;
      const taxAmt = (taxPercent * updatedPieceTaxableAmt) / 100;
      const totalPrice = updatedPieceTaxableAmt + taxAmt;

      setFormData(prev => ({
        ...prev,
        original_piece_taxable_amt: originalPieceTaxableAmt.toFixed(2),
        festival_discount: calculatedDiscount.toFixed(2),
        festival_discount_percentage: percentageDiscount.toFixed(2),
        festival_discount_on_rate: rateDiscount.toFixed(2),
        piece_taxable_amt: updatedPieceTaxableAmt.toFixed(2),
        tax_amt: taxAmt.toFixed(2),
        total_price: totalPrice.toFixed(2),
      }));
    } else {
      const weightBasedDiscount = (rateDiscount / 10) * grossWeight;
      const calculatedDiscount = (makingCharges * percentageDiscount) / 100 + weightBasedDiscount;
      const totalBeforeTax =
        rateAmt + stonePrice + makingCharges + hmCharges - calculatedDiscount - discountAmt;

      const taxAmt = (totalBeforeTax * taxPercent) / 100;
      const totalPrice = totalBeforeTax + taxAmt;

      setFormData(prev => ({
        ...prev,
        original_total_price: formData.original_total_price
          ? formData.original_total_price
          : parseFloat(formData.total_price || 0).toFixed(2),
        festival_discount: calculatedDiscount.toFixed(2),
        festival_discount_percentage: percentageDiscount.toFixed(2),
        festival_discount_on_rate: rateDiscount.toFixed(2),
        tax_amt: taxAmt.toFixed(2),
        total_price: totalPrice.toFixed(2),
      }));
    }
  }, [
    formData.pricing,
    formData.tax_percent,
    formData.pieace_cost,
    formData.qty,
    formData.rate_amt,
    formData.stone_price,
    formData.making_charges,
    formData.hm_charges,
    formData.gross_weight,
    formData.disscount,
    formData.original_total_price,
    formData.original_piece_taxable_amt,
    offers,
  ]);

  // 🔁 Reverse calculate mc_per_gram if total_price is changed
// Reverse calculation effect
useEffect(() => {
  if (isManualTotalPriceChange && !isTotalPriceCleared && 
    formData.pricing === "By Weight" && formData.mc_on === "MC %") {
  const totalPrice = parseFloat(formData.total_price) || 0;
  
  // Skip if field is empty
  if (isNaN(totalPrice)) return;
    
    // Skip if field is empty (user cleared it)
    if (isNaN(totalPrice)) {
      setIsManualTotalPriceChange(false);
      return;
    }

    const rateAmt = parseFloat(formData.rate_amt) || 0;
    const stonePrice = parseFloat(formData.stone_price) || 0;
    const hmCharges = parseFloat(formData.hm_charges) || 0;
    const discountAmt = parseFloat(formData.disscount) || 0;
    const festivalDiscount = parseFloat(formData.festival_discount) || 0;
    const taxPercent = parseFloat(formData.tax_percent) || 0;

    const totalDiscount = discountAmt + festivalDiscount;
    const estimatedTaxableAmount = totalPrice / (1 + taxPercent / 100);
    const makingCharges = estimatedTaxableAmount - (rateAmt + stonePrice + hmCharges - totalDiscount);

    if (rateAmt > 0) {
      const mcPerGram = (makingCharges * 100) / rateAmt;
      setFormData(prev => ({
        ...prev,
        mc_per_gram: mcPerGram.toFixed(2),
        making_charges: makingCharges.toFixed(2) // Also update making_charges if needed
      }));
    }
    
    setIsManualTotalPriceChange(false);
  }
}, [formData.total_price, isManualTotalPriceChange, isTotalPriceCleared]);
  
};

export default useCalculations;
