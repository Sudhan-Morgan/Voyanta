import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Voy<span className="text-indigo-400">anta</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Collaborative Travel Planning Platform. Effortlessly generate itineraries, split group expenses, and explore destinations together.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore" className="hover:text-white transition-colors">Popular Destinations</Link></li>
              <li><Link to="/ai-planner" className="hover:text-white transition-colors">AI Itinerary Generator</Link></li>
              <li><Link to="/trips" className="hover:text-white transition-colors">Group Coordination</Link></li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Built With
            </h4>
            <ul className="space-y-2 text-xs">
              <li>React & Tailwind CSS</li>
              <li>Node.js & Express API</li>
              <li>MongoDB & Mongoose</li>
              <li>Google Maps & Gemini AI</li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Project
            </h4>
            <p className="text-xs leading-relaxed mb-3">
              EE4207 – Web Application Development
            </p>
            <a
              href="https://github.com/Sudhan-Morgan/travelmate"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub Repository
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Voyanta. Built for seamless travel planning.</p>
          <p className="flex items-center gap-1">
            Developed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by Sudhan M
          </p>
        </div>
      </div>
    </footer>
  );
}
