import { useState } from 'react'
import warekLogo from '../assets/warek.png'

function Intro({ onStart }) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo */}
        <div className="intro-logo-container">
          <img
            src={warekLogo}
            alt="WaRek"
            className="intro-logo w-48 h-48 sm:w-56 sm:h-56 object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="intro-title text-4xl sm:text-5xl font-bold text-gray-900">
            WaRek
          </h1>
          <p className="intro-subtitle text-lg sm:text-xl text-gray-600 font-light">
            Smart Financial Management
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="intro-button mt-8 px-8 py-3 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          Get Started
        </button>

        {/* Scroll hint */}
        <div className="intro-scroll-hint mt-16 text-center text-gray-500 text-sm opacity-60">
          {/* Animated scroll indicator */}
          <svg
            className="w-6 h-6 mx-auto animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Intro
