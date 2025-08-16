import React from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';

interface BackButtonProps {
  label: string;
  href: string;
  icon?: IconType | any;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  backButton?: BackButtonProps;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backButton,
  actions,
}) => {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          {backButton && (
            <Link
              href={backButton.href}
              className="mb-4 inline-flex items-center gap-x-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rtl:flex-row-reverse"
            >
              {backButton.icon && <backButton.icon className="h-4 w-4" />}
              {backButton.label}
            </Link>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="mt-4 sm:mt-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;