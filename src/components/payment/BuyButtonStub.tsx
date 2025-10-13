'use client';
import React from 'react';

type Props = {
  label?: string;
  className?: string;
};

export default function BuyButtonStub({ label = 'اشترِ الآن', className = '' }: Props) {
  return (
    <button
      type="button"
      aria-disabled="true"
      onClick={(e) => { e.preventDefault(); /* لا تفعل شيئًا */ }}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium 
                  border border-gray-300 bg-gray-100 text-gray-700 opacity-70 cursor-not-allowed 
                  pointer-events-none select-none ${className}`}
      title="الدفع غير مفعّل حالياً"
    >
      {label}
    </button>
  );
}