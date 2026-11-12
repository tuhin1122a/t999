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
  const officialLogo = getPaymentMethodImage(method.name);
  const initialImg =
    method.image && !method.image.includes("mbuzz88")
      ? method.image
      : officialLogo;
  const [imgSrc, setImgSrc] = useState<string>(initialImg);

  useEffect(() => {
    const freshImg =
      method.image && !method.image.includes("mbuzz88")
        ? method.image
        : officialLogo;
    setImgSrc(freshImg);
  }, [method.image, method.name, officialLogo]);

  return (
    <div
      className="flex-shrink-0 mx-1 cursor-pointer whitespace-nowrap select-none"
      onClick={onClick}
    >
      <div
        className={`relative w-28 h-20 sm:w-32 sm:h-22 rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-200 active:scale-95 ${
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

        {/* White badge for crystal-clear official logo display */}
        <div className="w-full h-10 rounded-lg bg-white px-2 py-1 flex items-center justify-center shadow-sm">
          <img
            src={imgSrc}
            alt={getPaymentMethodLabel(method.name)}
            className="max-h-7 max-w-[85px] sm:max-w-[95px] w-auto h-auto object-contain"
            onError={() => {
              if (imgSrc !== officialLogo) {
                setImgSrc(officialLogo);
              }
            }}
          />
        </div>

        <span
          className={`mt-1.5 text-[11px] sm:text-xs font-bold truncate max-w-[95px] tracking-tight ${
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
