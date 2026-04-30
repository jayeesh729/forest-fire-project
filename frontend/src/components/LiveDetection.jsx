import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { detectFireLive } from '../api/detect';
import { Camera, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveDetection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [fps, setFps] = useState(0);
  
  const lastTimeRef = useRef(Date.now());

  // Draw bounding boxes on the canvas
  const drawBoxes = useCallback((currentDetections) => {
    const canvas = canvasRef.current;
    if (!canvas || !webcamRef.current) return;
    
    const video = webcamRef.current.video;
    if (!video || video.readyState < 2) return;
    
    // Get actual display dimensions
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    
    // Ensure canvas internal resolution matches display size for pixel-perfect drawing
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mapping detection coordinates (which are based on the screenshot resolution)
    // to the actual displayed video resolution, considering object-cover.
    
    // Internal video resolution (the space detections were made in)
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    
    // Calculate scaling and offsets for 'object-cover'
    const videoRatio = vw / vh;
    const displayRatio = displayWidth / displayHeight;
    
    let scale, offsetX = 0, offsetY = 0;
    
    if (displayRatio > videoRatio) {
      // Display is wider than video (video cropped top/bottom)
      scale = displayWidth / vw;
      offsetY = (displayHeight - vh * scale) / 2;
    } else {
      // Display is taller than video (video cropped sides)
      scale = displayHeight / vh;
      offsetX = (displayWidth - vw * scale) / 2;
    }

    currentDetections.forEach(det => {
      let [x1, y1, x2, y2] = det.box;
      
      // Map to display space
      x1 = x1 * scale + offsetX;
      y1 = y1 * scale + offsetY;
      x2 = x2 * scale + offsetX;
      y2 = y2 * scale + offsetY;

      const width = x2 - x1;
      const height = y2 - y1;
      
      // Draw Glow Effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
      
      // Draw outer border
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, width, height);
      
      // Reset shadows for details
      ctx.shadowBlur = 0;
      
      // Corners
      ctx.fillStyle = '#ef4444';
      const cl = Math.min(20, width/4, height/4);
      ctx.fillRect(x1-2, y1-2, cl, 4);
      ctx.fillRect(x1-2, y1-2, 4, cl);
      ctx.fillRect(x2-cl+2, y1-2, cl, 4);
      ctx.fillRect(x2-2, y1-2, 4, cl);
      ctx.fillRect(x1-2, y2-2, cl, 4);
      ctx.fillRect(x1-2, y2-cl+2, 4, cl);
      ctx.fillRect(x2-cl+2, y2-2, cl, 4);
      ctx.fillRect(x2-2, y2-cl+2, 4, cl);
      
      // Label
      const label = `${det.label} ${Math.round(det.confidence * 100)}%`;
      ctx.font = 'bold 12px "Outfit", sans-serif';
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.fillRect(x1 - 2, y1 - 22, textWidth + 12, 22);
      
      ctx.fillStyle = 'white';
      ctx.fillText(label, x1 + 4, y1 - 7);
    });
  }, []);

  const processFrame = useCallback(async () => {
    if (!isActive || isProcessing || !webcamRef.current) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState < 2) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const data = await detectFireLive(imageSrc);
      const newDetections = data.detections || [];
      setDetections(newDetections);
      drawBoxes(newDetections);
      
      const endTime = Date.now();
      setFps(endTime - startTime); // This is now latency (ms)
      
    } catch (err) {
      console.error("Live detection error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [isActive, isProcessing, drawBoxes]);

  useEffect(() => {
    let timer;
    const loop = async () => {
      if (isActive) {
        if (!isProcessing) {
          await processFrame();
        }
        timer = setTimeout(loop, 10); // Check as fast as possible
      }
    };

    if (isActive) {
      loop();
    }
    
    return () => {
        clearTimeout(timer);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
  }, [isActive, isProcessing, processFrame]);

  const toggleLive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setDetections([]);
    }
  };

  const hasFire = detections.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center"
    >
      <div className="w-full relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-neutral-900 aspect-video group">
        
        {/* The Real-Time Webcam Feed */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.7} // Lower quality for speed
          onUserMediaError={(err) => console.error("Live Webcam Error:", err)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-20'}`}
          videoConstraints={{ 
            facingMode: "environment",
            width: 1280, // Request higher but let CSS scale it, or keep it medium
            height: 720,
            aspectRatio: 1.777777778
          }}
        />

        {/* Bounding Box Overlay Canvas */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* UI Overlays */}
        {!isActive && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group cursor-pointer" onClick={toggleLive}>
              <Camera className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-neutral-400 font-medium tracking-wider uppercase text-sm">Initialize Live Feed</p>
          </motion.div>
        )}

        {isActive && (
          <>
            {/* HUD Elements */}
            <div className="absolute top-6 left-6 z-30 flex flex-col space-y-2">
              <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-neutral-500'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Stream</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center space-x-2">
                 <RefreshCw className={`w-3 h-3 text-emerald-400 ${isProcessing ? 'animate-spin' : ''}`} />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">RTT: {fps} ms</span>
              </div>
            </div>

            {/* Fire Alert Indicator */}
            {hasFire && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-6 right-6 z-30 flex items-center space-x-3 bg-red-600/90 backdrop-blur-xl border border-red-400/50 px-5 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)]"
              >
                <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
                <span className="text-white font-black uppercase tracking-tighter text-sm">Area Not Secure</span>
              </motion.div>
            )}

            {!hasFire && (
              <div className="absolute top-6 right-6 z-30 flex items-center space-x-3 bg-emerald-600/30 backdrop-blur-md border border-emerald-500/30 px-5 py-2.5 rounded-2xl">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" />
                 <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Area Secure</span>
              </div>
            )}

            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute inset-0 border-[20px] border-black/10"></div>
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-scan"></div>
              
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/30"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/30"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/30"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/30"></div>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center space-x-4">
        <button
          onClick={toggleLive}
          className={`px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center shadow-2xl ${
            isActive 
            ? 'bg-neutral-800 border border-white/10 text-neutral-400 hover:bg-neutral-700' 
            : 'bg-gradient-to-r from-red-600 to-orange-500 text-white hover:scale-105 active:scale-95 shadow-red-500/20'
          }`}
        >
          {isActive ? 'Terminate Stream' : 'Begin Live Surveillance'}
          {!isActive && <Camera className="w-5 h-5 ml-3" />}
        </button>
      </div>
      
      <AnimatePresence>
          {detections.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 w-full grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                {detections.map((det, i) => (
                    <div key={i} className="bg-black/40 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
                        <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-1">Object</p>
                        <p className="text-lg font-bold text-white capitalize">{det.label}</p>
                        <div className="mt-2 w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-red-500 h-full" 
                              style={{ width: `${det.confidence * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
}
