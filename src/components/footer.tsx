export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 py-12 sticky top-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-bold text-white">
                もくもくReact
              </span>
            </div>
            <div className="text-slate-400">
              © {new Date().getFullYear()}. Created by @handle.
            </div>
          </div>
        </div>
      </footer>
  )
}