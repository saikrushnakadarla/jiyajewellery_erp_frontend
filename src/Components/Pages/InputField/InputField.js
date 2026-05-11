import React, { useEffect, useRef } from "react";
import Select from "react-select";
import "./InputField.css";

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
  autoFocus ,
  nextRef,
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

  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e) => {
    onChange(e);
    if (nextRef && e.target.value) {
      nextRef.current?.focus();
    }
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
            autoFocus={autoFocus}
            value={value ? options.find((opt) => opt.value === value) : null}
            onChange={(selectedOption) =>
              onChange({
                target: { name, value: selectedOption ? selectedOption.value : "" },
              })
            }
            styles={customStyles}
            menuPortalTarget={document.body}
            isClearable
          />
        ) : type === "file" ? (
          <input
            className="styled-input file-input"
            type="file"
            name={name}
            accept="image/*"
            onChange={onChange}
            required={required}
            disabled={readOnly}
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
            onChange={handleChange}
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
