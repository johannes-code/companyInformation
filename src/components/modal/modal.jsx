import React from "react";
import './modal.css';

export function Modal() = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Hvis modal ikke er åpen, returner null

  const modalStyle = {
    backgroundColor: children.props.selectedCompany?.konkurs ? 
    '#ffcccc': white,
    padding: '20px',
    borderRadius: '5px',
    maxWidth: '500px',
    margin: '0 auto'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={modalStyle} onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>Lukk</button>
      </div>
    </div>
  );
};
)
