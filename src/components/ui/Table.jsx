import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--card-border-radius)] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className={`w-full border-collapse text-[12.5px] text-left ${className}`} {...props}>
          {children}
        </table>
      </div>
    </div>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-extrabold uppercase tracking-wider text-[9.5px] ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-[var(--color-border)]/40 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr className={`hover:bg-[var(--color-bg-subtle)]/45 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th className={`p-3.5 pl-4 first:pl-4 last:pr-4 ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`p-3.5 pl-4 first:pl-4 last:pr-4 text-[var(--color-text-primary)] align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};

// Object shorthand export for standard dot-notation usage: <Table.Header> etc.
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;
