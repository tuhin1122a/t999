/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { getPaymentMethodImage, getPaymentMethodLabel } from "@/lib/utils/paymentMethodUtils";
import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";

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
      className="flex-shrink-0 mx-1 cursor-pointer whitespace-nowrap select-none"
      onClick={onClick}
    >
      <div
        className={`relative w-24 h-24 sm:w-26 sm:h-26 rounded-xl flex flex-col items-center justify-center p-2.5 transition-all duration-200 active:scale-95 ${
          isSelected
            ? "bg-gradient-to-b from-[#142a47] to-[#0c1a2d] border-2 border-[#3888e9] shadow-lg shadow-[#3888e9]/20 ring-2 ring-[#3888e9]/40"
            : "bg-[#0a1626] border border-[#183454] hover:border-[#3888e9]/50 hover:bg-[#0f223b]"
        }`}
      >
        {/* Selected badge */}
        {isSelected && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#3888e9] text-white flex items-center justify-center text-[10px] shadow-md border-2 border-[#070e17]">
            <FaCheck />
          </span>
        )}

        {/* White badge for crystal-clear logo display */}
        <div className="relative w-12 h-12 rounded-lg bg-white p-1.5 flex items-center justify-center shadow-inner">
          <img
            src={imgSrc}
            alt={getPaymentMethodLabel(method.name)}
            className="max-h-9 max-w-9 w-auto h-auto object-contain"
            onError={() => {
              if (imgSrc !== fallbackImg) {
                setImgSrc(fallbackImg);
              }
            }}
          />
        </div>

        <span
          className={`mt-2 text-xs font-bold truncate max-w-[85px] tracking-tight ${
            isSelected ? "text-white" : "text-gray-300"
          }`}
        >
          {getPaymentMethodLabel(method.name)}
        </span>
      </div>
    </div>
  );
};

export default PaymentMethod;
