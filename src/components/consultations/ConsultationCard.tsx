'use client';

import { Consultation } from '@/types/booking';
import { VideoCameraIcon, PhoneIcon, UserGroupIcon, ClockIcon, CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline';

interface ConsultationCardProps {
  consultation: Consultation;
  onClick: () => void;
}

export default function ConsultationCard({ consultation, onClick }: ConsultationCardProps) {
  // Helper function to get the appropriate icon based on consultation type
  const getTypeIcon = () => {
    switch (consultation.type) {
      case 'video':
        return <VideoCameraIcon className="h-5 w-5 text-primary" />;
      case 'audio':
        return <PhoneIcon className="h-5 w-5 text-primary" />;
      case 'in-person':
        return <UserGroupIcon className="h-5 w-5 text-primary" />;
      default:
        return <VideoCameraIcon className="h-5 w-5 text-primary" />;
    }
  };

  // Helper function to get the type label in Arabic
  const getTypeLabel = () => {
    switch (consultation.type) {
      case 'video':
        return 'استشارة مرئية';
      case 'audio':
        return 'استشارة صوتية';
      case 'in-person':
        return 'استشارة شخصية';
      default:
        return 'استشارة';
    }
  };

  // Helper function to format currency
  const formatCurrency = () => {
    switch (consultation.currency) {
      case 'USD':
        return `$${consultation.price}`;
      case 'SAR':
        return `${consultation.price} ر.س`;
      case 'EGP':
        return `${consultation.price} ج.م`;
      default:
        return `${consultation.price}`;
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          {getTypeIcon()}
          <span className="mr-2 text-sm text-gray-600">{getTypeLabel()}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{consultation.title}</h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{consultation.description}</p>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-500 ml-2" />
            <span className="text-sm text-gray-600">{consultation.duration} دقيقة</span>
          </div>
          
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 text-gray-500 ml-2" />
            <span className="text-sm text-gray-600">{formatCurrency()}</span>
          </div>
          
          {consultation.tags && consultation.tags.length > 0 && (
            <div className="flex items-center">
              <TagIcon className="h-5 w-5 text-gray-500 ml-2" />
              <div className="flex flex-wrap">
                {consultation.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-1 mb-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-primary text-white py-3 px-6 text-center">
        <button className="font-semibold">احجز الآن</button>
      </div>
    </div>
  );
}