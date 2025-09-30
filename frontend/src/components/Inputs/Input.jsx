import React from "react";
import {FaRegEye, FaRegEyeSlash} from "react-icons/fa6";

const Input = ({ label, type, placeholder, value, onChange }) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
  return (
    <div className="mb-4">
        <label className="text-[13px] text-slate-800">
            {label}
        </label>
        <div className="input-box">
            <input
                type = {type === "password" ? (showPassword ? "text" : "password") : type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e)}
                className="w-full outline-none bg-transparent"
            />
            {type === "password" && (
                <>
                {showPassword ? (
                    <FaRegEye
                        size={22}
                        className="text-primary cursor-pointer"
                        onClick={() => toggleShowPassword()}
                    />
                ) : (
                    <FaRegEyeSlash
                        size={22}
                        className="text-slate-400 cursor-pointer"
                        onClick={() => toggleShowPassword()}
                    />
                )}
                </>
            )}
        </div>
    </div>
  );
}
export default Input;