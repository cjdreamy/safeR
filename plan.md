# Plan: Geolocation Update to Kenya

Update the SafeRoute MVP to focus geographically on Kenya. This involves re-centering the map and localizing mock data (hazards and shelters) to Kenyan coordinates.

## Scope
- **Map Center**: Update `SafeMap.tsx` to center on Kenya (approx. `[0.0236, 37.9062]`).
- **Mock Data**: Relocate all hazards and shelters in `mockData.ts` to realistic coordinates within Kenya (Nairobi, Mombasa, etc.).
- **UI Localization**: Update hardcoded text references (e.g., "Upper Manhattan") to Kenyan equivalents.

## Affected Areas
- `src/components/map/SafeMap.tsx`: Initial map state and centering logic.
- `src/data/mockData.ts`: Coordinates for hazards and shelters.
- `src/App.tsx`: Initial state for new reports and hardcoded UI text.

## Phases

### Phase 1: Data Localization (quick_fix_engineer)
- Update `MOCK_HAZARDS` and `MOCK_SHELTERS` in `src/data/mockData.ts`.
- Use coordinates like:
    - Nairobi: `[-1.2921, 36.8219]`
    - Mombasa: `[-4.0435, 39.6682]`
    - Kisumu: `[-0.0917, 34.7680]`
- Adjust `radius` values if necessary for the new scale.

### Phase 2: Map Configuration (frontend_engineer)
- Modify `src/components/map/SafeMap.tsx` to set the initial `center` and `zoom` level suitable for Kenya.
- Ensure the Mapbox/Leaflet instance respects these new defaults.

### Phase 3: UI & State Localization (quick_fix_engineer)
- Update `src/App.tsx`:
    - Change default `newReport` location to a Kenyan coordinate.
    - Update the "Critical Warning" text from "Upper Manhattan" to a Kenyan region (e.g., "Nairobi" or "Tana River").
    - Review any other hardcoded regional text.

## Deliverables
- Map centers on Kenya by default.
- Hazards and shelters are correctly pinned within Kenya boundaries.
- No "New York" or other non-Kenyan regional references remain in the MVP.
