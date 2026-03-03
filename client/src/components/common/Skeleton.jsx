import clsx from 'clsx';

export default function Skeleton({ className }) {
  return (
    <div className={clsx('animate-pulse bg-gray-200 rounded', className)} />
  );
}
