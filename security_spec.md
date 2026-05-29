# Security Specification for Personal Finance App

## 1. Data Invariants
- Each user profile containing sensitive configurations represents their master identifier.
- High-risk operations (reading and writing user profiles, transactions, financial budgets, alerts, and connected bank accounts) are strictly relative to authenticated owners matching their Firestore `userId`.
- Relational integrity: Any budget or transaction linked to a user must enforce the `userId` in path and document attributes.
- Input checking: Transaction amounts must be non-negative real numbers. Account balances must be numeric values.
- Immutability: Standard tracking fields (`createdAt` and `userId`) must remain unchanged after insertion.

## 2. The "Dirty Dozen" Payloads (TDD Test-Cases)
1. **Malicious Transaction Spoofing**: An authenticated user `attacker1` tries to write a transaction into user `victim2`'s profile path with `userId: 'attacker1'`. Returns `PERMISSION_DENIED`.
2. **Identity Hijacking**: An authenticated user `attacker1` tries to write a user profile at path `users/victim2` with `userId: 'attacker1'`. Returns `PERMISSION_DENIED`.
3. **Privilege Escalation (Role Injection)**: A user tries to inject high-privilege parameters (like an administrative flag) into their user profile. Returns `PERMISSION_DENIED` or is blocked by strict map properties check.
4. **Denial-of-Wallet Path Size Abuse**: Sending an ID parameter of 1.5MB to cause document ID exhaustion. Returns `PERMISSION_DENIED`.
5. **Malicious Null Timestamp Invariant**: A user tries to create a transaction where `createdAt` is a pre-dated string instead of `request.time`. Returns `PERMISSION_DENIED`.
6. **Malicious Empty Budget Limit**: A user tries to write a Category Budget document with an omitted `limitAmount` or empty category. Returns `PERMISSION_DENIED`.
7. **Cross-Tenant Budget Manipulation**: `attacker1` attempts to list budget items belonging to `victim2`. Returns `PERMISSION_DENIED`.
8. **Negative Spend Violation**: A user attempts to save a transaction with a negative numeric value to inject infinite bank balance. Returns `PERMISSION_DENIED`.
9. **Malicious Alert Sabotage**: Omit state checking on Savings Alert to sabotage another user's warnings. Returns `PERMISSION_DENIED`.
10. **Spoofed Email Access**: A user attempts to register their authenticated profile with an email address matching an admin but with `email_verified` parameter set as false. Returns `PERMISSION_DENIED`.
11. **Orphaned Sibling Bank Writing**: Attempting to write a synchronizing transaction linking to a bank account that does not belong to the user. Returns `PERMISSION_DENIED`.
12. **Insecure Global Read Scrapes**: Requesting `getDocs(collection(db, 'users'))` from client space. Returns `PERMISSION_DENIED`.
