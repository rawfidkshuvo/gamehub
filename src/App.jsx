import React, { useState } from "react";
import {
  Users,
  Bot,
  Search,
  Crown,
  Skull,
  Search as MagnifyingGlass,
  Siren,
  Apple,
  Eye,
  ArrowRight,
  Gamepad2,
  Dice5,
  Github,
} from "lucide-react";

const GameHub = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------------------------------------------------------
  // CONFIGURATION: Add your actual GitHub Page links here
  // ---------------------------------------------------------------------------
  const games = [
    {
      id: 1,
      title: "Conspiracy",
      description:
        "A game of secret identities and hidden agendas. Trust no one as you uncover the plot. Bring your inner Bluff-master!",
      icon: <Eye className="w-12 h-12 text-white" />,
      color: "from-purple-600 to-indigo-900",
      shadow: "shadow-purple-500/50",
      type: "Bluffing Game",
      playerNumber: "2-6",
      hasBots: false,
      link: "https://rawfidkshuvo.github.io/conspiracy-card-game/", // REPLACE WITH REAL LINK
    },
    {
      id: 2,
      title: "Investigation",
      description:
        "Gather clues, interview suspects, and solve the mystery before the trail goes cold!",
      icon: <MagnifyingGlass className="w-12 h-12 text-white" />,
      color: "from-blue-600 to-cyan-800",
      shadow: "shadow-blue-500/50",
      type: "Murder Mystery Game",
      playerNumber: "4-10",
      hasBots: false,
      link: "https://rawfidkshuvo.github.io/investigation-game/", // REPLACE WITH REAL LINK
    },
    {
      id: 4,
      title: "Emperor",
      description:
        "Political maneuvering in the ancient court. Seven mighty kingdoms are at stake. Vying for the throne requires cunning and strategic moves!",
      icon: <Crown className="w-12 h-12 text-white" />,
      color: "from-yellow-500 to-amber-700",
      shadow: "shadow-amber-500/50",
      type: "Card Strategy Gae",
      playerNumber: "2",
      hasBots: false,
      link: "https://rawfidkshuvo.github.io/emperor-game/", // REPLACE WITH REAL LINK
    },
    {
      id: 5,
      title: "Pirates",
      description:
        "The dark seas are full of pirates. Navigate your way to the treasure. A game of deception and high-seas treachery!",
      icon: <Skull className="w-12 h-12 text-white" />,
      color: "from-emerald-600 to-teal-800",
      shadow: "shadow-emerald-500/50",
      type: "Charecter Strategy Game",
      playerNumber: "2-8",
      hasBots: false,
      link: "https://rawfidkshuvo.github.io/pirates-game/", // REPLACE WITH REAL LINK
    },
    {
      id: 3,
      title: "Police Hunt",
      description:
        "A high-stakes chase. Play as the police coordinating a capture or the fugitive on the run!",
      icon: <Siren className="w-12 h-12 text-white" />,
      color: "from-red-600 to-rose-900",
      shadow: "shadow-red-500/50",
      type: "Criminal Pursuit Game",
      playerNumber: "1-4",
      hasBots: true,
      link: "https://rawfidkshuvo.github.io/thief-police-game/", // REPLACE WITH REAL LINK
    },
    {
      id: 6,
      title: "Fruit Seller",
      description:
        "Manage your fruit market stall. Use psychology to outsell your opponents in this quick-fire card game!",
      icon: <Apple className="w-12 h-12 text-white" />,
      color: "from-orange-500 to-red-600",
      shadow: "shadow-orange-500/50",
      type: "Fun Party Game",
      playerNumber: "1-6",
      hasBots: true,
      link: "https://rawfidkshuvo.github.io/fruit-seller-game/", // REPLACE WITH REAL LINK
    },
  ];

  const filteredGames = games.filter(
    (game) =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <header className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 animate-fade-in-down">
            <Gamepad2 className="w-6 h-6 text-indigo-400 mr-2" />
            <span className="text-indigo-300 font-medium tracking-wide text-sm uppercase">
              Multiplayer Board Game Hub
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-4">
            Board Games <span className="text-indigo-500">Online</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Welcome to the central hub for our social deduction and strategy
            games. Choose your adventure, invite your friends, and start playing
            instantly in your browser.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Find a game..."
              className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Games Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => <GameCard key={game.id} game={game} />)
          ) : (
            <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
              <Dice5 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-400">
                No games found
              </h3>
              <p className="text-slate-500">
                Try searching for something else.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 pt-8 mt-8 text-center text-slate-500 text-sm">
          <div className="flex justify-center items-center space-x-6 mb-4">
            <a
              href="#"
              className="hover:text-white transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" /> GitHub Repository
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span className="flex items-center gap-2">
              Built with React & Tailwind
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <p className="flex items-center gap-2">
              Developed by Rawfid K Shuvo
            </p>
          </div>
          <p>
            &copy; {new Date().getFullYear()} Game Hub Portal. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

// Extracted Card Component for cleaner code
const GameCard = ({ game }) => {
  return (
    <a
      href={game.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-full"
    >
      {/* Glow effect behind the card */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${game.color} rounded-2xl opacity-0 group-hover:opacity-75 blur transition duration-500 group-hover:duration-200`}
      />

      {/* Main Card Content */}
      <div className="relative h-full flex flex-col bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-transparent transition-colors duration-300">
        {/* Header Part of Card */}
        <div className="flex items-start justify-between mb-6">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${game.color} ${game.shadow} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            {game.icon}
          </div>
          <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider rounded-full border border-slate-700">
            {game.type}
          </span>
        </div>

        {/* Text Content */}
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
            {game.title}
          </h3>
          <p className="text-slate-400 leading-relaxed mb-4">
            {game.description}
          </p>
        </div>

        {/* Footer Part of Card */}
        <div className="pt-4 border-t border-slate-800/50 mt-4 flex items-center justify-between group/btn">
          <div className="flex items-center text-slate-400 text-sm">
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold tracking-wider rounded-full border border-slate-700 flex items-center gap-1">
              <Users className="w-4 h-4" />
              {game.playerNumber} Players
            </span>
          </div>
          {game.hasBots && (
            <div
              className="flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
              title="AI Bots Available"
            >
              <Bot className="w-3.5 h-3.5 mr-1" />
              <span>Bots</span>
            </div>
          )}
          <div className="flex items-center text-white font-medium group-hover/btn:translate-x-1 transition-transform">
            Play Now <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>
      </div>
    </a>
  );
};

export default GameHub;
