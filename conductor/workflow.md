# Workflow Preferences - site-monitor

## TDD Policy
- **Strictness**: Moderate
- **Guideline**: Tests are encouraged for critical logic (like scanning algorithms and API responders), but not mandatory for simple UI components.

## Commit Strategy
- **Format**: Descriptive messages
- **Guideline**: Commit messages should clearly describe *what* changed and *why*, without strictly following the Conventional Commits format unless automated changelogs are needed later.

## Code Review Requirements
- **Policy**: Required for non-trivial changes
- **Guideline**: All major logic changes, architecture updates, or new features must undergo a systematic review. Routine UI tweaks or minor bug fixes can be committed directly.

## Verification Checkpoints
- **Fequency**: Only at track completion
- **Guideline**: Results are verified once an entire feature or track is complete. This allows for faster development cycles while ensuring final quality.
