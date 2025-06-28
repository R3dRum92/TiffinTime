// app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f7f9e6] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-32 h-32 bg-orange-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-yellow-200 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-orange-300 rounded-full opacity-25"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
              About <span className="text-orange-500">FoodFun</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Were passionate about delivering fresh, organic, and delicious food right to your doorstep. 
              Our mission is to make healthy eating convenient and enjoyable for everyone.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            
            {/* Our Story */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed">
                Founded in 2020, FoodFun started with a simple belief: everyone deserves access to fresh, 
                healthy, and delicious food without the hassle of grocery shopping and meal preparation.
              </p>
              <p className="text-gray-600 leading-relaxed">
                What began as a small local delivery service has grown into a trusted platform serving 
                thousands of customers daily. We partner with local farms and trusted suppliers to ensure 
                that every meal we deliver meets our high standards for quality and freshness.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, were proud to be your go-to solution for convenient, healthy eating that fits 
                seamlessly into your busy lifestyle.
              </p>
            </div>

            {/* Image Placeholder */}
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-gray-600">Fresh Food Preparation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Quality */}
              <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Quality First</h3>
                <p className="text-gray-600">
                  We source only the finest ingredients from trusted suppliers and local farms, 
                  ensuring every meal meets our rigorous quality standards.
                </p>
              </div>

              {/* Freshness */}
              <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Farm Fresh</h3>
                <p className="text-gray-600">
                  Our commitment to freshness means your food is prepared and delivered the same day, 
                  maintaining maximum nutritional value and taste.
                </p>
              </div>

              {/* Convenience */}
              <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Delivery</h3>
                <p className="text-gray-600">
                  We understand your time is valuable. Thas why we guarantee delivery within 
                  1-2 hours, bringing convenience right to your door.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-20">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">50K+</div>
                <p className="text-gray-600">Happy Customers</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">200K+</div>
                <p className="text-gray-600">Orders Delivered</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">100+</div>
                <p className="text-gray-600">Partner Restaurants</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">15+</div>
                <p className="text-gray-600">Cities Served</p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              Behind FoodFun is a dedicated team of food enthusiasts, tech experts, and customer service 
              professionals working together to bring you the best food delivery experience.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👨‍🍳</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chef Marcus</h3>
                <p className="text-gray-600">Head of Culinary</p>
              </div>

              {/* Team Member 2 */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-200 to-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👩‍💼</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Sarah Johnson</h3>
                <p className="text-gray-600">Operations Manager</p>
              </div>

              {/* Team Member 3 */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👨‍💻</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Alex Chen</h3>
                <p className="text-gray-600">Tech Lead</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience FoodFun?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied customers who trust us with their daily meals.
            </p>
            <button className="bg-white text-orange-500 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors">
              Order Now
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}