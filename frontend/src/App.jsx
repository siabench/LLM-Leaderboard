import React from "react";

import Landing from "./components/Landing";
import Leaderboard from "./components/Leaderboard";
import AlertTriagingLeaderboard from "./components/AlertTriagingLeaderboard";
import Footer from "./components/Footer";
import Info from "./components/Info";
import MotionBackground from "./components/MotionBackground";

export default function App() {
  return (
    <div className="relative min-h-screen bg-gray-50">
      <MotionBackground />
      <div className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory">
        <section className="snap-start min-h-screen w-screen flex justify-center items-center bg-white">
          <div className="w-full max-w-5xl h-full overflow-y-auto">
            <Landing />
          </div>
        </section>
        <section className="snap-start min-h-screen w-screen flex justify-center items-center bg-gray-50">
          <div className="w-full max-w-5xl h-full overflow-y-auto">
            <Leaderboard />
          </div>
        </section>
        <section className="snap-start min-h-screen w-screen flex justify-center items-center bg-gray-50">
          <div className="w-full max-w-5xl h-full overflow-y-auto">
            <AlertTriagingLeaderboard />
          </div>
        </section>
        <section className="snap-start min-h-screen w-screen flex justify-center items-center bg-white">
          <div className="w-full max-w-5xl h-full overflow-y-auto">
            <Info />
          </div>
        </section>
        <section className="snap-start min-h-screen w-screen flex justify-center items-center bg-gray-50">
          <div className="w-full max-w-5xl h-full overflow-y-auto">
            <Footer />
          </div>
        </section>
      </div>
    </div>
  );
}
