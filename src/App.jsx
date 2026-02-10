import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import {
  Gamepad2,
  Frown,
  Smile,
  Zap,
  Ghost,
  Heart,
  Star,
  Crown,
  Dices,
} from "lucide-react";

const iconSet = [
  { icon: Gamepad2, color: "text-red-400" },
  { icon: Smile, color: "text-green-400" },
  { icon: Crown, color: "text-yellow-400" },
  { icon: Star, color: "text-cyan-400" },
  { icon: Heart, color: "text-red-400" },
  { icon: Ghost, color: "text-indigo-400" },
];

// --- VISUAL COMPONENT: Floating Background ---
const FloatingBackground = ({ games }) => {
  const particles = useMemo(() => {
    // Generate particles based on the dummy games list
    if (!games || games.length === 0) return [];

    return [...Array(25)].map((_, i) => {
      const game = games[i % games.length];
      return {
        id: i,
        icon: game.icon,
        // Helper to extract color class or default
        color: game.color.includes("text-") ? game.color : "text-slate-500",
        size: Math.floor(Math.random() * 30) + 20,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 20 + 20,
        delay: Math.random() * 20 * -1,
        xMove: (Math.random() - 0.5) * 40,
        yMove: (Math.random() - 0.5) * 40,
        rotation: Math.random() * 360,
      };
    });
  }, [games]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute ${p.color} opacity-[0.07] animate-float`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--tx": `${p.xMove}vw`,
            "--ty": `${p.yMove}vh`,
            "--rot": `${p.rotation}deg`,
          }}
        >
          {React.cloneElement(p.icon, { size: "100%", strokeWidth: 1.5 })}
        </div>
      ))}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-950/60 backdrop-blur-[1px]" />

      {/* Animation Styles */}
      <style>{`
        @keyframes float { 
          0% { transform: translate(0, 0) rotate(0deg); } 
          50% { transform: translate(var(--tx), var(--ty)) rotate(180deg); } 
          100% { transform: translate(0, 0) rotate(360deg); } 
        } 
        .animate-float { 
          animation-name: float;
          animation-timing-function: ease-in-out; 
          animation-iteration-count: infinite; 
        }
        /* Defines the rainbow animation in case it is missing from your tailwind config */
        @keyframes rainbow {
            0% { color: #818cf8; } /* indigo-400 */
            25% { color: #c084fc; } /* purple-400 */
            50% { color: #f472b6; } /* pink-400 */
            75% { color: #38bdf8; } /* sky-400 */
            100% { color: #818cf8; }
        }
        .animate-rainbow {
            animation: rainbow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const GameHub = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % iconSet.length);
    }, 800); // must match bounce animation time

    return () => clearInterval(interval);
  }, []);

  const { icon: Icon, color } = iconSet[index];
  // Static data to ensure the background floating icons still work
  // mimicking the structure of the original game objects
  const backgroundGames = [
    { icon: <Zap />, color: "text-yellow-500" },
    { icon: <Ghost />, color: "text-purple-500" },
    { icon: <Heart />, color: "text-red-500" },
    { icon: <Star />, color: "text-cyan-500" },
    { icon: <Crown />, color: "text-amber-500" },
    { icon: <Dices />, color: "text-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white relative flex flex-col">
      <FloatingBackground games={backgroundGames} />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl grow flex flex-col">
        <header className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 animate-fade-in-down">
            <Gamepad2 className="w-6 h-6 text-indigo-400 mr-2" />
            <span className="text-indigo-300 font-medium tracking-wide text-sm uppercase">
              Multiplayer Board Game Hub
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-4">
            Board Games {/* Kept the rainbow class exactly as requested */}
            <span className="animate-pulse animate-rainbow">Online</span>
          </h1>
        </header>

        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in min-h-[50vh]">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full"></div>
            <Icon
              size={80}
              className={`${color} relative z-10 animate-bounce`}
            />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">
            We have moved our portal
          </h1>
          <button
            onClick={() =>
              (window.location.href =
                "https://rawfidkshuvo.github.io/rawfids-gamehub/")
            }
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition animate-pulse"
          >
            Go to New Website
          </button>
        </div>

        <footer className="border-t border-slate-800/50 pt-8 mt-auto text-center text-slate-500 text-sm">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-4">
            <p className="flex items-center gap-2">
              Developed by{" "}
              <span className="text-slate-300 font-bold">Rawfid K Shuvo</span>
            </p>
          </div>
          <p className="opacity-60">
            &copy; {new Date().getFullYear()} Game Hub Portal. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default GameHub;
