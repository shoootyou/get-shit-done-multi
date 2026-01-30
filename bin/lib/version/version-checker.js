import semver from 'semver';

export function compareVersions(installedVersion, currentVersion) {
  // Coerce versions to handle "v1.2.3" format and other variations
  const installed = semver.coerce(installedVersion);
  const current = semver.coerce(currentVersion);
  
  // Handle invalid versions
  if (!installed || !current) {
    return {
      status: 'unknown',
      reason: 'invalid_version',
      installed: installedVersion,
      current: currentVersion
    };
  }
  
  // Check for downgrade (block completely per context 2.3)
  if (semver.lt(current, installed)) {
    return {
      status: 'downgrade',
      installed: installed.version,
      current: current.version,
      message: 'Cannot downgrade. Use latest version.',
      blocking: true
    };
  }
  
  // Check for major version bump (warn user per context 2.4)
  const installedMajor = semver.major(installed);
  const currentMajor = semver.major(current);
  if (currentMajor > installedMajor) {
    return {
      status: 'major_update',
      installed: installed.version,
      current: current.version,
      majorJump: `${installedMajor}.x → ${currentMajor}.x`,
      message: 'Major version update - breaking changes possible',
      updateType: 'major'
    };
  }
  
  // Check for update available
  if (semver.gt(current, installed)) {
    const diff = semver.diff(current, installed); // 'minor' | 'patch'
    return {
      status: 'update_available',
      installed: installed.version,
      current: current.version,
      updateType: diff,
      message: `Update available: v${installed.version} → v${current.version}`
    };
  }
  
  // Already up to date
  return {
    status: 'up_to_date',
    installed: installed.version,
    current: current.version
  };
}

export function formatPlatformOption(platform, versionStatus) {
  const baseName = getPlatformDisplayName(platform);
  
  if (!versionStatus || versionStatus.status === 'not_installed') {
    return baseName;
  }
  
  if (versionStatus.status === 'up_to_date') {
    return `${baseName} (v${versionStatus.installed})`;
  }
  
  if (versionStatus.status === 'update_available') {
    return `${baseName} (v${versionStatus.installed} → v${versionStatus.current})`;
  }
  
  if (versionStatus.status === 'major_update') {
    return `${baseName} (v${versionStatus.installed} → v${versionStatus.current} ⚠️  major)`;
  }
  
  return baseName;
}

function getPlatformDisplayName(platform) {
  const names = {
    'claude': 'Claude Code',
    'copilot': 'GitHub Copilot',
    'codex': 'Codex'
  };
  return names[platform] || platform;
}
