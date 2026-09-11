import React from "react";
import { useSearchParams } from "react-router-dom";
// import { Link } from "react-router-dom";
import { SignIn } from '@clerk/clerk-react'

export const Login = () => {
  const [searchParams] = useSearchParams();

  const accountEmail = searchParams.get('account') || '';
  
  const instagramFontStyle = {
    fontFamily: '"Segoe Script", "Bradley Hand", "Comic Sans MS", cursive',
    letterSpacing: "-0.08em",
  };

  return (

    <>
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 py-8 text-[#262626]">

        {/* Main Content */}
        <div className="w-full max-w-[470px]">

          {/* Login Card */}
          <div className="bg-white border border-[#dbdbdb] rounded-[2px] px-8 pt-6 pb-7 shadow-sm">

            {/* Instagram Logo */}
            <div className="flex justify-center mb-8">
              <h1
                className="text-[58px] leading-none font-black tracking-[-0.08em] text-neutral-900 select-none"
                style={{
                  ...instagramFontStyle,
                  fontWeight: 400,
                  transform: "scaleY(1.05)",
                }}
              >
                Instagram
              </h1>
            </div>

            {/* Clerk Sign In */}
            <div className="clerk-container">
              <SignIn
                routing="path"
                path="/login"
                signUpUrl="/register"
                initialValues={accountEmail ? { identifier: accountEmail } : undefined}
                fallbackRedirectUrl="/"
                appearance={{
                  elements: {
                    card: "shadow-none border-none bg-transparent p-0",
                    formButtonPrimary:
                      "w-full bg-[#0095f6] hover:bg-[#1877f2] text-white text-[14px] font-semibold rounded-lg py-2.5 shadow-none",

                    formFieldInput:
                      "w-full px-3 py-2.5 rounded-[4px] bg-[#fafafa] border border-[#dbdbdb] text-[12px] text-[#262626] placeholder:text-[#8e8e8e]",

                    formFieldLabel: "hidden",

                    dividerRow: "my-5",
                    dividerText: "text-[13px] font-semibold text-[#8e8e8e]",

                    socialButtonsBlockButton:
                      "w-full border border-[#dbdbdb] rounded-lg py-3 px-4 text-[14px] font-semibold text-[#262626] hover:bg-[#fafafa]",

                    footerAction: "text-[12px] text-center",
                    footerActionLink:
                      "font-semibold text-[#0095f6] hover:underline",
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 w-full max-w-[1000px] text-center text-[12px] text-[#8e8e8e]">

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <a href="#" className="hover:underline">Meta</a>
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Blog</a>
            <a href="#" className="hover:underline">Jobs</a>
            <a href="#" className="hover:underline">Help</a>
            <a href="#" className="hover:underline">API</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Locations</a>
            <a href="#" className="hover:underline">Instagram Lite</a>
            <a href="#" className="hover:underline">Threads</a>
            <a href="#" className="hover:underline">
              Contact Uploading &amp; Non-Users
            </a>
            <a href="#" className="hover:underline">Meta Verified</a>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <select className="bg-transparent border-none text-[12px] text-[#8e8e8e] focus:outline-none cursor-pointer">
              <option>English</option>
            </select>

            <span>© 2024 Instagram from Meta</span>
          </div>
        </footer>
      </div>



    </>
  );
};




