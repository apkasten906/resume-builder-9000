import React from 'react';
export function Table({
  children,
  className = '',
  tableClassName = '',
}: React.PropsWithChildren<{ className?: string; tableClassName?: string }>): React.ReactElement {
  // `className` is applied to the wrapper (controls overflow behavior)
  // `tableClassName` is applied to the <table> element (layout/truncation)
  return (
    <div className={['overflow-x-auto', className].join(' ')}>
      <table className={[`min-w-full text-sm`, tableClassName].join(' ')}>
        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">{children}</tbody>
      </table>
    </div>
  );
}
export function TRow({ children }: Readonly<React.PropsWithChildren>): React.ReactElement {
  return <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800">{children}</tr>;
}
export function TCell({
  children,
  className = '',
}: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return <td className={['px-3 py-2 align-top', className].join(' ')}>{children}</td>;
}
