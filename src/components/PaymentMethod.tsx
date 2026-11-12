/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { getPaymentMethodImage, getPaymentMethodLabel } from "@/lib/utils/paymentMethodUtils";
import React, { useEffect, useState } from "react";

// Wallet type
interface Wallet {
  id: string;
  name: string;
  min_deposit: number;
  max_deposit: number;
  [key: string]: any; // extra fields allowed
}

interface PaymentMethodProps {
  method: Wallet;
  selectedPaymentMethod: Wallet;
  onClick: () => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  method,
  selectedPaymentMethod,
  onClick,
}) => {
  const isSelected = selectedPaymentMethod?.id === method.id;
  const fallbackImg = getPaymentMethodImage(method.name);
  const [imgSrc, setImgSrc] = useState<string>(method.image || fallbackImg);

  useEffect(() => {
    setImgSrc(method.image || fallbackImg);
  }, [method.image, fallbackImg]);

  return (
    <div
      className={`flex-shrink-0 mx-1 cursor-pointer whitespace-nowrap`}
      onClick={onClick}
    >
      <div
        className={`w-24 h-24 rounded-lg border-2 flex flex-col items-center justify-center p-3 transition-all ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        {/* Image of payment method */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <img
            src={imgSrc}
            alt={getPaymentMethodLabel(method.name)}
            className="w-12 h-12 object-contain"
            onError={() => {
              if (imgSrc !== fallbackImg) {
                setImgSrc(fallbackImg);
              }
            }}
          />
        </div>

        <span
          className={`mt-2 text-sm font-medium ${
            isSelected ? "text-blue-700" : "text-gray-700"
          }`}
        >
          {getPaymentMethodLabel(method.name)}
        </span>
      </div>
    </div>
  );
};

export default PaymentMethod;
