# LegalAI Frontend Completion Notes

## Included
- Working Citizen and Lawyer workspace routing with frontend session guard.
- Global Light / Dark / System theme with localStorage persistence.
- Citizen and Lawyer notification preferences with persistence.
- Profile, appearance, security, and lawyer verification settings.
- Logout and logout-all-devices frontend controls.
- Mobile workspace navigation.
- Lawyer Clients dashboard.
- Lawyer Legal Research workspace.
- Lawyer Case Intelligence workspace.
- Lawyer notifications center.
- Lawyer signup identity/enrollment collection flow.
- Verification status gate before professional workspace access.
- Frontend demo admin-verification action for SIH presentation.
- Supreme Court background image atmosphere across workspace pages.
- Landing-page hero video contained strictly inside the hero section.
- Hero video asset: `public/img-video-Resources/legalai-hero.mp4`.

## Frontend-only verification boundary
The UI collects government-ID and Bar Council enrollment information and demonstrates a pending/verified workflow. It does **not** claim to verify a real lawyer in the real world. Production verification requires an authorized Bar Council/KYC source or a trusted compliance service/backend.

## Backend integration points
The screens are intentionally ready for future API integration. Replace demo data and localStorage session state with authenticated API calls when the backend is available.

## Run
```bash
npm install
npm run dev
```
