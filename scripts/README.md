# Version Management

This project uses an automated version increment system with Husky pre-commit hooks.

## Version Format

The `APP_VERSION` follows the format: **YYMMDDBN**

- **YY**: Year (2 digits)
- **MM**: Month (2 digits)
- **DD**: Day (2 digits)
- **BN**: Build Number (2 digits)

Example: `25101403` means:

- Year: 2025
- Month: October (10)
- Day: 14
- Build: 03 (third build of the day)

## How It Works

1. **Automatic Increment**: Every time you make a commit, the pre-commit hook automatically:
   - Increments the build number if it's the same day
   - Resets to build `01` if it's a new day
   - Adds the updated `src/version.ts` file to your commit

2. **Manual Increment**: You can also manually increment the version by running:
   ```bash
   npm run version:increment
   ```

## Scripts

- `increment-version.cjs`: Node.js script that handles the version logic

## Husky Hook

The `.husky/pre-commit` hook runs before each commit to:

1. Increment the version
2. Stage the updated version file
3. Run lint-staged for code formatting
