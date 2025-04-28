"use client";

import { Button } from "@mantine/core";
import { signOut } from "next-auth/react";

const SignOut = () => {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex justify-center">
      <Button variant="filled" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
};

export { SignOut };
