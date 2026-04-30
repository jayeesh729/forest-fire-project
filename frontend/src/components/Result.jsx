import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Result({ result }) {
  if (!result) return null;

  const { image, detections } = result;
  
  // Any detection indicates the area is not secure, regardless of confidence score.
  const isFireDetected = detections && detections.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`w-full max-w-3xl mx-auto mt-8 glass-card rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ${isFireDetected ? 'border-red-500/50 shadow-[0_0_60px_rgba(239,68,68,0.15)]' : 'border-green-500/20'}`}
    >
      {/* Banner */}
      <div className={`p-5 flex items-center justify-center space-x-3 text-white font-bold text-lg tracking-wide border-b ${isFireDetected ? 'bg-gradient-to-r from-red-600/90 to-red-900/90 border-red-500/50' : 'bg-gradient-to-r from-emerald-600/90 to-emerald-900/90 border-emerald-500/50'} backdrop-blur-md`}>
        {isFireDetected ? (
          <>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <AlertTriangle className="w-7 h-7 text-yellow-300" />
            </motion.div>
            <span className="text-red-50 drop-shadow-md">Area Not Secure</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-7 h-7 text-emerald-300" />
            <span className="text-emerald-50 drop-shadow-md">Area Secure</span>
          </>
        )}
      </div>

      <div className="p-6 md:p-8">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 flex justify-center mb-8 relative group">
          <img 
            src={`data:image/jpeg;base64,${image}`} 
            alt="Processed Frame" 
            className="w-full h-auto max-h-[500px] object-contain relative z-10"
          />
          {isFireDetected && (
            <div className="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse z-20"></div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            Inference Results
            <span className="ml-3 px-3 py-1 bg-white/10 text-xs font-semibold rounded-full border border-white/5">{detections?.length || 0} Entities</span>
          </h3>
          
          {detections && detections.length > 0 ? (
            <ul className="space-y-4">
              {detections.map((d, i) => (
                 <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex flex-col md:flex-row md:justify-between md:items-center bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center space-x-3 mb-3 md:mb-0">
                      <span className={`w-3 h-3 rounded-full ${d.confidence > 0.7 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-orange-500'}`}></span>
                      <span className="font-semibold text-neutral-200 capitalize tracking-wide">{d.label}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                       <div className="w-full md:w-48 h-2.5 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(d.confidence * 100).toFixed(0)}%` }}
                            transition={{ duration: 1, delay: 0.2, type: 'spring' }}
                            className={`h-full ${d.confidence > 0.7 ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`} 
                          />
                       </div>
                       <span className="text-sm font-bold text-white w-14 text-right bg-neutral-900 py-1 px-2 rounded-lg border border-white/10">
                          {(d.confidence * 100).toFixed(1)}%
                       </span>
                    </div>
                 </motion.li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-white/5 rounded-2xl border border-white/5 border-dashed">
              <CheckCircle className="w-10 h-10 text-emerald-500/50 mb-3" />
              <p className="text-neutral-400 text-sm font-medium tracking-wide">Model found no objects of interest.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
