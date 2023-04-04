# Changelog

## 3.1.1

- Bugfix around use of query options (max data points &amp; interval)

## 3.1.0

- Bumped Golang version to 1.20
  - Bumped dependent packages (namely grafana-plugin-sdk-go) to latest
- Bumped Node version to latest LTS version
  - Replaced the grafana/toolkit package with the grafana/{create,sign}-plugin packages
  - Bumped dependent package versions to latest
- Bugfix around repeated panels with multiple-selected variables

## 3.0.9

- #110: Do not set autoAlign (formerly the default) for plots to allow specification via query options

## 3.0.{6-8}

- DataSet api usage improvements
- Use the Grafana server context to cancel queries if signaled

## 3.0.5

- Update yarn dependency @grafana/toolkit to 8.5.0
- Set a custom user-agent to support tracking
- Added user-specified label support (Issue #105)

## 3.0.4

- Minor README.md fixes
- Minor default server url fix
- Support breakdown graphs with empty standard queries
- Removed an unnecessary hardcoded field in top-facet requests
- Minor change to support Grafana 8.2.x
- Support for future LRQ api change

## 3.0.3

Minor client fix and set Grafana dependency to &gt;=8.3.0.

## 3.0.2

Minor changes based on Grafana support feedback.

## 3.0.1

Minor cleanups/changes.

## 3.0.0 (Unreleased)

Initial release.
