"""Executable module entrypoint for forge."""

from __future__ import annotations

import sys

from forge.cli import main

if __name__ == "__main__":
    sys.exit(main())
