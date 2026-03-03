import clsx from 'clsx';

export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow p-6 ${className}`}
    >
      {children}
    </div>
  );
}
