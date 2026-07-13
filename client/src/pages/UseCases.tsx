import React from 'react';

export default function UseCases() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Use Cases</h1>
      <p className="text-lg leading-relaxed text-center max-w-2xl">
        Turbo Response provides versatile AI-powered solutions for a wide range of legal applications,
        empowering legal professionals to achieve greater efficiency and accuracy.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Litigation Support</h2>
          <p>Accelerate discovery, evidence review, and case preparation with intelligent document analysis.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Contract Management</h2>
          <p>Streamline contract review, compliance checks, and clause extraction.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Regulatory Compliance</h2>
          <p>Monitor regulatory changes, assess impact, and ensure adherence across jurisdictions.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Legal Research</h2>
          <p>Conduct comprehensive legal research with AI-powered insights into statutes, case law, and regulations.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Due Diligence</h2>
          <p>Expedite due diligence processes by rapidly analyzing large datasets and identifying critical information.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p>Manage and protect intellectual property with AI-assisted patent and trademark analysis.</p>
        </div>
      </div>
    </div>
  );
}
