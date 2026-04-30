import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, X } from 'lucide-react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';

export default function Upload({ onImageSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);
  const webcamRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const captureWebcam = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setPreview(imageSrc);
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'webcam-snapshot.jpg', { type: 'image/jpeg' });
          onImageSelect(file);
          setUseWebcam(false);
        });
    }
  }, [onImageSelect]);

  const clearSelection = () => {
    setPreview(null);
    onImageSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto rounded-3xl p-6 glass-card relative overflow-hidden"
    >
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-neutral-900/80 backdrop-blur border border-white/10 p-1 rounded-2xl flex w-full max-w-xs justify-between mx-auto shadow-inner shadow-black/50">
          <button
            onClick={() => setUseWebcam(false)}
            className={`flex-1 flex justify-center items-center py-2.5 rounded-xl font-medium transition-all duration-300 ${!useWebcam ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/20' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
          >
            <ImageIcon className="w-4 h-4 mr-2" /> Upload
          </button>
          <button
            onClick={() => setUseWebcam(true)}
            className={`flex-1 flex justify-center items-center py-2.5 rounded-xl font-medium transition-all duration-300 ${useWebcam ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/20' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
          >
            <Camera className="w-4 h-4 mr-2" /> Webcam
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!useWebcam ? (
          preview ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50"
            >
              <img src={preview} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
              <button
                onClick={clearSelection}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500 text-white rounded-full transition-all backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="dropzone"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive ? 'border-red-500 bg-red-500/10' : 'border-neutral-700 hover:border-red-500/50 bg-neutral-900/50'
              }`}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`p-5 rounded-full ${dragActive ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-neutral-800 text-neutral-400'} transition-all duration-500`}>
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-neutral-200">
                    Drag & Drop your frame here
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Supports JPG, PNG, WEBP
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="mt-6 px-8 py-3 bg-white/10 border border-white/10 text-white font-medium rounded-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Browse Files
                </button>
              </div>
            </motion.form>
          )
        ) : (
          <motion.div 
            key="webcam"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl w-full max-w-lg bg-black/50">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full object-cover"
                onUserMediaError={(err) => console.error("Webcam Access Error:", err)}
                videoConstraints={{ 
                  facingMode: { ideal: "environment" },
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }}
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-red-500/20 rounded-2xl"></div>
            </div>
            <button
              onClick={captureWebcam}
              className="mt-8 flex items-center px-10 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:shadow-[0_0_60px_rgba(239,68,68,0.6)] hover:-translate-y-1 transition-all"
            >
              <Camera className="w-5 h-5 mr-3" /> Capture Frame
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
