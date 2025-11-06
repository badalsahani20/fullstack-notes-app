import React, { useEffect, useState } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  value?: string | number;
}

const FloatingInput: React.FC<Props> = ({ label, value, icon, ...props }) => {
    const [filled, setFilled] = useState(false);

    useEffect(() => {
        // Check if the input is filled
        if(value && value.toString().trim().length > 0) {
            setFilled(true);
        } // color -> example: #dfe3ff
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange?.(e);

        //Re-evaluate if filled
        setFilled(e.target.value.trim().length > 0);
    }
  return (
    <div className="relative w-full">
        {icon && <div className="absolute left-3 top-2 text-muted">{icon}</div>}
      <input
        {...props}
        className={`input peer placeholder-transparent rounded-lg! ${filled ? "has-value" : ""}`}
        placeholder={label}
        value={value}
        onChange={handleChange}
      />
      <label
        className="
          absolute left-3 top-2 text-muted-foreground transition-all
          duration-200 pointer-events-none
          peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-muted
          peer-placeholder-shown:text-base
          peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent

          has-value:-top-5 has-value:text-xs has-value:text-accent
        "
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;
