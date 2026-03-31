# Bus Agency Management System - Fix According to Scope
## Approved Plan Implementation Steps

## ✅ Completed
- [x] Create TODO.md with breakdown
- [x] Read & analyze src/app/admin/analytics/page.tsx (Already uses Recharts + /api/admin/analytics with DB views ✓ No changes needed)

## 🔄 In Progress

## ⏳ Pending
1. [x] Enhance /dashboard/bookings: Complete - cancellation UI/API, MUI ToggleButtonGroup filters (server-side in api.ts), time-to-departure color coding

2. [ ] Verify Supabase RLS policies work (test via Supabase dashboard or queries)

3. [x] Skip Socket.IO (no dep needed, Supabase realtime sufficient as per scope)
4. [ ] Expand src/lib/seed.ts: Add staff, more routes/trips, coupons, sample bookings
5. [x] Create src/components/ui/TicketQR.tsx reusable component ✓

6. [ ] Test realtime booking: Multi-tab /book/[id] concurrent seats
7. [ ] Run seed.ts via /seed page
8. [ ] E2E test: Search → Book → Pay → Dashboard → QR
9. [ ] attempt_completion

**Next Action**: Step 6 - Test realtime booking (visit /seed to run seed data first)




