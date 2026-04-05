import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="sticky bottom-0 border-t border-slate-200 bg-white py-6 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-3 md:gap-4 md:flex-row md:justify-between">
          <p className="text-xs md:text-sm text-slate-600 text-center">
            &copy; {currentYear} CarePlus &bull; Healthcare Appointment
            <br className="hidden sm:block" /> Management &bull; Created by Udit
            Aswal
          </p>
          <div className="flex gap-6">
            <Link
              href="https://portfolio-uditaswal.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs md:text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Portfolio
            </Link>
            <Link
              href="https://github.com/uditaswal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs md:text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
