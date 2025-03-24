# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Telnyx Integration**: Added script for setting up FQDN connection with Telnyx:
  - Created `setup-telnyx-fqdn.js` for automated FQDN connection setup
  - Added Windows batch file `setup-telnyx.bat` for easy execution
  - Configured with predefined SIP authentication credentials (username: automeshan)
  - Added proper error handling and troubleshooting guidance
  - Added npm script command `setup-telnyx` for convenient execution
  - Reason: To facilitate telephony integration with LiveKit using Telnyx

### Fixed

- **Documentation**: Fixed Markdown linting issues in `instructions/telnyx.md`:
  - Added proper top-level heading
  - Fixed bare URLs by using proper Markdown formatting
  - Added SIP credentials section for reference
  - Ensured file ends with a single newline
