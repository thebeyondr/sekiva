import { Buffer } from "buffer";

// Types for contract data handling
export interface SerializedContractData {
  data?: unknown;
  type?: string;
  [key: string]: unknown;
}

// Contract data interface with serializedContract field
export interface ContractWithState {
  serializedContract?: unknown;
  [key: string]: unknown;
}

// Specify byte array type
export type ByteArray = number[] | Uint8Array;

/**
 * Safely converts serialized contract data to a Buffer that can be used for deserialization.
 * Handles various formats that might be returned from the blockchain client.
 *
 * @param serializedData - The serialized contract data in any format
 * @param fallbackHandler - Optional callback to handle fallback case when format is unrecognized
 * @returns Buffer containing the binary data, or undefined if conversion failed and no fallback provided
 */
export function safelyConvertToBuffer(
  serializedData: unknown,
  fallbackHandler?: () => Buffer | undefined
): Buffer | undefined {
  try {
    console.log(
      "Converting serialized data to buffer, type:",
      typeof serializedData
    );

    // Handle different serialized data formats
    if (typeof serializedData === "string") {
      // If it's a base64 string
      const buffer = Buffer.from(serializedData, "base64");
      console.log("Created buffer from string, length:", buffer.length);
      return buffer;
    }

    if (Array.isArray(serializedData)) {
      // If it's an array of bytes
      const buffer = Buffer.from(serializedData);
      console.log("Created buffer from array, length:", buffer.length);
      return buffer;
    }

    if (typeof serializedData === "object" && serializedData !== null) {
      const serialized = serializedData as SerializedContractData;
      console.log("Object serialized data keys:", Object.keys(serialized));

      // Case 1: Object has a 'data' field that is a base64 string or array
      if ("data" in serialized && serialized.data) {
        if (typeof serialized.data === "string") {
          const buffer = Buffer.from(serialized.data, "base64");
          console.log(
            "Created buffer from object.data string, length:",
            buffer.length
          );
          return buffer;
        }

        if (Array.isArray(serialized.data)) {
          const buffer = Buffer.from(serialized.data as ByteArray);
          console.log(
            "Created buffer from object.data array, length:",
            buffer.length
          );
          return buffer;
        }

        console.error(
          "Unexpected serializedContract.data format:",
          typeof serialized.data
        );
      }

      // Case 2: Object might be a buffer-like object with a specific structure
      if (
        "type" in serialized &&
        serialized.type === "Buffer" &&
        "data" in serialized
      ) {
        const buffer = Buffer.from(serialized.data as ByteArray);
        console.log(
          "Created buffer from Buffer-like object, length:",
          buffer.length
        );
        return buffer;
      }
    }

    // If we've reached here, we couldn't parse the data
    console.error(
      "Unexpected serializedContract format:",
      typeof serializedData
    );

    // Use fallback if provided
    if (fallbackHandler) {
      return fallbackHandler();
    }

    return undefined;
  } catch (error) {
    console.error("Error processing contract data:", error);

    // Use fallback if provided
    if (fallbackHandler) {
      return fallbackHandler();
    }

    return undefined;
  }
}

/**
 * Helper function to safely get state from a serialized contract response
 *
 * @param contract - The contract data from the blockchain
 * @param deserializeFunction - Function to deserialize the buffer into state
 * @param createFallbackState - Function to create a minimal fallback state if deserialization fails
 * @returns The deserialized state or fallback state
 */
export function safelyGetState<T>(
  contract: ContractWithState | null | undefined,
  deserializeFunction: (buffer: Buffer) => T,
  createFallbackState: () => T
): T {
  if (contract == null) {
    console.log("No contract data found, using fallback state");
    return createFallbackState();
  }

  if (!("serializedContract" in contract)) {
    console.log("No serializedContract field found, using fallback state");
    return createFallbackState();
  }

  const buffer = safelyConvertToBuffer(contract.serializedContract, () => {
    console.log("Falling back to minimal state object");
    return undefined;
  });

  if (!buffer) {
    console.log(
      "Could not convert contract data to buffer, using fallback state"
    );
    return createFallbackState();
  }

  try {
    return deserializeFunction(buffer);
  } catch (error) {
    console.error("Error deserializing contract state:", error);
    return createFallbackState();
  }
}
