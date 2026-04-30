import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Spinner({ message = "Processing Frame..." }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8 relative">
      <div className="absolute inset-0 bg-red-500/10 blur-[50px] rounded-full pointer-events-none w-32 h-32 mx-auto"></div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="relative z-10"
      >
        <div className="relative">
          <Loader2 className="h-12 w-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          <div className="absolute inset-0 rounded-full border-t-2 border-orange-400 opacity-50 blur-[2px]"></div>
        </div>
      </motion.div>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-neutral-300 font-medium tracking-widest text-sm uppercase relative z-10"
      >
        {message}
      </motion.span>
    </div>
  );
}
