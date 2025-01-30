import './modal.css';

export const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Hvis modal ikke er åpen, returner null

  const isKonkurs = children.props.selectedCompany?.konkurs;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${isKonkurs ? 'konkurs' : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        {children}
        <button onClick={onClose}>Lukk</button>
      </div>
    </div>
  );
};


