import React, { Suspense } from "react";
import AuthContainer from "@/components/auth/AuthContainer";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <div>
      <AuthContainer
        title="Register"
        formRedirectLinkPlaceholder="Login"
        formRedirectText="You already have an account"
        formRedirectLink="/login"
      >
        <Suspense fallback={<div className="py-6 text-center text-sm text-[#23ffc8]">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </AuthContainer>
    </div>
  );
};

export default Register;
