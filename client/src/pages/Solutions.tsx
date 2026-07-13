import React from 'react';

export default function Solutions() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Solutions</h1>
      <p className="text-lg leading-relaxed text-center max-w-2xl">
        Turbo Response offers a suite of AI-powered solutions designed to streamline legal operations,
        enhance research capabilities, and ensure robust compliance for legal professionals and organizations.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Document Intelligence</h2>
          <p>Automate the analysis, extraction, and organization of legal documents.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Regulatory Compliance</h2>
          <p>Stay ahead of evolving regulations with AI-driven monitoring and analysis.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Case Building & Strategy</h2>
          <p>Develop stronger cases with intelligent research and evidence organization.</p>
        </div>
      </div>
    </div>
  );
}
