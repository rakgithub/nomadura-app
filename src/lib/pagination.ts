export function paginateArray<T>(
  array: T[],
  page: number,
  itemsPerPage: number
): T[] {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return array.slice(startIndex, endIndex);
}

export function getTotalPages(totalItems: number, itemsPerPage: number): number {
  return Math.ceil(totalItems / itemsPerPage);
}
