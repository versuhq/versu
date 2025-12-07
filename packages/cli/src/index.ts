#!/usr/bin/env node

import { run } from '@oclif/core';

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
