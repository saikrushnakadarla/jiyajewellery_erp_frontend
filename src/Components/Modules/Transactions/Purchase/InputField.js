import React, { useEffect, useRef } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
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
  autoFocus,
  nextRef,
  allowCustomInput = false, // NEW PROP
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: "#A26D2B",
      boxShadow: state.isFocused ? "0 0 0 1px #A26D2B" : "none",
      "&:hover": { borderColor: "#A26D2B" },
      minHeight: "35px",
      height: "35px",
      fontSize: "12px",
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
      zIndex: 9999,
      fontSize: "12px",
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
    <div className="input-field-container-sales">
      <div className="select-container-sales">
        {label && <label className="floating-label-sales">{label}</label>}
        {type === "select" ? (
          allowCustomInput ? (
            <CreatableSelect
              name={name}
              options={options}
              placeholder={placeholder || "Select"}
              isDisabled={readOnly}
              autoFocus={autoFocus}
              value={
                value && typeof value === "string"
                  ? { label: value, value }
                  : options.find((opt) => opt.value === value) || null
              }
              onChange={(selectedOption) =>
                onChange({
                  target: {
                    name,
                    value: selectedOption ? selectedOption.value : "",
                  },
                })
              }
              styles={customStyles}
              menuPortalTarget={document.body}
              isClearable
              isSearchable
              
            />
          ) : (
            <Select
              name={name}
              options={options}
              placeholder={placeholder || "Select"}
              isDisabled={readOnly}
              autoFocus={autoFocus}
              value={
                value && typeof value === "string"
                  ? options.find((opt) => opt.value === value)
                  : null
              }
              onChange={(selectedOption) =>
                onChange({
                  target: {
                    name,
                    value: selectedOption ? selectedOption.value : "",
                  },
                })
              }
              styles={customStyles}
              menuPortalTarget={document.body}
              isClearable
              isSearchable
            />
          )
        ) : type === "file" ? (
          <input
            className="styled-input-sales file-input"
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
            className="styled-input-sales"
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            readOnly={readOnly}
            onChange={handleChange}
            required={required}
            max={max}
            autoFocus={autoFocus}
            ref={inputRef}
          />
        )}
      </div>
    </div>
  );
};

export default InputField;
