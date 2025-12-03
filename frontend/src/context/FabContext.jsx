import React, { createContext, useContext, useState } from 'react';

const FabContext = createContext();

export const FabProvider = ({ children }) => {
    // Default date for new movements (defaults to today)
    const [fabDate, setFabDate] = useState(new Date().toISOString().split('T')[0]);

    // Trigger to notify pages that a movement was added
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const triggerUpdate = () => {
        setLastUpdate(Date.now());
    };

    return (
        <FabContext.Provider value={{ fabDate, setFabDate, lastUpdate, triggerUpdate }}>
            {children}
        </FabContext.Provider>
    );
};

export const useFab = () => useContext(FabContext);
