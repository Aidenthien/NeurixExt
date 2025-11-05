import React from "react"

interface InputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  icon?: "search" | "text"
  type?: string
}

function Input({ 
  value, 
  onChange, 
  placeholder = "", 
  icon = "text",
  type = "text"
}: InputProps) {
  return (
    <div className="input-wrapper">
      {icon === "search" && (
        <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      )}
      <input
        type={type}
        className={`input ${icon === "search" ? 'input-with-icon' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}

export default Input
