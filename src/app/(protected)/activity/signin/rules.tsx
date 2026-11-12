import React from "react";
import { FaShieldAlt, FaCheck, FaCoins, FaClock } from "react-icons/fa";

const Rules = () => {
  const rulesList = [
    {
      icon: <FaCoins className="text-yellow-400" />,
      title: "প্রতিদিনের ডিপোজিট ও সাইন-ইন মিশন",
      desc: "প্রতিটি দিনের জন্য নির্ধারিত ন্যূনতম ডিপোজিট (যেমন ২০০ ৳ বা ৫০০ ৳) সম্পন্ন করলেই স্বয়ংক্রিয়ভাবে উক্ত দিনের ফ্রি ক্যাশ ক্লেইম করার অপশন আনলক হবে।",
    },
    {
      icon: <FaCheck className="text-emerald-400" />,
      title: "মাত্র ১x সহজ টার্নওভার (Ultra-low 1x Turnover)",
      desc: "সাইন-ইন রিওয়ার্ডের সমস্ত বোনাস মাত্র ১x টার্নওভারেই সরাসরি মূল অ্যাকাউন্টে উইথড্র কিংবা যেকোনো ক্যাসিনো/স্লটে বাজি ধরার জন্য ব্যবহারযোগ্য।",
    },
    {
      icon: <FaClock className="text-[#3888e9]" />,
      title: "২৪ ঘণ্টার সাইকেল ও ডে ৭ মেগা রিওয়ার্ড",
      desc: "প্রতিদিন বাংলাদেশ সময় রাত ১২:০০ টায় (00:00 GMT+6) নতুন দিনের মিশন শুরু হয়। টানা ৭ দিন স্ট্রিক বজায় রাখলে ডে ৭-এ বিশেষ মেগা সারপ্রাইজ উপহার পাওয়া যাবে!",
    },
    {
      icon: <FaShieldAlt className="text-pink-400" />,
      title: "নিরাপদ ও ফেয়ার প্লে রুলস",
      desc: "প্রতিটি নিবন্ধিত প্লেয়ার এবং আইপি ঠিকানার জন্য দিনে সর্বোচ্চ একটি রিওয়ার্ড প্রযোজ্য। মাল্টিপল অ্যাকাউন্ট বা অপব্যবহার সম্পূর্ণ নিষিদ্ধ।",
    },
  ];

  return (
    <div className="rounded-2xl p-4 sm:p-6 bg-[#0a1626] border border-[#162e4a] space-y-4">
      <div className="border-b border-[#142844] pb-3">
        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <FaShieldAlt className="text-emerald-400" />
          <span>Daily Check-in Rules & FAQ (নিয়মাবলী)</span>
        </h3>
        <p className="text-[11px] text-gray-400 font-medium">
          দৈনিক সাইন-ইন রিওয়ার্ড এবং বোনাস আনলক সংক্রান্ত যাবতীয় নিয়ম নিচে দেওয়া হলো।
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rulesList.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-[#071322] border border-[#132842] space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{item.icon}</span>
              <h4 className="text-xs font-black text-white">{item.title}</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rules;
