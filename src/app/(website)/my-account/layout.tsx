import React from "react";
import AccountTopBar from "./_components/account-topbar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div>
        <AccountTopBar />
      </div>
      <div>{children}</div>
    </div>
  );
};

export default layout;
