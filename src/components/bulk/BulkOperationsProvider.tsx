
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BulkOperationsContextType {
  selectedItems: Set<string>;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  selectionCount: number;
}

const BulkOperationsContext = createContext<BulkOperationsContextType | undefined>(undefined);

interface BulkOperationsProviderProps {
  children: ReactNode;
}

export const BulkOperationsProvider: React.FC<BulkOperationsProviderProps> = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const selectItem = (id: string) => {
    setSelectedItems(prev => new Set([...prev, id]));
  };

  const deselectItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const selectAll = (ids: string[]) => {
    setSelectedItems(new Set(ids));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const isSelected = (id: string) => {
    return selectedItems.has(id);
  };

  const value = {
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    isSelected,
    selectionCount: selectedItems.size
  };

  return (
    <BulkOperationsContext.Provider value={value}>
      {children}
    </BulkOperationsContext.Provider>
  );
};

export const useBulkOperations = () => {
  const context = useContext(BulkOperationsContext);
  if (!context) {
    throw new Error('useBulkOperations must be used within a BulkOperationsProvider');
  }
  return context;
};
