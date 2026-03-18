import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl shadow-green-100/50 border border-green-50 max-w-md w-full">
        <h1 className="text-4xl font-black text-green-700 mb-4 tracking-tight">
          AgriConnect
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your modern agricultural platform is ready for development.
        </p>
        <div className="flex flex-col gap-3">
          <div className="py-3 px-4 bg-green-50 text-green-700 rounded-lg font-medium text-sm">
            React 19 + Vite 8
          </div>
          <div className="py-3 px-4 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm">
            Tailwind CSS v4
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
