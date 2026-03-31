import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { generateEventReport } from '../../api/services/report.service';

export default function GenerateReportButton({ eventId, onReportGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!window.confirm("Gemini will now analyze all approved task images and descriptions to write the final report. Proceed?")) {
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Gemini is looking at task photos and writing recap...');

    try {
      const res = await generateEventReport(eventId);
      toast.success('AI Report Published!', { id: toastId });
      
      if (onReportGenerated) {
        onReportGenerated(res.data?.data || res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isGenerating}
      className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-3xl font-black text-white transition-all duration-500 shadow-xl
        ${isGenerating 
          ? 'bg-slate-800 cursor-not-allowed opacity-80' 
          : 'bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 hover:shadow-purple-200 hover:scale-[1.02] active:scale-95'
        }`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="uppercase tracking-widest text-[10px]">AI is Analyzing Images...</span>
        </>
      ) : (
        <>
          <Wand2 className="h-5 w-5" />
          <span className="uppercase tracking-widest text-[10px]">Finalize with AI</span>
        </>
      )}
    </button>
  );
}