// Utility to reset form data
const resetFormData = () => ({
    code: "",
    product_id: "",
    product_name: "",
    metal_type: "",
    design_name: "",
    purity: "",
    gross_weight: "",
    stone_weight: "",
    stone_price: "",
    weight_bw: "",
    va_on: "",
    va_percent: "",
    wastage_weight: "",
    total_weight_aw: "",
    mc_on: "",
    mc_per_gram: "",
    making_charges: "",
    rate: "",
    rate_amt: "",
    tax_percent: "",
    tax_amt: "",
    total_price: "",
    qty: "",
  });
  
  // Handle metal type change
  export const handleMetalTypeChange = (products, setFormData, metalType) => {
    const product = products.find((prod) => String(prod.Category) === String(metalType));
    if (product) {
      setFormData((prevData) => ({
        ...prevData,
        code: product.rbarcode || "",
        product_id: product.product_id || "",
        product_name: product.product_name || "",
        metal_type: product.Category || "",
        design_name: product.design_master || "",
        purity: product.purity || "",
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        ...resetFormData(),
      }));
    }
  };
  
  // Handle design name change
  export const handleDesignNameChange = (products, setFormData, designName) => {
    const product = products.find((prod) => String(prod.design_master) === String(designName));
    if (product) {
      setFormData((prevData) => ({
        ...prevData,
        code: product.rbarcode || "",
        product_id: product.product_id || "",
        product_name: product.product_name || "",
        metal_type: product.Category || "",
        design_name: product.design_master || "",
        purity: product.purity || "",
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        ...resetFormData(),
      }));
    }
  };
  
  // Handle product name change
  export const handleProductNameChange = (products, setFormData, productName) => {
    const product = products.find((prod) => String(prod.product_name) === String(productName));
    if (product) {
      setFormData((prevData) => ({
        ...prevData,
        code: product.rbarcode,
        product_id: product.product_id || "",
        product_name: product.product_name || "",
        metal_type: product.Category || "",
        design_name: product.design_master || "",
        purity: product.purity || "",
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        ...resetFormData(),
      }));
    }
  };
  
  // Handle product change
  export const handleProductChange = (products, data, setFormData, productId) => {
    const product = products.find((prod) => String(prod.product_id) === String(productId));
    if (product) {
      const tag = data.find((tag) => String(tag.product_id) === String(productId));
      if (tag) {
        setFormData((prevData) => ({
          ...prevData,
          code: "",
          product_id: product.product_id,
          product_name: product.product_name,
          metal_type: product.Category,
          design_name: product.design_master,
          purity: product.purity,
          ...resetFormData(),
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          code: product.rbarcode,
          product_id: product.product_id,
          product_name: product.product_name,
          metal_type: product.Category,
          design_name: product.design_master,
          purity: product.purity,
          ...resetFormData(),
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        ...resetFormData(),
      }));
    }
  };
  
  // Handle barcode change
  export const handleBarcodeChange = async (products, data, setFormData, setIsQtyEditable, code) => {
    try {
      const product = products.find((prod) => String(prod.rbarcode) === String(code));
      if (product) {
        setFormData((prevData) => ({
          ...prevData,
          code: product.rbarcode,
          product_id: product.product_id,
          product_name: product.product_name,
          metal_type: product.Category,
          design_name: product.design_master,
          purity: product.purity,
          tax_percent: product.tax_slab,
          qty: 1,
        }));
        setIsQtyEditable(false);
      } else {
        const tag = data.find((tag) => String(tag.PCode_BarCode) === String(code));
        if (tag) {
          const productDetails = products.find((prod) => String(prod.product_id) === String(tag.product_id));
          setFormData((prevData) => ({
            ...prevData,
            code: tag.PCode_BarCode || "",
            product_id: tag.product_id || "",
            product_name: productDetails?.product_name || "",
            metal_type: productDetails?.Category || "",
            design_name: productDetails?.design_master || "",
            purity: productDetails?.purity || "",
            tax_percent: productDetails?.tax_slab || "",
            qty: 1,
          }));
          setIsQtyEditable(true);
        } else {
          setFormData((prevData) => ({
            ...prevData,
            ...resetFormData(),
          }));
          setIsQtyEditable(true);
        }
      }
    } catch (error) {
      console.error("Error handling barcode change:", error);
    }
  };
  