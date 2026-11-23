import React, { useState } from 'react';
import { Sparkles, Shield } from 'lucide-react';

export function LogoImage({ type = 'pastoral', className = 'h-10 w-auto', alt }) {
  const [hasError, setHasError] = useState(false);

  const baseUrl = import.meta.env.BASE_URL || './';
  const src =
    type === 'esfer' ? `${baseUrl}assets/logo-esfer.png` : `${baseUrl}assets/logo-pastoral.png`;
  const defaultAlt =
    type === 'esfer' ? 'Colegio ESFER Salesianos' : 'Pastoral ESFER Salesianos';

  if (hasError) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-extrabold tracking-tight ${
          type === 'esfer'
            ? 'bg-pastoral text-white'
            : 'bg-pastoral-cyan/15 text-pastoral-deep border border-pastoral-cyan/30'
        }`}
      >
        {type === 'esfer' ? (
          <Shield className="h-4 w-4 text-pastoral-gold" />
        ) : (
          <Sparkles className="h-4 w-4 text-pastoral-cyan" />
        )}
        <span>{type === 'esfer' ? 'ESFER' : 'PASTORAL'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || defaultAlt}
      className={`${className} object-contain select-none`}
      onError={() => setHasError(true)}
    />
  );
}
