
import {  SignUp } from '@clerk/clerk-react'

export const Register = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 py-8 text-[#262626]">
      <div className="w-full max-w-[470px]">

        {/* Register Card */}
        <div className="bg-white border border-[#dbdbdb] rounded-[2px] px-8 pt-6 pb-7 shadow-sm">

          {/* Instagram Logo */}
          <div className="flex justify-center mb-2">
            <h1 className="text-2xl font-bold font-serif bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              Instagram
            </h1>
          </div>

          <p className="text-center text-xs text-neutral-500 mb-6">
            Sign up to see photos and videos from your friends.
          </p>

          {/* Clerk Sign Up */}
          <div className="clerk-container">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "w-full bg-[#0095f6] hover:bg-[#1877f2] text-white text-[14px] font-semibold rounded-lg py-2.5 shadow-none",

                  formFieldInput:
                    "w-full px-3 py-2.5 rounded-[4px] bg-[#fafafa] border border-[#dbdbdb] text-[12px] text-[#262626] placeholder:text-[#8e8e8e]",

                  formFieldLabel: "hidden",

                  dividerRow: "my-5",

                  dividerText:
                    "text-[13px] font-semibold text-[#8e8e8e]",

                  socialButtonsBlockButton:
                    "w-full border border-[#dbdbdb] rounded-lg py-3 px-4 text-[14px] font-semibold text-[#262626] hover:bg-[#fafafa]",

                  footerAction: "text-[12px] text-center",

                  footerActionLink:
                    "font-semibold text-[#0095f6] hover:underline",

                  card: "shadow-none border-none bg-transparent",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};