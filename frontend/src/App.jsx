import React, { useState } from 'react';
import Upload from './components/Upload';
import Result from './components/Result';
import Spinner from './components/Spinner';
import DetectionHistory from './components/DetectionHistory';
import LiveDetection from './components/LiveDetection';
import { detectFire } from './api/detect';
import { Flame, Activity, XCircle, Camera, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState('upload'); // 'upload' or 'live'

  const handlePredict = async () => {
    if (!imageFile) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await detectFire(imageFile);
      setResult(data);
      
      setHistory(prev => [{
        timestamp: new Date().toISOString(),
        detections: data.detections || [],
      }, ...prev].slice(0, 10)); // Keep last 10
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative pb-20 overflow-x-hidden font-sans text-white">
      {/* Premium Multi-Layered Background */}
      
      {/* 1. Base Layer: Deep Midnight Radial */}
      <div className="fixed inset-0 bg-[#020617]"></div>

      {/* 2. Aurora Layer: Shifting Mesh Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] animate-aurora blur-[120px]" 
          style={{
            background: `radial-gradient(circle at 50% 50%, #064e3b 0%, transparent 50%), 
                         radial-gradient(circle at 80% 20%, #450a0a 0%, transparent 40%),
                         radial-gradient(circle at 10% 80%, #1e1b4b 0%, transparent 50%)`,
            backgroundSize: '200% 200%'
          }}
        ></div>
      </div>

      {/* 3. Tech Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      {/* 4. Vignette & Grain */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-60 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

      {/* 5. Floating Visual Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[15%] w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[15%] left-[10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] animate-float-delayed"></div>
        
        {/* Floating Glowing Small Flames */}
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute animate-ember pointer-events-none"
            style={{
              left: `${(i * 13) % 100}%`,
              bottom: `-50px`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${8 + (i % 7)}s`
            }}
          >
            <div 
              className="w-3 h-5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-200 blur-[1px] shadow-[0_0_15px_#f97316,0_0_30px_#ea580c]"
              style={{
                transform: `rotate(${Math.sin(i) * 20}deg)`,
                opacity: 0.6 + (i % 5) * 0.1
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Header Pipeline */}
      <header className="fixed top-0 inset-x-0 z-50 pt-4 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          <motion.div 
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="flex items-center space-x-3 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl cursor-pointer hover:bg-black/60 transition-colors"
            onClick={handleReset}
          >
            <div className="relative">
              <Flame className="w-8 h-8 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,1)]" />
              <div className="absolute inset-0 bg-red-600 blur-xl opacity-40"></div>
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-white uppercase drop-shadow-md">
              Forest<span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Shield</span>
            </span>
          </motion.div>
          
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="hidden sm:flex items-center space-x-4">
            {/* Mode Switcher */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-1 rounded-2xl flex items-center shadow-2xl">
              <button 
                onClick={() => setMode('upload')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'upload' ? 'bg-white/10 text-white shadow-inner' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Aerial Scan</span>
              </button>
              <button 
                onClick={() => setMode('live')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'live' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ground Feed</span>
              </button>
            </div>

            <div className="flex items-center bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl">
              <Activity className="w-5 h-5 text-orange-400 mr-2 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
              <span className="text-orange-400 font-mono text-xs font-bold tracking-widest uppercase">Sentinel Online</span>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-36 relative z-10 flex flex-col items-center">
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 relative">
          <div className="inline-block relative">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-100 to-neutral-500 tracking-tighter drop-shadow-sm mb-4">
              {mode === 'live' && <span className="text-4xl md:text-5xl block text-neutral-500 mb-2 font-medium tracking-normal">Direct Neural Link</span>}
              <span className="bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-400 drop-shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                {mode === 'upload' ? 'Forest Fire Detection' : 'Forest Surveillance'}
              </span>
            </h1>
          </div>
          <p className="mt-8 text-xl text-neutral-400 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
            {mode === 'upload' 
              ? "Deploy artificial intelligence to scan terrestrial landscapes. Our YOLO-MP neural architecture identifies thermal anomalies and early-stage wildfires with precision."
              : "Active monitoring of forest canopy sectors. Real-time inference pipeline scanning for combustion patterns and smoke plumes."
            }
          </p>
        </motion.div>

        {mode === 'upload' ? (
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="uploadView"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                className="flex flex-col items-center w-full"
              >
                <Upload 
                  onImageSelect={(file) => {
                    setImageFile(file);
                    setError(null);
                  }} 
                />

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-8 w-full max-w-2xl bg-red-950/50 backdrop-blur-md border border-red-500/50 text-red-100 p-4 rounded-2xl flex items-start shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                      <XCircle className="w-6 h-6 mr-3 text-red-500 flex-shrink-0" />
                      <div>
                        <strong className="block font-bold mb-1 tracking-wide uppercase text-sm text-red-400">System Error</strong>
                        <span className="font-mono text-sm leading-relaxed">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-12 flex justify-center w-full">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div key="spin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                         <Spinner />
                      </motion.div>
                    ) : (
                      <motion.button
                        key="btn"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        disabled={!imageFile}
                        onClick={handlePredict}
                        className="group relative flex items-center justify-center px-12 py-4 bg-black/40 backdrop-blur-xl border border-white/10 text-white font-bold tracking-widest uppercase text-lg rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/60 hover:border-white/20 hover:-translate-y-1 active:scale-95"
                      >
                        <div className="absolute inset-0 bg-red-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                        <Activity className="w-6 h-6 mr-3 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] group-hover:animate-pulse" />
                        Initiate Scan
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="resultView"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full mt-[-20px]"
              >
                <button 
                  onClick={handleReset}
                  className="mb-8 group flex items-center justify-center space-x-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full border border-neutral-700 group-hover:border-white/50 flex items-center justify-center bg-neutral-900 group-hover:bg-neutral-800 transition-all">
                    &larr;
                  </div>
                  <span className="font-semibold tracking-wider text-sm uppercase">Scan Another Sector</span>
                </button>
                <Result result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
           <LiveDetection />
        )}

        <DetectionHistory history={history} />

      </main>
    </div>
  );
}
