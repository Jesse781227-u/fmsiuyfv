import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { useState } from "react";

import Home from "@/pages/Home";
import Private from "@/pages/Private";
import Priority from "@/pages/Priority";
import Premium from "@/pages/Premium";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import Matchmaking from "@/pages/Matchmaking";
import NotFound from "@/pages/not-found";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BottomNav } from "@/components/BottomNav";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/private" component={Private} />
          <Route path="/priority" component={Priority} />
          <Route path="/premium" component={Premium} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={Admin} />
          <Route path="/matchmaking" component={Matchmaking} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      {!loadingDone && (
        <LoadingScreen onComplete={() => setLoadingDone(true)} />
      )}
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
