'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    // Add API call here for registration
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-2xl font-bold text-gray-900">Create your account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              id="first_name"
              type="text"
              value={form.first_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              id="last_name"
              type="text"
              value={form.last_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            id="phone_number"
            type="tel"
            maxLength={10}
            pattern="[0-9]{10,11}"
            value={form.phone_number}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="relative">
  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
  <input
    id="password"
    type={showPassword ? 'text' : 'password'}
    value={form.password}
    onChange={handleChange}
    required
    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
  />
  <div
    className="absolute inset-y-0 right-3 top-[38px] flex items-center cursor-pointer"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </div>
</div>

<div className="relative">
  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
  <input
    id="confirm_password"
    type={showConfirmPassword ? 'text' : 'password'}
    value={form.confirm_password}
    onChange={handleChange}
    required
    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
  />
  <div
    className="absolute inset-y-0 right-3 top-[38px] flex items-center cursor-pointer"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </div>
</div>

        <button
          type="submit"
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-md"
        >
          Register
        </button>

        
      </form>
    </div>
  );
};

export default RegisterPage;
