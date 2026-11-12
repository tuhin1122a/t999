/**
 * Payment method utilities for mapping method names to image paths
 */

// Mapping of payment method names to image filenames
const PAYMENT_METHOD_IMAGE_MAP: Record<string, string> = {
  // Bangladesh mobile financial services
  "bkash": "bkash.png",
  "nagad": "nagad.png",
  "rocket": "rocket.png",
  "upay": "upay.png",
  
  // Common variations
  "bKash": "bkash.png",
  "Nagad": "nagad.png",
  "Rocket": "rocket.png",
  "Upay": "upay.png",
  
  // If the method name already includes .png
  "bkash.png": "bkash.png",
  "nagad.png": "nagad.png",
  "rocket.png": "rocket.png",
  "upay.png": "upay.png",
};

/**
 * Get the image path for a payment method
 * @param methodName - The payment method name from the API
 * @returns The image path
 */
export function getPaymentMethodImage(methodName: string): string {
  if (!methodName) return "/wallet/bkash.png";
  const normalizedMethodName = methodName.toLowerCase().trim();
  
  if (normalizedMethodName.includes("bkash")) {
    return "/wallet/bkash.png";
  }
  if (normalizedMethodName.includes("nagad") || normalizedMethodName.includes("nogod")) {
    return "/wallet/nagad.png";
  }
  if (normalizedMethodName.includes("rocket")) {
    return "/wallet/rocket.png";
  }
  if (normalizedMethodName.includes("upay")) {
    return "/wallet/upay.png";
  }

  // Check if we have a direct mapping
  if (PAYMENT_METHOD_IMAGE_MAP[normalizedMethodName]) {
    return `/wallet/${PAYMENT_METHOD_IMAGE_MAP[normalizedMethodName]}`;
  }
  
  // Fallback to using the method name directly
  return `/wallet/${normalizedMethodName}.png`;
}

/**
 * Get the display label for a payment method
 * @param methodName - The payment method name from the API
 * @returns The formatted display label
 */
export function getPaymentMethodLabel(methodName: string): string {
  // Capitalize first letter and format nicely
  return methodName.charAt(0).toUpperCase() + methodName.slice(1);
}