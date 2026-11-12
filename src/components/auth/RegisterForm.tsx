"use client";
import React, { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { RiCloseCircleLine } from "react-icons/ri";
import zod from "zod";
import { registerSchema } from "@/schema";
import Variant1 from "../icons/Variant2";

import { FaEyeSlash, FaEye, FaUserShield } from "react-icons/fa6";
import { IoLockOpen } from "react-icons/io5";
import CheckInput from "./CheckInput";
import { useSearchParams } from "next/navigation";
import { register } from "@/action/register";
import { toast } from "react-hot-toast";
import SpinLoader from "../loader/SpinLoader";
import {
  clearStoredAgentCode,
  getStoredAgentCode,
  setStoredAgentCode,
} from "../AgentTracker";

const RegisterForm = () => {
  const searchParams = useSearchParams();
  const agentFromUrl = searchParams.get("agent")?.trim() || "";
  const [pending, startTransiction] = useTransition();
  const [resolvedAgent, setResolvedAgent] = useState<{
    name: string;
    agentCode: string;
  } | null>(null);

  const form = useForm<zod.infer<typeof registerSchema>>({
    defaultValues: {
      phone: "",
      password: "",
      confirmPassword: "",
      ageCheck: true,
      bonusCheck: false,
      agentCode: agentFromUrl,
    },
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const code = (agentFromUrl || getStoredAgentCode()).trim().toUpperCase();
    if (!code) {
      setResolvedAgent(null);
      return;
    }

    if (agentFromUrl) {
      setStoredAgentCode(code);
    }

    form.setValue("agentCode", code);

    let cancelled = false;
    fetch(`/api/sub-admins/resolve?code=${encodeURIComponent(code)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.valid && data?.agent) {
          setResolvedAgent(data.agent);
          form.setValue("agentCode", data.agent.agentCode);
        } else {
          setResolvedAgent(null);
        }
      })
      .catch(() => {
        if (!cancelled) setResolvedAgent(null);
      });

    return () => {
      cancelled = true;
    };
  }, [agentFromUrl, form]);

  const handleRegister = (data: zod.infer<typeof registerSchema>) => {
    if (!data.ageCheck) {
      return;
    }

    const fallbackCode = (
      data.agentCode ||
      agentFromUrl ||
      getStoredAgentCode()
    )
      .trim()
      .toUpperCase();

    startTransiction(() => {
      register({
        ...data,
        agentCode: fallbackCode || undefined,
      }).then((res) => {
        if (res && res.success) {
          clearStoredAgentCode();
          window.location.href = "/";
        } else if (res && res.error) {
          toast.error(res.error);
        }
      });
    });
  };

  const [passwordShow, setPasswordShow] = useState<{
    password: boolean;
    confirmPassword: boolean;
  }>({ password: false, confirmPassword: false });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleRegister)}>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <input
                      placeholder="Enter Phone"
                      disabled={pending}
                      {...field}
                      className="text-white w-full mb-2 outline-none text-sm px-8 py-3 bg-wwwwwwck-44-4comdaintree rounded-[10.4px] overflow-hidden border border-solid border-[#006165] focus:border-[#2f9396] shadow-[0px_2.08px_0px_#002631] placeholder:font-www-wwwck444-com-semantic-input font-[number:var(--www-wwwck444-com-semantic-input-font-weight)] placeholder:text-wwwwwwck444combright-turquoise placeholder:text-[length:var(--www-wwwck444-com-semantic-input-font-size)] placeholder:tracking-[var(--www-wwwck444-com-semantic-input-letter-spacing)] placeholder:leading-[var(--www-wwwck444-com-semantic-input-line-height)] placeholder:[font-style:var(--www-wwwck444-com-semantic-input-font-style)]"
                    />

                    <div className="flex w-[19px] h-[19px] items-center justify-center absolute top-[45%] -translate-y-1/2 left-2.5">
                      <Variant1 className="!relative !flex-1 !grow !h-[18.72px]" />
                    </div>

                    {form.getValues("phone") && (
                      <button
                        onClick={() => form.setValue("phone", "")}
                        className="flex w-[19px] h-[19px] items-center justify-center absolute top-[45%] -translate-y-1/2 right-2.5"
                      >
                        <RiCloseCircleLine className="!relative !flex-1 !grow !h-[18.72px] text-wwwwwwck444combright-turquoise " />
                      </button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <input
                      type={passwordShow.password ? "text" : "password"}
                      placeholder="Password"
                      disabled={pending}
                      {...field}
                      className="text-white w-full mb-2 outline-none text-sm px-8 py-3 bg-wwwwwwck-44-4comdaintree rounded-[10.4px] overflow-hidden border border-solid border-[#006165] focus:border-[#2f9396] shadow-[0px_2.08px_0px_#002631] placeholder:font-www-wwwck444-com-semantic-input font-[number:var(--www-wwwck444-com-semantic-input-font-weight)] placeholder:text-wwwwwwck444combright-turquoise placeholder:text-[length:var(--www-wwwck444-com-semantic-input-font-size)] placeholder:tracking-[var(--www-wwwck444-com-semantic-input-letter-spacing)] placeholder:leading-[var(--www-wwwck444-com-semantic-input-line-height)] placeholder:[font-style:var(--www-wwwck444-com-semantic-input-font-style)]"
                    />

                    <div className="flex w-[19px] h-[19px] items-center justify-center absolute top-[45%] -translate-y-1/2 left-2.5">
                      <IoLockOpen className="!relative !flex-1 !grow !h-[18.72px] text-wwwwwwck444combright-turquoise" />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPasswordShow((state) => ({
                          ...state,
                          password: !state.password,
                        }))
                      }
                      className="flex w-[19px] h-[19px] items-center justify-center absolute top-[45%] -translate-y-1/2 right-2.5"
                    >
                      {passwordShow.password ? (
                        <FaEye className="!relative !flex-1 !grow !h-[18.72px] text-wwwwwwck444combright-turquoise " />
                      ) : (
                        <FaEyeSlash className="!relative !flex-1 !grow !h-[18.72px] text-wwwwwwck444combright-turquoise " />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <input
                      placeholder="Confirm Password"
                      disabled={pending}
                      type={passwordShow.confirmPassword ? "text" : "password"}
                      {...field}
                      className="text-white w-full mb-2 outline-none text-sm px-8 py-3 bg-wwwwwwck-44-4comdaintree rounded-[10.4px] overflow-hidden border border-solid border-[#006165] focus:border-[#2f9396] shadow-[0px_2.08px_0px_#002631] placeholder:font-www-wwwck444-com-semantic-input font-[number:var(--www-wwwck444-com-semantic-input-font-weight)] placeholder:text-wwwwwwck444combright-turquoise placeholder:text-[length:var(--www-wwwck444-com-semantic-input-font-size)] placeholder:tracking-[var(--www-wwwck444-com-semantic-input-letter-spacing)] placeholder:leading-[var(--www-wwwck444-com-semantic-input-line-height)] placeholder:[font-style:var(--www-wwwck444-com-semantic-input-font-style)]"
                    />

                    <div className="flex w-[19px] h-[19px] items-center justify-center absolute top-[45%] -translate-y-1/2 left-2.5">
                      <IoLockOpen className="!relative !flex-1 !grow !h-[18.72px] text-wwwwwwck444combright-turquoise" />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPasswordShow((state) => ({
                          ...state,
                          confirmPassword: !state.confirmPassword,
                        }))
                      }
                      className="flex w-[19px] h-[19px] items-center justify-center absolute top-[45%] -translate-y-1/2 right-2.5"
                    >
                      {passwordShow.confirmPassword ? (
                        <FaEye className="!relative !flex-1 !grow !h-[18.72px] text-wwwwwwck444combright-turquoise " />
                      ) : (
                        <FaEyeSlash className="!relative !flex-1 !grow !h-[18.72px] text-wwwwwwck444combright-turquoise " />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {resolvedAgent && (
            <div className="mb-2 flex items-center gap-2.5 rounded-[10.4px] border border-[#006165] bg-[#002631]/70 px-3 py-2 text-xs text-[#23ffc8]">
              <FaUserShield className="h-4 w-4 shrink-0 text-[#FFB800]" />
              <span>
                Agent:{" "}
                <strong className="text-white">{resolvedAgent.name}</strong> (
                <span className="font-mono text-[#FFB800]">
                  {resolvedAgent.agentCode}
                </span>
                )
              </span>
            </div>
          )}

          <div className="my-3 flex flex-col gap-2">
            <CheckInput
              defaultCheck
              onChecked={(checked) => form.setValue("ageCheck", checked)}
              label="I am over 18 years of age and have read and accepted Terms & Conditions, Privacy Policy & Betting Rules as published on the site.
"
            />
            <CheckInput
              onChecked={(checked) => form.setValue("bonusCheck", checked)}
              label="I would like to receive details of special offers, free bets and other promotions.
"
            />
          </div>

          <button
            disabled={pending || form.getValues("ageCheck") == false}
            className="mt-4 disabled:!bg-[#ffffff0e] disabled:!backdrop-blur-sm disable:!border-white/50 disabled:!text-white/15 "
            style={{
              inlineSize: "100%",
              alignSelf: "stretch",
              blockSize: 33.27,
              padding: 1,
              background:
                "linear-gradient(180deg, var(--color-yellow-50, #FFE600) 0%, var(--color-orange-50, #FFB800) 100%)",
              boxShadow: "0px 1.0399999618530273px 0px #B64100",
              overflow: "hidden",
              borderRadius: 6.24,
              outline:
                "1px var(--color-yellow-83-50%, rgba(255, 242, 166, 0.50)) solid",
              outlineOffset: "-1px",
              justifyContent: "center",
              alignItems: "center",
              display: "inline-flex",
            }}
          >
            <div
              style={{
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                display: "inline-flex",
              }}
            >
              <div
                style={{
                  maxBlockSize: 17.94,
                  textAlign: "center",
                  justifyContent: "center",
                  display: "flex",
                  flexDirection: "column",
                  color: "var(--color-orange-36, #B64100)",
                  fontSize: 15.6,
                  fontFamily: "Segoe UI",
                  fontWeight: "700",
                  blockSize: 17.94,
                  wordWrap: "break-word",
                  textShadow: "0px 1px 0px rgba(159, 52, 0, 0.20)",
                }}
              >
                Register
              </div>
            </div>
          </button>
        </form>
      </Form>

      {pending && <SpinLoader />}
    </>
  );
};

export default RegisterForm;
