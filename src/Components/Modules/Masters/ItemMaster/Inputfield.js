import React from "react";
import Select from "react-select";
import "./Inputfield.css";

const InputField = ({
  label,
  type = "text",
  placeholder,
  value,
  readOnly,
  onChange,
  name,
  options = [],
  required = false,
  max,
  autoFocus
}) => {
  // Custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: "#A26D2B",
      boxShadow: state.isFocused ? "0 0 0 1px #A26D2B" : "none",
      "&:hover": { borderColor: "#A26D2B" },
      minHeight: "40px",
      height: "40px",
      fontSize: "14px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 8px",
      height: "38px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "38px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Ensure the dropdown is on top
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="input-field-container">
      <div className="select-container">
        {label && <label className="floating-label">{label}</label>}
        {type === "select" ? (
          <Select
          name={name}
          options={options}
          placeholder={placeholder || "Select"}
          isDisabled={readOnly}
          value={value ? options.find((opt) => opt.value === value) : null} // Handle reset
          onChange={(selectedOption) =>
            onChange({
              target: { name, value: selectedOption ? selectedOption.value : "" },
            })
          }
          styles={customStyles}
          menuPortalTarget={document.body}
          isClearable
          autoFocus={autoFocus}
        />
        
        ) : (
          <input
            className="styled-input"
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            readOnly={readOnly}
            onChange={onChange}
            required={required}
            max={max}
            autoFocus={autoFocus}
          />
        )}
      </div>
    </div>
  );
};

export default InputField;
