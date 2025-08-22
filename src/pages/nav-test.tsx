import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function NavTestPage() {
  const router = useRouter();
  
  return (
    <Layout title="Navigation Test - New Design">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Current Route Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Current Navigation State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Current Path:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{router.pathname}</code></div>
            <div><strong>Current Route:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{router.route}</code></div>
            <div><strong>Query:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{JSON.stringify(router.query)}</code></div>
          </div>
        </div>

        {/* New Navigation Features */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">✨ New Navigation Features</h2>
          <ul className="space-y-2 text-green-800">
            <li>• <strong>Gradient Underlines:</strong> Smooth cyan → blue → purple gradient underlines</li>
            <li>• <strong>Hover Effects:</strong> Sliding underline animation from left to right (300ms)</li>
            <li>• <strong>Active States:</strong> Persistent gradient underline with glowing shadow</li>
            <li>• <strong>Font Weight:</strong> Increases to semibold on hover and active states</li>
            <li>• <strong>Soft Glow:</strong> Subtle text shadow effects on hover and active</li>
            <li>• <strong>Mobile Design:</strong> Left-side gradient border instead of underline</li>
          </ul>
        </div>

        {/* Test Navigation */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">🧪 Test Navigation</h2>
          <p className="text-yellow-800 mb-4">
            Navigate between these pages to see the new navigation effects:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <a 
              href="/admin" 
              className="block p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              Dashboard
            </a>
            <a 
              href="/admin/tables" 
              className="block p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              Tables
            </a>
            <a 
              href="/admin/menu" 
              className="block p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              Menu
            </a>
            <a 
              href="/kitchen" 
              className="block p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              Kitchen
            </a>
            <a 
              href="/delivery" 
              className="block p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              Delivery
            </a>
            <a 
              href="/super-admin" 
              className="block p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              Users
            </a>
          </div>
        </div>

        {/* What's New */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-purple-900 mb-4">🆕 What's New</h2>
          <div className="space-y-3 text-purple-800">
            <div>
              <h3 className="font-semibold">1. Gradient Underlines</h3>
              <p className="text-sm">Beautiful cyan → blue → purple gradient underlines with smooth animations</p>
            </div>
            <div>
              <h3 className="font-semibold">2. Enhanced Hover Effects</h3>
              <p className="text-sm">Sliding underline animation, font weight increase, and soft glow effects</p>
            </div>
            <div>
              <h3 className="font-semibold">3. Improved Active States</h3>
              <p className="text-sm">Persistent gradient underlines with glowing shadows and subtle backgrounds</p>
            </div>
            <div>
              <h3 className="font-semibold">4. Mobile Optimizations</h3>
              <p className="text-sm">Left-side gradient borders for mobile drawer navigation</p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-indigo-900 mb-4">⚙️ Technical Details</h2>
          <div className="space-y-2 text-indigo-800 text-sm">
            <p><strong>• Hover Animation:</strong> 300ms cubic-bezier easing for smooth underline reveal</p>
            <p><strong>• Active State:</strong> 500ms transition for background and glow effects</p>
            <p><strong>• Underline Height:</strong> 2px with rounded edges for premium look</p>
            <p><strong>• Gradient Colors:</strong> Cyan (#06b6d4) → Blue (#3b82f6) → Purple (#8b5cf6)</p>
            <p><strong>• Shadow Effects:</strong> Custom box-shadow with rgba(34, 211, 238, 0.5) glow</p>
            <p><strong>• Responsive:</strong> Different effects for desktop (underline) vs mobile (left border)</p>
          </div>
        </div>

        {/* CSS Classes Used */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎨 CSS Classes Used</h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p><strong>• Tailwind:</strong> transition-all, duration-300, origin-left, scale-x-0, scale-x-100</p>
            <p><strong>• Custom Gradients:</strong> from-cyan-400 via-blue-500 to-purple-600</p>
            <p><strong>• Shadows:</strong> shadow-[0_0_10px_rgba(34,211,238,0.5)] for custom glow</p>
            <p><strong>• Animations:</strong> group-hover:scale-x-100 for smooth underline reveal</p>
            <p><strong>• Responsive:</strong> Different mobile styles with left border approach</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
