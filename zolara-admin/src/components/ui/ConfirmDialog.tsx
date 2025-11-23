import React from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'destructive'
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-4 py-2"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            className="px-4 py-2 text-white"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};