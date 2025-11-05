import React from "react"

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "success" | "danger"
  fullWidth?: boolean
  disabled?: boolean
}

function Button({ 
  children, 
  onClick, 
  variant = "primary", 
  fullWidth = false,
  disabled = false 
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
