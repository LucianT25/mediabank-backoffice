import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useMemo } from "react";

interface PaginationProps {
  pageSize: string;
  setPageSize: (value: string) => void;
  page: string;
  setPage: (value: string) => void;
  pageCount: number;
}

export function Pagination({
  pageSize,
  setPageSize,
  page,
  setPage,
  pageCount,
}: PaginationProps) {
  const canNext = useMemo(() => +page + 1 <= pageCount, [page, pageCount]);
  const canPrev = useMemo(() => +page - 1 > 0, [page]);

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div>
        <Select
          onValueChange={(value) => setPageSize(value)}
          defaultValue={pageSize}
        >
          <SelectTrigger className="flex-1 text-sm text-muted-foreground">
            <SelectValue placeholder="Please select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(+page - 1 + "")}
          disabled={!canPrev}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(+page + 1 + "")}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
