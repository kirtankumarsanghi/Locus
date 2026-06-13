import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center text-sm font-medium text-gray-500 mb-6">
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        // Format the string (capitalize, remove dashes)
        const formattedValue = value
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return (
          <React.Fragment key={to}>
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            {isLast ? (
              <span className="text-gray-900 font-semibold">{formattedValue}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition-colors">
                {formattedValue}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
