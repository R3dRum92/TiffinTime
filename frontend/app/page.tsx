import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f9e6] relative overflow-hidden">
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 1440 800"

          preserveAspectRatio="none"
        >
          <path
            d="M 900 0 C 865.3333 30.6667 830.6667 61.3333 842 224 C 891 386 974 255 1044 400 Q 1082 449 1077 531 C 1073 587 1115 601 1174 640 C 1260 720 1287 680 1371 712 C 1449 741 1440 640 1440 600 L 1440 0 Z"
            fill="url(#foodfunGradient)"
          />
          <defs>
            <linearGradient id="foodfunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffc867" />
              <stop offset="100%" stopColor="#D98324" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Content - Two Columns */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 px-2 py-12 max-w-7xl mx-auto items-center min-h-screen">

        {/* Left Column - Content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl darktext lg:text-6xl font-bold text-gray-800 leading-tight">
              Order Your Favourite<br />
              <span className="darktext">Food Easily</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-md">
              We deliver 100% organic and fresh food. You can order right now!
            </p>

            <button className="px-8 py-4 bgtheme text-gray-800 rounded-full font-semibold hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
              <span>Our Menu</span>
              <span className="ml-2">→</span>
            </button>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className="flex items-start space-x-2">
              <div className="p-2 bglight rounded-lg shadow-md">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Select your favourite</h3>
                <p className="text-gray-600 text-sm">food and order</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bglight rounded-lg shadow-md">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Select your receiving</h3>
                <p className="text-gray-600 text-sm">place</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bglight rounded-lg shadow-md">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Get your food within</h3>
                <p className="text-gray-600 text-sm">01 - 02 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Image Placeholder */}
        <div className="relative flex justify-center lg:justify-end">



          <Image
            src="/resources/vaat1.png"
            alt="Delicious food"
            width={700}
            height={700}

          />

        </div>
      </div>
    </div>
  )
}