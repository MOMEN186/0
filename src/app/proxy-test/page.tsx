// components/proxy-test.tsx
"use client";

import { useState } from "react";
import { getProxyUrl } from "@/utils/video";

export default function ProxyTest() {
  const [testUrl, setTestUrl] = useState("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testProxy = async () => {
    if (!testUrl) return;
    
    setLoading(true);
    try {
      const proxiedUrl = getProxyUrl(testUrl);
      console.log("Testing proxy URL:", proxiedUrl);
      
      const response = await fetch(proxiedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.apple.mpegurl,application/x-mpegurl,application/octet-stream',
        }
      });
      
      if (response.ok) {
        const text = await response.text();
        setResponse(`Success! Status: ${response.status}\n\nResponse:\n${text.substring(0, 500)}...`);
      } else {
        setResponse(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-4">Proxy Test</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test URL:</label>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://lightningspark77.pro/_v7/..."
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={testProxy}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Proxy"}
        </button>
        {response && (
          <div>
            <label className="block text-sm font-medium mb-1">Response:</label>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}