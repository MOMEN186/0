import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Button from "../common/custom-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import DiscordIcon from "@/icons/discord";
import { signInWithGoogle, signInWithEmail, signInWithDiscord } from "@/lib/firebase/auth";
type FormData = {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
};

function LoginPopoverButton() {
 

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const clearForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="bg-white text-md text-black hover:bg-gray-200 hover:text-black transition-all duration-300"
          >
            Login
          </Button>
        
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        className="bg-black bg-opacity-50 backdrop-blur-sm w-[300px] mt-4 mr-4 p-4"
      >
        <Tabs defaultValue="login">
          <TabsList>
            <TabsTrigger onClick={clearForm} value="login">
              Login
            </TabsTrigger>
            <TabsTrigger onClick={clearForm} value="signup">
              Signup
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="flex flex-col gap-2">
            <div className="mt-2">
              <p className="text-gray-300 text-xs">Email or Username:</p>
              <Input
                required
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                type="text"
                value={formData.username}
                placeholder="Enter your email/username"
              />
            </div>
            <div>
              <p className="text-gray-300 text-xs">Password:</p>
              <Input
                required
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
              />
            </div>
            <Button
              variant="default"
              className="w-full text-xs"
              size="sm"
              type="submit"
               onClick={()=>signInWithEmail(formData.email, formData.password)}
            >
              Login
            </Button>
            <hr className="text-white text-xs text-center" />
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-800 text-white w-full text-xs"
              size="sm"
              onClick={() => signInWithDiscord()}
            >
              <DiscordIcon className="mr-2" />
              Login with Discord
            </Button>
            <Button
              variant="default"
              className="bg-white hover:bg-gray-100 text-black w-full text-xs mt-2 border border-gray-300 flex items-center justify-center"
              size="sm"
              onClick={signInWithGoogle}
            >
              <svg className="mr-2" width="18" height="18" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.13 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.99 6.2C12.36 13.98 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.21-.42-4.73H24v9.18h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.59C43.99 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.68 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.99-6.2C.64 15.1 0 19.44 0 24c0 4.56.64 8.9 2.69 12.24l7.99-6.2z"/><path fill="#EA4335" d="M24 48c6.13 0 11.64-2.03 15.84-5.53l-7.19-5.59c-2.01 1.35-4.58 2.14-8.65 2.14-6.26 0-11.64-4.48-13.32-10.59l-7.99 6.2C6.73 42.2 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Login with Google
            </Button>
          </TabsContent>
          <TabsContent value="signup" className="flex flex-col gap-2">
            <div>
              <p className="text-gray-300 text-xs">Username:</p>
              <Input
                required
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                type="text"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <p className="text-gray-300 text-xs">Email:</p>
              <Input
                required
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <p className="text-gray-300 text-xs">Password:</p>
              <Input
                required
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                type="password"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <p className="text-gray-300 text-xs">Confirm Password:</p>
              <Input
                required
                onChange={(e) =>
                  setFormData({ ...formData, confirm_password: e.target.value })
                }
                type="password"
                placeholder="Enter your password again"
              />
            </div>
            <Button
              variant="default"
              className="w-full text-xs"
              size="sm"
              type="submit"
              onClick={()=>signInWithEmail(formData.email, formData.password)}
            >
              Signup
            </Button>
            <hr className="text-white text-xs text-center" />
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-800 text-white w-full text-xs"
              size="sm"
              onClick={()=> signInWithDiscord()}
            >
              <DiscordIcon className="mr-2" />
              Signup with Discord
            </Button>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

export default LoginPopoverButton;
