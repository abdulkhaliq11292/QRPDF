import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export const PremiumContext = createContext();

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    (async () => {
      const value = await SecureStore.getItemAsync("isPremium");
      if (value === "true") setIsPremium(true);
    })();
  }, []);

  const unlockPremium = async () => {
    await SecureStore.setItemAsync("isPremium", "true");
    setIsPremium(true);
  };

  return (
    <PremiumContext.Provider value={{ isPremium, unlockPremium }}>
      {children}
    </PremiumContext.Provider>
  );
};
