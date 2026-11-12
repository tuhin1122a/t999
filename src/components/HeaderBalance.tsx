/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { HiOutlineRefresh } from "react-icons/hi";
import {
  RiCustomerService2Line,
  RiAccountPinCircleFill,
  RiWallet3Fill,
  RiExchangeDollarFill,
  RiAddCircleFill,
} from "react-icons/ri";
import { FaRegFileAlt } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdHistory } from "react-icons/md";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { redirect, useRouter } from "next/navigation";
import { logout } from "@/action/logout";
import { getCurrencySymbol } from "@/lib/utils";
import { openTawkChat } from "@/lib/tawk";
const UserBalance = ({
  balance: initialBalance,
  currency,
}: {
  balance: number;
  currency: string;
}) => {
  const [currentBalance, setCurrentBalance] = useState<number>(initialBalance);
  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    setCurrentBalance(initialBalance);
  }, [initialBalance]);

  const handleRefresh = React.useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.payload?.balance !== undefined) {
          setCurrentBalance(Number(data.payload.balance));
        }
      }
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Auto-refresh balance on tab focus and every 20 seconds
  React.useEffect(() => {
    const onFocus = () => {
      handleRefresh();
    };
    window.addEventListener("focus", onFocus);
    const interval = setInterval(() => {
      handleRefresh();
    }, 20_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [handleRefresh]);

  return (
    <section className="flex relative items-center h-full ">
      <div className="flex items-center h-full">
        <div className="relative h-full">
          <div className="flex items-center h-full">
            <div className="flex items-center h-full">
              <UserAvatar imageUrl="https://images.51939393.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png" />
              <div
                className="flex items-center px-2 rounded-md border border-[#1b3554] bg-[#07101b] h-[32px] shadow-inner"
                aria-haspopup="true"
              >
                <div className="flex items-center w-full ">
                  <BalanceDisplay
                    amount={currentBalance}
                    currencySymbol={getCurrencySymbol(currency)!}
                  />
                  <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} />
                </div>
              </div>

              {/* Quick Deposit Button in Header (1xBet style) */}
              <Link
                href="/deposit"
                className="ml-2 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white rounded-md text-xs font-black shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                title="Deposit Funds"
              >
                <RiAddCircleFill size={14} className="text-white" />
                <span className="hidden xs:inline">Deposit</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface UserAvatarProps {
  imageUrl: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  imageUrl,
  className = "",
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`overflow-x-hidden overflow-y-hidden p-0.5 mr-2 border border-t border-r border-b border-l border-solid bg-[linear-gradient(rgb(255,230,0),rgb(255,184,0))] border-orange-200 border-opacity-50  rounded-[39.168px] shadow-[rgb(255,242,166)_0px_1.9584px_0px_1.7px_inset,rgb(182,65,0)_0px_1.9584px_0px_0px] w-[39px] h-[39px] ${className}`}
        >
          <div className="flex overflow-x-hidden overflow-y-hidden relative justify-center items-center rounded-full size-full">
            <div className="overflow-x-hidden overflow-y-hidden rounded-full size-full">
              <img
                alt="User avatar"
                src={imageUrl || "https://images.51939393.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png"}
                className="overflow-x-clip overflow-y-clip size-full  object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.51939393.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png";
                }}
              />
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-[1000] bg-transparent border-none">
        <DropdownMenu />
      </PopoverContent>
    </Popover>
  );
};

interface BalanceDisplayProps {
  amount: number;
  currencySymbol: string;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  amount,
  currencySymbol,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            className="flex items-center w-full"
          >
            <div className="flex items-center w-full">
              <div className="flex overflow-x-hidden overflow-y-hidden items-center text-sm font-bold text-yellow-400 whitespace-nowrap max-w-[104px] text-ellipsis">
                <span className="mr-1 text-sm font-bold text-yellow-400 whitespace-nowrap">
                  {currencySymbol}
                </span>
                <span className="overflow-x-hidden overflow-y-hidden text-sm font-bold text-yellow-400 whitespace-nowrap text-ellipsis tracking-wide">
                  {amount}
                </span>
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="z-[1000] bg-transparent border-none">
          <DropdownMenu />
        </PopoverContent>
      </Popover>
    </>
  );
};

const RefreshButton: React.FC<{ onRefresh?: () => void; isRefreshing?: boolean }> = ({ onRefresh, isRefreshing }) => {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isRefreshing}
      className="flex shrink-0 justify-center items-center ml-1.5 h-[18px] w-[18px] cursor-pointer hover:opacity-80 active:scale-95 transition-all"
      title="Refresh balance"
    >
      <div className="overflow-x-hidden overflow-y-hidden bg-cover flex justify-center items-center h-full w-full size-full">
        <HiOutlineRefresh className="w-3.5 h-3.5 text-teal-400" />
      </div>
    </button>
  );
};

const DropdownMenu: React.FC = () => {
  const router = useRouter();
  const handleLogout = () => {
    logout().then((res) => {
      if (res && res.success) {
        location.reload();
      } else if (res.error) {
        console.log(res.error);
      }
    });
  };

  const menuItems = [
    {
      icon: <RiAccountPinCircleFill className="w-6 h-6 text-white" />,
      label: "Profile",
      onclick: () => redirect("/member"),
    },
    {
      icon: <MdHistory className="w-6 h-6 text-white" />,
      label: "History",
      onclick: () => redirect("/history"),
    },
    {
      icon: <FaRegFileAlt className="w-6 h-6 text-white" />,
      label: "Profit And Loss",
      onclick: () => redirect("/profitandloss"),
    },

    {
      icon: <RiWallet3Fill className="w-5 h-5 text-emerald-400" />,
      label: "Deposit",
      onclick: () => redirect("/deposit"),
    },
    {
      icon: <RiExchangeDollarFill className="w-5 h-5 text-yellow-400" />,
      label: "Withdrawal",
      onclick: () => redirect("/withdraw"),
    },
    {
      icon: <RiCustomerService2Line className="w-6 h-6 text-white" />,
      label: "Customer Service",
      onclick: () => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        if (!openTawkChat()) {
          router.push("/support");
        }
      },
    },
    {
      icon: <IoLogOut className="w-5 h-5 text-white" />,
      label: "Logout",
      onclick: () => handleLogout(),
    },
  ];

  return (
    <div className="fixed top-[5%] right-[3%] z-[100]">
      <div className="overflow-y-auto overflow-x-hidden absolute p-1.5 rounded-xl border border-t border-r border-b border-l border-cyan-600 border-solid bg-[rgb(0,38,50)] duration-[0.2s] ease-[ease-out] max-h-[489.6px] min-w-[217px] origin-[100%_0%] right-[-6.912px] shadow-[rgba(0,0,0,0.25)_0px_4.608px_4.608px_0px,rgb(0,38,49)_0px_2.304px_0px_0px] top-[calc(100%_+_5.76px)] z-[101]">
        <nav>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              onClick={item.onclick}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  link?: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-4 py-2 text-sm font-medium text-emerald-50 border-emerald-50 decoration-emerald-50 outline-emerald-50 w-full text-left"
    >
      <div className="overflow-x-hidden overflow-y-hidden shrink-0 mr-2 w-7 h-7 flex justify-center items-center text-sm font-medium text-emerald-50 bg-cover border-emerald-50 decoration-emerald-50 fill-emerald-50 outline-emerald-50">
        {icon}
      </div>
      <div className="text-sm font-medium text-emerald-50 border-emerald-50 decoration-emerald-50 outline-emerald-50">
        <span className="text-sm font-medium text-emerald-50 border-emerald-50 decoration-emerald-50 outline-emerald-50">
          {label}
        </span>
      </div>
    </button>
  );
};
export default UserBalance;
