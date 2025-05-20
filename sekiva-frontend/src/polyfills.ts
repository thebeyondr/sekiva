// Polyfill crypto-related functionality for browsers
import "crypto-browserify";
import "stream-browserify";

// Make sure global is defined
if (typeof window !== "undefined") {
  // @ts-expect-error - window.global doesn't exist in Window interface
  window.global = window;
}

export const setupPolyfills = () => {
  // This function is called to ensure the imports are included
  // and the global variables are properly initialized
  console.log("Crypto polyfills initialized");
};
