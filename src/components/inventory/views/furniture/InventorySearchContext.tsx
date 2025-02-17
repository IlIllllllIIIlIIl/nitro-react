import { createContext, FC, PropsWithChildren, useContext, useState } from 'react';

interface InventorySearchContextProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
}

interface InventorySearchProviderProps extends PropsWithChildren {
    context?: string;
}

const getStorageKey = (context: string = 'inventory') => `${context}_search_value`;

const InventorySearchContext = createContext<InventorySearchContextProps>({
    searchValue: '',
    setSearchValue: () => {}
});

export const InventorySearchProvider: FC<InventorySearchProviderProps> = ({ children, context = 'inventory' }) => {
    const storageKey = getStorageKey(context);
    
    const [searchValue, setSearchValue] = useState(() => {
        return localStorage.getItem(storageKey) || '';
    });

    const handleSetSearchValue = (value: string) => {
        setSearchValue(value);
        localStorage.setItem(storageKey, value);
    };

    return (
        <InventorySearchContext.Provider value={{ 
            searchValue, 
            setSearchValue: handleSetSearchValue
        }}>
            {children}
        </InventorySearchContext.Provider>
    );
};

export const useInventorySearch = () => useContext(InventorySearchContext); 
