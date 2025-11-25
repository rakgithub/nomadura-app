# Modal and Pagination Implementation Guide

This document explains the modal and pagination changes implemented across the application.

## ✅ Completed Changes

### 1. Trip Modal
- **File**: `src/components/trips/trip-modal.tsx`
- **What**: Created modal wrapper for trip form
- **Usage**: Opens when clicking "New Trip" button
- **Benefits**: Cleaner UI, doesn't take up page space

### 2. Destination Modal
- **File**: `src/components/destinations/destination-modal.tsx`
- **What**: Created modal for adding destinations
- **Usage**: Opens when clicking "New Destination" button
- **Benefits**: Consistent with trip creation, cleaner UI

### 3. Business Expense Modal
- **File**: `src/components/business-expenses/business-expense-modal.tsx`
- **What**: Created modal for adding business expenses
- **Usage**: Opens when clicking "New Business Expense" button
- **Benefits**: Consistent UI pattern across all forms, cleaner page layout

### 4. Pagination Component
- **File**: `src/components/ui/pagination.tsx`
- **What**: Reusable pagination component
- **Features**:
  - Previous/Next buttons
  - Page numbers with ellipsis
  - Shows "X to Y of Z items"
  - Smart page number display (shows first, last, current ± 1)

### 5. Pagination Utilities
- **File**: `src/lib/pagination.ts`
- **Functions**:
  - `paginateArray()` - Slices array for current page
  - `getTotalPages()` - Calculates total pages

### 6. Trips List with Pagination
- **File**: `src/app/(dashboard)/trips/page.tsx`
- **What**: Added pagination to trips list
- **Items per page**: 10
- **Features**:
  - Resets to page 1 when changing filters
  - Shows pagination only if more than 10 trips

### 7. Destinations List with Pagination
- **File**: `src/components/destinations/destination-list.tsx`
- **What**: Added pagination to destinations list
- **Items per page**: 10

### 8. Business Expenses List with Pagination
- **File**: `src/components/business-expenses/business-expense-list.tsx`
- **What**: Added pagination to business expenses list
- **Items per page**: 10

### 9. Withdrawals List with Pagination
- **File**: `src/app/(dashboard)/withdrawals/page.tsx`
- **What**: Added pagination to withdrawals list
- **Items per page**: 10

---

## 📋 How to Add Pagination to Other Lists

Follow these steps to add pagination to any list component:

### Step 1: Import Pagination Components

```typescript
import { Pagination } from "@/components/ui/pagination";
import { paginateArray, getTotalPages } from "@/lib/pagination";
```

### Step 2: Add Pagination State

```typescript
const ITEMS_PER_PAGE = 10; // Adjust as needed

export function YourListComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: items } = useYourDataHook();

  // Paginate items
  const paginatedItems = items
    ? paginateArray(items, currentPage, ITEMS_PER_PAGE)
    : [];
  const totalPages = items
    ? getTotalPages(items.length, ITEMS_PER_PAGE)
    : 0;
```

### Step 3: Render Paginated Data

```typescript
  return (
    <>
      {/* Your list */}
      <div>
        {paginatedItems.map(item => (
          <YourItemComponent key={item.id} item={item} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={items?.length || 0}
      />
    </>
  );
```

---

## 🎯 Items Per Page

| Component | Items Per Page |
|-----------|----------------|
| Trips | 10 |
| Destinations | 10 |
| Business Expenses | 10 |
| Withdrawals | 10 |
| Participants | 10 |
| Payments | 10 |

All pagination views are standardized to show 10 items per page.

---

## 🚀 Benefits

1. **Performance**: Only renders items for current page
2. **UX**: Easier to navigate large datasets
3. **Scalability**: Ready for future growth
4. **Consistency**: Same pagination UI across all pages

---

## 💡 Tips

- **Auto-hide**: Pagination component hides if `totalPages <= 1`
- **Filter Reset**: Reset to page 1 when applying filters
- **Responsive**: Pagination works on mobile with smaller buttons
- **Accessibility**: Previous/Next buttons disable appropriately

---

## ✨ Future Enhancements

Consider adding:
- Items per page selector (10, 25, 50, 100)
- Jump to page input field
- "Show all" option for small datasets
- Remember last page in localStorage
- Virtual scrolling for very large lists
