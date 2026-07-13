import React from 'react';

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <p className="text-lg leading-relaxed text-center max-w-2xl mb-8">
        Have questions about Turbo Response or need assistance? Reach out to our team.
      </p>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@example.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your message..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Send Message
          </button>
        </form>
      </div>
      <p className="mt-8 text-gray-400">
        Alternatively, email us directly at <a href="mailto:support@turboresponsehq.ai" className="text-blue-400 hover:underline">support@turboresponsehq.ai</a>
      </p>
    </div>
  );
}
