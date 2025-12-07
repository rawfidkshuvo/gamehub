import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  Users,
  Bot,
  Search,
  Crown,
  Ship,
  Search as MagnifyingGlass,
  Siren,
  Apple,
  Eye,
  ArrowRight,
  Gamepad2,
  Dice5,
  Github,
  Ghost,
  Terminal,
  Briefcase,
  Layers,
  Anchor,
  Package,
  Handshake,
  Sparkles,
  Flame,
  TrendingUp,
  Settings,
  Save,
  X,
  Lock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBjIjK53vVJW1y5RaqEFGSFp0ECVDBEe1o",
  authDomain: "game-hub-ff8aa.firebaseapp.com",
  projectId: "game-hub-ff8aa",
  storageBucket: "game-hub-ff8aa.firebasestorage.app",
  messagingSenderId: "586559578902",
  appId: "1:586559578902:web:91da4fa4ace038d16aa637",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------------------------------------------------------------------------
// STATIC GAME DATA (Updated Descriptions)
// ---------------------------------------------------------------------------
const INITIAL_GAMES = [
  {
    id: 1,
    title: "Conspiracy",
    description:
      "Shadows whisper of a hidden agenda. Unmask the traitors among you, or watch as the truth is buried forever.",
    icon: <Eye className="w-12 h-12 text-white" />,
    color: "from-purple-600 to-indigo-900",
    shadow: "shadow-purple-500/50",
    category: "Bluffing",
    minPlayers: 2,
    maxPlayers: 6,
    hasBots: false,
    link: "https://rawfidkshuvo.github.io/conspiracy-card-game/",
  },
  {
    id: 2,
    title: "Investigation",
    description:
      "A crime has been committed. Sift through the lies and clues. Can you catch the killer before they strike again?",
    icon: <MagnifyingGlass className="w-12 h-12 text-white" />,
    color: "from-green-600 to-cyan-800",
    shadow: "shadow-green-500/50",
    category: "Party",
    minPlayers: 4,
    maxPlayers: 10,
    hasBots: false,
    link: "https://rawfidkshuvo.github.io/investigation-game/",
  },
  {
    id: 3,
    title: "Police Hunt",
    description:
      "The sirens are wailing. Coordinate the dragnet to catch the fugitive, or slip through the cracks and vanish.",
    icon: <Siren className="w-12 h-12 text-white" />,
    color: "from-red-700 to-blue-900",
    shadow: "shadow-red-500/50",
    category: "Party",
    minPlayers: 1,
    maxPlayers: 4,
    hasBots: true,
    link: "https://rawfidkshuvo.github.io/thief-police-game/",
  },
  {
    id: 4,
    title: "Emperor",
    description:
      "The throne sits empty. Maneuver through court politics and seize the seven kingdoms before your rival claims the crown.",
    icon: <Crown className="w-12 h-12 text-white" />,
    color: "from-yellow-500 to-amber-700",
    shadow: "shadow-amber-500/50",
    category: "Strategy",
    minPlayers: 2,
    maxPlayers: 2,
    hasBots: false,
    link: "https://rawfidkshuvo.github.io/emperor-game/",
  },
  {
    id: 5,
    title: "Pirates",
    description:
      "Treacherous waters await. Bluff, fight, and plunder your way to glory, but remember: dead men tell no tales.",
    icon: <Ship className="w-12 h-12 text-white" />,
    color: "from-red-600 to-orange-800",
    shadow: "shadow-orange-500/50",
    category: "Strategy",
    minPlayers: 2,
    maxPlayers: 8,
    hasBots: false,
    link: "https://rawfidkshuvo.github.io/pirates-game/",
  },
  {
    id: 6,
    title: "Fruit Seller",
    description:
      "The market is bustling. Use cunning psychology to outwit rivals and corner the market in this high-speed trade-off.",
    icon: <Apple className="w-12 h-12 text-white" />,
    color: "from-orange-500 to-red-600",
    shadow: "shadow-orange-500/50",
    category: "Party",
    minPlayers: 1,
    maxPlayers: 6,
    hasBots: true,
    link: "https://rawfidkshuvo.github.io/fruit-seller-game/",
  },
  {
    id: 7,
    title: "Ghost Dice",
    description:
      "A spectral tavern where souls are the currency. Bid on the unseen, challenge the liars, and avoid fading into the void.",
    icon: <Ghost className="w-12 h-12 text-white" />,
    color: "from-indigo-500 to-zinc-700",
    shadow: "shadow-indigo-500/50",
    category: "Bluffing",
    minPlayers: 2,
    maxPlayers: 6,
    hasBots: false,
    link: "#",
  },
  {
    id: 8,
    title: "Protocol: Sabotage",
    description:
      "In a world of corporate espionage, trust is a liability. Identify the moles before the network—and your team—collapses.",
    icon: <Terminal className="w-12 h-12 text-white" />,
    color: "from-cyan-600 to-blue-800",
    shadow: "shadow-cyan-500/50",
    category: "Social Deduction",
    minPlayers: 5,
    maxPlayers: 10,
    hasBots: false,
    link: "#",
  },
  {
    id: 9,
    title: "Tycoon",
    description:
      "The market is volatile, and disaster looms. Amass your empire and bid wisely, but beware—poverty is a death sentence.",
    icon: <Briefcase className="w-12 h-12 text-white" />,
    color: "from-amber-500 to-slate-700",
    shadow: "shadow-amber-500/50",
    category: "Strategy",
    minPlayers: 3,
    maxPlayers: 6,
    hasBots: false,
    link: "#",
  },
  {
    id: 10,
    title: "Neon Draft",
    description:
      "The grid is live. Siphon the best data fragments to build the ultimate rig before the connection is severed.",
    icon: <Layers className="w-12 h-12 text-white" />,
    color: "from-cyan-400 to-purple-600",
    shadow: "shadow-cyan-500/50",
    category: "Strategy",
    minPlayers: 2,
    maxPlayers: 6,
    hasBots: false,
    link: "#",
  },
  {
    id: 11,
    title: "Deep Dive",
    description:
      "The abyss holds ancient fortunes, but oxygen is scarce. Will you resurface rich, or become another ghost of the deep?",
    icon: <Anchor className="w-12 h-12 text-white" />,
    color: "from-teal-600 to-slate-800",
    shadow: "shadow-teal-500/50",
    category: "Push-Your-Luck",
    minPlayers: 2,
    maxPlayers: 8,
    hasBots: false,
    link: "#",
  },
  {
    id: 12,
    title: "Contraband",
    description:
      "The border is watching. Lie to the Inspector's face and smuggle your goods, or pay the price for your deceit.",
    icon: <Package className="w-12 h-12 text-white" />,
    color: "from-emerald-500 to-green-800",
    shadow: "shadow-emerald-500/50",
    category: "Bluffing",
    minPlayers: 3,
    maxPlayers: 6,
    hasBots: false,
    link: "#",
  },
  {
    id: 13,
    title: "Trust",
    description:
      "Two players, one pot of gold. A test of pure psychology. Will you share the wealth, or stab your partner in the back?",
    icon: <Handshake className="w-12 h-12 text-white" />,
    color: "from-green-500 to-red-600",
    shadow: "shadow-green-500/50",
    category: "Psychology",
    minPlayers: 2,
    maxPlayers: 2,
    hasBots: false,
    link: "#",
  },
];

// --- Components ---

const AdminModal = ({ isOpen, onClose, games, onSave, currentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [localConfig, setLocalConfig] = useState({});

  useEffect(() => {
    if (currentUser && currentUser.email === "admin@rawfidsgamehub.com") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (isOpen) {
      const config = {};
      games.forEach((g) => {
        config[g.id] = {
          visible: g.visible,
          isNew: g.isNew,
          isHot: g.isHot,
          isFeatured: g.isFeatured || false,
          popularity: g.popularity || 0,
        };
      });
      setLocalConfig(config);
    }
  }, [isOpen, games]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      alert("Invalid Credentials.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleToggle = (id, field) => {
    setLocalConfig((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: !prev[id][field] },
    }));
  };

  const handleFeaturedSelect = (id) => {
    const newConfig = { ...localConfig };
    Object.keys(newConfig).forEach((key) => {
      newConfig[key] = { ...newConfig[key], isFeatured: parseInt(key) === id };
    });
    setLocalConfig(newConfig);
  };

  const handlePopularityChange = (id, val) => {
    setLocalConfig((prev) => ({
      ...prev,
      [id]: { ...prev[id], popularity: parseInt(val) || 0 },
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-indigo-500" /> Admin Control Panel
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-12 flex flex-col items-center justify-center flex-1">
            <div className="p-4 bg-indigo-500/10 rounded-full mb-6">
              <Lock className="w-8 h-8 text-indigo-500" />
            </div>
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              <input
                type="email"
                placeholder="Admin Email"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Login to Dashboard
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="pb-3 pl-2">Game</th>
                    <th className="pb-3 text-center">Featured</th>
                    <th className="pb-3 text-center">Visible</th>
                    <th className="pb-3 text-center">New</th>
                    <th className="pb-3 text-center">Hot</th>
                    <th className="pb-3 text-center">Popularity</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {games.map((game) => (
                    <tr
                      key={game.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 pl-2 font-medium text-slate-200">
                        {game.title}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center">
                          <input
                            type="radio"
                            name="featuredGame"
                            checked={localConfig[game.id]?.isFeatured || false}
                            onChange={() => handleFeaturedSelect(game.id)}
                            className="w-4 h-4 accent-yellow-500 cursor-pointer"
                          />
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={localConfig[game.id]?.visible ?? true}
                          onChange={() => handleToggle(game.id, "visible")}
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={localConfig[game.id]?.isNew ?? false}
                          onChange={() => handleToggle(game.id, "isNew")}
                          className="w-4 h-4 accent-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={localConfig[game.id]?.isHot ?? false}
                          onChange={() => handleToggle(game.id, "isHot")}
                          className="w-4 h-4 accent-orange-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="number"
                          value={localConfig[game.id]?.popularity || 0}
                          onChange={(e) =>
                            handlePopularityChange(game.id, e.target.value)
                          }
                          className="w-20 bg-slate-950 border border-slate-700 rounded p-1 text-center text-white focus:border-indigo-500 outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-between gap-3 rounded-b-2xl">
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Log Out
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <Save size={18} /> Publish Changes
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const FloatingBackground = ({ games }) => {
  const particles = useMemo(() => {
    const visibleGames = games.filter((g) => g.visible);
    if (visibleGames.length === 0) return [];

    const getColor = (gradient) => {
      const match = gradient.match(/from-([a-z]+)-/);
      return match ? `text-${match[1]}-500` : "text-slate-500";
    };

    return [...Array(25)].map((_, i) => {
      const game = visibleGames[i % visibleGames.length];
      return {
        id: i,
        icon: game.icon,
        color: getColor(game.color),
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
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
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
      <style>{`@keyframes float { 0% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(var(--tx), var(--ty)) rotate(180deg); } 100% { transform: translate(0, 0) rotate(360deg); } } .animate-float { animation-name: float; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }`}</style>
    </div>
  );
};

const GameCard = ({ game }) => {
  const handleGameClick = async () => {
    try {
      const statsRef = doc(db, "game_stats", `game_${game.id}`);
      await updateDoc(statsRef, { clicks: increment(1) }).catch(async (err) => {
        if (err.code === "not-found") await setDoc(statsRef, { clicks: 1 });
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  return (
    <a
      href={game.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleGameClick}
      className="group relative block h-full animate-in fade-in zoom-in duration-500"
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${game.color} rounded-2xl opacity-0 group-hover:opacity-75 blur transition duration-500 group-hover:duration-200`}
      />
      <div className="relative h-full flex flex-col bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-transparent transition-colors duration-300">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-6 h-8">
          <div className="flex gap-2 flex-wrap">
            {game.isNew && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-1">
                <Sparkles size={10} /> NEW
              </span>
            )}
            {game.isHot && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Flame size={10} /> HOT
              </span>
            )}
            {game.isPopular && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 shadow-blue-500/50">
                <Crown size={10} /> POPULAR
              </span>
            )}
          </div>
          <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider rounded-full border border-slate-700 whitespace-nowrap">
            {game.category}
          </span>
        </div>

        {/* Icon */}
        <div className="mb-4">
          <div
            className={`inline-block p-3 rounded-xl bg-gradient-to-br ${game.color} ${game.shadow} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            {game.icon}
          </div>
        </div>

        {/* Text */}
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
            {game.title}
          </h3>
          <p className="text-slate-400 leading-relaxed mb-4 text-sm">
            {game.description}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800/50 mt-auto flex items-center justify-between group/btn">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-800/50 text-slate-300 text-xs font-semibold tracking-wider rounded-full border border-slate-700/50 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {game.minPlayers}-{game.maxPlayers}
            </span>
            {game.hasBots && (
              <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                <Bot className="w-3 h-3" />
                +Bot
              </div>
            )}
          </div>
          <div className="flex items-center text-white font-medium text-sm group-hover/btn:translate-x-1 transition-transform">
            Play <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </a>
  );
};

const HeroSection = ({ featuredGame }) => {
  if (!featuredGame) return null;
  return (
    <div className="relative w-full max-w-5xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 group animate-in slide-in-from-top-10 duration-700">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${featuredGame.color} opacity-20 group-hover:opacity-30 transition-opacity`}
      />
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        <div
          className={`p-6 rounded-2xl bg-gradient-to-br ${featuredGame.color} ${featuredGame.shadow} shadow-2xl transform group-hover:scale-105 transition-transform duration-500`}
        >
          {React.cloneElement(featuredGame.icon, {
            className: "w-16 h-16 md:w-24 md:h-24 text-white",
          })}
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Featured Release
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {featuredGame.title}
          </h2>
          <p className="text-lg text-slate-200 mb-6 max-w-xl">
            {featuredGame.description}
          </p>
          <a
            href={featuredGame.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10`}
          >
            Play Now <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const GameHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [playerCount, setPlayerCount] = useState(0);

  const [gameOverrides, setGameOverrides] = useState({});
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [user, setUser] = useState(null);

  // 1. Authentication & Config Listener
  useEffect(() => {
    const unsubConfig = onSnapshot(
      doc(db, "game_hub_settings", "config"),
      (doc) => {
        if (doc.exists()) {
          setGameOverrides(doc.data());
        }
      }
    );

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        signInAnonymously(auth).catch((err) =>
          console.error("Anon Auth Failed", err)
        );
      }
    });

    return () => {
      unsubConfig();
      unsubAuth();
    };
  }, []);

  // 2. Admin Save Handler
  const handleAdminSave = async (newConfig) => {
    await setDoc(doc(db, "game_hub_settings", "config"), newConfig);
  };

  // 3. Merge Data
  const processedGames = useMemo(() => {
    return INITIAL_GAMES.map((game) => {
      const override = gameOverrides[game.id] || {};
      return {
        ...game,
        visible: override.visible ?? true,
        isNew: override.isNew ?? false,
        isHot: override.isHot ?? false,
        isFeatured: override.isFeatured || false,
        popularity: override.popularity || 0,
      };
    });
  }, [gameOverrides]);

  const categories = [
    "All",
    ...new Set(processedGames.filter((g) => g.visible).map((g) => g.category)),
  ];

  // Logic: Find Top 2 Popular Games
  const popularGames = useMemo(() => {
    return [...processedGames]
      .filter((g) => g.visible)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 2);
  }, [processedGames]);

  // Filter AND Sort by Popularity
  const filteredGames = useMemo(() => {
    return processedGames
      .filter((game) => {
        const matchesSearch =
          game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "All" || game.category === selectedCategory;
        const matchesPlayers =
          playerCount === 0 ||
          (playerCount >= game.minPlayers && playerCount <= game.maxPlayers);

        return (
          matchesSearch && matchesCategory && matchesPlayers && game.visible
        );
      })
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0)); // Global Sort
  }, [searchTerm, selectedCategory, playerCount, processedGames]);

  // Find Featured Game
  const featuredGame =
    processedGames.find((g) => g.isFeatured) ||
    processedGames.find((g) => g.title === "Deep Dive") ||
    processedGames[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white relative">
      <FloatingBackground games={processedGames} />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        games={processedGames}
        onSave={handleAdminSave}
        currentUser={user}
      />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        <header className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 animate-fade-in-down">
            <Gamepad2 className="w-6 h-6 text-indigo-400 mr-2" />
            <span className="text-indigo-300 font-medium tracking-wide text-sm uppercase">
              Multiplayer Board Game Hub
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-4">
            Board Games <span className="text-indigo-500">Online</span>
          </h1>
        </header>

        <HeroSection featuredGame={featuredGame} />

        <div className="max-w-5xl mx-auto mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search games..."
                className="block w-full pl-11 pr-4 py-4 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-64 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-4 backdrop-blur-md">
              <Users className="text-slate-500 w-5 h-5" />
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-bold">
                  <span>Players:</span>
                  <span className="text-indigo-400">
                    {playerCount === 0 ? "Any" : playerCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/50"
                    : "bg-slate-900/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Trending Games Section --- */}
        {popularGames.length > 0 && (
          <section className="mb-16 animate-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Trending Now
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularGames.map((game) => (
                <GameCard key={game.id} game={{ ...game, isPopular: true }} />
              ))}
            </div>
          </section>
        )}

        {/* Main Games Grid */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
            <Gamepad2 className="w-5 h-5 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            All Games (Most Popular)
          </h2>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-20">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={{
                  ...game,
                  isPopular: popularGames.some((pg) => pg.id === game.id),
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 animate-in fade-in">
              <Dice5 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-400">
                No games match your filters
              </h3>
              <p className="text-slate-500 mt-2">
                Try adjusting the player count or category.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setPlayerCount(0);
                }}
                className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>

        <div className="text-center pb-12 animate-pulse">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900/50 rounded-full border border-indigo-500/20 text-indigo-300 font-bold tracking-widest text-sm uppercase backdrop-blur-sm">
            <Sparkles size={16} /> Stay tuned... More games coming soon...{" "}
            <Sparkles size={16} />
          </div>
        </div>

        <footer className="border-t border-slate-800/50 pt-8 mt-8 text-center text-slate-500 text-sm">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-4">
            <a
              href="#"
              className="hover:text-white transition-colors flex items-center gap-2 group"
            >
              <div className="p-2 bg-slate-800 rounded-full group-hover:bg-indigo-600 transition-colors">
                <Github className="w-4 h-4" />
              </div>{" "}
              GitHub Repository
            </a>
            <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-700"></span>
            <p className="flex items-center gap-2">
              Developed by{" "}
              <span
                onClick={() => setIsAdminOpen(true)}
                className="text-slate-300 font-bold cursor-pointer hover:text-indigo-400 transition-colors"
              >
                Rawfid K Shuvo
              </span>
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