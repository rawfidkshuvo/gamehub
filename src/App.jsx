import React, { useState, useEffect, useMemo, useRef } from "react";
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
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
// --- ICONS ---
// Note: PieChart is aliased to PieIcon to avoid conflict with Recharts
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
  Clock,
  Trash2,
  List,
  LayoutGrid,
  Smartphone,
  Monitor,
  LifeBuoy,
  Heart,
  Shuffle,
  Zap,
  Server,
  History,
  BarChart3,
  AlertTriangle,
  Hammer,
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  Laptop,
  Hourglass,
  Cpu,
  Cat,
  Banana,
  Biohazard,
  Skull,
  HeartHandshake,
  HatGlasses,
  PawPrint,
  Dices,
  Target,
} from "lucide-react";
// --- CHARTS ---
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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
// HELPER: Robust Logging for Mobile
// ---------------------------------------------------------------------------
const logGameClick = (game) => {
  const statsRef = doc(db, "game_stats", `game_${game.id}`);
  updateDoc(statsRef, { clicks: increment(1) }).catch(async (err) => {
    if (err.code === "not-found") await setDoc(statsRef, { clicks: 1 });
  });
  try {
    const logsRef = collection(db, "game_click_logs");
    const userId = auth.currentUser ? auth.currentUser.uid : "unknown";
    // Log the primary category (first in array) to keep analytics simple
    const primaryCategory =
      game.categories && game.categories.length > 0
        ? game.categories[0]
        : "Uncategorized";

    addDoc(logsRef, {
      gameId: game.id,
      gameTitle: game.title,
      category: primaryCategory,
      userId: userId,
      device: navigator.userAgent,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Log failed", err);
  }
};
// ---------------------------------------------------------------------------
// GAME DATA
// ---------------------------------------------------------------------------
const INITIAL_GAMES = [
  {
    id: 1,
    title: "Conspiracy",
    description:
      "In the gilded halls of power, whispers are deadlier than daggers. A secret cabal moves in the shadows, their identities veiled in deceit. Will you expose the puppeteers pulling the strings of the kingdom, or are you merely another pawn in their silent, treacherous game of domination?",
    icon: <Eye className="w-12 h-12 text-white" />,
    color: "from-purple-600 to-indigo-900",
    shadow: "shadow-purple-500/50",
    categories: ["Bluffing"],
    minPlayers: 2,
    maxPlayers: 6,
    hasBots: false,
    complexity: "Medium",
    duration: "15-30m",
    link: "https://rawfidkshuvo.github.io/conspiracy-card-game/",
  },
  {
    id: 2,
    title: "Investigation",
    description:
      "The rain-slicked streets hide a gruesome secret. A crime has shattered the peace, and the killer walks among you, wearing the mask of an innocent. Sift through a labyrinth of lies and fragmented clues before the trail goes cold—or worse, before the murderer strikes again.",
    icon: <HatGlasses className="w-12 h-12 text-white" />,
    color: "from-green-600 to-cyan-800",
    shadow: "shadow-green-500/50",
    categories: ["Party"],
    minPlayers: 4,
    maxPlayers: 10,
    hasBots: false,
    complexity: "Low",
    duration: "10-20m",
    link: "https://rawfidkshuvo.github.io/investigation-game/",
  },
  {
    id: 3,
    title: "Police Hunt",
    description:
      "Sirens wail in the distance as the city goes into lockdown. A fugitive is on the run, weaving through the urban sprawl. Coordinate the dragnet to trap the target, or embrace the adrenaline of the chase and slip through the cracks of justice.",
    icon: <Siren className="w-12 h-12 text-white" />,
    color: "from-red-700 to-blue-900",
    shadow: "shadow-red-500/50",
    categories: ["Party"],
    minPlayers: 1,
    maxPlayers: 4,
    hasBots: true,
    complexity: "Low",
    duration: "5-15m",
    link: "https://rawfidkshuvo.github.io/thief-police-game/",
  },
  {
    id: 4,
    title: "Emperor",
    description:
      "The throne sits empty, and the drums of war beat a rhythmic thunder. Navigate the cutthroat politics of the court and command armies to seize the seven kingdoms. In this high-stakes duel for supremacy, there is no second place—only the crown or the grave.",
    icon: <Crown className="w-12 h-12 text-white" />,
    color: "from-yellow-500 to-amber-700",
    shadow: "shadow-amber-500/50",
    categories: ["Strategy"],
    minPlayers: 2,
    maxPlayers: 2,
    hasBots: false,
    complexity: "High",
    duration: "30m+",
    link: "https://rawfidkshuvo.github.io/emperor-game/",
  },
  {
    id: 5,
    title: "Pirates",
    description:
      "The seas are treacherous and filled with scoundrels. Hoist the black flag and carve your legend upon the waves. Bluff your way out of a tight spot, fight for every doubloon, and plunder your rivals, but remember: dead men tell no tales.",
    icon: <Ship className="w-12 h-12 text-white" />,
    color: "from-red-600 to-orange-800",
    shadow: "shadow-orange-500/50",
    categories: ["Strategy"],
    minPlayers: 2,
    maxPlayers: 8,
    hasBots: false,
    complexity: "Medium",
    duration: "20-40m",
    link: "https://rawfidkshuvo.github.io/pirates-game/",
  },
  {
    id: 6,
    title: "Fruit Seller",
    description:
      "The bazaar is alive with the chaotic symphony of commerce. In this high-speed trade-off, only the sharpest minds will prosper. Use cunning psychology to outwit your rivals, corner the market on exotic wares, and walk away with the heaviest purse.",
    icon: <Apple className="w-12 h-12 text-white" />,
    color: "from-orange-500 to-red-600",
    shadow: "shadow-orange-500/50",
    categories: ["Party"],
    minPlayers: 1,
    maxPlayers: 6,
    hasBots: true,
    complexity: "Low",
    duration: "5-10m",
    link: "https://rawfidkshuvo.github.io/fruit-seller-game/",
  },
  {
    id: 7,
    title: "Ghost Dice",
    description:
      "Step into a spectral tavern where souls are the currency and the dice are cast by unseen hands. Bid on the unknown, challenge the liars, and keep your wits about you. In this game of chance, fading into the void is a fate worse than debt.",
    icon: <Dices className="w-12 h-12 text-white" />,
    color: "from-indigo-500 to-zinc-700",
    shadow: "shadow-indigo-500/50",
    categories: ["Bluffing"],
    minPlayers: 2,
    maxPlayers: 6,
    hasBots: false,
    complexity: "Medium",
    duration: "15m",
    link: "https://rawfidkshuvo.github.io/ghost-dice-game/",
  },
  {
    id: 8,
    title: "Protocol: Sabotage",
    description:
      "In a futuristic world of corporate espionage, trust is a liability. The system is compromised, and the moles are digging in. Identify the saboteurs before the network collapses, or watch your team's hard work dissolve into digital dust.",
    icon: <Server className="w-12 h-12 text-white" />,
    color: "from-cyan-600 to-blue-800",
    shadow: "shadow-cyan-500/50",
    categories: ["Social Deduction"],
    minPlayers: 5,
    maxPlayers: 10,
    hasBots: false,
    complexity: "High",
    duration: "30-60m",
    link: "https://rawfidkshuvo.github.io/protocol-game/",
  },
  {
    id: 9,
    title: "Tycoon",
    description:
      "The market is volatile, and disaster looms on the horizon. Amass your industrial empire and bid wisely on assets, but beware the crash. In this ruthless economic simulation, poverty is a death sentence and only the wealthiest survive.",
    icon: <Briefcase className="w-12 h-12 text-white" />,
    color: "from-amber-500 to-slate-700",
    shadow: "shadow-amber-500/50",
    categories: ["Strategy"],
    minPlayers: 3,
    maxPlayers: 6,
    hasBots: false,
    complexity: "High",
    duration: "45m+",
    link: "#",
  },
  {
    id: 10,
    title: "Neon Draft",
    description:
      "The grid is live and the data stream is flowing. Siphon the best code fragments to build the ultimate cyber-rig. Connect the nodes and optimize your throughput before the connection is severed in this vibrant, cyberpunk drafting game.",
    icon: <Layers className="w-12 h-12 text-white" />,
    color: "from-cyan-400 to-purple-600",
    shadow: "shadow-cyan-500/50",
    categories: ["Strategy"],
    minPlayers: 2,
    maxPlayers: 6,
    hasBots: false,
    complexity: "Medium",
    duration: "20m",
    link: "https://rawfidkshuvo.github.io/neon-draft-game/",
  },
  {
    id: 11,
    title: "Deep Dive",
    description:
      "The abyss holds ancient fortunes, but oxygen is a precious luxury. Descend into the crushing dark to recover lost treasures. Push your luck too far, and you may find yourself becoming another permanent resident of the deep.",
    icon: <Anchor className="w-12 h-12 text-white" />,
    color: "from-teal-600 to-slate-800",
    shadow: "shadow-teal-500/50",
    categories: ["Push-Your-Luck"],
    minPlayers: 2,
    maxPlayers: 8,
    hasBots: false,
    complexity: "Low",
    duration: "15m",
    link: "#",
  },
  {
    id: 12,
    title: "Contraband",
    description:
      "The border is watching, and the Inspector has eyes like a hawk. Lie to their face and smuggle your illicit goods, or pay the heavy price for your deceit. It's a high-stakes game of bluffing where a poker face is your most valuable asset.",
    icon: <Package className="w-12 h-12 text-white" />,
    color: "from-emerald-500 to-green-800",
    shadow: "shadow-emerald-500/50",
    categories: ["Bluffing"],
    minPlayers: 3,
    maxPlayers: 6,
    hasBots: false,
    complexity: "Medium",
    duration: "25m",
    link: "https://rawfidkshuvo.github.io/contraband-game/",
  },
  {
    id: 13,
    title: "Trust",
    description:
      "Two players, one pot of gold, and a test of pure psychology. Will you share the wealth and prosper together, or stab your partner in the back for a larger slice? A minimalist game that reveals the true nature of greed.",
    icon: <HeartHandshake className="w-12 h-12 text-white" />,
    color: "from-green-500 to-red-600",
    shadow: "shadow-green-500/50",
    categories: ["Psychology"],
    minPlayers: 2,
    maxPlayers: 2,
    hasBots: false,
    complexity: "Low",
    duration: "5m",
    link: "#",
  },
  {
    id: 14,
    title: "Adrift",
    description:
      "Stranded on a life raft with dwindling supplies and rising panic. Vote on who eats, who starves, and who feeds the sharks. Survive 5 harrowing days at sea... or join the ghosts below in this intense social survival experience.",
    icon: <LifeBuoy className="w-12 h-12 text-white" />,
    color: "from-cyan-600 to-blue-900",
    shadow: "shadow-cyan-500/50",
    categories: ["Survival"],
    minPlayers: 4,
    maxPlayers: 8,
    hasBots: false,
    complexity: "Medium",
    duration: "20m",
    link: "#",
  },
  {
    id: 15,
    title: "Guild of Shadows",
    description:
      "Assemble a team of thieves, assassins, and merchants to build the most powerful guild. Steal gold from rivals, protect your assets, and race to 15 gold in this strategic engine-building game.",
    icon: <Ghost className="w-12 h-12 text-white" />,
    color: "from-zinc-900 to-purple-900",
    shadow: "shadow-purple-900/50",
    categories: ["Strategy"],
    minPlayers: 2,
    maxPlayers: 6,
    hasBots: false,
    complexity: "Medium",
    duration: "20-30m",
    link: "#",
    isNew: true,
  },
  {
    id: 16,
    title: "Chrono Tactics",
    description:
      "A duel across three timelines: Past, Present, and Future. Deploy units to influence the flow of time. A victory in the past ripples forward to buff your future army. Defeat the enemy commander to secure the timeline.",
    icon: <Hourglass className="w-12 h-12 text-white" />,
    color: "from-cyan-600 to-blue-900",
    shadow: "shadow-cyan-500/50",
    categories: ["Strategy"],
    minPlayers: 2,
    maxPlayers: 2,
    hasBots: false,
    complexity: "High",
    duration: "15m",
    link: "#",
    isNew: true,
  },
  {
    id: 17,
    title: "Masquerade Protocol",
    description:
      "You are a rogue AI attending a digital gala. Every player has a public Avatar and a hidden Directive (win condition). Trade data packets, hack your rivals, and activate your Glitch ability to seize control... but be warned, glitching reveals your true nature.",
    icon: <Cpu className="w-12 h-12 text-white" />,
    color: "from-fuchsia-600 to-cyan-700",
    shadow: "shadow-fuchsia-500/50",
    categories: ["Social Deduction"],
    minPlayers: 3,
    maxPlayers: 8,
    hasBots: false,
    complexity: "Medium",
    duration: "20m",
    link: "#",
    isNew: true,
  },
  {
    id: 18,
    title: "Paper Oceans",
    description:
      "Craft your hand in this colorful set-collection game. Draft cards, play duo effects, and push your luck to end the round. Will you stop safely or bet it all on a Last Chance?",
    icon: <Anchor className="w-12 h-12 text-white" />,
    color: "from-blue-500 to-cyan-400",
    shadow: "shadow-cyan-500/50",
    categories: ["Strategy"],
    minPlayers: 2,
    maxPlayers: 4,
    hasBots: false,
    complexity: "Medium",
    duration: "15-20m",
    link: "https://rawfidkshuvo.github.io/paper-ocean-game/",
    isNew: true,
  },
  {
    id: 19,
    title: "Royal Menagerie",
    description:
      "The Queen's court is a masquerade of lies. Offer 'gifts' to your rivals—a noble Dog, or perhaps a repulsive Rat? Look them in the eye and deceive your way to safety. In this game of high-stakes bluffing, the first to hoard the animals becomes the Royal Fool.",
    icon: <PawPrint className="w-12 h-12 text-white" />,
    color: "from-purple-600 to-pink-900",
    shadow: "shadow-purple-500/50",
    categories: ["Bluffing"],
    minPlayers: 2,
    maxPlayers: 7,
    hasBots: false,
    complexity: "Low",
    duration: "15-25m",
    link: "https://rawfidkshuvo.github.io/royal-menagerie-game/",
    isNew: true,
  },
  {
    id: 20,
    title: "Fructose Fury",
    description:
      "A tantalizing orchard of risks and rewards awaits. Pluck sweet victories from the deck one by one, but beware the rot of greed. One duplicate fruit is all it takes to turn your harvest into compost. In this cutthroat market, will you feast on your rivals' misfortune, or will your own ambition leave you with nothing but a bitter taste?",
    icon: <Banana className="w-12 h-12 text-white" />,
    color: "from-yellow-500 to-orange-600",
    shadow: "shadow-yellow-500/50",
    categories: ["Push-Your-Luck"],
    minPlayers: 2,
    maxPlayers: 6,
    hasBots: false,
    complexity: "Low",
    duration: "15m",
    link: "https://rawfidkshuvo.github.io/fructose-fury-game/",
    isNew: true,
  },
  {
    id: 21,
    title: "Angry Virus",
    description:
      "A contagious game of calculated risks. A deck of numbered viruses threatens your health score. Will you pay a precious vitamin token to pass the infection to your neighbor, or bite the bullet and take the card to save your resources? Collect consecutive viruses to reduce their impact, but beware—running out of vitamins leaves you vulnerable to the highest fevers.",
    icon: <Biohazard className="w-12 h-12 text-white" />,
    color: "from-green-600 to-lime-800",
    shadow: "shadow-lime-500/50",
    categories: ["Push-Your-Luck"],
    minPlayers: 3,
    maxPlayers: 7,
    hasBots: false,
    complexity: "Medium",
    duration: "15-20m",
    link: "https://rawfidkshuvo.github.io/angry-virus-game/", // Placeholder link
    isNew: true,
  },
  {
    id: 22,
    title: "Last of Us",
    description:
      "A strategic shedding game of survival. In a world overrun by odd-numbered Zombies, you must use even-numbered Antidotes to build a cage. Maintain the delicate balance—Zombies and Antidotes can never stand side-by-side. Expand the perimeter or stack your defenses, but if you get trapped, you'll be quarantined. Be the last one standing to survive the round.",
    icon: <Skull className="w-12 h-12 text-white" />,
    color: "from-red-700 to-lime-900",
    shadow: "shadow-red-900/50",
    categories: ["Shedding"],
    minPlayers: 2,
    maxPlayers: 6,
    hasBots: false,
    complexity: "Medium",
    duration: "20m",
    link: "https://rawfidkshuvo.github.io/last-of-us-game/",
    isNew: true,
  },
  {
    id: 23,
    title: "Together",
    description:
      "Two minds, one silent purpose. In this cooperative race, you and your partner must synchronize your strategies without a single word about your hands. Trade cards, align your goals, and outpace the opposition to complete 8 distinct patterns. Synergy is your only weapon in this test of non-verbal connection.",
    icon: <Handshake className="w-12 h-12 text-white" />,
    color: "from-pink-600 to-yellow-500",
    shadow: "shadow-pink-500/50",
    categories: ["Melding", "Set Collection"],
    minPlayers: 4,
    maxPlayers: 6,
    hasBots: false,
    complexity: "Medium",
    duration: "20-40m",
    link: "https://rawfidkshuvo.github.io/together-game/",
  },
  {
    id: 24,
    title: "Spectrum",
    description:
      "A tactical duel of numerical frequencies where balance is everything. Navigate the shifting colors of the spectrum to win tricks and calibrate your score to the perfect equilibrium of 25. Use the deceptive Magenta 5 to mask your true energy, but be careful—one step over the limit will overload your system and cost you the round.",
    icon: <Target className="w-12 h-12 text-white" />,
    color: "from-fuchsia-600 to-indigo-950",
    shadow: "shadow-fuchsia-500/50",
    categories: ["Strategy"],
    minPlayers: 3,
    maxPlayers: 4,
    hasBots: false,
    complexity: "Medium",
    duration: "20-30m",
    link: "https://rawfidkshuvo.github.io/spectrum-game/",
  },
];

// ---------------------------------------------------------------------------
// COMPONENTS
// ---------------------------------------------------------------------------

// Modified Maintenance Component: Not Fixed position, fills content area instead
const MaintenanceContent = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in min-h-[50vh]">
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full"></div>
      <Hammer
        size={80}
        className="text-orange-500 relative z-10 animate-bounce"
      />
    </div>
    <h1 className="text-4xl font-black text-white mb-4">Under Maintenance</h1>
    <p className="text-slate-400 max-w-md text-lg leading-relaxed">
      We are currently deploying updates to the GameHub. The portal will be back
      online shortly.
    </p>
    <div className="mt-8 flex items-center gap-2 text-sm text-slate-500 border border-slate-800 px-4 py-2 rounded-full">
      <AlertTriangle size={14} /> System Upgrade in Progress
    </div>
  </div>
);

const AdminModal = ({
  isOpen,
  onClose,
  games,
  onSave,
  currentUser,
  realClickData,
  maintenanceMode,
  setMaintenanceMode,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [localConfig, setLocalConfig] = useState({});
  const [activeTab, setActiveTab] = useState("config");
  const [activityLogs, setActivityLogs] = useState([]);

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
          isUpcoming: g.isUpcoming || false,
          maintenance: g.maintenance || false,
          popularity: g.manualBoost || 0, // UPDATED: Reads from g.manualBoost to persist value
        };
      });
      setLocalConfig(config);
    }
  }, [isOpen, games]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "logs") {
      const q = query(
        collection(db, "game_click_logs"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActivityLogs(logs);
      });
      return () => unsub();
    }
  }, [isAuthenticated, activeTab]);

  // --- RESTORED HELPER FUNCTIONS ---
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    return new Date(timestamp.seconds * 1000).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <Monitor size={14} className="text-slate-500" />;
    const lower = userAgent.toLowerCase();
    if (
      lower.includes("mobile") ||
      lower.includes("android") ||
      lower.includes("iphone")
    ) {
      return <Smartphone size={14} className="text-pink-400" />;
    }
    return <Monitor size={14} className="text-blue-400" />;
  };

  const getDeviceName = (userAgent) => {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Win")) return "Windows PC";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone")) return "iPhone";
    return "Browser";
  };
  // ---------------------------------

  const chartData = useMemo(() => {
    if (!activityLogs.length)
      return { timeline: [], categories: [], games: [], devices: [] };

    // 1. Categories Pie Chart
    const categoryCount = {};
    const gameCount = {};
    const deviceCount = {};

    activityLogs.forEach((log) => {
      // Category
      const cat = log.category || "Uncategorized";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;

      // Game Title (Real Clicks)
      const title = log.gameTitle || "Unknown Game";
      gameCount[title] = (gameCount[title] || 0) + 1;

      // Device Type
      const device = getDeviceName(log.device || "");
      deviceCount[device] = (deviceCount[device] || 0) + 1;
    });

    const categoriesPie = Object.keys(categoryCount).map((key) => ({
      name: key,
      value: categoryCount[key],
    }));
    const gamesPie = Object.keys(gameCount).map((key) => ({
      name: key,
      value: gameCount[key],
    }));
    const devicesPie = Object.keys(deviceCount).map((key) => ({
      name: key,
      value: deviceCount[key],
    }));

    // 2. Timeline Bar Chart
    const dateCount = {};
    activityLogs
      .slice()
      .reverse()
      .forEach((log) => {
        if (!log.timestamp) return;
        const date = new Date(log.timestamp.seconds * 1000).toLocaleDateString(
          undefined,
          { month: "short", day: "numeric" }
        );
        dateCount[date] = (dateCount[date] || 0) + 1;
      });
    const barData = Object.keys(dateCount).map((key) => ({
      date: key,
      clicks: dateCount[key],
    }));

    return {
      timeline: barData,
      categories: categoriesPie,
      games: gamesPie,
      devices: devicesPie,
    };
  }, [activityLogs]);

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
  ];

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

  const handleSave = () => {
    onSave(localConfig, maintenanceMode);
    onClose();
  };

  const handleToggle = (id, field) => {
    setLocalConfig((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: !prev[id][field] },
    }));
  };

  const handlePopularityChange = (id, val) => {
    setLocalConfig((prev) => ({
      ...prev,
      [id]: { ...prev[id], popularity: parseInt(val) || 0 },
    }));
  };

  const handleFeaturedSelect = (id) => {
    const newConfig = { ...localConfig };
    Object.keys(newConfig).forEach((key) => {
      newConfig[key] = { ...newConfig[key], isFeatured: parseInt(key) === id };
    });
    setLocalConfig(newConfig);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
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
                placeholder="Email"
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
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-lg text-white font-bold transition-colors">
                Login
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row border-b border-slate-800 bg-slate-900/50 justify-between md:pr-6">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab("config")}
                  className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === "config"
                      ? "text-white border-b-2 border-indigo-500 bg-slate-800"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid size={16} /> Game Config
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === "logs"
                      ? "text-white border-b-2 border-indigo-500 bg-slate-800"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BarChart3 size={16} /> Analytics & Logs
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 md:p-0">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Global Maintenance
                </span>
                <div
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 rounded-full cursor-pointer p-1 transition-colors ${
                    maintenanceMode ? "bg-orange-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      maintenanceMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {activeTab === "config" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                        <th className="pb-3 pl-2">Game</th>
                        <th className="pb-3 text-center">Featured</th>
                        <th className="pb-3 text-center">Visible</th>
                        <th
                          className="pb-3 text-center text-red-400"
                          title="Maintenance Mode"
                        >
                          <Hammer size={14} className="mx-auto" />
                        </th>
                        <th className="pb-3 text-center">New</th>
                        <th className="pb-3 text-center">Hot</th>
                        <th className="pb-3 text-center text-indigo-400">
                          Upcoming
                        </th>
                        <th className="pb-3 text-center text-emerald-400">
                          Real Clicks
                        </th>
                        <th className="pb-3 text-center text-orange-400">
                          Boost
                        </th>
                        <th className="pb-3 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {games.map((game) => {
                        const realClicks = realClickData[game.id] || 0;
                        const manualBoost =
                          localConfig[game.id]?.popularity || 0;
                        return (
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
                                  checked={
                                    localConfig[game.id]?.isFeatured || false
                                  }
                                  onChange={() => handleFeaturedSelect(game.id)}
                                  className="w-4 h-4 accent-yellow-500 cursor-pointer"
                                />
                              </div>
                            </td>
                            <td className="py-3 text-center">
                              <input
                                type="checkbox"
                                checked={localConfig[game.id]?.visible ?? true}
                                onChange={() =>
                                  handleToggle(game.id, "visible")
                                }
                                className="w-4 h-4 accent-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 text-center">
                              <input
                                type="checkbox"
                                checked={
                                  localConfig[game.id]?.maintenance ?? false
                                }
                                onChange={() =>
                                  handleToggle(game.id, "maintenance")
                                }
                                className="w-4 h-4 accent-red-500 cursor-pointer"
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
                                type="checkbox"
                                checked={
                                  localConfig[game.id]?.isUpcoming ?? false
                                }
                                onChange={() =>
                                  handleToggle(game.id, "isUpcoming")
                                }
                                className="w-4 h-4 accent-pink-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 text-center text-emerald-400 font-mono">
                              {realClicks}
                            </td>
                            <td className="py-3 text-center">
                              <input
                                type="number"
                                value={manualBoost}
                                onChange={(e) =>
                                  handlePopularityChange(
                                    game.id,
                                    e.target.value
                                  )
                                }
                                className="w-20 bg-slate-950 border border-slate-700 rounded p-1 text-center text-white focus:border-indigo-500 outline-none"
                              />
                            </td>
                            <td className="py-3 text-center text-slate-400 font-bold">
                              {realClicks + manualBoost}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "logs" && (
                <div className="space-y-8">
                  {/* CHART GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Timeline */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <h3 className="text-slate-400 text-xs uppercase mb-4 font-bold flex items-center gap-2">
                        <BarChart3 size={14} /> Activity Timeline
                      </h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData.timeline}>
                            <XAxis
                              dataKey="date"
                              stroke="#64748b"
                              fontSize={12}
                            />
                            <YAxis
                              stroke="#64748b"
                              fontSize={12}
                              allowDecimals={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#334155",
                                color: "#fff",
                              }}
                            />
                            <Bar
                              dataKey="clicks"
                              fill="#6366f1"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Category Popularity */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <h3 className="text-slate-400 text-xs uppercase mb-4 font-bold flex items-center gap-2">
                        <PieIcon size={14} /> Category Popularity (Real Clicks)
                      </h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData.categories}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {chartData.categories.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#334155",
                                color: "#fff",
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Game Popularity */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <h3 className="text-slate-400 text-xs uppercase mb-4 font-bold flex items-center gap-2">
                        <PieIcon size={14} /> Game Popularity (Real Clicks)
                      </h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData.games}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {chartData.games.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#334155",
                                color: "#fff",
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Device Distribution */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <h3 className="text-slate-400 text-xs uppercase mb-4 font-bold flex items-center gap-2">
                        <Laptop size={14} /> Device Distribution
                      </h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData.devices}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {chartData.devices.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#334155",
                                color: "#fff",
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* RESTORED DETAILED LOGS TABLE */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-hidden">
                    <h3 className="text-slate-400 text-xs uppercase mb-4 font-bold flex items-center gap-2">
                      <List size={14} /> Recent Activity Log
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                            <th className="pb-3 pl-2">Time</th>
                            <th className="pb-3">Game</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">User ID</th>
                            <th className="pb-3 text-right pr-2">Device</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {activityLogs.map((log) => (
                            <tr
                              key={log.id}
                              className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="py-3 pl-2 text-slate-400 font-mono text-xs whitespace-nowrap">
                                {formatTime(log.timestamp)}
                              </td>
                              <td className="py-3 font-medium text-white">
                                {log.gameTitle}
                              </td>
                              <td className="py-3 text-slate-400">
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                                  {log.category}
                                </span>
                              </td>
                              <td
                                className="py-3 font-mono text-xs text-slate-500"
                                title={log.userId}
                              >
                                {!log.userId || log.userId === "unknown"
                                  ? "Guest"
                                  : log.userId.substring(0, 8) + "..."}
                              </td>
                              <td className="py-3 text-right pr-2 flex justify-end items-center gap-2 text-slate-400">
                                <span className="text-xs hidden md:inline">
                                  {getDeviceName(log.device)}
                                </span>
                                {getDeviceIcon(log.device)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {activityLogs.length === 0 && (
                        <div className="text-center text-slate-500 py-8 italic">
                          No activity recorded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <Save size={18} /> Publish
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const RandomGameModal = ({ isOpen, onClose, games, onSelect }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedGame, setDisplayedGame] = useState(null);

  useEffect(() => {
    if (isOpen && games.length > 0) {
      setIsSpinning(true);
      let interval;
      let counter = 0;
      interval = setInterval(() => {
        const random = games[Math.floor(Math.random() * games.length)];
        setDisplayedGame(random);
        counter++;
        if (counter > 15) {
          clearInterval(interval);
          setIsSpinning(false);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isOpen, games]);
  if (!isOpen || !displayedGame) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 flex justify-center items-center gap-2">
          {isSpinning ? (
            <Shuffle className="animate-spin" />
          ) : (
            <Dice5 className="text-indigo-500" />
          )}
          {isSpinning ? "Rolling the dice..." : "Fate has chosen!"}
        </h2>

        <div
          className={`transition-all duration-300 ${
            isSpinning ? "blur-sm scale-90" : "scale-100"
          }`}
        >
          <div
            className={`mx-auto w-24 h-24 mb-4 rounded-full bg-gradient-to-br ${displayedGame.color} flex items-center justify-center shadow-xl`}
          >
            {React.cloneElement(displayedGame.icon, {
              className: "w-12 h-12 text-white",
            })}
          </div>
          <h3 className="text-3xl font-black text-white mb-2">
            {displayedGame.title}
          </h3>
          <p className="text-slate-400 mb-6">{displayedGame.description}</p>

          <button
            disabled={isSpinning || displayedGame.maintenance}
            onClick={() => onSelect(displayedGame)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {displayedGame.maintenance ? (
              <>
                <Hammer size={20} /> Under Maintenance
              </>
            ) : (
              <>
                Play Now <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
const NewReleaseSlider = ({ games, onGameClick }) => {
  const heroGames = useMemo(() => {
    // Strategy: Combine FEATURED, NEW, and UPCOMING games
    const featuredGames = games.filter((g) => g.isFeatured && g.visible);
    const newGames = games.filter((g) => g.isNew && g.visible);
    const upcomingGames = games.filter((g) => g.isUpcoming && g.visible);

    // Combine and remove duplicates (using Set of IDs)
    // Order: Featured first, then New, then Upcoming
    const combined = [...featuredGames, ...newGames, ...upcomingGames];
    const uniqueGames = Array.from(
      new Map(combined.map((game) => [game.id, game])).values()
    );

    // Fallback: If list empty, show Hot games
    if (uniqueGames.length > 0) {
      return uniqueGames;
    }
    return games.filter((g) => g.isHot && g.visible).slice(0, 3);
  }, [games]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % heroGames.length);
    }, 5000);

    return () => resetTimeout();
  }, [currentIndex, heroGames.length]);
  const handleManualSlide = (idx) => {
    resetTimeout();
    setCurrentIndex(idx);
  };

  if (!heroGames || heroGames.length === 0) return null;
  // SAFETY FIX: Ensure currentIndex is within bounds
  const safeIndex = currentIndex >= heroGames.length ? 0 : currentIndex;
  const currentGame = heroGames[safeIndex];

  // Extra safety guard
  if (!currentGame) return null;
  const handleHeroClick = (e) => {
    e.preventDefault();
    if (currentGame.isUpcoming || currentGame.maintenance) return;

    onGameClick(currentGame);
    window.open(currentGame.link, "_blank");
    logGameClick(currentGame);
  };
  // Determine badge text and style
  let badgeText = "Featured";
  let badgeColor = "bg-emerald-500/20 border-emerald-500/30 text-emerald-300";

  if (currentGame.isUpcoming) {
    badgeText = "Upcoming Release";
    badgeColor = "bg-pink-500/20 border-pink-500/30 text-pink-300";
  } else if (currentGame.maintenance) {
    badgeText = "Maintenance Break";
    badgeColor = "bg-orange-500/20 border-orange-500/30 text-orange-300";
  } else if (currentGame.isFeatured) {
    // UPDATED: Priority moved up. Featured takes precedence over New.
    badgeText = "Featured";
    badgeColor = "bg-emerald-500/20 border-emerald-500/30 text-emerald-300";
  } else if (currentGame.isNew) {
    badgeText = "New Release";
    badgeColor = "bg-red-700/20 border-red-500/30 text-red-400";
  } else if (currentGame.isHot) {
    badgeText = "Hot";
    badgeColor = "bg-orange-700/20 border-orange-500/30 text-orange-300";
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 group animate-in slide-in-from-top-10 duration-700">
      <div
        key={currentGame.id}
        className={`absolute inset-0 bg-gradient-to-br ${currentGame.color} opacity-20 transition-opacity duration-1000`}
      />
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="relative p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left min-h-[400px]">
        {/* Left Arrow (Desktop) */}
        <button
          onClick={() =>
            handleManualSlide(
              (safeIndex - 1 + heroGames.length) % heroGames.length
            )
          }
          className="hidden md:block absolute left-4 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-white z-20"
        >
          <ChevronLeft />
        </button>

        <div className="flex-1 flex flex-col md:flex-row items-center gap-8 w-full justify-center">
          {/* Game Icon */}
          <div
            className={`p-6 rounded-2xl bg-gradient-to-br ${currentGame.color} ${currentGame.shadow} shadow-2xl transform transition-all duration-500 scale-100`}
          >
            {React.cloneElement(currentGame.icon, {
              className: "w-16 h-16 md:w-24 md:h-24 text-white",
            })}
          </div>

          {/* Game Content */}
          <div className="flex-1 max-w-xl">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase animate-pulse tracking-widest mb-4 ${badgeColor}`}
            >
              {currentGame.isUpcoming ? (
                <Clock size={12} />
              ) : currentGame.maintenance ? (
                <Hammer size={12} />
              ) : (
                <Sparkles size={12} />
              )}{" "}
              {badgeText}
            </div>
            {/* Fixed key prop usage */}
            <h2
              key={currentGame.id}
              className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {currentGame.title}
            </h2>
            <p className="text-base text-slate-300 mb-6 leading-relaxed">
              {currentGame.description}
            </p>

            {/* Play Button - Hidden for Upcoming/Maintenance Games */}
            {!currentGame.isUpcoming && (
              <button
                onClick={handleHeroClick}
                disabled={currentGame.maintenance}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-colors ${
                  currentGame.maintenance
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600"
                    : "bg-white text-slate-900 hover:bg-slate-200 shadow-white/10"
                }`}
              >
                {currentGame.maintenance ? (
                  <>
                    <Hammer size={20} /> Under Maintenance
                  </>
                ) : (
                  <>
                    Play Now <ArrowRight size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Arrow (Desktop) */}
        <button
          onClick={() => handleManualSlide((safeIndex + 1) % heroGames.length)}
          className="hidden md:block absolute right-4 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-white z-20"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {heroGames.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleManualSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === safeIndex
                ? "w-8 bg-white"
                : "bg-slate-600 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const GameCard = ({
  game,
  isUpcoming,
  isFavorite,
  onToggleFavorite,
  onGameClick,
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (isUpcoming || game.maintenance) return;

    onGameClick(game);
    const newWin = window.open("", "_blank");
    logGameClick(game);
    if (newWin) {
      newWin.location.href = game.link;
    } else {
      window.location.href = game.link;
    }
  };
  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(game.id);
  };
  return (
    <a
      href={isUpcoming || game.maintenance ? undefined : game.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`group relative block h-full animate-in fade-in zoom-in duration-500 ${
        isUpcoming || game.maintenance
          ? "cursor-default opacity-80"
          : "cursor-pointer"
      }`}
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${
          game.color
        } rounded-2xl opacity-0 ${
          isUpcoming || game.maintenance
            ? "group-hover:opacity-30"
            : "group-hover:opacity-75"
        } blur transition duration-500 group-hover:duration-200`}
      />
      <div className="relative h-full flex flex-col bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-transparent transition-colors duration-300">
        {!isUpcoming && (
          <button
            onClick={handleFavorite}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/50 hover:bg-slate-800 transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"
              }`}
            />
          </button>
        )}

        <div className="flex justify-between items-start mb-6 h-8">
          <div className="flex gap-2 flex-wrap max-w-[80%]">
            {game.maintenance && (
              <span className="bg-orange-700/50 border border-orange-500 text-orange-200 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                <Hammer size={10} /> MAINTENANCE BREAK
              </span>
            )}
            {!game.maintenance && game.isNew && !isUpcoming && (
              <span className="bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-1 shadow-red-500/50">
                <Sparkles size={10} /> NEW
              </span>
            )}
            {!game.maintenance && game.isHot && !isUpcoming && (
              <span className="bg-orange-700 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 shadow-orange-500/50">
                <Flame size={10} /> HOT
              </span>
            )}
            {!game.maintenance && game.isPopular && !isUpcoming && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 shadow-blue-500/50">
                <Crown size={10} /> POPULAR
              </span>
            )}
            {isUpcoming && (
              <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-1 shadow-pink-500/50">
                <Clock size={10} /> COMING SOON
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div
            className={`inline-block p-3 rounded-xl bg-gradient-to-br ${
              game.maintenance
                ? "from-slate-700 to-slate-800 shadow-none grayscale opacity-50"
                : game.color
            } ${
              game.shadow
            } shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            {game.icon}
          </div>
        </div>

        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
            {game.title}
          </h3>
          <p className="text-slate-400 leading-relaxed mb-4 text-sm">
            {game.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {/* Renders multiple categories if present */}
            {game.categories &&
              game.categories.map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] uppercase font-bold rounded flex items-center gap-1"
                >
                  {cat}
                </span>
              ))}
            <span className="px-2 py-1 bg-slate-800 text-indigo-300 text-[10px] uppercase font-bold rounded flex items-center gap-1">
              <Clock size={10} /> {game.duration}
            </span>
            <span
              className={`px-2 py-1 bg-slate-800 text-[10px] uppercase font-bold rounded flex items-center gap-1 ${
                game.complexity === "High"
                  ? "text-red-400"
                  : game.complexity === "Medium"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              <Zap size={10} /> {game.complexity}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/50 mt-auto flex items-center justify-between group/btn">
          <div className="flex items-center text-slate-400 text-sm">
            <span className="px-3 py-1 bg-slate-800/50 text-slate-300 text-xs font-semibold tracking-wider rounded-full border border-slate-700/50 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {game.minPlayers}-{game.maxPlayers}
            </span>
            <div className="ml-2 flex items-center gap-2">
              {game.hasBots && (
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  +Bot
                </div>
              )}
            </div>
          </div>

          {!isUpcoming && (
            <div className="flex items-center font-medium text-sm group-hover/btn:translate-x-1 transition-transform">
              {game.maintenance ? (
                <span className="text-slate-500 flex items-center gap-1">
                  <Hammer size={12} /> Offline
                </span>
              ) : (
                <span className="text-white flex items-center">
                  Play <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
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
      <style>{`@keyframes float { 0% { transform: translate(0, 0) rotate(0deg);
} 50% { transform: translate(var(--tx), var(--ty)) rotate(180deg); } 100% { transform: translate(0, 0) rotate(360deg); } } .animate-float { animation-name: float;
animation-timing-function: ease-in-out; animation-iteration-count: infinite; }`}</style>
    </div>
  );
};
// --- MAIN COMPONENT ---
const GameHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [playerCount, setPlayerCount] = useState(0);
  const [selectedComplexity, setSelectedComplexity] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [favorites, setFavorites] = useState(new Set());
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [gameOverrides, setGameOverrides] = useState({});
  const [clickStats, setClickStats] = useState({});
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    const storedFavs = localStorage.getItem("gamehub_favorites");
    if (storedFavs) {
      setFavorites(new Set(JSON.parse(storedFavs)));
    }
    const storedHistory = localStorage.getItem("gamehub_history");
    if (storedHistory) {
      setRecentlyPlayed(JSON.parse(storedHistory));
    }
  }, []);
  useEffect(() => {
    const unsubConfig = onSnapshot(
      doc(db, "game_hub_settings", "config"),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setGameOverrides(data);
          setMaintenanceMode(data.maintenanceMode || false);
        }
      }
    );

    const unsubStats = onSnapshot(collection(db, "game_stats"), (snapshot) => {
      const stats = {};
      snapshot.docs.forEach((doc) => {
        const id = parseInt(doc.id.replace("game_", ""));
        stats[id] = doc.data().clicks || 0;
      });
      setClickStats(stats);
    });

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) signInAnonymously(auth);
    });
    return () => {
      unsubConfig();
      unsubStats();
      unsubAuth();
    };
  }, []);
  const handleAdminSave = async (newConfig, newMaintenanceMode) => {
    await setDoc(
      doc(db, "game_hub_settings", "config"),
      {
        ...newConfig,
        maintenanceMode: newMaintenanceMode,
      },
      { merge: true }
    );
  };

  const handleToggleFavorite = (id) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) {
      newFavs.delete(id);
    } else {
      newFavs.add(id);
    }
    setFavorites(newFavs);
    localStorage.setItem("gamehub_favorites", JSON.stringify([...newFavs]));
  };

  const handleGamePlay = (game) => {
    const newHistory = [
      game.id,
      ...recentlyPlayed.filter((id) => id !== game.id),
    ].slice(0, 5);
    setRecentlyPlayed(newHistory);
    localStorage.setItem("gamehub_history", JSON.stringify(newHistory));
  };

  const processedGames = useMemo(() => {
    return INITIAL_GAMES.map((game) => {
      const override = gameOverrides[game.id] || {};
      const realClicks = clickStats[game.id] || 0;
      const manualBoost = override.popularity || 0;
      return {
        ...game,
        visible: override.visible ?? true,
        isNew: override.isNew ?? false,
        isHot: override.isHot ?? false,
        isFeatured: override.isFeatured || false,
        isUpcoming: override.isUpcoming || false,
        maintenance: override.maintenance || false,
        manualBoost: manualBoost, // UPDATED: Pass manualBoost to game object
        popularity: realClicks + manualBoost,
      };
    });
  }, [gameOverrides, clickStats]);
  const categories = [
    "All",
    ...new Set(
      processedGames
        .filter((g) => g.visible && !g.isUpcoming)
        .flatMap((g) => g.categories) // UPDATED: Use flatMap to handle arrays
    ),
  ];
  const isFiltering =
    searchTerm !== "" ||
    selectedCategory !== "All" ||
    playerCount !== 0 ||
    selectedComplexity !== "All" ||
    selectedDuration !== "All";

  const filteredGames = useMemo(() => {
    return processedGames
      .filter((game) => {
        // UPDATED: Search checks if ANY category matches
        const matchesSearch =
          game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.categories.some((c) =>
            c.toLowerCase().includes(searchTerm.toLowerCase())
          );

        // UPDATED: Category check looks for inclusion in array
        const matchesCategory =
          selectedCategory === "All" ||
          game.categories.includes(selectedCategory);

        const matchesPlayers =
          playerCount === 0 ||
          (playerCount >= game.minPlayers && playerCount <= game.maxPlayers);

        const matchesComplexity =
          selectedComplexity === "All" ||
          game.complexity === selectedComplexity;
        const matchesDuration =
          selectedDuration === "All" ||
          (selectedDuration === "Short"
            ? ["5-10m", "5-15m", "10-20m"].includes(game.duration)
            : selectedDuration === "Medium"
            ? ["15-30m", "20m", "20-40m", "25m"].includes(game.duration)
            : selectedDuration === "Long"
            ? ["30m+", "30-60m", "45m+"].includes(game.duration)
            : true);

        const isPlayable = !game.isUpcoming;
        if (selectedCategory === "Favorites") {
          return favorites.has(game.id) && game.visible;
        }

        if (isFiltering) {
          return (
            matchesSearch &&
            matchesCategory &&
            matchesPlayers &&
            matchesComplexity &&
            matchesDuration &&
            game.visible
          );
        } else {
          return isPlayable && game.visible;
        }
      })
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [
    searchTerm,
    selectedCategory,
    playerCount,
    selectedComplexity,
    selectedDuration,
    processedGames,
    isFiltering,
    favorites,
  ]);
  const upcomingGames = useMemo(
    () => processedGames.filter((g) => g.visible && g.isUpcoming),
    [processedGames]
  );
  const popularGames = useMemo(() => {
    return [...processedGames]
      .filter((g) => g.visible && !g.isUpcoming)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 2);
  }, [processedGames]);
  const historyGames = useMemo(() => {
    return recentlyPlayed
      .map((id) => processedGames.find((g) => g.id === id))
      .filter(Boolean);
  }, [recentlyPlayed, processedGames]);
  const handleRandomSelect = (game) => {
    setIsRandomModalOpen(false);
    handleGamePlay(game);
    const newWin = window.open("", "_blank");
    logGameClick(game);
    if (newWin) newWin.location.href = game.link;
    else window.location.href = game.link;
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setPlayerCount(0);
    setSelectedComplexity("All");
    setSelectedDuration("All");
  };

  // MAINTENANCE CHECK Logic
  const isUserAdmin = user && user.email === "admin@rawfidsgamehub.com";
  const isMaintenanceActive = maintenanceMode && !isUserAdmin;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white relative flex flex-col">
      <FloatingBackground games={processedGames} />

      {/* RAINBOW ANIMATION STYLE */}
      <style>{`
        @keyframes rainbow {
          0%, 100% { color: #9333ea; } /* purple-600 */
          14% { color: #16a34a; } /* green-600 */
          28% { color: #dc2626; } /* red-600 */
          42% { color: #eab308; } /* yellow-500 */
          57% { color: #ea580c; } /* orange-600 */
          71% { color: #0891b2; } /* cyan-600 */
          85% { color: #db2777; } /* pink-600 */
        }
        .animate-rainbow {
          animation: rainbow 8s linear infinite;
        }
      `}</style>

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        games={processedGames}
        onSave={handleAdminSave}
        currentUser={user}
        realClickData={clickStats}
        maintenanceMode={maintenanceMode}
        setMaintenanceMode={setMaintenanceMode}
      />

      <RandomGameModal
        isOpen={isRandomModalOpen}
        onClose={() => setIsRandomModalOpen(false)}
        games={filteredGames}
        onSelect={handleRandomSelect}
      />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl flex-grow flex flex-col">
        <header className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 animate-fade-in-down">
            <Gamepad2 className="w-6 h-6 text-indigo-400 mr-2" />
            <span className="text-indigo-300 font-medium tracking-wide text-sm uppercase">
              Multiplayer Board Game Hub
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-4">
            Board Games{" "}
            <span className="animate-pulse animate-rainbow">Online</span>
          </h1>
        </header>

        {isMaintenanceActive ? (
          <MaintenanceContent />
        ) : (
          <>
            {/* NEW RELEASES SLIDER (FEATURED SECTION) */}
            {!isFiltering && (
              <NewReleaseSlider
                games={processedGames}
                onGameClick={handleGamePlay}
              />
            )}

            {/* RECENTLY PLAYED */}
            {!isFiltering && historyGames.length > 0 && (
              <div className="w-full max-w-5xl mx-auto mb-8 animate-in slide-in-from-top-4 min-w-0">
                <div className="flex items-center gap-2 mb-3 text-slate-400 text-sm font-bold uppercase tracking-wider">
                  <History size={16} /> Jump back in
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide w-full">
                  {historyGames.map((game) => (
                    <div
                      key={game.id}
                      onClick={() =>
                        !game.maintenance && handleRandomSelect(game)
                      }
                      className={`flex-shrink-0 group flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 transition-all pr-6 ${
                        game.maintenance
                          ? "opacity-50 cursor-not-allowed border-orange-900"
                          : "hover:border-indigo-500/50 cursor-pointer"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${game.color}`}
                      >
                        {React.cloneElement(game.icon, {
                          size: 20,
                          className: "text-white",
                        })}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm truncate max-w-[150px]">
                          {game.title}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {game.maintenance ? "Maintenance" : "Resume"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FILTERS */}
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

                <div className="md:w-48 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 flex flex-col justify-center backdrop-blur-md">
                  <div className="flex justify-between text-xs text-slate-400 mb-1 font-bold">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> Players
                    </span>
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

                <button
                  onClick={() => setIsRandomModalOpen(true)}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap"
                >
                  <Shuffle size={20} /> <span className="">Pick for me</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <option value="All">Any Complexity</option>
                  <option value="Low">Low Complexity</option>
                  <option value="Medium">Medium Complexity</option>
                  <option value="High">High Complexity</option>
                </select>

                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <option value="All">Any Duration</option>
                  <option value="Short">Short (&lt; 20m)</option>
                  <option value="Medium">Medium (20-45m)</option>
                  <option value="Long">Long (45m+)</option>
                </select>

                <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block"></div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("Favorites")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${
                      selectedCategory === "Favorites"
                        ? "bg-red-600 text-white border-red-500"
                        : "bg-slate-900/50 text-slate-400 border-slate-700 hover:text-red-400"
                    }`}
                  >
                    <Heart
                      size={14}
                      className={
                        selectedCategory === "Favorites" ? "fill-white" : ""
                      }
                    />{" "}
                    Favorites
                  </button>
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

                {isFiltering && (
                  <button
                    onClick={resetFilters}
                    className="ml-auto px-4 py-2 bg-red-900/50 border border-red-500 text-red-200 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-red-900 transition-colors animate-in fade-in"
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* TRENDING SECTION */}
            {!isFiltering && popularGames.length > 0 && (
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
                    <GameCard
                      key={game.id}
                      game={{ ...game, isPopular: true }}
                      isFavorite={favorites.has(game.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onGameClick={handleGamePlay}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* MAIN GAMES GRID */}
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <Gamepad2 className="w-5 h-5 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                {isFiltering
                  ? `Search Results (${filteredGames.length})`
                  : "All Games"}
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
                    isUpcoming={game.isUpcoming}
                    isFavorite={favorites.has(game.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onGameClick={handleGamePlay}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 animate-in fade-in">
                  <Dice5 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400">
                    No games match your filters
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </main>

            {/* UPCOMING RELEASES */}
            {!isFiltering && upcomingGames.length > 0 && (
              <section className="mb-16 animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                    <Clock className="w-5 h-5 text-pink-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-wide">
                    Upcoming Releases
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {upcomingGames.map((game) => (
                    <GameCard key={game.id} game={game} isUpcoming={true} />
                  ))}
                </div>
              </section>
            )}

            <div className="text-center pb-12 animate-pulse">
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900/50 rounded-full border border-indigo-500/20 text-indigo-300 font-bold tracking-widest text-sm uppercase backdrop-blur-sm">
                <Sparkles size={16} /> Stay tuned... More games coming soon...{" "}
                <Sparkles size={16} />
              </div>
            </div>
          </>
        )}

        <footer className="border-t border-slate-800/50 pt-8 mt-auto text-center text-slate-500 text-sm">
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
