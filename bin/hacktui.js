#!/usr/bin/env bun

const sourceEntry = new URL("../src/layout.tsx", import.meta.url)

if (await Bun.file(sourceEntry).exists()) {
	await import(sourceEntry.href)
} else {
	await import("../dist/layout.js")
}
