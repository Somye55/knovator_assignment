import Link from 'next/link';

interface BookingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkHref: string;
  buttonText: string;
  buttonColor: string;
  iconBgColor?: string;
  iconHoverBgColor?: string;
}

export default function BookingCard({
  title,
  description,
  icon,
  linkHref,
  buttonText,
  buttonColor,
  iconBgColor = 'bg-blue-100',
  iconHoverBgColor = 'group-hover:bg-blue-200'
}: BookingCardProps) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <Link
      href={linkHref}
      className={`group block bg-white rounded-2xl shadow-xl p-10 h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100`}
    >
      <div className="text-center flex flex-col h-full justify-between">
        <div className={`w-20 h-20 ${iconColorClasses[buttonColor as keyof typeof iconColorClasses]} ${iconBgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 ${iconHoverBgColor} transition-all duration-300`}>
          {icon}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">{description}</p>
        <div className={`${colorClasses[buttonColor as keyof typeof colorClasses]} text-white px-8 py-4 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105`}>
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{buttonText}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}