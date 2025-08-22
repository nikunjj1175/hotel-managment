import Layout from '../components/Layout';

export default function HoverTestPage() {
  return (
    <Layout title="Hover Test - Fixed Navigation">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Test Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">✅ Hover Issue Fixed!</h2>
          <ul className="space-y-2 text-green-800">
            <li>• <strong>Individual Hover Effects:</strong> Each navigation item now has isolated hover effects</li>
            <li>• <strong>Single Underline:</strong> Only the hovered item shows the gradient underline</li>
            <li>• <strong>No Cross-Contamination:</strong> Hovering one item doesn't affect others</li>
            <li>• <strong>Smooth Animations:</strong> 300ms transitions for all hover effects</li>
          </ul>
        </div>

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">🔧 How It Works</h2>
          <div className="space-y-3 text-blue-800">
            <div>
              <h3 className="font-semibold">1. State Management</h3>
              <p className="text-sm">Added <code>hoveredItem</code> state to track which item is currently hovered</p>
            </div>
            <div>
              <h3 className="font-semibold">2. Individual Event Handlers</h3>
              <p className="text-sm">Each navigation item has its own <code>onMouseEnter</code> and <code>onMouseLeave</code> handlers</p>
            </div>
            <div>
              <h3 className="font-semibold">3. Isolated Effects</h3>
              <p className="text-sm">Hover effects only apply to the specific item being hovered, not to all items</p>
            </div>
            <div>
              <h3 className="font-semibold">4. CSS Isolation</h3>
              <p className="text-sm">Added <code>isolation: isolate</code> to prevent hover effects from bleeding into other items</p>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">🧪 Test Instructions</h2>
          <div className="space-y-3 text-yellow-800">
            <p><strong>1. Hover Test:</strong></p>
            <ul className="ml-6 space-y-1 text-sm">
              <li>• Move your cursor over different navigation items</li>
              <li>• Notice that only ONE item shows the gradient underline at a time</li>
              <li>• The underline should smoothly appear and disappear</li>
              <li>• Other items should remain unaffected</li>
            </ul>
            
            <p className="mt-4"><strong>2. Active State Test:</strong></p>
            <ul className="ml-6 space-y-1 text-sm">
              <li>• Navigate to different pages</li>
              <li>• The active page should show a persistent underline with glow</li>
              <li>• Hovering over other items should still work independently</li>
            </ul>
          </div>
        </div>

        {/* Code Changes */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-purple-900 mb-4">💻 Code Changes Made</h2>
          <div className="space-y-3 text-purple-800 text-sm">
            <div>
              <h3 className="font-semibold">Added State:</h3>
              <code className="bg-purple-100 px-2 py-1 rounded">const [hoveredItem, setHoveredItem] = useState&lt;string | null&gt;(null);</code>
            </div>
            <div>
              <h3 className="font-semibold">Event Handlers:</h3>
              <code className="bg-purple-100 px-2 py-1 rounded">{'onMouseEnter={() => setHoveredItem(l.href)}'}</code><br/>
              <code className="bg-purple-100 px-2 py-1 rounded">{'onMouseLeave={() => setHoveredItem(null)}'}</code>
            </div>
            <div>
              <h3 className="font-semibold">Hover Logic:</h3>
              <code className="bg-purple-100 px-2 py-1 rounded">const isHovered = hoveredItem === l.href;</code>
            </div>
            <div>
              <h3 className="font-semibold">Conditional Effects:</h3>
              <code className="bg-purple-100 px-2 py-1 rounded">{'{!active && isHovered && (...) }'}</code>
            </div>
          </div>
        </div>

        {/* Expected Behavior */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-indigo-900 mb-4">🎯 Expected Behavior</h2>
          <div className="space-y-2 text-indigo-800 text-sm">
            <p><strong>• Hover Effect:</strong> Only the hovered item shows underline + glow + shimmer</p>
            <p><strong>• Active State:</strong> Active item shows persistent underline with glow</p>
            <p><strong>• No Interference:</strong> Hovering one item doesn't affect others</p>
            <p><strong>• Smooth Transitions:</strong> All effects animate smoothly (300ms)</p>
            <p><strong>• Mobile Compatible:</strong> Left border effects work on mobile</p>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">🔍 If Issues Persist</h2>
          <div className="space-y-2 text-red-800 text-sm">
            <p><strong>1. Clear Browser Cache:</strong> Hard refresh (Ctrl+F5) to clear any cached CSS</p>
            <p><strong>2. Check Console:</strong> Look for any JavaScript errors in browser console</p>
            <p><strong>3. Test Different Browsers:</strong> Try Chrome, Firefox, or Edge</p>
            <p><strong>4. Disable Extensions:</strong> Some browser extensions can interfere with CSS</p>
            <p><strong>5. Check Network:</strong> Ensure all CSS files are loading properly</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
