# Security Specification for Aura Music

## Data Invariants
1. **User Identity**: A user profile must have a valid `uid` matching the authentication token.
2. **Playlist Ownership**: A playlist document must have an `ownerId` that matches the creator's `uid`.
3. **Track Relation**: A track cannot be added to a playlist unless the user owns that playlist.
4. **Immutability**: `createdAt` and `ownerId` should not change after creation.
5. **System Consistency**: `updatedAt` on a playlist must be updated when tracks are changed (atomicity via batch/existsAfter where possible, but here we can just enforce rules).

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to create a playlist with `ownerId` set to a different user's UID.
2. **Hidden Field Injection**: Attempt to add `isAdmin: true` to a user profile.
3. **Unauthorized Read**: Attempt to read a private playlist belonging to another user.
4. **Unauthorized Write**: Attempt to add a track to someone else's playlist.
5. **Malicious ID**: Attempt to use `../../../hack` as a playlist ID.
6. **Data Type Mismatch**: Send a `duration` as a string instead of a number.
7. **Size Limit Violation**: Send a `name` that is 1MB long.
8. **State Shortcut**: Attempt to change `ownerId` of an existing playlist.
9. **Email Spoofing**: Attempt to create a profile for an email without `email_verified: true`.
10. **Query Scraping**: Attempt to list all playlists in the system without an owner filter.
11. **Orphaned Writes**: Attempt to add a track to a non-existent playlist ID.
12. **PII Leak**: Attempt to read another user's private email from their profile.

## Test Strategy
I will verify these scenarios using `DRAFT_firestore.rules` and manual analysis before final deployment.
