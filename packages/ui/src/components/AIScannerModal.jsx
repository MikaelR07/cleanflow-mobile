/**
 * AIScannerModal — Agent tool for asset verification and grading
 */
import { supabase } from '@cleanflow/core';
import AssetBadge from './AssetBadge.jsx';

export default function AIScannerModal({ isOpen, onClose, onVerify, booking }) {
  const [step, setStep] = useState('camera'); // camera, scanning, result, summary
  const [grade, setGrade] = useState(null);
  const [material, setMaterial] = useState(booking?.wasteType || 'PET');
  const [weight, setWeight] = useState(booking?.bags * 5 || 10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const startScan = async () => {
    if (!photoFile) {
      alert("Please capture a photo first!");
      return;
    }

    setStep('scanning');
    
    try {
      // 1. Upload to Supabase Storage
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${booking.id}-${Math.random()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      const { data, error } = await supabase.storage
        .from('assets-verified')
        .upload(filePath, photoFile);

      if (error) throw error;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets-verified')
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrl);

      // 3. Fake AI Analysis delay
      setTimeout(() => {
        setGrade(['A', 'B', 'C'][Math.floor(Math.random() * 3)]);
        setStep('result');
      }, 2000);

    } catch (err) {
      console.error('Upload failed', err);
      alert("Photo upload failed. Please try again.");
      setStep('camera');
    }
  };

  const handleVerify = async () => {
    setIsProcessing(true);
    try {
      await onVerify({
        grade,
        materialType: material.toUpperCase(),
        weightKg: Number(weight),
        photoUrl: photoUrl, // Linked to the DB
        purityScore: grade === 'A' ? 98 : grade === 'B' ? 85 : 65
      });
      setStep('summary');
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">Asset Verification</h3>
              <p className="text-[10px] text-slate-500 font-bold">HygeneX AI Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'camera' && (
            <div className="space-y-6">
              <div className="aspect-[4/3] bg-slate-900 rounded-3xl flex flex-col items-center justify-center border-2 border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-40 pointer-events-none">
                      {/* HUD Overlays */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary" />
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary" />
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary" />
                    </div>
                    <Camera className="w-12 h-12 text-primary/40 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] text-primary/60 font-black uppercase tracking-[0.2em] mt-4">Scanner Ready</p>
                  </>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
              </div>

              <button 
                onClick={startScan}
                disabled={!photoFile}
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
              >
                <Sparkles className="w-5 h-5" />
                {photoFile ? 'Start AI Grading' : 'Capture Material First'}
              </button>
            </div>
          )}

          {step === 'scanning' && (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                   <div className="text-[10px] font-black">AI</div>
                </div>
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">Analyzing Purity...</h4>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Checking contamination levels</p>
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">AI Result</span>
                  <AssetBadge grade={grade} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Official Weight (KG)</label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <input 
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Material</label>
                    <select 
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="PET">PET Plastic</option>
                      <option value="HDPE">HDPE Plastic</option>
                      <option value="Paper">Paper</option>
                      <option value="Metal">Metal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Estimated Network Value</p>
                 <p className="text-2xl font-black text-emerald-600">KSh {(weight * 45 * (grade === 'A' ? 1.2 : grade === 'B' ? 1.0 : 0.7)).toLocaleString()}</p>
              </div>

              <button 
                onClick={handleVerify}
                disabled={isProcessing}
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Confirm & Seal Asset
              </button>
            </div>
          )}

          {step === 'summary' && (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 animate-in zoom-in shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">Asset Sealed!</h4>
                <p className="text-xs text-slate-500 mt-2 px-8">The digital twin has been created. Informal Weavers in this sector have been notified.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Close Scanner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
