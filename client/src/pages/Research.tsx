import React from 'react';

export default function Research() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Research</h1>
      <p className="text-lg leading-relaxed text-center max-w-2xl">
        Turbo Response revolutionizes legal research by leveraging advanced AI to delve into vast legal databases,
        statutes, case law, and regulatory documents. Our platform provides comprehensive, accurate, and timely insights
        to support your legal strategies.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">AI-Powered Legal Search</h2>
          <p>Intelligent search capabilities that go beyond keywords to understand context and intent.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Regulatory Analysis</h2>
          <p>Automated analysis of regulatory changes and their potential impact on your cases or clients.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Case Law & Precedent Mapping</h2>
          <p>Identify relevant case law and map precedents to strengthen your legal arguments.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Jurisdictional Insights</h2>
          <p>Gain deep insights into legal nuances and trends across different jurisdictions.</p>
        </div>
      </div>
    </div>
  );
}
