import { 
  Mail, 
  Linkedin, 
  Instagram, 
  ShieldCheck,
  Lock,
  FileCheck,
  Award
} from 'lucide-react';
export default function Footer() {
  return (
    <footer className="bg-[#f4f4f5] dark:bg-gray-800 pt-6 pb-4 mt-auto border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION 1: Contact & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-4 border-b border-gray-300 dark:border-gray-600 gap-4">
          <a 
            href="mailto:singhsourav090305@gmail.com" 
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
          >
            <Mail className="h-4 w-4 mr-2" />
            singhsourav090305@gmail.com
          </a>
          
          <div className="flex items-center gap-4">
            <a href="#" className="text-blue-700 dark:text-blue-500 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* SECTION 2: Trust Badges */}
        <div className="py-5 border-b border-gray-300 dark:border-gray-600 text-center">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">
            Choose Privacy. Choose PlannEx.
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {/* Simulated Certification Badges using Lucide Icons */}
            <div className="flex flex-col items-center justify-center p-1.5 border-2 border-gray-800 dark:border-gray-200 rounded-full h-12 w-12 bg-white dark:bg-gray-700">
              <ShieldCheck className="h-4 w-4 text-gray-800 dark:text-gray-200 mb-0.5" />
              <span className="text-[6px] font-bold leading-tight text-gray-800 dark:text-gray-200">ISO 27001</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 border-2 border-gray-800 dark:border-gray-200 rounded-full h-12 w-12 bg-white dark:bg-gray-700">
              <Lock className="h-4 w-4 text-gray-800 dark:text-gray-200 mb-0.5" />
              <span className="text-[6px] font-bold leading-tight text-gray-800 dark:text-gray-200">GDPR</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 border-2 border-blue-700 dark:border-blue-500 rounded-full h-12 w-12 bg-blue-700 dark:bg-blue-600 text-white">
              <FileCheck className="h-4 w-4 mb-0.5" />
              <span className="text-[6px] font-bold leading-tight">SOC 2</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 border-2 border-indigo-800 dark:border-indigo-500 rounded-full h-12 w-12 bg-indigo-800 dark:bg-indigo-600 text-white">
              <Award className="h-4 w-4 mb-0.5" />
              <span className="text-[6px] font-bold leading-tight">HIPAA</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Copyright */}
        <div className="pt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            © 2026, PlannEx EMS. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}