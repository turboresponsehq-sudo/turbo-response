import React from 'react';

export default function Compliance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Compliance</h1>
      <p className="text-lg leading-relaxed text-center max-w-2xl">
        Navigating the ever-changing landscape of legal and regulatory compliance is critical.
        Turbo Response provides AI-powered tools to help legal professionals and organizations
        ensure adherence to complex regulations, mitigate risks, and maintain operational integrity.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Regulatory Monitoring</h2>
          <p>Automated tracking of new laws, amendments, and regulatory guidance across jurisdictions.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Policy Adherence Verification</h2>
          <p>AI-driven analysis to ensure internal policies and procedures align with external regulations.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Risk Assessment & Mitigation</h2>
          <p>Identify potential compliance gaps and receive actionable insights to mitigate risks proactively.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Audit & Reporting Support</h2>
          <p>Streamline audit preparations and generate comprehensive compliance reports with ease.</p>
        </div>
      </div>
    </div>
  );
}
