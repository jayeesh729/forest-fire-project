import React from 'react';
import { History, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DetectionHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto mt-12 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-6 md:p-8"
    >
      <h3 className="flex items-center text-xl font-bold text-white border-b border-white/10 pb-4 mb-6 tracking-wide">
        <History className="w-6 h-6 mr-3 text-red-500/80 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" /> 
        Scan Archive
      </h3>
      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-3 relative">
        <AnimatePresence>
          {history.map((record, index) => {
            const isFire = record.detections.length > 0;
            return (
              <motion.div 
                key={`${record.timestamp}-${index}`}
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl flex items-center justify-between border-l-4 cursor-pointer backdrop-blur shadow-md ${isFire ? 'border-red-500 bg-red-950/20 hover:bg-red-950/40' : 'border-emerald-500 bg-emerald-950/20 hover:bg-emerald-950/30'} border border-white/5 transition-colors`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${isFire ? 'bg-red-500/10' : 'bg-emerald-500/10'} border border-white/5 shadow-inner`}>
                    {isFire ? (
                      <ShieldAlert className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    )}
                  </div>
                  <div>
                    <p className={`font-bold tracking-wider uppercase text-sm ${isFire ? 'text-red-100' : 'text-emerald-100'}`}>
                      {isFire ? 'AREA NOT SECURE' : 'AREA SECURE'}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{new Date(record.timestamp).toLocaleTimeString()} - {new Date(record.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold tracking-wide bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  {isFire ? (
                    <span className="text-red-400 font-bold">{record.detections.length} Signature(s)</span>
                  ) : (
                    <span className="text-emerald-500">Nil</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
