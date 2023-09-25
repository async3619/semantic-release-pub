import { codeBlock } from 'common-tags';
import { readFileSync, writeFileSync } from 'fs';
import { NextRelease, PrepareContext } from 'semantic-release';
import { Signale } from 'signale';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { PluginConfig, prepare } from '../src/index.js';

vi.mock('fs');

describe('prepare', () => {
  const newVersion = '1.2.3';
  const pubspecPath = 'pubspec.yaml';
  const cli = 'dart';

  const config: PluginConfig = { cli, publishPub: true };

  const oldPubspec = codeBlock`
    name: pub_package
    version: 1.2.0

    environment:
      sdk: ">=3.0.0 <4.0.0"

    dependencies:
      packageA: 1.0.0
      packageB:
        hosted: https://some-package-server.com
        version: 1.2.0
  `;

  const newPubspec = codeBlock`
    name: pub_package
    version: ${newVersion}

    environment:
      sdk: ">=3.0.0 <4.0.0"

    dependencies:
      packageA: 1.0.0
      packageB:
        hosted: https://some-package-server.com
        version: 1.2.0
  `;

  const nextRelease = mock<NextRelease>();
  const logger = mock<Signale>();
  const context = mock<PrepareContext>();

  beforeEach(() => {
    nextRelease.version = newVersion;
    context.logger = logger;
    context.nextRelease = nextRelease;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('success', async () => {
    vi.mocked(readFileSync).mockReturnValue(oldPubspec);

    await prepare(config, context);

    expect(readFileSync).toHaveBeenNthCalledWith(1, pubspecPath, 'utf-8');
    expect(writeFileSync).toHaveBeenNthCalledWith(1, pubspecPath, newPubspec);
  });
});
