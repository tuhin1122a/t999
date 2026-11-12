"use client";
import Image from "next/image";
import React, { useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import gift from "@/../public/icons/rewards/signin-modal-bg-gift.png";
import money from "@/../public/icons/rewards/money.png";

interface SigninBonusModalProps {
  children: React.ReactNode;
  prize: number;
}

const SigninBonusModal = ({ children, prize }: SigninBonusModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </button>
      {open && (
        <div className="bg-black/75 z-[1001] w-full h-screen fixed inset-0 flex justify-center items-center p-4 backdrop-blur-sm">
          <div className="max-w-[320px] w-full relative">
            <div className="rounded-3xl overflow-hidden border border-[#1d3d66] bg-[#0a1626] shadow-2xl">
              <div className="bg-gradient-to-r from-[#11243d] to-[#1a385c] flex items-center pl-5 relative h-[70px] border-b border-[#1b3558]">
                <h4 className="text-lg text-white font-black">Today&apos;s Reward</h4>
                <Image
                  src={gift}
                  className="w-[140px] absolute right-0 bottom-0 pointer-events-none"
                  alt="Gift"
                />
              </div>

              <div className="p-5 bg-[#071322] space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a182b] border border-[#163354]">
                  <div className="flex items-center gap-2.5">
                    <Image src={money} alt="Money" className="w-8 h-8 object-contain" />
                    <span className="text-xs font-black text-gray-300">Daily Bonus Drop</span>
                  </div>
                  <span className="text-base font-black text-yellow-400">৳ {prize}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <IoIosCloseCircle className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SigninBonusModal;
