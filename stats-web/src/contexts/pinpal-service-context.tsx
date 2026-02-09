import { createContext, useContext, useRef, type ReactNode } from "react";
import { PinpalService } from "@/services/pinpal.service";

const PinpalServiceContext = createContext<PinpalService | null>(null);

export function PinpalServiceProvider({ children }: { children: ReactNode }) {
  const serviceRef = useRef<PinpalService>(new PinpalService());

  return (
    <PinpalServiceContext.Provider value={serviceRef.current}>
      {children}
    </PinpalServiceContext.Provider>
  );
}

export function usePinpalService(): PinpalService {
  const service = useContext(PinpalServiceContext);
  if (!service) {
    throw new Error(
      "usePinpalService must be used within PinpalServiceProvider",
    );
  }
  return service;
}
