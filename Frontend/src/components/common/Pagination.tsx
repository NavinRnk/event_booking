import Button from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  page,
  totalPages,
  total,
  itemLabel = 'items',
  onPageChange,
}: PaginationProps) => {
  return (
    <div className="pagination">
      <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>

      <span className="pagination__info">
        Page {page} of {totalPages} ({total} {itemLabel})
      </span>

      <Button
        size="sm"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
